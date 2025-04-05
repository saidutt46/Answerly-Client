import React from 'react';

const EmptyState: React.FC = () => {
  return (
    <div className="chat-empty-state">
      <div className="empty-icon">💬</div>
      <h3>No questions yet</h3>
      <p>Upload a document or enter text, then ask a question to get started.</p>
      <div className="empty-suggestions">
        <p>Try asking questions like:</p>
        <ul>
          <li>"What are the main points of this document?"</li>
          <li>"Summarize the key findings."</li>
          <li>"What does the document say about [specific topic]?"</li>
        </ul>
      </div>
    </div>
  );
};

export default EmptyState;