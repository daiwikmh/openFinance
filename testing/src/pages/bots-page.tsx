import React from 'react';
import { DashboardLayout, DashboardPage } from '../components/dashboard/dashboard-layout';
import { TradingBots } from '../components/dashboard/trading-bots';

const BotsPage: React.FC = () => {
  return (
    <DashboardLayout defaultTab="bots">
      <DashboardPage 
        title="Trading Bots" 
        description="Automated trading strategies"
      >
        <TradingBots />
      </DashboardPage>
    </DashboardLayout>
  );
};

export default BotsPage;