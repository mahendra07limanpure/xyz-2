import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from './config/wagmi';
import { GameProvider } from './contexts/GameContext';
import { SocketProvider } from './contexts/SocketContext';
import { ToastProvider } from './contexts/ToastContext';
import Navbar from './components/Navbar';
import GameInstructions from './components/GameInstructions';
import HomePage from './pages/HomePage';
import GamePage from './pages/GamePage';
import PartyPage from './pages/PartyPage';
import MarketplacePage from './pages/MarketplacePage';
import ProfilePage from './pages/ProfilePage';
import '@rainbow-me/rainbowkit/styles.css';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <RainbowKitProvider>
          <ToastProvider>
            <GameProvider>
              <SocketProvider>
                <Router>
                  <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
                    <Navbar />
                    <main className="container mx-auto px-4 py-8">
                      <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/game" element={<GamePage />} />
                        <Route path="/party" element={<PartyPage />} />
                        <Route path="/marketplace" element={<MarketplacePage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                      </Routes>
                    </main>
                    <GameInstructions />
                  </div>
                </Router>
              </SocketProvider>
            </GameProvider>
          </ToastProvider>
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}

export default App;
