export interface Config {
    port: number;
    nodeEnv: string;
    databaseUrl: string;
    jwtSecret: string;
    chainlinkVrfCoordinator: string;
    chainlinkSubscriptionId: string;
    chainlinkGasLane: string;
    rpcUrls: {
        ethereum: string;
        polygon: string;
        arbitrum: string;
    };
    privateKey: string;
    elizaConfig: {
        apiKey: string;
        model: string;
    };
    corsOrigin: string;
}
export declare const config: Config;
//# sourceMappingURL=config.d.ts.map