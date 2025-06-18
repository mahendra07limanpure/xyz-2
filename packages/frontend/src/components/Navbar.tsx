import React from 'react';
import { Link } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-black/20 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold text-white">
            🏰 Dungeon Crawler
          </Link>
          
          <div className="hidden md:flex space-x-8">
            <Link to="/game" className="text-white hover:text-purple-300 transition-colors">
              Game
            </Link>
            <Link to="/party" className="text-white hover:text-purple-300 transition-colors">
              Party
            </Link>
            <Link to="/marketplace" className="text-white hover:text-purple-300 transition-colors">
              Marketplace
            </Link>
            <Link to="/profile" className="text-white hover:text-purple-300 transition-colors">
              Profile
            </Link>
          </div>

          <ConnectButton />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
