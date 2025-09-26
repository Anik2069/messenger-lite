import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, Send } from "lucide-react";
import { FileData } from "../../../types/MessageType";

interface ChatInputProps {
  message: string;
  setMessage: (val: string) => void;
  onSendMessage: (
    text: string,
    type?: "text" | "file",
    fileData?: FileData
  ) => void;
  onTypingStart: () => void;
  onTypingStop: () => void;
}

const ChatInput = ({
  message,
  setMessage,
  onSendMessage,
  onTypingStart,
  onTypingStop,
}: ChatInputProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileData: FileData = {
      url: URL.createObjectURL(file),
      originalName: file.name,
      filename: file.name,
      size: file.size,
      mimetype: file.type,
    };

    onSendMessage(`Shared a file: ${file.name}`, "file", fileData);
    e.target.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    onTypingStop();
    onSendMessage(message.trim(), "text");
    setMessage("");
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
      <form onSubmit={handleSubmit} className="flex items-center space-x-3">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.txt,.zip,.mp3,.mp4"
        />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <Paperclip className="w-5 h-5" />
        </Button>

        <Input
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);

            if (e.target.value.trim()) {
              onTypingStart();
            } else {
              onTypingStop();
            }
          }}
          placeholder="Type a message..."
          className="flex-1 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
        />

        <Button
          type="submit"
          disabled={!message.trim()}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};

export default ChatInput;
