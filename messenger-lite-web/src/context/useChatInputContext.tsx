import { createContext, ReactNode, useContext, useState } from "react";

interface ChatInputContextType {
  isRecording: boolean;
  setIsRecording: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChatInputContext = createContext<ChatInputContextType | null>(null);

export const ChatInputContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [isRecording, setIsRecording] = useState(false);

  return (
    <ChatInputContext.Provider
      value={{
        isRecording,
        setIsRecording,
      }}
    >
      {children}
    </ChatInputContext.Provider>
  );
};

export const useChatInputContext = () => {
  const context = useContext(ChatInputContext);
  if (!context) {
    throw new Error(
      "useChatInputContext must be used within ChatInputContextProvider"
    );
  }
  return context;
};
