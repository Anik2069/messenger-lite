import { DummyAvatar } from '@/assets/image';
import { Button } from '@/components/ui/button';
import { MEDIA_HOST } from '@/constant';

import { useFriendsStore } from '@/store/useFriendsStrore';
import Image from 'next/image';
import React, { useEffect } from 'react';

const RequestFriendsList = () => {
  const {
    requestedFriends,
    activeTab,
    searchText,
    getRequestedFriends,
    onAcceptRequest,
    onDeclineFriendRequest,
  } = useFriendsStore();

  useEffect(() => {
    getRequestedFriends(searchText);
  }, [searchText, getRequestedFriends, activeTab]);

  return (
    <div className="">
      {requestedFriends?.map((userInfo) => {
        return (
          <div
            key={userInfo?.id}
            className={`flex items-start px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors `}
          >
            <div className="relative mr-3">
              <Image
                src={userInfo?.avatar ? MEDIA_HOST + '/' + userInfo?.avatar : DummyAvatar}
                alt={userInfo?.username}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover cursor-pointer mt-1"
              />
            </div>

            <div className="flex-1 min-w-0 flex flex-col gap-1">
              <div className="">
                <h3 className="font-medium text-gray-900 dark:text-white truncate cursor-pointer w-fit">
                  {userInfo?.username}
                </h3>
                <p
                  className={`text-xs truncate text-gray-500 dark:text-gray-400 
                  `}
                >
                  10 mutual friends
                </p>
              </div>
              <div className="flex items-center gap-2">
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
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RequestFriendsList;
