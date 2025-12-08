import React, { useState, useEffect } from 'react';
import ConversationTree from './components/ConversationTree';
import MessageInput from './components/MessageInput';
import TreeMap from './components/TreeMap';
import TreeStats from './components/TreeStats';
import './App.css';

function App() {
  const [trees, setTrees] = useState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [currentPath, setCurrentPath] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE = '/api';

  // Load conversation trees
  const loadTrees = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/roots`);
      if (!response.ok) throw new Error('Failed to fetch trees');
      const data = await response.json();
      setTrees(data);
      
      // Select first node if available
      if (data.length > 0 && !selectedNodeId) {
        setSelectedNodeId(data[0].id);
        loadPath(data[0].id);
      }
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error loading trees:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load path to selected node
  const loadPath = async (nodeId) => {
    try {
      const response = await fetch(`${API_BASE}/path/${nodeId}`);
      if (!response.ok) throw new Error('Failed to fetch path');
      const data = await response.json();
      setCurrentPath(data.path);
    } catch (err) {
      console.error('Error loading path:', err);
    }
  };

  useEffect(() => {
    loadTrees();
  }, []);

  useEffect(() => {
    if (selectedNodeId) {
      loadPath(selectedNodeId);
    }
  }, [selectedNodeId]);

  // Add a new message
  const handleAddMessage = async (content, role, parentId) => {
    try {
      const response = await fetch(`${API_BASE}/nodes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          role,
          parent_id: parentId,
        }),
      });

      if (!response.ok) throw new Error('Failed to add message');
      
      const newNode = await response.json();
      await loadTrees();
      setSelectedNodeId(newNode.id);
      return newNode;
    } catch (err) {
      console.error('Error adding message:', err);
      throw err;
    }
  };

  // Delete a node and its descendants
  const handleDeleteNode = async (nodeId) => {
    if (!confirm('Are you sure you want to delete this node and all its children?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/nodes/${nodeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete node');
      
      await loadTrees();
      
      // Reset selection if deleted node was selected
      if (selectedNodeId === nodeId) {
        setSelectedNodeId(trees.length > 0 ? trees[0].id : null);
      }
    } catch (err) {
      console.error('Error deleting node:', err);
      alert('Failed to delete node: ' + err.message);
    }
  };

  // Initialize demo data
  const handleInitDemoData = async () => {
    try {
      const response = await fetch(`${API_BASE}/demo-data`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to initialize demo data');
      
      await loadTrees();
    } catch (err) {
      console.error('Error initializing demo data:', err);
      alert('Failed to initialize demo data: ' + err.message);
    }
  };

  // Select a node
  const handleSelectNode = (nodeId) => {
    setSelectedNodeId(nodeId);
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading">Loading conversations...</div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🌳 Branching Conversations</h1>
        <p>Explore conversations in a tree structure - branch off at any point!</p>
        <button onClick={handleInitDemoData} className="demo-button">
          Load Demo Data
        </button>
      </header>

      {error && (
        <div className="error-banner">
          Error: {error}
        </div>
      )}

      <div className="app-container">
        <div className="main-content">
          <ConversationTree
            trees={trees}
            selectedNodeId={selectedNodeId}
            onSelectNode={handleSelectNode}
            onDeleteNode={handleDeleteNode}
            currentPath={currentPath}
          />

          <MessageInput
            selectedNodeId={selectedNodeId}
            onAddMessage={handleAddMessage}
          />
        </div>

        <aside className="sidebar">
          <TreeMap
            trees={trees}
            selectedNodeId={selectedNodeId}
            onSelectNode={handleSelectNode}
          />
          
          <TreeStats trees={trees} />
        </aside>
      </div>
    </div>
  );
}

export default App;
