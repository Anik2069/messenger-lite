import { Forward, PhoneIncoming, PhoneOutgoing, Smile } from 'lucide-react';
import { FileData, formatLocalTime, Message } from '../../../types/MessageType';
import FileMessage from './FileMessage';
import ReactionPicker from './ReactionPicker';

const formatCallDuration = (duration: number) => {
  if (duration <= 0) return '';

  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = duration % 60;

  if (hours > 0) {
    // Don't show seconds when duration is 1 hour+
    return `${hours} hour${hours > 1 ? 's' : ''}${minutes > 0 ? ` ${minutes} min` : ''
      }`;
  }

  if (minutes > 0) {
    return `${minutes} min${seconds > 0 ? ` ${seconds} sec` : ''}`;
  }

  return `${seconds} sec`;
};

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
  onAddReaction,
}: MessageItemProps) => {

  console.log(msg)

  /** Header for group messages */
  const renderMessageHeader = () =>
    isGroupChat && !isOwnMessage ? (
      <p className="text-xs font-medium  opacity-75">{msg.from?.username ? msg.from.username : msg.author?.username ? msg.author.username : "Unknown"}</p>
    ) : null;

  /** Forwarded message header */
  const renderForwardedHeader = () =>
    msg.messageType === 'forwarded' && msg.forwardedFrom?.originalSender ? (
      <div className="text-xs opacity-75 mb-1 flex items-center">
        <Forward className="w-3 h-3 mr-1" />
        Forwarded from {msg.forwardedFrom.originalSender}
      </div>
    ) : null;

  /** Message content including file messages */
  const renderMessageContent = () => {
    let file: FileData | null = null;

    if (msg.messageType === 'FILE' || msg.messageType === 'VOICE') {
      // Prefer frontend optimistic fileData, fallback to backend fields
      if (msg.fileData) {
        file = msg.fileData as FileData;
      } else if (msg.fileUrl && msg.fileName && msg.fileMime && msg.fileSize) {
        file = {
          url: msg.fileUrl,
          filename: msg.fileName,
          originalName: msg.fileName,
          mimetype: msg.fileMime,
          size: msg.fileSize,
        };
      }
    }

    const isAudio = file?.mimetype?.startsWith('audio/');

    if (msg.messageType === 'CALL') {
      const callData = msg.callLog;
      if (!callData) {
        return <div className="text-sm italic">Call log unavailable</div>;
      }

      const isMissed = callData.status === 'missed';
      const isVideo = callData.callType === 'video';

      let CallIcon = isOwnMessage ? PhoneOutgoing : PhoneIncoming;
      if (isMissed) CallIcon = isOwnMessage ? PhoneOutgoing : PhoneIncoming;

      const durationText = formatCallDuration(callData.duration);

      const callText = isMissed
        ? (isOwnMessage ? 'No answer' : 'You missed a call')
        : durationText
          ? `${durationText}`
          : '';

      let participantsDetail = null;
      if (callData.isGroupCall && callData.participants && callData.participants.length > 0) {
        const missedUsers = callData.participants.filter(p => p.status === 'missed' && p.user?.username).map(p => p.user?.username);
        const joinedUsers = callData.participants.filter(p => p.status === 'joined' && p.user?.username).map(p => p.user?.username);

        participantsDetail = (
          <div className="text-xs opacity-75 mt-1 max-w-[200px]">
            {joinedUsers.length > 0 && <div>Joined: {joinedUsers.join(', ')}</div>}
            {missedUsers.length > 0 && <div>Missed: {missedUsers.join(', ')}</div>}
          </div>
        );
      }

      return (
        <div className="flex items-center gap-2 pr-4">
          <div className={`p-2 rounded-full ${isMissed ? isOwnMessage ? 'bg-gray-500/50 text-white' : 'bg-gray-500/50 text-red-500' : isOwnMessage ? 'bg-gray-500/50 text-white' : 'bg-gray-500/50 text-gray-300'}`}>
            <CallIcon className="w-3 h-3" />
          </div>
          <div className="flex flex-col ">
            <span className="text-xs font-medium">{isVideo ? "Video " : "Voice "}Call</span>
            <span className="text-xs ">{callText}</span>
            {/* {participantsDetail} */}
          </div>
          <div className="w-6 h-2.5 invisible"></div>
        </div>
      );
    }

    return (
      <>
        {file ? (
          <div className="flex flex-col gap-1">
            <FileMessage file={file} />
            {/* Show text only if file is NOT audio and message is different from filename */}
            {isAudio ? (
              <div className="w-14 h-2.5 invisible"></div>
            ) : (
              !isAudio &&
              msg.message &&
              msg.message !== file.filename && (
                <div className="flex flex-wrap">
                  <div className="text-sm leading-relaxed">{msg.message}</div>
                  <div className="w-14 h-2.5 invisible"></div>
                </div>
              )
            )}
          </div>
        ) : (
          <div className="flex flex-wrap">
            <div className="text-sm leading-relaxed">{msg.message}</div>
            <div className="w-14 h-2.5 invisible"></div>
          </div>
        )}
      </>
    );
  };

  /** Message timestamp */
  const renderMessageTime = () => (
    <p
      className={`text-[11px] whitespace-nowrap ${isOwnMessage ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
        }`}
    >
      {formatLocalTime(msg.createdAt ? new Date(msg.createdAt) : msg.timestamp)}
    </p>
  );

  /** Action buttons (reactions, forwarding) */
  const renderMessageActions = () => (
    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
      {/* <button
        onClick={() =>
          setShowReactions(showReactions === msg.id ? null : msg.id)
        }
        className="p-1 rounded hover:bg-black/10"
        aria-label="Add reaction"
      >
        <Smile className="w-3 h-3" />
      </button> */}
      {/* Uncomment if forward functionality needed */}
      {/* <button
        onClick={() => onForward(msg)}
        className="p-1 rounded hover:bg-black/10"
        aria-label="Forward message"
      >
        <Forward className="w-3 h-3" />
      </button> */}
      {/* <button
        // onClick={() =>
        //   setShowReactions(showReactions === msg.id ? null : msg.id)
        // }
        className="p-1 rounded hover:bg-black/10"
        aria-label="options"
      >
        <ChevronDown className="w-3 h-3" />
      </button> */}
    </div>
  );

  /** Render reactions below message */
  const renderReactions = () => {
    if (!msg.reactions?.length) return null;

    const reactionGroups = msg.reactions.reduce<Record<string, string[]>>((acc, r) => {
      acc[r.emoji] = (acc[r.emoji] || []).concat(r.username);
      return acc;
    }, {});

    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {Object.entries(reactionGroups).map(([emoji, users]) => (
          <div
            key={emoji}
            className="text-xs flex items-center space-x-1"
            title={`${users.join(', ')} reacted with ${emoji}`}
          >
            <span>{emoji}</span>
            {users.length > 1 && <span>{users.length}</span>}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`flex  group ${isOwnMessage ? 'justify-end ' : 'justify-start '}`}>
      <div className="flex flex-col">
        <div className={`flex items-center ${isOwnMessage ? ' ' : 'flex-row-reverse'} `}>
          <div className="relative">
            <button
              onClick={() => setShowReactions(showReactions === msg.id ? null : msg.id)}
              className="cursor-pointer p-1 rounded opacity-0 scale-90 transform transition-all duration-200 ease-out group-hover:opacity-100 group-hover:scale-100"
              aria-label="Add reaction"
            >
              <Smile className="w-3 h-3" />
            </button>
            {showReactions === msg.id && (
              <ReactionPicker
                isOwnMessage={isOwnMessage}
                messageId={msg.id}
                onAddReaction={onAddReaction}
                onClose={() => setShowReactions(null)}
              />
            )}
          </div>

          <div className="max-w-xs lg:max-w-lg">
            <div
              className={`flex gap-2 items-end px-3 py-2 rounded-lg relative group ${isOwnMessage
                ? 'bg-blue-500 text-white rounded-br-xs'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-xs'
                }`}
            >
              <div className="">
                <div className="-mb-1">
                  {renderMessageHeader()}
                  {renderForwardedHeader()}
                </div>
                {renderMessageContent()}
              </div>

              <div className="absolute -bottom-1.5 right-1.5 text-white text-sm text-right py-2">
                {renderMessageTime()}
              </div>
              {renderMessageActions()}
            </div>
          </div>
        </div>
        <div className={` ${isOwnMessage ? 'ms-5' : ''}`}>{renderReactions()}</div>
      </div>
    </div>
  );
};

export default MessageItem;
