"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameSocketManager = void 0;
const logger_1 = require("../utils/logger");
class GameSocketManager {
    constructor(io) {
        this.connectedPlayers = new Map();
        this.partyRooms = new Map();
        this.io = io;
    }
    initialize() {
        this.io.on('connection', (socket) => {
            logger_1.logger.info(`Client connected: ${socket.id}`);
            socket.on('player:join', (data) => {
                this.handlePlayerJoin(socket, data);
            });
            socket.on('party:join', (data) => {
                this.handlePartyJoin(socket, data);
            });
            socket.on('party:leave', (data) => {
                this.handlePartyLeave(socket, data);
            });
            socket.on('dungeon:action', (data) => {
                this.handleDungeonAction(socket, data);
            });
            socket.on('chat:message', (data) => {
                this.handleChatMessage(socket, data);
            });
            socket.on('disconnect', () => {
                this.handleDisconnect(socket);
            });
        });
    }
    handlePlayerJoin(socket, data) {
        socket.data.playerId = data.playerId;
        socket.data.wallet = data.wallet;
        this.connectedPlayers.set(data.playerId, socket);
        socket.emit('player:joined', { success: true });
        logger_1.logger.info(`Player ${data.playerId} joined game`);
    }
    handlePartyJoin(socket, data) {
        const { partyId, playerId } = data;
        socket.join(partyId);
        if (!this.partyRooms.has(partyId)) {
            this.partyRooms.set(partyId, new Set());
        }
        this.partyRooms.get(partyId).add(playerId);
        socket.to(partyId).emit('party:member_joined', { playerId });
        socket.emit('party:joined', { partyId, success: true });
        logger_1.logger.info(`Player ${playerId} joined party ${partyId}`);
    }
    handlePartyLeave(socket, data) {
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
        logger_1.logger.info(`Player ${playerId} left party ${partyId}`);
    }
    handleDungeonAction(socket, data) {
        const { partyId, action, payload } = data;
        socket.to(partyId).emit('dungeon:action', {
            playerId: socket.data.playerId,
            action,
            payload,
            timestamp: new Date()
        });
    }
    handleChatMessage(socket, data) {
        const { message, partyId } = data;
        const playerId = socket.data.playerId;
        const chatData = {
            playerId,
            message,
            timestamp: new Date()
        };
        if (partyId) {
            socket.to(partyId).emit('chat:message', chatData);
        }
        else {
            socket.broadcast.emit('chat:message', chatData);
        }
    }
    handleDisconnect(socket) {
        const playerId = socket.data.playerId;
        if (playerId) {
            this.connectedPlayers.delete(playerId);
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
        logger_1.logger.info(`Client disconnected: ${socket.id}`);
    }
    emitToPlayer(playerId, event, data) {
        const socket = this.connectedPlayers.get(playerId);
        if (socket) {
            socket.emit(event, data);
        }
    }
    emitToParty(partyId, event, data) {
        this.io.to(partyId).emit(event, data);
    }
    emitToAll(event, data) {
        this.io.emit(event, data);
    }
    getConnectedPlayersCount() {
        return this.connectedPlayers.size;
    }
    getPartyMembersCount(partyId) {
        return this.partyRooms.get(partyId)?.size || 0;
    }
}
exports.GameSocketManager = GameSocketManager;
//# sourceMappingURL=socketService.js.map