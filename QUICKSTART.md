# Conversation Tree System - Quick Start Guide

## What is it?

Conversation Tree is a chat system that lets you branch off from any message to explore related topics without losing track of the main conversation. Think of it like having multiple "what if" discussions from any point in your chat.

## Key Features

### 1. Branching Conversations
- Click on any message to view it and its replies
- Reply to create a new branch in the conversation
- Multiple people can branch off the same message

### 2. Easy Navigation
- **Breadcrumbs**: See your path and jump back to any point
- **Show Map**: Get a bird's-eye view of all conversations
- **Sidebar**: Quick access to all conversation roots

### 3. Tree Management
- **Delete Message**: Remove a single message
- **Delete Branch**: Remove a message and all its descendants
- **Stats**: See total nodes, branches, depth, and roots

## Example Use Cases

### Research
You're discussing quantum computing:
- Main thread: "What is quantum computing?"
- Branch 1: Deep dive into qubits
  - Sub-branch: Explain superposition
  - Sub-branch: Quantum entanglement
- Branch 2: Practical applications
  - Sub-branch: Cryptography details
  - Sub-branch: Drug discovery

### Debugging
Exploring a bug:
- Main thread: "App crashes on startup"
- Branch 1: Check memory issues
  - Test with different heap sizes
  - Profile memory usage
- Branch 2: Check dependencies
  - Verify library versions
  - Test with minimal dependencies

### Learning
Understanding transistors:
- Main thread: "How do transistors work?"
- Branch 1: What is doping?
  - N-type vs P-type
- Branch 2: Practical circuit design
  - Logic gates
  - Amplification

## How to Use

### Starting Fresh
1. Open the app at http://localhost:3000
2. Click "Load Demo Data" to see examples
3. Browse the conversations in the sidebar

### Creating Conversations
1. To start a new conversation: Make sure no node is selected, then type your message
2. To reply/branch: Select a message first, then type your reply

### Navigating
- Click any message card to drill down
- Use "Root" to jump to the beginning
- Use "Back" to go up one level
- Click "Show Map" for a complete overview

### Managing
- Each message has "Delete Message" and "Delete Branch" buttons
- Deleted items are soft-deleted (marked, not removed from database)
- Statistics update in real-time

## Visual Guide

```
Root Message: "Explain quantum computing"
│
├─ Reply 1: "It uses qubits and superposition"
│  │
│  ├─ Branch 1.1: "What is a qubit?"
│  │  └─ Reply: "A quantum bit that can be 0, 1, or both"
│  │
│  └─ Branch 1.2: "What are the applications?"
│     └─ Reply: "Cryptography, drug discovery, optimization"
│
└─ Reply 2: "Here's a simple analogy..."
   └─ Reply: "Thanks, that helps!"
```

## Tips

1. **Stay Organized**: Use descriptive messages so branches are easy to identify
2. **Use the Map**: When conversations get complex, the map view helps you orient
3. **Try Demo Data**: The included examples show best practices
4. **Delete Wisely**: "Delete Branch" removes everything below, use carefully
5. **Author Names**: Use clear author names to track who said what

## Technical Notes

- Messages are stored in a PostgreSQL database
- The tree structure uses self-referential foreign keys
- React frontend provides real-time updates
- RESTful API for easy integration

## Troubleshooting

**Can't connect to backend?**
- Make sure backend is running on port 8000
- Check PostgreSQL is running
- Verify database 'conversation_tree' exists

**Frontend won't start?**
- Run `npm install` in the frontend directory
- Check Node.js is version 16+

**No data showing?**
- Click "Load Demo Data" to populate examples
- Check browser console for errors
- Verify backend API is accessible

## Next Steps

- Explore the demo conversations
- Create your own branching discussions
- Try the map view with complex trees
- Experiment with delete operations
- Check the API documentation in README.md
