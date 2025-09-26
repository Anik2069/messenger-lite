const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "😡"];

const ReactionPicker = ({
  messageId,
  onAddReaction,
  onClose,
}: {
  messageId: string;
  onAddReaction: (id: string, emoji: string) => void;
  onClose: () => void;
}) => (
  <div className="absolute top-8 right-0 bg-white dark:bg-gray-600 border dark:border-gray-500 rounded-lg shadow-lg p-2 flex space-x-1 z-10">
    {REACTION_EMOJIS.map((emoji) => (
      <button
        key={emoji}
        onClick={() => {
          onAddReaction(messageId, emoji);
          onClose();
        }}
        className="hover:bg-gray-100 dark:hover:bg-gray-500 p-1 rounded text-lg"
      >
        {emoji}
      </button>
    ))}
  </div>
);

export default ReactionPicker;
