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
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-13 h-13',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const taglineSizes = {
    sm: 'text-[9px] tracking-[0.16em]',
    md: 'text-[10px] tracking-[0.14em]',
    lg: 'text-[11px] tracking-[0.14em]',
    xl: 'text-xs tracking-[0.14em]',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none group cursor-pointer ${className}`}>
      {/* Precision Acoustic Monogram */}
      <div className={`relative flex-shrink-0 ${iconSizes[size]} transition-transform duration-300 ease-out group-hover:scale-[1.03]`}>
        <div className="relative w-full h-full rounded-xl bg-slate-900 dark:bg-[#141821] border border-slate-800 dark:border-white/[0.1] p-1.5 flex items-center justify-center shadow-sm overflow-hidden">
          <div className="flex items-center justify-center gap-[2px] w-full h-full">
            <span className="w-[2.5px] bg-indigo-400/80 rounded-full animate-bar-1" style={{ height: '35%' }} />
            <span className="w-[2.5px] bg-sky-300/90 rounded-full animate-bar-2" style={{ height: '60%' }} />
            <span className="w-[3px] bg-gradient-to-t from-indigo-400 to-sky-300 rounded-full animate-bar-3" style={{ height: '82%' }} />
            <span className="w-[2.5px] bg-indigo-300/90 rounded-full animate-bar-4" style={{ height: '55%' }} />
            <span className="w-[2.5px] bg-indigo-400/70 rounded-full animate-bar-1" style={{ height: '30%' }} />
          </div>
        </div>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span
            className={`font-bold tracking-tight leading-none ${textSizes[size]} ${
              theme === 'dark' ? 'text-white' : 'text-slate-900 dark:text-slate-100'
            }`}
          >
            AURIS
          </span>
          <span className="px-1.5 py-0.5 text-[9px] font-mono font-semibold tracking-wider uppercase rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20">
            2.0
          </span>
        </div>
        {showTagline && (
          <span
            className={`font-medium uppercase transition-colors ${taglineSizes[size]} text-slate-500 dark:text-slate-400 mt-0.5`}
          >
            Voice Infrastructure
          </span>
        )}
      </div>
    </div>
  );
};
