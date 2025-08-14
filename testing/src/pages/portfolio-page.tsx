import React from 'react';
import { DashboardLayout, DashboardPage } from '../components/dashboard/dashboard-layout';
import { PortfolioOverview } from '../components/dashboard/portfolio-overview';

const PortfolioPage: React.FC = () => {
  return (
    <DashboardLayout defaultTab="overview">
      <DashboardPage 
        title="Portfolio Overview" 
        description="Monitor your assets and performance"
      >
        <PortfolioOverview />
      </DashboardPage>
    </DashboardLayout>
  );
};

export default PortfolioPage;