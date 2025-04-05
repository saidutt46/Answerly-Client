// ChatSection/index.tsx
import ChatHistory from './ChatHistory';
import ChatInput from './ChatInput';
import EmptyState from './EmptyState';

interface ChatSectionProps {
  chatHistory: Array<{
    type: 'question' | 'answer';
    content: string;
    metadata?: {
      confidence?: number;
      processingTime?: number;
      modelUsed?: string;
    };
  }>;
  onQuestionSubmit: (question: string) => void;
  availableModels: Array<{ id: string; name: string; description?: string }>;
  selectedModel: string;
  onModelChange: (modelId: string) => void;
}

const ChatSection = ({ chatHistory, onQuestionSubmit, availableModels, selectedModel, onModelChange }: ChatSectionProps) => {
  return (
    <div className="chat-section">
      <div className="chat-history-container">
        {chatHistory.length === 0 ? (
          <EmptyState />
        ) : (
          <ChatHistory history={chatHistory} />
        )}
      </div>
      <div className="chat-input-container">
        <ChatInput 
          onSubmit={onQuestionSubmit}
          availableModels={availableModels}
          selectedModel={selectedModel}
          onModelChange={onModelChange}
        />
      </div>
    </div>
  );
};

export default ChatSection;