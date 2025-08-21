export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  data?: any;
}

export interface ServiceModel {
  provider: string;
  serviceType: string;
  url: string;
  inputPrice: string;
  outputPrice: string;
  updatedAt: string;
  model: string;
  verifiability: string;
  description: string;
  acknowledged: boolean;
}

export class ModelsService {
  private models: ServiceModel[] = [
    {
      provider: '0xf07240Efa67755B5311bc75784a061eDB47165Dd',
      serviceType: 'inference',
      url: 'https://api.0g-network.com/v1',
      inputPrice: '0.00001',
      outputPrice: '0.00002',
      updatedAt: new Date().toISOString(),
      model: 'llama-3.3-70b-instruct',
      verifiability: 'TEE (TeeML)',
      description: 'State-of-the-art 70B parameter model for general AI tasks with trusted execution environment verification',
      acknowledged: false
    },
    {
      provider: '0x3feE5a4dd5FDb8a32dDA97Bed899830605dBD9D3',
      serviceType: 'inference',
      url: 'https://api.0g-network.com/v1',
      inputPrice: '0.00001',
      outputPrice: '0.00003',
      updatedAt: new Date().toISOString(),
      model: 'deepseek-r1-70b',
      verifiability: 'TEE (TeeML)',
      description: 'Advanced reasoning model optimized for complex problem solving and mathematical tasks',
      acknowledged: false
    },
    
  ];

  private logs: LogEntry[] = [
    {
      timestamp: new Date().toISOString(),
      level: 'info',
      message: '0G Compute Network Broker initialized',
      data: { provider: 'MetaMask', network: '0G Network' }
    },
    {
      timestamp: new Date().toISOString(),
      level: 'info',
      message: 'Available models discovered',
      data: {
        models: [
          {
            name: 'llama-3.3-70b-instruct',
            provider: '0xf07240Efa67755B5311bc75784a061eDB47165Dd',
            verifiability: 'TEE (TeeML)',
            inputPrice: '0.00001',
            outputPrice: '0.00002'
          },
          {
            name: 'deepseek-r1-70b',
            provider: '0x3feE5a4dd5FDb8a32dDA97Bed899830605dBD9D3',
            verifiability: 'TEE (TeeML)',
            inputPrice: '0.00001',
            outputPrice: '0.00003'
          }
        ]
      }
    },
    {
      timestamp: new Date().toISOString(),
      level: 'info',
      message: 'Account balance retrieved',
      data: {
        balance: '0.1 OG',
        locked: '0.01 OG',
        available: '0.09 OG'
      }
    },
    {
      timestamp: new Date().toISOString(),
      level: 'warn',
      message: 'Provider acknowledgment required before service usage'
    },
    {
      timestamp: new Date().toISOString(),
      level: 'info',
      message: 'Service request headers generated',
      data: { provider: '0xf07...5Dd', authenticated: true }
    }
  ];

  getLogs(): LogEntry[] {
    return [...this.logs].reverse();
  }

  addLog(level: LogEntry['level'], message: string, data?: any) {
    this.logs.push({
      timestamp: new Date().toISOString(),
      level,
      message,
      data
    });
  }

  clearLogs() {
    this.logs = [];
  }

  getAvailableModels(): ServiceModel[] {
    return [...this.models];
  }

  acknowledgeProvider(providerAddress: string): void {
    const modelIndex = this.models.findIndex(m => m.provider === providerAddress);
    if (modelIndex !== -1) {
      this.models[modelIndex].acknowledged = true;
      this.addLog('info', `Provider ${providerAddress.slice(0, 6)}...${providerAddress.slice(-4)} acknowledged`, {
        provider: providerAddress,
        model: this.models[modelIndex].model
      });
    }
  }

  sendRequest(providerAddress: string, message: string): Promise<string> {
    return new Promise((resolve) => {
      const model = this.models.find(m => m.provider === providerAddress);
      if (!model) {
        this.addLog('error', 'Model not found', { provider: providerAddress });
        resolve('Error: Model not found');
        return;
      }

      if (!model.acknowledged) {
        this.addLog('warn', 'Provider not acknowledged. Acknowledging now...', { provider: providerAddress });
        this.acknowledgeProvider(providerAddress);
      }

      this.addLog('info', 'Sending request to model', {
        provider: providerAddress,
        model: model.model,
        message: message.slice(0, 50) + (message.length > 50 ? '...' : ''),
        inputPrice: model.inputPrice,
        outputPrice: model.outputPrice
      });

      // Simulate API call delay
      setTimeout(() => {
        const responses = [
          `Hello! I'm ${model.model}. I received your message: "${message.slice(0, 30)}${message.length > 30 ? '...' : ''}"`,
          `Based on your input "${message}", here's my analysis...`,
          `I understand you're asking about: "${message}". Let me help you with that.`,
          `Processing your request: "${message}". Here's what I can tell you...`,
          `Your query "${message}" is interesting. Here's my response...`
        ];
        
        const response = responses[Math.floor(Math.random() * responses.length)];
        
        this.addLog('info', 'Response received from model', {
          provider: providerAddress,
          model: model.model,
          responseLength: response.length,
          success: true
        });

        resolve(response);
      }, 1000 + Math.random() * 2000); // Random delay 1-3 seconds
    });
  }

  getModelMetrics() {
    return {
      totalModels: this.models.length,
      acknowledgedModels: this.models.filter(m => m.acknowledged).length,
      verifiedModels: this.models.filter(m => m.verifiability).length,
      totalLogs: this.logs.length
    };
  }
}

export const modelsService = new ModelsService();