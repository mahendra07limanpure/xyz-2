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


const ProfilePage: React.FC = () => {
  const [player, setPlayer] = useState<any>(null);
  const [party, setParty] = useState<any>(null);
  const [equipment, setEquipment] = useState<any[]>([]);
  const [editingUsername, setEditingUsername] = useState(false);
  const [username, setUsername] = useState('');
  const { address: WALLET_ADDRESS } = useAccount(); // replace with actual dynamic value


  // Fetch all profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const playerRes = await apiClient.get(GAME_PLAYER_GET_ROUTE.replace('{wallet}', WALLET_ADDRESS));
        console.log('Player data:', playerRes.data);
        const playerData = playerRes.data;
        setPlayer(playerData.data);
        console.log('Playerrrrrrr', playerData);
        setUsername(playerData.data.username || '');

        const partyRes = await apiClient.get(PARTY_PLAYER_GET_ROUTE.replace('{address}', WALLET_ADDRESS));
        setParty(partyRes.data.data);
        console.log('Party data:', partyRes.data.data);


        setEquipment(playerData.data.equipment); // ✅ CORRECT: this is the array
        console.log('Equipment data:', playerData.data.equipment);
      } catch (err) {
        console.error('Error loading profile:', err);
      }
    };

    fetchProfile();
  }, []);

  const updateUsername = async () => {
    if (!player || !player.id) return;
    try {
      await apiClient.patch(GAME_PLAYER_UPDATE_ROUTE.replace('{playerId}', player.id), { username });
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

  if (!player) return <div className="text-center text-gray-500 py-20">Loading profile...</div>;

  const stats = {
    'Dungeons': player?.gameStats?.dungeonsCleared ?? 0,
    'Loot Collected': player?.gameStats?.totalLoot ?? 0,
    'XP Total': player?.gameStats?.totalExperience ?? player.experience,
    'Highest Level': player?.gameStats?.highestLevel ?? player.level,
    'Games Played': player?.gameStats?.gamesPlayed ?? 0,
  };

  return (
    <div className="min-h-screen glass-morphism flex items-center">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* HERO SECTION */}
        <div className="relative bg-white/60 backdrop-blur-xl rounded-xl shadow-lg overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-green-200 to-blue-200 mix-blend-overlay opacity-70" />
          <div className="relative flex flex-col md:flex-row items-center p-8">
            <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-4xl font-extrabold text-white shadow-md">
              {username.charAt(0) || 'P'}
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
                  username || 'Unnamed'
                )}
                <button onClick={() => setEditingUsername(true)} className="ml-3 text-gray-600 hover:text-gray-800">
                  <PencilIcon className="w-5 h-5 inline" />
                </button>
              </h1>
              <p className="text-gray-700 mt-2">Wallet: <span className="font-mono">{player.wallet}</span></p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <div className="text-center">
                <div className="text-xl font-semibold">{player.level}</div>
                <div className="text-sm text-gray-600">Level</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-semibold">{player.experience}</div>
                <div className="text-sm text-gray-600">XP</div>
              </div>
            </div>
          </div>
        </div>

        {/* STATS PANELS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(stats).map(([label, value]) => (
            <div key={label} className="bg-white/50 backdrop-blur-md rounded-lg p-5 shadow hover:translate-y-1 transition">
              <div className="text-3xl font-bold text-indigo-600">{value}</div>
              <div className="mt-1 text-gray-700">{label}</div>
            </div>
          ))}
        </div>

        {/* PARTY + EQUIPMENT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/60 backdrop-blur-md rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">Party Info</h2>
            {party ? (
              <ul className="space-y-2">
                <li><span className="font-semibold">Name:</span> {party.name} {party.isLeader && <span className="text-green-600">(Leader)</span>}</li>
                <li><span className="font-semibold">Role:</span> {
        party.members.find(m => m.player.wallet === player.wallet)?.role ||
        'Unknown'
      }</li>
                <li><span className="font-semibold">Joined:</span> {
        party.members.find(m => m.player.wallet === player.wallet)?.joinedAt
          ?.split('T')[0] || 'N/A'
      }</li>
                <li><span className="font-semibold">Chain:</span> {party.chainId}</li>
              </ul>
            ) : <p className="text-gray-600">Not in a party yet.</p>}
          </div>

          <div className="bg-white/60 backdrop-blur-md rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">Equipment</h2>
            <div className="space-y-4">
              {equipment.map(item => (
                <div key={item.tokenId} className="flex items-center justify-between bg-white/40 rounded-md p-3 hover:bg-white/60 transition">
                  <div>
                    <h3 className="text-lg font-semibold">{item.name}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-700">
                      <span>{item.attackPower}⚔️</span>
                      <span>{item.defensePower}🛡️</span>
                      <span>{item.magicPower}✨</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${rarityBadge(item.rarity)}`}>
                    {item.rarity}
                  </span>
                  <ChevronRightIcon className="w-5 h-5 text-gray-500"/>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
