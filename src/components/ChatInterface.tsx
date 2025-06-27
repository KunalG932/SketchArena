import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle } from 'lucide-react';
import { useSocket } from '../hooks/useSocket';

interface ChatInterfaceProps {
  isDrawer: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ isDrawer }) => {
  const [currentMessage, setCurrentMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, sendGuess, sendMessage } = useSocket();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMessage.trim()) return;

    if (isDrawer) {
      sendMessage(currentMessage);
    } else {
      sendGuess(currentMessage);
    }
    
    setCurrentMessage('');
  };

  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 h-full flex flex-col">
      <div className="flex items-center p-4 border-b border-white/20">
        <MessageCircle className="text-blue-400 mr-2" size={20} />
        <h3 className="text-white font-semibold">Chat & Guesses</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-80">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`p-3 rounded-2xl ${
              message.user === 'System'
                ? 'bg-blue-500/20 text-blue-200 border border-blue-500/30'
                : message.isCorrectGuess
                ? 'bg-green-500/20 text-green-200 border border-green-500/30'
                : 'bg-white/5 text-gray-200 border border-white/10'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-sm">{message.user}</span>
              <span className="text-xs opacity-70">{formatTime(message.timestamp)}</span>
            </div>
            <p className="text-sm">{message.text}</p>
            {message.isCorrectGuess && message.points && (
              <div className="text-xs text-green-300 mt-1 font-semibold">
                ✓ Correct! +{message.points} points
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t border-white/20">
        <div className="flex space-x-2">
          <input
            type="text"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            placeholder={isDrawer ? "Send a message..." : "Enter your guess..."}
            className="flex-1 bg-white/10 border border-white/20 rounded-2xl py-3 px-4 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={50}
          />
          <button
            type="submit"
            disabled={!currentMessage.trim()}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white p-3 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};