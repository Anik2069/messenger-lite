"use client";

import React, { useRef, useState, useEffect } from "react";
import { CircleStop, Mic, Trash2, Send } from "lucide-react";

const VoiceMessageTest = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedURL, setRecordedURL] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const mediaStream = useRef<MediaStream | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chunks = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const animationRef = useRef<number | null>(null);

  // Store waveform data for scrolling effect
  const waveformData = useRef<number[]>([]);
  const maxDataPoints = 100; // Number of data points to show

  // Timer effect
  useEffect(() => {
    if (isRecording) {
      timerRef.current = window.setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRecording]);

  // Canvas visualization effect
  useEffect(() => {
    if (!canvasRef.current || !isRecording) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fixed dimensions
    const width = 300;
    const height = 60;
    canvas.width = width;
    canvas.height = height;

    const drawWaveform = () => {
      if (!analyser.current || !isRecording) return;

      const bufferLength = analyser.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.current.getByteFrequencyData(dataArray);

      // Calculate average volume
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength;
      const normalizedVolume = average / 255;

      // Add new data point (0 if no sound, normalized volume if sound)
      const newDataPoint = normalizedVolume > 0.01 ? normalizedVolume : 0;
      waveformData.current.push(newDataPoint);

      // Keep only the last maxDataPoints
      if (waveformData.current.length > maxDataPoints) {
        waveformData.current.shift();
      }

      ctx.clearRect(0, 0, width, height);

      // Draw background
      ctx.fillStyle = "#1f2937";
      ctx.fillRect(0, 0, width, height);

      // Draw waveform from right to left
      const barWidth = width / maxDataPoints;
      const maxBarHeight = height * 1.5;

      ctx.fillStyle = "#1877F2"; // Facebook blue

      for (let i = 0; i < waveformData.current.length; i++) {
        const data = waveformData.current[i];

        // Only draw bars if there's sound (data > 0)
        if (data > 0) {
          const barHeight = data * maxBarHeight;
          const x = i * barWidth;
          const y = (height - barHeight) / 2;

          // Draw rounded bar
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth - 1, barHeight, 1);
          ctx.fill();
        }
      }

      // Draw center line
      ctx.strokeStyle = "#374151";
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      animationRef.current = requestAnimationFrame(drawWaveform);
    };

    // Reset waveform data when starting recording
    waveformData.current = [];
    drawWaveform();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    if (
      typeof window === "undefined" ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      alert("Your browser does not support audio recording.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStream.current = stream;

      // Setup audio analysis for visualization
      audioContext.current = new AudioContext();
      analyser.current = audioContext.current.createAnalyser();
      const source = audioContext.current.createMediaStreamSource(stream);
      source.connect(analyser.current);

      analyser.current.fftSize = 256;
      analyser.current.smoothingTimeConstant = 0.6;

      const recorder = new MediaRecorder(stream);
      mediaRecorder.current = recorder;
      chunks.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setRecordedURL(url);
        chunks.current = [];
      };

      recorder.start();
      setIsRecording(true);
      setSeconds(0);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Cannot access microphone. Please check your permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
      mediaRecorder.current.stop();
    }
    if (mediaStream.current) {
      mediaStream.current.getTracks().forEach((track) => track.stop());
    }
    if (audioContext.current) {
      audioContext.current.close();
    }
    setIsRecording(false);
  };

  const deleteRecording = () => {
    setRecordedURL(null);
    setSeconds(0);
  };

  const sendRecording = () => {
    if (recordedURL) {
      console.log("Sending recording:", recordedURL);
      alert("Voice message sent!");
      setRecordedURL(null);
      setSeconds(0);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(
      2,
      "0"
    )}`;
  };

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center gap-6 bg-gray-900 p-4">
      {/* Timer Display */}
      <div className="text-white text-6xl font-mono mb-8">
        {formatTime(seconds)}
      </div>

      {/* Main Recording UI */}
      <div className="flex flex-col items-center gap-8 w-full max-w-md">
        {/* Fixed-width Audio Visualization */}
        {isRecording && (
          <div className="w-full bg-gray-800 rounded-2xl p-6">
            <div className="flex justify-center">
              <div className="w-[300px] h-[60px] bg-gray-700 rounded-lg overflow-hidden">
                <canvas ref={canvasRef} className="w-full h-full" />
              </div>
            </div>
            <div className="text-center text-gray-400 mt-4 text-sm">
              Recording...{" "}
              {waveformData.current.some((val) => val > 0)
                ? "Sound detected"
                : "No sound"}
            </div>
          </div>
        )}

        {/* Recording Controls */}
        {!isRecording && !recordedURL && (
          <button
            onClick={startRecording}
            className="flex items-center justify-center w-20 h-20 bg-green-500 rounded-full text-white hover:bg-green-600 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Mic className="w-8 h-8" />
          </button>
        )}

        {isRecording && (
          <div className="flex items-center gap-6">
            <button
              onClick={stopRecording}
              className="flex items-center justify-center w-16 h-16 bg-red-500 rounded-full text-white hover:bg-red-600 transition-all duration-200 shadow-lg"
            >
              <CircleStop className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* Playback Controls */}
        {recordedURL && (
          <div className="w-full bg-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <button
                  onClick={deleteRecording}
                  className="flex items-center justify-center w-12 h-12 bg-gray-600 rounded-full text-white hover:bg-gray-700 transition"
                >
                  <Trash2 className="w-5 h-5" />
                </button>

                <div className="flex-1">
                  <audio className="w-full" controls src={recordedURL} />
                </div>

                <button
                  onClick={sendRecording}
                  className="flex items-center justify-center w-12 h-12 bg-green-500 rounded-full text-white hover:bg-green-600 transition"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Instruction Text */}
        {!isRecording && !recordedURL && (
          <div className="text-gray-400 text-center text-sm">
            Tap to record voice message
          </div>
        )}
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-4">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <div className="flex-1 bg-gray-700 rounded-3xl px-4 py-2 text-gray-400">
            Type a message...
          </div>
          <button className="flex items-center justify-center w-10 h-10 bg-green-500 rounded-full text-white">
            <Mic className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceMessageTest;
