import React from 'react';

interface DocumentPreviewProps {
  context: string | null;
  contextSource: 'file' | 'text' | null;
  contextFile: File | null;
  onReplaceContext?: () => void;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ 
  context, 
  contextSource, 
  contextFile,
  onReplaceContext
}) => {
  // Get the source display name
  const getSourceName = () => {
    if (contextSource === 'file' && contextFile) {
      return contextFile.name;
    } else if (contextSource === 'text') {
      return 'Text Input';
    }
    return 'Unknown Source';
  };
  
  // Calculate document stats
  const getDocumentStats = () => {
    if (contextSource === 'file' && contextFile) {
      return {
        type: contextFile.type || 'Document',
        size: formatFileSize(contextFile.size),
        modified: new Date(contextFile.lastModified).toLocaleString()
      };
    } else if (contextSource === 'text' && context) {
      const wordCount = context.split(/\s+/).filter(Boolean).length;
      return {
        type: 'Text',
        wordCount,
        charCount: context.length
      };
    }
    return null;
  };
  
  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  
  const stats = getDocumentStats();
  
  return (
    <div className="document-preview">
      <div className="document-header">
        <h3>{getSourceName()}</h3>
        <button 
          className="replace-button"
          onClick={onReplaceContext}
        >
          Replace
        </button>
      </div>
      
      {stats && (
        <div className="document-stats">
          <span>Type: {stats.type}</span>
          {stats.size && <span>Size: {stats.size}</span>}
          {stats.modified && <span>Modified: {stats.modified}</span>}
          {stats.wordCount && <span>Words: {stats.wordCount}</span>}
          {stats.charCount && <span>Characters: {stats.charCount}</span>}
        </div>
      )}
      
      <div className="document-content-preview">
        {contextSource === 'text' && context ? (
          <div className="text-preview">
            {context.length > 300 
              ? context.substring(0, 300) + '...' 
              : context}
          </div>
        ) : contextSource === 'file' && contextFile ? (
          <div className="file-preview">
            {contextFile.type.includes('pdf') ? (
              <div className="pdf-icon">PDF</div>
            ) : (
              <div className="text-file-icon">TXT</div>
            )}
            <p>File uploaded successfully</p>
          </div>
        ) : (
          <p>No preview available</p>
        )}
      </div>
    </div>
  );
};

export default DocumentPreview;