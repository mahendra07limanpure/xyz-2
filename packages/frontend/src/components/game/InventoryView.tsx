import React from 'react';
import { useGame } from '../../contexts/GameContext';

const InventoryView: React.FC = () => {
  const { state, actions } = useGame();

  // Mock inventory items for demonstration
  const mockInventory = [
    {
      id: '1',
      name: 'Iron Sword',
      type: 'weapon' as const,
      rarity: 'common' as const,
      stats: { attack: 15 },
      equipped: false,
      description: 'A sturdy iron sword forged by skilled blacksmiths.'
    },
    {
      id: '2',
      name: 'Leather Armor',
      type: 'armor' as const,
      rarity: 'common' as const,
      stats: { defense: 8 },
      equipped: true,
      description: 'Basic leather armor providing modest protection.'
    },
    {
      id: '3',
      name: 'Magic Ring',
      type: 'accessory' as const,
      rarity: 'rare' as const,
      stats: { intelligence: 5 },
      equipped: false,
      description: 'A mysterious ring that enhances magical abilities.'
    },
    {
      id: '4',
      name: 'Steel Shield',
      type: 'armor' as const,
      rarity: 'uncommon' as const,
      stats: { defense: 12 },
      equipped: false,
      description: 'A reinforced steel shield that can block heavy attacks.'
    },
    {
      id: '5',
      name: 'Dragon Blade',
      type: 'weapon' as const,
      rarity: 'epic' as const,
      stats: { attack: 45 },
      equipped: false,
      description: 'A legendary blade forged from dragon scales.'
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400 border-gray-400';
      case 'uncommon': return 'text-green-400 border-green-400';
      case 'rare': return 'text-blue-400 border-blue-400';
      case 'epic': return 'text-purple-400 border-purple-400';
      case 'legendary': return 'text-yellow-400 border-yellow-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'weapon': return '⚔️';
      case 'armor': return '🛡️';
      case 'accessory': return '💍';
      default: return '📦';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">🎒 Inventory</h2>
        <button
          onClick={() => window.history.back()}
          className="game-button-secondary px-4 py-2"
        >
          ← Back to Dungeon
        </button>
      </div>

      {/* Equipment Slots */}
      <div className="glass-morphism p-6 rounded-lg">
        <h3 className="text-xl font-bold text-white mb-4">👤 Currently Equipped</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {mockInventory.filter(item => item.equipped).map((item) => (
            <div key={item.id} className={`p-4 rounded-lg border-2 ${getRarityColor(item.rarity)} bg-gray-800`}>
              <div className="text-center">
                <div className="text-3xl mb-2">{getTypeIcon(item.type)}</div>
                <div className="font-bold text-white text-sm">{item.name}</div>
                <div className={`text-xs ${getRarityColor(item.rarity).split(' ')[0]} capitalize`}>
                  {item.rarity}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {Object.entries(item.stats).map(([stat, value]) => (
                    <div key={stat}>{stat}: +{value}</div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Inventory Items */}
      <div className="glass-morphism p-6 rounded-lg">
        <h3 className="text-xl font-bold text-white mb-4">📦 Inventory Items</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockInventory.filter(item => !item.equipped).map((item) => (
            <div key={item.id} className={`p-4 rounded-lg border-2 ${getRarityColor(item.rarity)} bg-gray-800 hover:bg-gray-700 transition-colors`}>
              <div className="flex items-start space-x-3">
                <div className="text-2xl">{getTypeIcon(item.type)}</div>
                <div className="flex-1">
                  <div className="font-bold text-white">{item.name}</div>
                  <div className={`text-xs ${getRarityColor(item.rarity).split(' ')[0]} capitalize mb-1`}>
                    {item.rarity} {item.type}
                  </div>
                  <div className="text-xs text-gray-300 mb-2">
                    {item.description}
                  </div>
                  <div className="text-xs text-gray-400 mb-3">
                    {Object.entries(item.stats).map(([stat, value]) => (
                      <div key={stat} className="inline-block mr-2">
                        {stat}: +{value}
                      </div>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => actions.equipItem(item.id)}
                      className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded transition-colors"
                    >
                      Equip
                    </button>
                    <button
                      onClick={() => window.alert('Sell feature coming soon!')}
                      className="text-xs bg-yellow-600 hover:bg-yellow-700 text-white px-2 py-1 rounded transition-colors"
                    >
                      Sell
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {mockInventory.filter(item => !item.equipped).length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📦</div>
            <p className="text-gray-400">Your inventory is empty!</p>
            <p className="text-sm text-gray-500 mt-2">Defeat enemies and explore to find loot.</p>
          </div>
        )}
      </div>

      {/* Inventory Stats */}
      <div className="glass-morphism p-4 rounded-lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-white">{mockInventory.length}</div>
            <div className="text-sm text-gray-400">Total Items</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">{mockInventory.filter(i => i.equipped).length}</div>
            <div className="text-sm text-gray-400">Equipped</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-400">
              {mockInventory.filter(i => ['rare', 'epic', 'legendary'].includes(i.rarity)).length}
            </div>
            <div className="text-sm text-gray-400">Rare+</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-400">1,250</div>
            <div className="text-sm text-gray-400">Total Value</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryView;
