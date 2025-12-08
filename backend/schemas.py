from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ConversationNodeCreate(BaseModel):
    """Schema for creating a new conversation node"""
    parent_id: Optional[int] = None
    content: str
    author: str = "User"


class ConversationNodeUpdate(BaseModel):
    """Schema for updating a conversation node"""
    content: Optional[str] = None
    author: Optional[str] = None


class ConversationNodeResponse(BaseModel):
    """Schema for conversation node response"""
    id: int
    parent_id: Optional[int]
    content: str
    author: str
    created_at: datetime
    updated_at: datetime
    is_deleted: bool
    children_count: int
    
    class Config:
        from_attributes = True


class ConversationNodeTree(BaseModel):
    """Schema for conversation node with children tree"""
    id: int
    parent_id: Optional[int]
    content: str
    author: str
    created_at: datetime
    updated_at: datetime
    is_deleted: bool
    children_count: int
    children: List["ConversationNodeTree"] = []
    
    class Config:
        from_attributes = True


class TreePath(BaseModel):
    """Schema for representing a path in the tree"""
    nodes: List[ConversationNodeResponse]


class TreeStats(BaseModel):
    """Schema for tree statistics"""
    total_nodes: int
    total_branches: int
    max_depth: int
    root_nodes: int
