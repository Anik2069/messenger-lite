import { formatDate } from 'date-fns';
import React from 'react';
import AvatarImage from '../../reusable/AvatarImage';
import { MEDIA_HOST } from '@/constant';
import { DummyAvatar } from '@/assets/image';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ShowInfo = ({ isGroup, selectedUserInfo, selectedGroupInfo }: { isGroup: boolean; selectedUserInfo?: any; selectedGroupInfo?: any }) => {
  if (isGroup && selectedGroupInfo) {
    return (
      <div className="mx-2 flex flex-col gap-1 text-gray-700 dark:text-gray-300 text-sm">
        <div className="flex justify-between">
          <span>Created At:</span>
          <span>{selectedGroupInfo?.createdAt ? formatDate(new Date(selectedGroupInfo.createdAt), 'MMMM dd, yyyy') : 'N/A'}</span>
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-semibold text-base border-b border-gray-200 dark:border-gray-700 pb-2">
            Participants ({selectedGroupInfo.participants?.length || 0})
          </span>
          <div className="flex flex-col gap-3 mt-2">
            {selectedGroupInfo.participants?.map((participant: Record<string, any>) => { // eslint-disable-line @typescript-eslint/no-explicit-any
              const user = participant.user;
              const displayAvatar = user?.avatar ? `${MEDIA_HOST}/${user.avatar}` : DummyAvatar.src;
              return (
                <div key={participant.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 shrink-0">
                    <AvatarImage src={displayAvatar} alt={user?.username || 'User'} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900 dark:text-gray-100">{user?.username || 'Unknown User'}</span>
                    <span className="text-xs text-gray-500 capitalize">{participant.role?.toLowerCase() || 'member'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-2 flex flex-col gap-2 text-gray-700 dark:text-gray-300 text-sm">
      <div className="flex justify-between">
        <span>Account Created:</span>
        <span>{selectedUserInfo?.createdAt ? formatDate(new Date(selectedUserInfo.createdAt), 'MMMM dd, yyyy') : 'N/A'}</span>
      </div>
    </div>
  );
};

export default ShowInfo;
