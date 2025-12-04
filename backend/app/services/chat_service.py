from sqlalchemy.orm import Session
from sqlalchemy import select, func, and_, desc
from typing import List, Optional
from uuid import UUID
from datetime import datetime

from app.models.chat import ChatGroup, ChatMessage, ChatMember
from app.models.user import User
from app.schemas.chat import (
    ChatGroupCreate, 
    ChatGroupUpdate, 
    ChatGroupResponse,
    ChatMessageCreate,
    ChatMessageResponse,
    ChatMemberResponse,
    ChatGroupDetailResponse
)


class ChatService:
    """Service for managing chat groups and messages"""

    @staticmethod
    def create_group(
        db: Session, 
        group_data: ChatGroupCreate, 
        creator_id: UUID
    ) -> ChatGroup:
        """Create a new chat group and add creator as first member"""
        # Create the group
        new_group = ChatGroup(
            name=group_data.name,
            description=group_data.description,
            created_by=creator_id,
            is_active=True
        )
        db.add(new_group)
        db.flush()  # Get the group ID
        
        # Add creator as admin member
        creator_member = ChatMember(
            group_id=new_group.id,
            user_id=creator_id,
            role="admin"
        )
        db.add(creator_member)
        
        # Add additional members if provided
        if group_data.member_ids:
            for user_id in group_data.member_ids:
                if user_id != creator_id:  # Don't add creator twice
                    member = ChatMember(
                        group_id=new_group.id,
                        user_id=user_id,
                        role="member"
                    )
                    db.add(member)
        
        db.commit()
        db.refresh(new_group)
        return new_group

    @staticmethod
    def get_user_groups(db: Session, user_id: UUID) -> List[ChatGroupResponse]:
        """Get all groups that a user is a member of"""
        # Query groups where user is a member
        query = (
            select(ChatGroup, func.count(ChatMember.user_id).label("member_count"))
            .join(ChatMember, ChatGroup.id == ChatMember.group_id)
            .where(
                and_(
                    ChatMember.user_id == user_id,
                    ChatGroup.is_active == True
                )
            )
            .group_by(ChatGroup.id)
            .order_by(desc(ChatGroup.updated_at))
        )
        
        result = db.execute(query)
        groups_with_counts = result.all()
        
        # Build response with member counts and last message
        responses = []
        for group, member_count in groups_with_counts:
            # Get last message for this group
            last_msg_query = (
                select(ChatMessage)
                .where(ChatMessage.group_id == group.id)
                .order_by(desc(ChatMessage.created_at))
                .limit(1)
            )
            last_msg_result = db.execute(last_msg_query)
            last_message = last_msg_result.scalar_one_or_none()
            
            group_response = ChatGroupResponse(
                id=group.id,
                name=group.name,
                description=group.description,
                created_by=group.created_by,
                is_active=group.is_active,
                created_at=group.created_at,
                updated_at=group.updated_at,
                member_count=member_count,
                last_message=last_message.content if last_message else None,
                last_message_at=last_message.created_at if last_message else None
            )
            responses.append(group_response)
        
        return responses

    @staticmethod
    def get_group_detail(
        db: Session, 
        group_id: UUID, 
        user_id: UUID
    ) -> Optional[ChatGroupDetailResponse]:
        """Get detailed group info with members list"""
        # Check if user is member of the group
        member_check = db.execute(
            select(ChatMember).where(
                and_(
                    ChatMember.group_id == group_id,
                    ChatMember.user_id == user_id
                )
            )
        )
        if not member_check.scalar_one_or_none():
            return None  # User not a member
        
        # Get group
        group_result = db.execute(
            select(ChatGroup).where(ChatGroup.id == group_id)
        )
        group = group_result.scalar_one_or_none()
        if not group:
            return None
        
        # Get all members with user details
        members_query = (
            select(ChatMember, User)
            .join(User, ChatMember.user_id == User.id)
            .where(ChatMember.group_id == group_id)
        )
        members_result = db.execute(members_query)
        members_data = members_result.all()
        
        members = [
            ChatMemberResponse(
                user_id=member.user_id,
                full_name=user.full_name,
                email=user.email,
                year=user.year,
                branch=user.branch,
                role=member.role,
                joined_at=member.joined_at
            )
            for member, user in members_data
        ]
        
        # Get member count
        member_count = len(members)
        
        # Get last message
        last_msg_query = (
            select(ChatMessage)
            .where(ChatMessage.group_id == group_id)
            .order_by(desc(ChatMessage.created_at))
            .limit(1)
        )
        last_msg_result = db.execute(last_msg_query)
        last_message = last_msg_result.scalar_one_or_none()
        
        return ChatGroupDetailResponse(
            id=group.id,
            name=group.name,
            description=group.description,
            created_by=group.created_by,
            is_active=group.is_active,
            created_at=group.created_at,
            updated_at=group.updated_at,
            member_count=member_count,
            last_message=last_message.content if last_message else None,
            last_message_at=last_message.created_at if last_message else None,
            members=members
        )

    @staticmethod
    def add_members(
        db: Session, 
        group_id: UUID, 
        user_ids: List[UUID],
        requester_id: UUID
    ) -> bool:
        """Add members to a group (only admins can add)"""
        # Check if requester is admin
        admin_check = db.execute(
            select(ChatMember).where(
                and_(
                    ChatMember.group_id == group_id,
                    ChatMember.user_id == requester_id,
                    ChatMember.role == "admin"
                )
            )
        )
        if not admin_check.scalar_one_or_none():
            return False  # Not admin
        
        # Add each user
        for user_id in user_ids:
            # Check if already a member
            existing = db.execute(
                select(ChatMember).where(
                    and_(
                        ChatMember.group_id == group_id,
                        ChatMember.user_id == user_id
                    )
                )
            )
            if not existing.scalar_one_or_none():
                new_member = ChatMember(
                    group_id=group_id,
                    user_id=user_id,
                    role="member"
                )
                db.add(new_member)
        
        db.commit()
        return True

    @staticmethod
    def send_message(
        db: Session,
        group_id: UUID,
        user_id: UUID,
        message_data: ChatMessageCreate
    ) -> Optional[ChatMessage]:
        """Send a message to a group"""
        # Check if user is member
        member_check = db.execute(
            select(ChatMember).where(
                and_(
                    ChatMember.group_id == group_id,
                    ChatMember.user_id == user_id
                )
            )
        )
        if not member_check.scalar_one_or_none():
            return None  # Not a member
        
        # Create message
        new_message = ChatMessage(
            group_id=group_id,
            user_id=user_id,
            content=message_data.content
        )
        db.add(new_message)
        
        # Update group's updated_at timestamp
        group_result = db.execute(
            select(ChatGroup).where(ChatGroup.id == group_id)
        )
        group = group_result.scalar_one_or_none()
        if group:
            group.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(new_message)
        return new_message

    @staticmethod
    def get_messages(
        db: Session,
        group_id: UUID,
        user_id: UUID,
        limit: int = 50,
        before: Optional[datetime] = None
    ) -> List[ChatMessageResponse]:
        """Get messages from a group (paginated)"""
        # Check if user is member
        member_check = db.execute(
            select(ChatMember).where(
                and_(
                    ChatMember.group_id == group_id,
                    ChatMember.user_id == user_id
                )
            )
        )
        if not member_check.scalar_one_or_none():
            return []  # Not a member
        
        # Build query
        query = (
            select(ChatMessage, User)
            .join(User, ChatMessage.user_id == User.id)
            .where(ChatMessage.group_id == group_id)
        )
        
        # Add pagination
        if before:
            query = query.where(ChatMessage.created_at < before)
        
        query = query.order_by(desc(ChatMessage.created_at)).limit(limit)
        
        result = db.execute(query)
        messages_data = result.all()
        
        # Build responses
        messages = [
            ChatMessageResponse(
                id=message.id,
                group_id=message.group_id,
                user_id=message.user_id,
                content=message.content,
                created_at=message.created_at,
                user_name=user.full_name,
                user_year=user.year,
                user_branch=user.branch
            )
            for message, user in messages_data
        ]
        
        # Reverse to get chronological order (oldest first)
        return list(reversed(messages))

    @staticmethod
    def update_group(
        db: Session,
        group_id: UUID,
        user_id: UUID,
        update_data: ChatGroupUpdate
    ) -> Optional[ChatGroup]:
        """Update group details (only admins can update)"""
        # Check if user is admin
        admin_check = db.execute(
            select(ChatMember).where(
                and_(
                    ChatMember.group_id == group_id,
                    ChatMember.user_id == user_id,
                    ChatMember.role == "admin"
                )
            )
        )
        if not admin_check.scalar_one_or_none():
            return None
        
        # Get group
        group_result = db.execute(
            select(ChatGroup).where(ChatGroup.id == group_id)
        )
        group = group_result.scalar_one_or_none()
        if not group:
            return None
        
        # Update fields
        if update_data.name is not None:
            group.name = update_data.name
        if update_data.description is not None:
            group.description = update_data.description
        if update_data.is_active is not None:
            group.is_active = update_data.is_active
        
        group.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(group)
        return group

    @staticmethod
    def leave_group(
        db: Session,
        group_id: UUID,
        user_id: UUID
    ) -> bool:
        """Remove user from group"""
        # Get membership
        member_result = db.execute(
            select(ChatMember).where(
                and_(
                    ChatMember.group_id == group_id,
                    ChatMember.user_id == user_id
                )
            )
        )
        member = member_result.scalar_one_or_none()
        if not member:
            return False
        
        db.delete(member)
        db.commit()
        return True
