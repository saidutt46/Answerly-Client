import React from 'react';

const EmptyState: React.FC = () => {
  return (
    <div className="chat-empty-state">
      <div className="empty-icon">💬</div>
      <h3>No questions yet</h3>
      <p>Upload a document or enter text, then ask a question to get started.</p>
      <p className="empty-suggestions">
        Try asking questions like:
        <ul>
          <li>"What are the main points of this document?"</li>
          <li>"Summarize the key findings."</li>
          <li>"What does the document say about [specific topic]?"</li>
        </ul>
      </p>
    </div>
  );
};

export default EmptyState;