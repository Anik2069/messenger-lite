import { useEffect, useRef } from "react";
import { format, isToday, isYesterday } from "date-fns";
import { Message } from "../../../types/MessageType";
import MessageItem from "./MessageItem";

interface MessageListProps {
  messages: Message[];
  currentUserId?: string;
  isGroupChat: boolean;
  otherUserTyping: string | null;
  showReactions: string | null;
  setShowReactions: (id: string | null) => void;
  onForward: (msg: Message) => void;
  onAddReaction: (id: string, emoji: string) => void;
}

const MessageList = ({
  messages,
  currentUserId,
  isGroupChat,
  otherUserTyping,
  showReactions,
  setShowReactions,
  onForward,
  onAddReaction,
}: MessageListProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages or typing
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, otherUserTyping]);

  // Handle infinite scroll / load older messages
  const handleScroll = async () => {
    const el = containerRef.current;
    if (!el) return;

    if (el.scrollTop === 0) {
      const prevHeight = el.scrollHeight;

      // await loadOlderMessages?.();

      requestAnimationFrame(() => {
        const newHeight = el.scrollHeight;
        el.scrollTop = newHeight - prevHeight;
      });
    }
  };

  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      el.addEventListener("scroll", handleScroll);
      return () => el.removeEventListener("scroll", handleScroll);
    }
  }, []);

  // Function to get date label
  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "dd/MM/yyyy");
  };

  // Group messages by date while iterating
  let lastDateLabel = "";

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto scrollbar-none p-4 "
    >
      <div className="flex flex-col min-h-full justify-end space-y-2">
        {messages?.length > 0 ? (
          messages?.map((msg) => {
            const dateLabel = getDateLabel(
              (msg?.createdAt as string) ?? msg?.timestamp
            );
            const isOwnMessage =
              msg?.from?.id === currentUserId ||
              msg?.author?.id === currentUserId;

            const showDateHeader = dateLabel !== lastDateLabel;
            lastDateLabel = dateLabel;

            return (
              <div key={msg.id}>
                {showDateHeader && (
                  <div className="text-center text-gray-400 text-xs my-2 border bg-muted font-normal w-fit mx-auto rounded-md px-2 py-1">
                    {dateLabel}
                  </div>
                )}

                <MessageItem
                  msg={msg}
                  isOwnMessage={isOwnMessage}
                  isGroupChat={isGroupChat}
                  showReactions={showReactions}
                  setShowReactions={setShowReactions}
                  onForward={onForward}
                  onAddReaction={onAddReaction}
                />
              </div>
            );
          })
        ) : (
          <div className="text-center text-gray-400 text-sm my-auto">
            No messages yet
          </div>
        )}

        {/* Typing indicator */}
        {/* {otherUserTyping && (
        <div className="flex justify-start">
          <div className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-2xl rounded-bl-md px-4 py-2 max-w-xs">
            <div className="flex items-center space-x-2">
              <span className="text-sm">{otherUserTyping} is typing</span>
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" />
                <div
                  className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                />
                <div
                  className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
              </div>
            </div>
          </div>
        </div>
      )} */}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageList;
