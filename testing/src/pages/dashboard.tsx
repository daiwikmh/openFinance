import React, { useState } from 'react';
import { DashboardLayout, DashboardPage } from '../components/dashboard/dashboard-layout';
import { MarketAnalytics } from '../components/dashboard/market-analytics';
import { PortfolioOverview } from '../components/dashboard/portfolio-overview';
import { RiskManagement } from '../components/dashboard/risk-management';
import { TradingBots } from '../components/dashboard/trading-bots';
import { TradingInterface } from '../components/dashboard/trading-interface';
import { TransactionHistory } from '../components/dashboard/transaction-history';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <DashboardPage 
            title="Portfolio Overview" 
            description="Monitor your assets and performance"
          >
            <PortfolioOverview />
          </DashboardPage>
        );
      case "trading":
        return (
          <DashboardPage 
            title="Trading Interface" 
            description="Execute trades and manage positions"
          >
            <TradingInterface />
          </DashboardPage>
        );
      case "analytics":
        return (
          <DashboardPage 
            title="Market Analytics" 
            description="Market insights and data analysis"
          >
            <MarketAnalytics />
          </DashboardPage>
        );
      case "risk":
        return (
          <DashboardPage 
            title="Risk Management" 
            description="Monitor and manage portfolio risks"
          >
            <RiskManagement />
          </DashboardPage>
        );
      case "bots":
        return (
          <DashboardPage 
            title="Trading Bots" 
            description="Automated trading strategies"
          >
            <TradingBots />
          </DashboardPage>
        );
      // case "ai-leverage":
      //   return (
      //     <DashboardPage 
      //       title="AI Leverage Monitor" 
      //       description="AI-powered leverage monitoring and risk management"
      //     >
      //       <div className="space-y-8">
      //         <LeverageDashboard />
      //         <AIMarketAnalyzer />
      //       </div>
      //     </DashboardPage>
      //   );
      case "history":
        return (
          <DashboardPage 
            title="Transaction History" 
            description="View your trading history and activity"
          >
            <TransactionHistory />
          </DashboardPage>
        );
      default:
        return (
          <DashboardPage 
            title="Portfolio Overview" 
            description="Monitor your assets and performance"
          >
            <PortfolioOverview />
          </DashboardPage>
        );
    }
  };

  return (
    <DashboardLayout currentTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </DashboardLayout>
  );
};

export default Dashboard;