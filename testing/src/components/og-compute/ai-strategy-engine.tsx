import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { createZGComputeNetworkBroker } from '@0glabs/0g-serving-broker';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { useStrategyContract } from '../../hooks/useStrategyContract';

interface StrategyResult {
  allocations: Array<{
    protocol: string;
    percentage: number;
    reasoning: string;
  }>;
  confidence: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  expectedReturn: number;
}

interface MarketData {
  aaveAPY: number;
  compoundAPY: number;
  uniswapV3APY: number;
  volatility: number;
  gasPrice: number;
}

export const AIStrategyEngine: React.FC = () => {
  const [broker, setBroker] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStrategy, setCurrentStrategy] = useState<StrategyResult | null>(null);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const {
    isConnected,
    userAddress,
    connectWallet,
    rebalancePortfolio,
    recordPerformance,
    getCurrentAllocation,
    getUserBalance
  } = useStrategyContract();

  useEffect(() => {
    initializeBroker();
  }, []);

  const initializeBroker = async () => {
    try {
      const provider = new ethers.JsonRpcProvider("https://evmrpc-testnet.0g.ai");
      const wallet = new ethers.Wallet(process.env.NEXT_PUBLIC_PRIVATE_KEY!, provider);
      
      const computeBroker = await createZGComputeNetworkBroker(wallet);
      
      // Add ledger funds for compute requests
      await computeBroker.ledger.addLedger(ethers.parseEther("0.1"));
      
      setBroker(computeBroker);
      setIsInitialized(true);
    } catch (err) {
      setError('Failed to initialize 0G Compute broker: ' + (err as Error).message);
    }
  };

  const fetchMarketData = async (): Promise<MarketData> => {
    // Simulate fetching real market data
    // In production, integrate with DeFi protocols' APIs
    return {
      aaveAPY: 3.2 + Math.random() * 2,
      compoundAPY: 2.8 + Math.random() * 1.5,
      uniswapV3APY: 8.5 + Math.random() * 5,
      volatility: 15 + Math.random() * 10,
      gasPrice: 20 + Math.random() * 30
    };
  };

  const runStrategyInference = async () => {
    if (!broker) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      // Fetch current market conditions
      const market = await fetchMarketData();
      setMarketData(market);

      // Prepare input for AI model
      const strategyInput = {
        marketData: market,
        userProfile: {
          riskTolerance: 'MEDIUM',
          timeHorizon: '1_YEAR',
          totalCapital: 100000
        },
        currentAllocations: currentStrategy?.allocations || [],
        timestamp: Date.now()
      };

      // Call 0G Compute for strategy inference
      const result = await broker.inference.request({
        model: "llama-3.3-70b-instruct",
        input: {
          messages: [{
            role: "system",
            content: `You are a DeFi strategy optimizer. Analyze the market data and provide optimal allocation recommendations.
            
            Consider:
            - Current APYs across protocols
            - Gas costs and efficiency
            - Risk-adjusted returns
            - Market volatility
            
            Respond with JSON format:
            {
              "allocations": [{"protocol": "Aave", "percentage": 40, "reasoning": "..."}],
              "confidence": 85,
              "riskLevel": "MEDIUM",
              "expectedReturn": 6.2
            }`
          }, {
            role: "user",
            content: `Market Data: ${JSON.stringify(strategyInput)}`
          }]
        }
      });

      // Parse AI response
      const strategyResult = JSON.parse(result.choices[0].message.content);
      setCurrentStrategy(strategyResult);

    } catch (err) {
      setError('Strategy inference failed: ' + (err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const executeStrategy = async () => {
    if (!currentStrategy || !isConnected) {
      if (!isConnected) {
        try {
          await connectWallet();
        } catch (err) {
          setError('Please connect your wallet first');
          return;
        }
      }
      return;
    }
    
    setIsExecuting(true);
    setError(null);

    try {
      // Convert strategy allocations to contract format
      const contractAllocations = currentStrategy.allocations.map(alloc => ({
        protocol: alloc.protocol === 'Aave' ? '0x1111111111111111111111111111111111111111' :
                 alloc.protocol === 'Compound' ? '0x2222222222222222222222222222222222222222' :
                 alloc.protocol === 'Uniswap' ? '0x3333333333333333333333333333333333333333' :
                 '0x4444444444444444444444444444444444444444', // Default/Curve
        percentage: Math.round(alloc.percentage * 100), // Convert to basis points
        active: true
      }));

      const strategyId = `strategy-${Date.now()}`;

      // Execute rebalancing on-chain
      const txHash = await rebalancePortfolio(contractAllocations, strategyId);
      
      // Record performance metrics
      const userBalance = await getUserBalance();
      const performanceTxHash = await recordPerformance(
        strategyId,
        userBalance,
        currentStrategy.expectedReturn.toString(),
        '250000' // Estimated gas used
      );

      setError(null);
      alert(`Strategy executed successfully!\nRebalance TX: ${txHash}\nPerformance TX: ${performanceTxHash}`);
      
    } catch (err) {
      setError('Strategy execution failed: ' + (err as Error).message);
      console.error('Execution error:', err);
    } finally {
      setIsExecuting(false);
    }
  };

  if (!isInitialized) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Strategy Engine</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Initializing 0G Compute Network...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            AI Strategy Engine
            <Badge variant="outline" className="bg-green-50 text-green-700">
              0G Compute Active
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={runStrategyInference}
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? 'Analyzing Markets...' : 'Generate New Strategy'}
            </Button>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {marketData && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Current Market Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>Aave APY: {marketData.aaveAPY.toFixed(2)}%</div>
                    <div>Compound APY: {marketData.compoundAPY.toFixed(2)}%</div>
                    <div>Uniswap V3 APY: {marketData.uniswapV3APY.toFixed(2)}%</div>
                    <div>Volatility: {marketData.volatility.toFixed(1)}%</div>
                    <div>Gas Price: {marketData.gasPrice.toFixed(0)} gwei</div>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStrategy && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    Recommended Strategy
                    <div className="flex items-center space-x-2">
                      <Badge variant={
                        currentStrategy.riskLevel === 'LOW' ? 'default' :
                        currentStrategy.riskLevel === 'MEDIUM' ? 'secondary' : 'destructive'
                      }>
                        {currentStrategy.riskLevel} Risk
                      </Badge>
                      <Badge variant="outline">
                        {currentStrategy.confidence}% Confidence
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Expected Return: {currentStrategy.expectedReturn.toFixed(2)}%</p>
                    </div>
                    
                    <div className="space-y-3">
                      {currentStrategy.allocations.map((allocation, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">{allocation.protocol}</span>
                            <Badge>{allocation.percentage}%</Badge>
                          </div>
                          <p className="text-sm text-gray-600">{allocation.reasoning}</p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      {!isConnected && (
                        <Button onClick={connectWallet} className="w-full" variant="outline">
                          Connect Wallet
                        </Button>
                      )}
                      <Button 
                        onClick={executeStrategy} 
                        className="w-full"
                        disabled={isExecuting || (!isConnected && !currentStrategy)}
                      >
                        {isExecuting ? 'Executing Strategy...' : 
                         !isConnected ? 'Connect Wallet to Execute' : 
                         'Execute Strategy'}
                      </Button>
                      {isConnected && userAddress && (
                        <p className="text-xs text-gray-600 text-center">
                          Connected: {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};