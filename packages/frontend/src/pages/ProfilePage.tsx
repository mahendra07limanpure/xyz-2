import React from 'react';
import PlayerInfo from '../components/profile/PlayerInfo';
import GameStats from '../components/profile/GameStats';
import EquipmentList from '../components/profile/EquipmentList';
import AIInteractionList from '../components/profile/AIInteractionList';
import PartyMembership from '../components/profile/PartyMembership';

const ProfilePage: React.FC = () => {
  return (
    <div className="min-h-screen p-8 text-white bg-gradient-to-b from-gray-900 to-black">
      <h1 className="text-4xl font-bold mb-8 text-glow">🧝 Player Profile</h1>
      <PlayerInfo />
      <GameStats />
      <PartyMembership />
      <EquipmentList />
      <AIInteractionList />
    </div>
  );
};

export default ProfilePage;
