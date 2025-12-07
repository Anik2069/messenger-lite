import { useChatStore } from "@/store/useChatStore";
import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import AvatarImage from "../reusable/AvatarImage";
import { MEDIA_HOST, SOCKET_HOST } from "@/constant";
import { DummyAvatar } from "@/assets/image";
import { formatDate } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import ShowFiles from "./SelectedChatProfile/ShowFiles";
import ShowMedia from "./SelectedChatProfile/ShowMedia";
import ShowLinksa from "./SelectedChatProfile/ShowLinksa";
import ShowInfo from "./SelectedChatProfile/ShowInfo";

interface SelectedChatProfileProps {
  id: string;
  onClose?: () => void;
}

const SelectedChatProfile: React.FC<SelectedChatProfileProps> = ({
  id,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState("media");
  const { handleFetchUsersInfo, selectedUserInfo, setSelectedUserInfo, selectedChat } =
    useChatStore();

    useEffect(() => {
      console.log(selectedChat, "selectedChat");
    }, [selectedChat]);
    
  useEffect(() => {
    if (!id) return;
    handleFetchUsersInfo(id);
  }, [id, handleFetchUsersInfo]);

  if (!selectedUserInfo) {
    return <div className="p-4">Loading user info...</div>;
  }

  const {
    avatar,
    username,
    email,
    isOnline,
    createdAt,
    lastSeenAt,
    isTwoFAEnable,

    lockedUntil,
  } = selectedUserInfo;
  const displayAvatar = avatar ? `${MEDIA_HOST}/${avatar}` : DummyAvatar.src;

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-gray-800 border-l-2 border-l-gray-200 dark:border-gray-700 shadow-xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        {/* <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          User Profile
        </h2> */}
        {onClose && (
          <button
            onClick={() => {
              onClose();
              setSelectedUserInfo();
            }}
          >
            <X className="w-5 h-5 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white" />
          </button>
        )}
      </div>

      {/* Avatar */}
      <div className="flex justify-center mb-4 w-40 h-40 mx-auto ">
        <AvatarImage src={displayAvatar} alt="Profile" />
      </div>

      {/* Basic Info */}
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          {username}
        </h3>
        <p className="text-gray-600 dark:text-gray-400">{email}</p>
      </div>

      

      <div className="flex-1 flex flex-col">
        <Tabs
        defaultValue={activeTab}
        onValueChange={(value) => {
          setActiveTab(value);
        }}
        className="flex-1 flex flex-col"
      >
        <TabsList className="w-full ">
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="links">Links</TabsTrigger>
          <TabsTrigger value="info">Info</TabsTrigger>
        </TabsList>
        
        <TabsContent className="flex-1 overflow-y-auto" value="media">
          <div className="mx-2">
            <ShowMedia selectedChat={selectedChat} />
          </div>
        </TabsContent>
        <TabsContent className="flex-1 overflow-y-auto" value="files">
          <div className="mx-2">
            <ShowFiles />
          </div>
        </TabsContent>
        <TabsContent className="flex-1 overflow-y-auto" value="links">
          <div className="mx-2">
            <ShowLinksa />
          </div>
        </TabsContent>
        <TabsContent className="flex-1 overflow-y-auto" value="info">
          {/* Additional Info */}
        <ShowInfo selectedUserInfo={selectedUserInfo} />
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
};

export default SelectedChatProfile;
