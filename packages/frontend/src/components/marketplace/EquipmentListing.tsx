import React from 'react';
import { Equipment, LendingOffer } from '../../../../shared/src/types';

interface EquipmentListingProps {
  equipment: (Equipment & { lendingOffer: LendingOffer })[];
  loading: boolean;
  onBorrow: (equipmentId: string) => void;
}

const EquipmentListing: React.FC<EquipmentListingProps> = ({ equipment, loading, onBorrow }) => {
  const getRarityColor = (rarity: string) => {
    const colors = {
      common: 'text-gray-400 border-gray-400',
      uncommon: 'text-green-400 border-green-400',
      rare: 'text-blue-400 border-blue-400',
      epic: 'text-purple-400 border-purple-400',
      legendary: 'text-orange-400 border-orange-400',
      mythic: 'text-red-400 border-red-400',
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  };

  const getRarityEmoji = (rarity: string) => {
    const emojis = {
      common: '⚪',
      uncommon: '🟢',
      rare: '🔵',
      epic: '🟣',
      legendary: '🟠',
      mythic: '🔴',
    };
    return emojis[rarity as keyof typeof emojis] || '⚪';
  };

  const getTypeEmoji = (type: string) => {
    const emojis = {
      weapon: '⚔️',
      armor: '🛡️',
      accessory: '💍',
      consumable: '🧪',
    };
    return emojis[type as keyof typeof emojis] || '📦';
  };

  const getChainName = (chainId: number) => {
    const chains = {
      1: 'Ethereum',
      137: 'Polygon',
      42161: 'Arbitrum',
    };
    return chains[chainId as keyof typeof chains] || `Chain ${chainId}`;
  };

  const formatDuration = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''}`;
    }
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="glass-morphism p-6 rounded-lg animate-pulse">
            <div className="flex space-x-4">
              <div className="w-16 h-16 bg-gray-600 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-600 rounded w-1/3"></div>
                <div className="h-3 bg-gray-600 rounded w-1/2"></div>
                <div className="h-3 bg-gray-600 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (equipment.length === 0) {
    return (
      <div className="glass-morphism p-12 rounded-lg text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-bold text-white mb-2">No Equipment Found</h3>
        <p className="text-gray-400">
          Try adjusting your filters to find equipment that matches your criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">
          {equipment.length} item{equipment.length !== 1 ? 's' : ''} available
        </h3>
        <div className="flex space-x-2">
          <button className="px-3 py-1 bg-black/30 text-gray-300 rounded text-sm hover:bg-black/50 transition-colors">
            Sort by Price
          </button>
          <button className="px-3 py-1 bg-black/30 text-gray-300 rounded text-sm hover:bg-black/50 transition-colors">
            Sort by Rarity
          </button>
        </div>
      </div>

      {equipment.map((item) => (
        <div key={item.id} className="game-card hover:scale-[1.02] transition-transform">
          <div className="flex space-x-4">
            {/* Equipment Icon/Image */}
            <div className={`w-16 h-16 rounded-lg flex items-center justify-center text-2xl border-2 ${getRarityColor(item.rarity)}`}>
              {getTypeEmoji(item.equipmentType)}
            </div>

            {/* Equipment Details */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="text-lg font-bold text-white flex items-center space-x-2">
                    <span>{item.name}</span>
                    <span className="text-sm">{getRarityEmoji(item.rarity)}</span>
                  </h4>
                  <p className="text-gray-400 text-sm capitalize">
                    {item.equipmentType} • {item.rarity}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-purple-400">
                    {Number(item.lendingOffer.rentalFee)} ETH
                  </div>
                  <div className="text-xs text-gray-400">
                    {formatDuration(item.lendingOffer.duration)}
                  </div>
                </div>
              </div>

              {item.description && (
                <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                  {item.description}
                </p>
              )}

              {/* Stats */}
              <div className="flex space-x-4 mb-3">
                {item.stats.attackPower > 0 && (
                  <div className="flex items-center space-x-1 text-red-400">
                    <span>⚔️</span>
                    <span className="text-sm">{item.stats.attackPower}</span>
                  </div>
                )}
                {item.stats.defensePower > 0 && (
                  <div className="flex items-center space-x-1 text-blue-400">
                    <span>🛡️</span>
                    <span className="text-sm">{item.stats.defensePower}</span>
                  </div>
                )}
                {item.stats.magicPower > 0 && (
                  <div className="flex items-center space-x-1 text-purple-400">
                    <span>✨</span>
                    <span className="text-sm">{item.stats.magicPower}</span>
                  </div>
                )}
                {item.stats.healthBonus && (
                  <div className="flex items-center space-x-1 text-green-400">
                    <span>❤️</span>
                    <span className="text-sm">+{item.stats.healthBonus}</span>
                  </div>
                )}
                {item.stats.manaBonus && (
                  <div className="flex items-center space-x-1 text-cyan-400">
                    <span>💙</span>
                    <span className="text-sm">+{item.stats.manaBonus}</span>
                  </div>
                )}
              </div>

              {/* Additional Info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-xs text-gray-400">
                  <div className="flex items-center space-x-1">
                    <span>🔗</span>
                    <span>{getChainName(item.chainId)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>🔧</span>
                    <span>{item.durability}/{item.maxDurability}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>💰</span>
                    <span>Collateral: {Number(item.lendingOffer.collateralAmount)} ETH</span>
                  </div>
                </div>

                <button
                  onClick={() => onBorrow(item.id)}
                  disabled={item.lendingOffer.status !== 'available'}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    item.lendingOffer.status === 'available'
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {item.lendingOffer.status === 'available' ? 'Borrow' : 'Unavailable'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EquipmentListing;
