import React from 'react';
import { DashboardLayout, DashboardPage } from '../components/dashboard/dashboard-layout';
import { RiskManagement } from '../components/dashboard/risk-management';

const RiskPage: React.FC = () => {
  return (
    <DashboardLayout defaultTab="risk">
      <DashboardPage 
        title="Risk Management" 
        description="Monitor and manage portfolio risks"
      >
        <RiskManagement />
      </DashboardPage>
    </DashboardLayout>
  );
};

export default RiskPage;