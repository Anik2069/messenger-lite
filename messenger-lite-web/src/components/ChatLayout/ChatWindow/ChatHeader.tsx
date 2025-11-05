import { Button } from "@/components/ui/button";
import { Chat } from "../../../types/ChatType";
import { getInitials } from "@/lib/utils";
import ChatHeaderActions from "./ChatHeaderActions";
import { Phone, Video } from "lucide-react";
import Image from "next/image";
import { MEDIA_HOST } from "@/constant";
import { DummyAvatar } from "@/assets/image";

const ChatHeader = ({ selectedChat }: { selectedChat: Chat }) => {
  const image = `${selectedChat.avatar}`;
  // console.log(selectedChat);
  // console.log(image);

  return (
    <div className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 flex justify-between items-center">
      <div className="flex items-center">
        {
          <div className="w-10 h-10  mr-3">
            {/* {selectedChat.type === "group"
              ? "#"
              : getInitials(selectedChat.name)} */}
            <Image
              width={32}
              height={32}
              src={image}
              alt="Profile"
              className="rounded-full  object-cover w-full h-full"
              onError={(e) => {
                e.currentTarget.src = DummyAvatar.src;
                e.currentTarget.onerror = null;
              }}
            />
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
          <Button className="cursor-pointer" variant={"ghost"} size={"icon"}>
            <Video className="w-5 h-5" />
          </Button>
          <Button className="cursor-pointer" variant={"ghost"} size={"icon"}>
            <Phone className="w-5 h-5" />
          </Button>
        </div>
        <ChatHeaderActions />
      </div>
    </div>
  );
};

export default ChatHeader;
