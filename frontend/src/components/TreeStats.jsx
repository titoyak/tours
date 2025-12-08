import React from 'react';
import './TreeStats.css';

function TreeStats({ stats }) {
  return (
    <div className="tree-stats">
      <div className="stat-item">
        <span className="stat-label">Nodes:</span>
        <span className="stat-value">{stats.total_nodes}</span>
      </div>
      <div className="stat-item">
        <span className="stat-label">Branches:</span>
        <span className="stat-value">{stats.total_branches}</span>
      </div>
      <div className="stat-item">
        <span className="stat-label">Depth:</span>
        <span className="stat-value">{stats.max_depth}</span>
      </div>
      <div className="stat-item">
        <span className="stat-label">Roots:</span>
        <span className="stat-value">{stats.root_nodes}</span>
      </div>
    </div>
  );
}

export default TreeStats;
