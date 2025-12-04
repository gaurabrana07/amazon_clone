// AI Shopping Assistant - Intelligent chatbot for e-commerce assistance
// Provides product recommendations, answers questions, and guides shopping decisions

class ShoppingAssistant {
  constructor() {
    this.conversationHistory = [];
    this.userProfile = {
      preferences: {},
      purchaseHistory: [],
      budget: null,
      currentCart: [],
      interests: []
    };
    this.contextMemory = new Map();
    this.intentClassifier = new IntentClassifier();
    this.productRecommender = null; // Will be injected
    this.initializeKnowledgeBase();
  }

  // Initialize knowledge base with common shopping scenarios
  initializeKnowledgeBase() {
    this.knowledgeBase = {
      greetings: [
        "Hello! I'm your AI shopping assistant. How can I help you find the perfect product today?",
        "Hi there! I'm here to help you discover amazing products. What are you looking for?",
        "Welcome! I'm your personal shopping AI. Ready to find something special?"
      ],
      
      productCategories: {
        electronics: {
          keywords: ['phone', 'laptop', 'headphones', 'tablet', 'camera', 'tv', 'gaming'],
          questions: [
            "What's your budget for this item?",
            "Do you have a preferred brand?",
            "What will you primarily use it for?"
          ]
        },
        fashion: {
          keywords: ['clothes', 'shoes', 'dress', 'shirt', 'jacket', 'bag', 'jewelry'],
          questions: [
            "What size are you looking for?",
            "Do you have a color preference?",
            "What's the occasion?"
          ]
        },
        home: {
          keywords: ['furniture', 'kitchen', 'decor', 'appliance', 'bedding'],
          questions: [
            "What room is this for?",
            "What's your preferred style?",
            "Do you have space constraints?"
          ]
        },
        books: {
          keywords: ['book', 'novel', 'textbook', 'magazine', 'reading'],
          questions: [
            "What genre do you enjoy?",
            "Fiction or non-fiction?",
            "Any specific topics you're interested in?"
          ]
        }
      },

      commonQuestions: {
        "shipping": "We offer free shipping on orders over $35. Standard delivery takes 3-5 business days, and Prime members get free 2-day shipping!",
        "returns": "You can return most items within 30 days for a full refund. Items must be in original condition.",
        "warranty": "Warranty varies by product. Electronics typically come with 1-year manufacturer warranty.",
        "payment": "We accept all major credit cards, PayPal, Apple Pay, and Amazon Pay.",
        "deals": "Check out our deals section for daily discounts and special offers!"
      },

      shoppingTips: [
        "💡 Tip: Check customer reviews and ratings before purchasing!",
        "💡 Tip: Compare prices across different brands for the best value.",
        "💡 Tip: Add items to your wishlist to track price changes.",
        "💡 Tip: Bundle similar items together to save on shipping."
      ]
    };
  }

  // Process user message and generate response
  async processMessage(message, context = {}) {
    const userMessage = {
      id: Date.now(),
      text: message,
      timestamp: new Date(),
      type: 'user'
    };

    this.conversationHistory.push(userMessage);

    // Analyze user intent
    const intent = this.intentClassifier.classify(message, this.conversationHistory);
    
    // Update context memory
    this.updateContextMemory(message, intent, context);

    // Generate appropriate response
    const response = await this.generateResponse(intent, message, context);

    const assistantMessage = {
      id: Date.now() + 1,
      text: response.text,
      timestamp: new Date(),
      type: 'assistant',
      intent: intent.type,
      suggestions: response.suggestions || [],
      products: response.products || [],
      actions: response.actions || []
    };

    this.conversationHistory.push(assistantMessage);

    return {
      message: assistantMessage,
      conversationHistory: this.conversationHistory,
      userProfile: this.userProfile
    };
  }

  // Update context memory with conversation details
  updateContextMemory(message, intent, context) {
    const lowerMessage = message.toLowerCase();

    // Extract budget information
    const budgetMatch = lowerMessage.match(/\$?(\d+)/);
    if (budgetMatch && (lowerMessage.includes('budget') || lowerMessage.includes('under') || lowerMessage.includes('max'))) {
      this.userProfile.budget = parseInt(budgetMatch[1]);
      this.contextMemory.set('budget', this.userProfile.budget);
    }

    // Extract category preferences
    Object.entries(this.knowledgeBase.productCategories).forEach(([category, data]) => {
      if (data.keywords.some(keyword => lowerMessage.includes(keyword))) {
        this.contextMemory.set('category', category);
        this.userProfile.interests.push(category);
      }
    });

    // Extract brand preferences
    const brands = ['apple', 'samsung', 'nike', 'adidas', 'sony', 'lg'];
    brands.forEach(brand => {
      if (lowerMessage.includes(brand)) {
        this.contextMemory.set('brand', brand);
      }
    });

    // Update current context
    if (context.currentProduct) {
      this.contextMemory.set('currentProduct', context.currentProduct);
    }
    if (context.cartItems) {
      this.userProfile.currentCart = context.cartItems;
    }
  }

  // Generate contextual response based on intent
  async generateResponse(intent, message, context) {
    switch (intent.type) {
      case 'greeting':
        return this.handleGreeting();
      
      case 'product_search':
        return await this.handleProductSearch(intent, message, context);
      
      case 'product_question':
        return this.handleProductQuestion(intent, message, context);
      
      case 'recommendation_request':
        return await this.handleRecommendationRequest(intent, message, context);
      
      case 'comparison_request':
        return await this.handleComparisonRequest(intent, message, context);
      
      case 'budget_inquiry':
        return this.handleBudgetInquiry(intent, message);
      
      case 'shipping_inquiry':
      case 'return_inquiry':
      case 'payment_inquiry':
        return this.handleGeneralInquiry(intent);
      
      case 'cart_assistance':
        return this.handleCartAssistance(intent, message, context);
      
      case 'deal_inquiry':
        return await this.handleDealInquiry(intent, message, context);
      
      default:
        return this.handleGeneral(message);
    }
  }

  // Handle greeting messages
  handleGreeting() {
    const greeting = this.knowledgeBase.greetings[
      Math.floor(Math.random() * this.knowledgeBase.greetings.length)
    ];
    
    return {
      text: greeting,
      suggestions: [
        "Show me trending products",
        "I'm looking for electronics",
        "What deals do you have?",
        "Help me find a gift"
      ]
    };
  }

  // Handle product search requests
  async handleProductSearch(intent, message, context) {
    const category = this.contextMemory.get('category');
    const budget = this.contextMemory.get('budget');
    const brand = this.contextMemory.get('brand');

    let responseText = `I'd be happy to help you find `;
    
    if (category) {
      responseText += `${category} products`;
    } else {
      responseText += `what you're looking for`;
    }

    if (budget) {
      responseText += ` within your $${budget} budget`;
    }

    if (brand) {
      responseText += ` from ${brand}`;
    }

    responseText += `. Let me search for the best options for you!`;

    // Get product recommendations if recommender is available
    let products = [];
    if (this.productRecommender && context.products) {
      const searchQuery = this.extractSearchQuery(message);
      products = await this.productRecommender.searchProducts(searchQuery, context.products);
    }

    const categoryQuestions = category ? 
      this.knowledgeBase.productCategories[category]?.questions || [] : [];

    return {
      text: responseText,
      products: products.slice(0, 5), // Show top 5 products
      suggestions: [
        ...categoryQuestions.slice(0, 2),
        "Show me more options",
        "Compare top products"
      ]
    };
  }

  // Handle product-specific questions
  handleProductQuestion(intent, message, context) {
    const currentProduct = this.contextMemory.get('currentProduct') || context.currentProduct;
    
    if (!currentProduct) {
      return {
        text: "I'd be happy to answer questions about a specific product! Which product are you interested in?",
        suggestions: ["Show me product details", "Find similar products"]
      };
    }

    const lowerMessage = message.toLowerCase();
    let response = `Great question about ${currentProduct.name}! `;

    if (lowerMessage.includes('review') || lowerMessage.includes('rating')) {
      response += `This product has a ${currentProduct.rating || 4.0}⭐ rating from customers. `;
    }
    
    if (lowerMessage.includes('shipping') || lowerMessage.includes('delivery')) {
      response += `This item qualifies for free shipping and typically arrives in 3-5 business days. `;
    }
    
    if (lowerMessage.includes('return') || lowerMessage.includes('warranty')) {
      response += `You can return this item within 30 days, and it comes with manufacturer warranty. `;
    }

    if (lowerMessage.includes('compatible') || lowerMessage.includes('work with')) {
      response += `Let me help you check compatibility. What device or system are you planning to use it with? `;
    }

    return {
      text: response,
      suggestions: [
        "Show similar products",
        "Add to cart",
        "Compare with other options",
        "Read customer reviews"
      ]
    };
  }

  // Handle recommendation requests
  async handleRecommendationRequest(intent, message, context) {
    const budget = this.contextMemory.get('budget');
    const category = this.contextMemory.get('category');
    
    let responseText = "Based on your preferences, here are my top recommendations:\n\n";
    
    if (budget) {
      responseText += `💰 Within your $${budget} budget\n`;
    }
    
    if (category) {
      responseText += `🏷️ ${category.charAt(0).toUpperCase() + category.slice(1)} category\n`;
    }

    responseText += `⭐ Highly rated by customers\n\nWould you like me to explain why I recommend these products?`;

    // Get personalized recommendations
    let products = [];
    if (this.productRecommender && context.products) {
      products = await this.productRecommender.getPersonalizedRecommendations(
        context.userId || 'anonymous', 
        context.products, 
        5
      );
    }

    return {
      text: responseText,
      products: products,
      suggestions: [
        "Why do you recommend these?",
        "Show me more options",
        "Compare these products",
        "What's the best value?"
      ]
    };
  }

  // Handle product comparison requests
  async handleComparisonRequest(intent, message, context) {
    return {
      text: "I'll help you compare products! Here's what I look at when comparing:\n\n" +
            "📊 **Key Factors:**\n" +
            "• Price and value for money\n" +
            "• Customer ratings and reviews\n" +
            "• Features and specifications\n" +
            "• Brand reputation\n" +
            "• Warranty and support\n\n" +
            "Which specific products would you like me to compare?",
      suggestions: [
        "Compare top 3 products",
        "Show price comparison",
        "Best value option",
        "Most popular choice"
      ]
    };
  }

  // Handle budget-related inquiries
  handleBudgetInquiry(intent, message) {
    const budget = this.contextMemory.get('budget');
    
    let responseText = budget ? 
      `Perfect! I'll focus on options within your $${budget} budget. ` :
      `I'd be happy to help you find products within your budget. `;

    responseText += "Here are some tips for getting the best value:\n\n" +
                   "💡 **Smart Shopping Tips:**\n" +
                   "• Check for seasonal sales and discounts\n" +
                   "• Consider slightly older models for better prices\n" +
                   "• Look for bundle deals\n" +
                   "• Read customer reviews for real value assessment\n\n" +
                   "What's your target budget range?";

    return {
      text: responseText,
      suggestions: [
        "Under $50",
        "$50 - $100", 
        "$100 - $500",
        "Show me current deals"
      ]
    };
  }

  // Handle general inquiries (shipping, returns, etc.)
  handleGeneralInquiry(intent) {
    const inquiryType = intent.type.replace('_inquiry', '');
    const answer = this.knowledgeBase.commonQuestions[inquiryType];
    
    return {
      text: answer || "I'd be happy to help! Could you be more specific about what you'd like to know?",
      suggestions: [
        "Shipping information",
        "Return policy", 
        "Payment options",
        "Contact support"
      ]
    };
  }

  // Handle cart assistance
  handleCartAssistance(intent, message, context) {
    const cartItems = context.cartItems || this.userProfile.currentCart;
    
    if (!cartItems || cartItems.length === 0) {
      return {
        text: "Your cart is currently empty. Let me help you find some great products to add!",
        suggestions: [
          "Show trending products",
          "Browse categories",
          "Find deals",
          "Get recommendations"
        ]
      };
    }

    const total = cartItems.reduce((sum, item) => sum + item.price, 0);
    
    return {
      text: `You have ${cartItems.length} item(s) in your cart with a total of $${total.toFixed(2)}.\n\n` +
            "💡 **Cart Optimization:**\n" +
            "• Add $" + (35 - total > 0 ? (35 - total).toFixed(2) : "0") + " more for free shipping\n" +
            "• Check for bundle discounts\n" +
            "• Review for forgotten essentials\n\n" +
            "Would you like me to suggest items that go well with your current selection?",
      suggestions: [
        "Show recommended additions",
        "Check for discounts",
        "Proceed to checkout",
        "Remove items"
      ]
    };
  }

  // Handle deal inquiries
  async handleDealInquiry(intent, message, context) {
    const tip = this.knowledgeBase.shoppingTips[
      Math.floor(Math.random() * this.knowledgeBase.shoppingTips.length)
    ];

    return {
      text: "Great question! Here are today's best deals and offers:\n\n" +
            "🔥 **Current Promotions:**\n" +
            "• Free shipping on orders over $35\n" +
            "• Up to 30% off electronics\n" +
            "• Buy 2 Get 1 Free on select books\n" +
            "• Flash sale on fashion items\n\n" +
            tip,
      suggestions: [
        "Show electronics deals",
        "Fashion discounts",
        "Today's flash sales",
        "Clearance items"
      ]
    };
  }

  // Handle general/fallback responses
  handleGeneral(message) {
    const responses = [
      "I want to make sure I give you the best help possible. Could you tell me more about what you're looking for?",
      "I'm here to help you find exactly what you need! What product or category interests you most?",
      "Let me assist you better - are you looking for a specific product, or would you like recommendations?"
    ];

    return {
      text: responses[Math.floor(Math.random() * responses.length)],
      suggestions: [
        "I'm looking for electronics",
        "Show me deals",
        "Help me choose a gift",
        "Browse categories"
      ]
    };
  }

  // Extract search query from natural language
  extractSearchQuery(message) {
    // Remove common words and extract product-related terms
    const stopWords = ['i', 'am', 'looking', 'for', 'want', 'need', 'find', 'show', 'me'];
    const words = message.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(' ')
      .filter(word => !stopWords.includes(word) && word.length > 2);
    
    return words.join(' ');
  }

  // Get conversation summary
  getConversationSummary() {
    return {
      messageCount: this.conversationHistory.length,
      userProfile: this.userProfile,
      lastIntent: this.conversationHistory[this.conversationHistory.length - 1]?.intent,
      context: Object.fromEntries(this.contextMemory)
    };
  }

  // Reset conversation
  resetConversation() {
    this.conversationHistory = [];
    this.contextMemory.clear();
    this.userProfile = {
      preferences: {},
      purchaseHistory: [],
      budget: null,
      currentCart: [],
      interests: []
    };
  }

  // Set product recommender
  setProductRecommender(recommender) {
    this.productRecommender = recommender;
  }
}

// Intent Classification System
class IntentClassifier {
  constructor() {
    this.patterns = {
      greeting: /^(hi|hello|hey|good\s+(morning|afternoon|evening))/i,
      product_search: /(looking for|want|need|find|search|show me).+(product|item)/i,
      recommendation_request: /(recommend|suggest|what should|best|top|good)/i,
      product_question: /(tell me about|what is|how does|is this|does this)/i,
      comparison_request: /(compare|vs|versus|difference|better|which)/i,
      budget_inquiry: /(budget|price|cost|cheap|expensive|afford)/i,
      shipping_inquiry: /(shipping|delivery|when will|how long)/i,
      return_inquiry: /(return|refund|exchange|send back)/i,
      payment_inquiry: /(payment|pay|credit card|paypal)/i,
      cart_assistance: /(cart|basket|add|remove|checkout)/i,
      deal_inquiry: /(deal|discount|sale|offer|promotion|coupon)/i
    };
  }

  classify(message, history = []) {
    const lowerMessage = message.toLowerCase();
    
    // Check each pattern
    for (const [intentType, pattern] of Object.entries(this.patterns)) {
      if (pattern.test(lowerMessage)) {
        return {
          type: intentType,
          confidence: this.calculateConfidence(lowerMessage, pattern),
          context: this.extractContext(lowerMessage, intentType)
        };
      }
    }

    // Default to general if no pattern matches
    return {
      type: 'general',
      confidence: 0.5,
      context: {}
    };
  }

  calculateConfidence(message, pattern) {
    const matches = message.match(pattern);
    return matches ? Math.min(0.9, 0.5 + (matches[0].length / message.length)) : 0.1;
  }

  extractContext(message, intentType) {
    const context = {};
    
    // Extract price/budget information
    const priceMatch = message.match(/\$?(\d+)/);
    if (priceMatch) {
      context.price = parseInt(priceMatch[1]);
    }

    // Extract product categories
    const categories = ['electronics', 'fashion', 'home', 'books', 'sports'];
    categories.forEach(category => {
      if (message.includes(category)) {
        context.category = category;
      }
    });

    return context;
  }
}

// Create singleton instance
const shoppingAssistant = new ShoppingAssistant();

export default shoppingAssistant;