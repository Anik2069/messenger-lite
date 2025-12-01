import { useChatStore } from "@/store/useChatStore";
import React, { useEffect } from "react";
import { X } from "lucide-react";
import AvatarImage from "../reusable/AvatarImage";
import { MEDIA_HOST, SOCKET_HOST } from "@/constant";
import { DummyAvatar } from "@/assets/image";
import { formatDate } from "date-fns";

interface SelectedChatProfileProps {
  id: string;
  onClose?: () => void;
}

const SelectedChatProfile: React.FC<SelectedChatProfileProps> = ({
  id,
  onClose,
}) => {
  const { handleFetchUsersInfo, selectedUserInfo, setSelectedUserInfo } =
    useChatStore();
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

      {/* Additional Info */}
      <div className="flex flex-col gap-2 text-gray-700 dark:text-gray-300 text-sm">
        <div className="flex justify-between">
          <span>Account Created:</span>
          <span>{formatDate(createdAt as Date, "MMMM dd,yyyy")}</span>
        </div>
      </div>
    </div>
  );
};

export default SelectedChatProfile;
