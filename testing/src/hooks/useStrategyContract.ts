import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// Contract ABI - only the functions we need
const STRATEGY_ABI = [
  "function depositNativeOG() external payable",
  "function depositFunds(address asset, uint256 amount) external payable", 
  "function withdrawFunds(uint256 amount) external",
  "function rebalancePortfolio((address protocol, uint256 percentage, bool active)[] newAllocations, string strategyId) external",
  "function recordPerformance(string strategyId, uint256 totalValue, uint256 returns, uint256 gasUsed) external",
  "function getUserDeposits(address user) external view returns ((address asset, uint256 amount, uint256 timestamp, bool active)[])",
  "function getCurrentAllocation() external view returns ((address protocol, uint256 percentage, bool active)[])",
  "function getStrategyPerformance(string strategyId) external view returns ((uint256 timestamp, uint256 totalValue, uint256 returns, uint256 gasUsed, string strategyId)[])",
  "function getSupportedAssets() external view returns (address[])",
  "function userTotalDeposits(address user) external view returns (uint256)",
  "function totalValueLocked() external view returns (uint256)",
  "function setAiEngine(address aiEngine) external",
  "event FundsDeposited(address indexed user, address indexed asset, uint256 amount)",
  "event PortfolioRebalanced(string strategyId, uint256 timestamp)",
  "event FundsWithdrawn(address indexed user, uint256 amount)",
  "event PerformanceRecorded(string strategyId, uint256 totalValue, uint256 returns)"
];

const CONTRACT_ADDRESS = "0x12E003737F21EbEd9eaA121795Ed8e39BdB67471";
const RPC_URL = "https://evmrpc-testnet.0g.ai";
const CHAIN_ID = 16601;

export interface UserDeposit {
  asset: string;
  amount: string;
  timestamp: number;
  active: boolean;
}

export interface StrategyAllocation {
  protocol: string;
  percentage: number;
  active: boolean;
}

export interface PerformanceMetrics {
  timestamp: number;
  totalValue: string;
  returns: string;
  gasUsed: string;
  strategyId: string;
}

export const useStrategyContract = () => {
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [provider, setProvider] = useState<ethers.JsonRpcProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState<string>("");
  const [chainId, setChainId] = useState<number | null>(null);

  useEffect(() => {
    initializeContract();
  }, []);

  const initializeContract = async () => {
    try {
      // Initialize provider
      const jsonRpcProvider = new ethers.JsonRpcProvider(RPC_URL);
      setProvider(jsonRpcProvider);

      // Check if MetaMask is available
      if (typeof window !== 'undefined' && window.ethereum) {
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        const network = await browserProvider.getNetwork();
        setChainId(Number(network.chainId));

        // Initialize contract with read-only provider
        const readContract = new ethers.Contract(CONTRACT_ADDRESS, STRATEGY_ABI, jsonRpcProvider);
        setContract(readContract);
      } else {
        // Fallback to read-only contract
        const readContract = new ethers.Contract(CONTRACT_ADDRESS, STRATEGY_ABI, jsonRpcProvider);
        setContract(readContract);
      }
    } catch (error) {
      console.error("Failed to initialize contract:", error);
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      throw new Error("MetaMask not found");
    }

    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const network = await browserProvider.getNetwork();
      
      if (Number(network.chainId) !== CHAIN_ID) {
        await switchToOGNetwork();
      }

      const signer = await browserProvider.getSigner();
      const address = await signer.getAddress();
      
      setSigner(signer);
      setUserAddress(address);
      setIsConnected(true);
      setChainId(Number(network.chainId));

      // Update contract with signer
      const contractWithSigner = new ethers.Contract(CONTRACT_ADDRESS, STRATEGY_ABI, signer);
      setContract(contractWithSigner);

      return address;
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      throw error;
    }
  };

  const switchToOGNetwork = async () => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${CHAIN_ID.toString(16)}` }],
      });
    } catch (switchError: any) {
      // Chain not added to MetaMask
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${CHAIN_ID.toString(16)}`,
            chainName: '0G-Galileo-Testnet',
            nativeCurrency: {
              name: 'OG',
              symbol: 'OG',
              decimals: 18
            },
            rpcUrls: [RPC_URL],
            blockExplorerUrls: ['https://explorer-testnet.0g.ai/']
          }]
        });
      } else {
        throw switchError;
      }
    }
  };

  const depositNativeOG = async (amount: string) => {
    if (!contract || !signer) throw new Error("Contract not initialized");

    try {
      const tx = await contract.depositNativeOG({
        value: ethers.parseEther(amount)
      });
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error("Deposit failed:", error);
      throw error;
    }
  };

  const withdrawFunds = async (amount: string) => {
    if (!contract || !signer) throw new Error("Contract not initialized");

    try {
      const tx = await contract.withdrawFunds(ethers.parseEther(amount));
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error("Withdrawal failed:", error);
      throw error;
    }
  };

  const rebalancePortfolio = async (allocations: StrategyAllocation[], strategyId: string) => {
    if (!contract || !signer) throw new Error("Contract not initialized");

    try {
      const tx = await contract.rebalancePortfolio(allocations, strategyId);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error("Rebalance failed:", error);
      throw error;
    }
  };

  const recordPerformance = async (
    strategyId: string,
    totalValue: string,
    returns: string,
    gasUsed: string
  ) => {
    if (!contract || !signer) throw new Error("Contract not initialized");

    try {
      const tx = await contract.recordPerformance(
        strategyId,
        ethers.parseEther(totalValue),
        ethers.parseEther(returns),
        gasUsed
      );
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error("Record performance failed:", error);
      throw error;
    }
  };

  // Read functions
  const getUserDeposits = async (userAddr?: string): Promise<UserDeposit[]> => {
    if (!contract) throw new Error("Contract not initialized");
    
    const address = userAddr || userAddress;
    if (!address) throw new Error("No user address");

    try {
      const deposits = await contract.getUserDeposits(address);
      return deposits.map((deposit: any) => ({
        asset: deposit.asset,
        amount: ethers.formatEther(deposit.amount),
        timestamp: Number(deposit.timestamp),
        active: deposit.active
      }));
    } catch (error) {
      console.error("Failed to get user deposits:", error);
      throw error;
    }
  };

  const getCurrentAllocation = async (): Promise<StrategyAllocation[]> => {
    if (!contract) throw new Error("Contract not initialized");

    try {
      const allocations = await contract.getCurrentAllocation();
      return allocations.map((alloc: any) => ({
        protocol: alloc.protocol,
        percentage: Number(alloc.percentage),
        active: alloc.active
      }));
    } catch (error) {
      console.error("Failed to get current allocation:", error);
      throw error;
    }
  };

  const getUserBalance = async (userAddr?: string): Promise<string> => {
    if (!contract) throw new Error("Contract not initialized");
    
    const address = userAddr || userAddress;
    if (!address) throw new Error("No user address");

    try {
      const balance = await contract.userTotalDeposits(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error("Failed to get user balance:", error);
      throw error;
    }
  };

  const getTotalValueLocked = async (): Promise<string> => {
    if (!contract) throw new Error("Contract not initialized");

    try {
      const tvl = await contract.totalValueLocked();
      return ethers.formatEther(tvl);
    } catch (error) {
      console.error("Failed to get TVL:", error);
      throw error;
    }
  };

  const getStrategyPerformance = async (strategyId: string): Promise<PerformanceMetrics[]> => {
    if (!contract) throw new Error("Contract not initialized");

    try {
      const performance = await contract.getStrategyPerformance(strategyId);
      return performance.map((perf: any) => ({
        timestamp: Number(perf.timestamp),
        totalValue: ethers.formatEther(perf.totalValue),
        returns: ethers.formatEther(perf.returns),
        gasUsed: perf.gasUsed.toString(),
        strategyId: perf.strategyId
      }));
    } catch (error) {
      console.error("Failed to get strategy performance:", error);
      throw error;
    }
  };

  return {
    contract,
    provider,
    signer,
    isConnected,
    userAddress,
    chainId,
    connectWallet,
    switchToOGNetwork,
    depositNativeOG,
    withdrawFunds,
    rebalancePortfolio,
    recordPerformance,
    getUserDeposits,
    getCurrentAllocation,
    getUserBalance,
    getTotalValueLocked,
    getStrategyPerformance
  };
};