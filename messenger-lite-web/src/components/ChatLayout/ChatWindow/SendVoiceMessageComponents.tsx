"use client";

import React from "react";
import { CircleStop, Trash2, Send, Mic, Pause, Play } from "lucide-react";
import { useChatInputContext } from "@/context/useChatInputContext";
import { Button } from "@/components/ui/button";

interface SendVoiceMessageComponentsProps {
  onDeleteRecording?: () => void;
  onSendRecording?: () => void;
}

const SendVoiceMessageComponents = ({
  onDeleteRecording,
  onSendRecording,
}: SendVoiceMessageComponentsProps) => {
  const {
    isRecording,
    isPaused,
    recordedURL,
    seconds,
    canvasRef,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    deleteRecording,
    sendRecording,
    formatTime,
  } = useChatInputContext();

  // Use provided delete handler or fallback to context
  const handleDelete = () => {
    if (onDeleteRecording) {
      onDeleteRecording();
    } else {
      deleteRecording();
    }
  };

  const handleSend = () => {
    if (onSendRecording) {
      onSendRecording();
    } else {
      sendRecording();
    }
  };

  const handleStartOrResume = () => {
    if (isPaused) {
      resumeRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="flex items-center justify-between gap-2 w-full h-9 rounded-md border bg-gray-50 dark:bg-gray-800 px-2">
      {/* Left: Recording / Playback / Delete */}
      <div className="flex items-center gap-2 flex-1">
        {/* Delete Button - show for both recording and recorded states */}
        {(isRecording || recordedURL) && (
          <button
            onClick={handleDelete}
            className="cursor-pointer dark:text-white hover:text-red-500 transition-colors"
            title="Delete recording"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        {/* Recording Waveform */}
        {isRecording && (
          <div className="flex items-center gap-2 flex-1">
            <canvas ref={canvasRef} className="h-6 w-[300px] bg-transparent" />
            <span className="text-xs dark:text-white w-10 text-right font-medium">
              {formatTime(seconds)}
            </span>
          </div>
        )}

        {/* Audio playback after recording */}
        {recordedURL && !isRecording && (
          <div className="flex items-center gap-2 flex-1">
            <audio src={recordedURL} controls className="h-6" />
            <span className="text-xs dark:text-white w-10 text-right">
              {formatTime(seconds)}
            </span>
          </div>
        )}

        {/* Start recording button when not recording */}
        {!isRecording && !recordedURL && (
          <button
            onClick={handleStartOrResume}
            className="cursor-pointer p-1 dark:text-white hover:text-blue-500 transition-colors"
            title="Start recording"
          >
            <Mic className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Right: Recording Controls */}
      <div className="flex items-center gap-1">
        {isRecording && (
          <>
            {/* Pause/Resume Button */}
            <Button
              onClick={isPaused ? resumeRecording : pauseRecording}
              size="sm"
              variant="ghost"
              className="cursor-pointer p-0 dark:text-white hover:text-yellow-500 transition-colors"
              title={isPaused ? "Resume Recording" : "Pause Recording"}
            >
              {isPaused ? (
                <Play className="w-4 h-4" />
              ) : (
                <Pause className="w-4 h-4" />
              )}
            </Button>

            {/* Stop Recording Button */}
            <Button
              onClick={stopRecording}
              size="sm"
              variant="ghost"
              className="cursor-pointer p-0 dark:text-white hover:text-red-500 transition-colors"
              title="Stop Recording"
            >
              <CircleStop className="w-4 h-4" />
            </Button>
          </>
        )}

        {/* Send Button for recorded audio */}
        {recordedURL && !isRecording && (
          <Button
            onClick={handleSend}
            size="sm"
            variant="ghost"
            className="cursor-pointer p-0 dark:text-white hover:text-green-500 transition-colors"
            title="Send Recording"
          >
            <Send className="w-4 h-4" />
          </Button>
        )}

        {/* Start recording button when not recording (alternative position) */}
        {!isRecording && !recordedURL && (
          <Button
            onClick={handleStartOrResume}
            size="sm"
            variant="ghost"
            className="cursor-pointer p-0 dark:text-white hover:text-blue-500 transition-colors"
            title="Start recording"
          >
            <Mic className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default SendVoiceMessageComponents;
