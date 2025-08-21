# Yield Optimizer with Adaptive AI Strategies

## Project Concept
Building a DeFi yield optimizer that uses AI to dynamically shift funds between different yield-generating strategies:
- Lending protocols
- Liquidity provider (LP) farming
- Staking pools

## Key Features
- **Adaptive AI Models**: Algorithms that adapt to changing market volatility and gas costs
- **Dynamic Rebalancing**: Automatic fund allocation optimization
- **High-Frequency Decision Making**: Models can run inference every block if needed
- **Transparency**: All past strategies and results stored for historical analysis
- **Multi-Strategy Aggregation**: Intelligent switching between different DeFi protocols

## 0G Stack Integration

### Services Used
1. **0G Compute**: AI model inference and strategy calculations
2. **0G Storage**: Historical data and strategy results storage
3. **0G Chain**: Transaction execution for rebalancing operations

### Why 0G Stack
- **Compute**: Enables frequent AI inference (potentially every block)
- **Chain**: Handles rebalancing transaction execution efficiently
- **Storage**: Provides decentralized storage for transparency and historical data

## Documentation Resources
- [0G Storage SDK](https://docs.0g.ai/developer-hub/building-on-0g/storage/sdk)
- [0G Compute Network SDK](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/sdk)
- [Deploy Contracts on 0G](https://docs.0g.ai/developer-hub/building-on-0g/contracts-on-0g/deploy-contracts)

## Current Architecture
- **Frontend**: React app in `testing/` directory with dashboard and landing page
- **Backend**: Node.js backend for API and business logic
- **Smart Contracts**: Deployed on 0G Chain for fund management and rebalancing
- **AI Components**: Integration with 0G Compute for strategy optimization

## Recent Progress
- OG contracts deployed
- Landing page and dashboard components implemented
- Wallet connection setup (Wagmi integration)
- Component refactoring (removed old og-compute, og-dashboard, og-storage components)