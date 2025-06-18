import React, { useState } from 'react';

const GameInstructions: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-colors z-50"
        title="Game Instructions"
      >
        ❓
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="glass-morphism p-6 rounded-lg max-w-2xl max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">🎮 How to Play</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white hover:text-gray-300 text-2xl"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-4 text-gray-300">
          <section>
            <h3 className="text-lg font-bold text-white mb-2">🚀 Getting Started</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Connect your wallet to save progress on the blockchain</li>
              <li>Click "Start Adventure" to create your character</li>
              <li>Begin exploring the mystical dungeons</li>
            </ul>
          </section>
          
          <section>
            <h3 className="text-lg font-bold text-white mb-2">🏛️ Dungeon Exploration</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Explore Forward:</strong> Move to the next room (chance of encounters)</li>
              <li><strong>Training Combat:</strong> Practice your fighting skills safely</li>
              <li><strong>Rest:</strong> Restore health and mana (coming soon)</li>
              <li><strong>Next Floor:</strong> Descend deeper after clearing 10 rooms</li>
            </ul>
          </section>
          
          <section>
            <h3 className="text-lg font-bold text-white mb-2">⚔️ Combat System</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Attack:</strong> Basic melee attack using Strength</li>
              <li><strong>Fireball:</strong> Magic attack (15 mana, Intelligence-based)</li>
              <li><strong>Heal:</strong> Restore health (10 mana, Intelligence-based)</li>
              <li><strong>Flee:</strong> Escape combat (70% success rate)</li>
            </ul>
          </section>
          
          <section>
            <h3 className="text-lg font-bold text-white mb-2">📊 Character Stats</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Strength:</strong> Increases physical damage</li>
              <li><strong>Defense:</strong> Reduces damage taken</li>
              <li><strong>Agility:</strong> Affects dodge chance and turn order</li>
              <li><strong>Intelligence:</strong> Boosts magic damage and healing</li>
            </ul>
          </section>
          
          <section>
            <h3 className="text-lg font-bold text-white mb-2">🎒 Equipment</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Find equipment by defeating enemies and exploring</li>
              <li>Equipment has different rarities: Common, Uncommon, Rare, Epic, Legendary</li>
              <li>Higher rarity items provide better stat bonuses</li>
              <li>Use the inventory to manage and equip items</li>
            </ul>
          </section>
          
          <div className="mt-6 p-3 bg-purple-800 rounded-lg">
            <p className="text-sm text-center text-white">
              💡 <strong>Tip:</strong> This is an early preview! More features like multiplayer parties, 
              cross-chain mechanics, and AI NPCs are coming soon.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameInstructions;
