import React, { useState, useEffect } from 'react';
import { conversationApi } from './api';
import ConversationTree from './components/ConversationTree';
import TreeMap from './components/TreeMap';
import MessageInput from './components/MessageInput';
import TreeStats from './components/TreeStats';
import './App.css';

function App() {
  const [trees, setTrees] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [currentPath, setCurrentPath] = useState([]);
  const [showMap, setShowMap] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTrees();
    loadStats();
  }, []);

  useEffect(() => {
    if (selectedNode) {
      loadPath(selectedNode.id);
    }
  }, [selectedNode]);

  const loadTrees = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await conversationApi.getFullTree();
      setTrees(response.data);
    } catch (err) {
      console.error('Error loading trees:', err);
      setError('Failed to load conversation trees. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await conversationApi.getTreeStats();
      setStats(response.data);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const loadPath = async (nodeId) => {
    try {
      const response = await conversationApi.getNodePath(nodeId);
      setCurrentPath(response.data.nodes);
    } catch (err) {
      console.error('Error loading path:', err);
    }
  };

  const handleSelectNode = (node) => {
    setSelectedNode(node);
  };

  const handleCreateMessage = async (content, author, parentId = null) => {
    try {
      await conversationApi.createNode({
        content,
        author,
        parent_id: parentId,
      });
      await loadTrees();
      await loadStats();
    } catch (err) {
      console.error('Error creating message:', err);
      alert('Failed to create message');
    }
  };

  const handleDeleteNode = async (nodeId, deleteSubtree = false) => {
    if (!confirm(`Are you sure you want to delete this ${deleteSubtree ? 'branch' : 'message'}?`)) {
      return;
    }
    
    try {
      await conversationApi.deleteNode(nodeId, deleteSubtree);
      if (selectedNode && selectedNode.id === nodeId) {
        setSelectedNode(null);
        setCurrentPath([]);
      }
      await loadTrees();
      await loadStats();
    } catch (err) {
      console.error('Error deleting node:', err);
      alert('Failed to delete node');
    }
  };

  const handleInitDemo = async () => {
    try {
      await conversationApi.initializeDemoData();
      await loadTrees();
      await loadStats();
      alert('Demo data initialized successfully!');
    } catch (err) {
      console.error('Error initializing demo:', err);
      alert('Failed to initialize demo data');
    }
  };

  const handleNavigateToRoot = () => {
    if (currentPath.length > 0) {
      setSelectedNode(currentPath[0]);
    }
  };

  const handleNavigateUp = () => {
    if (currentPath.length > 1) {
      setSelectedNode(currentPath[currentPath.length - 2]);
    }
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading">Loading conversation trees...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <div className="error-container">
          <h2>Connection Error</h2>
          <p>{error}</p>
          <p>Please ensure:</p>
          <ul>
            <li>PostgreSQL is running</li>
            <li>Backend server is running (python backend/main.py)</li>
            <li>Database is created (conversation_tree)</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🌳 Conversation Tree</h1>
        <div className="header-actions">
          {stats && <TreeStats stats={stats} />}
          <button onClick={() => setShowMap(!showMap)} className="btn-secondary">
            {showMap ? 'Hide Map' : 'Show Map'}
          </button>
          {trees.length === 0 && (
            <button onClick={handleInitDemo} className="btn-primary">
              Load Demo Data
            </button>
          )}
        </div>
      </header>

      {showMap && (
        <TreeMap
          trees={trees}
          selectedNode={selectedNode}
          onSelectNode={handleSelectNode}
          onClose={() => setShowMap(false)}
        />
      )}

      <div className="app-content">
        <div className="sidebar">
          <h2>Conversation Threads</h2>
          {trees.length === 0 ? (
            <div className="empty-state">
              <p>No conversations yet.</p>
              <button onClick={handleInitDemo} className="btn-primary">
                Load Demo Data
              </button>
            </div>
          ) : (
            <div className="tree-list">
              {trees.map((tree) => (
                <div
                  key={tree.id}
                  className={`tree-item ${selectedNode?.id === tree.id ? 'active' : ''}`}
                  onClick={() => handleSelectNode(tree)}
                >
                  <div className="tree-item-content">
                    {tree.content.substring(0, 60)}
                    {tree.content.length > 60 ? '...' : ''}
                  </div>
                  <div className="tree-item-meta">
                    By {tree.author}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="main-content">
          {selectedNode ? (
            <>
              <div className="breadcrumb">
                {currentPath.length > 1 && (
                  <>
                    <button onClick={handleNavigateToRoot} className="breadcrumb-btn">
                      Root
                    </button>
                    <span className="breadcrumb-separator">›</span>
                    <button onClick={handleNavigateUp} className="breadcrumb-btn">
                      Back
                    </button>
                    <span className="breadcrumb-separator">›</span>
                    <span>Node {selectedNode.id}</span>
                  </>
                )}
              </div>
              
              <ConversationTree
                node={selectedNode}
                currentPath={currentPath}
                onSelectNode={handleSelectNode}
                onDeleteNode={handleDeleteNode}
                onCreateMessage={handleCreateMessage}
              />
            </>
          ) : (
            <div className="empty-selection">
              <h2>Select a conversation thread to begin</h2>
              <p>Click on a conversation from the sidebar or create a new root message below.</p>
            </div>
          )}

          <MessageInput
            onSubmit={(content, author) => handleCreateMessage(content, author, selectedNode?.id)}
            placeholder={selectedNode ? "Reply or branch off..." : "Start a new conversation thread..."}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
