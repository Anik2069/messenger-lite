import { Button } from '@/components/ui/button';
import { useFriendsStore } from '@/store/useFriendsStrore';
import React, { useEffect } from 'react';
import { UserCard, UserCardSkeleton } from './UserCard';

const SuggestedFriendList = () => {
  const { 
    suggestedFriends, 
    suggestedFriendsLoading,
    error,
    getSuggestedFriends, 
    activeTab, 
    searchText, 
    onSendRequest 
  } = useFriendsStore();

  useEffect(() => {
    getSuggestedFriends(searchText);
  }, [searchText, getSuggestedFriends, activeTab]);

  if (suggestedFriendsLoading) {
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

  if (!suggestedFriends?.length) {
    return (
      <p className="text-center text-sm text-gray-500 mt-4">No suggested friends found.</p>
    );
  }

  return (
    <div className="mt-2">
      {suggestedFriends.map((userInfo) => (
        <UserCard
          key={userInfo?.id}
          user={userInfo}
          actionContent={
            <Button
              type="button"
              onClick={() => onSendRequest(userInfo?.id)}
              className="cursor-pointer"
              size={'sm'}
              variant={'default'}
            >
              Add Friend
            </Button>
          }
        />
      ))}
    </div>
  );
};

export default SuggestedFriendList;
