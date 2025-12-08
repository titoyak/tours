"""
Basic tests for the Conversation Tree system
Run with: pytest test_basic.py
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(__file__))

def test_imports():
    """Test that all modules can be imported"""
    try:
        import database
        import models
        import schemas
        import main
        assert True
    except ImportError as e:
        assert False, f"Import failed: {e}"


def test_model_structure():
    """Test that the ConversationNode model has correct attributes"""
    from models import ConversationNode
    from database import Base
    
    # Check it's a SQLAlchemy model
    assert hasattr(ConversationNode, '__tablename__')
    assert ConversationNode.__tablename__ == 'conversation_nodes'
    
    # Check required columns exist
    required_attrs = ['id', 'parent_id', 'content', 'author', 'created_at', 'updated_at', 'is_deleted']
    for attr in required_attrs:
        assert hasattr(ConversationNode, attr), f"Missing attribute: {attr}"


def test_schemas():
    """Test that Pydantic schemas are properly defined"""
    from schemas import (
        ConversationNodeCreate,
        ConversationNodeUpdate,
        ConversationNodeResponse,
        ConversationNodeTree,
        TreePath,
        TreeStats
    )
    
    # Test create schema
    create_data = {
        'content': 'Test message',
        'author': 'Tester'
    }
    node = ConversationNodeCreate(**create_data)
    assert node.content == 'Test message'
    assert node.author == 'Tester'
    assert node.parent_id is None


def test_node_methods():
    """Test ConversationNode methods"""
    from models import ConversationNode
    from datetime import datetime
    
    # Create a mock node
    node = ConversationNode(
        id=1,
        parent_id=None,
        content='Test content',
        author='Test author',
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
        is_deleted=False
    )
    
    # Mock children
    node.children = []
    
    # Test to_dict
    node_dict = node.to_dict()
    assert node_dict['id'] == 1
    assert node_dict['content'] == 'Test content'
    assert node_dict['author'] == 'Test author'
    assert node_dict['is_deleted'] == False
    assert node_dict['children_count'] == 0


if __name__ == '__main__':
    print("Running basic tests...")
    
    test_imports()
    print("✓ Imports test passed")
    
    test_model_structure()
    print("✓ Model structure test passed")
    
    test_schemas()
    print("✓ Schemas test passed")
    
    test_node_methods()
    print("✓ Node methods test passed")
    
    print("\nAll tests passed! ✓")
