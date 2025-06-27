import React, { useState } from 'react';
import { Equipment, LendingOffer } from '../../../../shared/src/types';

interface MyListingsProps {
  listings: (Equipment & { lendingOffer: LendingOffer })[];
  loading: boolean;
  onCancelListing: (listingId: string) => void;
  onUpdateListing: (listingId: string, updates: Partial<LendingOffer>) => void;
}

interface EditModalProps {
  listing: Equipment & { lendingOffer: LendingOffer };
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Partial<LendingOffer>) => void;
}

const EditModal: React.FC<EditModalProps> = ({ listing, isOpen, onClose, onSave }) => {
  const [rentalFee, setRentalFee] = useState(Number(listing.lendingOffer.rentalFee));
  const [collateralAmount, setCollateralAmount] = useState(Number(listing.lendingOffer.collateralAmount));
  const [duration, setDuration] = useState(listing.lendingOffer.duration);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      rentalFee: BigInt(rentalFee),
      collateralAmount: BigInt(collateralAmount),
      duration: duration,
    });
    onClose();
  };

  const formatDurationOption = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''}`;
    }
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  };

  const durationOptions = [
    { value: 3600, label: '1 hour' },
    { value: 21600, label: '6 hours' },
    { value: 43200, label: '12 hours' },
    { value: 86400, label: '1 day' },
    { value: 172800, label: '2 days' },
    { value: 259200, label: '3 days' },
    { value: 604800, label: '1 week' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold text-white mb-4">Edit Listing</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Rental Fee (ETH)
            </label>
            <input
              type="number"
              value={rentalFee}
              onChange={(e) => setRentalFee(Number(e.target.value))}
              min="0"
              step="0.001"
              className="w-full px-3 py-2 bg-black/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Collateral Amount (ETH)
            </label>
            <input
              type="number"
              value={collateralAmount}
              onChange={(e) => setCollateralAmount(Number(e.target.value))}
              min="0"
              step="0.001"
              className="w-full px-3 py-2 bg-black/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Duration
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full px-3 py-2 bg-black/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              {durationOptions.map((option) => (
                <option key={option.value} value={option.value} className="bg-gray-800">
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

const MyListings: React.FC<MyListingsProps> = ({ listings, loading, onCancelListing, onUpdateListing }) => {
  const [editingListing, setEditingListing] = useState<(Equipment & { lendingOffer: LendingOffer }) | null>(null);

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

  const getTypeEmoji = (type: string) => {
    const emojis = {
      weapon: '⚔️',
      armor: '🛡️',
      accessory: '💍',
      consumable: '🧪',
    };
    return emojis[type as keyof typeof emojis] || '📦';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      available: 'text-green-400 bg-green-400/20',
      active: 'text-blue-400 bg-blue-400/20',
      completed: 'text-gray-400 bg-gray-400/20',
      cancelled: 'text-red-400 bg-red-400/20',
    };
    return colors[status as keyof typeof colors] || colors.available;
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
        {[...Array(3)].map((_, i) => (
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

  if (listings.length === 0) {
    return (
      <div className="glass-morphism p-12 rounded-lg text-center">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-xl font-bold text-white mb-2">No Active Listings</h3>
        <p className="text-gray-400 mb-6">
          You haven't listed any equipment for lending yet.
        </p>
        <button className="game-button">
          Create Listing
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">
            Your Listings ({listings.length})
          </h3>
          <button className="game-button">
            + Create New Listing
          </button>
        </div>

        {listings.map((listing) => (
          <div key={listing.id} className="game-card">
            <div className="flex space-x-4">
              {/* Equipment Icon */}
              <div className={`w-16 h-16 rounded-lg flex items-center justify-center text-2xl border-2 ${getRarityColor(listing.rarity)}`}>
                {getTypeEmoji(listing.equipmentType)}
              </div>

              {/* Listing Details */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-lg font-bold text-white">{listing.name}</h4>
                    <p className="text-gray-400 text-sm capitalize">
                      {listing.equipmentType} • {listing.rarity}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(listing.lendingOffer.status)}`}>
                      {listing.lendingOffer.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Listing Terms */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-xs text-gray-400">Rental Fee</div>
                    <div className="text-purple-400 font-bold">{Number(listing.lendingOffer.rentalFee)} ETH</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Collateral</div>
                    <div className="text-blue-400 font-bold">{Number(listing.lendingOffer.collateralAmount)} ETH</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Duration</div>
                    <div className="text-green-400 font-bold">{formatDuration(listing.lendingOffer.duration)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Created</div>
                    <div className="text-gray-300 text-sm">
                      {listing.lendingOffer.createdAt.toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Equipment Stats */}
                <div className="flex space-x-4 mb-4">
                  {listing.stats.attackPower > 0 && (
                    <div className="flex items-center space-x-1 text-red-400 text-sm">
                      <span>⚔️</span>
                      <span>{listing.stats.attackPower}</span>
                    </div>
                  )}
                  {listing.stats.defensePower > 0 && (
                    <div className="flex items-center space-x-1 text-blue-400 text-sm">
                      <span>🛡️</span>
                      <span>{listing.stats.defensePower}</span>
                    </div>
                  )}
                  {listing.stats.magicPower > 0 && (
                    <div className="flex items-center space-x-1 text-purple-400 text-sm">
                      <span>✨</span>
                      <span>{listing.stats.magicPower}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => setEditingListing(listing)}
                    disabled={listing.lendingOffer.status !== 'available'}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      listing.lendingOffer.status === 'available'
                        ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-600/50'
                        : 'bg-gray-600/20 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onCancelListing(listing.lendingOffer.id)}
                    disabled={listing.lendingOffer.status !== 'available'}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      listing.lendingOffer.status === 'available'
                        ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-600/50'
                        : 'bg-gray-600/20 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Cancel
                  </button>
                  <button className="px-4 py-2 bg-gray-600/20 text-gray-400 hover:bg-gray-600/30 rounded-lg text-sm font-medium transition-colors border border-gray-600/50">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editingListing && (
        <EditModal
          listing={editingListing}
          isOpen={true}
          onClose={() => setEditingListing(null)}
          onSave={(updates) => {
            onUpdateListing(editingListing.lendingOffer.id, updates);
            setEditingListing(null);
          }}
        />
      )}
    </>
  );
};

export default MyListings;
