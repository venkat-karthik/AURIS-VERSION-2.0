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
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Brand Flowing Leaf + Soundwave Mark */}
      <div className={`relative flex-shrink-0 ${iconSizes[size]} transition-transform duration-200 hover:scale-105`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm"
        >
          {/* Nature Fresh Green Organic Leaf Body */}
          <path
            d="M20 78 C16 44 40 18 78 14 C74 54 48 82 20 78 Z"
            fill="url(#aurisGreenGrad)"
          />
          {/* Sky Blue Wave Petal overlay creating conversation contour */}
          <path
            d="M32 74 C44 48 64 32 82 14 C72 46 52 70 32 74 Z"
            fill="url(#aurisSkyGrad)"
            opacity="0.9"
          />
          {/* Embedded Soundwave Bars representing Voice & Intelligence */}
          <rect x="46" y="44" width="4.5" height="16" rx="2.25" fill="#FFFFFF" />
          <rect x="54.5" y="36" width="4.5" height="28" rx="2.25" fill="#FFFFFF" />
          <rect x="63" y="47" width="4.5" height="11" rx="2.25" fill="#FFFFFF" />

          <defs>
            <linearGradient id="aurisGreenGrad" x1="20" y1="78" x2="78" y2="14" gradientUnits="userSpaceOnUse">
              <stop stopColor="#38A85B" />
              <stop offset="1" stopColor="#65C978" />
            </linearGradient>
            <linearGradient id="aurisSkyGrad" x1="32" y1="74" x2="82" y2="14" gradientUnits="userSpaceOnUse">
              <stop stopColor="#2189C8" />
              <stop offset="1" stopColor="#55B9E8" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col">
        <span
          className={`font-black tracking-tight leading-none ${textSizes[size]} ${
            theme === 'dark' ? 'text-white' : 'text-[#123047]'
          }`}
          style={{ letterSpacing: '0.04em' }}
        >
          AURIS
        </span>
        {showTagline && (
          <span
            className={`font-semibold uppercase transition-colors ${taglineSizes[size]} ${
              theme === 'dark' ? 'text-white/70' : 'text-[#52636D]'
            }`}
          >
            Human-like. Always on.
          </span>
        )}
      </div>
    </div>
  );
};
