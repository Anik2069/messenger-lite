import { DummyAvatar } from '@/assets/image';
import { MEDIA_HOST } from '@/constant';
import Image from 'next/image';
import React from 'react';

interface UserCardProps {
  user: any;
  actionContent?: React.ReactNode;
}

export const UserCardSkeleton = () => {
  return (
    <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl bg-white/40 dark:bg-gray-800/40 backdrop-blur-md border border-white/30 dark:border-gray-700/50 shadow-sm animate-pulse">
      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
      <div className="flex-1 min-w-0 flex justify-between items-center">
        <div className="flex flex-col gap-2 w-full">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        </div>
      </div>
    </div>
  );
};

export const UserCard: React.FC<UserCardProps> = ({ user, actionContent }) => {
  return (
    <div className="flex items-center justify-between px-4 py-3 mb-2 rounded-md bg-gray-600/10 dark:bg-gray-800/40 backdrop-blur-md border border-white/50 dark:border-gray-700/50 shadow-sm hover:bg-gray-600/20 dark:hover:bg-gray-700/60 transition-all duration-400">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Image
          src={user?.avatar ? MEDIA_HOST + '/' + user?.avatar : DummyAvatar}
          alt={user?.username || 'User'}
          width={40}
          height={40}
          className="w-10 h-10 rounded-full object-cover shrink-0 border border-gray-600/20 dark:border-gray-700/50"
        />
        <div className="flex flex-col min-w-0">
          <h3 className="font-medium text-gray-900 dark:text-white truncate">
            {user?.username}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            10 mutual friends
          </p>
        </div>
      </div>

      {actionContent && (
        <div className="flex items-center gap-2 shrink-0 ml-3">
          {actionContent}
        </div>
      )}
    </div>
  );
};
