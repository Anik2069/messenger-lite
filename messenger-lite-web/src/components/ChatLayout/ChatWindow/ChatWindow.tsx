import { useChatStore } from '@/store/useChatStore';
import { useState } from 'react';
import { ForwardedData } from '../../../types/MessageType';
import { User } from '../../../types/UserType';
import ChatHeader from './ChatHeader';
import ChatInput from './ChatInput';
import MessageList from './MessageList';

interface ChatWindowProps {
  currentUser: User | null;
  onSendMessage: (
    text: string,
    type?: 'TEXT' | 'FILE' | 'forwarded' | 'VOICE',
    fileData?: object,
    voiceUrl?: string | undefined,
    forwardedFrom?: ForwardedData,
    currentUser?: { username: string; id: string }
  ) => void;
  onAddReaction: (id: string, emoji: string) => void;
  onTypingStart: () => void;
  onTypingStop: () => void;
}

const ChatWindow = ({

  onSendMessage,
  onAddReaction,
  onTypingStart,
  onTypingStop,
}: ChatWindowProps) => {
  const { selectedChat } = useChatStore();
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
        showReactions={showReactions}
        setShowReactions={setShowReactions}
        onForward={(msg) =>
          onSendMessage(
            msg.message,
            'forwarded',
            undefined,
            undefined,
            {
              originalSender: msg?.from?.username || 'Unknown',
              originalTimestamp: new Date(msg.timestamp || msg.timestamp),
            },
            { username: msg?.from?.username || 'Unknown', id: msg?.from?.id }
          )
        }
        onAddReaction={onAddReaction}
      />
      <ChatInput
        // message={message}
        // setMessage={setMessage}
        onSendMessage={onSendMessage}
        onTypingStart={onTypingStart}
        onTypingStop={onTypingStop}
      />
    </div>
  );
};

export default ChatWindow;
