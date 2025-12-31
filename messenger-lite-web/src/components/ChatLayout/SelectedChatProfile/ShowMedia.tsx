'use client';
import { useChatStore } from '@/store/useChatStore';
import React, { useEffect } from 'react';
import FileMessage from '../ChatWindow/FileMessage';
import { Spinner } from '@/components/ui/Spinner';

const ShowMedia = ({ selectedChat }: { selectedChat: any }) => {
  const { fetchConversationsMedia, selectedMedia, isLoadingMedia } = useChatStore();

  useEffect(() => {
    if (selectedChat) {
      fetchConversationsMedia(selectedChat.id);
    }
  }, [selectedChat, fetchConversationsMedia]);
  return (
    <div className="h-full">
      {
        isLoadingMedia ? (
          <div className="flex items-center justify-center h-full my-auto">
            {/* <p className="text-gray-500">Loading media...</p> */}
            <Spinner />
          </div>
        ) : selectedMedia?.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {selectedMedia?.map((media: any, index: number) => (
              <div key={index} className="">
                <FileMessage className="!w-20 !h-20 mx-auto" file={media} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No media found</p>
          </div>
        )
      }
    </div>
  );
};

export default ShowMedia;
