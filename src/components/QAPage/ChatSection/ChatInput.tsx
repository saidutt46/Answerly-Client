// ChatSection/ChatInput.tsx
import { useState, useRef, useEffect, FormEvent, KeyboardEvent } from 'react';
import submitIcon from '../../../assets/icons/submit-qa-icon.png';
import loadingIcon from '../../../assets/icons/loading-qa-icon.png';

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  
  // Get the currently selected model name
  const selectedModelName = availableModels.find(model => model.id === selectedModel)?.name || '';
  
  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto to get the correct scrollHeight
      textareaRef.current.style.height = '56px'; // Min height
      
      // Set the height to the scrollHeight
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 120)}px`; // Max height 120px
    }
  }, [question]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.model-dropdown-container') && !target.closest('.model-selector-button')) {
        setShowModelDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Position dropdown based on available space
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');
  
  useEffect(() => {
    if (showModelDropdown) {
      const button = document.querySelector('.model-selector-button');
      if (button) {
        const buttonRect = button.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const spaceBelow = viewportHeight - buttonRect.bottom;
        const spaceNeeded = 200; // Approximate height needed for dropdown
        
        if (spaceBelow < spaceNeeded && buttonRect.top > spaceNeeded) {
          setDropdownPosition('top');
        } else {
          setDropdownPosition('bottom');
        }
      }
    }
  }, [showModelDropdown]);
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (question.trim() && !isLoading) {
      onSubmit(question);
      setQuestion('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = '56px';
      }
    }
  };
  
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter without Shift key
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (question.trim() && !isLoading) {
        onSubmit(question);
        setQuestion('');
        // Reset textarea height
        if (textareaRef.current) {
          textareaRef.current.style.height = '56px';
        }
      }
    }
  };
  
  return (
    <form className="chat-input-form" onSubmit={handleSubmit}>
      <div className="input-container">
        <textarea
          ref={textareaRef}
          className="question-input"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about your document..."
          disabled={isLoading}
          rows={1}
        />
        
        <div className="input-actions">
          <div className="input-actions-left">
            {/* Reserved for future elements */}
          </div>
          
          <div className="input-actions-right">
            <div className="model-selector-container">
              <button 
                type="button"
                className="model-selector-button"
                onClick={() => setShowModelDropdown(!showModelDropdown)}
                disabled={isLoading}
              >
                {selectedModelName}
                <svg className="chevron-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              
              {showModelDropdown && (
                <div className={`model-dropdown-container ${dropdownPosition}`}>
                  <div className="model-dropdown">
                    {availableModels.map(model => (
                      <div 
                        key={model.id} 
                        className={`model-option ${model.id === selectedModel ? 'selected' : ''}`}
                        onClick={() => {
                          onModelChange(model.id);
                          setShowModelDropdown(false);
                        }}
                      >
                        <div className="model-option-name">{model.name}</div>
                        {model.description && (
                          <div className="model-option-description">{model.description}</div>
                        )}
                        {model.id === selectedModel && (
                          <svg className="check-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 12L10 17L19 8" stroke="#4361EE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <button 
              type="submit" 
              className="submit-button"
              disabled={!question.trim() || isLoading}
              aria-label="Send message"
            >
              {isLoading ? (<img src={loadingIcon} alt="Loading" className="loading-icon" />) :
              (<img src={submitIcon} alt="Submit" className="send-icon" />
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default ChatInput;