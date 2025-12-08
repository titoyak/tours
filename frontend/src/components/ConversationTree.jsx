import React, { useState, useEffect } from 'react';
import { conversationApi } from '../api';
import './ConversationTree.css';

function ConversationTree({ node, currentPath, onSelectNode, onDeleteNode, onCreateMessage }) {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadChildren();
  }, [node]);

  const loadChildren = async () => {
    if (!node) return;
    
    try {
      setLoading(true);
      const response = await conversationApi.getNodeChildren(node.id);
      setChildren(response.data);
    } catch (err) {
      console.error('Error loading children:', err);
    } finally {
      setLoading(false);
    }
  };

  const isInCurrentPath = (nodeId) => {
    return currentPath.some(n => n.id === nodeId);
  };

  return (
    <div className="conversation-tree">
      <div className={`conversation-node ${isInCurrentPath(node.id) ? 'in-path' : ''}`}>
        <div className="node-header">
          <span className="node-author">{node.author}</span>
          <span className="node-time">
            {new Date(node.created_at).toLocaleString()}
          </span>
        </div>
        <div className="node-content">
          {node.content}
        </div>
        <div className="node-actions">
          <button
            onClick={() => onDeleteNode(node.id, false)}
            className="btn-danger-small"
            title="Delete this message only"
          >
            Delete Message
          </button>
          {node.children_count > 0 && (
            <button
              onClick={() => onDeleteNode(node.id, true)}
              className="btn-danger-small"
              title="Delete this message and all replies"
            >
              Delete Branch
            </button>
          )}
          <span className="node-info">
            {node.children_count > 0 && `${node.children_count} ${node.children_count === 1 ? 'reply' : 'replies'}`}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="loading-children">Loading replies...</div>
      ) : children.length > 0 ? (
        <div className="children-container">
          <div className="children-label">
            {children.length} {children.length === 1 ? 'Branch' : 'Branches'}:
          </div>
          <div className="children-list">
            {children.map((child) => (
              <div
                key={child.id}
                className={`child-node ${isInCurrentPath(child.id) ? 'in-path' : ''}`}
                onClick={() => onSelectNode(child)}
              >
                <div className="child-header">
                  <span className="child-author">{child.author}</span>
                  <span className="child-time">
                    {new Date(child.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="child-content">
                  {child.content.substring(0, 150)}
                  {child.content.length > 150 ? '...' : ''}
                </div>
                {child.children_count > 0 && (
                  <div className="child-badge">
                    {child.children_count} more {child.children_count === 1 ? 'reply' : 'replies'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="no-children">
          No replies yet. Use the input below to add a reply or branch off.
        </div>
      )}
    </div>
  );
}

export default ConversationTree;
