// ContextSection/TextInputModal.tsx
import React, { useState } from 'react';

interface TextInputModalProps {
  onTextSubmit: (text: string) => void;
  onModalClose: () => void;
}

const TextInputModal: React.FC<TextInputModalProps> = ({ onTextSubmit, onModalClose }) => {
  const [text, setText] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onTextSubmit(text);
      onModalClose();
    }
  };
  
  return (
    <div className="modal-overlay">
      <div className="text-input-modal">
        <div className="modal-header">
          <h3>Enter your text</h3>
          <button 
            className="close-button"
            onClick={onModalClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <textarea
            className="text-area"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste or type your text here..."
            rows={15}
            autoFocus
          />
          
          <div className="modal-footer">
            <button 
              type="button" 
              className="cancel-button"
              onClick={onModalClose}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-button"
              disabled={!text.trim()}
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TextInputModal;