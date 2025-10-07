import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage } from './types';
import { SendIcon, BotIcon, UserIcon, LoadingIcon } from './components/Icons';

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentInput, setCurrentInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: currentInput.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setCurrentInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!response.ok || !response.body) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.statusText} - ${errorText}`);
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let modelResponse = '';
      setMessages(prev => [...prev, { role: 'model', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        modelResponse += decoder.decode(value, { stream: true });
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].content = modelResponse;
          return newMessages;
        });
      }

    } catch (e: any) {
      const errorMessage = `Error: ${e.message || 'Failed to fetch response.'}`;
      setError(errorMessage);
      console.error(e);
      setMessages(prev => [...prev, { role: 'model', content: `Sorry, something went wrong. Please check the console for details.` }]);
    } finally {
      setIsLoading(false);
    }
  }, [currentInput, isLoading, messages]);

  return (
    <div className="flex flex-col h-screen font-sans bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="p-4 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <h1 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-400">
          Gemini Simple Chat
        </h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((msg, index) => (
            <MessageBubble key={index} message={msg} />
          ))}
          {isLoading && messages[messages.length-1]?.role === 'user' && (
             <div className="flex items-start gap-3">
              <div className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                <BotIcon />
              </div>
              <div className="flex items-center justify-center pt-2">
                <LoadingIcon />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-3xl mx-auto">
          {error && <p className="text-red-500 text-sm mb-2 text-center">{error}</p>}
          <form onSubmit={handleSendMessage} className="relative">
            <textarea
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  handleSendMessage(e);
                }
              }}
              placeholder="Type your message..."
              rows={1}
              className="w-full p-3 pr-16 text-base bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none transition-shadow"
            />
            <button
              type="submit"
              disabled={isLoading || !currentInput.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <SendIcon />
            </button>
          </form>
        </div>
      </footer>
    </div>
  );
};

interface MessageBubbleProps {
  message: ChatMessage;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  return (
    <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0">
          <BotIcon />
        </div>
      )}
      <div
        className={`px-4 py-3 rounded-2xl max-w-lg break-words ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-lg'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-lg'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
       {isUser && (
        <div className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0">
          <UserIcon />
        </div>
      )}
    </div>
  );
};

export default App;