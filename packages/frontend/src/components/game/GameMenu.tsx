import React from 'react';
import { useGame } from '../../contexts/GameContext';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const GameMenu: React.FC = () => {
  const { actions } = useGame();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="glass-morphism p-8 rounded-lg max-w-md w-full text-center">
        <img 
          src="/DungeonX.png" 
          alt="DungeonX" 
          className="mx-auto h-16 w-auto object-contain mb-6"
        />
        <p className="text-gray-300 mb-8">
          Embark on an epic adventure through mystical dungeons filled with treasures and dangers.
        </p>
        
        <div className="space-y-4">
          <ConnectButton />
          
          <button
            onClick={actions.startGame}
            className="w-full game-button text-lg py-3"
          >
            ⚔️ Start Adventure
          </button>
          
          <button
            className="w-full game-button-secondary text-lg py-3"
            disabled
          >
            📊 Leaderboard (Soon)
          </button>
          
          <button
            className="w-full game-button-secondary text-lg py-3"
            disabled
          >
            🛠️ Settings (Soon)
          </button>
        </div>
        
        <div className="mt-8 text-sm text-gray-400">
          <p>💡 Connect your wallet to save progress on-chain</p>
        </div>
      </div>
    </div>
  );
};

export default GameMenu;
