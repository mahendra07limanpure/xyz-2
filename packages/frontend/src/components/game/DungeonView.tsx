import React from 'react';
import { useGame } from '../../contexts/GameContext';

const DungeonView: React.FC = () => {
  const { state, actions } = useGame();

  const roomDescriptions = [
    "A dimly lit chamber with ancient stone walls covered in mysterious runes.",
    "A grand hall with towering pillars and echoing footsteps.",
    "A narrow corridor filled with the sound of dripping water.",
    "A circular room with a mystical altar in the center.",
    "A treasure chamber with glittering gems embedded in the walls.",
    "A dark passage with the smell of decay in the air.",
    "A ceremonial room with ancient artifacts scattered about.",
    "A vast cavern with stalactites hanging from the ceiling.",
  ];

  const getCurrentRoomDescription = () => {
    const index = (state.dungeonData.currentRoom - 1) % roomDescriptions.length;
    return roomDescriptions[index];
  };

  const canExplore = state.dungeonData.currentRoom < 10; // Max 10 rooms per floor
  const canAdvanceFloor = state.dungeonData.currentRoom >= 10;

  return (
    <div className="space-y-6">
      {/* Room Description */}
      <div className="glass-morphism p-6 rounded-lg">
        <h2 className="text-2xl font-bold text-white mb-4">
          🏛️ Room {state.dungeonData.currentRoom}
        </h2>
        <p className="text-gray-300 text-lg leading-relaxed">
          {getCurrentRoomDescription()}
        </p>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          onClick={actions.exploreRoom}
          disabled={!canExplore}
          className={`game-card p-6 text-center transition-all duration-300 ${
            canExplore 
              ? 'hover:bg-green-800 cursor-pointer' 
              : 'opacity-50 cursor-not-allowed'
          }`}
        >
          <div className="text-4xl mb-2">🚪</div>
          <h3 className="text-xl font-bold text-white mb-2">Explore Forward</h3>
          <p className="text-gray-300 text-sm">
            {canExplore 
              ? "Venture deeper into the dungeon" 
              : "No more rooms to explore"}
          </p>
        </button>

        <button
          onClick={() => actions.enterCombat({
            id: 'training',
            name: 'Training Dummy',
            health: 20,
            maxHealth: 20,
            stats: { attack: 5, defense: 2, agility: 1 },
            lootTable: ['practice_sword']
          })}
          className="game-card p-6 text-center hover:bg-red-800 transition-all duration-300"
        >
          <div className="text-4xl mb-2">⚔️</div>
          <h3 className="text-xl font-bold text-white mb-2">Training Combat</h3>
          <p className="text-gray-300 text-sm">
            Practice your combat skills
          </p>
        </button>

        <button
          onClick={() => window.alert('Inventory system coming soon!')}
          className="game-card p-6 text-center hover:bg-blue-800 transition-all duration-300"
        >
          <div className="text-4xl mb-2">🎒</div>
          <h3 className="text-xl font-bold text-white mb-2">Inventory</h3>
          <p className="text-gray-300 text-sm">
            Manage your equipment
          </p>
        </button>

        <button
          onClick={() => window.alert('Rest area coming soon!')}
          className="game-card p-6 text-center hover:bg-purple-800 transition-all duration-300"
        >
          <div className="text-4xl mb-2">🛏️</div>
          <h3 className="text-xl font-bold text-white mb-2">Rest</h3>
          <p className="text-gray-300 text-sm">
            Restore health and mana
          </p>
        </button>

        <button
          onClick={() => window.alert('Shop coming soon!')}
          className="game-card p-6 text-center hover:bg-yellow-800 transition-all duration-300"
        >
          <div className="text-4xl mb-2">🛒</div>
          <h3 className="text-xl font-bold text-white mb-2">Merchant</h3>
          <p className="text-gray-300 text-sm">
            Buy and sell equipment
          </p>
        </button>

        {canAdvanceFloor && (
          <button
            onClick={actions.nextFloor}
            className="game-card p-6 text-center hover:bg-purple-800 transition-all duration-300 border-2 border-purple-500"
          >
            <div className="text-4xl mb-2">⬇️</div>
            <h3 className="text-xl font-bold text-white mb-2">Next Floor</h3>
            <p className="text-gray-300 text-sm">
              Descend to Floor {state.dungeonData.currentFloor + 1}
            </p>
          </button>
        )}
      </div>

      {/* Progress */}
      <div className="glass-morphism p-4 rounded-lg">
        <h3 className="text-lg font-bold text-white mb-2">🗺️ Floor Progress</h3>
        <div className="flex space-x-2">
          {Array.from({ length: 10 }, (_, i) => (
            <div
              key={i}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                i < state.dungeonData.currentRoom - 1
                  ? 'bg-green-500 text-white'
                  : i === state.dungeonData.currentRoom - 1
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-600 text-gray-400'
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-400 mt-2">
          Rooms explored: {state.dungeonData.currentRoom - 1}/10
        </p>
      </div>
    </div>
  );
};

export default DungeonView;
