// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console2} from "forge-std/Script.sol";
import {StrategyAggregator} from "../src/StrategyAggregator.sol";

contract DeployStrategy is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Initial owner address
        address initialOwner = 0x1029BBd9B780f449EBD6C74A615Fe0c04B61679c;

        // For 0G testnet, we'll work with the native OG asset
        // Create empty array for now since we're dealing with native asset
        address[] memory supportedAssets = new address[](1);
        
        // Use zero address to represent native OG asset
        supportedAssets[0] = address(0);

        StrategyAggregator aggregator = new StrategyAggregator(initialOwner, supportedAssets);

        console2.log("StrategyAggregator deployed at:", address(aggregator));
        console2.log("Initial Owner:", initialOwner);
        console2.log("Native OG asset supported");
        console2.log("Chain ID: 16601 (0G-Galileo-Testnet)");

        vm.stopBroadcast();
    }
}