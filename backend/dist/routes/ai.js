"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const brokerService_1 = require("../services/brokerService");
const router = express_1.default.Router();
// Get available AI services
router.get('/services', async (req, res) => {
    try {
        const services = await (0, brokerService_1.getAvailableServices)();
        res.json({
            success: true,
            data: services.map(service => ({
                provider: service.provider,
                model: service.model,
                serviceType: service.serviceType,
                verifiability: service.verifiability,
                inputPrice: service.inputPrice.toString(),
                outputPrice: service.outputPrice.toString(),
                url: service.url,
                updatedAt: service.updatedAt.toString()
            }))
        });
    }
    catch (error) {
        console.error('Get services error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch AI services'
        });
    }
});
// Acknowledge a provider
router.post('/acknowledge/:providerAddress', async (req, res) => {
    try {
        const { providerAddress } = req.params;
        if (!providerAddress || !providerAddress.startsWith('0x')) {
            return res.status(400).json({
                success: false,
                error: 'Valid provider address is required'
            });
        }
        await (0, brokerService_1.acknowledgeProvider)(providerAddress);
        res.json({
            success: true,
            message: `Provider ${providerAddress} acknowledged successfully`
        });
    }
    catch (error) {
        console.error('Acknowledge provider error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to acknowledge provider'
        });
    }
});
// Send AI request
router.post('/request', async (req, res) => {
    try {
        const { providerAddress, question, model } = req.body;
        if (!providerAddress || !question) {
            return res.status(400).json({
                success: false,
                error: 'Provider address and question are required'
            });
        }
        if (!providerAddress.startsWith('0x')) {
            return res.status(400).json({
                success: false,
                error: 'Invalid provider address format'
            });
        }
        const result = await (0, brokerService_1.sendAIRequest)(providerAddress, question, model);
        res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        console.error('AI request error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to process AI request'
        });
    }
});
// Add funds to account
router.post('/funds/add', async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount || isNaN(parseFloat(amount))) {
            return res.status(400).json({
                success: false,
                error: 'Valid amount is required'
            });
        }
        const result = await (0, brokerService_1.addFunds)(amount);
        res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        console.error('Add funds error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to add funds'
        });
    }
});
// Get account balance
router.get('/balance', async (req, res) => {
    try {
        const balance = await (0, brokerService_1.getAccountBalance)();
        res.json({
            success: true,
            data: balance
        });
    }
    catch (error) {
        console.error('Get balance error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get account balance'
        });
    }
});
// Predefined AI queries for common DeFi scenarios
router.post('/analyze-market', async (req, res) => {
    try {
        const { asset, timeframe } = req.body;
        const prompt = `Analyze the current market conditions for ${asset || 'ETH'} over the ${timeframe || '24h'} timeframe. 
    Provide:
    1. Price trend analysis
    2. Support and resistance levels
    3. Risk factors
    4. Trading recommendations
    5. Leverage safety considerations
    
    Keep response concise and actionable.`;
        // Use llama-3.3-70b-instruct for market analysis
        const officialProvider = '0xf07240Efa67755B5311bc75784a061eDB47165Dd';
        const result = await (0, brokerService_1.sendAIRequest)(officialProvider, prompt);
        res.json({
            success: true,
            data: {
                analysis: result.answer,
                asset: asset || 'ETH',
                timeframe: timeframe || '24h',
                timestamp: new Date().toISOString(),
                cost: result.cost,
                verified: result.valid
            }
        });
    }
    catch (error) {
        console.error('Market analysis error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to analyze market'
        });
    }
});
exports.default = router;
//# sourceMappingURL=ai.js.map