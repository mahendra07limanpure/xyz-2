import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import DungeonView from '../components/game/DungeonView';
import CombatView from '../components/game/CombatView';
import InventoryView from '../components/game/InventoryView';
import GameMenu from '../components/game/GameMenu';
import PlayerStats from '../components/game/PlayerStats';
import PhaserGame from '../game/PhaserGame';

const GamePage: React.FC = () => {
  const { state } = useGame();
  const [gameMode, setGameMode] = useState<'classic' | 'interactive'>('classic');

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
            </p>
          </div>
          <div className="glass-morphism p-4 rounded-lg">
            <h3 className="text-lg font-bold text-white mb-2">🎮 Interactive Mode</h3>
            <p className="text-sm text-gray-300">
              Real-time 2D dungeon crawler with direct character control. 
              Move with WASD, explore visually, and engage in dynamic combat.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePage;
