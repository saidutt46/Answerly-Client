// ContextSection/FileUploader.tsx
import { useState, useRef, DragEvent, ChangeEvent } from 'react';

interface FileUploaderProps {
  onFileUpload: (file: File) => void;
  allowedTypes?: string[];
}

const FileUploader = ({ onFileUpload, allowedTypes = ['.pdf', '.txt'] }: FileUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const validateFile = (file: File) => {
    // Check file type
    const fileExt = file.name.split('.').pop();
    const extension = fileExt ? `.${fileExt.toLowerCase()}` : '';
    if (!allowedTypes.includes(extension)) {
      setError(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
      return false;
    }
    
    // Check file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError('File too large. Maximum size: 10MB');
      return false;
    }
    
    return true;
  };
  
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);
    
    if (e.dataTransfer.files.length) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        onFileUpload(file);
      }
    }
  };
  
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        onFileUpload(file);
      }
    }
  };
  
  return (
    <div 
      className={`file-uploader ${isDragging ? 'dragging' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="upload-content">
        <div className="upload-icon">📄</div>
        <h3>Drop your file here</h3>
        <p>or</p>
        <button 
          className="browse-button"
          onClick={() => fileInputRef.current?.click()}
        >
          Browse files
        </button>
        <p className="file-types">Supported formats: {allowedTypes.join(', ')}</p>
        
        {error && <p className="error-message">{error}</p>}
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept={allowedTypes.join(',')}
          style={{ display: 'none' }}
          aria-label="File upload"
        />
      </div>
    </div>
  );
};

export default FileUploader;