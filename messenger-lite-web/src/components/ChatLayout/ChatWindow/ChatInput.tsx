"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, Paperclip, Send, X } from "lucide-react";
import { FileData, ForwardedData } from "@/types/MessageType";
import Modal from "@/components/reusable/Modal";
import { useModal } from "@/hooks/useModal";
import VoiceMessageTest from "./Audio/VoiceMessageTest";
import { useChatInputContext } from "@/context/useChatInputContext";
import SendVoiceMessageComponents from "./SendVoiceMessageComponents";
import FileMessage from "./FileMessage";
import UniversalFilePreview from "@/components/reusable/UniversalFilePreview";
import { toast } from "react-toastify";

interface ChatInputProps {
  onSendMessage: (
    text: string,
    type?: "TEXT" | "FILE" | "forwarded" | "VOICE",
    fileData?: object,
    voiceUrl?: string,
    forwardedFrom?: ForwardedData
  ) => void;
  onTypingStart: () => void;
  onTypingStop: () => void;
}

export default function ChatInput({
  onSendMessage,
  onTypingStart,
  onTypingStop,
}: ChatInputProps) {
  const {
    isRecording,
    recordedURL,
    startRecording,
    stopRecording,
    deleteRecording,
    setRecordedURL,
  } = useChatInputContext();

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
    if (files.length > 5) {
      toast.error("You can upload a maximum of 5 files.");
      e.target.value = ""; // clear input
      return;
    }

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

    if (!message.trim() && selectedFiles.length === 0 && !recordedURL) return;

    // If we have a voice recording, send it
    if (recordedURL) {
      onSendMessage(
        "Voice message", // or you can keep this empty
        "VOICE",
        undefined,
        recordedURL
      );
      setRecordedURL(null);
    }
    // If we have text or files, send them
    else if (message.trim() || selectedFiles.length > 0) {
      onSendMessage(
        message.trim(),
        selectedFiles.length ? "FILE" : "TEXT",
        selectedFiles
      );
    }

    setMessage("");
    setSelectedFiles([]);
    onTypingStop();
  };

  // Handle mic button click
  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else if (recordedURL) {
      // If we have a recorded URL, delete it and start fresh
      deleteRecording();
      startRecording();
    } else {
      // Start fresh recording
      startRecording();
    }
  };

  // Handle delete recording
  const handleDeleteRecording = () => {
    deleteRecording();
  };

  console.log(selectedFiles);

  // Show voice components when recording OR when we have a recorded URL
  const showVoiceComponents = isRecording || recordedURL;

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3">
      {/* File preview - only show when not in voice mode */}
      {!showVoiceComponents && selectedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 max-h-[00px] lg:max-h-[300px] overflow-y-scroll scrollbar-none">
          {selectedFiles.map((f, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded px-2 py-1 text-xs "
            >
              <div className="">
                {/* <FileMessage file={f} /> */}
                <UniversalFilePreview key={i} file={f} />
              </div>
              <div className="flex items-center gap-1">
                <span className="truncate max-w-[100px]">{f.name}</span>
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeFile(i)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Input and actions */}
      <form onSubmit={handleSend} className="flex items-center gap-3">
        {/* File input - only show when not in voice mode */}
        {!showVoiceComponents && (
          <input
            ref={fileRef}
            type="file"
            multiple
            className="hidden"
            accept="image/*,video/*,.pdf,.doc,.docx"
            onChange={handleFiles}
          />
        )}

        {/* Paperclip button - only show when not in voice mode */}
        {!showVoiceComponents && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => fileRef.current?.click()}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <Paperclip className="w-5 h-5" />
          </Button>
        )}

        {/* Voice recording components */}
        {showVoiceComponents && (
          <div className="flex-1">
            <SendVoiceMessageComponents
              onDeleteRecording={handleDeleteRecording}
            />
          </div>
        )}

        {/* Text input - only show when not in voice mode */}
        {!showVoiceComponents && (
          <Input
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              e.target.value.trim() ? onTypingStart() : onTypingStop();
            }}
            placeholder="Type a message..."
            className="flex-1 border-gray-300 dark:border-gray-600"
          />
        )}

        {/* Send/Mic Button */}
        {message.trim() || selectedFiles.length > 0 || recordedURL ? (
          <Button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Send className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={handleMicClick}
            type="button"
            className={`${
              isRecording
                ? "bg-red-500 hover:bg-red-600"
                : "bg-blue-500 hover:bg-blue-600"
            } text-white`}
          >
            <Mic className="w-4 h-4" />
          </Button>
        )}
      </form>
    </div>
  );
}
