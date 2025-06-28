import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { useGame } from '../contexts/GameContext';
import DungeonView from '../components/game/DungeonView';
import CombatView from '../components/game/CombatView';
import InventoryView from '../components/game/InventoryView';
import GameMenu from '../components/game/GameMenu';
import PlayerStats from '../components/game/PlayerStats';
import PhaserGame from '../game/PhaserGame';
import MultiplayerGame from '../game/MultiplayerGame';
import { socketService } from '../services/socketService';
import type { PartyMember } from '../../../shared/src/types';

const GamePage: React.FC = () => {
  const { state } = useGame();
  const { address } = useAccount();
  const location = useLocation();
  const [gameMode, setGameMode] = useState<'classic' | 'interactive'>('classic');
  
  // Party mode state from navigation
  const partyMode = location.state?.partyMode || false;
  const partyId = location.state?.partyId || null;
  const partyMembers = location.state?.partyMembers || [];
  const autoStartInteractive = location.state?.autoStartInteractive || false;
  
  const [connectedPartyMembers, setConnectedPartyMembers] = useState<Set<string>>(new Set());
  const [chatMessages, setChatMessages] = useState<Array<{
    playerId: string;
    message: string;
    timestamp: Date;
  }>>([]);

  useEffect(() => {
    // Auto-start interactive mode for party gameplay
    if (autoStartInteractive && partyMode) {
      setGameMode('interactive');
      // Start the game automatically
      if (!state.gameStarted) {
        // Trigger game start here if needed
      }
    }
    
    if (partyMode && partyId && address) {
      // Connect to socket and join party room
      socketService.connect()
        .then(() => {
          // Join the game first
          socketService.joinGame(address, address);
          
          // Then join the party room
          socketService.joinParty(partyId, address);
          
          // Set up party event listeners
          socketService.on('party:member_joined', (data) => {
            setConnectedPartyMembers(prev => new Set([...prev, data.playerId]));
          });
          
          socketService.on('party:member_left', (data) => {
            setConnectedPartyMembers(prev => {
              const newSet = new Set(prev);
              newSet.delete(data.playerId);
              return newSet;
            });
          });
          
          socketService.on('party:member_disconnected', (data) => {
            setConnectedPartyMembers(prev => {
              const newSet = new Set(prev);
              newSet.delete(data.playerId);
              return newSet;
            });
          });
          
          socketService.on('chat:message', (data) => {
            setChatMessages(prev => [...prev, data]);
          });
          
          socketService.on('dungeon:action', (data) => {
            // Handle real-time dungeon actions from other party members
            console.log('Party member action:', data);
          });
        })
        .catch(console.error);
    }
    
    return () => {
      if (partyMode && partyId && address) {
        socketService.leaveParty(partyId, address);
      }
    };
  }, [partyMode, partyId, address]);

  const sendChatMessage = (message: string) => {
    if (partyMode && partyId) {
      socketService.sendChatMessage(message, partyId);
    }
  };

  const renderPartyInfo = () => {
    if (!partyMode) return null;
    
    return (
      <div className="glass-morphism p-4 rounded-lg mb-4">
        <h3 className="text-lg font-bold text-white mb-2">🚀 Party Mode</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h4 className="text-sm font-semibold text-purple-300 mb-1">Party Members ({partyMembers.length})</h4>
            <div className="space-y-1">
              {partyMembers.map((member: PartyMember) => (
                <div key={member.playerId} className="flex items-center gap-2 text-xs">
                  <div className={`w-2 h-2 rounded-full ${
                    connectedPartyMembers.has(member.walletAddress) ? 'bg-green-500' : 'bg-gray-500'
                  }`}></div>
                  <span className="text-gray-300">
                    {member.walletAddress.slice(0, 6)}...{member.walletAddress.slice(-4)}
                  </span>
                  {member.role === 'leader' && <span className="text-yellow-400">👑</span>}
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-purple-300 mb-1">Cross-Chain Support</h4>
            <div className="text-xs text-gray-400">
              {Array.from(new Set(partyMembers.map(m => m.chainId))).map(chainId => (
                <div key={String(chainId)}>Chain {String(chainId)}</div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-purple-300 mb-1">Party Chat</h4>
            <div className="text-xs text-gray-400">
              {chatMessages.slice(-3).map((msg, i) => (
                <div key={i}>
                  {msg.playerId.slice(0, 6)}: {msg.message}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderGameContent = () => {
    if (!state.gameStarted) {
      return <GameMenu />;
    }

    if (gameMode === 'interactive') {
      return (
        <div className="relative w-full h-full">
          <PhaserGame width={800} height={600} />
        </div>
      );
    }

    // Classic mode
    switch (state.gameMode) {
      case 'dungeon':
        return <DungeonView />;
      case 'combat':
        return <CombatView />;
      case 'inventory':
        return <InventoryView />;
      default:
        return <DungeonView />;
    }
  };

  return (
    <div className="min-h-screen text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Party Information */}
        {renderPartyInfo()}
        
        {/* Game Mode Toggle */}
        <div className="flex justify-center mb-6">
          <div className="glass-morphism p-2 rounded-lg">
            <button
              onClick={() => setGameMode('classic')}
              className={`px-4 py-2 rounded-lg mr-2 transition-colors ${
                gameMode === 'classic' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              📝 Classic Mode
            </button>
            <button
              onClick={() => setGameMode('interactive')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                gameMode === 'interactive' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              🎮 Interactive Mode
            </button>
          </div>
        </div>

        {state.gameStarted && gameMode === 'classic' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
            <div className="lg:col-span-1">
              <PlayerStats />
            </div>
            <div className="lg:col-span-3">
              <div className="glass-morphism p-4 rounded-lg">
                <div className="flex space-x-4 mb-4">
                  <span className="text-purple-300">Floor: {state.dungeonData.currentFloor}</span>
                  <span className="text-blue-300">Room: {state.dungeonData.currentRoom}</span>
                  <span className="text-green-300">Mode: {state.gameMode}</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="game-content">
          {renderGameContent()}
        </div>

        {/* Mode Descriptions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-morphism p-4 rounded-lg">
            <h3 className="text-lg font-bold text-white mb-2">📝 Classic Mode</h3>
            <p className="text-sm text-gray-300">
              Traditional turn-based RPG with menu-driven combat and text descriptions. 
              Perfect for strategic gameplay and deeper story immersion.
              {partyMode && <span className="text-purple-300 block mt-2">🚀 Party support coming soon!</span>}
            </p>
          </div>
          <div className="glass-morphism p-4 rounded-lg">
            <h3 className="text-lg font-bold text-white mb-2">🎮 Interactive Mode</h3>
            <p className="text-sm text-gray-300">
              Real-time 2D dungeon crawler with direct character control. 
              Move with WASD, explore visually, and engage in dynamic combat.
              {partyMode && <span className="text-green-300 block mt-2">👥 Full multiplayer support - play together in real-time!</span>}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePage;
