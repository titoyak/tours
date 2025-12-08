import React from 'react';
import './TreeMap.css';

function TreeMap({ trees, selectedNode, onSelectNode, onClose }) {
  const renderTreeNode = (node, level = 0) => {
    const isSelected = selectedNode && selectedNode.id === node.id;
    
    return (
      <div key={node.id} className="map-node-container">
        <div
          className={`map-node level-${level % 4} ${isSelected ? 'selected' : ''}`}
          onClick={() => onSelectNode(node)}
        >
          <div className="map-node-id">#{node.id}</div>
          <div className="map-node-content">
            {node.content.substring(0, 50)}
            {node.content.length > 50 ? '...' : ''}
          </div>
          <div className="map-node-meta">
            <span>{node.author}</span>
            {node.children && node.children.length > 0 && (
              <span className="map-node-children">
                {node.children.length} {node.children.length === 1 ? 'branch' : 'branches'}
              </span>
            )}
          </div>
        </div>
        {node.children && node.children.length > 0 && (
          <div className="map-children">
            {node.children.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="tree-map-overlay" onClick={onClose}>
      <div className="tree-map-container" onClick={(e) => e.stopPropagation()}>
        <div className="tree-map-header">
          <h2>🗺️ Conversation Map</h2>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>
        <div className="tree-map-content">
          {trees.length === 0 ? (
            <div className="empty-map">No conversations to display</div>
          ) : (
            <div className="tree-map-list">
              {trees.map(tree => renderTreeNode(tree))}
            </div>
          )}
        </div>
        <div className="tree-map-legend">
          <h3>Legend</h3>
          <div className="legend-items">
            <div className="legend-item">
              <div className="legend-color level-0"></div>
              <span>Root / Level 1</span>
            </div>
            <div className="legend-item">
              <div className="legend-color level-1"></div>
              <span>Level 2</span>
            </div>
            <div className="legend-item">
              <div className="legend-color level-2"></div>
              <span>Level 3</span>
            </div>
            <div className="legend-item">
              <div className="legend-color level-3"></div>
              <span>Level 4+</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TreeMap;
