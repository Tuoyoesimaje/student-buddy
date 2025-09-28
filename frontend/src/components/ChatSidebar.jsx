import React, { useState, useRef, useEffect } from 'react';
import { Send, Info, X } from 'lucide-react';

const ChatSidebar = ({ messages, onSendMessage, onClose }) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle keyboard visibility for mobile devices
  useEffect(() => {
    const handleResize = () => {
      // Check if we're on a mobile device
      if (window.innerWidth < 768) {
        // Use visual viewport to detect keyboard
        const isKeyboard = window.visualViewport.height < window.innerHeight * 0.8;
        setIsKeyboardVisible(isKeyboard);
        
        // Prevent parent component from closing chat when keyboard is visible
        if (isKeyboard && onClose) {
          // This prevents the chat from being closed when keyboard appears
          document.body.classList.add('keyboard-visible');
        } else {
          document.body.classList.remove('keyboard-visible');
        }
      } else {
        setIsKeyboardVisible(false);
        document.body.classList.remove('keyboard-visible');
      }
    };

    // Use visualViewport API for more accurate keyboard detection
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      window.visualViewport.addEventListener('scroll', handleResize);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
        window.visualViewport.removeEventListener('scroll', handleResize);
      }
      document.body.classList.remove('keyboard-visible');
    };
  }, [onClose]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      setIsLoading(true);
      onSendMessage(newMessage)
        .then(() => {
          setNewMessage('');
        })
        .catch((error) => {
          console.error('Error sending message:', error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  const handleInputFocus = () => {
    // When input is focused (keyboard appears), mark as keyboard visible
    if (window.innerWidth < 768) {
      setIsKeyboardVisible(true);
      document.body.classList.add('keyboard-visible');
    }
  };

  const handleInputBlur = () => {
    // Small delay to prevent immediate closing when switching inputs
    setTimeout(() => {
      // Only remove if we're not still focused on an input
      if (!document.querySelector('input:focus, textarea:focus')) {
        setIsKeyboardVisible(false);
        document.body.classList.remove('keyboard-visible');
      }
    }, 100);
  };

  return (
    <div className={`w-80 bg-gray-800 text-white p-4 flex flex-col h-full border-l border-gray-700 md:w-80 max-w-full ${isKeyboardVisible ? 'keyboard-active fixed bottom-0 right-0 top-auto h-auto max-h-[60vh] z-50' : ''}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center">
          <span className="relative">
            Chat
            <span className="absolute top-0 right-0 transform translate-x-2 -translate-y-1 w-2 h-2 bg-green-500 rounded-full"></span>
          </span>
        </h2>
        {onClose && (
          <button 
            onClick={(e) => {
              // Prevent closing if keyboard is visible
              if (!document.body.classList.contains('keyboard-visible')) {
                onClose();
              }
            }}
            className="p-1 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
            aria-label="Close chat"
          >
            <X size={20} />
          </button>
        )}
      </div>
      <div className={`flex-1 overflow-y-auto mb-4 pr-2 space-y-3 ${isKeyboardVisible ? 'max-h-[30vh]' : ''}`}>
        {messages.map((msg, index) => (
          <div key={index} className={`${msg.isSystemMessage ? 'flex items-center justify-center text-gray-400 text-sm py-1 px-2 rounded bg-gray-700 bg-opacity-50' : 'rounded-lg p-3 max-w-[90%] ' + (msg.sender === 'currentUser' ? 'ml-auto bg-blue-600' : 'bg-gray-700')}`}>
            {msg.isSystemMessage ? (
              <>
                <Info size={14} className="mr-1" />
                <span>{msg.message}</span>
              </>
            ) : (
              <>
                {msg.sender !== 'currentUser' && (
                  <div className="font-bold text-sm mb-1">{msg.username || (msg.sender && msg.sender.username) || 'User'}</div>
                )}
                <div className="break-words">{msg.message}</div>
                <div className="text-xs text-gray-400 mt-1 text-right">
                  {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="relative">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          className="w-full p-3 pr-10 bg-gray-700 border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type a message..."
          disabled={isLoading}
        />
        <button 
          type="submit" 
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-300 disabled:text-gray-500"
          disabled={!newMessage.trim() || isLoading}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default ChatSidebar;