import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

interface ChatInputContextType {
  isRecording: boolean;
  setIsRecording: React.Dispatch<React.SetStateAction<boolean>>;
  isPaused: boolean;
  setIsPaused: React.Dispatch<React.SetStateAction<boolean>>;
  recordedURL: string | null;
  setRecordedURL: React.Dispatch<React.SetStateAction<string | null>>;
  seconds: number;
  setSeconds: React.Dispatch<React.SetStateAction<number>>;
  mediaRecorder: React.MutableRefObject<MediaRecorder | null>;
  mediaStream: React.MutableRefObject<MediaStream | null>;
  audioContext: React.MutableRefObject<AudioContext | null>;
  analyser: React.MutableRefObject<AnalyserNode | null>;
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
  chunks: React.MutableRefObject<Blob[]>;
  timerRef: React.MutableRefObject<number | null>;
  animationRef: React.MutableRefObject<number | null>;
  waveformData: React.MutableRefObject<number[]>;
  maxDataPoints: number;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  deleteRecording: () => void;
  sendRecording: () => void;
  formatTime: (totalSeconds: number) => string;
}

const ChatInputContext = createContext<ChatInputContextType | null>(null);

export const ChatInputContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedURL, setRecordedURL] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const mediaStream = useRef<MediaStream | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const animationRef = useRef<number | null>(null);

  // Store waveform data for scrolling effect
  const waveformData = useRef<number[]>([]);
  const maxDataPoints = 100;

  // Timer effect
  useEffect(() => {
    if (isRecording && !isPaused) {
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
  }, [isRecording, isPaused]);

  // Canvas visualization effect
  // useEffect(() => {
  //   if (!canvasRef.current || !isRecording || isPaused) return;

  //   const canvas = canvasRef.current;
  //   const ctx = canvas.getContext("2d");
  //   if (!ctx) return;

  //   // Fixed dimensions
  //   const width = 300;
  //   const height = 60;
  //   canvas.width = width;
  //   canvas.height = height;

  //   const drawWaveform = () => {
  //     if (!analyser.current || !isRecording || isPaused) return;

  //     const bufferLength = analyser.current.frequencyBinCount;
  //     const dataArray = new Uint8Array(bufferLength);
  //     analyser.current.getByteFrequencyData(dataArray);

  //     // Calculate average volume
  //     let sum = 0;
  //     for (let i = 0; i < bufferLength; i++) {
  //       sum += dataArray[i];
  //     }
  //     const average = sum / bufferLength;
  //     const normalizedVolume = average / 255;

  //     // Add new data point (0 if no sound, normalized volume if sound)
  //     const newDataPoint = normalizedVolume > 0.01 ? normalizedVolume : 0;
  //     waveformData.current.push(newDataPoint);

  //     // Keep only the last maxDataPoints
  //     if (waveformData.current.length > maxDataPoints) {
  //       waveformData.current.shift();
  //     }

  //     ctx.clearRect(0, 0, width, height);

  //     // Draw background
  //     ctx.fillStyle = "#";
  //     ctx.fillRect(0, 0, width, height);

  //     // Draw waveform from right to left
  //     const barWidth = width / maxDataPoints;
  //     const maxBarHeight = height * 2;

  //     ctx.fillStyle = "#1877F2";

  //     for (let i = 0; i < waveformData.current.length; i++) {
  //       const data = waveformData.current[i];

  //       // Only draw bars if there's sound (data > 0)
  //       if (data > 0) {
  //         const barHeight = data * maxBarHeight;
  //         const x = i * barWidth;
  //         const y = (height - barHeight) / 2;

  //         // Draw rounded bar
  //         ctx.beginPath();
  //         ctx.roundRect(x, y, barWidth - 1, barHeight, 1);
  //         ctx.fill();
  //       }
  //     }

  //     // Draw center line
  //     ctx.strokeStyle = "#374151";
  //     ctx.setLineDash([2, 2]);
  //     ctx.beginPath();
  //     ctx.moveTo(0, height / 2);
  //     ctx.lineTo(width, height / 2);
  //     ctx.stroke();
  //     ctx.setLineDash([]);

  //     animationRef.current = requestAnimationFrame(drawWaveform);
  //   };

  //   // Reset waveform data when starting recording
  //   if (!isPaused) {
  //     waveformData.current = [];
  //   }
  //   drawWaveform();

  //   return () => {
  //     if (animationRef.current) {
  //       cancelAnimationFrame(animationRef.current);
  //     }
  //   };
  // }, [isRecording, isPaused]);

  // Canvas visualization effect
  useEffect(() => {
    if (!canvasRef.current || !isRecording || isPaused) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fixed dimensions
    const width = 300;
    const height = 60;
    canvas.width = width;
    canvas.height = height;

    const drawWaveform = () => {
      if (!analyser.current || !isRecording || isPaused) return;

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

      // Clear with transparent background
      ctx.clearRect(0, 0, width, height);

      // Draw waveform from right to left
      const barWidth = width / maxDataPoints;
      const maxBarHeight = height * 2;

      for (let i = 0; i < waveformData.current.length; i++) {
        const data = waveformData.current[i];

        // Only draw if there's sound (data > 0)
        if (data > 0) {
          // Draw blue bars for sound
          const barHeight = data * maxBarHeight;
          const x = i * barWidth;
          const y = (height - barHeight) / 2;

          ctx.fillStyle = "#1877F2"; // Blue color
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth - 1, barHeight, 1);
          ctx.fill();
        } else {
          // Draw gray dots for silence
          const x = i * barWidth + barWidth / 2;
          const y = height / 2;
          const dotRadius = 1;

          ctx.fillStyle = "#9CA3AF"; // Gray color
          ctx.beginPath();
          ctx.arc(x, y, dotRadius, 0, 2 * Math.PI);
          ctx.fill();
        }
      }

      // Draw center line (optional - remove if you don't want it)
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
    if (!isPaused) {
      waveformData.current = [];
    }
    drawWaveform();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRecording, isPaused]);
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
      setIsPaused(false);
      setSeconds(0);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Cannot access microphone. Please check your permissions.");
    }
  };

  const pauseRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === "recording") {
      mediaRecorder.current.pause();
      setIsPaused(true);

      // Pause audio context for visualization
      if (audioContext.current) {
        audioContext.current.suspend();
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === "paused") {
      mediaRecorder.current.resume();
      setIsPaused(false);

      // Resume audio context for visualization
      if (audioContext.current) {
        audioContext.current.resume();
      }
    }
  };

  const stopRecording = async () => {
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
    setIsPaused(false);
  };

  const deleteRecording = () => {
    if (recordedURL) {
      URL.revokeObjectURL(recordedURL);
    }
    setRecordedURL(null);
    setSeconds(0);
    setIsRecording(false);
    setIsPaused(false);
  };

  const sendRecording = () => {
    if (recordedURL) {
      console.log("Sending recording:", recordedURL);
      // You can implement the actual sending logic here
      setRecordedURL(null);
      setSeconds(0);
      setIsRecording(false);
      setIsPaused(false);
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
    <ChatInputContext.Provider
      value={{
        isRecording,
        setIsRecording,
        isPaused,
        setIsPaused,
        recordedURL,
        setRecordedURL,
        seconds,
        setSeconds,
        mediaRecorder,
        mediaStream,
        audioContext,
        analyser,
        canvasRef,
        chunks,
        timerRef,
        animationRef,
        waveformData,
        maxDataPoints,
        startRecording,
        stopRecording,
        pauseRecording,
        resumeRecording,
        deleteRecording,
        sendRecording,
        formatTime,
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
