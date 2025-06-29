import React, { useState, useEffect } from 'react';
import { PencilIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import {
  apiClient,
  GAME_PLAYER_GET_ROUTE,
  GAME_PLAYER_UPDATE_ROUTE,
  PARTY_PLAYER_GET_ROUTE,
  LOOT_PLAYER_GET_ROUTE
} from '../utils/routes';
import { useAccount } from "wagmi";
import { APIResponse } from '../../../shared/src/types';

interface PlayerData {
  id: string;
  wallet: string;
  username?: string;
  level: number;
  experience: number;
  equipment: Equipment[];
  gameStats?: GameStats;
  createdAt: string;
  updatedAt: string;
}

interface Equipment {
  id: string;
  tokenId: number;
  name: string;
  rarity: string;
  attackPower: number;
  defensePower: number;
  magicPower: number;
}

interface GameStats {
  dungeonsCleared: number;
  totalLoot: number;
  totalExperience: number;
  highestLevel: number;
  gamesPlayed: number;
}

interface PartyMember {
  player: {
    id: string;
    wallet: string;
    username?: string;
  };
  role: string;
  joinedAt: string;
}

interface PartyData {
  id: string;
  name?: string;
  chainId: number;
  isLeader?: boolean;
  members: PartyMember[];
}


const ProfilePage: React.FC = () => {
  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [party, setParty] = useState<PartyData | null>(null);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [editingUsername, setEditingUsername] = useState(false);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { address: WALLET_ADDRESS } = useAccount();

  // Fetch all profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!WALLET_ADDRESS) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const playerRes = await apiClient.get<APIResponse<PlayerData>>(
          GAME_PLAYER_GET_ROUTE.replace('{wallet}', WALLET_ADDRESS)
        );
        console.log('Player data:', playerRes.data);
        
        if (playerRes.data.success && playerRes.data.data) {
          const playerData = playerRes.data.data;
          setPlayer(playerData);
          console.log('Playerrrrrrr', playerData);
          setUsername(String(playerData.username || ''));
          setEquipment(Array.isArray(playerData.equipment) ? playerData.equipment : []);
          console.log('Equipment data:', playerData.equipment);
        } else {
          // Create a default player profile if none exists
          setPlayer({
            id: 'temp-id',
            wallet: WALLET_ADDRESS,
            username: '',
            level: 1,
            experience: 0,
            equipment: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
          setUsername('');
          setEquipment([]);
        }

        try {
          const partyRes = await apiClient.get<APIResponse<PartyData>>(
            PARTY_PLAYER_GET_ROUTE.replace('{address}', WALLET_ADDRESS)
          );
          
          if (partyRes.data.success && partyRes.data.data) {
            const partyData = partyRes.data.data;
            // Ensure members array exists and is valid
            if (partyData && Array.isArray(partyData.members)) {
              setParty(partyData);
              console.log('Party data:', partyData);
            }
          }
        } catch (partyErr) {
          console.log('No party data found or error loading party:', partyErr);
          // This is expected if user is not in a party
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        // Create a fallback profile if API is not available
        setPlayer({
          id: 'temp-id',
          wallet: WALLET_ADDRESS,
          username: '',
          level: 1,
          experience: 0,
          equipment: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        setUsername('');
        setEquipment([]);
        console.log('Using fallback profile due to API error');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [WALLET_ADDRESS]);

  const updateUsername = async () => {
    if (!player || !player.id) return;
    try {
      await apiClient.patch<APIResponse<PlayerData>>(
        GAME_PLAYER_UPDATE_ROUTE.replace('{playerId}', player.id), 
        { username }
      );
      setEditingUsername(false);
    } catch (err) {
      console.error('Failed to update username:', err);
    }
  };

  const rarityBadge = (rarity: string) => {
    const colors: Record<string, string> = {
      Legendary: 'bg-yellow-300 text-yellow-800',
      Epic: 'bg-purple-300 text-purple-800',
      Rare: 'bg-blue-300 text-blue-800',
      Common: 'bg-gray-200 text-gray-800',
    };
    return colors[rarity] || colors.Common;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-300 font-game">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Error Loading Profile</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!WALLET_ADDRESS) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-yellow-500 text-6xl mb-4">🔗</div>
          <h2 className="text-2xl font-bold text-white mb-2">Wallet Not Connected</h2>
          <p className="text-gray-300">Please connect your wallet to view your profile.</p>
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-blue-500 text-6xl mb-4">👤</div>
          <h2 className="text-2xl font-bold text-white mb-2">No Profile Found</h2>
          <p className="text-gray-300">Start playing to create your profile!</p>
        </div>
      </div>
    );
  }

  // Helper function to safely convert values to numbers
  const safeNumber = (value: any): number => {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'object') return 0;
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };

  // Helper function to safely convert any value to string for React rendering
  const safeString = (value: any): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') {
      // If it's an object, return empty string or a safe representation
      return '';
    }
    return String(value);
  };

  // Convert stats to an array instead of object to avoid React child issues
  const statsArray = [
    { label: 'Dungeons', value: safeNumber(player?.gameStats?.dungeonsCleared) },
    { label: 'Loot Collected', value: safeNumber(player?.gameStats?.totalLoot) },
    { label: 'XP Total', value: safeNumber(player?.gameStats?.totalExperience ?? player?.experience) },
    { label: 'Highest Level', value: safeNumber(player?.gameStats?.highestLevel ?? player?.level) },
    { label: 'Games Played', value: safeNumber(player?.gameStats?.gamesPlayed) },
  ];

  // Debug logging
  console.log('Player object:', player);
  console.log('Player gameStats:', player?.gameStats);
  console.log('Party object:', party);
  console.log('Stats array:', statsArray);
  
  // Check for any objects in party data that might cause issues
  if (party) {
    console.log('Party members:', party.members);
    party.members?.forEach((member, index) => {
      console.log(`Member ${index}:`, member);
      console.log(`Member ${index} player:`, member?.player);
    });
  }
  
  // Extra safety check - ensure all stats values are actually numbers
  statsArray.forEach(({ label, value }) => {
    if (typeof value !== 'number') {
      console.error(`Stats value "${label}" is not a number:`, value, typeof value);
    }
  });

  return (
    <div className="min-h-screen glass-morphism flex items-center">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* HERO SECTION */}
        <div className="relative bg-white/60 backdrop-blur-xl rounded-xl shadow-lg overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-green-200 to-blue-200 mix-blend-overlay opacity-70" />
          <div className="relative flex flex-col md:flex-row items-center p-8">
            <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-4xl font-extrabold text-white shadow-md">
              {safeString(username || 'P').charAt(0).toUpperCase()}
            </div>
            <div className="mt-4 md:mt-0 md:ml-8 flex-1">
              <h1 className="text-3xl font-bold">
                {editingUsername ? (
                  <input
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    onBlur={updateUsername}
                    className="text-3xl font-bold bg-white/50 rounded px-2 py-1"
                  />
                ) : (
                  safeString(username) || 'Unnamed'
                )}
                <button onClick={() => setEditingUsername(true)} className="ml-3 text-gray-600 hover:text-gray-800">
                  <PencilIcon className="w-5 h-5 inline" />
                </button>
              </h1>
              <p className="text-gray-700 mt-2">Wallet: <span className="font-mono">{safeString(player?.wallet) || 'Unknown'}</span></p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <div className="text-center">
                <div className="text-xl font-semibold">{safeString(player?.level) || '0'}</div>
                <div className="text-sm text-gray-600">Level</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-semibold">{safeString(player?.experience) || '0'}</div>
                <div className="text-sm text-gray-600">XP</div>
              </div>
            </div>
          </div>
        </div>

        {/* STATS PANELS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {statsArray.map(({ label, value }, index) => {
            // Extra safety check for rendering
            const displayValue = typeof value === 'number' ? value.toString() : '0';
            return (
              <div key={`${label}-${index}`} className="bg-white/50 backdrop-blur-md rounded-lg p-5 shadow hover:translate-y-1 transition">
                <div className="text-3xl font-bold text-indigo-600">{displayValue}</div>
                <div className="mt-1 text-gray-700">{label}</div>
              </div>
            );
          })}
        </div>

        {/* PARTY + EQUIPMENT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/60 backdrop-blur-md rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">Party Info</h2>
            {party && Array.isArray(party.members) ? (
              <ul className="space-y-2">
                <li><span className="font-semibold">Name:</span> {safeString(party.name) || 'Unnamed Party'} {party.isLeader && <span className="text-green-600">(Leader)</span>}</li>
                <li><span className="font-semibold">Role:</span> {
        (() => {
          const member = party.members.find(m => m?.player?.wallet === player?.wallet);
          return safeString(member?.role) || 'Unknown';
        })()
      }</li>
                <li><span className="font-semibold">Joined:</span> {
        (() => {
          const member = party.members.find(m => m?.player?.wallet === player?.wallet);
          const joinedAt = member?.joinedAt;
          if (typeof joinedAt === 'string' && joinedAt.includes('T')) {
            return safeString(joinedAt.split('T')[0]);
          }
          return safeString(joinedAt) || 'N/A';
        })()
      }</li>
                <li><span className="font-semibold">Chain:</span> {safeString(party.chainId) || 'Unknown'}</li>
              </ul>
            ) : <p className="text-gray-600">Not in a party yet.</p>}
          </div>

          <div className="bg-white/60 backdrop-blur-md rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">Equipment</h2>
            <div className="space-y-4">
              {Array.isArray(equipment) && equipment.length > 0 ? (
                equipment.map((item, index) => (
                  <div key={item?.tokenId || index} className="flex items-center justify-between bg-white/40 rounded-md p-3 hover:bg-white/60 transition">
                    <div>
                      <h3 className="text-lg font-semibold">{safeString(item?.name) || 'Unknown Item'}</h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-700">
                        <span>{safeString(item?.attackPower) || '0'}⚔️</span>
                        <span>{safeString(item?.defensePower) || '0'}🛡️</span>
                        <span>{safeString(item?.magicPower) || '0'}✨</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${rarityBadge(item?.rarity || 'Common')}`}>
                      {safeString(item?.rarity) || 'Common'}
                    </span>
                    <ChevronRightIcon className="w-5 h-5 text-gray-500"/>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">No equipment found.</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
