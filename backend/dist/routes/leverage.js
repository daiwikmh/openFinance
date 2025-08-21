"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const riskMonitoring_1 = require("../services/riskMonitoring");
const router = express_1.default.Router();
// Get all leverage positions
router.get('/positions', (req, res) => {
    try {
        const positions = (0, riskMonitoring_1.getPositions)();
        res.json({
            success: true,
            data: positions
        });
    }
    catch (error) {
        console.error('Get positions error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch positions'
        });
    }
});
// Get specific position by ID
router.get('/positions/:id', (req, res) => {
    try {
        const { id } = req.params;
        const position = (0, riskMonitoring_1.getPositionById)(id);
        if (!position) {
            return res.status(404).json({
                success: false,
                error: 'Position not found'
            });
        }
        res.json({
            success: true,
            data: position
        });
    }
    catch (error) {
        console.error('Get position error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch position'
        });
    }
});
// Get risk alerts
router.get('/alerts', (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const alerts = (0, riskMonitoring_1.getRiskAlerts)(limit);
        res.json({
            success: true,
            data: alerts
        });
    }
    catch (error) {
        console.error('Get alerts error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch alerts'
        });
    }
});
// Get position risk analysis
router.get('/positions/:id/risk', async (req, res) => {
    try {
        const { id } = req.params;
        const position = (0, riskMonitoring_1.getPositionById)(id);
        if (!position) {
            return res.status(404).json({
                success: false,
                error: 'Position not found'
            });
        }
        // Calculate detailed risk metrics
        const healthFactorRisk = Math.max(0, (1.5 - position.healthFactor) / 1.5);
        const leverageRisk = Math.min(1, position.leverage / 10);
        const liquidationDistance = ((position.currentPrice - position.liquidationPrice) / position.currentPrice) * 100;
        const overallRisk = Math.min(1, (healthFactorRisk * 0.5 + leverageRisk * 0.3));
        let riskLevel;
        let color;
        if (overallRisk >= 0.8) {
            riskLevel = 'Critical';
            color = '#ef4444';
        }
        else if (overallRisk >= 0.6) {
            riskLevel = 'High';
            color = '#f97316';
        }
        else if (overallRisk >= 0.3) {
            riskLevel = 'Medium';
            color = '#eab308';
        }
        else {
            riskLevel = 'Low';
            color = '#22c55e';
        }
        const recommendations = [];
        if (overallRisk >= 0.7) {
            recommendations.push('Consider reducing leverage immediately');
            recommendations.push('Add more collateral to improve health factor');
            recommendations.push('Monitor position closely for liquidation risk');
        }
        else if (overallRisk >= 0.4) {
            recommendations.push('Monitor market conditions carefully');
            recommendations.push('Consider setting stop-loss orders');
        }
        else {
            recommendations.push('Position appears stable');
            recommendations.push('Continue regular monitoring');
        }
        res.json({
            success: true,
            data: {
                positionId: id,
                riskLevel,
                riskScore: overallRisk,
                color,
                metrics: {
                    healthFactor: position.healthFactor,
                    leverage: position.leverage,
                    liquidationDistance: liquidationDistance.toFixed(2),
                    collateralRatio: ((position.collateral * position.currentPrice) / position.borrowed * 100).toFixed(2)
                },
                recommendations,
                lastUpdated: new Date().toISOString()
            }
        });
    }
    catch (error) {
        console.error('Risk analysis error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to analyze position risk'
        });
    }
});
// Get leverage statistics
router.get('/stats', (req, res) => {
    try {
        const positions = (0, riskMonitoring_1.getPositions)();
        const alerts = (0, riskMonitoring_1.getRiskAlerts)(100);
        const totalPositions = positions.length;
        const totalCollateral = positions.reduce((sum, pos) => sum + pos.collateral, 0);
        const totalBorrowed = positions.reduce((sum, pos) => sum + pos.borrowed, 0);
        const avgLeverage = positions.reduce((sum, pos) => sum + pos.leverage, 0) / totalPositions;
        const riskDistribution = {
            low: positions.filter(pos => pos.healthFactor >= 1.5).length,
            medium: positions.filter(pos => pos.healthFactor >= 1.2 && pos.healthFactor < 1.5).length,
            high: positions.filter(pos => pos.healthFactor >= 1.1 && pos.healthFactor < 1.2).length,
            critical: positions.filter(pos => pos.healthFactor < 1.1).length
        };
        const recentAlerts = {
            total: alerts.length,
            warning: alerts.filter(alert => alert.type === 'warning').length,
            critical: alerts.filter(alert => alert.type === 'critical').length,
            liquidation: alerts.filter(alert => alert.type === 'liquidation').length
        };
        res.json({
            success: true,
            data: {
                overview: {
                    totalPositions,
                    totalCollateral: totalCollateral.toLocaleString(),
                    totalBorrowed: totalBorrowed.toLocaleString(),
                    avgLeverage: avgLeverage.toFixed(2)
                },
                riskDistribution,
                recentAlerts,
                timestamp: new Date().toISOString()
            }
        });
    }
    catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch leverage statistics'
        });
    }
});
exports.default = router;
//# sourceMappingURL=leverage.js.map