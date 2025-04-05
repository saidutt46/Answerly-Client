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
}

const ContextSection = ({ context, contextSource, contextFile, onFileUpload, onTextInput }: ContextSectionProps) => {
  const [showTextModal, setShowTextModal] = useState(false);
  
  const handleTextButtonClick = () => {
    setShowTextModal(true);
  };
  
  const handleCloseTextModal = () => {
    setShowTextModal(false);
  };
  
  return (
    <div className="context-section">
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