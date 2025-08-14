import React from 'react';
import { DashboardLayout, DashboardPage } from '../components/dashboard/dashboard-layout';
import { OGDeFiDashboard } from '../components/og-dashboard/og-defi-dashboard';

const OGDeFiDemo: React.FC = () => {
  return (
    <DashboardLayout defaultTab="og-defi">
      <DashboardPage 
        title="0G DeFi Platform" 
        description="AI-powered DeFi strategy management on 0G Chain"
      >
        <OGDeFiDashboard />
      </DashboardPage>
    </DashboardLayout>
  );
};

export default OGDeFiDemo;