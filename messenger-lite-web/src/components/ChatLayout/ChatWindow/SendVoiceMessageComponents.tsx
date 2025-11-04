"use client";

import React from "react";
import { CircleStop, Trash2, Send, Mic } from "lucide-react";
import { useChatInputContext } from "@/context/useChatInputContext";
import { Button } from "@/components/ui/button";

interface SendVoiceMessageComponentsProps {
  onDeleteRecording?: () => void;
}

const SendVoiceMessageComponents = ({
  onDeleteRecording,
}: SendVoiceMessageComponentsProps) => {
  const {
    isRecording,
    recordedURL,
    seconds,
    canvasRef,
    stopRecording,
    formatTime,
  } = useChatInputContext();

  // Use provided delete handler or fallback to context
  const handleDelete = () => {
    if (onDeleteRecording) {
      onDeleteRecording();
    }
  };

  return (
    <div className="flex items-center justify-end gap-2 w-full h-9 rounded-md border bg-gray-50 dark:bg-gray-800 px-2">
      {/* Left: Recording / Playback / Delete */}
      <div className="flex items-center gap-2 ">
        {/* Delete Button - show for both recording and recorded states */}
        {(isRecording || recordedURL) && (
          <button
            onClick={handleDelete}
            className="text-gray-500 hover:text-red-500 transition-colors"
            title="Delete recording"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        {/* Recording Waveform */}
        {isRecording && (
          <div className="flex items-center gap-2 flex-1 ">
            <canvas ref={canvasRef} className="h-6 w-[300px]" />
            <span className="text-xs text-gray-500 w-10 text-right font-medium">
              {formatTime(seconds)}
            </span>
          </div>
        )}

        {/* Audio playback after recording */}
        {recordedURL && !isRecording && (
          <div className="flex items-center gap-2 flex-1">
            <audio src={recordedURL} controls className="h-6 " />
            <span className="text-xs text-gray-500 w-10 text-right">
              {formatTime(seconds)}
            </span>
          </div>
        )}
      </div>

      {/* Right: Stop Recording Button */}
      <div className="flex items-center gap-1">
        {isRecording && (
          <Button
            onClick={stopRecording}
            size="sm"
            className="h-7 w-7 bg-red-500 hover:bg-red-600 text-white p-0 transition-colors"
            title="Stop Recording"
          >
            <CircleStop className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default SendVoiceMessageComponents;
