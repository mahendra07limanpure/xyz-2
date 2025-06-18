import { Server } from 'socket.io';
export declare class GameSocketManager {
    private io;
    private connectedPlayers;
    private partyRooms;
    constructor(io: Server);
    initialize(): void;
    private handlePlayerJoin;
    private handlePartyJoin;
    private handlePartyLeave;
    private handleDungeonAction;
    private handleChatMessage;
    private handleDisconnect;
    emitToPlayer(playerId: string, event: string, data: any): void;
    emitToParty(partyId: string, event: string, data: any): void;
    emitToAll(event: string, data: any): void;
    getConnectedPlayersCount(): number;
    getPartyMembersCount(partyId: string): number;
}
//# sourceMappingURL=socketService.d.ts.map