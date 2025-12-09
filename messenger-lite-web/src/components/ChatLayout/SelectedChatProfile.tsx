import { useChatStore } from '@/store/useChatStore';
import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import AvatarImage from '../reusable/AvatarImage';
import { MEDIA_HOST } from '@/constant';
import { DummyAvatar } from '@/assets/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import ShowFiles from './SelectedChatProfile/ShowFiles';
import ShowMedia from './SelectedChatProfile/ShowMedia';
import ShowLinksa from './SelectedChatProfile/ShowLinksa';
import ShowInfo from './SelectedChatProfile/ShowInfo';

interface SelectedChatProfileProps {
  id: string;
  onClose?: () => void;
}

const SelectedChatProfile: React.FC<SelectedChatProfileProps> = ({ id, onClose }) => {
  const [activeTab, setActiveTab] = useState('media');
  const { handleFetchUsersInfo, selectedUserInfo, selectedChat } = useChatStore();

  useEffect(() => {
    if (id) handleFetchUsersInfo(id);
  }, [id, handleFetchUsersInfo]);

  if (!selectedUserInfo) return <div className="p-4">Loading user info...</div>;

  const { avatar, username, email } = selectedUserInfo;

  const displayAvatar = avatar ? `${MEDIA_HOST}/${avatar}` : DummyAvatar.src;

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        {onClose && (
          <button
            onClick={() => {
              onClose();
            }}
          >
            <X className="w-5 h-5 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white" />
          </button>
        )}
      </div>

      {/* Avatar */}
      <div className="flex justify-center mb-4 shrink-0">
        <div className="w-36 h-36">
          <AvatarImage src={displayAvatar} alt="Profile" />
        </div>
      </div>

      {/* User Info */}
      <div className="text-center mb-4 shrink-0">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{username}</h3>
        <p className="text-gray-600 dark:text-gray-400">{email}</p>
      </div>

      {/* TABS → this section scrolls only */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Tabs
          defaultValue={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <TabsList className="w-full shrink-0">
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="links">Links</TabsTrigger>
            <TabsTrigger value="info">Info</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="media" className="h-full overflow-y-auto scrollbar-none px-2">
              <ShowMedia selectedChat={selectedChat} />
            </TabsContent>

            <TabsContent value="files" className="h-full overflow-y-auto px-2">
              <ShowFiles />
            </TabsContent>

            <TabsContent value="links" className="h-full overflow-y-auto px-2">
              <ShowLinksa />
            </TabsContent>

            <TabsContent value="info" className="h-full overflow-y-auto px-2">
              <ShowInfo selectedUserInfo={selectedUserInfo} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default SelectedChatProfile;
