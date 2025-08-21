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
export declare function initializeBroker(): Promise<any>;
export declare function getBroker(): any;
export declare function getAvailableServices(): Promise<ServiceProvider[]>;
export declare function acknowledgeProvider(providerAddress: string): Promise<void>;
export declare function sendAIRequest(providerAddress: string, question: string, model?: string): Promise<{
    answer: string;
    valid: boolean;
    cost: string;
}>;
export declare function addFunds(amount: string): Promise<{
    success: boolean;
    newBalance: string;
}>;
export declare function getAccountBalance(): Promise<{
    balance: string;
    locked: string;
    available: string;
}>;
//# sourceMappingURL=brokerService.d.ts.map