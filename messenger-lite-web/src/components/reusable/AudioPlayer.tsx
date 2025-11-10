"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause } from "lucide-react";
import WaveSurfer from "wavesurfer.js";
import { MEDIA_HOST } from "@/constant";

interface AudioPlayerProps {
  src: string;
  width?: number | string;
  height?: number;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  src,
  width = 300,
  height = 40,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!src || !containerRef.current) return;

    // ✅ ensure no duplicate instances
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
    }

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "#ffffff",
      progressColor: "#696969",
      height,
      barWidth: 2,
      barRadius: 2,
      cursorWidth: 0,
      normalize: true,
      // responsive: true,
    });

    wavesurferRef.current = ws;

    let isUnmounted = false;

    ws.on("ready", () => {
      if (isUnmounted) return;
      setIsLoading(false);
      setDuration(ws.getDuration());
    });

    ws.on("audioprocess", () => {
      if (isUnmounted) return;
      setCurrentTime(ws.getCurrentTime());
    });

    ws.on("finish", () => {
      if (isUnmounted) return;
      setIsPlaying(false);
      setCurrentTime(0);
    });

    // ✅ load audio safely
    ws.load(src).catch((err) => {
      if (err.name !== "AbortError") {
        console.error("Audio load failed:", err);
      }
    });

    return () => {
      isUnmounted = true;
      // ✅ destroy without throwing abort error
      try {
        ws.unAll();
        ws.destroy();
      } catch {
        /* ignore destroy errors */
      }
      wavesurferRef.current = null;
    };
  }, [src, height]);

  const handleToggle = () => {
    if (!wavesurferRef.current) return;
    wavesurferRef.current.playPause();
    setIsPlaying((prev) => !prev);
  };

  const formatTime = (t: number) => {
    const minutes = Math.floor(t / 60);
    const seconds = Math.floor(t % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  return (
    <div className="flex items-center gap-3" style={{ width }}>
      <button type="button" className="cursor-pointer" onClick={handleToggle}>
        {isPlaying ? (
          <Pause className="w-4 h-4 text-white fill-white" />
        ) : (
          <Play className="w-4 h-4 text-white fill-white" />
        )}
      </button>

      <div className="flex-1" ref={containerRef} style={{ width: "100%" }} />

      <div className="text-xs w-8 text-right text-gray-300">
        {isPlaying ? formatTime(currentTime) : formatTime(duration)}
      </div>
    </div>
  );
};

export default AudioPlayer;
