import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { useRecommendations } from './useRecommendations';
import shoppingAssistant from '../services/shoppingAssistant';
import recommendationEngine from '../services/recommendationEngine';

// Custom hook for AI Shopping Assistant
export const useShoppingAssistant = () => {
  const { user, isAuthenticated } = useAuth();
  const { products } = useProducts();
  const { cart } = useCart();
  const { trackBehavior } = useRecommendations();
  
  const [chatState, setChatState] = useState({
    messages: [],
    isTyping: false,
    isOpen: false,
    unreadCount: 0,
    isInitialized: false
  });

  const [assistantStatus, setAssistantStatus] = useState({
    isOnline: true,
    lastActive: new Date(),
    responseTime: 'Usually responds in seconds'
  });

  const typingTimeoutRef = useRef(null);

  // Initialize shopping assistant
  useEffect(() => {
    if (!chatState.isInitialized && products.length > 0) {
      // Set up the product recommender
      shoppingAssistant.setProductRecommender(recommendationEngine);
      
      // Add welcome message
      const welcomeMessage = {
        id: Date.now(),
        text: "👋 Hi! I'm your AI shopping assistant. I can help you find products, answer questions, and make recommendations. How can I assist you today?",
        timestamp: new Date(),
        type: 'assistant',
        suggestions: [
          "Show me trending products",
          "I'm looking for electronics",
          "What deals do you have?",
          "Help me find a gift"
        ]
      };

      setChatState(prev => ({
        ...prev,
        messages: [welcomeMessage],
        isInitialized: true
      }));
    }
  }, [products, chatState.isInitialized]);

  // Send message to AI assistant
  const sendMessage = useCallback(async (messageText, options = {}) => {
    if (!messageText.trim()) return;

    // Track user interaction
    trackBehavior('chat', 'message_sent', {
      messageLength: messageText.length,
      timestamp: Date.now()
    });

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: messageText.trim(),
      timestamp: new Date(),
      type: 'user'
    };

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isTyping: true
    }));

    try {
      // Prepare context for assistant
      const context = {
        userId: isAuthenticated ? user?.id : 'anonymous',
        products: products,
        cartItems: cart,
        currentProduct: options.currentProduct,
        userProfile: {
          isAuthenticated,
          preferences: user?.preferences || {}
        }
      };

      // Simulate typing delay for better UX
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(async () => {
        try {
          // Process message with AI assistant
          const response = await shoppingAssistant.processMessage(messageText, context);
          
          setChatState(prev => ({
            ...prev,
            messages: [...prev.messages, response.message],
            isTyping: false
          }));

          // Track assistant response
          trackBehavior('chat', 'message_received', {
            intent: response.message.intent,
            hasProducts: response.message.products?.length > 0,
            hasSuggestions: response.message.suggestions?.length > 0
          });

        } catch (error) {
          console.error('Error processing message:', error);
          
          const errorMessage = {
            id: Date.now(),
            text: "I'm sorry, I encountered an issue processing your message. Please try again or rephrase your question.",
            timestamp: new Date(),
            type: 'assistant',
            isError: true
          };

          setChatState(prev => ({
            ...prev,
            messages: [...prev.messages, errorMessage],
            isTyping: false
          }));
        }
      }, Math.random() * 1000 + 500); // 0.5-1.5 second delay

    } catch (error) {
      console.error('Error sending message:', error);
      setChatState(prev => ({ ...prev, isTyping: false }));
    }
  }, [user, isAuthenticated, products, cart, trackBehavior]);

  // Send quick suggestion
  const sendSuggestion = useCallback((suggestion) => {
    sendMessage(suggestion);
  }, [sendMessage]);

  // Open/close chat
  const toggleChat = useCallback(() => {
    setChatState(prev => ({
      ...prev,
      isOpen: !prev.isOpen,
      unreadCount: prev.isOpen ? prev.unreadCount : 0
    }));
  }, []);

  const openChat = useCallback(() => {
    setChatState(prev => ({
      ...prev,
      isOpen: true,
      unreadCount: 0
    }));
  }, []);

  const closeChat = useCallback(() => {
    setChatState(prev => ({
      ...prev,
      isOpen: false
    }));
  }, []);

  // Clear conversation
  const clearConversation = useCallback(() => {
    shoppingAssistant.resetConversation();
    setChatState(prev => ({
      ...prev,
      messages: prev.messages.filter(msg => msg.type === 'assistant' && msg.text.includes('shopping assistant'))
    }));
  }, []);

  // Mark messages as read
  const markAsRead = useCallback(() => {
    setChatState(prev => ({
      ...prev,
      unreadCount: 0
    }));
  }, []);

  // Get conversation insights
  const getConversationInsights = useCallback(() => {
    return shoppingAssistant.getConversationSummary();
  }, []);

  // Start product-specific conversation
  const startProductConversation = useCallback((product) => {
    const message = `Tell me about ${product.name}`;
    sendMessage(message, { currentProduct: product });
  }, [sendMessage]);

  // Quick actions
  const quickActions = {
    askForRecommendations: () => sendMessage("Can you recommend some products for me?"),
    askAboutDeals: () => sendMessage("What deals do you have today?"),
    askForHelp: () => sendMessage("I need help finding something"),
    askAboutShipping: () => sendMessage("How does shipping work?"),
    compareProducts: () => sendMessage("Help me compare products"),
    checkCart: () => sendMessage("Can you help me with my cart?")
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Update unread count when new assistant messages arrive
  useEffect(() => {
    if (!chatState.isOpen && chatState.messages.length > 0) {
      const lastMessage = chatState.messages[chatState.messages.length - 1];
      if (lastMessage.type === 'assistant' && !lastMessage.isWelcome) {
        setChatState(prev => ({
          ...prev,
          unreadCount: prev.unreadCount + 1
        }));
      }
    }
  }, [chatState.messages, chatState.isOpen]);

  return {
    // Chat state
    chatState,
    assistantStatus,
    
    // Chat actions
    sendMessage,
    sendSuggestion,
    toggleChat,
    openChat,
    closeChat,
    clearConversation,
    markAsRead,
    
    // Product-specific actions
    startProductConversation,
    
    // Quick actions
    quickActions,
    
    // Insights and analytics
    getConversationInsights,
    
    // Computed values
    hasUnreadMessages: chatState.unreadCount > 0,
    isTyping: chatState.isTyping,
    isOpen: chatState.isOpen,
    messageCount: chatState.messages.length,
    lastMessage: chatState.messages[chatState.messages.length - 1] || null
  };
};

// Hook for assistant analytics
export const useAssistantAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    totalConversations: 0,
    averageMessageLength: 0,
    topIntents: [],
    userSatisfaction: 0,
    responseTime: 0,
    conversionRate: 0,
    loading: true
  });

  useEffect(() => {
    // Mock analytics data - in real app would come from backend
    const loadAnalytics = () => {
      setAnalytics({
        totalConversations: 1247,
        averageMessageLength: 12.5,
        topIntents: [
          { intent: 'product_search', count: 45 },
          { intent: 'recommendation_request', count: 32 },
          { intent: 'product_question', count: 28 }
        ],
        userSatisfaction: 4.6,
        responseTime: 0.8,
        conversionRate: 0.23,
        loading: false
      });
    };

    const timer = setTimeout(loadAnalytics, 1000);
    return () => clearTimeout(timer);
  }, []);

  return analytics;
};