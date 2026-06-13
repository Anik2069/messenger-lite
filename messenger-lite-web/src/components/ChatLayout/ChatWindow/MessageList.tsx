import { useEffect, useRef } from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import { Message } from '../../../types/MessageType';
import MessageItem from './MessageItem';
import { useChatStore } from '@/store/useChatStore';
import { useAuth } from '@/context/useAuth';

interface MessageListProps {
  showReactions: string | null;
  setShowReactions: (id: string | null) => void;
  onForward: (msg: Message) => void;
  onAddReaction: (id: string, emoji: string) => void;
}

const MessageList = ({
  showReactions,
  setShowReactions,
  onForward,
  onAddReaction,
}: MessageListProps) => {
  const {
    messages,
    otherUserTyping,
    hasMoreMessages,
    isLoadingMessages,
    loadMoreMessages: onLoadMoreMessages,
    selectedChat,
  } = useChatStore();
  const { user } = useAuth();
  
  const currentUserId = user?.id;
  const isGroupChat = selectedChat?.type === 'group';
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const lastMessageIdRef = useRef<string | null>(null);

  // Scroll to bottom on new messages or typing
  useEffect(() => {
    if (!messages || messages.length === 0) {
      lastMessageIdRef.current = null;
      return;
    }

    const currentLastMessageId = messages[messages.length - 1]?.id;
    const isInitialLoad = lastMessageIdRef.current === null;
    const isNewMessage = lastMessageIdRef.current !== currentLastMessageId;

    if (isInitialLoad || isNewMessage || otherUserTyping) {
      messagesEndRef.current?.scrollIntoView({ 
        behavior: isInitialLoad ? 'auto' : 'smooth' 
      });
    }

    lastMessageIdRef.current = currentLastMessageId;
  }, [messages, otherUserTyping]);

  // Handle infinite scroll / load older messages
  const handleScroll = async () => {
    const el = containerRef.current;
    if (!el) return;

    // Check if scrolled to top (with small threshold)
    if (el.scrollTop < 100 && hasMoreMessages && !isLoadingMessages) {
      const prevHeight = el.scrollHeight;
      const prevScrollTop = el.scrollTop;

      await onLoadMoreMessages();

      // Preserve scroll position after loading
      requestAnimationFrame(() => {
        const newHeight = el.scrollHeight;
        el.scrollTop = prevScrollTop + (newHeight - prevHeight);
      });
    }
  };

  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      el.addEventListener('scroll', handleScroll);
      return () => el.removeEventListener('scroll', handleScroll);
    }
  }, [hasMoreMessages, isLoadingMessages, onLoadMoreMessages]);

  // Function to get date label
  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'dd/MM/yyyy');
  };

  // Group messages by date while iterating
  let lastDateLabel = '';

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto scrollbar-none p-4 ">
      <div className="flex flex-col min-h-full justify-end space-y-2">
        {/* Loading indicator at top */}
        {isLoadingMessages && (
          <div className="text-center py-2">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 dark:border-gray-100"></div>
          </div>
        )}

        {messages?.length > 0 ? (
          messages?.map((msg) => {
            const dateLabel = getDateLabel((msg?.createdAt as string) ?? msg?.timestamp);
            const isOwnMessage =
              msg?.from?.id === currentUserId || msg?.author?.id === currentUserId;

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
          <div className="text-center text-gray-400 text-sm my-auto">No messages yet</div>
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
