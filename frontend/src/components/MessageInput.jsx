import React, { useState } from 'react';
import './MessageInput.css';

function MessageInput({ selectedNodeId, onAddMessage }) {
  const [content, setContent] = useState('');
  const [role, setRole] = useState('user');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      alert('Please enter a message');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddMessage(content.trim(), role, selectedNodeId);
      setContent('');
    } catch (err) {
      alert('Failed to add message: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="message-input">
      <h3>Add New Message</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="role">Role:</label>
          <div className="role-selector">
            <button
              type="button"
              className={`role-option ${role === 'user' ? 'active' : ''}`}
              onClick={() => setRole('user')}
            >
              👤 User
            </button>
            <button
              type="button"
              className={`role-option ${role === 'assistant' ? 'active' : ''}`}
              onClick={() => setRole('assistant')}
            >
              🤖 Assistant
            </button>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="content">Message:</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              selectedNodeId
                ? 'Enter your message to create a new branch or continue the conversation...'
                : 'Enter your message to start a new conversation...'
            }
            rows={5}
            disabled={isSubmitting}
          />
        </div>

        {selectedNodeId && (
          <div className="info-message">
            💡 This will create a new branch from the selected node
          </div>
        )}

        <button type="submit" className="submit-button" disabled={isSubmitting}>
          {isSubmitting ? 'Adding...' : selectedNodeId ? '🌿 Branch & Add' : '✨ Start Conversation'}
        </button>
      </form>
    </div>
  );
}

export default MessageInput;
