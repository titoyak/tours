from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from datetime import datetime, timezone

Base = declarative_base()

class ConversationNode(Base):
    """
    Represents a single node in the conversation tree.
    Each node contains a message and can have a parent node and multiple children.
    """
    __tablename__ = 'conversation_nodes'
    
    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    role = Column(String(50), nullable=False)  # 'user' or 'assistant'
    parent_id = Column(Integer, ForeignKey('conversation_nodes.id'), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    # Self-referential relationship
    parent = relationship('ConversationNode', remote_side=[id], backref='children')
    
    def to_dict(self):
        """Convert node to dictionary representation"""
        return {
            'id': self.id,
            'content': self.content,
            'role': self.role,
            'parent_id': self.parent_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'children': [child.id for child in self.children]
        }
    
    def to_dict_recursive(self):
        """Convert node and all descendants to nested dictionary"""
        return {
            'id': self.id,
            'content': self.content,
            'role': self.role,
            'parent_id': self.parent_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'children': [child.to_dict_recursive() for child in self.children]
        }
