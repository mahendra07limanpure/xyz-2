import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import EquipmentListing from '../components/marketplace/EquipmentListing';
import SearchFilters from '../components/marketplace/SearchFilters';
import MyListings from '../components/marketplace/MyListings';
import BorrowedEquipment from '../components/marketplace/BorrowedEquipment';
import { Equipment, LendingOffer, EquipmentType, Rarity } from '../../../shared/src/types';

interface FilterState {
  search: string;
  equipmentType: EquipmentType | 'all';
  rarity: Rarity | 'all';
  maxPrice: number;
  onlyAvailable: boolean;
}

const MarketplacePage: React.FC = () => {
  const { address } = useAccount();
  const [activeTab, setActiveTab] = useState<'browse' | 'mylisting' | 'borrowed'>('browse');
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    equipmentType: 'all',
    rarity: 'all',
    maxPrice: 1000,
    onlyAvailable: true,
  });

  // Mock data - replace with actual API calls
  const [equipmentListings, setEquipmentListings] = useState<(Equipment & { lendingOffer: LendingOffer })[]>([]);
  const [myListings, setMyListings] = useState<(Equipment & { lendingOffer: LendingOffer })[]>([]);
  const [borrowedEquipment, setBorrowedEquipment] = useState<(Equipment & { lendingOffer: LendingOffer })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchMarketplaceData = async () => {
      setLoading(true);
      // Mock data
      const mockEquipment = [
        {
          id: '1',
          tokenId: 1001,
          name: 'Dragon Slayer Sword',
          description: 'A legendary blade forged from dragon scales',
          equipmentType: 'weapon' as EquipmentType,
          rarity: 'legendary' as Rarity,
          stats: { attackPower: 45, defensePower: 5, magicPower: 10 },
          durability: 95,
          maxDurability: 100,
          isLendable: true,
          ownerId: '0x1234',
          originalOwnerId: '0x1234',
          chainId: 1,
          contractAddress: '0xabc123',
          createdAt: new Date(),
          lendingOffer: {
            id: 'offer1',
            equipmentId: '1',
            lenderId: '0x1234',
            collateralAmount: BigInt(100),
            rentalFee: BigInt(10),
            duration: 86400,
            status: 'available' as any,
            chainId: 1,
            contractAddress: '0xdef456',
            createdAt: new Date(),
          }
        },
        {
          id: '2',
          tokenId: 1002,
          name: 'Mystic Armor of Protection',
          description: 'Enchanted armor that glows with protective magic',
          equipmentType: 'armor' as EquipmentType,
          rarity: 'epic' as Rarity,
          stats: { attackPower: 0, defensePower: 35, magicPower: 15, healthBonus: 50 },
          durability: 88,
          maxDurability: 100,
          isLendable: true,
          ownerId: '0x5678',
          originalOwnerId: '0x5678',
          chainId: 137,
          contractAddress: '0xabc123',
          createdAt: new Date(),
          lendingOffer: {
            id: 'offer2',
            equipmentId: '2',
            lenderId: '0x5678',
            collateralAmount: BigInt(75),
            rentalFee: BigInt(8),
            duration: 172800,
            status: 'available' as any,
            chainId: 137,
            contractAddress: '0xdef456',
            createdAt: new Date(),
          }
        },
        {
          id: '3',
          tokenId: 1003,
          name: 'Ring of Eternal Wisdom',
          description: 'Increases magical power and mana regeneration',
          equipmentType: 'accessory' as EquipmentType,
          rarity: 'rare' as Rarity,
          stats: { attackPower: 0, defensePower: 0, magicPower: 25, manaBonus: 100 },
          durability: 100,
          maxDurability: 100,
          isLendable: true,
          ownerId: '0x9abc',
          originalOwnerId: '0x9abc',
          chainId: 42161,
          contractAddress: '0xabc123',
          createdAt: new Date(),
          lendingOffer: {
            id: 'offer3',
            equipmentId: '3',
            lenderId: '0x9abc',
            collateralAmount: BigInt(50),
            rentalFee: BigInt(5),
            duration: 259200,
            status: 'available' as any,
            chainId: 42161,
            contractAddress: '0xdef456',
            createdAt: new Date(),
          }
        }
      ];

      setEquipmentListings(mockEquipment);
      
      // Mock user's listings and borrowed equipment
      if (address) {
        setMyListings(mockEquipment.filter(item => item.ownerId.toLowerCase() === address.toLowerCase()));
        setBorrowedEquipment([]);
      }
      
      setLoading(false);
    };

    fetchMarketplaceData();
  }, [address]);

  const filteredEquipment = equipmentListings.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                         item.description?.toLowerCase().includes(filters.search.toLowerCase());
    const matchesType = filters.equipmentType === 'all' || item.equipmentType === filters.equipmentType;
    const matchesRarity = filters.rarity === 'all' || item.rarity === filters.rarity;
    const matchesPrice = Number(item.lendingOffer.rentalFee) <= filters.maxPrice;
    const matchesAvailability = !filters.onlyAvailable || item.lendingOffer.status === 'available';
    
    return matchesSearch && matchesType && matchesRarity && matchesPrice && matchesAvailability;
  });

  const tabs = [
    { key: 'browse', label: '🛒 Browse Equipment', count: filteredEquipment.length },
    { key: 'mylisting', label: '📝 My Listings', count: myListings.length },
    { key: 'borrowed', label: '🤝 Borrowed', count: borrowedEquipment.length },
  ];

  return (
    <div className="text-white min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 text-glow">🏪 Equipment Marketplace</h1>
        <p className="text-gray-300 text-lg">
          Lend and borrow powerful equipment across chains. Earn fees or access gear you need for your adventures.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="flex space-x-1 bg-black/30 p-1 rounded-lg backdrop-blur-sm">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 py-3 px-4 rounded-md transition-all duration-200 font-medium ${
                activeTab === tab.key
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 px-2 py-1 bg-purple-500/30 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'browse' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Search and Filters */}
          <div className="lg:col-span-1">
            <SearchFilters filters={filters} onFiltersChange={setFilters} />
          </div>
          
          {/* Equipment Listings */}
          <div className="lg:col-span-3">
            <EquipmentListing 
              equipment={filteredEquipment} 
              loading={loading}
              onBorrow={(equipmentId) => {
                console.log('Borrowing equipment:', equipmentId);
                // Implement borrow logic
              }}
            />
          </div>
        </div>
      )}

      {activeTab === 'mylisting' && (
        <MyListings 
          listings={myListings}
          loading={loading}
          onCancelListing={(listingId) => {
            console.log('Canceling listing:', listingId);
            // Implement cancel listing logic
          }}
          onUpdateListing={(listingId, updates) => {
            console.log('Updating listing:', listingId, updates);
            // Implement update listing logic
          }}
        />
      )}

      {activeTab === 'borrowed' && (
        <BorrowedEquipment 
          borrowedItems={borrowedEquipment}
          loading={loading}
          onReturn={(equipmentId) => {
            console.log('Returning equipment:', equipmentId);
            // Implement return logic
          }}
        />
      )}
    </div>
  );
};

export default MarketplacePage;
