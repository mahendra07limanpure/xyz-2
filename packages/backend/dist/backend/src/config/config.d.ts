export interface Config {
    port: number;
    nodeEnv: string;
    databaseUrl: string;
    jwtSecret: string;
    blockchain: {
        privateKey: string;
        networks: {
            sepolia: string;
            polygonMumbai?: string;
            arbitrumGoerli?: string;
        };
        contracts: {
            lootManager: string;
            partyRegistry: string;
            crossChainLootManager: string;
            randomLootGenerator: string;
        };
        chainlink: {
            vrfCoordinator: string;
            subscriptionId: string;
            gasLane: string;
        };
    };
    elizaConfig: {
        apiKey: string;
        model: string;
    };
    corsOrigin: string;
}
export declare const config: Config;
//# sourceMappingURL=config.d.ts.map