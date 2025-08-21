import { WebSocketServer } from 'ws';
interface Position {
    id: string;
    userAddress: string;
    asset: string;
    collateral: number;
    borrowed: number;
    leverage: number;
    currentPrice: number;
    liquidationPrice: number;
    healthFactor: number;
    timestamp: number;
}
interface RiskAlert {
    id: string;
    positionId: string;
    type: 'warning' | 'critical' | 'liquidation';
    message: string;
    timestamp: number;
    aiAnalysis?: string;
}
export declare function startRiskMonitoring(websocketServer: WebSocketServer): void;
export declare function getPositions(): Position[];
export declare function getRiskAlerts(limit?: number): RiskAlert[];
export declare function getPositionById(id: string): Position | undefined;
export {};
//# sourceMappingURL=riskMonitoring.d.ts.map