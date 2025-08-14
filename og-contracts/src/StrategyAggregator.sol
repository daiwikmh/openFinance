// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract StrategyAggregator is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

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

    mapping(address => UserDeposit[]) public userDeposits;
    mapping(address => uint256) public userTotalDeposits;
    mapping(string => PerformanceMetrics[]) public strategyPerformance;
    
    StrategyAllocation[] public currentAllocation;
    
    address[] public supportedAssets;
    mapping(address => bool) public isAssetSupported;
    
    uint256 public totalValueLocked;
    uint256 public managementFee = 200; // 2%
    uint256 public performanceFee = 1000; // 10%
    
    address public aiEngine;
    
    event FundsDeposited(address indexed user, address indexed asset, uint256 amount);
    event PortfolioRebalanced(string strategyId, uint256 timestamp);
    event FundsWithdrawn(address indexed user, uint256 amount);
    event PerformanceRecorded(string strategyId, uint256 totalValue, uint256 _returns);

    constructor(address initialOwner, address[] memory _supportedAssets) Ownable(initialOwner) {
        for (uint i = 0; i < _supportedAssets.length; i++) {
            supportedAssets.push(_supportedAssets[i]);
            isAssetSupported[_supportedAssets[i]] = true;
        }
        // Always support native OG asset (address(0))
        if (_supportedAssets.length == 0 || _supportedAssets[0] != address(0)) {
            supportedAssets.push(address(0));
            isAssetSupported[address(0)] = true;
        }
    }

    modifier onlyAiEngine() {
        require(msg.sender == aiEngine, "Only AI engine can call this");
        _;
    }

    function setAiEngine(address _aiEngine) external onlyOwner {
        aiEngine = _aiEngine;
    }

    function depositFunds(address asset, uint256 amount) external payable nonReentrant {
        if (asset == address(0)) {
            // Native OG asset deposit
            require(msg.value > 0, "Must send OG tokens");
            amount = msg.value;
        } else {
            // ERC20 token deposit
            require(isAssetSupported[asset], "Asset not supported");
            require(amount > 0, "Amount must be greater than 0");
            require(msg.value == 0, "Don't send native tokens for ERC20 deposits");
            IERC20(asset).safeTransferFrom(msg.sender, address(this), amount);
        }

        userDeposits[msg.sender].push(UserDeposit({
            asset: asset,
            amount: amount,
            timestamp: block.timestamp,
            active: true
        }));

        userTotalDeposits[msg.sender] += amount;
        totalValueLocked += amount;

        emit FundsDeposited(msg.sender, asset, amount);
    }

    // Convenience function for depositing native OG tokens
    function depositNativeOG() external payable nonReentrant {
        require(msg.value > 0, "Must send OG tokens");

        userDeposits[msg.sender].push(UserDeposit({
            asset: address(0), // Native OG
            amount: msg.value,
            timestamp: block.timestamp,
            active: true
        }));

        userTotalDeposits[msg.sender] += msg.value;
        totalValueLocked += msg.value;

        emit FundsDeposited(msg.sender, address(0), msg.value);
    }

    function rebalancePortfolio(
        StrategyAllocation[] calldata newAllocations,
        string calldata strategyId
    ) external onlyAiEngine nonReentrant {
        require(newAllocations.length > 0, "Must provide allocations");
        
        uint256 totalPercentage = 0;
        for (uint i = 0; i < newAllocations.length; i++) {
            totalPercentage += newAllocations[i].percentage;
        }
        require(totalPercentage == 10000, "Total percentage must equal 100%");

        delete currentAllocation;
        for (uint i = 0; i < newAllocations.length; i++) {
            currentAllocation.push(newAllocations[i]);
        }

        emit PortfolioRebalanced(strategyId, block.timestamp);
    }

    function withdrawFunds(uint256 amount) external nonReentrant {
        require(userTotalDeposits[msg.sender] >= amount, "Insufficient balance");
        require(amount > 0, "Amount must be greater than 0");

        userTotalDeposits[msg.sender] -= amount;
        totalValueLocked -= amount;

        // Find and update user deposits
        uint256 remainingAmount = amount;
        for (uint i = 0; i < userDeposits[msg.sender].length && remainingAmount > 0; i++) {
            if (userDeposits[msg.sender][i].active) {
                uint256 depositAmount = userDeposits[msg.sender][i].amount;
                if (depositAmount >= remainingAmount) {
                    userDeposits[msg.sender][i].amount -= remainingAmount;
                    if (userDeposits[msg.sender][i].amount == 0) {
                        userDeposits[msg.sender][i].active = false;
                    }
                    remainingAmount = 0;
                } else {
                    userDeposits[msg.sender][i].amount = 0;
                    userDeposits[msg.sender][i].active = false;
                    remainingAmount -= depositAmount;
                }
            }
        }

        // For native OG withdrawals
        if (supportedAssets[0] == address(0)) {
            payable(msg.sender).transfer(amount);
        } else {
            // For ERC20 withdrawals
            IERC20(supportedAssets[0]).safeTransfer(msg.sender, amount);
        }

        emit FundsWithdrawn(msg.sender, amount);
    }

    function recordPerformance(
        string calldata strategyId,
        uint256 totalValue,
        uint256 _returns,
        uint256 gasUsed
    ) external onlyAiEngine {
        strategyPerformance[strategyId].push(PerformanceMetrics({
            timestamp: block.timestamp,
            totalValue: totalValue,
            _returns: _returns,
            gasUsed: gasUsed,
            strategyId: strategyId
        }));

        emit PerformanceRecorded(strategyId, totalValue, _returns);
    }

    function getUserDeposits(address user) external view returns (UserDeposit[] memory) {
        return userDeposits[user];
    }

    function getCurrentAllocation() external view returns (StrategyAllocation[] memory) {
        return currentAllocation;
    }

    function getStrategyPerformance(string calldata strategyId) external view returns (PerformanceMetrics[] memory) {
        return strategyPerformance[strategyId];
    }

    function getSupportedAssets() external view returns (address[] memory) {
        return supportedAssets;
    }

    function addSupportedAsset(address asset) external onlyOwner {
        require(!isAssetSupported[asset], "Asset already supported");
        supportedAssets.push(asset);
        isAssetSupported[asset] = true;
    }

    function removeSupportedAsset(address asset) external onlyOwner {
        require(isAssetSupported[asset], "Asset not supported");
        isAssetSupported[asset] = false;
        
        for (uint i = 0; i < supportedAssets.length; i++) {
            if (supportedAssets[i] == asset) {
                supportedAssets[i] = supportedAssets[supportedAssets.length - 1];
                supportedAssets.pop();
                break;
            }
        }
    }
}