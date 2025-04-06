// ContextSection/index.tsx
import { useState } from 'react';
import EmptyState from './EmptyState';
import TextInputModal from './TextInputModal';
import DocumentPreview from './DocumentPreview';

interface ContextSectionProps {
  context: string | null;
  contextSource: 'file' | 'text' | null;
  contextFile: File | null;
  onFileUpload: (file: File) => void;
  onTextInput: (text: string) => void;
  onReplaceContext?: () => void;
}

const ContextSection = ({ 
  context, 
  contextSource, 
  contextFile, 
  onFileUpload, 
  onTextInput,
  onReplaceContext
}: ContextSectionProps) => {
  const [showTextModal, setShowTextModal] = useState(false);
  
  const handleTextButtonClick = () => {
    setShowTextModal(true);
  };
  
  const handleCloseTextModal = () => {
    setShowTextModal(false);
  };
  
  return (
    <div className="context-section">
      <div className="context-section-header">
        <h3>Add Your Content</h3>
        <p>Upload a document or enter text to get started</p>
      </div>
      
      {!context && !contextFile ? (
        <EmptyState 
          onFileUpload={onFileUpload}
          onTextButtonClick={handleTextButtonClick}
        />
      ) : (
        <DocumentPreview 
          context={context}
          contextSource={contextSource}
          contextFile={contextFile}
          onReplaceContext={onReplaceContext}
        />
      )}
      
      {showTextModal && (
        <TextInputModal 
          onTextSubmit={onTextInput}
          onModalClose={handleCloseTextModal}
        />
      )}
    </div>
  );
};

export default ContextSection;