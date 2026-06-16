'use client';

import { useEffect, useRef } from 'react';

interface LiveVoiceVisualizerProps {
  stream: MediaStream | null;
  width?: number | string;
  height?: number;
  waveColor?: string;
  barWidth?: number;
  barGap?: number;
  barRadius?: number;
  type?: 'input' | 'chat';
}

const LiveVoiceVisualizer: React.FC<LiveVoiceVisualizerProps> = ({
  stream,
  width = '100%',
  height = 40,
  waveColor,
  barWidth = 2,
  barGap = 1.5,
  barRadius = 10,
  type = 'input',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);

  const defaultWaveColor = waveColor || (type === 'input' ? '#3b82f6' : '#ffffff');

  useEffect(() => {
    if (!stream || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const AudioContextClass = window.AudioContext || (window as Record<string, any>).webkitAudioContext; // eslint-disable-line @typescript-eslint/no-explicit-any
    const audioContext = new AudioContextClass();
    audioContextRef.current = audioContext;

    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 128;
    analyser.smoothingTimeConstant = 0.7;

    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!canvasRef.current || !ctx) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const cssWidth = rect.width;
      const cssHeight = rect.height;
      const dpr = window.devicePixelRatio || 1;

      // Make canvas fully responsive
      const displayWidth = Math.round(cssWidth * dpr);
      const displayHeight = Math.round(cssHeight * dpr);

      if (canvasRef.current.width !== displayWidth || canvasRef.current.height !== displayHeight) {
        canvasRef.current.width = displayWidth;
        canvasRef.current.height = displayHeight;
        ctx.scale(dpr, dpr);
      }

      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, cssWidth, cssHeight);

      // Determine how many bars can fit
      const barsToDraw = Math.floor(cssWidth / (barWidth + barGap));
      const numBars = barsToDraw % 2 === 0 ? barsToDraw - 1 : barsToDraw;
      const actualBars = Math.min(numBars, bufferLength * 2);
      const totalWidth = actualBars * (barWidth + barGap) - barGap;
      const startX = (cssWidth - totalWidth) / 2;
      const halfBars = Math.floor(actualBars / 2);

      for (let i = 0; i < actualBars; i++) {
        const centerDist = Math.abs(i - halfBars);
        const dataIndex = Math.min(centerDist, bufferLength - 1);
        const value = dataArray[dataIndex];
        const curve = 1 - (centerDist / halfBars);
        const percent = (value / 255) * (0.3 + 0.7 * curve);
        const minHeight = barWidth;
        const barHeight = Math.max(minHeight, percent * cssHeight * 0.9);
        const x = startX + i * (barWidth + barGap);
        const y = (cssHeight - barHeight) / 2;
        ctx.fillStyle = defaultWaveColor;

        // Draw rounded rectangle
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, y, barWidth, barHeight, barRadius);
        } else {
          ctx.rect(x, y, barWidth, barHeight);
        }
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationRef.current);
      if (audioContext.state !== 'closed') {
        audioContext.close();
      }
    };
  }, [stream, defaultWaveColor, barWidth, barGap, barRadius]);

  return (
    <div className="flex items-center justify-center" style={{ width, height }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default LiveVoiceVisualizer;
