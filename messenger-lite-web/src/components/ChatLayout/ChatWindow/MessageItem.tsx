import { Forward, Smile } from "lucide-react";
import { formatLocalTime, Message } from "../../../types/MessageType";
import FileMessage from "./FileMessage";
import ReactionPicker from "./ReactionPicker";

interface MessageItemProps {
  msg: Message;
  isOwnMessage: boolean;
  isGroupChat: boolean;
  showReactions: string | null;
  setShowReactions: (id: string | null) => void;
  onForward: (msg: Message) => void;
  onAddReaction: (id: string, emoji: string) => void;
}

const MessageItem = ({
  msg,
  isOwnMessage,
  isGroupChat,
  showReactions,
  setShowReactions,
  onForward,
  onAddReaction,
}: MessageItemProps) => {
  const renderMessageHeader = () => {
    if (isGroupChat && !isOwnMessage && msg.from?.username) {
      return (
        <p className="text-xs font-medium mb-1 opacity-75">
          {msg.from.username}
        </p>
      );
    }
    return null;
  };

  const renderForwardedHeader = () => {
    if (msg.messageType === "forwarded" && msg.forwardedFrom?.originalSender) {
      return (
        <div className="text-xs opacity-75 mb-1 flex items-center">
          <Forward className="w-3 h-3 mr-1" />
          Forwarded from {msg.forwardedFrom.originalSender}
        </div>
      );
    }
    return null;
  };

  const renderMessageContent = () => {
    return (
      <>
        <div className=" flex  flex-wrap">
          <div className="text-sm  line-h leading-relaxed">{msg.message}</div>
          <div className="  w-14 h-2.5 invisible "></div>
        </div>

        {msg.messageType === "file" && msg.fileData && (
          <FileMessage fileData={msg.fileData} />
        )}
      </>
    );
  };

  const renderMessageTime = () => {
    return (
      <p
        className={`text-[11px] whitespace-nowrap ${
          isOwnMessage ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
        }`}
      >
        {formatLocalTime((msg.createdAt as Date) || msg?.timestamp)}
      </p>
    );
  };

  const renderMessageActions = () => {
    return (
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
        <button
          onClick={() =>
            setShowReactions(showReactions === msg.id ? null : msg.id)
          }
          className="p-1 rounded hover:bg-black/10"
          aria-label="Add reaction"
        >
          <Smile className="w-3 h-3" />
        </button>
        <button
          onClick={() => onForward(msg)}
          className="p-1 rounded hover:bg-black/10"
          aria-label="Forward message"
        >
          <Forward className="w-3 h-3" />
        </button>
      </div>
    );
  };

  const renderReactions = () => {
    if (!msg.reactions || msg.reactions.length === 0) return null;

    const reactionGroups = msg.reactions.reduce(
      (acc: Record<string, string[]>, r) => {
        acc[r.emoji] = (acc[r.emoji] || []).concat(r.username);
        return acc;
      },
      {}
    );

    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {Object.entries(reactionGroups).map(([emoji, users]) => (
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
    );
  };

  return (
    <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
      <div className="max-w-xs lg:max-w-lg">
        <div
          className={`flex gap-2 items-end px-3 py-2 rounded-lg relative group ${
            isOwnMessage
              ? "bg-blue-500 text-white rounded-br-xs"
              : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-xs"
          }`}
        >
          {renderMessageHeader()}
          {renderForwardedHeader()}
          <div className="">{renderMessageContent()}</div>

          <div className="absolute -bottom-1.5   right-1.5   text-white text-sm text-right py-2">
            {renderMessageTime()}
          </div>

          {renderMessageActions()}

          {showReactions === msg.id && (
            <ReactionPicker
              messageId={msg.id}
              onAddReaction={onAddReaction}
              onClose={() => setShowReactions(null)}
            />
          )}
        </div>

        {renderReactions()}
      </div>
    </div>
  );
};

export default MessageItem;
