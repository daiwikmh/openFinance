import React from 'react';
import { DashboardLayout, DashboardPage } from '../components/dashboard/dashboard-layout';
import { TransactionHistory } from '../components/dashboard/transaction-history';

const HistoryPage: React.FC = () => {
  return (
    <DashboardLayout defaultTab="history">
      <DashboardPage 
        title="Transaction History" 
        description="View your trading history and activity"
      >
        <TransactionHistory />
      </DashboardPage>
    </DashboardLayout>
  );
};

export default HistoryPage;