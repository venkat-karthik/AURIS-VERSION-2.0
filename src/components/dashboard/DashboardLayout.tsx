import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from '../common/Logo';
import { ThemeToggle } from '../common/ThemeToggle';
import {
  Bot,
  Phone,
  PhoneCall,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  Radio,
  KeyRound,
  Blocks,
  ArrowLeft,
  Menu,
  LayoutDashboard,
  Wallet,
} from 'lucide-react';
import { Business, User } from '../../types';
import { WalletModal } from './WalletModal';
import { aurisApi } from '../../services/apiService';

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
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number>(500);

  useEffect(() => {
    aurisApi.getWallet().then((w) => setWalletBalance(w.balanceInr)).catch(() => {});
  }, [currentView]);

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
      if (dir === 'forward') return { opacity: 0, x: 20 };
      if (dir === 'backward') return { opacity: 0, x: -20 };
      return { opacity: 0, y: 8 };
    },
    center: { opacity: 1, x: 0, y: 0 },
    exit: (dir: 'forward' | 'backward' | 'lateral') => {
      if (dir === 'forward') return { opacity: 0, x: -20 };
      if (dir === 'backward') return { opacity: 0, x: 20 };
      return { opacity: 0, y: -6 };
    },
  };

  const navSections: NavSection[] = [
    {
      title: 'Workspace',
      items: [
        { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
        { id: 'agents', label: 'Voice Assistants', icon: Bot },
        { id: 'phone-numbers', label: 'Carrier Numbers', icon: Phone },
        { id: 'calls', label: 'Call Logs', icon: PhoneCall },
        { id: 'web-voice', label: 'Voice Studio', icon: Radio, badge: 'Live' },
      ],
    },
    {
      title: 'Infrastructure',
      items: [
        { id: 'api-usage', label: 'Usage & Carrier Health', icon: KeyRound },
        { id: 'settings', label: 'Settings & BYOK', icon: Settings },
      ],
    },
  ];

  const activeNavLabel =
    navSections.flatMap((s) => s.items).find((i) => i.id === currentView)?.label ||
    currentView.replace('-', ' ');

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#090B10] flex text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* 1. LEFT SIDEBAR */}
      <aside
        className={`hidden md:flex flex-col bg-white dark:bg-[#0D1017] border-r border-slate-200/80 dark:border-white/[0.06] transition-all duration-300 z-30 select-none ${
          sidebarCollapsed ? 'w-[74px]' : 'w-64'
        }`}
      >
        {/* Sidebar Header / Logo */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.06]">
          <div
            onClick={onBackToWebsite}
            className="cursor-pointer flex items-center gap-2"
            title="Return to Public Website"
          >
            <Logo size="sm" showTagline={!sidebarCollapsed} />
          </div>
        </div>

        {/* Active Workspace Selector */}
        {!sidebarCollapsed && (
          <div className="relative px-3 pt-4">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/70 dark:border-indigo-500/20 flex items-center justify-center shrink-0">
                  <Blocks className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-slate-100 text-xs truncate leading-tight">
                    {currentBusiness.name}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono capitalize">
                    {currentBusiness.planId || 'Starter'} Plan
                  </p>
                </div>
              </div>
              {availableBusinesses.length > 1 && (
                <button
                  onClick={() => setShowBizDropdown(!showBizDropdown)}
                  className="p-1 hover:bg-slate-200/60 dark:hover:bg-white/[0.06] rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                  title="Switch Workspace"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {showBizDropdown && availableBusinesses.length > 1 && (
              <div className="absolute left-3 right-3 mt-1.5 p-1.5 bg-white dark:bg-[#0F1219] border border-slate-200 dark:border-white/[0.08] rounded-xl shadow-xl z-50 text-xs">
                <div className="px-2 py-1 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  Workspaces
                </div>
                {availableBusinesses.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      setShowBizDropdown(false);
                      onSelectBusiness(b);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs transition-colors cursor-pointer ${
                      b.id === currentBusiness.id
                        ? 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-semibold'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.04]'
                    }`}
                  >
                    <span className="truncate">{b.name}</span>
                    {b.id === currentBusiness.id && (
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400">Active</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-5 space-y-6 overflow-y-auto">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {!sidebarCollapsed && (
                <div className="px-3 pb-1.5 text-[10px] font-semibold tracking-[0.12em] uppercase text-slate-400 dark:text-slate-500">
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
                    className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors duration-150 cursor-pointer ${
                      isActive
                        ? 'text-indigo-700 dark:text-white font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-white/[0.03]'
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="sidebar-active-pill"
                        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                        className="absolute inset-0 rounded-xl bg-indigo-50 dark:bg-indigo-500/[0.12] border border-indigo-200/70 dark:border-indigo-500/25 z-0"
                      />
                    )}
                    <Icon
                      className={`w-4 h-4 shrink-0 relative z-10 ${
                        isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'
                      }`}
                    />
                    {!sidebarCollapsed && (
                      <span className="truncate relative z-10">{item.label}</span>
                    )}
                    {!sidebarCollapsed && item.badge && (
                      <span className="ml-auto relative z-10 text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-500/20">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar Collapse Toggle */}
        <div className="p-3 border-t border-slate-200/80 dark:border-white/[0.06]">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
            title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      {/* 2. MAIN VIEW AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 px-4 sm:px-6 bg-white/80 dark:bg-[#0D1017]/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/[0.06] flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.05] cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs">
              {currentView === 'create-agent' ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectView('agents')}
                    className="flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium cursor-pointer transition-colors group"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
                    <span>Voice Assistants</span>
                  </button>
                  <span className="text-slate-300 dark:text-slate-600">/</span>
                  <span className="font-semibold text-slate-900 dark:text-white">New Assistant</span>
                </div>
              ) : (
                <span className="text-slate-900 dark:text-slate-100 capitalize font-semibold text-sm tracking-tight">
                  {activeNavLabel}
                </span>
              )}
            </div>
          </div>

          {/* Right Header Controls — Clean & Uncluttered */}
          <div className="flex items-center gap-2.5">
            {/* Calm Carrier SLA Status */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] text-[11px] font-mono text-slate-600 dark:text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-breathe" />
              <span>Plivo SIP Online</span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">&lt;140ms</span>
            </div>

            {/* Wallet Credits Pill */}
            <button
              id="topbar-wallet-credits-btn"
              onClick={() => setWalletModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-white/[0.03] hover:bg-slate-50 dark:hover:bg-white/[0.07] border border-slate-200/90 dark:border-white/[0.08] rounded-xl transition-colors cursor-pointer"
              title="Prepaid Calling Credits (₹4.80/min)"
            >
              <Wallet className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>₹{walletBalance.toFixed(2)}</span>
            </button>

            <ThemeToggle size="md" />

            {/* Dispatch Call Button */}
            {onOpenDirectCall && (
              <button
                id="topbar-direct-call-btn"
                onClick={onOpenDirectCall}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-white/[0.04] hover:bg-slate-50 dark:hover:bg-white/[0.08] border border-slate-200/90 dark:border-white/[0.08] rounded-xl transition-colors cursor-pointer"
                title="Dispatch Outbound Carrier Call"
              >
                <PhoneCall className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Dispatch Call</span>
              </button>
            )}

            {/* Primary Action: Deploy Agent */}
            <button
              id="topbar-create-agent-btn"
              onClick={onOpenCreateAgent}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Assistant</span>
              <span className="sm:hidden">New</span>
            </button>

            {/* User Profile Menu */}
            {currentUser && (() => {
              const rawName = currentUser.name || 'Enterprise Admin';
              const cleanName =
                rawName.toLowerCase().includes('karthik') || rawName.toLowerCase().includes('venkat')
                  ? 'Enterprise Admin'
                  : rawName;
              return (
                <div className="relative">
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="flex items-center gap-2 p-1 pr-2 rounded-xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] hover:bg-slate-50 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                      {cleanName[0]?.toUpperCase() || 'A'}
                    </div>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-200 max-w-[100px] truncate hidden lg:inline">
                      {cleanName}
                    </span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {showUserDropdown && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#0F1219] border border-slate-200 dark:border-white/[0.08] rounded-xl shadow-xl p-1.5 z-50 text-xs">
                      <div className="px-3 py-2 border-b border-slate-100 dark:border-white/[0.06]">
                        <p className="font-semibold text-slate-900 dark:text-white truncate">
                          {currentUser.name}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-mono">
                          {currentUser.email}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          onSelectView('settings');
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.05] flex items-center gap-2 text-slate-700 dark:text-slate-200 cursor-pointer mt-1"
                      >
                        <Settings className="w-3.5 h-3.5 text-slate-400" />
                        <span>Settings & BYOK</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          onLogout();
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center gap-2 text-rose-600 dark:text-rose-400 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
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
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0D1017]/95 backdrop-blur-md border-t border-slate-200 dark:border-white/[0.07] px-3 py-1.5 flex items-center justify-around pb-safe select-none shadow-lg"
      >
        <button
          onClick={() => onSelectView('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors cursor-pointer ${
            currentView === 'dashboard'
              ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Home</span>
        </button>

        <button
          onClick={() => onSelectView('agents')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors cursor-pointer ${
            currentView === 'agents' || currentView === 'create-agent'
              ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Bot className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Agents</span>
        </button>

        <button
          onClick={onOpenDirectCall}
          className="flex flex-col items-center justify-center -mt-4 relative z-10 cursor-pointer"
        >
          <div className="w-11 h-11 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-md active:scale-95 transition-transform">
            <Phone className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 font-semibold text-indigo-600 dark:text-indigo-400">Call</span>
        </button>

        <button
          onClick={() => onSelectView('calls')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors cursor-pointer ${
            currentView === 'calls'
              ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <PhoneCall className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Logs</span>
        </button>

        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-slate-500 dark:text-slate-400 cursor-pointer"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Menu</span>
        </button>
      </nav>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 z-50 md:hidden bg-black/60 backdrop-blur-sm flex"
          >
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-72 bg-white dark:bg-[#0D1017] h-full p-4 flex flex-col justify-between shadow-2xl border-r border-slate-200 dark:border-white/[0.07]"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/[0.07]">
                  <Logo size="sm" />
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4 overflow-y-auto max-h-[70vh]">
                  {navSections.map((sec, i) => (
                    <div key={i} className="space-y-1">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2">
                        {sec.title}
                      </div>
                      {sec.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            onSelectView(item.id);
                            setMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium cursor-pointer ${
                            currentView === item.id
                              ? 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-semibold'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
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

              <div className="pt-4 border-t border-slate-200 dark:border-white/[0.07]">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <WalletModal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        onBalanceUpdated={(newBal) => setWalletBalance(newBal)}
      />
    </div>
  );
};
