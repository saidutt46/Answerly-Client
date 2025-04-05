// ContextSection/EmptyState.tsx
import React from 'react';
import FileUploader from './FileUploader';

interface EmptyStateProps {
  onFileUpload: (file: File) => void;
  onTextButtonClick: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onFileUpload, onTextButtonClick }) => {
  return (
    <div className="context-empty-state">
      <h3>Add Your Content</h3>
      <p>Upload a document or enter text to get started</p>
      
      <div className="upload-options">
        <FileUploader onFileUpload={onFileUpload} />
        
        <div className="separator">
          <span>OR</span>
        </div>
        
        <button 
          className="text-input-button"
          onClick={onTextButtonClick}
        >
          Enter Text
        </button>
      </div>
      
      <div className="context-instructions">
        <h4>How It Works</h4>
        <ul>
          <li>Upload a PDF or text file, or paste your own text</li>
          <li>Ask questions about the content</li>
          <li>Get AI-powered answers with confidence scores</li>
        </ul>
      </div>
    </div>
  );
};

export default EmptyState;