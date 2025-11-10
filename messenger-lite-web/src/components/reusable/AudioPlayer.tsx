"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause } from "lucide-react";
import WaveSurfer from "wavesurfer.js";

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

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "#ffffff",
      progressColor: "#696969",
      height,
      barWidth: 2,
      barRadius: 2,
      cursorWidth: 0,
      // cursorColor: "#ffffff",
      normalize: true,
    });

    wavesurferRef.current = ws;
    ws.setPlaybackRate(1); // 1x normal speed

    const abortController = new AbortController();

    fetch(src, { signal: abortController.signal })
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.blob();
      })
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        ws.load(blobUrl);
      })
      .catch((err) => {
        if (err.name === "AbortError") {
          console.log("Audio load aborted (normal during unmount)");
        } else {
          console.error("Audio load error:", err);
        }
      })
      .finally(() => setIsLoading(false));

    // Update duration when ready
    ws.on("ready", () => {
      setDuration(ws.getDuration());
    });

    // Track current time as playback progresses
    ws.on("audioprocess", () => {
      setCurrentTime(ws.getCurrentTime());
    });

    // Reset when finished
    ws.on("finish", () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });

    return () => {
      abortController.abort();
      ws.destroy();
      wavesurferRef.current = null;
    };
  }, [src, height]);

  const handleToggle = () => {
    if (!wavesurferRef.current) return;
    wavesurferRef.current.playPause();
    setIsPlaying((prev) => !prev);
  };

  // ⏱ Format time nicely (e.g. 1:05)
  const formatTime = (t: number) => {
    const minutes = Math.floor(t / 60);
    const seconds = Math.floor(t % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  return (
    <div className="flex items-center gap-3 " style={{ width }}>
      <button type="button" className="cursor-pointer" onClick={handleToggle}>
        {isPlaying ? (
          <Pause className="w-4 h-4 text-white fill-white" />
        ) : (
          <Play className="w-4 h-4 text-white fill-white" />
        )}
      </button>

      <div className="flex-1" ref={containerRef} style={{ width: "100%" }} />

      {/* Time display */}
      <div className="text-xs w-8 text-right text-gray-300">
        {isPlaying ? formatTime(currentTime) : formatTime(duration)}
      </div>
    </div>
  );
};

export default AudioPlayer;
