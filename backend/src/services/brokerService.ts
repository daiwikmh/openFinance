import { ethers } from 'ethers';
import { createZGComputeNetworkBroker } from '@0glabs/0g-serving-broker';

let broker: any = null;
let wallet: ethers.Wallet | null = null;

export interface ServiceProvider {
  provider: string;
  serviceType: string;
  url: string;
  inputPrice: bigint;
  outputPrice: bigint;
  updatedAt: bigint;
  model: string;
  verifiability: string;
}

export async function initializeBroker() {
  try {
    if (!process.env.PRIVATE_KEY || !process.env.ZG_RPC_URL) {
      throw new Error('Missing required environment variables: PRIVATE_KEY or ZG_RPC_URL');
    }

    console.log('Connecting to 0G Network...');
    const provider = new ethers.JsonRpcProvider(process.env.ZG_RPC_URL);
    wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    console.log('Creating 0G Compute Network broker...');
    broker = await createZGComputeNetworkBroker(wallet);
    
    console.log('Checking account balance...');
    const account = await broker.ledger.getLedger();
    const balance = ethers.formatEther(account.balance);
    console.log(`Account balance: ${balance} OG tokens`);
    
    if (parseFloat(balance) < 0.01) {
      console.warn('⚠️  Low balance detected. Consider adding funds for optimal performance.');
    }
    
    console.log('✅ 0G Compute Network broker initialized successfully');
    return broker;
  } catch (error) {
    console.error('❌ Failed to initialize broker:', error);
    throw error;
  }
}

export function getBroker() {
  if (!broker) {
    throw new Error('Broker not initialized. Call initializeBroker() first.');
  }
  return broker;
}

export async function getAvailableServices(): Promise<ServiceProvider[]> {
  try {
    const brokerInstance = getBroker();
    const services = await brokerInstance.inference.listService();
    
    console.log(`Found ${services.length} available services`);
    return services;
  } catch (error) {
    console.error('Failed to get available services:', error);
    throw error;
  }
}

export async function acknowledgeProvider(providerAddress: string) {
  try {
    const brokerInstance = getBroker();
    await brokerInstance.inference.acknowledgeProviderSigner(providerAddress);
    console.log(`✅ Provider ${providerAddress} acknowledged`);
  } catch (error) {
    console.error(`Failed to acknowledge provider ${providerAddress}:`, error);
    throw error;
  }
}

export async function sendAIRequest(
  providerAddress: string, 
  question: string,
  model?: string
): Promise<{ answer: string; valid: boolean; cost: string }> {
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
    const valid = await brokerInstance.inference.processResponse(
      providerAddress,
      answer,
      data.id // chatID for verifiable services
    );
    
    // Estimate cost (simplified calculation)
    const inputTokens = question.length / 4; // Rough estimation
    const outputTokens = answer.length / 4;
    const estimatedCost = `${(inputTokens + outputTokens) * 0.0001} OG`; // Rough estimation
    
    console.log(`✅ AI request completed - Valid: ${valid}, Cost: ~${estimatedCost}`);
    
    return { answer, valid, cost: estimatedCost };
  } catch (error) {
    console.error('Failed to send AI request:', error);
    throw error;
  }
}

export async function addFunds(amount: string) {
  try {
    const brokerInstance = getBroker();
    const amountWei = ethers.parseEther(amount);
    
    await brokerInstance.ledger.addLedger(amountWei);
    console.log(`✅ Added ${amount} OG tokens to account`);
    
    const account = await brokerInstance.ledger.getLedger();
    const newBalance = ethers.formatEther(account.balance);
    console.log(`New balance: ${newBalance} OG tokens`);
    
    return { success: true, newBalance };
  } catch (error) {
    console.error('Failed to add funds:', error);
    throw error;
  }
}

export async function getAccountBalance() {
  try {
    const brokerInstance = getBroker();
    const ledger = await brokerInstance.ledger.getLedger();
    
    return {
      balance: ethers.formatEther(ledger.balance),
      locked: ethers.formatEther(ledger.locked),
      available: ethers.formatEther(ledger.balance - ledger.locked)
    };
  } catch (error) {
    console.error('Failed to get account balance:', error);
    throw error;
  }
}