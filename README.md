# Conversation Tree Chat System

A branching conversation system that allows users to explore multiple discussion threads from any point in a conversation, perfect for research, debugging, and exploring multiple solution paths.

## Features

- **Tree-Based Conversations**: Create branching discussions from any message
- **Easy Navigation**: Navigate back to the main thread with breadcrumb navigation
- **Global Map View**: Visual overview of the entire conversation tree
- **Message Management**: Delete individual messages or entire branches
- **Tree Statistics**: Real-time stats showing nodes, branches, and depth
- **Demo Data**: Pre-populated examples for quantum computing and transistors

## Tech Stack

- **Backend**: Python with FastAPI
- **Frontend**: React with Vite
- **Database**: PostgreSQL
- **API**: RESTful API with SQLAlchemy ORM

## Prerequisites

- Python 3.8+
- Node.js 16+
- PostgreSQL 12+

## Setup Instructions

### 1. Database Setup

Create a PostgreSQL database:

```bash
psql -U postgres
CREATE DATABASE conversation_tree;
\q
```

### 2. Backend Setup

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Configure database (optional - default connection is already set)
cp .env.example .env
# Edit .env if you need to change database connection settings

# Run the backend server
python main.py
```

The backend API will start at `http://localhost:8000`

### 3. Frontend Setup

```bash
cd frontend

# Install Node dependencies
npm install

# Start the development server
npm run dev
```

The frontend will start at `http://localhost:3000`

## Usage

1. **Open the application** at `http://localhost:3000`

2. **Load Demo Data**: Click "Load Demo Data" to populate the system with example conversations about quantum computing and transistors

3. **Browse Conversations**: Click on any conversation thread in the sidebar

4. **Navigate the Tree**: 
   - Click on any reply to view its branches
   - Use the breadcrumb navigation to go back
   - Click "Show Map" to see the full conversation tree

5. **Create Messages**:
   - Enter your name and message in the input area
   - If a node is selected, your message will be a reply/branch
   - If no node is selected, you'll create a new root conversation

6. **Delete Messages**:
   - "Delete Message": Removes only that message
   - "Delete Branch": Removes the message and all its descendants

## API Endpoints

### Nodes
- `POST /nodes/` - Create a new conversation node
- `GET /nodes/` - Get all nodes
- `GET /nodes/roots` - Get root nodes
- `GET /nodes/{node_id}` - Get specific node
- `GET /nodes/{node_id}/tree` - Get node with all descendants
- `GET /nodes/{node_id}/path` - Get path from root to node
- `GET /nodes/{node_id}/children` - Get node's children
- `PUT /nodes/{node_id}` - Update a node
- `DELETE /nodes/{node_id}` - Delete a node (with optional subtree deletion)

### Tree Operations
- `GET /tree/full` - Get complete conversation tree
- `GET /tree/stats` - Get tree statistics

### Demo
- `POST /demo/init` - Initialize demo data

## Architecture

### Database Schema

```sql
conversation_nodes (
  id: Integer (Primary Key)
  parent_id: Integer (Foreign Key -> conversation_nodes.id)
  content: Text
  author: String
  created_at: DateTime
  updated_at: DateTime
  is_deleted: Boolean
)
```

### Tree Structure

The system uses a self-referential parent-child relationship to create an n-ary tree structure. Each node can have:
- Zero or one parent
- Zero to many children

This allows for:
- Multiple root conversations
- Unlimited branching depth
- Easy navigation and path traversal

## Use Cases

1. **Research**: Branch off to explore related concepts without losing the main discussion thread
2. **Debugging**: Create branches to test different solutions while maintaining context
3. **Education**: Explore multiple explanations or proof methods for the same concept
4. **Brainstorming**: Develop multiple ideas from a single starting point

## Development

### Project Structure

```
.
├── backend/
│   ├── main.py           # FastAPI application
│   ├── models.py         # SQLAlchemy models
│   ├── schemas.py        # Pydantic schemas
│   ├── database.py       # Database configuration
│   └── requirements.txt  # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── App.jsx       # Main application
│   │   ├── api.js        # API client
│   │   └── main.jsx      # Entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

### Adding New Features

**Backend**: Add endpoints in `main.py`, update models in `models.py`, and schemas in `schemas.py`

**Frontend**: Create new components in `src/components/` and integrate them in `App.jsx`

## License

MIT License