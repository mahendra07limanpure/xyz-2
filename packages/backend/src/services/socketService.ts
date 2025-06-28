import { Server, Socket } from 'socket.io';
import { logger } from '../utils/logger';

export class GameSocketManager {
  private io: Server;
  private connectedPlayers: Map<string, Socket> = new Map();
  private partyRooms: Map<string, Set<string>> = new Map();

  constructor(io: Server) {
    this.io = io;
  }

  initialize(): void {
    this.io.on('connection', (socket: Socket) => {
      logger.info(`Client connected: ${socket.id}`);

      socket.on('player:join', (data: { playerId: string, wallet: string }) => {
        this.handlePlayerJoin(socket, data);
      });

      socket.on('party:join', (data: { partyId: string, playerId: string }) => {
        this.handlePartyJoin(socket, data);
      });

      socket.on('party:leave', (data: { partyId: string, playerId: string }) => {
        this.handlePartyLeave(socket, data);
      });

      socket.on('dungeon:action', (data: any) => {
        this.handleDungeonAction(socket, data);
      });

      socket.on('multiplayer:join_game', (data: { partyId: string; playerData: any }) => {
        this.handleMultiplayerJoin(socket, data);
      });

      socket.on('multiplayer:leave_game', (data: { partyId: string; playerId: string }) => {
        this.handleMultiplayerLeave(socket, data);
      });

      socket.on('chat:message', (data: { message: string, partyId?: string }) => {
        this.handleChatMessage(socket, data);
      });

      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });
    });
  }

  private handlePlayerJoin(socket: Socket, data: { playerId: string, wallet: string }): void {
    socket.data.playerId = data.playerId;
    socket.data.wallet = data.wallet;
    this.connectedPlayers.set(data.playerId, socket);
    
    socket.emit('player:joined', { success: true });
    logger.info(`Player ${data.playerId} joined game`);
  }

  private handlePartyJoin(socket: Socket, data: { partyId: string, playerId: string }): void {
    const { partyId, playerId } = data;
    
    socket.join(partyId);
    
    if (!this.partyRooms.has(partyId)) {
      this.partyRooms.set(partyId, new Set());
    }
    this.partyRooms.get(partyId)!.add(playerId);

    socket.to(partyId).emit('party:member_joined', { playerId });
    socket.emit('party:joined', { partyId, success: true });
    
    logger.info(`Player ${playerId} joined party ${partyId}`);
  }

  private handlePartyLeave(socket: Socket, data: { partyId: string, playerId: string }): void {
    const { partyId, playerId } = data;
    
    socket.leave(partyId);
    
    const partyMembers = this.partyRooms.get(partyId);
    if (partyMembers) {
      partyMembers.delete(playerId);
      if (partyMembers.size === 0) {
        this.partyRooms.delete(partyId);
      }
    }

    socket.to(partyId).emit('party:member_left', { playerId });
    socket.emit('party:left', { partyId, success: true });
    
    logger.info(`Player ${playerId} left party ${partyId}`);
  }

  private handleDungeonAction(socket: Socket, data: any): void {
    const { partyId, action, payload } = data;
    
    // Handle specific multiplayer actions
    if (action === 'player_move') {
      socket.to(partyId).emit('multiplayer:player_move', {
        playerId: socket.data.playerId,
        action,
        payload,
        timestamp: new Date()
      });
    } else if (action === 'player_action') {
      socket.to(partyId).emit('multiplayer:player_action', {
        playerId: socket.data.playerId,
        action,
        payload,
        timestamp: new Date()
      });
    } else {
      // Broadcast generic action to all party members
      socket.to(partyId).emit('dungeon:action', {
        playerId: socket.data.playerId,
        action,
        payload,
        timestamp: new Date()
      });
    }
  }

  private handleMultiplayerJoin(socket: Socket, data: { partyId: string; playerData: any }): void {
    const { partyId, playerData } = data;
    
    socket.join(partyId);
    
    // Notify other players that this player joined the game
    socket.to(partyId).emit('multiplayer:player_joined', {
      playerId: socket.data.playerId,
      action: 'player_joined',
      payload: playerData,
      timestamp: new Date()
    });
    
    // Send current game state to the joining player
    socket.emit('multiplayer:game_state', {
      playerId: 'server',
      action: 'game_state',
      payload: this.getPartyGameState(partyId),
      timestamp: new Date()
    });
    
    logger.info(`Player ${socket.data.playerId} joined multiplayer game in party ${partyId}`);
  }

  private handleMultiplayerLeave(socket: Socket, data: { partyId: string; playerId: string }): void {
    const { partyId, playerId } = data;
    
    socket.leave(partyId);
    
    // Notify other players that this player left the game
    socket.to(partyId).emit('multiplayer:player_left', {
      playerId: socket.data.playerId,
      action: 'player_left',
      payload: { playerId },
      timestamp: new Date()
    });
    
    logger.info(`Player ${playerId} left multiplayer game in party ${partyId}`);
  }

  private getPartyGameState(partyId: string): any {
    // Return current game state for a party
    // This would include enemy positions, loot, etc.
    return {
      enemies: [],
      loot: [],
      level: 1
    };
  }

  private handleChatMessage(socket: Socket, data: { message: string, partyId?: string }): void {
    const { message, partyId } = data;
    const playerId = socket.data.playerId;
    
    const chatData = {
      playerId,
      message,
      timestamp: new Date()
    };

    if (partyId) {
      // Send to all party members including sender
      this.io.to(partyId).emit('chat:message', chatData);
    } else {
      // Send to global chat including sender
      this.io.emit('chat:message', chatData);
    }
  }

  private handleDisconnect(socket: Socket): void {
    const playerId = socket.data.playerId;
    
    if (playerId) {
      this.connectedPlayers.delete(playerId);
      
      // Remove from all party rooms
      for (const [partyId, members] of this.partyRooms.entries()) {
        if (members.has(playerId)) {
          members.delete(playerId);
          socket.to(partyId).emit('party:member_disconnected', { playerId });
          
          if (members.size === 0) {
            this.partyRooms.delete(partyId);
          }
        }
      }
    }
    
    logger.info(`Client disconnected: ${socket.id}`);
  }

  // Public methods for emitting events from other parts of the application
  emitToPlayer(playerId: string, event: string, data: any): void {
    const socket = this.connectedPlayers.get(playerId);
    if (socket) {
      socket.emit(event, data);
    }
  }

  emitToParty(partyId: string, event: string, data: any): void {
    this.io.to(partyId).emit(event, data);
  }

  emitToPartyLeader(partyId: string, event: string, data: any): void {
    // Find and emit to the party leader specifically
    // This would require storing which players are leaders
    this.io.to(partyId).emit(event, data);
  }

  emitToAll(event: string, data: any): void {
    this.io.emit(event, data);
  }

  getConnectedPlayersCount(): number {
    return this.connectedPlayers.size;
  }

  getPartyMembersCount(partyId: string): number {
    return this.partyRooms.get(partyId)?.size || 0;
  }
}
