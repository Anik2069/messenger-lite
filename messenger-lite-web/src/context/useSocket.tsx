'use client';

import { socket } from '@/lib/socket';
import React, { createContext, useContext } from 'react';

interface useSocketContextType {
  fetchActiveStatus: () => void;
}

const useSocketContext = createContext<useSocketContextType | null>(null);

export const SocketContextProvider = ({ children }: { children: React.ReactNode }) => {
  const fetchActiveStatus = async () => {
    try {
      socket.emit('get-active-status', {});
    } catch {}
  };
  return (
    <useSocketContext.Provider value={{ fetchActiveStatus }}>{children}</useSocketContext.Provider>
  );
};

export const useSocket = () => {
  const ctx = useContext(useSocketContext);
  if (!ctx) throw new Error('useSocketContext must be used within useSocketContextProvider');
  return ctx;
};
