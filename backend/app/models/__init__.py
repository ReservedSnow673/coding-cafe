# Import all models here for Alembic to detect them
from app.models.user import User, UserRole
from app.models.otp import OTPRequest
from app.models.location import Location, VisibilityLevel
from app.models.chat import ChatGroup, ChatMessage
from app.models.announcement import Announcement, AnnouncementCategory
from app.models.issue import Issue, IssueComment, IssueCategory, IssueStatus
from app.models.team import Team, TeamMember
from app.models.mess_review import MessReview, MealType
from app.models.challenge import Challenge, ChallengeCompletion

__all__ = [
    "User",
    "UserRole",
    "OTPRequest",
    "Location",
    "VisibilityLevel",
    "ChatGroup",
    "ChatMessage",
    "Announcement",
    "AnnouncementCategory",
    "Issue",
    "IssueComment",
    "IssueCategory",
    "IssueStatus",
    "Team",
    "TeamMember",
    "MessReview",
    "MealType",
    "Challenge",
    "ChallengeCompletion",
]
