// ChatSection/ChatInput.tsx
import { useState, FormEvent } from 'react';

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
}

const ChatInput = ({ onSubmit, availableModels, selectedModel, onModelChange }: ChatInputProps) => {
  const [question, setQuestion] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
      onSubmit(question);
      setQuestion('');
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
          placeholder="Ask a question about your document..."
          rows={isExpanded ? 3 : 1}
        />
        
        <div className="input-controls">
          <div className="model-selector">
            <select 
              value={selectedModel} 
              onChange={(e) => onModelChange(e.target.value)}
              aria-label="Select AI model"
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
            disabled={!question.trim()}
          >
            Send
          </button>
        </div>
      </div>
    </form>
  );
};

export default ChatInput;