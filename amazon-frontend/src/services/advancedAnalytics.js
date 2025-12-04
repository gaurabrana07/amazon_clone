// Advanced Analytics Engine for Business Intelligence
// Optimized for performance - lazy initialization and throttled operations
class AdvancedAnalytics {
  constructor() {
    this.events = [];
    this.sessions = {};
    this.currentSession = null;
    this.realTimeMetrics = {};
    this.cohortData = {};
    this.initialized = false;
    this.saveTimeout = null;
    
    // Lazy initialization - don't load from localStorage immediately
  }

  // Lazy initialize when needed
  ensureInitialized() {
    if (this.initialized) return;
    this.initialized = true;
    
    try {
      const savedEvents = localStorage.getItem('analytics_events');
      const savedSessions = localStorage.getItem('analytics_sessions');
      
      // Limit events to last 100 to prevent memory issues
      this.events = savedEvents ? JSON.parse(savedEvents).slice(-100) : [];
      this.sessions = savedSessions ? JSON.parse(savedSessions) : {};
      this.currentSession = this.initializeSession();
      
      // Initialize tracking with throttling
      this.startRealTimeTracking();
    } catch (e) {
      console.warn('Analytics init error:', e);
      this.events = [];
      this.sessions = {};
    }
  }

  // Session Management
  initializeSession() {
    const sessionId = Date.now().toString();
    const session = {
      id: sessionId,
      startTime: new Date().toISOString(),
      events: [],
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };
    
    this.sessions[sessionId] = session;
    this.debouncedSave();
    return session;
  }

  // Event Tracking with Enhanced Metadata
  trackEvent(eventType, eventData = {}) {
    this.ensureInitialized();
    
    if (!this.currentSession) {
      this.currentSession = this.initializeSession();
    }
    
    const event = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: eventType,
      timestamp: new Date().toISOString(),
      sessionId: this.currentSession.id,
      url: window.location.href,
      data: eventData
    };

    // Limit events to prevent memory issues
    if (this.events.length > 100) {
      this.events = this.events.slice(-50);
    }
    
    this.events.push(event);
    this.currentSession.events.push(event.id);
    this.updateRealTimeMetrics(event);
    this.debouncedSave();
    
    return event;
  }
  
  // Debounced save to prevent frequent localStorage writes
  debouncedSave() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.saveToStorage();
    }, 2000);
  }

  // Update real-time metrics when an event is tracked
  updateRealTimeMetrics(event) {
    const now = new Date();
    const eventType = event.type;
    
    // Initialize metrics if not exists
    if (!this.realTimeMetrics.events) {
      this.realTimeMetrics = {
        events: [],
        eventCounts: {},
        lastUpdate: now.toISOString()
      };
    }
    
    // Add event to real-time tracking (keep last 50 events)
    this.realTimeMetrics.events.unshift({
      type: eventType,
      timestamp: event.timestamp,
      data: event.data
    });
    this.realTimeMetrics.events = this.realTimeMetrics.events.slice(0, 100);
    
    // Update event counts
    this.realTimeMetrics.eventCounts[eventType] = 
      (this.realTimeMetrics.eventCounts[eventType] || 0) + 1;
    
    this.realTimeMetrics.lastUpdate = now.toISOString();
  }

  // E-commerce Specific Tracking
  trackPurchase(orderData) {
    return this.trackEvent('purchase', {
      orderId: orderData.id,
      revenue: orderData.total,
      items: orderData.items.map(item => ({
        productId: item.id,
        name: item.name,
        category: item.category,
        price: item.price,
        quantity: item.quantity
      })),
      paymentMethod: orderData.paymentMethod,
      shippingCost: orderData.shippingCost
    });
  }

  trackProductView(product) {
    return this.trackEvent('product_view', {
      productId: product.id,
      productName: product.name,
      category: product.category,
      price: product.price,
      timeOnPage: Date.now()
    });
  }

  trackAddToCart(product, quantity = 1) {
    return this.trackEvent('add_to_cart', {
      productId: product.id,
      productName: product.name,
      category: product.category,
      price: product.price,
      quantity: quantity,
      cartValue: this.calculateCartValue()
    });
  }

  trackSearchQuery(query, results) {
    return this.trackEvent('search', {
      query: query,
      resultsCount: results.length,
      hasResults: results.length > 0,
      searchType: this.classifySearchType(query)
    });
  }

  // User Journey Analysis
  analyzeUserJourney(sessionId = this.currentSession.id) {
    const session = this.sessions[sessionId];
    if (!session) return null;

    const events = this.events.filter(e => e.sessionId === sessionId);
    const journey = {
      sessionId,
      duration: this.calculateSessionDuration(session),
      pageViews: events.filter(e => e.type === 'page_view').length,
      interactions: events.filter(e => e.type !== 'page_view').length,
      conversionPath: this.buildConversionPath(events),
      exitPage: this.getExitPage(events),
      bounceRate: this.calculateBounceRate(events)
    };

    return journey;
  }

  // Revenue Analytics
  calculateRevenueMetrics(timeRange = 30) {
    const startDate = new Date(Date.now() - timeRange * 24 * 60 * 60 * 1000);
    const purchases = this.events.filter(e => 
      e.type === 'purchase' && new Date(e.timestamp) >= startDate
    );

    const metrics = {
      totalRevenue: purchases.reduce((sum, p) => sum + (p.data.revenue || 0), 0),
      totalOrders: purchases.length,
      averageOrderValue: 0,
      revenueByDay: this.groupRevenueByDay(purchases),
      topProducts: this.getTopProductsByRevenue(purchases),
      conversionRate: this.calculateConversionRate(timeRange)
    };

    metrics.averageOrderValue = metrics.totalOrders > 0 
      ? metrics.totalRevenue / metrics.totalOrders 
      : 0;

    return metrics;
  }

  // Customer Segmentation
  segmentCustomers() {
    const customers = this.getCustomerData();
    const segments = {
      champions: [],      // High value, recent purchase
      loyalCustomers: [], // Regular purchasers
      potentialLoyal: [], // Recent customers with good value
      newCustomers: [],   // Recent first-time buyers
      promising: [],      // Recent customers
      needsAttention: [], // Below average but recent
      aboutToSleep: [],   // Declining engagement
      atRisk: [],        // Haven't purchased recently
      cannotLose: [],    // High value but declining
      hibernating: []    // Long time since last purchase
    };

    customers.forEach(customer => {
      const segment = this.classifyCustomer(customer);
      segments[segment].push(customer);
    });

    return segments;
  }

  // Cohort Analysis
  generateCohortAnalysis() {
    const cohorts = {};
    const purchases = this.events.filter(e => e.type === 'purchase');
    
    purchases.forEach(purchase => {
      const cohortMonth = this.getCohortMonth(purchase.timestamp);
      if (!cohorts[cohortMonth]) {
        cohorts[cohortMonth] = {
          month: cohortMonth,
          customers: new Set(),
          revenue: 0,
          retentionByMonth: {}
        };
      }
      
      cohorts[cohortMonth].customers.add(purchase.data.customerId);
      cohorts[cohortMonth].revenue += purchase.data.revenue || 0;
    });

    // Calculate retention rates
    Object.keys(cohorts).forEach(cohortMonth => {
      this.calculateRetentionRates(cohorts[cohortMonth]);
    });

    return cohorts;
  }

  // Product Performance Analytics
  analyzeProductPerformance() {
    const productMetrics = {};
    
    this.events.forEach(event => {
      const productId = event.data.productId;
      if (!productId) return;

      if (!productMetrics[productId]) {
        productMetrics[productId] = {
          productId,
          productName: event.data.productName,
          views: 0,
          addToCarts: 0,
          purchases: 0,
          revenue: 0,
          conversionRate: 0,
          addToCartRate: 0
        };
      }

      const metrics = productMetrics[productId];
      
      switch (event.type) {
        case 'product_view':
          metrics.views++;
          break;
        case 'add_to_cart':
          metrics.addToCarts++;
          break;
        case 'purchase':
          if (event.data.items) {
            const item = event.data.items.find(i => i.productId === productId);
            if (item) {
              metrics.purchases += item.quantity;
              metrics.revenue += item.price * item.quantity;
            }
          }
          break;
      }
    });

    // Calculate rates
    Object.values(productMetrics).forEach(metrics => {
      metrics.addToCartRate = metrics.views > 0 ? metrics.addToCarts / metrics.views : 0;
      metrics.conversionRate = metrics.views > 0 ? metrics.purchases / metrics.views : 0;
    });

    return Object.values(productMetrics);
  }

  // Real-time Dashboard Metrics
  getRealTimeMetrics() {
    const now = new Date();
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    const recentEvents = this.events.filter(e => new Date(e.timestamp) >= hourAgo);
    
    return {
      activeUsers: this.getActiveUsers(),
      pageViewsLastHour: recentEvents.filter(e => e.type === 'page_view').length,
      conversionsLastHour: recentEvents.filter(e => e.type === 'purchase').length,
      revenueLastHour: recentEvents
        .filter(e => e.type === 'purchase')
        .reduce((sum, e) => sum + (e.data.revenue || 0), 0),
      topPages: this.getTopPages(recentEvents),
      topProducts: this.getTopProducts(recentEvents),
      deviceBreakdown: this.getDeviceBreakdown(recentEvents),
      trafficSources: this.getTrafficSources(recentEvents)
    };
  }

  // Predictive Analytics
  predictCustomerLifetimeValue(customerId) {
    const customerEvents = this.events.filter(e => e.data.customerId === customerId);
    const purchases = customerEvents.filter(e => e.type === 'purchase');
    
    if (purchases.length === 0) return 0;

    const totalRevenue = purchases.reduce((sum, p) => sum + (p.data.revenue || 0), 0);
    const averageOrderValue = totalRevenue / purchases.length;
    const daysSinceFirstPurchase = this.getDaysSince(purchases[0].timestamp);
    const purchaseFrequency = purchases.length / (daysSinceFirstPurchase / 365);
    
    // Simple CLV calculation: AOV × Purchase Frequency × Customer Lifespan
    const estimatedLifespan = 2; // years
    return averageOrderValue * purchaseFrequency * estimatedLifespan;
  }

  // A/B Testing Framework
  createABTest(testName, variants) {
    const test = {
      id: Date.now().toString(),
      name: testName,
      variants: variants,
      startDate: new Date().toISOString(),
      status: 'active',
      participants: {},
      results: {}
    };

    const tests = JSON.parse(localStorage.getItem('ab_tests') || '{}');
    tests[test.id] = test;
    localStorage.setItem('ab_tests', JSON.stringify(tests));
    
    return test;
  }

  assignUserToVariant(testId, userId) {
    const tests = JSON.parse(localStorage.getItem('ab_tests') || '{}');
    const test = tests[testId];
    
    if (!test || test.status !== 'active') return null;

    // Consistent assignment based on user ID
    const hash = this.hashCode(userId + testId);
    const variantIndex = Math.abs(hash) % test.variants.length;
    const variant = test.variants[variantIndex];

    test.participants[userId] = variant;
    localStorage.setItem('ab_tests', JSON.stringify(tests));
    
    return variant;
  }

  // Helper Methods
  startRealTimeTracking() {
    // Debounce function to prevent too many events
    const debounce = (func, wait) => {
      let timeout;
      return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
      };
    };

    // Track page visibility changes (no debounce needed - infrequent event)
    document.addEventListener('visibilitychange', () => {
      try {
        this.trackEvent('page_visibility', { 
          hidden: document.hidden 
        });
      } catch (e) {
        console.warn('Error tracking visibility:', e);
      }
    });

    // Track scroll depth with debouncing
    let maxScroll = 0;
    let lastTrackedScroll = 0;
    const handleScroll = debounce(() => {
      try {
        const scrollHeight = document.body.scrollHeight - window.innerHeight;
        if (scrollHeight <= 0) return; // Prevent division by zero
        
        const scrollPercent = Math.round((window.scrollY / scrollHeight) * 100);
        if (scrollPercent > maxScroll && scrollPercent >= lastTrackedScroll + 25) {
          maxScroll = scrollPercent;
          const milestone = Math.floor(scrollPercent / 25) * 25;
          if (milestone > lastTrackedScroll) {
            lastTrackedScroll = milestone;
            this.trackEvent('scroll_depth', { percent: milestone });
          }
        }
      } catch (e) {
        console.warn('Error tracking scroll:', e);
      }
    }, 500); // Debounce by 500ms

    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  classifySearchType(query) {
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('cheap') || lowerQuery.includes('discount') || lowerQuery.includes('sale')) {
      return 'price_focused';
    } else if (lowerQuery.includes('best') || lowerQuery.includes('top') || lowerQuery.includes('review')) {
      return 'quality_focused';
    } else if (lowerQuery.includes('new') || lowerQuery.includes('latest')) {
      return 'trend_focused';
    }
    return 'general';
  }

  calculateCartValue() {
    // This would integrate with your cart context
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  saveToStorage() {
    try {
      // Keep only last 100 events to prevent localStorage bloat
      localStorage.setItem('analytics_events', JSON.stringify(this.events.slice(-100)));
      // Keep only last 10 sessions
      const sessionKeys = Object.keys(this.sessions).slice(-10);
      const limitedSessions = {};
      sessionKeys.forEach(key => { limitedSessions[key] = this.sessions[key]; });
      localStorage.setItem('analytics_sessions', JSON.stringify(limitedSessions));
    } catch (e) {
      console.warn('Failed to save analytics:', e);
    }
  }

  hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash;
  }

  getActiveUsers() {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const recentSessions = Object.values(this.sessions).filter(
      session => new Date(session.startTime) >= fifteenMinutesAgo
    );
    return recentSessions.length;
  }

  getDaysSince(timestamp) {
    return Math.floor((Date.now() - new Date(timestamp).getTime()) / (1000 * 60 * 60 * 24));
  }

  // Missing helper methods
  groupRevenueByDay(purchases) {
    const byDay = {};
    purchases.forEach(p => {
      const day = new Date(p.timestamp).toISOString().split('T')[0];
      byDay[day] = (byDay[day] || 0) + (p.data.revenue || 0);
    });
    return byDay;
  }

  getTopProductsByRevenue(purchases) {
    const productRevenue = {};
    purchases.forEach(p => {
      if (p.data.items) {
        p.data.items.forEach(item => {
          const id = item.productId || item.id;
          if (id) {
            productRevenue[id] = (productRevenue[id] || 0) + (item.price * (item.quantity || 1));
          }
        });
      }
    });
    return Object.entries(productRevenue)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([id, revenue]) => ({ productId: id, revenue }));
  }

  calculateConversionRate(timeRange) {
    const startDate = new Date(Date.now() - timeRange * 24 * 60 * 60 * 1000);
    const recentEvents = this.events.filter(e => new Date(e.timestamp) >= startDate);
    const views = recentEvents.filter(e => e.type === 'product_view').length;
    const purchases = recentEvents.filter(e => e.type === 'purchase').length;
    return views > 0 ? (purchases / views) * 100 : 0;
  }

  getTopPages(events) {
    const pageCounts = {};
    events.filter(e => e.type === 'page_view').forEach(e => {
      const page = e.url || e.data?.path || 'unknown';
      pageCounts[page] = (pageCounts[page] || 0) + 1;
    });
    return Object.entries(pageCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([page, count]) => ({ page, count }));
  }

  getTopProducts(events) {
    const productCounts = {};
    events.filter(e => e.type === 'product_view' || e.type === 'add_to_cart').forEach(e => {
      const id = e.data?.productId;
      if (id) {
        productCounts[id] = (productCounts[id] || 0) + 1;
      }
    });
    return Object.entries(productCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([productId, count]) => ({ productId, count }));
  }

  getDeviceBreakdown(events) {
    const devices = { mobile: 0, tablet: 0, desktop: 0 };
    events.forEach(e => {
      const ua = e.data?.userAgent || '';
      if (/Mobile|Android|iPhone/i.test(ua)) {
        devices.mobile++;
      } else if (/Tablet|iPad/i.test(ua)) {
        devices.tablet++;
      } else {
        devices.desktop++;
      }
    });
    return devices;
  }

  getTrafficSources(events) {
    const sources = {};
    events.forEach(e => {
      const referrer = e.data?.referrer || 'direct';
      const source = referrer === '' ? 'direct' : new URL(referrer, 'http://localhost').hostname;
      sources[source] = (sources[source] || 0) + 1;
    });
    return sources;
  }

  calculateSessionDuration(session) {
    if (!session || !session.startTime) return 0;
    const events = this.events.filter(e => e.sessionId === session.id);
    if (events.length === 0) return 0;
    const lastEvent = events[events.length - 1];
    return new Date(lastEvent.timestamp) - new Date(session.startTime);
  }

  buildConversionPath(events) {
    return events
      .filter(e => ['page_view', 'product_view', 'add_to_cart', 'purchase'].includes(e.type))
      .map(e => e.type);
  }

  getExitPage(events) {
    const pageViews = events.filter(e => e.type === 'page_view');
    return pageViews.length > 0 ? pageViews[pageViews.length - 1].url : null;
  }

  calculateBounceRate(events) {
    const pageViews = events.filter(e => e.type === 'page_view');
    return pageViews.length <= 1 ? 100 : 0;
  }

  getCustomerData() {
    const customers = {};
    this.events.filter(e => e.data?.customerId || e.data?.userId).forEach(e => {
      const id = e.data.customerId || e.data.userId;
      if (!customers[id]) {
        customers[id] = { id, events: [], purchases: [], totalSpent: 0 };
      }
      customers[id].events.push(e);
      if (e.type === 'purchase') {
        customers[id].purchases.push(e);
        customers[id].totalSpent += e.data.revenue || 0;
      }
    });
    return Object.values(customers);
  }

  classifyCustomer(customer) {
    const daysSinceLast = customer.purchases.length > 0 
      ? this.getDaysSince(customer.purchases[customer.purchases.length - 1].timestamp)
      : 365;
    const purchaseCount = customer.purchases.length;
    const totalSpent = customer.totalSpent;

    if (daysSinceLast < 30 && purchaseCount >= 5 && totalSpent >= 500) return 'champions';
    if (purchaseCount >= 5) return 'loyalCustomers';
    if (daysSinceLast < 30 && purchaseCount >= 2) return 'potentialLoyal';
    if (daysSinceLast < 30 && purchaseCount === 1) return 'newCustomers';
    if (daysSinceLast < 60 && purchaseCount >= 1) return 'promising';
    if (daysSinceLast < 90) return 'needsAttention';
    if (daysSinceLast < 120) return 'aboutToSleep';
    if (totalSpent >= 500 && daysSinceLast >= 90) return 'cannotLose';
    if (daysSinceLast >= 180) return 'hibernating';
    return 'atRisk';
  }

  getCohortMonth(timestamp) {
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  calculateRetentionRates(cohort) {
    // Simple retention calculation placeholder
    cohort.retentionByMonth = {};
    return cohort;
  }

  // Export data for external analysis
  exportAnalyticsData(format = 'json') {
    const data = {
      events: this.events,
      sessions: this.sessions,
      generatedAt: new Date().toISOString(),
      totalEvents: this.events.length,
      totalSessions: Object.keys(this.sessions).length
    };

    if (format === 'csv') {
      return this.convertToCSV(data.events);
    }
    
    return JSON.stringify(data, null, 2);
  }

  convertToCSV(events) {
    if (events.length === 0) return '';
    
    const headers = ['timestamp', 'type', 'sessionId', 'url', 'data'];
    const csvContent = [
      headers.join(','),
      ...events.map(event => [
        event.timestamp,
        event.type,
        event.sessionId,
        event.url,
        JSON.stringify(event.data).replace(/"/g, '""')
      ].join(','))
    ].join('\n');
    
    return csvContent;
  }
}

// Global analytics instance
const advancedAnalytics = new AdvancedAnalytics();

export default advancedAnalytics;