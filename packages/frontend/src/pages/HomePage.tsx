import React from 'react';
import { Link } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <img 
            src="/DungeonX.png" 
            alt="DungeonX" 
            className="mx-auto h-24 w-auto object-contain mb-4 animate-float"
          />
          <h1 className="text-5xl font-bold text-white mb-4 text-glow">
            Cross-Chain AI Dungeon Crawler
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Adventure across multiple blockchains, battle AI-powered NPCs, and trade equipment in a decentralized marketplace.
          </p>
        </div>
        
        <div className="space-y-6">
          <ConnectButton />
          
          <div className="flex justify-center space-x-4">
            <Link
              to="/game"
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg transition-colors inline-block"
            >
              🚀 Start Adventure
            </Link>
            <button className="bg-transparent border-2 border-purple-600 hover:bg-purple-600 text-purple-600 hover:text-white font-bold py-3 px-8 rounded-lg transition-colors">
              📖 Learn More
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
            <div className="glass-morphism p-6 rounded-lg">
              <div className="text-4xl mb-4">🌉</div>
              <h3 className="text-xl font-bold text-white mb-2">Cross-Chain</h3>
              <p className="text-gray-300 text-sm">
                Adventure across Ethereum, Polygon, and Arbitrum. Form parties with players from any chain.
              </p>
            </div>
            
            <div className="glass-morphism p-6 rounded-lg">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-bold text-white mb-2">AI-Powered NPCs</h3>
              <p className="text-gray-300 text-sm">
                Interact with intelligent NPCs powered by ElizaOS. Each character has unique personalities and dialogue.
              </p>
            </div>
            
            <div className="glass-morphism p-6 rounded-lg">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-bold text-white mb-2">DeFi Marketplace</h3>
              <p className="text-gray-300 text-sm">
                Lend and borrow equipment using smart contracts. Earn yield on your unused gear.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
