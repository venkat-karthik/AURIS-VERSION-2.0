import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from '../common/Logo';
import { ThemeToggle } from '../common/ThemeToggle';
import { Menu, X, ArrowRight, LogOut, LayoutDashboard, ChevronDown, Sparkles } from 'lucide-react';
import { User } from '../../types';

interface NavbarProps {
  currentTab: string;
  currentUser?: User | null;
  onNavigate: (tab: string) => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  currentUser,
  onNavigate,
  onOpenAuth,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'home', label: 'Platform' },
    { id: 'product', label: 'Voice Engines' },
    { id: 'solutions', label: 'Solutions' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'resources', label: 'Documentation' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/85 dark:bg-[#021024]/85 backdrop-blur-xl border-b border-slate-200/90 dark:border-[#5483B3]/35 shadow-lg shadow-[#021024]/5 dark:shadow-[#021024]/40 py-0.5'
          : 'bg-white/95 dark:bg-[#021024]/95 backdrop-blur-md border-b border-slate-200 dark:border-[#5483B3]/25'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo with Live Telephony Pill */}
        <div className="flex items-center gap-3">
          <div
            id="navbar-logo-btn"
            onClick={() => onNavigate('home')}
            className="cursor-pointer flex items-center gap-3 select-none group"
          >
            <Logo size="md" />
          </div>
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1D64C2]/10 border border-[#5483B3]/30 text-[10px] font-bold text-[#1D64C2] dark:text-[#C1E8FF]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1D64C2] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1D64C2]"></span>
            </span>
            <span>SIP Network Active</span>
          </div>
        </div>

        {/* Clean Modern Navigation Links with Sliding Tab Indicator */}
        <nav className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-slate-100/60 dark:bg-[#052659]/30 border border-slate-200/60 dark:border-[#5483B3]/20">
          {navLinks.map((link) => {
            const isActive = currentTab === link.id;
            return (
              <button
                key={link.id}
                id={`nav-link-${link.id}`}
                onClick={() => onNavigate(link.id)}
                className={`relative px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer select-none ${
                  isActive
                    ? 'text-[#021024] dark:text-[#C1E8FF] font-bold'
                    : 'text-slate-600 dark:text-[#7DA0CA] hover:text-[#021024] dark:hover:text-[#C1E8FF]'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="navbar-active-pill"
                    className="absolute inset-0 bg-white dark:bg-[#052659] rounded-lg shadow-xs border border-slate-200/80 dark:border-[#5483B3]/40 z-0"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Actions: Theme Toggle + Auth Controls */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle size="md" />

          {currentUser ? (
            /* Logged in state: Only visible when currentUser is verified */
            <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-[#5483B3]/25">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                id="nav-go-dashboard-btn"
                onClick={() => onNavigate('dashboard')}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#052659] via-[#1D64C2] to-[#2563EB] hover:from-[#1D64C2] hover:to-[#3B82F6] rounded-xl transition-all cursor-pointer shadow-md shadow-[#1D64C2]/20 animate-shimmer"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Console Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </motion.button>

              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 py-1 px-2.5 rounded-xl bg-slate-50 dark:bg-[#052659]/60 border border-slate-200 dark:border-[#5483B3]/30 hover:border-slate-300 dark:hover:border-[#7DA0CA] cursor-pointer transition-colors"
                >
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#052659] to-[#1D64C2] text-[#C1E8FF] text-[10px] font-bold flex items-center justify-center">
                      {currentUser.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <span className="text-xs font-bold text-slate-800 dark:text-[#C1E8FF] max-w-[120px] truncate">
                    {currentUser.name}
                  </span>
                  <ChevronDown className="w-3 h-3 text-[#7DA0CA]" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#052659] border border-slate-200 dark:border-[#5483B3]/30 rounded-2xl shadow-xl p-2 z-50 text-xs animate-in fade-in">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-[#5483B3]/25">
                      <p className="font-bold text-slate-950 dark:text-white truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-400 dark:text-[#7DA0CA] truncate">{currentUser.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        onNavigate('dashboard');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#021024]/60 flex items-center gap-2 text-slate-700 dark:text-[#C1E8FF] cursor-pointer mt-1"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-[#7DA0CA]" />
                      <span>Open Workspace</span>
                    </button>
                    {onLogout && (
                      <button
                        onClick={() => {
                          onLogout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 text-rose-600 dark:text-rose-400 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Unauthenticated state: ONLY Sign In and Get Started - NO DASHBOARD BUTTON */
            <div className="flex items-center gap-2">
              <button
                id="nav-signin-btn"
                onClick={() => onOpenAuth('login')}
                className="px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-[#7DA0CA] hover:text-[#021024] dark:hover:text-[#C1E8FF] transition-colors cursor-pointer"
              >
                Sign In
              </button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                id="nav-getstarted-btn"
                onClick={() => onOpenAuth('signup')}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#052659] via-[#1D64C2] to-[#2563EB] hover:from-[#1D64C2] hover:to-[#3B82F6] rounded-xl transition-all cursor-pointer shadow-md shadow-[#1D64C2]/20 animate-shimmer"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle size="sm" />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden overflow-hidden border-b border-slate-200 dark:border-[#5483B3]/25 bg-white dark:bg-[#021024] px-4 pt-3 pb-6 space-y-3"
          >
            <div className="space-y-1">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => {
                    onNavigate(link.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs font-semibold rounded-lg ${
                    currentTab === link.id
                      ? 'text-[#021024] dark:text-[#C1E8FF] bg-slate-100 dark:bg-[#052659]'
                      : 'text-slate-600 dark:text-[#7DA0CA]'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-[#5483B3]/25 space-y-2">
              {currentUser ? (
                <>
                  <button
                    onClick={() => {
                      onNavigate('dashboard');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2.5 px-4 text-xs font-bold text-white bg-gradient-to-r from-[#052659] via-[#1D64C2] to-[#2563EB] rounded-xl flex items-center justify-center gap-2 shadow-md shadow-[#1D64C2]/20"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Go to Console Dashboard</span>
                  </button>
                  {onLogout && (
                    <button
                      onClick={() => {
                        onLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full py-2 text-xs font-bold text-rose-600 dark:text-rose-400 text-center"
                    >
                      Sign Out ({currentUser.email})
                    </button>
                  )}
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      onOpenAuth('login');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2 text-xs font-bold text-slate-800 dark:text-[#C1E8FF] bg-slate-100 dark:bg-[#052659] rounded-xl text-center"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      onOpenAuth('signup');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2 text-xs font-bold text-white bg-gradient-to-r from-[#052659] via-[#1D64C2] to-[#2563EB] rounded-xl text-center shadow-md shadow-[#1D64C2]/20"
                  >
                    Get Started
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
