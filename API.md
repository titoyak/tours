# API Documentation

## Base URL
`http://localhost:8000`

## Authentication
Currently, no authentication is required. This is a demo system.

## Endpoints

### Health Check

#### `GET /`
Returns API information.

**Response:**
```json
{
  "message": "Conversation Tree API",
  "version": "1.0.0"
}
```

---

### Node Operations

#### `POST /nodes/`
Create a new conversation node.

**Request Body:**
```json
{
  "parent_id": 1,  // optional, null for root nodes
  "content": "Your message content",
  "author": "User Name"
}
```

**Response:** `200 OK`
```json
{
  "id": 2,
  "parent_id": 1,
  "content": "Your message content",
  "author": "User Name",
  "created_at": "2024-01-01T12:00:00",
  "updated_at": "2024-01-01T12:00:00",
  "is_deleted": false,
  "children_count": 0
}
```

#### `GET /nodes/`
Get all conversation nodes.

**Query Parameters:**
- `include_deleted` (boolean, default: false) - Include soft-deleted nodes

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "parent_id": null,
    "content": "Root message",
    "author": "Alice",
    "created_at": "2024-01-01T12:00:00",
    "updated_at": "2024-01-01T12:00:00",
    "is_deleted": false,
    "children_count": 2
  }
]
```

#### `GET /nodes/roots`
Get all root nodes (nodes without parents).

**Response:** `200 OK` - Array of node objects

#### `GET /nodes/{node_id}`
Get a specific node by ID.

**Response:** `200 OK` - Single node object

**Errors:**
- `404 Not Found` - Node doesn't exist or is deleted

#### `GET /nodes/{node_id}/tree`
Get a node with all its descendants (recursive).

**Response:** `200 OK`
```json
{
  "id": 1,
  "parent_id": null,
  "content": "Root message",
  "author": "Alice",
  "created_at": "2024-01-01T12:00:00",
  "updated_at": "2024-01-01T12:00:00",
  "is_deleted": false,
  "children_count": 2,
  "children": [
    {
      "id": 2,
      "parent_id": 1,
      "content": "Reply 1",
      "author": "Bob",
      "created_at": "2024-01-01T12:01:00",
      "updated_at": "2024-01-01T12:01:00",
      "is_deleted": false,
      "children_count": 0,
      "children": []
    }
  ]
}
```

#### `GET /nodes/{node_id}/path`
Get the path from root to a specific node.

**Response:** `200 OK`
```json
{
  "nodes": [
    {
      "id": 1,
      "parent_id": null,
      "content": "Root message",
      ...
    },
    {
      "id": 2,
      "parent_id": 1,
      "content": "Child message",
      ...
    },
    {
      "id": 3,
      "parent_id": 2,
      "content": "Current node",
      ...
    }
  ]
}
```

#### `GET /nodes/{node_id}/children`
Get all direct children of a node.

**Response:** `200 OK` - Array of node objects

#### `PUT /nodes/{node_id}`
Update a node's content or author.

**Request Body:**
```json
{
  "content": "Updated content",  // optional
  "author": "Updated author"      // optional
}
```

**Response:** `200 OK` - Updated node object

#### `DELETE /nodes/{node_id}`
Delete a node (soft delete).

**Query Parameters:**
- `delete_subtree` (boolean, default: false) - Also delete all descendants

**Response:** `200 OK`
```json
{
  "message": "Node deleted successfully",
  "deleted_node_id": 5,
  "subtree_deleted": true
}
```

---

### Tree Operations

#### `GET /tree/full`
Get the complete conversation tree (all roots with descendants).

**Response:** `200 OK` - Array of tree objects (like `/nodes/{node_id}/tree`)

#### `GET /tree/stats`
Get statistics about the conversation tree.

**Response:** `200 OK`
```json
{
  "total_nodes": 42,
  "total_branches": 5,  // nodes with multiple children
  "max_depth": 6,
  "root_nodes": 3
}
```

---

### Demo Data

#### `POST /demo/init`
Initialize demo conversation data (quantum computing and transistors examples).

**Response:** `200 OK`
```json
{
  "message": "Demo data initialized successfully"
}
```

or if data already exists:
```json
{
  "message": "Demo data already exists"
}
```

---

## Error Responses

All endpoints may return these error responses:

### `404 Not Found`
```json
{
  "detail": "Node not found"
}
```

### `422 Unprocessable Entity`
```json
{
  "detail": [
    {
      "loc": ["body", "content"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

### `500 Internal Server Error`
```json
{
  "detail": "Internal server error"
}
```

---

## CORS

The API accepts requests from:
- `http://localhost:3000`
- `http://localhost:5173`

For production, update the CORS settings in `backend/main.py`.

---

## Rate Limiting

Currently, no rate limiting is implemented. For production use, consider adding rate limiting middleware.

---

## WebSocket Support

WebSockets are not currently implemented. For real-time updates, clients should poll the relevant endpoints or implement WebSocket support.

---

## Examples

### Create a root conversation
```bash
curl -X POST http://localhost:8000/nodes/ \
  -H "Content-Type: application/json" \
  -d '{"content": "Hello, world!", "author": "Alice"}'
```

### Reply to a message
```bash
curl -X POST http://localhost:8000/nodes/ \
  -H "Content-Type: application/json" \
  -d '{"parent_id": 1, "content": "Hi Alice!", "author": "Bob"}'
```

### Get all root conversations
```bash
curl http://localhost:8000/nodes/roots
```

### Get a conversation tree
```bash
curl http://localhost:8000/nodes/1/tree
```

### Delete a branch
```bash
curl -X DELETE "http://localhost:8000/nodes/5?delete_subtree=true"
```

### Get tree statistics
```bash
curl http://localhost:8000/tree/stats
```
