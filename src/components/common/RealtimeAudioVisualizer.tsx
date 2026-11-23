import React, { useEffect, useRef } from 'react';

interface RealtimeAudioVisualizerProps {
  isPlaying: boolean;
  audioElement?: HTMLAudioElement | null;
  barColor?: string;
  barCount?: number;
  height?: number;
  className?: string;
}

export const RealtimeAudioVisualizer: React.FC<RealtimeAudioVisualizerProps> = ({
  isPlaying,
  audioElement,
  barColor = '#06B6D4',
  barCount = 36,
  height = 54,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  // Initialize Web Audio API node when audio element is provided
  useEffect(() => {
    if (!audioElement) return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }

      const ctx = audioContextRef.current;
      if (!analyserRef.current) {
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 128;
        analyserRef.current = analyser;
      }

      if (!sourceRef.current) {
        try {
          const source = ctx.createMediaElementSource(audioElement);
          source.connect(analyserRef.current);
          analyserRef.current.connect(ctx.destination);
          sourceRef.current = source;
        } catch (e) {
          // May already be connected
        }
      }

      if (ctx.state === 'suspended' && isPlaying) {
        ctx.resume();
      }
    } catch (err) {
      console.warn('[Visualizer] Web Audio setup fallback:', err);
    }

    return () => {
      // Don't close AudioContext completely so it can be reused smoothly
    };
  }, [audioElement, isPlaying]);

  // Main rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dataArray = new Uint8Array(barCount);
    let phase = 0;

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);
      const width = canvas.width;
      const canvasHeight = canvas.height;
      ctx.clearRect(0, 0, width, canvasHeight);

      if (isPlaying && analyserRef.current) {
        try {
          analyserRef.current.getByteFrequencyData(dataArray);
        } catch (e) {}
      } else if (isPlaying) {
        // Fallback synthetic wave when analyser isn't attached
        phase += 0.15;
        for (let i = 0; i < barCount; i++) {
          const sinVal = Math.sin(phase + (i / barCount) * Math.PI * 2);
          dataArray[i] = Math.max(20, Math.floor(128 + sinVal * 90 + Math.random() * 30));
        }
      } else {
        // Resting wave
        for (let i = 0; i < barCount; i++) {
          dataArray[i] = 12;
        }
      }

      const barWidth = (width / barCount) * 0.7;
      const gap = (width - barWidth * barCount) / (barCount - 1);

      for (let i = 0; i < barCount; i++) {
        const x = i * (barWidth + gap);
        const percent = isPlaying ? dataArray[i] / 255 : 0.08;
        const currentBarHeight = Math.max(3, percent * (canvasHeight - 6));
        const y = (canvasHeight - currentBarHeight) / 2;

        // Gradient for bars
        const grad = ctx.createLinearGradient(0, y, 0, y + currentBarHeight);
        if (isPlaying) {
          grad.addColorStop(0, '#22D3EE');
          grad.addColorStop(1, '#06B6D4');
        } else {
          grad.addColorStop(0, 'rgba(100, 116, 139, 0.4)');
          grad.addColorStop(1, 'rgba(71, 85, 105, 0.2)');
        }

        ctx.fillStyle = grad;
        ctx.beginPath();
        // Rounded pills
        const radius = Math.min(barWidth / 2, 3);
        ctx.roundRect(x, y, barWidth, currentBarHeight, radius);
        ctx.fill();
      }
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, barColor, barCount]);

  return (
    <div className={`relative flex items-center justify-center overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        width={360}
        height={height}
        className="w-full h-full block"
      />
    </div>
  );
};
