from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func, desc
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
    async def create_team(
        db: AsyncSession,
        team_data: TeamCreate,
        created_by: UUID
    ) -> Team:
        """Create a new team with leader as first member"""
        new_team = Team(
            name=team_data.name,
            description=team_data.description,
            category=team_data.category,
            max_members=team_data.max_members,
            is_public=team_data.is_public,
            tags=team_data.tags,
            created_by=created_by,
            status="active"
        )
        db.add(new_team)
        await db.flush()

        # Add leader as first member
        leader_member = TeamMember(
            team_id=new_team.id,
            user_id=created_by,
            role="leader"
        )
        db.add(leader_member)

        await db.commit()
        await db.refresh(new_team)
        return new_team

    @staticmethod
    async def get_teams(
        db: AsyncSession,
        category: Optional[str] = None,
        status: Optional[str] = None,
        search: Optional[str] = None,
        skip: int = 0,
        limit: int = 50
    ) -> List[TeamResponse]:
        """Get teams with optional filters"""
        # Build base query with member count
        query = (
            select(
                Team,
                User,
                func.count(TeamMember.user_id).label('member_count')
            )
            .join(User, Team.created_by == User.id)
            .outerjoin(TeamMember, Team.id == TeamMember.team_id)
            .where(Team.is_public == True)
            .group_by(Team.id, User.id)
        )

        # Apply filters
        if category:
            query = query.where(Team.category == category)
        if status:
            query = query.where(Team.status == status)
        if search:
            query = query.where(
                or_(
                    Team.name.ilike(f"%{search}%"),
                    Team.description.ilike(f"%{search}%")
                )
            )

        # Order and paginate
        query = query.order_by(desc(Team.created_at)).offset(skip).limit(limit)

        result = await db.execute(query)
        teams_data = result.all()

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
    async def get_team_by_id(
        db: AsyncSession,
        team_id: UUID,
        include_members: bool = False
    ) -> Optional[TeamResponse]:
        """Get a specific team by ID with optional member list"""
        query = (
            select(
                Team,
                User,
                func.count(TeamMember.user_id).label('member_count')
            )
            .join(User, Team.created_by == User.id)
            .outerjoin(TeamMember, Team.id == TeamMember.team_id)
            .where(Team.id == team_id)
            .group_by(Team.id, User.id)
        )

        result = await db.execute(query)
        data = result.one_or_none()

        if not data:
            return None

        team, leader, member_count = data

        # Get members if requested
        members_list = None
        if include_members:
            members_query = (
                select(TeamMember, User)
                .join(User, TeamMember.user_id == User.id)
                .where(TeamMember.team_id == team_id)
                .order_by(TeamMember.joined_at)
            )
            members_result = await db.execute(members_query)
            members_data = members_result.all()

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
    async def get_user_teams(
        db: AsyncSession,
        user_id: UUID
    ) -> List[TeamResponse]:
        """Get all teams a user is part of"""
        query = (
            select(
                Team,
                User,
                func.count(TeamMember.user_id).label('member_count')
            )
            .join(User, Team.created_by == User.id)
            .join(TeamMember, Team.id == TeamMember.team_id)
            .where(TeamMember.user_id == user_id)
            .group_by(Team.id, User.id)
            .order_by(desc(Team.created_at))
        )

        result = await db.execute(query)
        teams_data = result.all()

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
    async def update_team(
        db: AsyncSession,
        team_id: UUID,
        update_data: TeamUpdate,
        user_id: UUID
    ) -> Optional[Team]:
        """Update team (leader only)"""
        result = await db.execute(
            select(Team).where(Team.id == team_id)
        )
        team = result.scalar_one_or_none()

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

        await db.commit()
        await db.refresh(team)
        return team

    @staticmethod
    async def delete_team(
        db: AsyncSession,
        team_id: UUID,
        user_id: UUID
    ) -> bool:
        """Delete team (leader only)"""
        result = await db.execute(
            select(Team).where(Team.id == team_id)
        )
        team = result.scalar_one_or_none()

        if not team or team.created_by != user_id:
            return False

        # Delete all members first
        await db.execute(
            TeamMember.__table__.delete().where(TeamMember.team_id == team_id)
        )

        # Delete all join requests
        await db.execute(
            JoinRequest.__table__.delete().where(JoinRequest.team_id == team_id)
        )

        # Delete team
        await db.delete(team)
        await db.commit()
        return True

    @staticmethod
    async def request_to_join(
        db: AsyncSession,
        team_id: UUID,
        user_id: UUID,
        message: Optional[str] = None
    ) -> JoinRequest:
        """Create a join request for a team"""
        # Check if team is full
        team_query = (
            select(Team, func.count(TeamMember.user_id).label('member_count'))
            .outerjoin(TeamMember, Team.id == TeamMember.team_id)
            .where(Team.id == team_id)
            .group_by(Team.id)
        )
        result = await db.execute(team_query)
        data = result.one_or_none()

        if not data:
            raise ValueError("Team not found")

        team, member_count = data
        if member_count >= team.max_members:
            raise ValueError("Team is full")

        # Check if already a member
        existing_member = await db.execute(
            select(TeamMember).where(
                and_(
                    TeamMember.team_id == team_id,
                    TeamMember.user_id == user_id
                )
            )
        )
        if existing_member.scalar_one_or_none():
            raise ValueError("Already a member")

        # Check if already requested
        existing_request = await db.execute(
            select(JoinRequest).where(
                and_(
                    JoinRequest.team_id == team_id,
                    JoinRequest.user_id == user_id,
                    JoinRequest.status == "pending"
                )
            )
        )
        if existing_request.scalar_one_or_none():
            raise ValueError("Join request already pending")

        # Create request
        join_request = JoinRequest(
            team_id=team_id,
            user_id=user_id,
            message=message,
            status="pending"
        )
        db.add(join_request)
        await db.commit()
        await db.refresh(join_request)
        return join_request

    @staticmethod
    async def handle_join_request(
        db: AsyncSession,
        request_id: UUID,
        created_by: UUID,
        approve: bool
    ) -> bool:
        """Approve or reject a join request (leader only)"""
        # Get request with team
        query = (
            select(JoinRequest, Team)
            .join(Team, JoinRequest.team_id == Team.id)
            .where(JoinRequest.id == request_id)
        )
        result = await db.execute(query)
        data = result.one_or_none()

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

        await db.commit()
        return True

    @staticmethod
    async def leave_team(
        db: AsyncSession,
        team_id: UUID,
        user_id: UUID
    ) -> bool:
        """Leave a team (members only, not leader)"""
        # Check if user is the leader
        team_result = await db.execute(
            select(Team).where(Team.id == team_id)
        )
        team = team_result.scalar_one_or_none()

        if not team or team.created_by == user_id:
            return False  # Leaders cannot leave, must transfer leadership or delete team

        # Remove member
        result = await db.execute(
            TeamMember.__table__.delete().where(
                and_(
                    TeamMember.team_id == team_id,
                    TeamMember.user_id == user_id
                )
            )
        )

        await db.commit()
        return result.rowcount > 0

    @staticmethod
    async def get_pending_requests(
        db: AsyncSession,
        team_id: UUID,
        created_by: UUID
    ) -> List[JoinRequestResponse]:
        """Get pending join requests for a team (leader only)"""
        # Verify leader
        team_result = await db.execute(
            select(Team).where(Team.id == team_id)
        )
        team = team_result.scalar_one_or_none()

        if not team or team.created_by != created_by:
            return []

        # Get pending requests
        query = (
            select(JoinRequest, Team, User)
            .join(Team, JoinRequest.team_id == Team.id)
            .join(User, JoinRequest.user_id == User.id)
            .where(
                and_(
                    JoinRequest.team_id == team_id,
                    JoinRequest.status == "pending"
                )
            )
            .order_by(JoinRequest.created_at)
        )

        result = await db.execute(query)
        requests_data = result.all()

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
