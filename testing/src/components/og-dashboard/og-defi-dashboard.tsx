import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { AIStrategyEngine } from '../og-compute/ai-strategy-engine';
import { DataStorageManager } from '../og-storage/data-storage-manager';
import { useStrategyContract } from '../../hooks/useStrategyContract';

interface DashboardMetrics {
  totalDeposited: string;
  currentBalance: string;
  totalReturns: string;
  activeStrategies: number;
}

export const OGDeFiDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalDeposited: '0',
    currentBalance: '0',
    totalReturns: '0',
    activeStrategies: 0
  });
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastTxHash, setLastTxHash] = useState<string>('');

  const {
    isConnected,
    userAddress,
    chainId,
    connectWallet,
    switchToOGNetwork,
    depositNativeOG,
    withdrawFunds,
    getUserBalance,
    getUserDeposits,
    getCurrentAllocation,
    getTotalValueLocked
  } = useStrategyContract();

  useEffect(() => {
    if (isConnected && userAddress) {
      refreshMetrics();
    }
  }, [isConnected, userAddress]);

  const refreshMetrics = async () => {
    if (!isConnected || !userAddress) return;

    try {
      const [balance, deposits, allocations] = await Promise.all([
        getUserBalance(),
        getUserDeposits(),
        getCurrentAllocation()
      ]);

      const totalDeposited = deposits.reduce((sum, deposit) => {
        if (deposit.active) {
          return sum + parseFloat(deposit.amount);
        }
        return sum;
      }, 0);

      const currentBalance = parseFloat(balance);
      const returns = currentBalance - totalDeposited;

      setMetrics({
        totalDeposited: totalDeposited.toFixed(4),
        currentBalance: balance,
        totalReturns: returns.toFixed(4),
        activeStrategies: allocations.filter(a => a.active).length
      });
    } catch (error) {
      console.error('Failed to refresh metrics:', error);
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      setError('Please enter a valid deposit amount');
      return;
    }

    if (!isConnected) {
      try {
        await connectWallet();
      } catch (err) {
        setError('Failed to connect wallet');
        return;
      }
    }

    if (chainId !== 16601) {
      try {
        await switchToOGNetwork();
      } catch (err) {
        setError('Please switch to 0G network');
        return;
      }
    }

    setIsDepositing(true);
    setError(null);

    try {
      const txHash = await depositNativeOG(depositAmount);
      setLastTxHash(txHash);
      setDepositAmount('');
      await refreshMetrics();
      
    } catch (err) {
      setError('Deposit failed: ' + (err as Error).message);
    } finally {
      setIsDepositing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      setError('Please enter a valid withdrawal amount');
      return;
    }

    if (parseFloat(withdrawAmount) > parseFloat(metrics.currentBalance)) {
      setError('Insufficient balance');
      return;
    }

    setIsWithdrawing(true);
    setError(null);

    try {
      const txHash = await withdrawFunds(withdrawAmount);
      setLastTxHash(txHash);
      setWithdrawAmount('');
      await refreshMetrics();
      
    } catch (err) {
      setError('Withdrawal failed: ' + (err as Error).message);
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          {!isConnected ? (
            <Button onClick={connectWallet} size="lg">
              Connect Wallet
            </Button>
          ) : (
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-green-50 text-green-700">
                Connected
              </Badge>
              <p className="text-sm text-gray-600">
                {userAddress?.slice(0, 6)}...{userAddress?.slice(-4)}
              </p>
              {chainId !== 16601 && (
                <Button onClick={switchToOGNetwork} size="sm" variant="outline">
                  Switch to 0G Network
                </Button>
              )}
            </div>
          )}
        </div>
        <Button onClick={refreshMetrics} variant="outline" size="sm">
          Refresh Data
        </Button>
      </div>

      {/* Network Status */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <Badge variant={chainId === 16601 ? "default" : "secondary"}>
              {chainId === 16601 ? "0G Galileo Testnet" : `Chain ID: ${chainId}`}
            </Badge>
            <Badge variant="outline">Contract: 0x12E0...7471</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Dashboard */}
      {isConnected && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600">Total Deposited</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalDeposited} OG</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600">Current Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.currentBalance} OG</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600">Total Returns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${parseFloat(metrics.totalReturns) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {parseFloat(metrics.totalReturns) >= 0 ? '+' : ''}{metrics.totalReturns} OG
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600">Active Strategies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.activeStrategies}</div>
              </CardContent>
            </Card>
          </div>
        )}

      {/* Deposit/Withdraw Section */}
      {isConnected && (
          <Card>
            <CardHeader>
              <CardTitle>Manage Funds</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Deposit OG Tokens</h3>
                  <div className="flex space-x-2">
                    <Input
                      type="number"
                      placeholder="Amount (OG)"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      disabled={isDepositing}
                    />
                    <Button 
                      onClick={handleDeposit} 
                      disabled={isDepositing || !depositAmount}
                    >
                      {isDepositing ? 'Depositing...' : 'Deposit'}
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600">
                    Get testnet OG tokens from <a href="https://faucet.0g.ai" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">0G Faucet</a>
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Withdraw Funds</h3>
                  <div className="flex space-x-2">
                    <Input
                      type="number"
                      placeholder="Amount (OG)"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      disabled={isWithdrawing}
                      max={metrics.currentBalance}
                    />
                    <Button 
                      onClick={handleWithdraw} 
                      disabled={isWithdrawing || !withdrawAmount}
                      variant="outline"
                    >
                      {isWithdrawing ? 'Withdrawing...' : 'Withdraw'}
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600">
                    Available: {metrics.currentBalance} OG
                  </p>
                </div>
              </div>

              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {lastTxHash && (
                <Alert className="mt-4">
                  <AlertDescription>
                    Transaction successful! Hash: 
                    <a 
                      href={`https://explorer-testnet.0g.ai/tx/${lastTxHash}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ml-1 text-blue-600 hover:underline font-mono"
                    >
                      {lastTxHash.slice(0, 10)}...{lastTxHash.slice(-8)}
                    </a>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

      {/* Main Features Tabs */}
      <Card>
          <CardContent className="p-0">
            <Tabs defaultValue="strategy" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="strategy">AI Strategy Engine</TabsTrigger>
                <TabsTrigger value="storage">Data & Storage</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="strategy" className="p-6">
                <AIStrategyEngine />
              </TabsContent>

              <TabsContent value="storage" className="p-6">
                <DataStorageManager />
              </TabsContent>

              <TabsContent value="analytics" className="p-6">
                <div className="text-center py-8">
                  <h3 className="text-lg font-semibold mb-2">Portfolio Analytics</h3>
                  <p className="text-gray-600 mb-4">
                    Comprehensive analytics and reporting for your DeFi strategies
                  </p>
                  <Badge variant="secondary">Coming Soon</Badge>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

      {/* Footer */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-600 text-sm">
            <p>Built on 0G Chain • Powered by 0G Compute & Storage • Contract: 0x12E003737F21EbEd9eaA121795Ed8e39BdB67471</p>
            <p className="mt-1">
              <a href="https://docs.0g.ai" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                0G Documentation
              </a>
              {" • "}
              <a href="https://faucet.0g.ai" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                Get Testnet Tokens
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};