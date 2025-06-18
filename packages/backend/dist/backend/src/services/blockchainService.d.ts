interface ContractAddresses {
    lootManager: string;
    partyRegistry: string;
    crossChainLootManager: string;
    randomLootGenerator: string;
}
export declare class BlockchainService {
    private providers;
    private publicClients;
    private walletClients;
    private contracts;
    private account;
    private contractAddresses;
    constructor();
    private initializeClients;
    private loadContractAddresses;
    mintLoot(chainId: number, playerAddress: string, name: string, lootType: string, rarity: number, power: number, attributes: string[]): Promise<{
        tokenId: bigint;
        transactionHash: string;
    }>;
    getLootDetails(chainId: number, tokenId: bigint): Promise<any>;
    getPlayerEquipment(chainId: number, playerAddress: string): Promise<bigint[]>;
    registerPlayer(chainId: number, playerAddress: string): Promise<string>;
    createParty(chainId: number, maxSize: number): Promise<{
        partyId: bigint;
        transactionHash: string;
    }>;
    getPartyDetails(chainId: number, partyId: bigint): Promise<any>;
    transferLootCrossChain(sourceChainId: number, destinationChainSelector: string, receiverAddress: string, tokenId: bigint, feeTokenAddress?: string): Promise<string>;
    private extractTokenIdFromLogs;
    private extractPartyIdFromLogs;
    checkConnection(chainId: number): Promise<boolean>;
    getSupportedChains(): number[];
    updateContractAddresses(chainId: number, addresses: Partial<ContractAddresses>): void;
}
export declare const blockchainService: BlockchainService;
export {};
//# sourceMappingURL=blockchainService.d.ts.map