'use client';

import React from 'react';
import { useAuth } from '@/context/useAuth';
import { AuthForm } from './AuthForm';
import { Spinner } from '../ui/Spinner';

export const AuthPageComponents = () => {
  const { initialLoading } = useAuth();

  if (initialLoading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <Spinner />
      </div>
    );

  return <AuthForm />;
};
