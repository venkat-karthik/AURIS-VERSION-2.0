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
    <div className={`flex items-center gap-3 select-none group cursor-pointer ${className}`}>
      {/* Precision Audio Monogram Icon */}
      <div className={`relative flex-shrink-0 ${iconSizes[size]} transition-transform duration-300 group-hover:scale-105`}>
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/30 via-violet-500/30 to-purple-600/30 rounded-2xl blur-md group-hover:blur-lg transition-all" />
        <div className="relative w-full h-full rounded-2xl bg-slate-900 border border-indigo-500/40 dark:border-indigo-400/30 p-2 flex items-center justify-center shadow-xl overflow-hidden">
          {/* Animated Waveform Inside Orb */}
          <div className="flex items-center justify-center gap-0.5 w-full h-full">
            <span className="w-1 bg-indigo-400 rounded-full animate-bar-1" style={{ height: '35%' }} />
            <span className="w-1 bg-indigo-300 rounded-full animate-bar-2" style={{ height: '60%' }} />
            <span className="w-1.5 bg-gradient-to-t from-indigo-400 to-violet-400 rounded-full animate-bar-3" style={{ height: '85%' }} />
            <span className="w-1 bg-violet-400 rounded-full animate-bar-4" style={{ height: '55%' }} />
            <span className="w-1 bg-purple-300 rounded-full animate-bar-1" style={{ height: '30%' }} />
          </div>
          {/* Subtle light sweep */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span
            className={`font-black tracking-tight leading-none ${textSizes[size]} ${
              theme === 'dark' ? 'text-white' : 'text-slate-950 dark:text-white'
            }`}
          >
            AURIS<span className="text-indigo-500 font-extrabold">.</span>
          </span>
          <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold tracking-widest uppercase rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            2.0
          </span>
        </div>
        {showTagline && (
          <span
            className={`font-bold tracking-wider uppercase transition-colors ${taglineSizes[size]} text-slate-500 dark:text-slate-400 mt-0.5`}
          >
            Autonomous Voice AI
          </span>
        )}
      </div>
    </div>
  );
};
