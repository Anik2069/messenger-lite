let typingTimeout: NodeJS.Timeout | null = null;

export const startTyping = (
  setTyping: (username: string | null) => void,
  username: string
) => {
  setTyping(username);

  if (typingTimeout) {
    clearTimeout(typingTimeout);
    typingTimeout = null;
  }

  const typingDuration = 1500 + Math.random() * 1500;
  typingTimeout = setTimeout(() => {
    setTyping(null);
    typingTimeout = null;
  }, typingDuration);
};

export const stopTyping = (setTyping: (username: string | null) => void) => {
  setTyping(null);
  if (typingTimeout) {
    clearTimeout(typingTimeout);
    typingTimeout = null;
  }
};

export const cleanupTyping = () => {
  if (typingTimeout) {
    clearTimeout(typingTimeout);
    typingTimeout = null;
  }
};
