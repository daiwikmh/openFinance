// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console2} from "forge-std/Test.sol";
import {StrategyAggregator} from "../src/StrategyAggregator.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MockERC20 is IERC20 {
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    
    uint256 private _totalSupply = 1000000 * 10**18;
    string public name = "Mock Token";
    string public symbol = "MOCK";
    uint8 public decimals = 18;

    constructor() {
        _balances[msg.sender] = _totalSupply;
    }

    function totalSupply() external view override returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) external view override returns (uint256) {
        return _balances[account];
    }

    function transfer(address to, uint256 amount) external override returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function allowance(address owner, address spender) external view override returns (uint256) {
        return _allowances[owner][spender];
    }

    function approve(address spender, uint256 amount) external override returns (bool) {
        _approve(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external override returns (bool) {
        uint256 currentAllowance = _allowances[from][msg.sender];
        if (currentAllowance != type(uint256).max) {
            require(currentAllowance >= amount, "ERC20: insufficient allowance");
            _approve(from, msg.sender, currentAllowance - amount);
        }
        _transfer(from, to, amount);
        return true;
    }

    function _transfer(address from, address to, uint256 amount) internal {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");
        
        uint256 fromBalance = _balances[from];
        require(fromBalance >= amount, "ERC20: transfer amount exceeds balance");
        
        _balances[from] = fromBalance - amount;
        _balances[to] += amount;
    }

    function _approve(address owner, address spender, uint256 amount) internal {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");
        
        _allowances[owner][spender] = amount;
    }

    function mint(address to, uint256 amount) external {
        _balances[to] += amount;
        _totalSupply += amount;
    }
}

contract StrategyAggregatorTest is Test {
    StrategyAggregator public aggregator;
    MockERC20 public mockToken;
    MockERC20 public mockToken2;
    
    address public user1 = address(0x1);
    address public user2 = address(0x2);
    address public aiEngine = address(0x3);

    function setUp() public {
        mockToken = new MockERC20();
        mockToken2 = new MockERC20();
        
        address[] memory supportedAssets = new address[](2);
        supportedAssets[0] = address(mockToken);
        supportedAssets[1] = address(mockToken2);
        
        aggregator = new StrategyAggregator(address(this), supportedAssets);
        aggregator.setAiEngine(aiEngine);
        
        // Mint tokens to users
        mockToken.mint(user1, 10000 * 10**18);
        mockToken.mint(user2, 10000 * 10**18);
        mockToken2.mint(user1, 10000 * 10**18);
        mockToken2.mint(user2, 10000 * 10**18);
    }

    function testDepositFunds() public {
        vm.startPrank(user1);
        
        uint256 depositAmount = 1000 * 10**18;
        mockToken.approve(address(aggregator), depositAmount);
        
        aggregator.depositFunds(address(mockToken), depositAmount);
        
        assertEq(aggregator.userTotalDeposits(user1), depositAmount);
        assertEq(aggregator.totalValueLocked(), depositAmount);
        
        vm.stopPrank();
    }

    function testRebalancePortfolio() public {
        vm.startPrank(aiEngine);
        
        StrategyAggregator.StrategyAllocation[] memory allocations = 
            new StrategyAggregator.StrategyAllocation[](2);
        
        allocations[0] = StrategyAggregator.StrategyAllocation({
            protocol: address(0x100),
            percentage: 6000, // 60%
            active: true
        });
        
        allocations[1] = StrategyAggregator.StrategyAllocation({
            protocol: address(0x200),
            percentage: 4000, // 40%
            active: true
        });
        
        aggregator.rebalancePortfolio(allocations, "strategy-v1");
        
        StrategyAggregator.StrategyAllocation[] memory currentAllocations = 
            aggregator.getCurrentAllocation();
        
        assertEq(currentAllocations.length, 2);
        assertEq(currentAllocations[0].percentage, 6000);
        assertEq(currentAllocations[1].percentage, 4000);
        
        vm.stopPrank();
    }

    function testWithdrawFunds() public {
        // First deposit
        vm.startPrank(user1);
        uint256 depositAmount = 1000 * 10**18;
        mockToken.approve(address(aggregator), depositAmount);
        aggregator.depositFunds(address(mockToken), depositAmount);
        
        // Then withdraw
        uint256 withdrawAmount = 500 * 10**18;
        aggregator.withdrawFunds(withdrawAmount);
        
        assertEq(aggregator.userTotalDeposits(user1), depositAmount - withdrawAmount);
        assertEq(aggregator.totalValueLocked(), depositAmount - withdrawAmount);
        
        vm.stopPrank();
    }

    function testRecordPerformance() public {
        vm.startPrank(aiEngine);
        
        aggregator.recordPerformance("strategy-v1", 100000, 5200, 21000);
        
        StrategyAggregator.PerformanceMetrics[] memory performance = 
            aggregator.getStrategyPerformance("strategy-v1");
        
        assertEq(performance.length, 1);
        assertEq(performance[0].totalValue, 100000);
        assertEq(performance[0].returns, 5200);
        assertEq(performance[0].gasUsed, 21000);
        
        vm.stopPrank();
    }

    function testFailDepositUnsupportedAsset() public {
        MockERC20 unsupportedToken = new MockERC20();
        
        vm.startPrank(user1);
        unsupportedToken.mint(user1, 1000 * 10**18);
        unsupportedToken.approve(address(aggregator), 1000 * 10**18);
        
        // This should fail
        aggregator.depositFunds(address(unsupportedToken), 1000 * 10**18);
        vm.stopPrank();
    }

    function testFailUnauthorizedRebalance() public {
        vm.startPrank(user1); // Not the AI engine
        
        StrategyAggregator.StrategyAllocation[] memory allocations = 
            new StrategyAggregator.StrategyAllocation[](1);
        
        allocations[0] = StrategyAggregator.StrategyAllocation({
            protocol: address(0x100),
            percentage: 10000,
            active: true
        });
        
        // This should fail
        aggregator.rebalancePortfolio(allocations, "strategy-v1");
        vm.stopPrank();
    }
}