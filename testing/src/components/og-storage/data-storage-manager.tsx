import React, { useState, useEffect } from 'react';
import { StorageClient } from '@0glabs/0g-storage-client';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useStrategyContract } from '../../hooks/useStrategyContract';

interface StorageMetrics {
  totalFiles: number;
  totalSize: string;
  lastBackup: string;
  status: 'connected' | 'disconnected' | 'syncing';
}

interface HistoricalData {
  timestamp: string;
  strategyId: string;
  performance: number;
  allocation: Record<string, number>;
  marketConditions: Record<string, number>;
}

interface ModelMetadata {
  name: string;
  version: string;
  accuracy: number;
  lastTrained: string;
  size: string;
  hash: string;
}

export const DataStorageManager: React.FC = () => {
  const [client, setClient] = useState<StorageClient | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [metrics, setMetrics] = useState<StorageMetrics>({
    totalFiles: 0,
    totalSize: '0 MB',
    lastBackup: 'Never',
    status: 'disconnected'
  });
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  const [models, setModels] = useState<ModelMetadata[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [contractData, setContractData] = useState<any>(null);

  const {
    isConnected,
    userAddress,
    connectWallet,
    getUserDeposits,
    getCurrentAllocation,
    getUserBalance,
    getTotalValueLocked,
    getStrategyPerformance
  } = useStrategyContract();

  useEffect(() => {
    initializeStorageClient();
    loadMockData();
  }, []);

  useEffect(() => {
    if (isConnected && userAddress) {
      fetchContractData();
    }
  }, [isConnected, userAddress]);

  const fetchContractData = async () => {
    if (!isConnected || !userAddress) return;

    try {
      const [deposits, allocation, balance, tvl] = await Promise.all([
        getUserDeposits(),
        getCurrentAllocation(),
        getUserBalance(),
        getTotalValueLocked()
      ]);

      setContractData({
        deposits,
        allocation,
        balance,
        tvl
      });

      // Try to fetch strategy performance data
      try {
        const performance = await getStrategyPerformance('strategy-v1');
        if (performance.length > 0) {
          const realHistoricalData = performance.map(perf => ({
            timestamp: new Date(perf.timestamp * 1000).toISOString(),
            strategyId: perf.strategyId,
            performance: parseFloat(perf.returns),
            allocation: allocation.reduce((acc, alloc) => ({
              ...acc,
              [alloc.protocol]: alloc.percentage / 100
            }), {}),
            marketConditions: { volatility: 15.3, gasPrice: 25 } // Mock market data
          }));
          
          setHistoricalData(realHistoricalData);
        }
      } catch (perfError) {
        console.log('No strategy performance data yet');
      }
    } catch (error) {
      console.error('Failed to fetch contract data:', error);
    }
  };

  const initializeStorageClient = async () => {
    try {
      const storageClient = new StorageClient({
        rpc: "https://evmrpc-testnet.0g.ai",
        privateKey: process.env.NEXT_PUBLIC_PRIVATE_KEY!
      });
      
      setClient(storageClient);
      setIsInitialized(true);
      setMetrics(prev => ({ ...prev, status: 'connected' }));
    } catch (err) {
      setError('Failed to initialize 0G Storage client: ' + (err as Error).message);
    }
  };

  const loadMockData = () => {
    // Mock historical data
    const mockHistorical: HistoricalData[] = [
      {
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        strategyId: "strategy-v1",
        performance: 5.2,
        allocation: { "Aave": 40, "Compound": 30, "Uniswap": 30 },
        marketConditions: { "volatility": 15.3, "gasPrice": 25 }
      },
      {
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        strategyId: "strategy-v1",
        performance: 4.8,
        allocation: { "Aave": 35, "Compound": 35, "Uniswap": 30 },
        marketConditions: { "volatility": 18.1, "gasPrice": 30 }
      }
    ];

    // Mock model metadata
    const mockModels: ModelMetadata[] = [
      {
        name: "defi-strategy-optimizer",
        version: "v1.2.3",
        accuracy: 87.5,
        lastTrained: "2024-01-10",
        size: "245 MB",
        hash: "0xa1b2c3d4..."
      },
      {
        name: "risk-assessment-model",
        version: "v2.1.0",
        accuracy: 92.3,
        lastTrained: "2024-01-08",
        size: "156 MB",
        hash: "0xe5f6g7h8..."
      }
    ];

    setHistoricalData(mockHistorical);
    setModels(mockModels);
    setMetrics(prev => ({
      ...prev,
      totalFiles: mockHistorical.length + mockModels.length,
      totalSize: "401 MB",
      lastBackup: "2 hours ago"
    }));
  };

  const uploadStrategyData = async (strategyData: HistoricalData) => {
    if (!client) return;

    setIsUploading(true);
    try {
      const dataBuffer = Buffer.from(JSON.stringify(strategyData, null, 2));
      const fileName = `strategy-data/${strategyData.strategyId}-${Date.now()}.json`;
      
      await client.uploadFile(fileName, dataBuffer);
      
      setHistoricalData(prev => [strategyData, ...prev]);
      setMetrics(prev => ({
        ...prev,
        totalFiles: prev.totalFiles + 1,
        lastBackup: "Just now"
      }));
      
    } catch (err) {
      setError('Failed to upload strategy data: ' + (err as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  const uploadModelWeights = async (modelName: string, weights: ArrayBuffer) => {
    if (!client) return;

    setIsUploading(true);
    try {
      const fileName = `models/${modelName}-${Date.now()}.bin`;
      await client.uploadFile(fileName, Buffer.from(weights));
      
      // Update model metadata
      const newModel: ModelMetadata = {
        name: modelName,
        version: `v${Date.now()}`,
        accuracy: 85 + Math.random() * 10,
        lastTrained: new Date().toISOString().split('T')[0],
        size: `${Math.round(weights.byteLength / 1024 / 1024)} MB`,
        hash: `0x${Math.random().toString(16).substr(2, 8)}...`
      };
      
      setModels(prev => [newModel, ...prev]);
      setMetrics(prev => ({
        ...prev,
        totalFiles: prev.totalFiles + 1,
        lastBackup: "Just now"
      }));
      
    } catch (err) {
      setError('Failed to upload model weights: ' + (err as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  const createBackup = async () => {
    setMetrics(prev => ({ ...prev, status: 'syncing' }));
    
    // Simulate backup process
    setTimeout(() => {
      setMetrics(prev => ({
        ...prev,
        status: 'connected',
        lastBackup: "Just now"
      }));
    }, 3000);
  };

  const testNewStrategy = () => {
    const newStrategyData: HistoricalData = {
      timestamp: new Date().toISOString(),
      strategyId: "strategy-v2",
      performance: 6.1 + Math.random() * 2,
      allocation: {
        "Aave": 25 + Math.random() * 20,
        "Compound": 25 + Math.random() * 20,
        "Uniswap": 25 + Math.random() * 20,
        "Curve": 25 + Math.random() * 20
      },
      marketConditions: {
        "volatility": 10 + Math.random() * 15,
        "gasPrice": 15 + Math.random() * 25
      }
    };
    
    uploadStrategyData(newStrategyData);
  };

  if (!isInitialized) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Data Storage Manager</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Connecting to 0G Storage Network...</p>
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
            Data Storage Manager
            <Badge 
              variant={metrics.status === 'connected' ? 'default' : 'secondary'}
              className={metrics.status === 'connected' ? 'bg-green-100 text-green-800' : ''}
            >
              0G Storage {metrics.status === 'syncing' ? 'Syncing' : metrics.status.charAt(0).toUpperCase() + metrics.status.slice(1)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{metrics.totalFiles}</div>
              <div className="text-sm text-gray-600">Total Files</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{metrics.totalSize}</div>
              <div className="text-sm text-gray-600">Storage Used</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{models.length}</div>
              <div className="text-sm text-gray-600">AI Models</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{historicalData.length}</div>
              <div className="text-sm text-gray-600">Data Points</div>
            </div>
          </div>

          <div className="flex space-x-4">
            <Button onClick={createBackup} disabled={metrics.status === 'syncing'}>
              {metrics.status === 'syncing' ? 'Backing Up...' : 'Create Backup'}
            </Button>
            <Button variant="outline" onClick={testNewStrategy} disabled={isUploading}>
              {isUploading ? 'Uploading...' : 'Upload Test Data'}
            </Button>
            {!isConnected && (
              <Button onClick={connectWallet} variant="secondary">
                Connect Wallet
              </Button>
            )}
            {isConnected && (
              <Button onClick={fetchContractData} variant="outline" size="sm">
                Refresh Contract Data
              </Button>
            )}
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Last backup: {metrics.lastBackup}
            {isConnected && userAddress && (
              <div className="mt-2">
                Connected: {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
              </div>
            )}
          </div>

          {contractData && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Live Contract Data</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>Your Balance:</strong> {parseFloat(contractData.balance).toFixed(4)} OG</div>
                  <div><strong>Total Value Locked:</strong> {parseFloat(contractData.tvl).toFixed(4)} OG</div>
                  <div><strong>Your Deposits:</strong> {contractData.deposits.length}</div>
                  <div><strong>Active Strategies:</strong> {contractData.allocation.length}</div>
                </div>
                {contractData.allocation.length > 0 && (
                  <div className="mt-4">
                    <strong>Current Allocation:</strong>
                    <div className="mt-2 space-y-1">
                      {contractData.allocation.map((alloc: any, index: number) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>Protocol {index + 1}:</span>
                          <span>{(alloc.percentage / 100).toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue="historical" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="historical">Historical Data</TabsTrigger>
              <TabsTrigger value="models">AI Models</TabsTrigger>
            </TabsList>
            
            <TabsContent value="historical" className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Strategy Performance History</h3>
                {historicalData.map((data, index) => (
                  <Card key={index}>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <Badge variant="outline">{data.strategyId}</Badge>
                          <div className="text-sm text-gray-600 mt-1">
                            {new Date(data.timestamp).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-green-600">
                            {data.performance.toFixed(2)}% Return
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>Allocation:</strong>
                          <div className="mt-1">
                            {Object.entries(data.allocation).map(([protocol, percentage]) => (
                              <div key={protocol} className="flex justify-between">
                                <span>{protocol}:</span>
                                <span>{percentage}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <strong>Market Conditions:</strong>
                          <div className="mt-1">
                            {Object.entries(data.marketConditions).map(([metric, value]) => (
                              <div key={metric} className="flex justify-between">
                                <span>{metric}:</span>
                                <span>{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="models" className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Stored AI Models</h3>
                {models.map((model, index) => (
                  <Card key={index}>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold">{model.name}</h4>
                          <Badge variant="outline">{model.version}</Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold">
                            {model.accuracy.toFixed(1)}% Accuracy
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div><strong>Size:</strong> {model.size}</div>
                          <div><strong>Last Trained:</strong> {model.lastTrained}</div>
                        </div>
                        <div>
                          <div><strong>Hash:</strong> {model.hash}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};