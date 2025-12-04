from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc
from typing import List, Optional
from uuid import UUID
from datetime import datetime

from app.models.team import Team, TeamMember, JoinRequest
from app.models.user import User
from app.schemas.team import (
    TeamCreate,
    TeamUpdate,
    TeamResponse,
    TeamMemberResponse,
    JoinRequestResponse
)


class TeamService:
    """Service for managing teams"""

    @staticmethod
    def create_team(
        db: Session,
        team_data: TeamCreate,
        created_by: UUID
    ) -> Team:
        """Create a new team with leader as first member"""
        new_team = Team(
            name=team_data.name,
            description=team_data.description,
            created_by=created_by,
            is_active=True
        )
        db.add(new_team)
        db.flush()

        # Add leader as first member
        leader_member = TeamMember(
            team_id=new_team.id,
            user_id=created_by,
            role="leader"
        )
        db.add(leader_member)

        db.commit()
        db.refresh(new_team)
        return new_team

    @staticmethod
    def get_teams(
        db: Session,
        category: Optional[str] = None,
        status: Optional[str] = None,
        search: Optional[str] = None,
        skip: int = 0,
        limit: int = 50
    ) -> List[TeamResponse]:
        """Get teams with optional filters"""
        # Build base query with member count
        query = (
            db.query(
                Team,
                User,
                func.count(TeamMember.user_id).label('member_count')
            )
            .join(User, Team.created_by == User.id)
            .outerjoin(TeamMember, Team.id == TeamMember.team_id)
            .filter(Team.is_active == True)
            .group_by(Team.id, User.id)
        )

        # Apply filters
        if category:
            query = query.filter(Team.category == category)
        if status:
            query = query.filter(Team.status == status)
        if search:
            query = query.filter(
                or_(
                    Team.name.ilike(f"%{search}%"),
                    Team.description.ilike(f"%{search}%")
                )
            )

        # Order and paginate
        query = query.order_by(desc(Team.created_at)).offset(skip).limit(limit)

        teams_data = query.all()

        responses = []
        for team, leader, member_count in teams_data:
            responses.append(
                TeamResponse(
                    id=team.id,
                    name=team.name,
                    description=team.description,
                    category=None,  # Field doesn't exist in Team model
                    status="active" if team.is_active else "inactive",
                    max_members=None,  # Field doesn't exist in Team model
                    current_members=member_count,
                    is_public=True,  # Field doesn't exist in Team model, default to True
                    tags=[],  # Field doesn't exist in Team model
                    created_by=team.created_by,
                    leader_name=leader.full_name,
                    created_at=team.created_at,
                    updated_at=team.updated_at
                )
            )

        return responses

    @staticmethod
    def get_team_by_id(
        db: Session,
        team_id: UUID,
        include_members: bool = False
    ) -> Optional[TeamResponse]:
        """Get a specific team by ID with optional member list"""
        data = (
            db.query(
                Team,
                User,
                func.count(TeamMember.user_id).label('member_count')
            )
            .join(User, Team.created_by == User.id)
            .outerjoin(TeamMember, Team.id == TeamMember.team_id)
            .filter(Team.id == team_id)
            .group_by(Team.id, User.id)
            .first()
        )

        if not data:
            return None

        team, leader, member_count = data

        # Get members if requested
        members_list = None
        if include_members:
            members_data = (
                db.query(TeamMember, User)
                .join(User, TeamMember.user_id == User.id)
                .filter(TeamMember.team_id == team_id)
                .order_by(TeamMember.joined_at)
                .all()
            )

            members_list = [
                TeamMemberResponse(
                    user_id=member.user_id,
                    full_name=user.full_name,
                    email=user.email,
                    role=member.role,
                    joined_at=member.joined_at
                )
                for member, user in members_data
            ]

        return TeamResponse(
            id=team.id,
            name=team.name,
            description=team.description,
            category=team.category,
            status=team.status,
            max_members=team.max_members,
            current_members=member_count,
            is_public=team.is_public,
            tags=team.tags,
            created_by=team.created_by,
            leader_name=leader.full_name,
            created_at=team.created_at,
            updated_at=team.updated_at,
            members=members_list
        )

    @staticmethod
    def get_user_teams(
        db: Session,
        user_id: UUID
    ) -> List[TeamResponse]:
        """Get all teams a user is part of"""
        teams_data = (
            db.query(
                Team,
                User,
                func.count(TeamMember.user_id).label('member_count')
            )
            .join(User, Team.created_by == User.id)
            .join(TeamMember, Team.id == TeamMember.team_id)
            .filter(TeamMember.user_id == user_id)
            .group_by(Team.id, User.id)
            .order_by(desc(Team.created_at))
            .all()
        )

        responses = []
        for team, leader, member_count in teams_data:
            responses.append(
                TeamResponse(
                    id=team.id,
                    name=team.name,
                    description=team.description,
                    category=team.category,
                    status=team.status,
                    max_members=team.max_members,
                    current_members=member_count,
                    is_public=team.is_public,
                    tags=team.tags,
                    created_by=team.created_by,
                    leader_name=leader.full_name,
                    created_at=team.created_at,
                    updated_at=team.updated_at
                )
            )

        return responses

    @staticmethod
    def update_team(
        db: Session,
        team_id: UUID,
        update_data: TeamUpdate,
        user_id: UUID
    ) -> Optional[Team]:
        """Update team (leader only)"""
        team = db.query(Team).filter(Team.id == team_id).first()

        if not team or team.created_by != user_id:
            return None

        # Update fields
        if update_data.name is not None:
            team.name = update_data.name
        if update_data.description is not None:
            team.description = update_data.description
        if update_data.category is not None:
            team.category = update_data.category
        if update_data.max_members is not None:
            team.max_members = update_data.max_members
        if update_data.is_public is not None:
            team.is_public = update_data.is_public
        if update_data.status is not None:
            team.status = update_data.status
        if update_data.tags is not None:
            team.tags = update_data.tags

        db.commit()
        db.refresh(team)
        return team

    @staticmethod
    def delete_team(
        db: Session,
        team_id: UUID,
        user_id: UUID
    ) -> bool:
        """Delete team (leader only)"""
        team = db.query(Team).filter(Team.id == team_id).first()

        if not team or team.created_by != user_id:
            return False

        # Delete all members first
        db.query(TeamMember).filter(TeamMember.team_id == team_id).delete()

        # Delete all join requests
        db.query(JoinRequest).filter(JoinRequest.team_id == team_id).delete()

        # Delete team
        db.delete(team)
        db.commit()
        return True

    @staticmethod
    def request_to_join(
        db: Session,
        team_id: UUID,
        user_id: UUID,
        message: Optional[str] = None
    ) -> JoinRequest:
        """Create a join request for a team"""
        # Check if team is full
        data = (
            db.query(Team, func.count(TeamMember.user_id).label('member_count'))
            .outerjoin(TeamMember, Team.id == TeamMember.team_id)
            .filter(Team.id == team_id)
            .group_by(Team.id)
            .first()
        )

        if not data:
            raise ValueError("Team not found")

        team, member_count = data
        if member_count >= team.max_members:
            raise ValueError("Team is full")

        # Check if already a member
        existing_member = db.query(TeamMember).filter(
            and_(
                TeamMember.team_id == team_id,
                TeamMember.user_id == user_id
            )
        ).first()
        if existing_member:
            raise ValueError("Already a member")

        # Check if already requested
        existing_request = db.query(JoinRequest).filter(
            and_(
                JoinRequest.team_id == team_id,
                JoinRequest.user_id == user_id,
                JoinRequest.status == "pending"
            )
        ).first()
        if existing_request:
            raise ValueError("Join request already pending")

        # Create request
        join_request = JoinRequest(
            team_id=team_id,
            user_id=user_id,
            message=message,
            status="pending"
        )
        db.add(join_request)
        db.commit()
        db.refresh(join_request)
        return join_request

    @staticmethod
    def handle_join_request(
        db: Session,
        request_id: UUID,
        created_by: UUID,
        approve: bool
    ) -> bool:
        """Approve or reject a join request (leader only)"""
        # Get request with team
        data = (
            db.query(JoinRequest, Team)
            .join(Team, JoinRequest.team_id == Team.id)
            .filter(JoinRequest.id == request_id)
            .first()
        )

        if not data:
            return False

        join_request, team = data

        if team.created_by != created_by:
            return False

        if approve:
            # Add user to team
            new_member = TeamMember(
                team_id=join_request.team_id,
                user_id=join_request.user_id,
                role="member"
            )
            db.add(new_member)
            join_request.status = "approved"
        else:
            join_request.status = "rejected"

        db.commit()
        return True

    @staticmethod
    def leave_team(
        db: Session,
        team_id: UUID,
        user_id: UUID
    ) -> bool:
        """Leave a team (members only, not leader)"""
        # Check if user is the leader
        team = db.query(Team).filter(Team.id == team_id).first()

        if not team or team.created_by == user_id:
            return False  # Leaders cannot leave, must transfer leadership or delete team

        # Remove member
        rowcount = db.query(TeamMember).filter(
            and_(
                TeamMember.team_id == team_id,
                TeamMember.user_id == user_id
            )
        ).delete()

        db.commit()
        return rowcount > 0

    @staticmethod
    def get_pending_requests(
        db: Session,
        team_id: UUID,
        created_by: UUID
    ) -> List[JoinRequestResponse]:
        """Get pending join requests for a team (leader only)"""
        # Verify leader
        team = db.query(Team).filter(Team.id == team_id).first()

        if not team or team.created_by != created_by:
            return []

        # Get pending requests
        requests_data = (
            db.query(JoinRequest, Team, User)
            .join(Team, JoinRequest.team_id == Team.id)
            .join(User, JoinRequest.user_id == User.id)
            .filter(
                and_(
                    JoinRequest.team_id == team_id,
                    JoinRequest.status == "pending"
                )
            )
            .order_by(JoinRequest.created_at)
            .all()
        )

        return [
            JoinRequestResponse(
                id=request.id,
                team_id=request.team_id,
                team_name=team.name,
                user_id=request.user_id,
                user_name=user.full_name,
                status=request.status,
                message=request.message,
                created_at=request.created_at,
                updated_at=request.updated_at
            )
            for request, team, user in requests_data
        ]
