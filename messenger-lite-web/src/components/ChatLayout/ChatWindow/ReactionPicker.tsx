const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '😡'];

interface ReactionPickerProps {
  isOwnMessage: boolean;
  messageId: string;
  onAddReaction: (id: string, emoji: string) => void;
  onClose: () => void;
}

const ReactionPicker = ({
  isOwnMessage,
  messageId,
  onAddReaction,
  onClose,
}: ReactionPickerProps) => {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`absolute -top-8 ${
        isOwnMessage ? '-left-15' : '-right-15'
      } bg-white dark:bg-gray-700 border dark:border-gray-500 rounded-lg shadow-lg p-1 flex  z-50`}
    >
      {REACTION_EMOJIS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => {
            onAddReaction(messageId, emoji);
            onClose();
          }}
          className="rounded-lg text-md transition-transform duration-150 ease-out hover:scale-125 active:scale-110"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};

export default ReactionPicker;
