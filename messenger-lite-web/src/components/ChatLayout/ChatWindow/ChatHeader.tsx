import { Chat } from "../../../types/ChatType";
import { getInitials } from "@/lib/utils";

const ChatHeader = ({ selectedChat }: { selectedChat: Chat }) => {
  return (
    <div className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 flex items-center">
      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white mr-3">
        {selectedChat.type === "group" ? "#" : getInitials(selectedChat.name)}
      </div>
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
  );
};

export default ChatHeader;
