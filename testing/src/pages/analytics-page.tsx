import React from 'react';
import { DashboardLayout, DashboardPage } from '../components/dashboard/dashboard-layout';
import { MarketAnalytics } from '../components/dashboard/market-analytics';

const AnalyticsPage: React.FC = () => {
  return (
    <DashboardLayout defaultTab="analytics">
      <DashboardPage 
        title="Market Analytics" 
        description="Market insights and data analysis"
      >
        <MarketAnalytics />
      </DashboardPage>
    </DashboardLayout>
  );
};

export default AnalyticsPage;