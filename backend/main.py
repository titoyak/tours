from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from typing import Optional, List
import os
from datetime import datetime

from models import Base, ConversationNode

# Database configuration
DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///./conversations.db')
engine = create_engine(DATABASE_URL, connect_args={'check_same_thread': False} if 'sqlite' in DATABASE_URL else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Branching Conversation API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for API
class NodeCreate(BaseModel):
    content: str
    role: str
    parent_id: Optional[int] = None

class NodeResponse(BaseModel):
    id: int
    content: str
    role: str
    parent_id: Optional[int]
    created_at: str
    children: List[int]

class NodeTreeResponse(BaseModel):
    id: int
    content: str
    role: str
    parent_id: Optional[int]
    created_at: str
    children: List['NodeTreeResponse']

NodeTreeResponse.model_rebuild()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Branching Conversation API", "version": "1.0.0"}

@app.get("/nodes", response_model=List[NodeResponse])
def get_all_nodes(db: Session = Depends(get_db)):
    """Get all conversation nodes"""
    nodes = db.query(ConversationNode).all()
    return [node.to_dict() for node in nodes]

@app.get("/nodes/{node_id}", response_model=NodeResponse)
def get_node(node_id: int, db: Session = Depends(get_db)):
    """Get a specific node by ID"""
    node = db.query(ConversationNode).filter(ConversationNode.id == node_id).first()
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
    return node.to_dict()

@app.get("/nodes/{node_id}/tree", response_model=NodeTreeResponse)
def get_node_tree(node_id: int, db: Session = Depends(get_db)):
    """Get a node and all its descendants"""
    node = db.query(ConversationNode).filter(ConversationNode.id == node_id).first()
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
    return node.to_dict_recursive()

@app.get("/roots", response_model=List[NodeTreeResponse])
def get_root_nodes(db: Session = Depends(get_db)):
    """Get all root nodes (nodes without parents) with their full tree"""
    roots = db.query(ConversationNode).filter(ConversationNode.parent_id == None).all()
    return [node.to_dict_recursive() for node in roots]

@app.post("/nodes", response_model=NodeResponse)
def create_node(node: NodeCreate, db: Session = Depends(get_db)):
    """Create a new conversation node"""
    # Validate parent exists if parent_id is provided
    if node.parent_id is not None:
        parent = db.query(ConversationNode).filter(ConversationNode.id == node.parent_id).first()
        if not parent:
            raise HTTPException(status_code=404, detail="Parent node not found")
    
    # Create new node
    db_node = ConversationNode(
        content=node.content,
        role=node.role,
        parent_id=node.parent_id
    )
    db.add(db_node)
    db.commit()
    db.refresh(db_node)
    
    return db_node.to_dict()

@app.delete("/nodes/{node_id}")
def delete_node(node_id: int, db: Session = Depends(get_db)):
    """Delete a node and all its descendants"""
    node = db.query(ConversationNode).filter(ConversationNode.id == node_id).first()
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
    
    # Recursively delete all descendants
    def delete_descendants(node):
        for child in node.children:
            delete_descendants(child)
        db.delete(node)
    
    delete_descendants(node)
    db.commit()
    
    return {"message": f"Node {node_id} and its descendants deleted successfully"}

@app.get("/path/{node_id}")
def get_path_to_node(node_id: int, db: Session = Depends(get_db)):
    """Get the path from root to a specific node"""
    node = db.query(ConversationNode).filter(ConversationNode.id == node_id).first()
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
    
    path = []
    current = node
    while current:
        path.insert(0, current.to_dict())
        current = current.parent
    
    return {"path": path}

@app.post("/demo-data")
def initialize_demo_data(db: Session = Depends(get_db)):
    """Initialize demo data with a BJT conversation tree"""
    # Clear existing data
    db.query(ConversationNode).delete()
    db.commit()
    
    # Create the BJT conversation tree
    # Root conversation
    root = ConversationNode(
        content="Can you explain to me the BJT (semiconductor)?",
        role="user",
        parent_id=None
    )
    db.add(root)
    db.commit()
    db.refresh(root)
    
    bjt_response = ConversationNode(
        content="A **BJT (Bipolar Junction Transistor)** is a type of semiconductor device that can amplify or switch electrical signals. It has three layers of semiconductor material and two p-n junctions, making it a **bipolar** device since it uses both electrons and holes as charge carriers.\n\n### Structure\n\nA BJT has three terminals:\n\n1. **Emitter (E)**: Heavily doped to inject carriers.\n2. **Base (B)**: Thin and lightly doped.\n3. **Collector (C)**: Moderately doped and larger to collect carriers.\n\nThere are two types of BJTs:\n\n1. **NPN transistor**: Consists of an N-type emitter, a P-type base, and an N-type collector.\n2. **PNP transistor**: Consists of a P-type emitter, an N-type base, and a P-type collector.",
        role="assistant",
        parent_id=root.id
    )
    db.add(bjt_response)
    db.commit()
    db.refresh(bjt_response)
    
    # Branch 1: What is a transistor?
    transistor_q = ConversationNode(
        content="What is a transistor?",
        role="user",
        parent_id=bjt_response.id
    )
    db.add(transistor_q)
    db.commit()
    db.refresh(transistor_q)
    
    transistor_a = ConversationNode(
        content="A **transistor** is a semiconductor device used to amplify or switch electronic signals and electrical power. It's one of the fundamental building blocks of modern electronics. Transistors are composed of semiconductor material with at least three terminals for connection to an external circuit.",
        role="assistant",
        parent_id=transistor_q.id
    )
    db.add(transistor_a)
    db.commit()
    db.refresh(transistor_a)
    
    # Branch 2: What does 'doped' mean?
    doped_q = ConversationNode(
        content="What does 'doped' mean in this context?",
        role="user",
        parent_id=bjt_response.id
    )
    db.add(doped_q)
    db.commit()
    db.refresh(doped_q)
    
    doped_a = ConversationNode(
        content="In semiconductor physics, **doping** is the intentional introduction of impurities into an intrinsic (pure) semiconductor to modify its electrical properties. By adding specific elements, we can control the number and type of charge carriers (electrons or holes) in the material.\n\n- **N-type doping**: Adding elements with extra electrons (like phosphorus) creates excess electrons.\n- **P-type doping**: Adding elements with fewer electrons (like boron) creates 'holes' or positive charge carriers.",
        role="assistant",
        parent_id=doped_q.id
    )
    db.add(doped_a)
    db.commit()
    db.refresh(doped_a)
    
    # Branch 3: What are terminals?
    terminal_q = ConversationNode(
        content="What are terminals in electronics?",
        role="user",
        parent_id=bjt_response.id
    )
    db.add(terminal_q)
    db.commit()
    db.refresh(terminal_q)
    
    terminal_a = ConversationNode(
        content="In electronics, **terminals** are the points of connection where electrical signals enter or leave a component. They're the physical connection points (often metal pins or pads) that allow the component to be connected to other parts of a circuit. For a BJT, the three terminals (emitter, base, and collector) each serve specific functions in controlling current flow.",
        role="assistant",
        parent_id=terminal_q.id
    )
    db.add(terminal_a)
    db.commit()
    
    return {"message": "Demo data initialized successfully", "root_id": root.id}

@app.delete("/all-nodes")
def delete_all_nodes(db: Session = Depends(get_db)):
    """Delete all nodes (useful for testing)"""
    db.query(ConversationNode).delete()
    db.commit()
    return {"message": "All nodes deleted successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
