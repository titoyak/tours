import React from 'react';
import './ConversationTree.css';

function ConversationNode({ node, isSelected, onSelect, onDelete, depth = 0, isInPath }) {
  const hasChildren = node.children && node.children.length > 0;
  const branchColors = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];
  const color = branchColors[depth % branchColors.length];

  return (
    <div className="node-container">
      <div
        className={`conversation-node ${isSelected ? 'selected' : ''} ${isInPath ? 'in-path' : ''}`}
        style={{ borderLeftColor: color }}
        onClick={() => onSelect(node.id)}
      >
        <div className="node-header">
          <span className={`role-badge ${node.role}`}>
            {node.role === 'user' ? '👤' : '🤖'} {node.role}
          </span>
          <button
            className="delete-button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(node.id);
            }}
            title="Delete this node and all children"
          >
            🗑️
          </button>
        </div>
        <div className="node-content">{node.content}</div>
        <div className="node-meta">
          {node.created_at && (
            <span className="timestamp">
              {new Date(node.created_at).toLocaleString()}
            </span>
          )}
          {hasChildren && (
            <span className="children-count">
              {node.children.length} {node.children.length === 1 ? 'branch' : 'branches'}
            </span>
          )}
        </div>
      </div>

      {hasChildren && (
        <div className="children-container">
          {node.children.map((child, index) => (
            <div key={child.id} className="child-wrapper">
              {node.children.length > 1 && (
                <div className="branch-label" style={{ backgroundColor: branchColors[(depth + 1) % branchColors.length] }}>
                  Branch {index + 1}
                </div>
              )}
              <ConversationNode
                node={child}
                isSelected={isSelected}
                onSelect={onSelect}
                onDelete={onDelete}
                depth={depth + 1}
                isInPath={isInPath}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ConversationTree({ trees, selectedNodeId, onSelectNode, onDeleteNode, currentPath }) {
  const pathIds = currentPath.map(node => node.id);

  if (!trees || trees.length === 0) {
    return (
      <div className="conversation-tree">
        <div className="empty-state">
          <h2>No conversations yet</h2>
          <p>Click "Load Demo Data" to see an example, or start a new conversation below.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="conversation-tree">
      <h2 className="tree-title">Conversation Tree</h2>
      <div className="tree-content">
        {trees.map((tree) => (
          <ConversationNode
            key={tree.id}
            node={tree}
            isSelected={selectedNodeId}
            onSelect={onSelectNode}
            onDelete={onDeleteNode}
            depth={0}
            isInPath={pathIds.includes(tree.id)}
          />
        ))}
      </div>
    </div>
  );
}

export default ConversationTree;
