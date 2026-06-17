import React from 'react';
import { CallProvider } from '@/context/CallContext';
import { AuthProvider } from '@/context/useAuth';

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <CallProvider>{children}</CallProvider>
    </AuthProvider>
  );
};

export default layout;
