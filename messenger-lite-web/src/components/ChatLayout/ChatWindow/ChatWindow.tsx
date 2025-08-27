/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";
import { User } from "../../../types/UserType";
import { Chat } from "../../../types/ChatType";
import { FileData, Message } from "../../../types/MessageType";
import { Button } from "@/components/ui/button";
import {
  Download,
  FileText,
  Forward,
  MessageCircle,
  Paperclip,
  Send,
  Smile,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatFileSize, formatTime, getInitials } from "@/lib/utils";
import Image from "next/image";

interface ChatWindowProps {
  currentUser: User | null;
  selectedChat: Chat | null;
  messages: Message[];
  otherUserTyping: string | null;
  onSendMessage: (
    message: string,
    type?: "text" | "file" | "forwarded",
    fileData?: any,
    forwardedFrom?: any
  ) => void;
  onAddReaction: (messageId: string, emoji: string) => void;
  onTypingStart: () => void;
  onTypingStop: () => void;
}

const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "😡"];

const ChatWindow = ({
  currentUser,
  selectedChat,
  messages,
  otherUserTyping,
  onSendMessage,
  onAddReaction,
  onTypingStart,
  onTypingStop,
}: ChatWindowProps) => {
  const [message, setMessage] = useState("");
  const [showReactions, setShowReactions] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, otherUserTyping]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && selectedChat) {
      onTypingStop();
      console.log(message.trim(), "message");
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);

    if (e.target.value.trim() && selectedChat) {
      onTypingStart();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        onTypingStop();
      }, 2000);
    } else {
      onTypingStop();
    }
  };

  useEffect(() => {
    return () => {
      onTypingStop();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileData: FileData = {
      url: URL.createObjectURL(file),
      originalName: file.name,
      filename: file.name, // Add filename property
      size: file.size,
      mimetype: file.type,
    };

    onSendMessage(`Shared a file: ${file.name}`, "file", fileData);
    e.target.value = "";
  };

  const handleForwardMessage = (msg: Message) => {
    const forwardedFrom = {
      originalSender: msg.from,
      originalTimestamp: msg.timestamp,
    };
    onSendMessage(msg.message, "forwarded", null, forwardedFrom);
  };

  const renderFileMessage = (fileData: FileData) => {
    const isImage = fileData.mimetype.startsWith("image/");

    return (
      <div className="mt-2">
        {isImage ? (
          <div className="relative max-w-xs">
            <Image
              src={fileData.url}
              alt={fileData.originalName}
              width={200}
              height={200}
              className="rounded-lg shadow-sm"
            />
            <a
              href={fileData.url}
              download={fileData.originalName}
              className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70 transition-colors"
            >
              <Download className="w-3 h-3" />
            </a>
          </div>
        ) : (
          <div className="flex items-center space-x-3 bg-gray-100 dark:bg-gray-700 p-3 rounded-lg max-w-xs">
            <FileText className="w-8 h-8 text-blue-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {fileData.originalName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatFileSize(fileData.size)}
              </p>
            </div>
            <a
              href={fileData.url}
              download={fileData.originalName}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <Download className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>
    );
  };

  if (!selectedChat) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <h3 className="text-xl font-medium text-gray-600 dark:text-gray-400 mb-2">
            Select a conversation
          </h3>
          <p className="text-gray-500 dark:text-gray-500">
            Choose a contact or group to start messaging
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 flex items-center">
        <div
          className={`w-10 h-10 ${
            selectedChat.avatar || "bg-blue-500"
          } rounded-full flex items-center justify-center text-white mr-3`}
        >
          {selectedChat.type === "group" ? "#" : getInitials(selectedChat.name)}
        </div>
        <div>
          <h2 className="font-semibold text-gray-900 dark:text-white">
            {selectedChat.name}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {selectedChat.type === "group"
              ? "Group chat"
              : selectedChat.isOnline
              ? "Online"
              : "Offline"}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-none p-4 space-y-4">
        {messages.length === 0 && !otherUserTyping && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No messages yet. Start the conversation!
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const isOwnMessage =
            msg.from?.id === currentUser?.id ||
            msg.from?.username === currentUser?.username;

          return (
            <div
              key={msg.id}
              className={`flex ${
                isOwnMessage ? "justify-end" : "justify-start"
              }`}
            >
              <div className="max-w-xs lg:max-w-md">
                <div
                  className={`px-4 py-2 rounded-2xl relative group ${
                    isOwnMessage
                      ? "bg-blue-500 text-white rounded-br-md"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md"
                  }`}
                >
                  {selectedChat.type === "group" && !isOwnMessage && (
                    <p className="text-xs font-medium mb-1 opacity-75">
                      {msg.from.id}
                    </p>
                  )}

                  {msg.messageType === "forwarded" && (
                    <div className="text-xs opacity-75 mb-1 flex items-center">
                      <Forward className="w-3 h-3 mr-1" />
                      Forwarded from {msg.forwardedFrom?.originalSender}
                    </div>
                  )}

                  <p className="text-sm leading-relaxed">{msg.message}</p>

                  {msg.messageType === "file" &&
                    msg.fileData &&
                    renderFileMessage(msg.fileData)}

                  <div className="flex items-center justify-between mt-1">
                    <p
                      className={`text-xs ${
                        isOwnMessage
                          ? "text-blue-100"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>

                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                    <button
                      onClick={() =>
                        setShowReactions(
                          showReactions === msg.id ? null : msg.id
                        )
                      }
                      className="p-1 rounded hover:bg-black/10"
                    >
                      <Smile className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleForwardMessage(msg)}
                      className="p-1 rounded hover:bg-black/10"
                    >
                      <Forward className="w-3 h-3" />
                    </button>
                  </div>

                  {showReactions === msg.id && (
                    <div className="absolute top-8 right-0 bg-white dark:bg-gray-600 border dark:border-gray-500 rounded-lg shadow-lg p-2 flex space-x-1 z-10">
                      {REACTION_EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => {
                            onAddReaction(msg.id, emoji);
                            setShowReactions(null);
                          }}
                          className="hover:bg-gray-100 dark:hover:bg-gray-500 p-1 rounded text-lg"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {msg.reactions && msg.reactions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {Object.entries(
                      msg.reactions.reduce(
                        (acc: Record<string, string[]>, reaction) => {
                          acc[reaction.emoji] = (
                            acc[reaction.emoji] || []
                          ).concat(reaction.username);
                          return acc;
                        },
                        {}
                      )
                    ).map(([emoji, users]) => (
                      <div
                        key={emoji}
                        className="bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-1 text-xs flex items-center space-x-1"
                        title={`${users.join(", ")} reacted with ${emoji}`}
                      >
                        <span>{emoji}</span>
                        <span>{users.length}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {otherUserTyping && otherUserTyping !== currentUser?.username && (
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
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <form
          onSubmit={handleSendMessage}
          className="flex items-center space-x-3"
        >
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
            onChange={handleInputChange}
            placeholder={`Message ${selectedChat.name}...`}
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
    </div>
  );
};

export default ChatWindow;
