import React from 'react';
import AdvancedAnalyticsDashboard from '../components/Analytics/AdvancedAnalyticsDashboard';
import { useAdvancedAnalytics } from '../hooks/useAdvancedAnalytics';

const AdvancedAnalyticsPage = () => {
  const analytics = useAdvancedAnalytics();

  // Track page view for analytics page
  React.useEffect(() => {
    analytics.trackCustomEvent('analytics_dashboard_view', {
      timestamp: new Date().toISOString()
    });
  }, [analytics]);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdvancedAnalyticsDashboard />
    </div>
  );
};

export default AdvancedAnalyticsPage;