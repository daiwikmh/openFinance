import React from 'react';
import { DashboardLayout, DashboardPage } from '../components/dashboard/dashboard-layout';
import { TradingInterface } from '../components/dashboard/trading-interface';

const TradingPage: React.FC = () => {
  return (
    <DashboardLayout defaultTab="trading">
      <DashboardPage 
        title="Trading Interface" 
        description="Execute trades and manage positions"
      >
        <TradingInterface />
      </DashboardPage>
    </DashboardLayout>
  );
};

export default TradingPage;