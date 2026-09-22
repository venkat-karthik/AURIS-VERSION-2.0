import React, { useRef, useEffect, useState } from 'react';
import { Sparkles, Activity, Volume2, Rotate3d, Compass } from 'lucide-react';

interface Interactive3DOrbProps {
  className?: string;
  size?: number;
  interactive?: boolean;
  activeStatusText?: string;
}

export const Interactive3DOrb: React.FC<Interactive3DOrbProps> = ({
  className = '',
  size = 320,
  interactive = true,
  activeStatusText = 'OmniDimension Neural Acoustic Matrix',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [audioLevel, setAudioLevel] = useState(65);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [particleMode, setParticleMode] = useState<'neural' | 'acoustic' | 'quantum'>('neural');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let angleX = 0.3;
    let angleY = 0.4;
    let targetAngleX = 0.3;
    let targetAngleY = 0.4;
    let isDragging = false;
    let lastMouseX = 0;
    let lastMouseY = 0;
    let time = 0;

    // Generate 3D point cloud on concentric spheres
    const numPoints = 280;
    const points: { x: number; y: number; z: number; ring: number; colorPhase: number; size: number }[] = [];

    for (let i = 0; i < numPoints; i++) {
      const phi = Math.acos(-1 + (2 * i) / numPoints);
      const theta = Math.sqrt(numPoints * Math.PI) * phi;
      const baseRadius = size * 0.36;
      
      const r = baseRadius * (0.85 + 0.3 * Math.sin(i * 0.4));
      points.push({
        x: r * Math.cos(theta) * Math.sin(phi),
        y: r * Math.sin(theta) * Math.sin(phi),
        z: r * Math.cos(phi),
        ring: i % 4,
        colorPhase: (i / numPoints) * Math.PI * 2,
        size: Math.random() * 2.2 + 1.2,
      });
    }

    const handleMouseDown = (e: MouseEvent) => {
      if (!interactive) return;
      isDragging = true;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !interactive) return;
      const deltaX = e.clientX - lastMouseX;
      const deltaY = e.clientY - lastMouseY;
      targetAngleY += deltaX * 0.008;
      targetAngleX += deltaY * 0.008;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    const render = () => {
      time += 0.02 * speedMultiplier;
      // Smooth lerp rotation
      angleX += (targetAngleX - angleX) * 0.06;
      angleY += (targetAngleY - angleY) * 0.06;
      targetAngleY += 0.005 * speedMultiplier;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const focalLength = size * 1.2;

      // Draw subtle orbital rings
      const rings = [0.38, 0.45];
      rings.forEach((rScale, idx) => {
        ctx.save();
        ctx.beginPath();
        const ringRadius = size * rScale;
        ctx.ellipse(
          centerX,
          centerY,
          ringRadius,
          ringRadius * Math.abs(Math.cos(angleX + idx)),
          angleY * 0.3,
          0,
          Math.PI * 2
        );
        ctx.strokeStyle = idx === 0 ? 'rgba(56, 168, 91, 0.22)' : 'rgba(33, 137, 200, 0.25)';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([4, 6]);
        ctx.stroke();
        ctx.restore();
      });

      // Sort points by transformed Z depth
      const transformed = points.map((p) => {
        // Dynamic pulse based on soundwave
        const pulse = 1 + Math.sin(time * 3 + p.colorPhase) * 0.08 * (audioLevel / 50);
        let px = p.x * pulse;
        let py = p.y * pulse;
        let pz = p.z * pulse;

        // Rotation around Y
        const cosY = Math.cos(angleY);
        const sinY = Math.sin(angleY);
        const x1 = px * cosY - pz * sinY;
        const z1 = pz * cosY + px * sinY;

        // Rotation around X
        const cosX = Math.cos(angleX);
        const sinX = Math.sin(angleX);
        const y2 = py * cosX - z1 * sinX;
        const z2 = z1 * cosX + py * sinX;

        // Perspective projection
        const scale = focalLength / (focalLength + z2);
        const projX = centerX + x1 * scale;
        const projY = centerY + y2 * scale;
        const alpha = Math.max(0.12, Math.min(1, (z2 + size * 0.4) / (size * 0.8)));

        return { projX, projY, z: z2, scale, alpha, p };
      });

      transformed.sort((a, b) => a.z - b.z);

      // Render connected neural filaments for nearby points
      for (let i = 0; i < transformed.length; i += 4) {
        const p1 = transformed[i];
        for (let j = i + 1; j < Math.min(i + 5, transformed.length); j++) {
          const p2 = transformed[j];
          const distSq = (p1.projX - p2.projX) ** 2 + (p1.projY - p2.projY) ** 2;
          if (distSq < 2200) {
            ctx.beginPath();
            ctx.moveTo(p1.projX, p1.projY);
            ctx.lineTo(p2.projX, p2.projY);
            const lineAlpha = (1 - distSq / 2200) * 0.18 * p1.alpha;
            ctx.strokeStyle = `rgba(33, 137, 200, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Render 3D point nodes
      transformed.forEach(({ projX, projY, scale, alpha, p }) => {
        ctx.beginPath();
        const ptSize = p.size * scale;
        ctx.arc(projX, projY, Math.max(0.8, ptSize), 0, Math.PI * 2);

        // Dynamic multi-spectrum color
        let color = '';
        if (particleMode === 'neural') {
          color = p.ring === 0
            ? `rgba(56, 168, 91, ${alpha * 0.95})` // Emerald
            : p.ring === 1
            ? `rgba(33, 137, 200, ${alpha * 0.95})` // Cyan
            : `rgba(139, 92, 246, ${alpha * 0.9})`; // Violet
        } else if (particleMode === 'acoustic') {
          color = `rgba(33, 137, 200, ${alpha})`;
        } else {
          color = `rgba(56, 168, 91, ${alpha})`;
        }

        ctx.fillStyle = color;
        ctx.fill();

        // Glow halo for prominent foreground points
        if (alpha > 0.75) {
          ctx.beginPath();
          ctx.arc(projX, projY, ptSize * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = color.replace(/[\d.]+\)$/g, '0.12)');
          ctx.fill();
        }
      });

      // Center Core Acoustic Glow
      const coreGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        5,
        centerX,
        centerY,
        size * 0.28
      );
      coreGradient.addColorStop(0, 'rgba(33, 137, 200, 0.18)');
      coreGradient.addColorStop(0.5, 'rgba(56, 168, 91, 0.08)');
      coreGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = coreGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, size * 0.28, 0, Math.PI * 2);
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, [size, interactive, audioLevel, speedMultiplier, particleMode]);

  return (
    <div
      className={`relative flex flex-col items-center justify-center select-none ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative group cursor-grab active:cursor-grabbing">
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          className="rounded-full drop-shadow-xl"
        />

        {/* Orbit status pill */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white/90 dark:bg-[#111C38]/90 backdrop-blur-md border border-[#000000]/10 dark:border-[#1E2E4A] shadow-md flex items-center gap-1.5 whitespace-nowrap pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-[#38A85B] animate-pulse" />
          <span className="text-[11px] font-bold text-[#000000] dark:text-white">
            {activeStatusText}
          </span>
        </div>
      </div>

      {interactive && (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs">
          <div className="inline-flex rounded-xl p-1 bg-white dark:bg-[#111C38] border border-[#000000]/10 dark:border-[#1E2E4A] shadow-xs">
            <button
              onClick={() => setParticleMode('neural')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                particleMode === 'neural'
                  ? 'bg-[#000000] text-white dark:bg-white dark:text-[#000000]'
                  : 'text-[#27272a] dark:text-[#94A3B8]'
              }`}
            >
              Neural Voice
            </button>
            <button
              onClick={() => setParticleMode('acoustic')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                particleMode === 'acoustic'
                  ? 'bg-[#2189C8] text-white'
                  : 'text-[#27272a] dark:text-[#94A3B8]'
              }`}
            >
              Acoustic
            </button>
            <button
              onClick={() => setParticleMode('quantum')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                particleMode === 'quantum'
                  ? 'bg-[#38A85B] text-white'
                  : 'text-[#27272a] dark:text-[#94A3B8]'
              }`}
            >
              Ultra Low-Latency
            </button>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#111C38] border border-[#000000]/10 dark:border-[#1E2E4A] text-[11px] font-bold text-[#000000] dark:text-white shadow-xs">
            <Volume2 className="w-3.5 h-3.5 text-[#2189C8]" />
            <span className="text-[#27272a] dark:text-[#94A3B8]">Sens:</span>
            <input
              type="range"
              min="20"
              max="100"
              value={audioLevel}
              onChange={(e) => setAudioLevel(Number(e.target.value))}
              className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#2189C8]"
            />
          </div>

          <button
            onClick={() => setSpeedMultiplier((prev) => (prev === 1 ? 2.2 : prev === 2.2 ? 0.5 : 1))}
            className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#111C38] border border-[#000000]/10 dark:border-[#1E2E4A] text-[11px] font-bold text-[#000000] dark:text-white hover:bg-gray-50 dark:hover:bg-[#162744] flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
          >
            <Rotate3d className="w-3.5 h-3.5 text-amber-500" />
            <span>{speedMultiplier}x Speed</span>
          </button>
        </div>
      )}
    </div>
  );
};
