# System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CONVERSATION TREE                        │
│                         CHAT SYSTEM                              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                          FRONTEND (React)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────┐  ┌──────────────┐  ┌────────────────────┐      │
│  │   App.jsx  │  │   api.js     │  │   Components       │      │
│  │            │  │              │  │                    │      │
│  │  - State   │  │  - Axios     │  │  - ConversationTree│      │
│  │  - Layout  │  │  - API calls │  │  - TreeMap         │      │
│  │  - Routing │  │              │  │  - MessageInput    │      │
│  │            │  │              │  │  - TreeStats       │      │
│  └────────────┘  └──────────────┘  └────────────────────┘      │
│                                                                   │
│  Features:                                                        │
│  - Tree visualization with branching                             │
│  - Breadcrumb navigation                                         │
│  - Global map view with legend                                   │
│  - Message input and deletion                                    │
│  - Real-time statistics                                          │
│                                                                   │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                │ HTTP/REST API
                                │ (Port 3000 → Port 8000)
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                        BACKEND (FastAPI)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                       main.py                             │   │
│  │  FastAPI Application + 12 REST Endpoints                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  API Endpoints:                                                   │
│  ┌─────────────────────┐  ┌──────────────────────────────┐     │
│  │   Node Operations   │  │   Tree Operations            │     │
│  │                     │  │                              │     │
│  │  POST   /nodes/     │  │  GET  /tree/full             │     │
│  │  GET    /nodes/     │  │  GET  /tree/stats            │     │
│  │  GET    /nodes/{id} │  │                              │     │
│  │  PUT    /nodes/{id} │  │  Demo:                       │     │
│  │  DELETE /nodes/{id} │  │  POST /demo/init             │     │
│  │  GET /nodes/roots   │  │                              │     │
│  │  GET /nodes/{id}/   │  └──────────────────────────────┘     │
│  │      tree           │                                         │
│  │  GET /nodes/{id}/   │                                         │
│  │      path           │                                         │
│  │  GET /nodes/{id}/   │                                         │
│  │      children       │                                         │
│  └─────────────────────┘                                         │
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │   models.py      │  │   schemas.py     │  │  database.py │  │
│  │                  │  │                  │  │              │  │
│  │  ConversationNode│  │  Pydantic models │  │  SQLAlchemy  │  │
│  │  - to_dict()     │  │  for validation  │  │  engine      │  │
│  │  - to_dict_with_ │  │                  │  │  & session   │  │
│  │    children()    │  │                  │  │              │  │
│  └──────────────────┘  └──────────────────┘  └──────────────┘  │
│                                                                   │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                │ SQLAlchemy ORM
                                │ psycopg2
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                    DATABASE (PostgreSQL)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  conversation_nodes                                               │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Column         │ Type      │ Description                │    │
│  ├─────────────────────────────────────────────────────────┤    │
│  │ id             │ Integer   │ Primary Key (auto)        │    │
│  │ parent_id      │ Integer   │ FK → conversation_nodes.id│    │
│  │ content        │ Text      │ Message content           │    │
│  │ author         │ String    │ Message author            │    │
│  │ created_at     │ DateTime  │ Creation timestamp        │    │
│  │ updated_at     │ DateTime  │ Update timestamp          │    │
│  │ is_deleted     │ Boolean   │ Soft delete flag          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
│  Tree Structure:                                                  │
│  - Self-referential: parent_id → id                              │
│  - N-ary tree: unlimited children per node                       │
│  - Multiple roots: parent_id = NULL                              │
│  - Soft delete: preserves referential integrity                  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      DATA FLOW EXAMPLE                           │
└─────────────────────────────────────────────────────────────────┘

User Action: Create a Reply
│
├─ 1. User types message in MessageInput component
├─ 2. onSubmit → App.handleCreateMessage(content, author, parentId)
├─ 3. conversationApi.createNode({ parent_id, content, author })
├─ 4. HTTP POST → http://localhost:8000/nodes/
│
Backend Processing:
│
├─ 5. FastAPI receives request at @app.post("/nodes/")
├─ 6. Validate with ConversationNodeCreate schema
├─ 7. Check parent exists in database
├─ 8. Create ConversationNode instance
├─ 9. db.add() → db.commit() → db.refresh()
├─ 10. Return ConversationNodeResponse
│
Frontend Update:
│
├─ 11. Receive response from API
├─ 12. Call loadTrees() to refresh tree data
├─ 13. Call loadStats() to update statistics
├─ 14. React re-renders with new data
└─ 15. User sees updated conversation tree

┌─────────────────────────────────────────────────────────────────┐
│                    TREE STRUCTURE EXAMPLE                        │
└─────────────────────────────────────────────────────────────────┘

                    Root (id: 1, parent_id: null)
                    "Explain quantum computing"
                             │
        ┌────────────────────┴────────────────────┐
        │                                         │
     Reply 1 (id: 2, parent_id: 1)            Reply 2 (id: 7, parent_id: 1)
     "It uses qubits..."                      "Here's an analogy..."
        │                                         │
   ┌────┴────┐                                   │
   │         │                                Reply (id: 8, parent_id: 7)
Branch 1   Branch 2                           "Thanks!"
(id: 3)    (id: 5)
   │         │
   │    ┌────┴────┐
Reply   Sub-1   Sub-2
(id: 4) (id: 6) (...)

Database Representation:
┌────┬───────────┬─────────────────────────┐
│ id │ parent_id │ content                 │
├────┼───────────┼─────────────────────────┤
│ 1  │ NULL      │ Explain quantum...      │
│ 2  │ 1         │ It uses qubits...       │
│ 3  │ 2         │ What is a qubit?        │
│ 4  │ 3         │ A quantum bit...        │
│ 5  │ 2         │ What are applications?  │
│ 6  │ 5         │ Cryptography...         │
│ 7  │ 1         │ Here's an analogy...    │
│ 8  │ 7         │ Thanks!                 │
└────┴───────────┴─────────────────────────┘

Navigation Example:
- User at node 4
- Path: [1, 2, 3, 4] (Root → Reply 1 → Branch 1 → Reply)
- Breadcrumb: Root › Back › Node 4
- Children: None
- Siblings: None (only child of node 3)

┌─────────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT OPTIONS                            │
└─────────────────────────────────────────────────────────────────┘

Option 1: Local Development
├─ Terminal 1: cd backend && python main.py
├─ Terminal 2: cd frontend && npm run dev
└─ Browser: http://localhost:3000

Option 2: Docker Compose
├─ docker-compose up
└─ Browser: http://localhost:3000

Option 3: Separate Containers
├─ docker build -t conv-backend ./backend
├─ docker build -t conv-frontend ./frontend
├─ docker run -d -p 5432:5432 postgres:14
├─ docker run -d -p 8000:8000 conv-backend
└─ docker run -d -p 3000:3000 conv-frontend

┌─────────────────────────────────────────────────────────────────┐
│                      KEY FEATURES                                │
└─────────────────────────────────────────────────────────────────┘

1. Branching: Any message can have multiple replies creating branches
2. Navigation: Breadcrumb trail to return to any ancestor
3. Map View: Global overview with color-coded levels
4. Statistics: Real-time metrics (nodes, branches, depth, roots)
5. Demo Data: Pre-populated examples (quantum computing, transistors)
6. Deletion: Single message or entire branch deletion
7. Soft Delete: Preserves database integrity
8. Responsive: Works on desktop and mobile
9. Docker Ready: Complete containerization support
10. Well Documented: README, API docs, Quick Start, Features list
