import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  PaperAirplaneIcon,
  SparklesIcon,
  StopIcon,
  ArrowPathIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  BookOpenIcon,
  ExclamationCircleIcon,
  DocumentDuplicateIcon,
  CheckIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import api from '../utils/axios';
import { marked } from 'marked';

// Helper function to store chat in localStorage
const storeChat = (chatId, messages) => {
  try {
    const chats = JSON.parse(localStorage.getItem('alfredChats') || '{}');
    chats[chatId] = {
      messages,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem('alfredChats', JSON.stringify(chats));
  } catch (error) {
    console.error('Error storing chat:', error);
  }
};

// Helper function to load chat from localStorage
const loadChats = () => {
  try {
    return JSON.parse(localStorage.getItem('alfredChats') || '{}');
  } catch (error) {
    console.error('Error loading chats:', error);
    return {};
  }
};

// Helper function to copy text to clipboard
const copyToClipboard = async (text, setCopied) => {
  try {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  } catch (err) {
    console.error('Failed to copy text: ', err);
  }
};

const Chatbot = () => {
  const [chatId] = useState(() => `chat_${Date.now()}`);
  const [messages, setMessages] = useState(() => {
    // Try to load messages from localStorage or use default welcome message
    try {
      const savedChats = loadChats();
      const lastChatId = Object.keys(savedChats).sort((a, b) =>
        new Date(savedChats[b].updatedAt) - new Date(savedChats[a].updatedAt)
      )[0];

      if (lastChatId) {
        return savedChats[lastChatId].messages;
      }
    } catch (error) {
      console.error('Error loading chat:', error);
    }

    // Default welcome message
    return [{
      id: Date.now(),
      role: 'assistant',
      content: 'Hello! I\'m Alfred, your AI study assistant. How can I help you with your studies today?',
      timestamp: new Date().toISOString()
    }];
  });
  
  const [input, setInput] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const placeholders = [
    "Ask Alfred anything",
    "Generate note on any topic",
    "I'm the Alfred to your Batman",
    "Get teacher-like explanations on topic"
  ];
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);
  const animatedMessagesRef = useRef(new Set()); // Track which messages have been animated
  const [courses, setCourses] = useState([]); // Will be populated with user's courses
  const [displayedContent, setDisplayedContent] = useState({});
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const chatContainerRef = useRef(null);

  // Initialize displayedContent for existing messages on component mount
  useEffect(() => {
    const initialContent = {};
    messages.forEach(message => {
      if (message.role === 'assistant') {
        initialContent[message.id] = message.content;
        animatedMessagesRef.current.add(message.id); // Mark as already processed
      }
    });
    setDisplayedContent(initialContent);
  }, []); // Only run once on mount

  // Fixed typing effect - only animate new messages, not old ones
  useEffect(() => {
    const intervals = [];

    messages.forEach(message => {
      if (message.role === 'assistant' && !displayedContent[message.id] && !animatedMessagesRef.current.has(message.id)) {
        // Check if this is a new message (recent timestamp) to avoid animating old messages
        const messageTime = new Date(message.timestamp);
        const now = new Date();
        const timeDiff = now - messageTime;
        const isNewMessage = timeDiff < 5000; // Only animate messages from last 5 seconds

        if (isNewMessage) {
          // Mark as being animated
          animatedMessagesRef.current.add(message.id);

          // Animate new messages with a faster, framed approach:
          // - use ~16ms ticks (60fps) and advance multiple characters per tick
          // - this keeps short messages snappy and long messages finish quickly
          let i = 0;
          const totalChars = message.content.length;
          const targetFrames = 30; // aim to finish in ~30 frames (~480ms)
          const step = Math.max(1, Math.ceil(totalChars / targetFrames));
          const interval = setInterval(() => {
            i = Math.min(totalChars, i + step);
            setDisplayedContent(prev => ({
              ...prev,
              [message.id]: message.content.substring(0, i)
            }));
            if (i >= totalChars) {
              clearInterval(interval);
            }
          }, 16);
          intervals.push(interval);
        } else {
          // Immediately show old messages without animation
          animatedMessagesRef.current.add(message.id);
          setDisplayedContent(prev => ({
            ...prev,
            [message.id]: message.content
          }));
        }
      }
    });

    // Cleanup function to clear all intervals
    return () => {
      intervals.forEach(interval => clearInterval(interval));
    };
  }, [messages]); // Removed displayedContent from dependencies to prevent loops

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  // Use an IntersectionObserver on the messages-end sentinel to detect whether
  // the chat is scrolled to the bottom. This avoids attaching scroll listeners
  // to ancestor containers (which can be brittle) and prevents clipping issues.
  const messagesEndVisibleRef = useRef(true);
  const [inputLeft, setInputLeft] = useState(0);
  const [isLarge, setIsLarge] = useState(false);

  useEffect(() => {
    const updateOffset = () => {
      try {
        const large = window.matchMedia('(min-width: 1024px)').matches;
        setIsLarge(large);
        if (!large) {
          setInputLeft(0);
          return;
        }
        const sidebar = document.querySelector('.fixed.inset-y-0.left-0');
        if (sidebar) {
          const w = Math.round(sidebar.getBoundingClientRect().width) || 0;
          setInputLeft(w);
          return;
        }
        // fallback: find any fixed left element
        const fallback = Array.from(document.querySelectorAll('body > *')).find(el => {
          const cs = getComputedStyle(el);
          return cs.position === 'fixed' && Math.round(el.getBoundingClientRect().left) === 0 && el.clientWidth > 40;
        });
        if (fallback) setInputLeft(Math.round(fallback.getBoundingClientRect().width));
      } catch (e) {
        setInputLeft(0);
      }
    };

    updateOffset();
    const ro = new ResizeObserver(() => updateOffset());
    const sidebarEl = document.querySelector('.fixed.inset-y-0.left-0');
    if (sidebarEl) ro.observe(sidebarEl);
    window.addEventListener('resize', updateOffset);
    const mo = new MutationObserver(() => updateOffset());
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      try { ro.disconnect(); } catch (e) {}
      try { mo.disconnect(); } catch (e) {}
      window.removeEventListener('resize', updateOffset);
    };
  }, []);

  useEffect(() => {
    // If IntersectionObserver isn't available, fall back to hiding the button
    // (conservative) and allow auto-scroll.
    if (typeof IntersectionObserver === 'undefined') {
      messagesEndVisibleRef.current = true;
      setShowScrollToBottom(false);
      return;
    }

    const el = messagesEndRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const isVisible = entry ? entry.isIntersecting : true;
        messagesEndVisibleRef.current = isVisible;
        setShowScrollToBottom(!isVisible);
      },
      { root: null, threshold: 0.9 }
    );

    if (el) observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    // Auto-scroll only when the sentinel is visible (user is at/near bottom).
    if (messagesEndVisibleRef.current) scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex(prevIndex => (prevIndex + 1) % placeholders.length);
    }, 5000); // Change placeholder every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Load user's courses on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get('/api/courses');
        setCourses(response.data.courses || []);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };
    
    fetchCourses();
  }, []);

  // Save messages to localStorage when they change
  useEffect(() => {
    if (messages.length > 0) {
      storeChat(chatId, messages);
    }
  }, [messages, chatId]);

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString()
    };
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsTyping(true);
    setError(null);
    setIsProcessing(true);

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();

    try {
      // Prepare messages in the format expected by the backend
      const chatMessages = updatedMessages
        .filter(msg => msg && (msg.role === 'user' || msg.role === 'assistant') && msg.content) // Ensure valid messages
        .map(msg => ({
          role: msg.role,
          content: String(msg.content || '').trim() // Ensure content is a string and trim whitespace
        }))
        .filter(msg => msg.content.length > 0); // Remove any empty messages

      // Prepare courses, ensuring we have an array of strings
      const courseList = Array.isArray(courses) 
        ? courses.map(course => String(course?.name || course?.title || '').trim())
          .filter(Boolean) // Remove any empty strings
        : [];

      // Get the last user message (should be the current one)
      const lastUserMessage = chatMessages
        .filter(m => m.role === 'user')
        .pop()?.content || '';
      
      console.log('Sending chat request with:', { 
        prompt: lastUserMessage,
        messages: chatMessages,
        courses: courseList 
      });

            const userId = localStorage.getItem('userId');
      const response = await api.post('/api/agent/chat', {
        userId,
        prompt: lastUserMessage,
        messages: chatMessages,
        courses: courseList
      }, {
        signal: abortControllerRef.current.signal
      });

      const botMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.data.reply,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Request was aborted');
        return;
      }
      
      console.error('Error getting AI response:', error);
      
      // More detailed error message
      let errorMsg = 'Failed to get response. Please try again.';
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        errorMsg = error.response.data?.error || error.response.statusText || errorMsg;
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        errorMsg = 'No response from server. Please check your connection.';
      }
      
      setError(errorMsg);
      
      // Add error message to chat
      const errorMessageObj = {
        id: Date.now() + 1,
        type: 'error',
        content: `Sorry, I encountered an error: ${errorMsg}`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessageObj]);
    } finally {
      setIsTyping(false);
      setIsProcessing(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsTyping(false);
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedPrompts = [
    {
      icon: AcademicCapIcon,
      title: 'Explain Like a Teacher',
      prompt: 'Break down Topic: [ ] in a way I can easily understand, like a teacher would.'
    },
    {
      icon: ArrowPathIcon,
      title: 'Plan My 1 Hour Study',
      prompt: 'Help me plan how to study for 1 hour now — I want to focus and make it count.'
    },
    {
      icon: BookOpenIcon,
      title: 'How to Study This Topic',
      prompt: 'How should I study this Topic: [ ] to really understand it and not forget?'
    },
    {
      icon: DocumentTextIcon,
      title: 'Turn This Into Notes',
      prompt: 'Turn This into proper study notes: [paste with rough here]'
    }
  ];

  return (
    // Use h-full so the page fills the MainLayout content area instead of
    // forcing its own full viewport height (which can cause overlap with the
    // fixed sidebar/topbar). Let MainLayout manage overall sizing.
    <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-900/50 flex flex-col h-full relative overflow-hidden lg:mx-4 lg:my-4 border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 px-6 py-4 rounded-t-xl border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="relative flex items-center justify-center w-10 h-10 bg-white dark:bg-gray-700 rounded-full">
                  <SparklesIcon className="w-6 h-6 text-gray-800 dark:text-gray-200" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Alfred</h1>
                <p className="text-xs text-gray-700 dark:text-gray-300">Your AI Study Assistant</p>
              </div>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Start a new chat? Your current chat will be saved.')) {
                  // Reset animated messages tracking for new chat
                  animatedMessagesRef.current.clear();
                  setDisplayedContent({});

                  setMessages([{
                    id: Date.now(),
                    role: 'assistant',
                    content: 'Hello! I\'m Alfred, your AI study assistant. What would you like to work on today?',
                    timestamp: new Date().toISOString()
                  }]);
                }
              }}
              className="text-xs text-gray-700 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-400 flex items-center space-x-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <ArrowPathIcon className="w-3.5 h-3.5 text-gray-700 dark:text-gray-300" />
              <span className="text-gray-700 dark:text-gray-300">New Chat</span>
            </button>
          </div>
        </div>

    {/* Chat messages; add extra bottom padding so messages are not hidden
      behind the sticky input/footer */}
    <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-4 sm:px-6 py-8 pb-32 space-y-6" style={{ scrollbarWidth: 'thin' }}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} group`}
            >
              <div
                className={`relative max-w-[85%] sm:max-w-[75%] rounded-3xl px-5 py-3 shadow-sm text-base font-medium ${
                  message.role === 'user'
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-3xl rounded-bl-none'
                    : message.type === 'error'
                    ? 'bg-red-100 dark:bg-red-900/20 text-red-900 dark:text-red-300 rounded-3xl rounded-bl-none'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-3xl rounded-br-none'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-white dark:bg-gray-600 flex items-center justify-center">
                    <SparklesIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                )}

                <div className="whitespace-pre-line text-gray-800 dark:text-gray-200" dangerouslySetInnerHTML={{ __html: message.role === 'assistant' ? marked(displayedContent[message.id] || '') : marked(message.content) }} />

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-opacity-20 border-gray-400 dark:border-gray-500">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>

                  {message.role === 'assistant' && (
                    <button
                      onClick={() => copyToClipboard(message.content, (copied) => {
                        if (copied) setCopiedId(message.id);
                      })}
                      className="ml-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 hover:bg-opacity-30 transition-colors"
                      title="Copy to clipboard"
                    >
                      {copiedId === message.id ? (
                        <CheckIcon className="w-4 h-4 text-green-500 dark:text-green-400" />
                      ) : (
                        <DocumentDuplicateIcon className="w-4 h-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-xl px-5 py-3 shadow-sm flex items-center space-x-2">
                <div className="flex items-center">
                  <SparklesIcon className="w-5 h-5 text-blue-500 mr-2" />
                  <span className="text-gray-700">Alfred is thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Render the scroll-to-bottom button in a portal so it can't be clipped by parent containers */}
        {showScrollToBottom && typeof document !== 'undefined' && document.body && createPortal(
          <button
            onClick={scrollToBottom}
            className="fixed bottom-24 right-6 sm:bottom-28 sm:right-10 bg-blue-600 text-white p-2 rounded-full shadow-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ease-in-out transform hover:scale-105"
            aria-label="Scroll to bottom"
            style={{ zIndex: 9999 }}
          >
            <ArrowDownIcon className="h-6 w-6" />
          </button>,
          document.body
        )}

        {/* Input area */}
        {/* The input is rendered via a portal as a fixed element so it stays
            visible at the viewport bottom while messages scroll under it.
            We align it with the main content area by using a responsive
            left offset to avoid the fixed sidebar (lg:left-64). */}
        {typeof document !== 'undefined' && document.body && createPortal(
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="fixed bottom-0 right-0 px-4 sm:px-6 py-6 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex items-end gap-3 z-20"
            style={{
              boxSizing: 'border-box',
              left: isLarge ? `${inputLeft}px` : 0,
              maxWidth: isLarge ? `calc(100% - ${inputLeft}px)` : '100%'
            }}
          >
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  setInput(input + '\n');
                } else if (e.key === 'Enter' && e.ctrlKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={placeholders[placeholderIndex]}
              rows={Math.min(3, input.split('\n').length)}
              style={{ minHeight: '48px', maxHeight: '120px', resize: 'none', overflowY: 'auto' }}
              className="w-full px-5 py-3 rounded-3xl border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 text-base shadow-sm"
              disabled={isProcessing}
            />
            {error && (
              <div className="absolute -top-8 left-0 right-0 flex items-center justify-center">
                <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 px-4 py-2 rounded-lg flex items-center space-x-2">
                  <ExclamationCircleIcon className="w-5 h-5" />
                  <span className="text-sm">{error}</span>
                </div>
              </div>
            )}
          </div>
          {isProcessing ? (
            <button
              type="button"
              onClick={handleStopGeneration}
              className="ml-2 p-3 rounded-3xl bg-red-600 hover:bg-red-700 text-white shadow-lg transition flex items-center justify-center"
            >
              <StopIcon className="h-5 w-5" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim() || isProcessing}
              className="ml-2 p-3 rounded-3xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          )}
          </form>,
          document.body
        )}

        {/* Footer note */}
        <div className="text-xs text-gray-400 dark:text-gray-500 text-center py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 rounded-b-xl">
          AI can make mistakes. Please double-check responses.
        </div>
      </div>
    </div>
  );
};

export default Chatbot;