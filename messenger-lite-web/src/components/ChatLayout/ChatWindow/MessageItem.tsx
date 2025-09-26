import { Forward, Smile } from "lucide-react";
import { Message } from "../../../types/MessageType";
import FileMessage from "./FileMessage";
import ReactionPicker from "./ReactionPicker";
import { formatTime } from "@/lib/utils";

const MessageItem = ({
  msg,
  isOwnMessage,
  isGroupChat,
  showReactions,
  setShowReactions,
  onForward,
  onAddReaction,
}: {
  msg: Message;
  isOwnMessage: boolean;
  isGroupChat: boolean;
  showReactions: string | null;
  setShowReactions: (id: string | null) => void;
  onForward: (msg: Message) => void;
  onAddReaction: (id: string, emoji: string) => void;
}) => {
  return (
    <div
      key={msg.id}
      className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
    >
      <div className="max-w-xs lg:max-w-md">
        <div
          className={`px-4 py-2 rounded-2xl relative group ${
            isOwnMessage
              ? "bg-blue-500 text-white rounded-br-md"
              : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md"
          }`}
        >
          {isGroupChat && !isOwnMessage && (
            <p className="text-xs font-medium mb-1 opacity-75">
              {msg.from?.username}
            </p>
          )}

          {msg.messageType === "forwarded" && (
            <div className="text-xs opacity-75 mb-1 flex items-center">
              <Forward className="w-3 h-3 mr-1" />
              Forwarded from {msg.forwardedFrom?.originalSender}
            </div>
          )}

          <p className="text-sm leading-relaxed">{msg.message}</p>

          {msg.messageType === "file" && msg.fileData && (
            <FileMessage fileData={msg.fileData} />
          )}

          <div className="flex items-center justify-between mt-1">
            <p
              className={`text-xs ${
                isOwnMessage
                  ? "text-blue-100"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {formatTime(msg.timestamp)}
            </p>
          </div>

          {/* Actions */}
          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
            <button
              onClick={() =>
                setShowReactions(showReactions === msg.id ? null : msg.id)
              }
              className="p-1 rounded hover:bg-black/10"
            >
              <Smile className="w-3 h-3" />
            </button>
            <button
              onClick={() => onForward(msg)}
              className="p-1 rounded hover:bg-black/10"
            >
              <Forward className="w-3 h-3" />
            </button>
          </div>

          {showReactions === msg.id && (
            <ReactionPicker
              messageId={msg.id}
              onAddReaction={onAddReaction}
              onClose={() => setShowReactions(null)}
            />
          )}
        </div>

        {/* Reactions summary */}
        {msg.reactions && msg.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {Object.entries(
              msg.reactions.reduce((acc: Record<string, string[]>, r) => {
                acc[r.emoji] = (acc[r.emoji] || []).concat(r.username);
                return acc;
              }, {})
            ).map(([emoji, users]) => (
              <div
                key={emoji}
                className="bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-1 text-xs flex items-center space-x-1"
                title={`${users.join(", ")} reacted with ${emoji}`}
              >
                <span>{emoji}</span>
                <span>{users.length}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageItem;
