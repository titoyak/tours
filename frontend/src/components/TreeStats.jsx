import React from 'react';
import './TreeStats.css';

function TreeStats({ trees }) {
  const calculateStats = () => {
    let totalNodes = 0;
    let maxDepth = 0;
    let totalBranches = 0;

    const traverse = (node, depth = 0) => {
      totalNodes++;
      maxDepth = Math.max(maxDepth, depth);
      
      if (node.children && node.children.length > 0) {
        if (node.children.length > 1) {
          totalBranches += node.children.length - 1;
        }
        node.children.forEach(child => traverse(child, depth + 1));
      }
    };

    trees.forEach(tree => traverse(tree));

    return { totalNodes, maxDepth, totalBranches };
  };

  const stats = calculateStats();

  return (
    <div className="tree-stats">
      <h3>📊 Statistics</h3>
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-value">{stats.totalNodes}</div>
          <div className="stat-label">Total Nodes</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{stats.maxDepth}</div>
          <div className="stat-label">Max Depth</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{stats.totalBranches}</div>
          <div className="stat-label">Branches</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{trees.length}</div>
          <div className="stat-label">Root Conversations</div>
        </div>
      </div>
    </div>
  );
}

export default TreeStats;
