import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Only connect to socket if backend URL is available
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    
    try {
      const newSocket = io(backendUrl, {
        autoConnect: false, // Don't auto-connect to avoid blocking rendering
      });
      
      newSocket.on('connect', () => {
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.warn('Socket connection error:', error);
        setIsConnected(false);
      });

      setSocket(newSocket);

      // Connect after a short delay to avoid blocking initial render
      setTimeout(() => {
        newSocket.connect();
      }, 1000);

      return () => {
        newSocket.close();
      };
    } catch (error) {
      console.warn('Failed to initialize socket:', error);
    }
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
