import React from 'react';
import { useGame } from '../../contexts/GameContext';

const CombatView: React.FC = () => {
  const { state, actions } = useGame();

  if (!state.currentEnemy || !state.player) {
    return null;
  }

  const enemy = state.currentEnemy;
  const player = state.player;
  const enemyHealthPercentage = (enemy.health / enemy.maxHealth) * 100;
  const playerHealthPercentage = (player.health / player.maxHealth) * 100;

  const isEnemyDefeated = enemy.health <= 0;
  const isPlayerDefeated = player.health <= 0;
  const combatEnded = isEnemyDefeated || isPlayerDefeated;

  return (
    <div className="space-y-6">
      {/* Combat Arena */}
      <div className="glass-morphism p-6 rounded-lg">
        <h2 className="text-2xl font-bold text-center text-red-400 mb-6">
          ⚔️ COMBAT ⚔️
        </h2>
        
        {/* Enemy */}
        <div className="mb-8">
          <div className="text-center mb-4">
            <div className="text-6xl mb-2">👹</div>
            <h3 className="text-2xl font-bold text-white">{enemy.name}</h3>
          </div>
          
          <div className="max-w-md mx-auto">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-red-300">Enemy Health</span>
              <span className="text-xs text-gray-400">{enemy.health}/{enemy.maxHealth}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-4">
              <div 
                className="bg-red-500 h-4 rounded-full transition-all duration-300"
                style={{ width: `${enemyHealthPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* VS Divider */}
        <div className="text-center py-4">
          <span className="text-3xl font-bold text-yellow-400">⚡ VS ⚡</span>
        </div>

        {/* Player */}
        <div className="mb-8">
          <div className="text-center mb-4">
            <div className="text-6xl mb-2">🛡️</div>
            <h3 className="text-2xl font-bold text-white">{player.name}</h3>
          </div>
          
          <div className="max-w-md mx-auto">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-green-300">Your Health</span>
              <span className="text-xs text-gray-400">{player.health}/{player.maxHealth}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-4">
              <div 
                className="bg-green-500 h-4 rounded-full transition-all duration-300"
                style={{ width: `${playerHealthPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Combat Actions */}
      {!combatEnded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={actions.attack}
            className="game-button-secondary p-4 text-center hover:bg-red-600 transition-all duration-300"
          >
            <div className="text-2xl mb-2">⚔️</div>
            <div className="font-bold">Attack</div>
            <div className="text-xs text-gray-300">Basic melee attack</div>
          </button>

          <button
            onClick={() => actions.useSkill('fireball')}
            disabled={player.mana < 15}
            className={`game-button-secondary p-4 text-center transition-all duration-300 ${
              player.mana >= 15 
                ? 'hover:bg-orange-600' 
                : 'opacity-50 cursor-not-allowed'
            }`}
          >
            <div className="text-2xl mb-2">🔥</div>
            <div className="font-bold">Fireball</div>
            <div className="text-xs text-gray-300">15 Mana</div>
          </button>

          <button
            onClick={() => actions.useSkill('heal')}
            disabled={player.mana < 10 || player.health === player.maxHealth}
            className={`game-button-secondary p-4 text-center transition-all duration-300 ${
              player.mana >= 10 && player.health < player.maxHealth
                ? 'hover:bg-green-600' 
                : 'opacity-50 cursor-not-allowed'
            }`}
          >
            <div className="text-2xl mb-2">💚</div>
            <div className="font-bold">Heal</div>
            <div className="text-xs text-gray-300">10 Mana</div>
          </button>

          <button
            onClick={actions.flee}
            className="game-button-secondary p-4 text-center hover:bg-yellow-600 transition-all duration-300"
          >
            <div className="text-2xl mb-2">🏃</div>
            <div className="font-bold">Flee</div>
            <div className="text-xs text-gray-300">70% success rate</div>
          </button>
        </div>
      )}

      {/* Combat Log */}
      <div className="glass-morphism p-4 rounded-lg">
        <h3 className="text-lg font-bold text-white mb-3">📜 Combat Log</h3>
        <div className="bg-gray-900 rounded-lg p-3 max-h-40 overflow-y-auto">
          {state.combatLog.map((log, index) => (
            <div key={index} className="text-sm text-gray-300 mb-1">
              <span className="text-yellow-400">›</span> {log}
            </div>
          ))}
        </div>
      </div>

      {/* Combat End Status */}
      {combatEnded && (
        <div className="glass-morphism p-6 rounded-lg text-center">
          {isEnemyDefeated && (
            <>
              <div className="text-4xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-green-400 mb-2">Victory!</h3>
              <p className="text-gray-300">You have defeated the {enemy.name}!</p>
              <p className="text-sm text-yellow-400 mt-2">+50 XP, +10 Gold</p>
            </>
          )}
          {isPlayerDefeated && (
            <>
              <div className="text-4xl mb-4">💀</div>
              <h3 className="text-2xl font-bold text-red-400 mb-2">Defeat!</h3>
              <p className="text-gray-300">You have been defeated...</p>
              <p className="text-sm text-gray-400 mt-2">Respawning in town...</p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CombatView;
