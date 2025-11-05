"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, Paperclip, Send, X } from "lucide-react";
import { FileData } from "@/types/MessageType";

interface ChatInputProps {
  onSendMessage: (text: string, type?: "TEXT" | "FILE", files?: object) => void;
  onTypingStart: () => void;
  onTypingStop: () => void;
}

export default function ChatInput({
  onSendMessage,
  onTypingStart,
  onTypingStop,
}: ChatInputProps) {
  const [message, setMessage] = useState<string>("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    const filtered = files.filter(
      (f) =>
        !selectedFiles.some((sf) => sf.name === f.name && sf.size === f.size)
    );

    if (filtered.length) {
      setSelectedFiles([...selectedFiles, ...filtered]);
    }

    // Reset input so same file can be selected again
    if (fileRef.current) fileRef.current.value = "";
  };

  // Remove a file from selection
  const removeFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  // Send message handler
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    // console.log(selectedFiles.length ? "FILE" : "TEXT", "files");
    if (!message.trim() && selectedFiles.length === 0) return;

    onSendMessage(
      message.trim(),
      selectedFiles.length ? "FILE" : "TEXT",
      selectedFiles
    );

    setMessage("");
    setSelectedFiles([]);
    onTypingStop();
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3">
      {/* File preview */}
      {selectedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedFiles.map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded px-2 py-1 text-xs"
            >
              <span className="truncate max-w-[100px]">{f.name}</span>
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => removeFile(i)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Input and actions */}
      <form onSubmit={handleSend} className="flex items-center gap-3">
        <input
          ref={fileRef}
          type="file"
          multiple
          className="hidden"
          accept="image/*,video/*,.pdf,.doc,.docx"
          onChange={handleFiles}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => fileRef.current?.click()}
          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <Paperclip className="w-5 h-5" />
        </Button>

        <Input
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            e.target.value.trim() ? onTypingStart() : onTypingStop();
          }}
          placeholder="Type a message..."
          className="flex-1 border-gray-300 dark:border-gray-600"
        />

        {message.trim() || selectedFiles.length ? (
          <Button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Send className="w-4 h-4" />
          </Button>
        ) : (
          <Button type="button" className="bg-blue-500 text-white">
            <Mic className="w-4 h-4" />
          </Button>
        )}
      </form>
    </div>
  );
}
