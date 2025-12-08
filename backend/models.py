from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class ConversationNode(Base):
    """
    Represents a node in the conversation tree.
    Each node can have a parent and multiple children, forming a tree structure.
    """
    __tablename__ = "conversation_nodes"

    id = Column(Integer, primary_key=True, index=True)
    parent_id = Column(Integer, ForeignKey("conversation_nodes.id"), nullable=True)
    content = Column(Text, nullable=False)
    author = Column(String(255), default="User")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_deleted = Column(Boolean, default=False)
    
    # Tree relationships
    parent = relationship("ConversationNode", remote_side=[id], backref="children")
    
    def to_dict(self):
        """Convert node to dictionary representation"""
        return {
            "id": self.id,
            "parent_id": self.parent_id,
            "content": self.content,
            "author": self.author,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "is_deleted": self.is_deleted,
            "children_count": len([c for c in self.children if not c.is_deleted])
        }
    
    def to_dict_with_children(self):
        """Convert node to dictionary with recursive children"""
        result = self.to_dict()
        result["children"] = [
            child.to_dict_with_children() 
            for child in self.children 
            if not child.is_deleted
        ]
        return result
