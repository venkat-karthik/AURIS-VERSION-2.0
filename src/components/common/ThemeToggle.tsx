import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ThemeToggleProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  size = 'md',
  className = '',
  showLabel = false,
}) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const sizeClasses = {
    sm: 'p-1.5 text-xs gap-1.5',
    md: 'p-2 text-xs gap-2',
    lg: 'p-2.5 text-sm gap-2.5',
  }[size];

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }[size];

  return (
    <motion.button
      type="button"
      id="theme-toggle-btn"
      onClick={toggleTheme}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.92 }}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={`relative inline-flex items-center justify-center rounded-xl border transition-colors cursor-pointer select-none ${
        isDark
          ? 'bg-[#1E293B] border-[#334155] text-amber-300 hover:bg-[#283548] hover:text-amber-200'
          : 'bg-white border-[#DDEBEF] text-[#52636D] hover:text-[#123047] hover:bg-[#EEF8FC]'
      } ${sizeClasses} ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="moon"
            initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="flex items-center justify-center"
          >
            <Moon className={`${iconSizes} fill-amber-300/20 text-amber-300`} />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ rotate: 90, opacity: 0, scale: 0.6 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: -90, opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="flex items-center justify-center"
          >
            <Sun className={`${iconSizes} text-amber-500`} />
          </motion.div>
        )}
      </AnimatePresence>

      {showLabel && (
        <span className="font-semibold capitalize text-inherit">
          {isDark ? 'Dark' : 'Light'}
        </span>
      )}
    </motion.button>
  );
};
