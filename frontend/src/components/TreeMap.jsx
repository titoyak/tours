import React from 'react';
import './TreeMap.css';

function TreeMapNode({ node, depth = 0, selectedNodeId, onSelectNode }) {
  const isSelected = node.id === selectedNodeId;
  const hasChildren = node.children && node.children.length > 0;
  
  return (
    <div className="treemap-node">
      <div
        className={`treemap-item ${isSelected ? 'selected' : ''}`}
        style={{ paddingLeft: `${depth * 15}px` }}
        onClick={() => onSelectNode(node.id)}
      >
        <span className="node-icon">
          {hasChildren ? '📁' : '📄'}
        </span>
        <span className="node-role">
          {node.role === 'user' ? '👤' : '🤖'}
        </span>
        <span className="node-preview">
          {node.content.substring(0, 30)}
          {node.content.length > 30 ? '...' : ''}
        </span>
      </div>
      {hasChildren && (
        <div className="treemap-children">
          {node.children.map((child) => (
            <TreeMapNode
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedNodeId={selectedNodeId}
              onSelectNode={onSelectNode}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TreeMap({ trees, selectedNodeId, onSelectNode }) {
  if (!trees || trees.length === 0) {
    return (
      <div className="tree-map">
        <h3>Navigation</h3>
        <div className="treemap-empty">No conversations</div>
      </div>
    );
  }

  return (
    <div className="tree-map">
      <h3>🗺️ Navigation</h3>
      <div className="treemap-content">
        {trees.map((tree) => (
          <TreeMapNode
            key={tree.id}
            node={tree}
            selectedNodeId={selectedNodeId}
            onSelectNode={onSelectNode}
          />
        ))}
      </div>
    </div>
  );
}

export default TreeMap;
