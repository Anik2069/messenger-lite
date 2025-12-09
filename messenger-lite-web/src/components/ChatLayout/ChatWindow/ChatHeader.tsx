import { Button } from "@/components/ui/button";
import { Chat } from "../../../types/ChatType";
import ChatHeaderActions from "./ChatHeaderActions";
import { Phone, Video } from "lucide-react";
import { MEDIA_HOST } from "@/constant";
import { DummyAvatar } from "@/assets/image";
import AvatarImage from "../../reusable/AvatarImage";
import { Tooltip } from "@/components/ui/tooltip";

const ChatHeader = ({ selectedChat }: { selectedChat: Chat }) => {
  // const image = `${selectedChat.avatar}`;

  const image = selectedChat.avatar
    ? `${MEDIA_HOST}/${selectedChat.avatar}`
    : DummyAvatar.src;
  // console.log(selectedChat, ")))))))))))))))))");
  // console.log(image, ")))))))))))))))))");

  return (
    <div className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 flex justify-between items-center">
      <div className="flex items-center">
        {
          <div className="w-10 h-10  mr-3">
            {/* {selectedChat.type === "group"
              ? "#"
              : getInitials(selectedChat.name)} */}
            <AvatarImage src={image} alt="Profile" />
          </div>
        }
        <div>
          <h2 className="font-semibold text-gray-900 dark:text-white">
            {selectedChat.name}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {selectedChat.type === "group"
              ? "Group chat"
              : selectedChat.isOnline
                ? "Online"
                : "Offline"}
          </p>
        </div>
      </div>
      <div className="flex items-center">
        <div className="flex items-center">
          <Tooltip>

            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            // onClick={handleVideoCall}
            >
              <Video className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </Button>
          </Tooltip>

          <Tooltip>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            // onClick={handleAudioCall}
            >
              <Phone className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </Button>
          </Tooltip>
        </div>
        <ChatHeaderActions conversationId={selectedChat.id} />
      </div>
    </div>
  );
};

export default ChatHeader;
