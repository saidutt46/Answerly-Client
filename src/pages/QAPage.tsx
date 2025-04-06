import { useState, useEffect } from 'react';
import ChatSection from '../components/QAPage/ChatSection';
import ContextSection from '../components/QAPage/ContextSection';
import '../styles/qa-page.css'; // Import the QA page styles

// Define TypeScript interfaces
interface ChatMessage {
  type: 'question' | 'answer';
  content: string;
  metadata?: {
    confidence?: number;
    processingTime?: number;
    modelUsed?: string;
  };
}

interface Model {
  id: string;
  name: string;
  description?: string;
}

const QAPage: React.FC = () => {
  // State for context
  const [context, setContext] = useState<string | null>(null);
  const [contextSource, setContextSource] = useState<'file' | 'text' | null>(null);
  const [contextFile, setContextFile] = useState<File | null>(null);
  
  // State for chat
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // State for models
  const [availableModels, setAvailableModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  
  // Load available models on component mount
  useEffect(() => {
    // Fetch models from API - to be implemented
    const fetchModels = async () => {
      try {
        // Replace with actual API call
        const dummyModels: Model[] = [
          { id: 'distilbert', name: 'DistilBERT (Fast)' },
          { id: 'roberta', name: 'RoBERTa (Balanced)' },
          { id: 'bert', name: 'BERT Large (Accurate)' },
        ];
        setAvailableModels(dummyModels);
        setSelectedModel(dummyModels[0].id); // Set default model
      } catch (error) {
        console.error('Failed to fetch models:', error);
      }
    };
    
    fetchModels();
  }, []);
  
  // Handle file upload
  const handleFileUpload = (file: File) => {
    setContextFile(file);
    setContextSource('file');
    // API call to upload file - to be implemented
  };
  
  // Handle text input
  const handleTextInput = (text: string) => {
    setContext(text);
    setContextSource('text');
  };
  
  // Handle context replacement
  const handleReplaceContext = () => {
    setContext(null);
    setContextFile(null);
    setContextSource(null);
  };
  
  // Handle question submission
  const handleQuestionSubmit = (question: string) => {
    // Add question to chat history
    setChatHistory(prev => [...prev, { type: 'question', content: question }]);
    
    // Set loading state
    setIsLoading(true);
    
    // API call to get answer based on contextSource - to be implemented
    // For now, just show a dummy response
    setTimeout(() => {
      setChatHistory(prev => [
        ...prev, 
        { 
          type: 'answer', 
          content: 'This is a placeholder answer that simulates what the AI would generate based on the document context. The answer would typically be more detailed and directly related to the question asked.',
          metadata: {
            confidence: 0.85,
            processingTime: 0.5,
            modelUsed: selectedModel
          }
        }
      ]);
      
      setIsLoading(false);
    }, 1000);
  };
  
  return (
    <div className="qa-page-container">
      <div className="qa-page-left">
        <ChatSection 
          chatHistory={chatHistory}
          onQuestionSubmit={handleQuestionSubmit}
          availableModels={availableModels}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          isLoading={isLoading}
        />
      </div>
      <div className="qa-page-right">
        <ContextSection 
          context={context}
          contextSource={contextSource}
          contextFile={contextFile}
          onFileUpload={handleFileUpload}
          onTextInput={handleTextInput}
          onReplaceContext={handleReplaceContext}
        />
      </div>
    </div>
  );
};

export default QAPage;