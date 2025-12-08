# Branching Conversations - Tree-Based Chat System

A full-stack application that enables tree-based conversation management, allowing users to branch off at any point in a conversation to explore different topics or ideas without losing context.

## Features

- 🌳 **Tree-Based Conversations**: Manage conversations as a tree structure with unlimited branching
- 🌿 **Branch from Any Point**: Create new conversation branches from any message
- 🗑️ **Delete Branches**: Remove entire conversation branches when needed
- 🗺️ **Visual Navigation**: Navigate through conversation branches with an intuitive tree map
- 📊 **Statistics**: Track conversation depth, branches, and total nodes
- 🎨 **Beautiful UI**: Modern, gradient-based design with smooth animations
- 💾 **Persistent Storage**: All conversations stored in PostgreSQL/SQLite database
- 🎯 **Demo Data**: Pre-loaded example conversations about semiconductors (BJT)

## Use Cases

- **Research & Learning**: Explore sub-concepts without losing main conversation thread
- **Math & Proofs**: Try multiple derivations from the same starting point
- **Programming**: Debug different failure points or try various strategies
- **Creative Writing**: Explore different plot directions or character developments

## Tech Stack

### Backend
- **Python 3.x** with FastAPI
- **SQLAlchemy** for ORM
- **PostgreSQL** or SQLite for database
- **Uvicorn** as ASGI server

### Frontend
- **React 19** with hooks
- **Vite** for fast development and building
- **CSS3** with modern gradients and animations

## Installation

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL (optional, SQLite is used by default)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. (Optional) Set up PostgreSQL:
```bash
# Create a .env file with your database URL
echo "DATABASE_URL=postgresql://user:password@localhost/conversations" > .env
```

4. Start the backend server:
```bash
python main.py
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install Node dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Usage

### Starting a Conversation

1. Click "Load Demo Data" to see an example conversation tree about BJT semiconductors
2. Or start a new conversation by entering a message at the bottom

### Branching Off

1. Click on any message in the conversation tree to select it
2. Enter a new message in the input form
3. Click "Branch & Add" to create a new branch from that point

### Deleting Branches

1. Click the trash icon (🗑️) on any message
2. Confirm deletion - this will remove the message and all its descendants

### Navigation

- Use the **Navigation** panel on the right to see a compact tree view
- Click any node in the navigation to jump to that part of the conversation
- The **Statistics** panel shows metrics about your conversation tree

## API Endpoints

### Conversations
- `GET /` - API information
- `GET /nodes` - Get all nodes
- `GET /nodes/{id}` - Get specific node
- `GET /nodes/{id}/tree` - Get node with all descendants
- `GET /roots` - Get all root nodes with full trees
- `POST /nodes` - Create new node
- `DELETE /nodes/{id}` - Delete node and descendants
- `GET /path/{id}` - Get path from root to node

### Utilities
- `POST /demo-data` - Initialize demo data
- `DELETE /all-nodes` - Clear all nodes

## Architecture

### Data Model

The `ConversationNode` model represents each message in the tree:
- `id`: Unique identifier
- `content`: Message text
- `role`: 'user' or 'assistant'
- `parent_id`: Reference to parent node (null for roots)
- `created_at`: Timestamp
- Relationships: `parent` and `children` for tree structure

### Component Structure

- **App.jsx**: Main application container, state management
- **ConversationTree.jsx**: Displays the conversation tree with branching visualization
- **MessageInput.jsx**: Form for adding new messages
- **TreeMap.jsx**: Compact navigation view
- **TreeStats.jsx**: Statistics dashboard

## Development

### Building for Production

Frontend:
```bash
cd frontend
npm run build
```

The built files will be in `frontend/dist/`

### Database Migrations

The application automatically creates database tables on startup. For PostgreSQL in production, consider using Alembic for migrations.

## Contributing

This is a take-home project demonstrating tree-based conversation management. Feel free to fork and extend!

## License

ISC

## Acknowledgments

Inspired by the need for better conversation management in AI chat systems like ChatGPT and Claude.
