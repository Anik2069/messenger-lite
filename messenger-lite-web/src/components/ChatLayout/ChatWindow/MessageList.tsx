import { useEffect, useRef } from "react";
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
  //   loadOlderMessages?: () => Promise<void>;
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
}: //   loadOlderMessages,
MessageListProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, otherUserTyping]);

  const handleScroll = async () => {
    const el = containerRef.current;
    if (!el) return;

    if (el.scrollTop === 0) {
      const prevHeight = el.scrollHeight;

      //   await loadOlderMessages?.();

      // Preserve scroll position after prepend
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

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto scrollbar-none p-4 space-y-4"
    >
      {messages.map((msg) => {
        const isOwnMessage =
          msg?.from?.id === currentUserId || msg?.author?.id === currentUserId;

        return (
          <MessageItem
            key={msg.id}
            msg={msg}
            isOwnMessage={isOwnMessage}
            isGroupChat={isGroupChat}
            showReactions={showReactions}
            setShowReactions={setShowReactions}
            onForward={onForward}
            onAddReaction={onAddReaction}
          />
        );
      })}

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
  );
};

export default MessageList;
