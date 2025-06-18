export interface ElizaAgent {
    id: string;
    name: string;
    personality: string;
    specialties: string[];
}
declare class ElizaService {
    private agents;
    private initialized;
    initialize(): Promise<void>;
    generateResponse(agentId: string, message: string, context: any): Promise<string>;
    private generatePlaceholderResponse;
    getAvailableAgents(): ElizaAgent[];
    getAgent(agentId: string): ElizaAgent | undefined;
}
export declare const elizaService: ElizaService;
export declare function initializeEliza(): Promise<void>;
export {};
//# sourceMappingURL=elizaService.d.ts.map