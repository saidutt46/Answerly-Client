// ChatSection/ChatInput.tsx
import { useState, FormEvent, KeyboardEvent } from 'react';

interface Model {
  id: string;
  name: string;
  description?: string;
}

interface ChatInputProps {
  onSubmit: (question: string) => void;
  availableModels: Model[];
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  isLoading?: boolean;
}

const ChatInput = ({ 
  onSubmit, 
  availableModels, 
  selectedModel, 
  onModelChange,
  isLoading = false
}: ChatInputProps) => {
  const [question, setQuestion] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (question.trim() && !isLoading) {
      onSubmit(question);
      setQuestion('');
      setIsExpanded(false);
    }
  };
  
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter without Shift key
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (question.trim() && !isLoading) {
        onSubmit(question);
        setQuestion('');
        setIsExpanded(false);
      }
    }
  };
  
  return (
    <form className="chat-input-form" onSubmit={handleSubmit}>
      <div className={`input-container ${isExpanded ? 'expanded' : ''}`}>
        <textarea
          className="question-input"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onFocus={() => setIsExpanded(true)}
          onBlur={() => question === '' && setIsExpanded(false)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about your document..."
          rows={isExpanded ? 3 : 1}
          disabled={isLoading}
        />
        
        <div className="input-controls">
          <div className="model-selector">
            <select 
              value={selectedModel} 
              onChange={(e) => onModelChange(e.target.value)}
              aria-label="Select AI model"
              disabled={isLoading}
            >
              {availableModels.map(model => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>
          
          <button 
            type="submit" 
            className="submit-button"
            disabled={!question.trim() || isLoading}
          >
            {isLoading ? 'Processing...' : 'Send'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default ChatInput;