'use client';

import { useFriendsStore } from '@/store/useFriendsStrore';
import React, { useEffect } from 'react';
import {
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
  differenceInWeeks,
  format,
} from 'date-fns';
import { UserCard, UserCardSkeleton } from './UserCard';

const RequestedFriendsList = () => {
  const {
    error: friendsError,
    activeTab,
    searchText,
    pendingRequestsLIst,
    getPendingRequestsLIst,
    pendingRequestsLIstLoading,
  } = useFriendsStore();

  useEffect(() => {
    getPendingRequestsLIst(searchText);
  }, [searchText, getPendingRequestsLIst, activeTab]);

  if (pendingRequestsLIstLoading) {
    return (
      <div className="space-y-2 mt-2">
        <UserCardSkeleton />
        <UserCardSkeleton />
        <UserCardSkeleton />
      </div>
    );
  }

  if (friendsError) {
    return <p className="text-center text-sm text-red-500 mt-4">Failed to load requested users</p>;
  }

  if (!pendingRequestsLIst?.length) {
    return (
      <p className="text-center text-sm text-gray-500 mt-4">You haven’t sent any friend requests yet.</p>
    );
  }

  const formatSocialTime = (dateString: string | Date) => {
    const date = new Date(dateString);
    const now = new Date();

    const minutesAgo = differenceInMinutes(now, date);
    if (minutesAgo < 1) return 'Just now';
    if (minutesAgo < 60) return `${minutesAgo}m ago`;

    const hoursAgo = differenceInHours(now, date);
    if (hoursAgo < 24) return `${hoursAgo}h ago`;

    const daysAgo = differenceInDays(now, date);
    if (daysAgo < 7) return `${daysAgo}d ago`;

    const weeksAgo = differenceInWeeks(now, date);
    if (weeksAgo < 4) return `${weeksAgo}w ago`;

    return format(date, 'MMM d');
  };

  return (
    <div className="mt-2">
      {pendingRequestsLIst.map((userInfo) => (
        <UserCard
          key={userInfo?.id}
          user={userInfo}
          actionContent={
            userInfo?.requestCreatedAt && (
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                sent {formatSocialTime(userInfo?.requestCreatedAt)}
              </span>
            )
          }
        />
      ))}
    </div>
  );
};

export default RequestedFriendsList;
