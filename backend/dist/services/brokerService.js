"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeBroker = initializeBroker;
exports.getBroker = getBroker;
exports.getAvailableServices = getAvailableServices;
exports.acknowledgeProvider = acknowledgeProvider;
exports.sendAIRequest = sendAIRequest;
exports.addFunds = addFunds;
exports.getAccountBalance = getAccountBalance;
const ethers_1 = require("ethers");
const _0g_serving_broker_1 = require("@0glabs/0g-serving-broker");
let broker = null;
let wallet = null;
async function initializeBroker() {
    try {
        if (!process.env.PRIVATE_KEY || !process.env.ZG_RPC_URL) {
            throw new Error('Missing required environment variables: PRIVATE_KEY or ZG_RPC_URL');
        }
        console.log('Connecting to 0G Network...');
        const provider = new ethers_1.ethers.JsonRpcProvider(process.env.ZG_RPC_URL);
        wallet = new ethers_1.ethers.Wallet(process.env.PRIVATE_KEY, provider);
        console.log('Creating 0G Compute Network broker...');
        broker = await (0, _0g_serving_broker_1.createZGComputeNetworkBroker)(wallet);
        console.log('Checking account balance...');
        const account = await broker.ledger.getLedger();
        const balance = ethers_1.ethers.formatEther(account.balance);
        console.log(`Account balance: ${balance} OG tokens`);
        if (parseFloat(balance) < 0.01) {
            console.warn('⚠️  Low balance detected. Consider adding funds for optimal performance.');
        }
        console.log('✅ 0G Compute Network broker initialized successfully');
        return broker;
    }
    catch (error) {
        console.error('❌ Failed to initialize broker:', error);
        throw error;
    }
}
function getBroker() {
    if (!broker) {
        throw new Error('Broker not initialized. Call initializeBroker() first.');
    }
    return broker;
}
async function getAvailableServices() {
    try {
        const brokerInstance = getBroker();
        const services = await brokerInstance.inference.listService();
        console.log(`Found ${services.length} available services`);
        return services;
    }
    catch (error) {
        console.error('Failed to get available services:', error);
        throw error;
    }
}
async function acknowledgeProvider(providerAddress) {
    try {
        const brokerInstance = getBroker();
        await brokerInstance.inference.acknowledgeProviderSigner(providerAddress);
        console.log(`✅ Provider ${providerAddress} acknowledged`);
    }
    catch (error) {
        console.error(`Failed to acknowledge provider ${providerAddress}:`, error);
        throw error;
    }
}
async function sendAIRequest(providerAddress, question, model) {
    try {
        const brokerInstance = getBroker();
        // Get service metadata
        const { endpoint, model: serviceModel } = await brokerInstance.inference.getServiceMetadata(providerAddress);
        // Generate auth headers
        const headers = await brokerInstance.inference.getRequestHeaders(providerAddress, question);
        // Send request to AI service
        const response = await fetch(`${endpoint}/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...headers },
            body: JSON.stringify({
                messages: [{ role: 'user', content: question }],
                model: model || serviceModel,
            }),
        });
        if (!response.ok) {
            throw new Error(`AI service request failed: ${response.statusText}`);
        }
        const data = await response.json();
        const answer = data.choices[0].message.content;
        // Process response for verification
        const valid = await brokerInstance.inference.processResponse(providerAddress, answer, data.id // chatID for verifiable services
        );
        // Estimate cost (simplified calculation)
        const inputTokens = question.length / 4; // Rough estimation
        const outputTokens = answer.length / 4;
        const estimatedCost = `${(inputTokens + outputTokens) * 0.0001} OG`; // Rough estimation
        console.log(`✅ AI request completed - Valid: ${valid}, Cost: ~${estimatedCost}`);
        return { answer, valid, cost: estimatedCost };
    }
    catch (error) {
        console.error('Failed to send AI request:', error);
        throw error;
    }
}
async function addFunds(amount) {
    try {
        const brokerInstance = getBroker();
        const amountWei = ethers_1.ethers.parseEther(amount);
        await brokerInstance.ledger.addLedger(amountWei);
        console.log(`✅ Added ${amount} OG tokens to account`);
        const account = await brokerInstance.ledger.getLedger();
        const newBalance = ethers_1.ethers.formatEther(account.balance);
        console.log(`New balance: ${newBalance} OG tokens`);
        return { success: true, newBalance };
    }
    catch (error) {
        console.error('Failed to add funds:', error);
        throw error;
    }
}
async function getAccountBalance() {
    try {
        const brokerInstance = getBroker();
        const ledger = await brokerInstance.ledger.getLedger();
        return {
            balance: ethers_1.ethers.formatEther(ledger.balance),
            locked: ethers_1.ethers.formatEther(ledger.locked),
            available: ethers_1.ethers.formatEther(ledger.balance - ledger.locked)
        };
    }
    catch (error) {
        console.error('Failed to get account balance:', error);
        throw error;
    }
}
//# sourceMappingURL=brokerService.js.map