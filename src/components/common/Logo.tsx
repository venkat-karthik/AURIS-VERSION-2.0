import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  theme?: 'light' | 'dark';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showTagline = true,
  theme = 'light',
  className = '',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  };

  const taglineSizes = {
    sm: 'text-[9px] tracking-widest',
    md: 'text-[10px] tracking-wider',
    lg: 'text-xs tracking-wider',
    xl: 'text-sm tracking-wider',
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Redesigned Brand Emblem: Acoustic Resonance Orb & Interlocking Soundwave Monogram */}
      <div
        className={`relative flex-shrink-0 ${iconSizes[size]} transition-all duration-300 hover:scale-105 group cursor-pointer`}
      >
        <svg
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md"
        >
          {/* Subtle Outer Glow Aura */}
          <circle cx="60" cy="60" r="54" fill="url(#aurisGlowMesh)" opacity="0.3" />

          {/* Smooth Geometric Squircle Shield */}
          <rect
            x="8"
            y="8"
            width="104"
            height="104"
            rx="28"
            fill="url(#aurisShieldGrad)"
            stroke="url(#aurisBorderGrad)"
            strokeWidth="2.5"
          />

          {/* Dynamic Interlocking Acoustic Waves forming stylized 'A' */}
          {/* Left Wing Wave */}
          <path
            d="M32 82 C32 50 48 30 60 24 C52 46 44 68 32 82 Z"
            fill="url(#aurisOceanWaveGrad)"
          />

          {/* Right Wing Wave */}
          <path
            d="M88 82 C88 50 72 30 60 24 C68 46 76 68 88 82 Z"
            fill="url(#aurisFrostWaveGrad)"
          />

          {/* Central Harmonic Audio Bars (Responsive Voice Resonance) */}
          <rect x="42" y="52" width="5" height="18" rx="2.5" fill="#FFFFFF" opacity="0.85" />
          <rect x="51" y="42" width="5" height="38" rx="2.5" fill="#C1E8FF" />
          <rect x="60" y="34" width="5" height="54" rx="2.5" fill="#FFFFFF" />
          <rect x="69" y="44" width="5" height="34" rx="2.5" fill="#C1E8FF" />
          <rect x="78" y="54" width="5" height="14" rx="2.5" fill="#FFFFFF" opacity="0.85" />

          {/* Acoustic Core Focal Dot */}
          <circle cx="62.5" cy="30" r="3.5" fill="#C1E8FF" />

          {/* Gradients */}
          <defs>
            <linearGradient id="aurisShieldGrad" x1="8" y1="8" x2="112" y2="112" gradientUnits="userSpaceOnUse">
              <stop stopColor="#021024" />
              <stop offset="0.5" stopColor="#052659" />
              <stop offset="1" stopColor="#1D64C2" />
            </linearGradient>

            <linearGradient id="aurisBorderGrad" x1="8" y1="8" x2="112" y2="112" gradientUnits="userSpaceOnUse">
              <stop stopColor="#C1E8FF" stopOpacity="0.85" />
              <stop offset="0.5" stopColor="#7DA0CA" stopOpacity="0.5" />
              <stop offset="1" stopColor="#5483B3" stopOpacity="0.8" />
            </linearGradient>

            <linearGradient id="aurisOceanWaveGrad" x1="32" y1="82" x2="60" y2="24" gradientUnits="userSpaceOnUse">
              <stop stopColor="#1D64C2" />
              <stop offset="1" stopColor="#5483B3" />
            </linearGradient>

            <linearGradient id="aurisFrostWaveGrad" x1="88" y1="82" x2="60" y2="24" gradientUnits="userSpaceOnUse">
              <stop stopColor="#7DA0CA" />
              <stop offset="1" stopColor="#C1E8FF" />
            </linearGradient>

            <radialGradient id="aurisGlowMesh" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1D64C2" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#052659" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span
            className={`font-black font-royal leading-none ${textSizes[size]} ${
              theme === 'dark' ? 'text-white' : 'text-slate-950 dark:text-white'
            }`}
            style={{ letterSpacing: '0.08em' }}
          >
            AURIS
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#C1E8FF] shadow-[0_0_8px_#C1E8FF] animate-pulse" />
        </div>
        {showTagline && (
          <span
            className={`font-semibold font-royal tracking-widest uppercase transition-colors ${taglineSizes[size]} text-[#1D64C2] dark:text-[#C1E8FF] mt-0.5`}
            style={{ letterSpacing: '0.14em' }}
          >
            Human Voice AI
          </span>
        )}
      </div>
    </div>
  );
};
