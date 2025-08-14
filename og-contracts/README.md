# 0G DeFi Strategy Aggregator

A smart contract system for automated DeFi strategy management on 0G Chain, supporting native OG token transactions.

## Features

- **Native OG Support**: Deposit and withdraw native OG tokens (Chain ID: 16601)
- **AI Strategy Integration**: Connects with 0G Compute for strategy optimization
- **Performance Tracking**: Records strategy performance metrics
- **Rebalancing**: Automated portfolio rebalancing based on AI recommendations

## Network Details

- **Network**: 0G-Galileo-Testnet
- **Chain ID**: 16601  
- **RPC URL**: https://evmrpc-testnet.0g.ai
- **Native Token**: OG
- **Faucet**: https://faucet.0g.ai (0.1 OG per day)

## Deployment

Deploy to 0G testnet:

```bash
# Set environment variables
export PRIVATE_KEY=your_private_key_here

# Deploy using Foundry
forge script script/DeployStrategy.s.sol --rpc-url 0g_testnet --broadcast
```

## Usage

### Deposit Native OG Tokens

```solidity
// Using the convenience function
strategyAggregator.depositNativeOG{value: 1 ether}();

// Using the general function
strategyAggregator.depositFunds{value: 1 ether}(address(0), 0);
```

### Withdraw Funds

```solidity
strategyAggregator.withdrawFunds(0.5 ether);
```

## Contract Functions

- `depositNativeOG()` - Deposit native OG tokens
- `depositFunds(asset, amount)` - Deposit ERC20 tokens or native OG
- `withdrawFunds(amount)` - Withdraw deposited funds
- `rebalancePortfolio()` - Execute AI-generated strategy (AI engine only)
- `recordPerformance()` - Record strategy metrics (AI engine only)

## Testing

```bash
forge test --rpc-url 0g_testnet
```

## Foundry Commands

### Build
```shell
forge build
```

### Test
```shell
forge test
```

### Deploy
```shell
forge script script/DeployStrategy.s.sol --rpc-url 0g_testnet --broadcast
```
