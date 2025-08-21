import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { WebSocketServer } from 'ws';
import http from 'http';

import aiRoutes from './routes/ai';
import leverageRoutes from './routes/leverage';
import { initializeBroker } from './services/brokerService';
import { startRiskMonitoring } from './services/riskMonitoring';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Create HTTP server for WebSocket support
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/ai', aiRoutes);
app.use('/api/leverage', leverageRoutes);

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
    } catch (error) {
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
    await initializeBroker();
    
    console.log('Starting risk monitoring service...');
    startRiskMonitoring(wss);
    
    console.log('Services initialized successfully');
  } catch (error) {
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

export default app;