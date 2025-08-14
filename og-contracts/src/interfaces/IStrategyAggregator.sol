// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IStrategyAggregator {
    struct UserDeposit {
        address asset;
        uint256 amount;
        uint256 timestamp;
        bool active;
    }

    struct PerformanceMetrics {
        uint256 timestamp;
        uint256 totalValue;
        uint256 _returns;
        uint256 gasUsed;
        string strategyId;
    }

    struct StrategyAllocation {
        address protocol;
        uint256 percentage;
        bool active;
    }

    event FundsDeposited(address indexed user, address indexed asset, uint256 amount);
    event PortfolioRebalanced(string strategyId, uint256 timestamp);
    event FundsWithdrawn(address indexed user, uint256 amount);
    event PerformanceRecorded(string strategyId, uint256 totalValue, uint256 _returns);

    function depositFunds(address asset, uint256 amount) external payable;
    function depositNativeOG() external payable;
    function rebalancePortfolio(StrategyAllocation[] calldata newAllocations, string calldata strategyId) external;
    function withdrawFunds(uint256 amount) external;
    function recordPerformance(string calldata strategyId, uint256 totalValue, uint256 _returns, uint256 gasUsed) external;
    
    function getUserDeposits(address user) external view returns (UserDeposit[] memory);
    function getCurrentAllocation() external view returns (StrategyAllocation[] memory);
    function getStrategyPerformance(string calldata strategyId) external view returns (PerformanceMetrics[] memory);
    function getSupportedAssets() external view returns (address[] memory);
}