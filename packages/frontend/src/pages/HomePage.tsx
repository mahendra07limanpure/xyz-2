import React from 'react';
import { Link } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-8 text-glow">
          Cross-Chain AI Dungeon Crawler
        </h1>
        <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
          Embark on epic adventures across multiple blockchains. Form parties, explore dungeons, 
          collect legendary loot, and interact with AI-powered NPCs in this groundbreaking Web3 RPG.
        </p>
        
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
                Interact with intelligent NPCs powered by ElizaOS. Every conversation is unique.
              </p>
            </div>
            
            <div className="glass-morphism p-6 rounded-lg">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-bold text-white mb-2">DeFi Integration</h3>
              <p className="text-gray-300 text-sm">
                Lend and borrow equipment using DeFi protocols. Earn yield on your legendary items.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
