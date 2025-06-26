import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { PartyStatus, PartyRole } from '../../../shared/src/types';
import type { Party, PartyMember } from '../../../shared/src/types';
import { useGame } from '../contexts/GameContext';

interface PartyInvite {
  id: string;
  partyId: string;
  partyName: string;
  leaderName: string;
  memberCount: number;
  maxSize: number;
}

const PartyPage: React.FC = () => {
  const { address } = useAccount();
  const { state } = useGame();
  const [currentParty, setCurrentParty] = useState<Party | null>(null);
  const [partyInvites, setPartyInvites] = useState<PartyInvite[]>([]);
  const [availableParties, setAvailableParties] = useState<Party[]>([]);
  const [isCreatingParty, setIsCreatingParty] = useState(false);
  const [newPartyName, setNewPartyName] = useState('');
  const [activeTab, setActiveTab] = useState<'current' | 'browse' | 'invites'>('current');

  // Mock data for demonstration
  useEffect(() => {
    // Simulate fetching party data
    const mockParty: Party = {
      id: '1',
      name: 'Dragon Slayers',
      leaderId: address || '',
      members: [
        {
          playerId: '1',
          walletAddress: address || '',
          chainId: 1,
          role: PartyRole.LEADER,
          joinedAt: new Date(),
          isOnline: true
        },
        {
          playerId: '2',
          walletAddress: '0x742d35Cc6534C0532925a3b8C6dda738d9043b52',
          chainId: 1,
          role: PartyRole.MEMBER,
          joinedAt: new Date(Date.now() - 86400000),
          isOnline: true
        },
        {
          playerId: '3',
          walletAddress: '0x8ba1f109551bD432803012645Hac136c31A426',
          chainId: 1,
          role: PartyRole.MEMBER,
          joinedAt: new Date(Date.now() - 172800000),
          isOnline: false
        }
      ],
      maxSize: 4,
      createdChainId: 1,
      status: PartyStatus.FORMING,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const mockInvites: PartyInvite[] = [
      {
        id: '1',
        partyId: '2',
        partyName: 'Mage Guild',
        leaderName: 'Wizard0x42',
        memberCount: 2,
        maxSize: 3
      },
      {
        id: '2',
        partyId: '3',
        partyName: 'Treasure Hunters',
        leaderName: 'GoldDigger',
        memberCount: 3,
        maxSize: 5
      }
    ];

    const mockAvailableParties: Party[] = [
      {
        id: '4',
        name: 'Shadow Walkers',
        leaderId: '0x123',
        members: [
          {
            playerId: '4',
            walletAddress: '0x123',
            chainId: 1,
            role: PartyRole.LEADER,
            joinedAt: new Date(),
            isOnline: true
          }
        ],
        maxSize: 4,
        createdChainId: 1,
        status: PartyStatus.FORMING,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    setCurrentParty(mockParty);
    setPartyInvites(mockInvites);
    setAvailableParties(mockAvailableParties);
  }, [address]);

  const handleCreateParty = async () => {
    if (!newPartyName.trim()) return;
    
    setIsCreatingParty(true);
    // Simulate API call
    setTimeout(() => {
      const newParty: Party = {
        id: Date.now().toString(),
        name: newPartyName,
        leaderId: address || '',
        members: [{
          playerId: '1',
          walletAddress: address || '',
          chainId: 1,
          role: PartyRole.LEADER,
          joinedAt: new Date(),
          isOnline: true
        }],
        maxSize: 4,
        createdChainId: 1,
        status: PartyStatus.FORMING,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setCurrentParty(newParty);
      setNewPartyName('');
      setIsCreatingParty(false);
      setActiveTab('current');
    }, 1000);
  };

  const handleJoinParty = (partyId: string) => {
    console.log('Joining party:', partyId);
    // Implement join party logic
  };

  const handleAcceptInvite = (inviteId: string) => {
    console.log('Accepting invite:', inviteId);
    // Implement accept invite logic
  };

  const handleLeaveParty = () => {
    if (window.confirm('Are you sure you want to leave the party?')) {
      setCurrentParty(null);
    }
  };

  const getChainName = (chainId: number) => {
    const chains = {
      1: 'Ethereum',
      137: 'Polygon',
      42161: 'Arbitrum'
    };
    return chains[chainId as keyof typeof chains] || `Chain ${chainId}`;
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const renderCurrentParty = () => {
    if (!currentParty) {
      return (
        <div className="game-card text-center py-12">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-700 flex items-center justify-center">
              <span className="text-3xl">👥</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Active Party</h3>
            <p className="text-gray-400 mb-6">Create a new party or join an existing one to start your adventure!</p>
          </div>
          
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <input
                type="text"
                placeholder="Enter party name..."
                value={newPartyName}
                onChange={(e) => setNewPartyName(e.target.value)}
                className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={handleCreateParty}
                disabled={isCreatingParty || !newPartyName.trim()}
                className="game-button px-6 py-2 disabled:opacity-50"
              >
                {isCreatingParty ? 'Creating...' : 'Create Party'}
              </button>
            </div>
            
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setActiveTab('browse')}
                className="text-purple-400 hover:text-purple-300 underline"
              >
                Browse Available Parties
              </button>
              <span className="text-gray-600">|</span>
              <button
                onClick={() => setActiveTab('invites')}
                className="text-purple-400 hover:text-purple-300 underline"
              >
                Check Invites ({partyInvites.length})
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Party Header */}
        <div className="game-card">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">{currentParty.name}</h2>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span>Members: {currentParty.members.length}/{currentParty.maxSize}</span>
                <span>Status: <span className="text-purple-400 capitalize">{currentParty.status.replace('_', ' ')}</span></span>
                <span>Chain: {getChainName(currentParty.createdChainId)}</span>
              </div>
            </div>
            
            <div className="flex gap-2 mt-4 sm:mt-0">
              <button className="game-button px-4 py-2">
                Invite Players
              </button>
              <button 
                onClick={handleLeaveParty}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Leave Party
              </button>
            </div>
          </div>

          {/* Party Members */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white mb-3">Party Members</h3>
            {currentParty.members.map((member, index) => (
              <div key={member.playerId} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      {member.role === PartyRole.LEADER ? '👑' : '⚔️'}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-800 ${
                      member.isOnline ? 'bg-green-500' : 'bg-gray-500'
                    }`} />
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">
                        {formatAddress(member.walletAddress)}
                      </span>
                      {member.role === PartyRole.LEADER && (
                        <span className="text-xs bg-yellow-600 text-yellow-100 px-2 py-1 rounded">
                          Leader
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">
                      {getChainName(member.chainId)} • Joined {member.joinedAt.toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    member.isOnline 
                      ? 'bg-green-800 text-green-200' 
                      : 'bg-gray-700 text-gray-400'
                  }`}>
                    {member.isOnline ? 'Online' : 'Offline'}
                  </span>
                  
                  {member.walletAddress === address && member.role !== PartyRole.LEADER && (
                    <button className="text-xs text-red-400 hover:text-red-300">
                      Leave
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Party Actions */}
          {currentParty.status === PartyStatus.FORMING && (
            <div className="mt-6 pt-6 border-t border-gray-700">
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="game-button flex-1 py-3">
                  🏰 Enter Dungeon
                </button>
                <button className="game-button flex-1 py-3">
                  🛒 Visit Marketplace
                </button>
                <button className="game-button flex-1 py-3">
                  ⚙️ Party Settings
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderBrowseParties = () => (
    <div className="space-y-4">
      <div className="game-card">
        <h3 className="text-xl font-bold text-white mb-4">Available Parties</h3>
        
        {availableParties.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No parties available to join at the moment.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {availableParties.map((party) => (
              <div key={party.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div>
                  <h4 className="text-white font-medium">{party.name}</h4>
                  <div className="text-sm text-gray-400">
                    Members: {party.members.length}/{party.maxSize} • 
                    Chain: {getChainName(party.createdChainId)} • 
                    Status: <span className="capitalize">{party.status.replace('_', ' ')}</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleJoinParty(party.id)}
                  className="game-button px-4 py-2"
                >
                  Request to Join
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderInvites = () => (
    <div className="space-y-4">
      <div className="game-card">
        <h3 className="text-xl font-bold text-white mb-4">Party Invitations</h3>
        
        {partyInvites.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No pending invitations.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {partyInvites.map((invite) => (
              <div key={invite.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div>
                  <h4 className="text-white font-medium">{invite.partyName}</h4>
                  <div className="text-sm text-gray-400">
                    Leader: {invite.leaderName} • 
                    Members: {invite.memberCount}/{invite.maxSize}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleAcceptInvite(invite.id)}
                    className="game-button px-4 py-2"
                  >
                    Accept
                  </button>
                  <button className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors">
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="text-white max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 font-['Orbitron']">⚔️ Party Management</h1>
        <p className="text-gray-400">Form parties, explore dungeons, and share adventures across multiple chains!</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveTab('current')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'current'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Current Party
        </button>
        <button
          onClick={() => setActiveTab('browse')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'browse'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Browse Parties
        </button>
        <button
          onClick={() => setActiveTab('invites')}
          className={`px-4 py-2 rounded-lg transition-colors relative ${
            activeTab === 'invites'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Invitations
          {partyInvites.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {partyInvites.length}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      {activeTab === 'current' && renderCurrentParty()}
      {activeTab === 'browse' && renderBrowseParties()}
      {activeTab === 'invites' && renderInvites()}
    </div>
  );
};

export default PartyPage;
