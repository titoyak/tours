/**
 * Application logic for the Conversation Tree Chat System
 */

// Initialize the conversation tree
const tree = new ConversationTree();

// DOM elements
const chatContainer = document.getElementById('chatContainer');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const returnToMainBtn = document.getElementById('returnToMainBtn');
const breadcrumb = document.getElementById('breadcrumb');
const treeLegend = document.getElementById('treeLegend');

/**
 * Initialize the app with demo data
 */
function initializeApp() {
    // Create initial conversation about semiconductors
    tree.initialize("What are semiconductors?");
    tree.addMessage("Semiconductors are materials that have electrical conductivity between conductors and insulators. They're fundamental to modern electronics.");
    tree.addMessage("Can you explain how they work in computer chips?");
    tree.addMessage("In computer chips, semiconductors like silicon are used to create transistors - tiny switches that can be turned on or off to represent binary data (0s and 1s).");
    
    // Create a branch about transistors
    const transistorBranchParent = tree.currentNode.id;
    tree.createBranch(transistorBranchParent, "What exactly is a transistor?");
    tree.addMessage("A transistor is a semiconductor device that can amplify or switch electrical signals. It's the basic building block of modern electronics.");
    tree.addMessage("How many transistors are in a modern CPU?");
    tree.addMessage("Modern CPUs can contain billions of transistors! For example, AMD's latest chips have over 50 billion transistors.");
    
    // Go back and create another branch about doping
    const mainThread = Array.from(tree.nodeMap.values()).find(node => 
        node.content.includes("silicon are used to create transistors")
    );
    if (mainThread) {
        tree.createBranch(mainThread.id, "What is doping in semiconductors?");
        tree.addMessage("Doping is the process of adding impurities to pure semiconductors to modify their electrical properties. This creates n-type or p-type semiconductors.");
        tree.addMessage("What's the difference between n-type and p-type?");
    }
    
    // Return to main thread
    tree.returnToMain();
    
    // Render initial state
    renderChat();
    renderBreadcrumb();
    renderTreeMap();
}

/**
 * Render the chat messages
 */
function renderChat() {
    chatContainer.innerHTML = '';
    
    if (!tree.currentNode) {
        chatContainer.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">No messages yet. Start a conversation!</p>';
        return;
    }
    
    // Get the path from root to current node
    const path = tree.getBreadcrumb();
    
    // Render each message in the path
    path.forEach((node, index) => {
        const messageDiv = createMessageElement(node, index === path.length - 1);
        chatContainer.appendChild(messageDiv);
    });
    
    // Scroll to bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

/**
 * Create a message element
 */
function createMessageElement(node, isLast) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    messageDiv.dataset.nodeId = node.id;
    
    // Message header
    const headerDiv = document.createElement('div');
    headerDiv.className = 'message-header';
    
    const infoDiv = document.createElement('div');
    infoDiv.className = 'message-info';
    
    const idSpan = document.createElement('span');
    idSpan.className = 'message-id';
    idSpan.textContent = `#${node.id.substring(4, 12)}`;
    infoDiv.appendChild(idSpan);
    
    if (node.isMainThread) {
        const threadSpan = document.createElement('span');
        threadSpan.className = 'branch-indicator';
        threadSpan.textContent = '🔵 Main Thread';
        infoDiv.appendChild(threadSpan);
    }
    
    headerDiv.appendChild(infoDiv);
    
    // Message actions
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'message-actions';
    
    // Branch button
    const branchBtn = document.createElement('button');
    branchBtn.className = 'btn-icon';
    branchBtn.innerHTML = '🌿';
    branchBtn.title = 'Create branch from this message';
    branchBtn.onclick = () => createBranchPrompt(node.id);
    actionsDiv.appendChild(branchBtn);
    
    // Delete button (don't show for root)
    if (node !== tree.root) {
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-icon delete';
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.title = 'Delete this message';
        deleteBtn.onclick = () => deleteMessage(node.id);
        actionsDiv.appendChild(deleteBtn);
        
        // Delete branch button (only if has children)
        if (node.children.length > 0) {
            const deleteBranchBtn = document.createElement('button');
            deleteBranchBtn.className = 'btn-icon delete';
            deleteBranchBtn.innerHTML = '🗑️🌿';
            deleteBranchBtn.title = 'Delete entire branch';
            deleteBranchBtn.onclick = () => deleteBranch(node.id);
            actionsDiv.appendChild(deleteBranchBtn);
        }
    }
    
    headerDiv.appendChild(actionsDiv);
    messageDiv.appendChild(headerDiv);
    
    // Message content
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = node.content;
    messageDiv.appendChild(contentDiv);
    
    // Show child branches if this is the last message or we're viewing it
    if (isLast && node.children.length > 0) {
        const childrenDiv = document.createElement('div');
        childrenDiv.className = 'message-children';
        
        const branchesLabel = document.createElement('p');
        branchesLabel.style.marginBottom = '10px';
        branchesLabel.style.fontWeight = 'bold';
        branchesLabel.style.color = '#666';
        branchesLabel.textContent = `💬 ${node.children.length} branch${node.children.length > 1 ? 'es' : ''} from this point:`;
        childrenDiv.appendChild(branchesLabel);
        
        const branchesDiv = document.createElement('div');
        branchesDiv.className = 'child-branches';
        
        node.children.forEach(child => {
            const branchLink = document.createElement('div');
            branchLink.className = 'branch-link';
            branchLink.innerHTML = `🌿 ${tree.truncate(child.content, 50)}`;
            branchLink.onclick = () => navigateToBranch(child.id);
            branchesDiv.appendChild(branchLink);
        });
        
        childrenDiv.appendChild(branchesDiv);
        messageDiv.appendChild(childrenDiv);
    }
    
    return messageDiv;
}

/**
 * Render breadcrumb navigation
 */
function renderBreadcrumb() {
    const path = tree.getBreadcrumb();
    
    if (path.length === 0) {
        breadcrumb.innerHTML = '<span style="color: #999;">No conversation yet</span>';
        return;
    }
    
    const pathDiv = document.createElement('div');
    pathDiv.className = 'breadcrumb-path';
    
    pathDiv.innerHTML = '<span style="margin-right: 10px;">📍 You are here:</span>';
    
    path.forEach((node, index) => {
        if (index > 0) {
            const separator = document.createElement('span');
            separator.className = 'breadcrumb-separator';
            separator.textContent = '→';
            pathDiv.appendChild(separator);
        }
        
        const item = document.createElement('span');
        item.className = 'breadcrumb-item';
        item.textContent = tree.truncate(node.content, 30);
        item.onclick = () => navigateTo(node.id);
        
        if (index === path.length - 1) {
            item.style.fontWeight = 'bold';
            item.style.background = '#e8f5e9';
        }
        
        pathDiv.appendChild(item);
    });
    
    breadcrumb.innerHTML = '';
    breadcrumb.appendChild(pathDiv);
}

/**
 * Render the tree map
 */
function renderTreeMap() {
    const lines = [];
    if (tree.root) {
        tree.buildTreeLines(tree.root, '', true, lines);
    }
    
    treeLegend.innerHTML = '';
    
    if (lines.length === 0) {
        treeLegend.innerHTML = '<p style="color: #999;">No conversation yet</p>';
        return;
    }
    
    lines.forEach(({ text, nodeId, isCurrent }) => {
        const lineDiv = document.createElement('div');
        lineDiv.className = 'tree-node' + (isCurrent ? ' current' : '');
        lineDiv.textContent = text;
        lineDiv.onclick = () => navigateTo(nodeId);
        treeLegend.appendChild(lineDiv);
    });
}

/**
 * Send a new message
 */
function sendMessage() {
    const content = messageInput.value.trim();
    if (!content) return;
    
    tree.addMessage(content);
    messageInput.value = '';
    
    renderChat();
    renderBreadcrumb();
    renderTreeMap();
}

/**
 * Create a branch from a specific message
 */
function createBranchPrompt(nodeId) {
    const content = prompt('Enter your branching question or comment:');
    if (!content) return;
    
    tree.createBranch(nodeId, content);
    
    renderChat();
    renderBreadcrumb();
    renderTreeMap();
}

/**
 * Navigate to a specific node
 */
function navigateTo(nodeId) {
    tree.navigateTo(nodeId);
    renderChat();
    renderBreadcrumb();
}

/**
 * Navigate to a branch
 */
function navigateToBranch(nodeId) {
    tree.navigateTo(nodeId);
    renderChat();
    renderBreadcrumb();
}

/**
 * Return to main thread
 */
function returnToMain() {
    tree.returnToMain();
    renderChat();
    renderBreadcrumb();
}

/**
 * Delete a message
 */
function deleteMessage(nodeId) {
    const node = tree.getNode(nodeId);
    if (!node) return;
    
    const confirmMsg = node.children.length > 0
        ? `Delete this message? Its ${node.children.length} child branch${node.children.length > 1 ? 'es' : ''} will be preserved and moved up.`
        : 'Delete this message?';
    
    if (!confirm(confirmMsg)) return;
    
    tree.deleteNode(nodeId, false);
    renderChat();
    renderBreadcrumb();
    renderTreeMap();
}

/**
 * Delete entire branch
 */
function deleteBranch(nodeId) {
    const node = tree.getNode(nodeId);
    if (!node) return;
    
    const count = countDescendants(node);
    const confirmMsg = `Delete this message and its entire branch (${count} message${count > 1 ? 's' : ''})? This cannot be undone.`;
    
    if (!confirm(confirmMsg)) return;
    
    tree.deleteNode(nodeId, true);
    renderChat();
    renderBreadcrumb();
    renderTreeMap();
}

/**
 * Count descendants of a node
 */
function countDescendants(node) {
    let count = 0;
    node.children.forEach(child => {
        count += 1 + countDescendants(child);
    });
    return count;
}

// Event listeners
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
returnToMainBtn.addEventListener('click', returnToMain);

// Initialize the app when page loads
window.addEventListener('DOMContentLoaded', initializeApp);
