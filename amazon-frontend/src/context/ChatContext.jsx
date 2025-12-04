import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

// Lightweight Chat Provider - no intervals, no automatic updates
export const ChatProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);

  const openChat = useCallback(() => setIsOpen(true), []);
  const closeChat = useCallback(() => setIsOpen(false), []);
  const toggleChat = useCallback(() => setIsOpen(prev => !prev), []);

  const sendMessage = useCallback((content) => {
    const newMessage = {
      id: Date.now(),
      content,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
    
    // Simple auto-reply after 1 second
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        content: "Thank you for your message! Our support team will get back to you shortly.",
        sender: 'agent',
        timestamp: new Date()
      }]);
    }, 1000);
  }, []);

  const clearMessages = useCallback(() => setMessages([]), []);

  const value = useMemo(() => ({
    isOpen,
    messages,
    openChat,
    closeChat,
    toggleChat,
    sendMessage,
    clearMessages,
    // Stubs for compatibility
    chatSessions: {},
    activeChatId: null,
    isOnline: true,
    supportAgents: [],
    queuePosition: null,
    isLoading: false,
    startNewChat: () => Promise.resolve(null),
    endChat: () => Promise.resolve(true),
    getChatHistory: () => [],
    getActiveChat: () => null,
    reopenChat: () => {},
    getUnreadCount: () => 0,
    setActiveChatId: () => {}
  }), [isOpen, messages, openChat, closeChat, toggleChat, sendMessage, clearMessages]);

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContext;
