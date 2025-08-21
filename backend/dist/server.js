"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const ws_1 = require("ws");
const http_1 = __importDefault(require("http"));
const ai_1 = __importDefault(require("./routes/ai"));
const leverage_1 = __importDefault(require("./routes/leverage"));
const storage_1 = __importDefault(require("./routes/storage"));
const brokerService_1 = require("./services/brokerService");
const riskMonitoring_1 = require("./services/riskMonitoring");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Create HTTP server for WebSocket support
const server = http_1.default.createServer(app);
const wss = new ws_1.WebSocketServer({ server });
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173'],
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Routes
app.use('/api/ai', ai_1.default);
app.use('/api/leverage', leverage_1.default);
app.use('/api/storage', storage_1.default);
// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'DeFi AI Backend'
    });
});
// WebSocket connection handling
wss.on('connection', (ws) => {
    console.log('New WebSocket connection established');
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message.toString());
            console.log('WebSocket message received:', data);
            // Handle different message types
            switch (data.type) {
                case 'subscribe_risk_alerts':
                    // Subscribe to risk alerts for this connection
                    ws.send(JSON.stringify({
                        type: 'subscription_confirmed',
                        message: 'Subscribed to risk alerts'
                    }));
                    break;
                default:
                    ws.send(JSON.stringify({
                        type: 'error',
                        message: 'Unknown message type'
                    }));
            }
        }
        catch (error) {
            console.error('WebSocket message parsing error:', error);
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Invalid message format'
            }));
        }
    });
    ws.on('close', () => {
        console.log('WebSocket connection closed');
    });
});
// Initialize services
async function initializeServer() {
    try {
        console.log('Initializing 0G Compute Network broker...');
        await (0, brokerService_1.initializeBroker)();
        console.log('Starting risk monitoring service...');
        (0, riskMonitoring_1.startRiskMonitoring)(wss);
        console.log('Services initialized successfully');
    }
    catch (error) {
        console.error('Failed to initialize services:', error);
        process.exit(1);
    }
}
// Start server
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔗 WebSocket server running on ws://localhost:${PORT}`);
    // Initialize services after server starts
    initializeServer();
});
// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down server...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
exports.default = app;
//# sourceMappingURL=server.js.map