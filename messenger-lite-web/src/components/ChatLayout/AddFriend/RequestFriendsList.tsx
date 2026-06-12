import { Button } from '@/components/ui/button';
import { useFriendsStore } from '@/store/useFriendsStrore';
import React, { useEffect } from 'react';
import { UserCard, UserCardSkeleton } from './UserCard';

const RequestFriendsList = () => {
  const {
    requestedFriends,
    requestedFriendsLoading,
    error,
    activeTab,
    searchText,
    getRequestedFriends,
    onAcceptRequest,
    onDeclineFriendRequest,
  } = useFriendsStore();

  useEffect(() => {
    getRequestedFriends(searchText);
  }, [searchText, getRequestedFriends, activeTab]);

  if (requestedFriendsLoading) {
    return (
      <div className="space-y-2 mt-2">
        <UserCardSkeleton />
        <UserCardSkeleton />
        <UserCardSkeleton />
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-sm text-red-500 mt-4">Failed to load requested users</p>;
  }

  if (!requestedFriends?.length) {
    return (
      <p className="text-center text-sm text-gray-500 mt-4">You have no pending friend requests.</p>
    );
  }

  return (
    <div className="mt-2">
      {requestedFriends.map((userInfo) => (
        <UserCard
          key={userInfo?.id}
          user={userInfo}
          actionContent={
            <>
              <Button
                onClick={() => onAcceptRequest(userInfo.id)}
                type="button"
                className="cursor-pointer"
                size={'sm'}
                variant={'default'}
              >
                Confirm
              </Button>
              <Button
                onClick={() => onDeclineFriendRequest(userInfo.id)}
                type="button"
                className="cursor-pointer"
                size={'sm'}
                variant={'outline'}
              >
                Delete
              </Button>
            </>
          }
        />
      ))}
    </div>
  );
};

export default RequestFriendsList;
