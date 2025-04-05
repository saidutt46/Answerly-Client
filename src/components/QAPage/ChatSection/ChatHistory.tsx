import React from 'react';

interface ChatMessage {
  type: 'question' | 'answer';
  content: string;
  metadata?: {
    confidence?: number;
    processingTime?: number;
    modelUsed?: string;
  };
}

interface ChatHistoryProps {
  history: ChatMessage[];
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ history }) => {
  return (
    <div className="chat-history">
      {history.map((message, index) => (
        <div 
          key={index} 
          className={`chat-bubble ${message.type === 'question' ? 'question' : 'answer'}`}
        >
          <div className="message-content">{message.content}</div>
          
          {message.metadata && message.type === 'answer' && (
            <div className="message-metadata">
              {message.metadata.confidence !== undefined && (
                <span className="confidence">
                  Confidence: {(message.metadata.confidence * 100).toFixed(1)}%
                </span>
              )}
              {message.metadata.processingTime !== undefined && (
                <span className="processing-time">
                  Time: {message.metadata.processingTime.toFixed(2)}s
                </span>
              )}
              {message.metadata.modelUsed && (
                <span className="model-used">
                  Model: {message.metadata.modelUsed}
                </span>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ChatHistory;