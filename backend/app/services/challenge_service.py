from sqlalchemy.orm import Session
from sqlalchemy import func, and_, desc, or_
from datetime import datetime
from typing import List, Optional

from app.models.challenge import Challenge, ChallengeParticipant
from app.schemas.challenge import ChallengeCreate, ChallengeUpdate, LeaderboardEntry


class ChallengeService:
    def __init__(self, db: Session):
        self.db = db

    def create_challenge(self, user_id: str, user_name: str, challenge_data: ChallengeCreate) -> Challenge:
        """Create a new challenge"""
        challenge = Challenge(
            creator_id=user_id,
            creator_name=user_name,
            title=challenge_data.title,
            description=challenge_data.description,
            challenge_type=challenge_data.challenge_type,
            difficulty=challenge_data.difficulty,
            points=challenge_data.points,
            start_date=challenge_data.start_date,
            end_date=challenge_data.end_date,
            max_participants=challenge_data.max_participants,
        )
        
        self.db.add(challenge)
        self.db.commit()
        self.db.refresh(challenge)
        return challenge

    def get_challenge_by_id(self, challenge_id: str) -> Optional[Challenge]:
        """Get a challenge by ID"""
        return self.db.query(Challenge).filter(Challenge.id == challenge_id).first()

    def get_challenges(
        self,
        challenge_type: Optional[str] = None,
        difficulty: Optional[str] = None,
        is_active: Optional[bool] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> List[Challenge]:
        """Get challenges with optional filtering"""
        query = self.db.query(Challenge)

        if challenge_type:
            query = query.filter(Challenge.challenge_type == challenge_type)
        
        if difficulty:
            query = query.filter(Challenge.difficulty == difficulty)
        
        if is_active is not None:
            now = datetime.utcnow()
            if is_active:
                query = query.filter(
                    and_(
                        Challenge.start_date <= now,
                        Challenge.end_date >= now,
                    )
                )
            else:
                query = query.filter(
                    or_(
                        Challenge.start_date > now,
                        Challenge.end_date < now,
                    )
                )

        return query.order_by(desc(Challenge.created_at)).offset(skip).limit(limit).all()

    def get_active_challenges(self, skip: int = 0, limit: int = 50) -> List[Challenge]:
        """Get only active challenges"""
        return self.get_challenges(is_active=True, skip=skip, limit=limit)

    def get_user_challenges(self, user_id: str, skip: int = 0, limit: int = 20) -> List[Challenge]:
        """Get challenges created by a specific user"""
        return (
            self.db.query(Challenge)
            .filter(Challenge.creator_id == user_id)
            .order_by(desc(Challenge.created_at))
            .offset(skip)
            .limit(limit)
            .all()
        )

    def update_challenge(self, challenge_id: str, user_id: str, update_data: ChallengeUpdate) -> Optional[Challenge]:
        """Update a challenge (only by the creator)"""
        challenge = self.db.query(Challenge).filter(
            Challenge.id == challenge_id,
            Challenge.creator_id == user_id
        ).first()

        if not challenge:
            return None

        update_dict = update_data.dict(exclude_unset=True)
        for field, value in update_dict.items():
            setattr(challenge, field, value)

        self.db.commit()
        self.db.refresh(challenge)
        return challenge

    def delete_challenge(self, challenge_id: str, user_id: str) -> bool:
        """Delete a challenge (only by the creator)"""
        challenge = self.db.query(Challenge).filter(
            Challenge.id == challenge_id,
            Challenge.creator_id == user_id
        ).first()

        if not challenge:
            return False

        self.db.delete(challenge)
        self.db.commit()
        return True

    def join_challenge(self, challenge_id: str, user_id: str, user_name: str) -> Optional[ChallengeParticipant]:
        """Join a challenge"""
        # Check if challenge exists and is active
        challenge = self.get_challenge_by_id(challenge_id)
        if not challenge:
            return None

        now = datetime.utcnow()
        if challenge.start_date > now or challenge.end_date < now:
            return None  # Challenge is not active

        # Check max participants
        if challenge.max_participants:
            participant_count = self.db.query(ChallengeParticipant).filter(
                ChallengeParticipant.challenge_id == challenge_id
            ).count()
            if participant_count >= challenge.max_participants:
                return None  # Challenge is full

        # Check if already joined
        existing = self.db.query(ChallengeParticipant).filter(
            ChallengeParticipant.challenge_id == challenge_id,
            ChallengeParticipant.user_id == user_id
        ).first()
        if existing:
            return existing  # Already joined

        # Create participant
        participant = ChallengeParticipant(
            challenge_id=challenge_id,
            user_id=user_id,
            user_name=user_name,
        )
        
        self.db.add(participant)
        self.db.commit()
        self.db.refresh(participant)
        return participant

    def leave_challenge(self, challenge_id: str, user_id: str) -> bool:
        """Leave a challenge"""
        participant = self.db.query(ChallengeParticipant).filter(
            ChallengeParticipant.challenge_id == challenge_id,
            ChallengeParticipant.user_id == user_id
        ).first()

        if not participant:
            return False

        self.db.delete(participant)
        self.db.commit()
        return True

    def complete_challenge(self, challenge_id: str, user_id: str, password: str) -> Optional[ChallengeParticipant]:
        """Mark a challenge as completed with password verification"""
        # Verify password first
        challenge = self.get_challenge_by_id(challenge_id)
        if not challenge or challenge.completion_password != password:
            return None
        
        participant = self.db.query(ChallengeParticipant).filter(
            ChallengeParticipant.challenge_id == challenge_id,
            ChallengeParticipant.user_id == user_id
        ).first()

        if not participant:
            return None

        participant.completed = True
        participant.completed_at = datetime.utcnow()
        participant.progress = 100

        self.db.commit()
        self.db.refresh(participant)
        return participant

    def update_progress(self, challenge_id: str, user_id: str, progress: int) -> Optional[ChallengeParticipant]:
        """Update challenge progress"""
        participant = self.db.query(ChallengeParticipant).filter(
            ChallengeParticipant.challenge_id == challenge_id,
            ChallengeParticipant.user_id == user_id
        ).first()

        if not participant:
            return None

        participant.progress = max(0, min(100, progress))  # Clamp between 0-100

        self.db.commit()
        self.db.refresh(participant)
        return participant

    def get_participants(self, challenge_id: str) -> List[ChallengeParticipant]:
        """Get all participants of a challenge"""
        return (
            self.db.query(ChallengeParticipant)
            .filter(ChallengeParticipant.challenge_id == challenge_id)
            .order_by(desc(ChallengeParticipant.progress), ChallengeParticipant.joined_at)
            .all()
        )

    def get_user_participations(self, user_id: str) -> List[ChallengeParticipant]:
        """Get all challenges a user is participating in"""
        return (
            self.db.query(ChallengeParticipant)
            .filter(ChallengeParticipant.user_id == user_id)
            .order_by(desc(ChallengeParticipant.joined_at))
            .all()
        )

    def is_participant(self, challenge_id: str, user_id: str) -> bool:
        """Check if user is a participant"""
        participant = self.db.query(ChallengeParticipant).filter(
            ChallengeParticipant.challenge_id == challenge_id,
            ChallengeParticipant.user_id == user_id
        ).first()
        return participant is not None

    def get_leaderboard(self, limit: int = 10) -> List[LeaderboardEntry]:
        """Get top users by points earned from completed challenges"""
        results = (
            self.db.query(
                ChallengeParticipant.user_id,
                ChallengeParticipant.user_name,
                func.sum(Challenge.points).label('total_points'),
                func.count(ChallengeParticipant.id).label('completed_count'),
            )
            .join(Challenge, ChallengeParticipant.challenge_id == Challenge.id)
            .filter(ChallengeParticipant.completed == True)
            .group_by(ChallengeParticipant.user_id, ChallengeParticipant.user_name)
            .order_by(desc('total_points'))
            .limit(limit)
            .all()
        )

        return [
            LeaderboardEntry(
                user_id=result.user_id,
                user_name=result.user_name,
                total_points=result.total_points or 0,
                challenges_completed=result.completed_count or 0,
            )
            for result in results
        ]
