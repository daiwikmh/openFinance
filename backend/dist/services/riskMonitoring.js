"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startRiskMonitoring = startRiskMonitoring;
exports.getPositions = getPositions;
exports.getRiskAlerts = getRiskAlerts;
exports.getPositionById = getPositionById;
const node_cron_1 = __importDefault(require("node-cron"));
const brokerService_1 = require("./brokerService");
// Mock positions data - in production, this would come from blockchain/database
let mockPositions = [
    {
        id: 'pos_1',
        userAddress: '0x1234...5678',
        asset: 'ETH',
        collateral: 10000,
        borrowed: 75000,
        leverage: 8.5,
        currentPrice: 3500,
        liquidationPrice: 3200,
        healthFactor: 1.15,
        timestamp: Date.now()
    },
    {
        id: 'pos_2',
        userAddress: '0x9876...5432',
        asset: 'BTC',
        collateral: 50000,
        borrowed: 200000,
        leverage: 4.2,
        currentPrice: 95000,
        liquidationPrice: 88000,
        healthFactor: 1.08,
        timestamp: Date.now()
    }
];
let wss = null;
const riskAlerts = [];
function startRiskMonitoring(websocketServer) {
    wss = websocketServer;
    console.log('🤖 Starting AI-powered risk monitoring...');
    // Schedule risk monitoring every 30 seconds
    node_cron_1.default.schedule('*/30 * * * * *', async () => {
        try {
            await performRiskAnalysis();
        }
        catch (error) {
            console.error('Risk monitoring error:', error);
        }
    });
    console.log('✅ Risk monitoring service started');
}
async function performRiskAnalysis() {
    console.log('🔍 Performing AI risk analysis...');
    for (const position of mockPositions) {
        try {
            // Update position with mock price movements
            updatePositionPrices(position);
            // Calculate risk metrics
            const riskLevel = calculateRiskLevel(position);
            // Generate AI analysis for high-risk positions
            if (riskLevel >= 0.7) {
                const aiAnalysis = await generateAIRiskAnalysis(position);
                const alert = {
                    id: `alert_${Date.now()}_${position.id}`,
                    positionId: position.id,
                    type: riskLevel >= 0.9 ? 'critical' : 'warning',
                    message: generateRiskMessage(position, riskLevel),
                    timestamp: Date.now(),
                    aiAnalysis
                };
                riskAlerts.push(alert);
                broadcastAlert(alert);
                // Auto-adjust leverage if critical
                if (riskLevel >= 0.9) {
                    await autoAdjustLeverage(position);
                }
            }
        }
        catch (error) {
            console.error(`Error analyzing position ${position.id}:`, error);
        }
    }
}
function updatePositionPrices(position) {
    // Simulate price movements (±2% random change)
    const priceChange = (Math.random() - 0.5) * 0.04;
    position.currentPrice = position.currentPrice * (1 + priceChange);
    // Recalculate health factor
    const collateralValue = position.collateral * position.currentPrice;
    position.healthFactor = collateralValue / position.borrowed;
    position.timestamp = Date.now();
}
function calculateRiskLevel(position) {
    // Risk level calculation based on multiple factors
    const healthFactorRisk = Math.max(0, (1.5 - position.healthFactor) / 1.5);
    const leverageRisk = Math.min(1, position.leverage / 10);
    const liquidationDistanceRisk = Math.max(0, 1 - (position.currentPrice - position.liquidationPrice) / position.currentPrice);
    return Math.min(1, (healthFactorRisk * 0.5 + leverageRisk * 0.3 + liquidationDistanceRisk * 0.2));
}
async function generateAIRiskAnalysis(position) {
    try {
        const prompt = `Analyze this DeFi leverage position and provide risk assessment:
    
    Asset: ${position.asset}
    Current Price: $${position.currentPrice.toFixed(2)}
    Liquidation Price: $${position.liquidationPrice.toFixed(2)}
    Leverage: ${position.leverage}x
    Health Factor: ${position.healthFactor.toFixed(3)}
    Collateral: $${position.collateral.toLocaleString()}
    Borrowed: $${position.borrowed.toLocaleString()}
    
    Provide:
    1. Risk level assessment (Low/Medium/High/Critical)
    2. Specific risks identified
    3. Recommended actions
    4. Market outlook impact
    
    Keep response concise (max 200 words).`;
        // Use the official 0G AI service for risk analysis
        const officialProvider = '0xf07240Efa67755B5311bc75784a061eDB47165Dd'; // llama-3.3-70b-instruct
        const result = await (0, brokerService_1.sendAIRequest)(officialProvider, prompt);
        return result.answer;
    }
    catch (error) {
        console.error('AI risk analysis failed:', error);
        return 'AI analysis temporarily unavailable. Manual review recommended.';
    }
}
function generateRiskMessage(position, riskLevel) {
    if (riskLevel >= 0.9) {
        return `🚨 CRITICAL: Position ${position.id} (${position.asset}) at ${(riskLevel * 100).toFixed(1)}% risk. Liquidation imminent!`;
    }
    else if (riskLevel >= 0.7) {
        return `⚠️ WARNING: Position ${position.id} (${position.asset}) at ${(riskLevel * 100).toFixed(1)}% risk. Consider reducing leverage.`;
    }
    return `ℹ️ Position ${position.id} risk level: ${(riskLevel * 100).toFixed(1)}%`;
}
async function autoAdjustLeverage(position) {
    try {
        console.log(`🤖 Auto-adjusting leverage for position ${position.id}`);
        // Simulate leverage reduction
        const targetLeverage = Math.max(2, position.leverage * 0.7);
        const adjustmentAmount = position.borrowed * (1 - targetLeverage / position.leverage);
        // In production, this would call smart contracts
        console.log(`Reducing leverage from ${position.leverage}x to ${targetLeverage.toFixed(1)}x`);
        console.log(`Repaying ${adjustmentAmount.toLocaleString()} of borrowed amount`);
        position.leverage = targetLeverage;
        position.borrowed -= adjustmentAmount;
        position.healthFactor = (position.collateral * position.currentPrice) / position.borrowed;
        const adjustmentAlert = {
            id: `auto_adjust_${Date.now()}_${position.id}`,
            positionId: position.id,
            type: 'warning',
            message: `🤖 Auto-adjusted: Reduced leverage to ${targetLeverage.toFixed(1)}x to prevent liquidation`,
            timestamp: Date.now()
        };
        riskAlerts.push(adjustmentAlert);
        broadcastAlert(adjustmentAlert);
    }
    catch (error) {
        console.error('Auto leverage adjustment failed:', error);
    }
}
function broadcastAlert(alert) {
    if (!wss)
        return;
    const message = JSON.stringify({
        type: 'risk_alert',
        data: alert
    });
    wss.clients.forEach(client => {
        if (client.readyState === 1) { // WebSocket.OPEN
            client.send(message);
        }
    });
    console.log(`📢 Broadcasting ${alert.type} alert: ${alert.message}`);
}
function getPositions() {
    return mockPositions;
}
function getRiskAlerts(limit = 50) {
    return riskAlerts.slice(-limit).reverse();
}
function getPositionById(id) {
    return mockPositions.find(pos => pos.id === id);
}
//# sourceMappingURL=riskMonitoring.js.map