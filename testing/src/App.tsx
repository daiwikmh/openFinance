import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router';
import LandingPage from './pages/landing';
import Dashboard from './pages/dashboard';
import PortfolioPage from './pages/portfolio-page';
import TradingPage from './pages/trading-page';
import AnalyticsPage from './pages/analytics-page';
import RiskPage from './pages/risk-page';
import BotsPage from './pages/bots-page';
import HistoryPage from './pages/history-page';
import OGDeFiDemo from './pages/og-defi-demo';

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} /> 
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/portfolio" element={<PortfolioPage />} />
                <Route path="/trading" element={<TradingPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/risk" element={<RiskPage />} />
                <Route path="/bots" element={<BotsPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/og-defi" element={<OGDeFiDemo />} />
            </Routes>
        </Router>
    );
};

export default App;