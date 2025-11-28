from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, List, Set
from uuid import UUID
import json
import logging

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manages WebSocket connections for real-time chat"""
    
    def __init__(self):
        # Maps group_id -> set of WebSocket connections
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        # Maps WebSocket -> user_id for identification
        self.connection_users: Dict[WebSocket, str] = {}
        # Maps WebSocket -> group_id for cleanup
        self.connection_groups: Dict[WebSocket, str] = {}
    
    async def connect(self, websocket: WebSocket, group_id: str, user_id: str):
        """Accept WebSocket connection and add to group"""
        await websocket.accept()
        
        # Initialize group if doesn't exist
        if group_id not in self.active_connections:
            self.active_connections[group_id] = set()
        
        # Add connection to group
        self.active_connections[group_id].add(websocket)
        self.connection_users[websocket] = user_id
        self.connection_groups[websocket] = group_id
        
        logger.info(f"User {user_id} connected to group {group_id}")
        
        # Notify others in group
        await self.broadcast_to_group(
            group_id,
            {
                "type": "user_joined",
                "user_id": user_id,
                "timestamp": None  # Will be added by client
            },
            exclude=websocket
        )
    
    def disconnect(self, websocket: WebSocket):
        """Remove WebSocket connection"""
        try:
            user_id = self.connection_users.get(websocket)
            group_id = self.connection_groups.get(websocket)
            
            if group_id and group_id in self.active_connections:
                self.active_connections[group_id].discard(websocket)
                
                # Clean up empty groups
                if not self.active_connections[group_id]:
                    del self.active_connections[group_id]
            
            # Clean up mappings
            self.connection_users.pop(websocket, None)
            self.connection_groups.pop(websocket, None)
            
            logger.info(f"User {user_id} disconnected from group {group_id}")
            
        except Exception as e:
            logger.error(f"Error during disconnect: {str(e)}")
    
    async def send_personal_message(self, message: dict, websocket: WebSocket):
        """Send message to specific WebSocket"""
        try:
            await websocket.send_json(message)
        except Exception as e:
            logger.error(f"Error sending personal message: {str(e)}")
    
    async def broadcast_to_group(self, group_id: str, message: dict, exclude: WebSocket = None):
        """Broadcast message to all connections in a group"""
        if group_id not in self.active_connections:
            return
        
        dead_connections = set()
        
        for connection in self.active_connections[group_id]:
            if exclude and connection == exclude:
                continue
            
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Error broadcasting to connection: {str(e)}")
                dead_connections.add(connection)
        
        # Clean up dead connections
        for dead_connection in dead_connections:
            self.disconnect(dead_connection)
    
    async def send_typing_indicator(self, group_id: str, user_id: str, is_typing: bool, websocket: WebSocket):
        """Broadcast typing indicator to group"""
        await self.broadcast_to_group(
            group_id,
            {
                "type": "typing",
                "user_id": user_id,
                "is_typing": is_typing
            },
            exclude=websocket
        )
    
    def get_group_connection_count(self, group_id: str) -> int:
        """Get number of active connections in a group"""
        return len(self.active_connections.get(group_id, set()))
    
    def get_connected_users(self, group_id: str) -> List[str]:
        """Get list of user IDs connected to a group"""
        if group_id not in self.active_connections:
            return []
        
        return [
            self.connection_users[conn]
            for conn in self.active_connections[group_id]
            if conn in self.connection_users
        ]


# Global connection manager instance
manager = ConnectionManager()
