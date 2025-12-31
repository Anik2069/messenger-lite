'use client';
// import { CallProvider } from '@/context/CallContext';
import { SettingsProvider } from '@/context/SettingsContext';
import { AuthProvider } from '@/context/useAuth';
import { ChatInputContextProvider } from '@/context/useChatInputContext';
import { SocketContextProvider } from '@/context/useSocket';
import { GlobalContextProvider } from '@/provider/GlobalContextProvider';
import React from 'react';
import IncomingCallPopup from '@/components/ChatLayout/IncomingCallPopup';

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <AuthProvider>
        <SocketContextProvider>
          <SettingsProvider>
            {' '}
            <GlobalContextProvider>
              <ChatInputContextProvider>
                {children}
                <IncomingCallPopup />
              </ChatInputContextProvider>
            </GlobalContextProvider>
          </SettingsProvider>
        </SocketContextProvider>
      </AuthProvider>
    </div>
  );
};

export default layout;
