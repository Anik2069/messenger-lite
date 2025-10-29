import { useState } from "react";
import { Chat } from "../../../types/ChatType";
import { FileData, Message, ForwardedData } from "../../../types/MessageType";
import { User } from "../../../types/UserType";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";

interface ChatWindowProps {
  currentUser: User | null;
  selectedChat: Chat | null;
  messages: Message[];
  otherUserTyping: string | null;
  onSendMessage: (
    text: string,
    type?: "text" | "FILE" | "forwarded",
    fileData?: FileData,
    forwardedFrom?: ForwardedData
  ) => void;
  onAddReaction: (id: string, emoji: string) => void;
  onTypingStart: () => void;
  onTypingStop: () => void;
}

const ChatWindow = ({
  currentUser,
  selectedChat,
  messages,
  otherUserTyping,
  onSendMessage,
  onAddReaction,
  onTypingStart,
  onTypingStop,
}: ChatWindowProps) => {
  const [message, setMessage] = useState("");
  const [showReactions, setShowReactions] = useState<string | null>(null);

  if (!selectedChat) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        Select a conversation to start messaging
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <ChatHeader selectedChat={selectedChat} />
      <MessageList
        messages={messages}
        currentUserId={currentUser?.id}
        isGroupChat={selectedChat.type === "group"}
        otherUserTyping={otherUserTyping}
        showReactions={showReactions}
        setShowReactions={setShowReactions}
        onForward={(msg) =>
          onSendMessage(msg.message, "forwarded", undefined, {
            originalSender: msg?.from?.username || "Unknown",
            originalTimestamp: new Date(msg.timestamp || msg.timestamp),
          })
        }
        onAddReaction={onAddReaction}
      />
      <ChatInput
        message={message}
        setMessage={setMessage}
        onSendMessage={onSendMessage}
        onTypingStart={onTypingStart}
        onTypingStop={onTypingStop}
      />
    </div>
  );
};

export default ChatWindow;
