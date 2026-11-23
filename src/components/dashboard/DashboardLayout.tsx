import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from '../common/Logo';
import { ThemeToggle } from '../common/ThemeToggle';
import {
  Bot,
  Phone,
  PhoneCall,
  BarChart3,
  BookOpen,
  Settings,
  CreditCard,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  Mic,
  MessageSquare,
  Megaphone,
  Radio,
  Search,
  Bell,
  Headphones,
  Folder,
  KeyRound,
  Blocks,
  ArrowLeft,
  User as UserIcon,
  Menu,
  LayoutDashboard,
  Users,
  UserCheck,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Business, User } from '../../types';

interface DashboardLayoutProps {
  currentView: string;
  onSelectView: (view: string) => void;
  currentUser: User | null;
  currentBusiness: Business;
  availableBusinesses: Business[];
  onSelectBusiness: (biz: Business) => void;
  onLogout: () => void;
  onBackToWebsite: () => void;
  onOpenCreateAgent: () => void;
  onOpenWebVoice?: () => void;
  onOpenDirectCall?: () => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  children: React.ReactNode;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  highlight?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  currentView,
  onSelectView,
  currentUser,
  currentBusiness,
  availableBusinesses,
  onSelectBusiness,
  onLogout,
  onBackToWebsite,
  onOpenCreateAgent,
  onOpenDirectCall,
  children,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showBizDropdown, setShowBizDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const [previousView, setPreviousView] = useState<string>(currentView);
  const [direction, setDirection] = useState<'forward' | 'backward' | 'lateral'>('lateral');
  const mainRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (currentView !== previousView) {
      if (
        (previousView === 'agents' || previousView === 'dashboard') &&
        currentView === 'create-agent'
      ) {
        setDirection('forward');
      } else if (
        previousView === 'create-agent' &&
        (currentView === 'agents' || currentView === 'dashboard')
      ) {
        setDirection('backward');
      } else {
        setDirection('lateral');
      }
      setPreviousView(currentView);
      mainRef.current?.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [currentView, previousView]);

  const viewVariants = {
    enter: (dir: 'forward' | 'backward' | 'lateral') => {
      if (dir === 'forward') {
        return { opacity: 0, x: 28, scale: 0.99 };
      }
      if (dir === 'backward') {
        return { opacity: 0, x: -28, scale: 0.99 };
      }
      return { opacity: 0, y: 10, scale: 0.995 };
    },
    center: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
    },
    exit: (dir: 'forward' | 'backward' | 'lateral') => {
      if (dir === 'forward') {
        return { opacity: 0, x: -28, scale: 0.99 };
      }
      if (dir === 'backward') {
        return { opacity: 0, x: 28, scale: 0.99 };
      }
      return { opacity: 0, y: -8, scale: 0.995 };
    },
  };

  const navSections: NavSection[] = [
    {
      title: 'VOICE PLATFORM',
      items: [
        { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
        { id: 'web-voice', label: 'Web Mic Playground', icon: Radio, badge: 'Live' },
        { id: 'calls', label: 'Call Logs & Transcripts', icon: PhoneCall },
        { id: 'agents', label: 'AI Voice Assistants', icon: Bot },
        { id: 'clone-voice', label: 'Voice Studio & Dialects', icon: Mic },
      ],
    },
    {
      title: 'TELEPHONY & INFRASTRUCTURE',
      items: [
        { id: 'phone-numbers', label: 'Carrier Trunks (+91)', icon: Phone },
        { id: 'api-usage', label: 'Usage & Mesh Health', icon: KeyRound },
        { id: 'settings', label: 'Voice Settings', icon: Settings },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#030712] flex text-slate-100 transition-colors duration-200">
      {/* 1. LEFT SIDEBAR */}
      <aside
        className={`hidden md:flex flex-col bg-[#090D16] border-r border-slate-800/80 backdrop-blur-xl transition-all duration-300 z-30 select-none ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Sidebar Header / Logo */}
        <div className="h-18 px-5 flex items-center justify-between border-b border-slate-800/80">
          <div
            onClick={onBackToWebsite}
            className="cursor-pointer flex items-center gap-2"
            title="Return to Public Website"
          >
            <Logo size="sm" showTagline={!sidebarCollapsed} />
          </div>
        </div>

        {/* Navigation Items List with Category Grouping */}
        <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {!sidebarCollapsed && (
                <div className="px-3 pb-1 text-[10px] font-mono font-bold tracking-wider uppercase text-slate-500">
                  {section.title}
                </div>
              )}

              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;

                return (
                  <button
                    key={item.id}
                    id={`sidebar-nav-${item.id}`}
                    onClick={() => onSelectView(item.id)}
                    className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                    {!sidebarCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                    {!sidebarCollapsed && item.badge && (
                      <span className="ml-auto text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-800/80">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      {/* 2. MAIN VIEW AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 px-4 sm:px-6 bg-[#090D16]/80 backdrop-blur-xl border-b border-slate-800/80 flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs">
              {currentView === 'create-agent' ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectView('agents')}
                    className="flex items-center gap-1 text-slate-400 hover:text-cyan-400 font-semibold cursor-pointer transition-colors group"
                  >
                    <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-0.5 text-cyan-400" />
                    <span>Voice Assistants</span>
                  </button>
                  <span className="text-slate-600">/</span>
                  <span className="font-bold text-white">Create Agent Builder</span>
                </div>
              ) : (
                <span className="text-slate-400 capitalize font-medium">
                  {navSections.flatMap((s) => s.items).find((i) => i.id === currentView)?.label || currentView.replace('-', ' ')}
                </span>
              )}
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Carrier SLA Status Indicator */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono font-bold text-slate-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
              </span>
              <span className="text-white">Plivo Carrier SIP: Online</span>
              <span className="text-slate-600">•</span>
              <span className="text-cyan-400 text-[11px]">&lt;140ms</span>
            </div>

            <ThemeToggle size="md" />

            {/* In-Browser Web Voice Mic Button */}
            <button
              onClick={() => onSelectView('web-voice')}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.15)]"
              title="Test Voice Agent in Browser using Laptop Microphone"
            >
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Web Mic Tester</span>
            </button>

            {/* Direct Trunk Call Button */}
            {onOpenDirectCall && (
              <button
                id="topbar-direct-call-btn"
                onClick={onOpenDirectCall}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                title="Dispatch Direct Outbound Carrier Call"
              >
                <PhoneCall className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Dispatch Call</span>
              </button>
            )}

            {/* Primary Action: Deploy Agent */}
            <button
              id="topbar-create-agent-btn"
              onClick={onOpenCreateAgent}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.35)] transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Deploy Voice Agent</span>
            </button>

            {/* Authenticated User Menu */}
            {currentUser && (() => {
              const rawName = currentUser.name || 'Enterprise Admin';
              const cleanName = rawName.toLowerCase().includes('karthik') || rawName.toLowerCase().includes('venkat') ? 'Enterprise Admin' : rawName;
              return (
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {cleanName[0]?.toUpperCase() || 'A'}
                  </div>
                  <span className="text-xs font-bold text-slate-200 max-w-[120px] truncate hidden sm:inline">
                    {cleanName}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#090D16] border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 text-xs animate-in fade-in">
                    <div className="px-3 py-2 border-b border-slate-800">
                      <p className="font-bold text-white truncate">
                        {currentUser.name}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate font-mono">
                        {currentUser.email}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onSelectView('settings');
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-900 flex items-center gap-2 text-slate-300 hover:text-white cursor-pointer mt-1"
                    >
                      <Settings className="w-4 h-4 text-cyan-400" />
                      <span>Security & Keys</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onLogout();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-500/10 flex items-center gap-2 text-rose-400 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
              );
            })()}
          </div>
        </header>

        {/* Dynamic Animated Content Body */}
        <main ref={mainRef} className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentView}
              custom={direction}
              variants={viewVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                duration: 0.22,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="w-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090D16]/95 backdrop-blur-md border-t border-slate-800 px-3 py-1.5 flex items-center justify-around pb-safe select-none shadow-2xl"
      >
        <button
          onClick={() => onSelectView('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            currentView === 'dashboard'
              ? 'text-cyan-400 font-bold'
              : 'text-slate-400'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-medium">Home</span>
        </button>

        <button
          onClick={() => onSelectView('agents')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            currentView === 'agents' || currentView === 'create-agent'
              ? 'text-cyan-400 font-bold'
              : 'text-slate-400'
          }`}
        >
          <Bot className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-medium">Agents</span>
        </button>

        {/* Center Dispatch Action Button */}
        <button
          onClick={onOpenDirectCall}
          className="flex flex-col items-center justify-center -mt-5 relative z-10 cursor-pointer"
        >
          <div className="w-11 h-11 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-95 transition-transform">
            <Phone className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 font-bold text-cyan-400">Dispatch</span>
        </button>

        <button
          onClick={() => onSelectView('calls')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            currentView === 'calls'
              ? 'text-cyan-400 font-bold'
              : 'text-slate-400'
          }`}
        >
          <PhoneCall className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-medium">Calls</span>
        </button>

        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-slate-400 cursor-pointer"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-medium">Menu</span>
        </button>
      </nav>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 z-50 md:hidden bg-black/80 backdrop-blur-sm flex"
          >
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              onClick={(e) => e.stopPropagation()}
              className="w-72 bg-[#090D16] h-full p-4 flex flex-col justify-between shadow-2xl border-r border-slate-800"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <Logo size="sm" />
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 text-slate-400 hover:text-white"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4 overflow-y-auto max-h-[70vh]">
                  {navSections.map((sec, i) => (
                    <div key={i} className="space-y-1">
                      <div className="text-[10px] font-mono font-bold uppercase text-slate-500 px-2">
                        {sec.title}
                      </div>
                      {sec.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            onSelectView(item.id);
                            setMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                            currentView === item.id
                              ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <item.icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
