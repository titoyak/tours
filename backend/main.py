from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from database import engine, get_db, Base
from models import ConversationNode
from schemas import (
    ConversationNodeCreate,
    ConversationNodeUpdate,
    ConversationNodeResponse,
    ConversationNodeTree,
    TreePath,
    TreeStats
)

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Conversation Tree API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    """Root endpoint"""
    return {"message": "Conversation Tree API", "version": "1.0.0"}


@app.post("/nodes/", response_model=ConversationNodeResponse)
def create_node(node: ConversationNodeCreate, db: Session = Depends(get_db)):
    """Create a new conversation node"""
    # Validate parent exists if parent_id is provided
    if node.parent_id:
        parent = db.query(ConversationNode).filter(
            ConversationNode.id == node.parent_id,
            ConversationNode.is_deleted == False
        ).first()
        if not parent:
            raise HTTPException(status_code=404, detail="Parent node not found")
    
    db_node = ConversationNode(
        parent_id=node.parent_id,
        content=node.content,
        author=node.author
    )
    db.add(db_node)
    db.commit()
    db.refresh(db_node)
    return db_node.to_dict()


@app.get("/nodes/", response_model=List[ConversationNodeResponse])
def get_all_nodes(
    include_deleted: bool = False,
    db: Session = Depends(get_db)
):
    """Get all conversation nodes"""
    query = db.query(ConversationNode)
    if not include_deleted:
        query = query.filter(ConversationNode.is_deleted == False)
    nodes = query.all()
    return [node.to_dict() for node in nodes]


@app.get("/nodes/roots", response_model=List[ConversationNodeResponse])
def get_root_nodes(db: Session = Depends(get_db)):
    """Get all root conversation nodes (nodes without parents)"""
    nodes = db.query(ConversationNode).filter(
        ConversationNode.parent_id == None,
        ConversationNode.is_deleted == False
    ).all()
    return [node.to_dict() for node in nodes]


@app.get("/nodes/{node_id}", response_model=ConversationNodeResponse)
def get_node(node_id: int, db: Session = Depends(get_db)):
    """Get a specific conversation node by ID"""
    node = db.query(ConversationNode).filter(
        ConversationNode.id == node_id,
        ConversationNode.is_deleted == False
    ).first()
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
    return node.to_dict()


@app.get("/nodes/{node_id}/tree", response_model=ConversationNodeTree)
def get_node_tree(node_id: int, db: Session = Depends(get_db)):
    """Get a conversation node with all its descendants"""
    node = db.query(ConversationNode).filter(
        ConversationNode.id == node_id,
        ConversationNode.is_deleted == False
    ).first()
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
    return node.to_dict_with_children()


@app.get("/nodes/{node_id}/path", response_model=TreePath)
def get_node_path(node_id: int, db: Session = Depends(get_db)):
    """Get the path from root to a specific node"""
    node = db.query(ConversationNode).filter(
        ConversationNode.id == node_id,
        ConversationNode.is_deleted == False
    ).first()
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
    
    path = []
    current = node
    while current:
        path.insert(0, current.to_dict())
        current = current.parent if current.parent and not current.parent.is_deleted else None
    
    return {"nodes": path}


@app.get("/nodes/{node_id}/children", response_model=List[ConversationNodeResponse])
def get_node_children(node_id: int, db: Session = Depends(get_db)):
    """Get all children of a specific node"""
    node = db.query(ConversationNode).filter(
        ConversationNode.id == node_id,
        ConversationNode.is_deleted == False
    ).first()
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
    
    children = [child.to_dict() for child in node.children if not child.is_deleted]
    return children


@app.put("/nodes/{node_id}", response_model=ConversationNodeResponse)
def update_node(
    node_id: int,
    node_update: ConversationNodeUpdate,
    db: Session = Depends(get_db)
):
    """Update a conversation node"""
    node = db.query(ConversationNode).filter(
        ConversationNode.id == node_id,
        ConversationNode.is_deleted == False
    ).first()
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
    
    if node_update.content is not None:
        node.content = node_update.content
    if node_update.author is not None:
        node.author = node_update.author
    
    db.commit()
    db.refresh(node)
    return node.to_dict()


@app.delete("/nodes/{node_id}")
def delete_node(
    node_id: int,
    delete_subtree: bool = False,
    db: Session = Depends(get_db)
):
    """
    Delete a conversation node.
    If delete_subtree is True, also delete all descendants.
    """
    node = db.query(ConversationNode).filter(
        ConversationNode.id == node_id,
        ConversationNode.is_deleted == False
    ).first()
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
    
    def mark_deleted(n):
        n.is_deleted = True
        if delete_subtree:
            for child in n.children:
                if not child.is_deleted:
                    mark_deleted(child)
    
    mark_deleted(node)
    db.commit()
    
    return {
        "message": "Node deleted successfully",
        "deleted_node_id": node_id,
        "subtree_deleted": delete_subtree
    }


@app.get("/tree/full", response_model=List[ConversationNodeTree])
def get_full_tree(db: Session = Depends(get_db)):
    """Get the complete conversation tree starting from all root nodes"""
    roots = db.query(ConversationNode).filter(
        ConversationNode.parent_id == None,
        ConversationNode.is_deleted == False
    ).all()
    return [root.to_dict_with_children() for root in roots]


@app.get("/tree/stats", response_model=TreeStats)
def get_tree_stats(db: Session = Depends(get_db)):
    """Get statistics about the conversation tree"""
    all_nodes = db.query(ConversationNode).filter(
        ConversationNode.is_deleted == False
    ).all()
    
    roots = [n for n in all_nodes if n.parent_id is None]
    
    def get_depth(node, current_depth=0):
        if not node.children or all(c.is_deleted for c in node.children):
            return current_depth
        return max(get_depth(child, current_depth + 1) 
                   for child in node.children if not child.is_deleted)
    
    max_depth = max([get_depth(root) for root in roots]) if roots else 0
    branches = sum(1 for node in all_nodes if len([c for c in node.children if not c.is_deleted]) > 1)
    
    return {
        "total_nodes": len(all_nodes),
        "total_branches": branches,
        "max_depth": max_depth,
        "root_nodes": len(roots)
    }


@app.post("/demo/init")
def initialize_demo_data(db: Session = Depends(get_db)):
    """Initialize demo conversation data"""
    # Check if data already exists
    existing = db.query(ConversationNode).first()
    if existing:
        return {"message": "Demo data already exists"}
    
    # Create root conversation about quantum computing
    root = ConversationNode(
        content="I'm trying to understand quantum computing. Can you explain the basics?",
        author="Student"
    )
    db.add(root)
    db.flush()
    
    # Main response
    response1 = ConversationNode(
        parent_id=root.id,
        content="Quantum computing uses quantum mechanics principles. The fundamental unit is a qubit, which unlike classical bits, can exist in superposition.",
        author="Teacher"
    )
    db.add(response1)
    db.flush()
    
    # Branch 1: Deep dive into qubits
    branch1 = ConversationNode(
        parent_id=response1.id,
        content="What exactly is a qubit? How is it different from a regular bit?",
        author="Student"
    )
    db.add(branch1)
    db.flush()
    
    branch1_response = ConversationNode(
        parent_id=branch1.id,
        content="A qubit (quantum bit) can be in state |0⟩, |1⟩, or a superposition of both. This is fundamentally different from classical bits that are definitively 0 or 1.",
        author="Teacher"
    )
    db.add(branch1_response)
    db.flush()
    
    # Sub-branch: Superposition
    subbranch1 = ConversationNode(
        parent_id=branch1_response.id,
        content="Can you explain superposition more clearly?",
        author="Student"
    )
    db.add(subbranch1)
    db.flush()
    
    subbranch1_response = ConversationNode(
        parent_id=subbranch1.id,
        content="Superposition means a qubit can be in multiple states simultaneously until measured. It's like a coin spinning in the air - it's both heads and tails until it lands.",
        author="Teacher"
    )
    db.add(subbranch1_response)
    
    # Branch 2: Practical applications (from main response)
    branch2 = ConversationNode(
        parent_id=response1.id,
        content="What are some practical applications of quantum computing?",
        author="Student"
    )
    db.add(branch2)
    db.flush()
    
    branch2_response = ConversationNode(
        parent_id=branch2.id,
        content="Key applications include cryptography, drug discovery, optimization problems, and simulating quantum systems.",
        author="Teacher"
    )
    db.add(branch2_response)
    db.flush()
    
    # Sub-branch: Cryptography
    crypto_branch = ConversationNode(
        parent_id=branch2_response.id,
        content="How does quantum computing affect cryptography?",
        author="Student"
    )
    db.add(crypto_branch)
    db.flush()
    
    crypto_response = ConversationNode(
        parent_id=crypto_branch.id,
        content="Quantum computers could break current encryption methods using Shor's algorithm, but quantum cryptography also provides unbreakable encryption through quantum key distribution.",
        author="Teacher"
    )
    db.add(crypto_response)
    
    # Another root conversation about transistors
    root2 = ConversationNode(
        content="I need to understand how transistors work for my electronics project.",
        author="Engineer"
    )
    db.add(root2)
    db.flush()
    
    transistor_response = ConversationNode(
        parent_id=root2.id,
        content="Transistors are semiconductor devices that can amplify or switch electronic signals. They're the building blocks of modern electronics.",
        author="Mentor"
    )
    db.add(transistor_response)
    db.flush()
    
    # Branch about doping
    doping_q = ConversationNode(
        parent_id=transistor_response.id,
        content="What is doping in semiconductors?",
        author="Engineer"
    )
    db.add(doping_q)
    db.flush()
    
    doping_response = ConversationNode(
        parent_id=doping_q.id,
        content="Doping is adding impurities to pure semiconductors to change their electrical properties. N-type doping adds electrons, P-type removes them.",
        author="Mentor"
    )
    db.add(doping_response)
    
    db.commit()
    
    return {"message": "Demo data initialized successfully"}


if __name__ == "__main__":
    import uvicorn
    import os
    
    # Use 0.0.0.0 for Docker/production, localhost for development
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    
    uvicorn.run(app, host=host, port=port)
