/**
 * ConversationNode - Represents a single message node in the conversation tree
 */
class ConversationNode {
    constructor(content, id = null, parent = null) {
        this.id = id || this.generateId();
        this.content = content;
        this.parent = parent;
        this.children = [];
        this.timestamp = new Date();
        this.isMainThread = parent === null || (parent && parent.isMainThread);
    }

    generateId() {
        return `msg-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }

    /**
     * Add a child node (branch) to this message
     */
    addChild(content) {
        const child = new ConversationNode(content, null, this);
        child.isMainThread = false; // Branches are not main thread
        this.children.push(child);
        return child;
    }

    /**
     * Remove this node from its parent's children
     */
    remove() {
        if (this.parent) {
            this.parent.children = this.parent.children.filter(child => child.id !== this.id);
            return true;
        }
        return false;
    }

    /**
     * Get all ancestors of this node (path to root)
     */
    getAncestors() {
        const ancestors = [];
        let current = this.parent;
        while (current) {
            ancestors.unshift(current);
            current = current.parent;
        }
        return ancestors;
    }

    /**
     * Get the depth of this node in the tree
     */
    getDepth() {
        let depth = 0;
        let current = this.parent;
        while (current) {
            depth++;
            current = current.parent;
        }
        return depth;
    }

    /**
     * Check if this node is an ancestor of another node
     */
    isAncestorOf(node) {
        let current = node.parent;
        while (current) {
            if (current.id === this.id) {
                return true;
            }
            current = current.parent;
        }
        return false;
    }
}

/**
 * ConversationTree - Manages the entire conversation tree structure
 */
class ConversationTree {
    constructor() {
        this.root = null;
        this.currentNode = null;
        this.nodeMap = new Map(); // For quick node lookup by ID
    }

    /**
     * Initialize the tree with a root message
     */
    initialize(content) {
        this.root = new ConversationNode(content);
        this.root.isMainThread = true;
        this.currentNode = this.root;
        this.nodeMap.set(this.root.id, this.root);
        return this.root;
    }

    /**
     * Add a message to the current node
     */
    addMessage(content) {
        if (!this.currentNode) {
            return this.initialize(content);
        }
        
        const newNode = new ConversationNode(content, null, this.currentNode);
        // Continue main thread only if current is main thread and no branches exist
        newNode.isMainThread = this.currentNode.isMainThread && this.currentNode.children.length === 0;
        
        this.currentNode.children.push(newNode);
        this.nodeMap.set(newNode.id, newNode);
        this.currentNode = newNode;
        return newNode;
    }

    /**
     * Create a branch from a specific node
     */
    createBranch(nodeId, content) {
        const node = this.getNode(nodeId);
        if (!node) {
            console.error('Node not found:', nodeId);
            return null;
        }
        
        const branch = node.addChild(content);
        this.nodeMap.set(branch.id, branch);
        this.currentNode = branch;
        return branch;
    }

    /**
     * Navigate to a specific node
     */
    navigateTo(nodeId) {
        const node = this.getNode(nodeId);
        if (node) {
            this.currentNode = node;
            return true;
        }
        return false;
    }

    /**
     * Navigate to parent node
     */
    navigateToParent() {
        if (this.currentNode && this.currentNode.parent) {
            this.currentNode = this.currentNode.parent;
            return true;
        }
        return false;
    }

    /**
     * Return to the main thread (root)
     */
    returnToMain() {
        if (this.root) {
            // Find the last node in the main thread
            let mainNode = this.root;
            while (mainNode.children.length > 0 && mainNode.isMainThread) {
                const mainChild = mainNode.children.find(child => child.isMainThread);
                if (mainChild) {
                    mainNode = mainChild;
                } else {
                    break;
                }
            }
            this.currentNode = mainNode;
            return true;
        }
        return false;
    }

    /**
     * Delete a message and optionally its entire branch
     */
    deleteNode(nodeId, deleteBranch = false) {
        const node = this.getNode(nodeId);
        if (!node || node === this.root) {
            return false; // Cannot delete root
        }

        if (deleteBranch) {
            // Delete the entire branch (node and all descendants)
            this.deleteNodeRecursive(node);
        } else {
            // Delete only this node and promote children to parent
            if (node.parent) {
                node.parent.children = node.parent.children.filter(child => child.id !== node.id);
                // Promote children to parent
                node.children.forEach(child => {
                    child.parent = node.parent;
                    node.parent.children.push(child);
                });
            }
            this.nodeMap.delete(node.id);
        }

        // If current node was deleted, navigate to parent
        if (this.currentNode.id === nodeId || !this.nodeMap.has(this.currentNode.id)) {
            this.currentNode = node.parent || this.root;
        }

        return true;
    }

    /**
     * Recursively delete a node and all its descendants
     */
    deleteNodeRecursive(node) {
        // Delete all children first
        node.children.forEach(child => {
            this.deleteNodeRecursive(child);
        });
        
        // Remove from parent
        if (node.parent) {
            node.parent.children = node.parent.children.filter(child => child.id !== node.id);
        }
        
        // Remove from map
        this.nodeMap.delete(node.id);
    }

    /**
     * Get a node by its ID
     */
    getNode(nodeId) {
        return this.nodeMap.get(nodeId);
    }

    /**
     * Get the breadcrumb path to current node
     */
    getBreadcrumb() {
        if (!this.currentNode) return [];
        
        const path = this.currentNode.getAncestors();
        path.push(this.currentNode);
        return path;
    }

    /**
     * Get a visual representation of the tree for the map
     */
    getTreeMap() {
        if (!this.root) return '';
        
        const lines = [];
        this.buildTreeLines(this.root, '', true, lines);
        return lines.join('\n');
    }

    /**
     * Recursively build tree visualization lines
     */
    buildTreeLines(node, prefix, isLast, lines) {
        const isCurrent = node.id === this.currentNode.id;
        const isMain = node.isMainThread;
        
        let marker = '⚪';
        if (isCurrent) marker = '🟢';
        else if (isMain) marker = '🔵';
        
        const connector = isLast ? '└─ ' : '├─ ';
        const line = prefix + connector + marker + ' ' + this.truncate(node.content, 40);
        lines.push({ text: line, nodeId: node.id, isCurrent });
        
        const childPrefix = prefix + (isLast ? '   ' : '│  ');
        node.children.forEach((child, index) => {
            const childIsLast = index === node.children.length - 1;
            this.buildTreeLines(child, childPrefix, childIsLast, lines);
        });
    }

    /**
     * Truncate text for display
     */
    truncate(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - 3) + '...';
    }

    /**
     * Get statistics about the tree
     */
    getStats() {
        return {
            totalNodes: this.nodeMap.size,
            depth: this.getMaxDepth(),
            branches: this.countBranches()
        };
    }

    /**
     * Get the maximum depth of the tree
     */
    getMaxDepth() {
        if (!this.root) return 0;
        return this.getMaxDepthRecursive(this.root);
    }

    getMaxDepthRecursive(node) {
        if (node.children.length === 0) return 0;
        return 1 + Math.max(...node.children.map(child => this.getMaxDepthRecursive(child)));
    }

    /**
     * Count the number of branches (nodes with multiple children)
     */
    countBranches() {
        let count = 0;
        this.nodeMap.forEach(node => {
            if (node.children.length > 1) count++;
        });
        return count;
    }

    /**
     * Export tree as JSON
     */
    toJSON() {
        const nodeToJSON = (node) => {
            return {
                id: node.id,
                content: node.content,
                timestamp: node.timestamp,
                isMainThread: node.isMainThread,
                children: node.children.map(child => nodeToJSON(child))
            };
        };
        
        return this.root ? nodeToJSON(this.root) : null;
    }

    /**
     * Import tree from JSON
     */
    fromJSON(data) {
        this.nodeMap.clear();
        
        const jsonToNode = (data, parent = null) => {
            const node = new ConversationNode(data.content, data.id, parent);
            node.timestamp = new Date(data.timestamp);
            node.isMainThread = data.isMainThread;
            this.nodeMap.set(node.id, node);
            
            if (data.children) {
                node.children = data.children.map(childData => jsonToNode(childData, node));
            }
            
            return node;
        };
        
        this.root = jsonToNode(data);
        this.currentNode = this.root;
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ConversationNode, ConversationTree };
}
