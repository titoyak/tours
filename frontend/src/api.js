import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const conversationApi = {
  // Node operations
  createNode: (data) => api.post('/nodes/', data),
  getAllNodes: (includeDeleted = false) => api.get('/nodes/', { params: { include_deleted: includeDeleted } }),
  getRootNodes: () => api.get('/nodes/roots'),
  getNode: (nodeId) => api.get(`/nodes/${nodeId}`),
  getNodeTree: (nodeId) => api.get(`/nodes/${nodeId}/tree`),
  getNodePath: (nodeId) => api.get(`/nodes/${nodeId}/path`),
  getNodeChildren: (nodeId) => api.get(`/nodes/${nodeId}/children`),
  updateNode: (nodeId, data) => api.put(`/nodes/${nodeId}`, data),
  deleteNode: (nodeId, deleteSubtree = false) => api.delete(`/nodes/${nodeId}`, { params: { delete_subtree: deleteSubtree } }),
  
  // Tree operations
  getFullTree: () => api.get('/tree/full'),
  getTreeStats: () => api.get('/tree/stats'),
  
  // Demo data
  initializeDemoData: () => api.post('/demo/init'),
};

export default api;
