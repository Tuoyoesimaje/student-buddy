import React, { useState, useRef, useEffect } from 'react';
import { TypeAnimation } from 'react-type-animation';
import { Box, TextField, IconButton, Paper, Typography, CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios';

const Chatbot = () => {
  // State for messages and loading
  const [messages, setMessages] = useState([
    { text: 'Hello! I\'m your AI study assistant. Ask me anything!', sender: 'ai', isAnimated: true }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const inputRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Show scroll-to-bottom button if not at bottom
  useEffect(() => {
    const chatArea = messagesEndRef.current?.parentNode;
    if (!chatArea) return;
    const handleScroll = () => {
      const atBottom = chatArea.scrollHeight - chatArea.scrollTop - chatArea.clientHeight < 40;
      setShowScrollButton(!atBottom);
    };
    chatArea.addEventListener('scroll', handleScroll);
    return () => chatArea.removeEventListener('scroll', handleScroll);
  }, [messages]);

  // Handle sending a message
  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message to chat
    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Send message to backend
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/agent/chat`,
        { prompt: input },
        { 
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          } 
        }
      );

      // Add AI response to chat
      if (response.data.success) {
        setMessages(prev => [...prev, {
          text: response.data.response,
          sender: 'ai',
          isAnimated: false
        }]);
      } else {
        throw new Error(response.data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      // Add error message to chat
      setMessages(prev => [...prev, {
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle Enter for newline, Ctrl+Enter to send
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.ctrlKey) {
      // Insert newline
      if (!e.shiftKey) {
        e.preventDefault();
        const { selectionStart, selectionEnd } = e.target;
        setInput(prev => prev.slice(0, selectionStart) + '\n' + prev.slice(selectionEnd));
        setTimeout(() => {
          inputRef.current.selectionStart = inputRef.current.selectionEnd = selectionStart + 1;
        }, 0);
      }
    } else if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: 'background.default',
      borderRadius: 2,
      overflow: 'hidden'
    }}>
      {/* Messages Area */}
      <Box sx={{ 
        flex: 1, 
        overflowY: 'auto', 
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        position: 'relative'
      }}>
        {messages.map((message, index) => (
          <Paper
            key={index}
            elevation={1}
            sx={{
              p: 2,
              maxWidth: '80%',
              alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start',
              bgcolor: message.sender === 'user' ? 'primary.main' : 'background.paper',
              color: message.sender === 'user' ? 'primary.contrastText' : 'text.primary',
              border: message.isError ? '1px solid error.main' : 'none',
              borderRadius: message.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px'
            }}
          >
            <Typography variant="body1">
              {message.sender === 'ai' && !message.isAnimated ? (
                <TypeAnimation
                  sequence={[message.text]}
                  wrapper="span"
                  cursor={false}
                  speed={70}
                  onComplete={() => {
                    setMessages(prev => prev.map(m => 
                      m === message ? {...m, isAnimated: true} : m
                    ));
                  }}
                />
              ) : message.text}
            </Typography>
          </Paper>
        ))}
        <div ref={messagesEndRef} />
        {showScrollButton && (
          <IconButton
            sx={{
              position: 'absolute',
              right: 16,
              bottom: 16,
              zIndex: 10,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              borderRadius: '50%',
              boxShadow: 2
            }}
            onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
            title="Scroll to bottom"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
          </IconButton>
        )}
      </Box>

      {/* Input Area */}
      <Box sx={{ 
        p: 2, 
        borderTop: 1, 
        borderColor: 'divider',
        bgcolor: 'background.paper',
        position: 'sticky',
        bottom: 0,
        zIndex: 20
      }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            multiline
            minRows={3}
            maxRows={4}
            inputRef={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Enter for newline, Ctrl+Enter to send)"
            disabled={isLoading}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '24px'
              }
            }}
          />
          <IconButton 
            color="primary" 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            sx={{
              alignSelf: 'flex-end',
              height: 48, // Adjusted height to better fit rounded-3xl
              width: 48, // Adjusted width to better fit rounded-3xl
              borderRadius: '24px' // Equivalent to rounded-3xl
            }}
          >
            {isLoading ? (
              <div className="flex items-center">
                <span className="text-sm mr-2">Alfred is thinking</span>
                <CircularProgress size={16} />
              </div>
            ) : <SendIcon />}
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default Chatbot;