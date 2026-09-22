import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from '../common/Logo';
import { ThemeToggle } from '../common/ThemeToggle';
import { Menu, X, ArrowRight, Sparkles, Radio, PhoneCall, ChevronRight } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onEnterDemoDashboard: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  onOpenAuth,
  onEnterDemoDashboard,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'product', label: 'Product' },
    { id: 'solutions', label: 'Solutions' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'resources', label: 'Resources' },
    { id: 'about', label: 'About' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/85 dark:bg-[#0B132B]/85 backdrop-blur-xl border-b border-[#DDEBEF] dark:border-[#1E2E4A] transition-colors duration-200">
      {/* Top Telephony Carrier Status Bar (Micro-Banner) */}
      <div className="bg-[#EEF8FC]/80 dark:bg-[#132238] border-b border-[#DDEBEF]/60 dark:border-[#1E2E4A] px-4 py-1.5 text-[11px] font-semibold text-[#52636D] dark:text-[#94A3B8] transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[#38A85B] font-bold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#38A85B] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#38A85B]"></span>
              </span>
              Carrier SIP Gateway: Live
            </span>
            <span className="hidden sm:inline text-[#82919A] dark:text-[#64748B]">•</span>
            <span className="hidden sm:inline">Sub-280ms Voice Latency SLA Guaranteed</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[#2189C8] font-bold hidden md:inline">
              ISO 27001 & HIPAA Compliant Architecture
            </span>
            <button
              onClick={onEnterDemoDashboard}
              className="text-[#38A85B] hover:text-[#2f8f4d] font-bold underline flex items-center gap-1 cursor-pointer"
            >
              Test Live Voice Demo &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          id="navbar-logo-btn"
          onClick={() => onNavigate('home')}
          className="cursor-pointer flex items-center gap-3 select-none"
        >
          <Logo size="md" />
        </div>

        {/* Desktop Navigation Links with Gliding Layout Indicator */}
        <nav
          className="hidden md:flex items-center p-1.5 rounded-2xl bg-[#F5FAFC]/80 dark:bg-[#111C38] border border-[#DDEBEF]/80 dark:border-[#1E2E4A] relative"
          onMouseLeave={() => setHoveredTab(null)}
        >
          {navLinks.map((link) => {
            const isActive = currentTab === link.id;
            const isHovered = hoveredTab === link.id;

            return (
              <button
                key={link.id}
                id={`nav-link-${link.id}`}
                onClick={() => onNavigate(link.id)}
                onMouseEnter={() => setHoveredTab(link.id)}
                className={`relative px-4 py-2 text-xs font-extrabold transition-colors cursor-pointer rounded-xl z-10 ${
                  isActive
                    ? 'text-[#000000] dark:text-[#55B9E8]'
                    : 'text-[#27272a] dark:text-[#94A3B8] hover:text-[#000000] dark:hover:text-white'
                }`}
              >
                {/* Active Pill Layout Animation */}
                {isActive && (
                  <motion.span
                    layoutId="navbar-active-pill"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    className="absolute inset-0 rounded-xl bg-white dark:bg-[#1A2644] shadow-xs border-2 border-[#000000] dark:border-[#2A3B5C] -z-10"
                  />
                )}

                {/* Hover Indicator if not active */}
                {!isActive && isHovered && (
                  <motion.span
                    layoutId="navbar-hover-pill"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    className="absolute inset-0 rounded-xl bg-[#EEF8FC]/60 dark:bg-[#1A2644]/50 -z-10"
                  />
                )}

                <span className="relative z-10">{link.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Actions: Theme Toggle + Dashboard + Auth */}
        <div className="hidden md:flex items-center gap-3">
          {/* Light / Dark Mode Toggle */}
          <ThemeToggle size="md" />

          {/* Quick Dashboard Shortcut */}
          <motion.button
            id="nav-demo-dashboard-btn"
            onClick={onEnterDemoDashboard}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#2189C8] dark:text-[#55B9E8] bg-[#EEF8FC] dark:bg-[#162742] hover:bg-[#DDEBEF] dark:hover:bg-[#1E3456] rounded-xl border border-[#55B9E8]/30 dark:border-[#2D486B] transition-all cursor-pointer shadow-xs"
            title="Open live customer management portal"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#2189C8] dark:text-[#55B9E8]" />
            Dashboard
          </motion.button>

          {/* Sign In */}
          <button
            id="nav-signin-btn"
            onClick={() => onOpenAuth('login')}
            className="px-3.5 py-2 text-xs font-extrabold text-[#000000] dark:text-[#E2E8F0] hover:text-[#38A85B] transition-colors cursor-pointer"
          >
            Sign In
          </button>

          {/* Primary CTA: Get Started */}
          <motion.button
            id="nav-getstarted-btn"
            onClick={() => onOpenAuth('signup')}
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            className="group flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-[#38A85B] to-[#2f8f4d] hover:from-[#329852] hover:to-[#287d43] shadow-sm hover:shadow-md transition-all rounded-xl cursor-pointer"
          >
            <span>Get Started</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </motion.button>
        </div>

        {/* Mobile Hamburger Toggle & Theme Toggle */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle size="sm" />

          <button
            id="nav-mobile-demo-btn"
            onClick={onEnterDemoDashboard}
            className="px-2.5 py-1.5 text-xs font-bold text-[#2189C8] dark:text-[#55B9E8] bg-[#EEF8FC] dark:bg-[#162742] rounded-lg border border-[#55B9E8]/30"
          >
            App
          </button>

          <button
            id="nav-mobile-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#123047] dark:text-[#F1F5F9] hover:text-[#2189C8] rounded-xl focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-Down Menu with AnimatePresence */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-xl border-b border-[#DDEBEF] dark:border-[#1E2E4A] px-4 pt-2 pb-6 space-y-4 shadow-xl"
          >
            <div className="grid grid-cols-2 gap-2 py-2">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => {
                    onNavigate(link.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`text-left px-3 py-2.5 text-xs font-bold rounded-xl transition-colors ${
                    currentTab === link.id
                      ? 'bg-[#EEF8FC] dark:bg-[#162742] text-[#2189C8] dark:text-[#55B9E8]'
                      : 'text-[#52636D] dark:text-[#94A3B8] hover:bg-[#F5FAFC] dark:hover:bg-[#1E293B]'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-[#DDEBEF] dark:border-[#1E2E4A] flex flex-col gap-2.5">
              <button
                onClick={() => {
                  onEnterDemoDashboard();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 rounded-xl bg-[#EEF8FC] dark:bg-[#162742] text-[#2189C8] dark:text-[#55B9E8] font-bold text-xs flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Launch Customer Portal
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onOpenAuth('login');
                    setMobileMenuOpen(false);
                  }}
                  className="py-2.5 rounded-xl border border-[#DDEBEF] dark:border-[#1E2E4A] text-xs font-bold text-[#123047] dark:text-[#E2E8F0]"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    onOpenAuth('signup');
                    setMobileMenuOpen(false);
                  }}
                  className="py-2.5 rounded-xl bg-[#38A85B] text-white text-xs font-bold flex items-center justify-center gap-1 shadow-xs"
                >
                  Get Started
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
