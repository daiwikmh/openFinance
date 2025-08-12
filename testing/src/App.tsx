import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router';
import LandingPage from './pages/landing';

// const LandingPage = () => <div>Landing Page - Under Construction</div>;

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} /> 
                <Route path="/dashboard" element={<LandingPage />} /> 

         
            </Routes>
        </Router>
    );
};

export default App;