import React, { useState } from 'react';
import './MessageInput.css';

function MessageInput({ onSubmit, placeholder = "Type your message..." }) {
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('User');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      alert('Please enter a message');
      return;
    }

    onSubmit(content.trim(), author);
    setContent('');
  };

  return (
    <div className="message-input-container">
      <form onSubmit={handleSubmit} className="message-input-form">
        <div className="input-row">
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Your name"
            className="author-input"
          />
        </div>
        <div className="input-row">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            className="content-input"
            rows="3"
          />
        </div>
        <div className="input-actions">
          <button type="submit" className="btn-primary">
            Send Message
          </button>
        </div>
      </form>
    </div>
  );
}

export default MessageInput;
