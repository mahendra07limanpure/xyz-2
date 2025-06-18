import React from 'react';
import { useGame } from '../../contexts/GameContext';

const PlayerStats: React.FC = () => {
  const { state } = useGame();
  
  if (!state.player) return null;

  const { player } = state;
  const healthPercentage = (player.health / player.maxHealth) * 100;
  const manaPercentage = (player.mana / player.maxMana) * 100;
  const expToNextLevel = player.level * 100;
  const expPercentage = (player.experience / expToNextLevel) * 100;

  return (
    <div className="glass-morphism p-4 rounded-lg">
      <h3 className="text-xl font-bold text-white mb-4">⚔️ {player.name}</h3>
      
      {/* Level & Experience */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-gray-300">Level {player.level}</span>
          <span className="text-xs text-gray-400">{player.experience}/{expToNextLevel} XP</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${expPercentage}%` }}
          />
        </div>
      </div>

      {/* Health */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-red-300">❤️ Health</span>
          <span className="text-xs text-gray-400">{player.health}/{player.maxHealth}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div 
            className="bg-red-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${healthPercentage}%` }}
          />
        </div>
      </div>

      {/* Mana */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-blue-300">💙 Mana</span>
          <span className="text-xs text-gray-400">{player.mana}/{player.maxMana}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div 
            className="bg-blue-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${manaPercentage}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="text-center p-2 bg-gray-800 rounded">
          <div className="text-xs text-gray-400">STR</div>
          <div className="text-lg font-bold text-red-400">{player.stats.strength}</div>
        </div>
        <div className="text-center p-2 bg-gray-800 rounded">
          <div className="text-xs text-gray-400">DEF</div>
          <div className="text-lg font-bold text-blue-400">{player.stats.defense}</div>
        </div>
        <div className="text-center p-2 bg-gray-800 rounded">
          <div className="text-xs text-gray-400">AGI</div>
          <div className="text-lg font-bold text-green-400">{player.stats.agility}</div>
        </div>
        <div className="text-center p-2 bg-gray-800 rounded">
          <div className="text-xs text-gray-400">INT</div>
          <div className="text-lg font-bold text-purple-400">{player.stats.intelligence}</div>
        </div>
      </div>

      {/* Location */}
      <div className="text-xs text-gray-400 text-center">
        📍 {player.location.dungeon}<br/>
        Floor {player.location.floor}, Room {player.location.room}
      </div>
    </div>
  );
};

export default PlayerStats;
