'use client';
import { AuthProvider } from '@/context/useAuth';
import React from 'react';

const layout = ({ children }: { children: React.ReactNode }) => {
  return <AuthProvider>{children}</AuthProvider>;
};

export default layout;
