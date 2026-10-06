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
  Bug,
  Folder,
  Blocks,
  ArrowLeft,
  User as UserIcon,
  Menu,
  LayoutDashboard,
  Users,
  UserCheck,
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
  onOpenWebVoice: () => void;
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
  onOpenWebVoice,
  onOpenDirectCall,
  children,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showBizDropdown, setShowBizDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Directional navigation tracking for fluid page switches (drill-in vs back vs lateral)
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
      } else if (
        (previousView === 'calls' || previousView === 'agents') &&
        currentView === 'web-voice'
      ) {
        setDirection('forward');
      } else if (
        previousView === 'web-voice' &&
        (currentView === 'calls' || currentView === 'agents')
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
        return {
          opacity: 0,
          x: 28,
          scale: 0.99,
          filter: 'blur(2px)',
        };
      }
      if (dir === 'backward') {
        return {
          opacity: 0,
          x: -28,
          scale: 0.99,
          filter: 'blur(2px)',
        };
      }
      return {
        opacity: 0,
        y: 10,
        scale: 0.995,
        filter: 'blur(1px)',
      };
    },
    center: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
    },
    exit: (dir: 'forward' | 'backward' | 'lateral') => {
      if (dir === 'forward') {
        return {
          opacity: 0,
          x: -24,
          scale: 0.99,
          filter: 'blur(2px)',
        };
      }
      if (dir === 'backward') {
        return {
          opacity: 0,
          x: 24,
          scale: 0.99,
          filter: 'blur(2px)',
        };
      }
      return {
        opacity: 0,
        y: -8,
        scale: 0.995,
        filter: 'blur(1px)',
      };
    },
  };

  const isOperator = currentUser?.role === 'super_admin' || currentUser?.role === 'admin' || currentUser?.role === 'owner';

  // Role-Aware Navigation: Separates Client Business View from Velfound Operator
  const navSections: NavSection[] = [
    {
      title: 'BUSINESS & OUTCOMES',
      items: [
        { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
        { id: 'leads', label: 'Leads Pipeline', icon: Users, badge: 'New', highlight: true },
        { id: 'calls', label: 'Call History & Transcripts', icon: PhoneCall },
        { id: 'campaigns', label: 'Outbound Campaigns', icon: Megaphone },
        { id: 'analytics', label: 'Business Analytics', icon: BarChart3 },
      ],
    },
    {
      title: 'AI EMPLOYEE MANAGEMENT',
      items: [
        { id: 'agents', label: 'AI Voice Employees', icon: Bot, badge: 'Active' },
        ...(isOperator ? [{ id: 'create-agent', label: 'Configure Agent Prompt', icon: Plus }] : []),
        { id: 'web-voice', label: 'Test Agent (Mic)', icon: Mic },
        { id: 'knowledge', label: 'Knowledge Base', icon: Folder },
      ],
    },
    ...(isOperator
      ? [
          {
            title: 'OPERATOR TELEPHONY & MESH',
            items: [
              { id: 'phone-numbers', label: 'Telephony Carrier Trunks', icon: Phone },
              { id: 'clone-voice', label: 'Voice Models & Cloning', icon: Mic },
              { id: 'integrations', label: 'Webhook & n8n Sync', icon: Blocks },
              { id: 'settings', label: 'Provider API Keys', icon: Settings },
            ],
          },
        ]
      : []),
    {
      title: 'ACCOUNT & USAGE',
      items: [
        { id: 'billing', label: 'Usage & Minute Quota', icon: CreditCard },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#070D18] flex text-slate-950 dark:text-slate-100 transition-colors duration-200">
      {/* 1. LEFT SIDEBAR */}
      <aside
        className={`hidden md:flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200/90 dark:border-slate-800 transition-all duration-300 z-30 select-none ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Sidebar Header / Logo */}
        <div className="h-18 px-5 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800">
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
                <div className="px-3 pb-1 text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">
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
                    className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      isActive
                        ? 'text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
                    }`}
                    title={item.label}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="sidebarActiveBackground"
                        className="absolute inset-0 bg-slate-900 dark:bg-slate-800 rounded-xl shadow-xs"
                        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                      />
                    )}

                    <Icon
                      className={`w-4 h-4 shrink-0 relative z-10 ${
                        isActive ? 'text-emerald-400' : 'text-slate-400'
                      }`}
                    />
                    {!sidebarCollapsed && (
                      <span className="truncate flex-1 text-left relative z-10">{item.label}</span>
                    )}

                    {!sidebarCollapsed && item.badge && (
                      <span
                        className={`relative z-10 px-1.5 py-0.2 rounded text-[9px] font-bold ${
                          isActive
                            ? 'bg-slate-700 text-emerald-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom Sidebar Footer Controls */}
        <div className="p-3 border-t border-slate-200/80 dark:border-slate-800 space-y-1">
          {/* Back to Website Button */}
          <button
            onClick={onBackToWebsite}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 shrink-0 text-slate-400" />
            {!sidebarCollapsed && <span>Public Website</span>}
          </button>

          {/* Collapse Sidebar Button */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4 shrink-0 text-slate-400" />
            ) : (
              <ChevronLeft className="w-4 h-4 shrink-0 text-slate-400" />
            )}
            {!sidebarCollapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* 2. MAIN APPLICATION CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-18 bg-white dark:bg-slate-900 border-b border-slate-200/90 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between z-20 shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <Logo size="sm" showTagline={false} />
            </button>

            {/* Breadcrumb / Workspace Name */}
            <div className="hidden sm:flex items-center gap-2 text-xs">
              <span className="font-extrabold text-slate-900 dark:text-white">
                {currentBusiness.name}
              </span>
              <span className="text-slate-300 dark:text-slate-700">/</span>
              {currentView === 'create-agent' ? (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onSelectView('agents')}
                    className="flex items-center gap-1 text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 font-semibold cursor-pointer transition-colors group"
                  >
                    <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-0.5 text-emerald-500" />
                    <span>Voice AI Assistants</span>
                  </button>
                  <span className="text-slate-300 dark:text-slate-700">/</span>
                  <motion.span
                    initial={{ opacity: 0, x: 6 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="font-bold text-slate-900 dark:text-white"
                  >
                    Create Agent Builder
                  </motion.span>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.span
                    key={currentView}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="text-slate-500 dark:text-slate-400 capitalize font-medium"
                  >
                    {navSections.flatMap((s) => s.items).find((i) => i.id === currentView)?.label || currentView.replace('-', ' ')}
                  </motion.span>
                </AnimatePresence>
              )}
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Carrier SLA Status Indicator */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Carrier SIP: Online</span>
              <span className="text-emerald-500">•</span>
              <span className="font-mono text-[11px]">142ms</span>
            </div>

            {/* Dark/Light Theme Toggle */}
            <ThemeToggle size="md" />

            {/* Quick Action: Direct Phone Call */}
            {onOpenDirectCall && (
              <button
                id="topbar-direct-call-btn"
                onClick={onOpenDirectCall}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
                title="Call Any Physical Phone Directly via Carrier"
              >
                <PhoneCall className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden sm:inline">Direct Call</span>
              </button>
            )}

            {/* Quick Action: Test Call */}
            <button
              id="topbar-live-call-btn"
              onClick={onOpenWebVoice}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Test Call (Live)</span>
            </button>

            {/* Authenticated User Menu */}
            {currentUser && (
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                      {currentUser.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[100px] truncate hidden sm:inline">
                    {currentUser.name}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2 z-50 text-xs animate-in fade-in">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="font-bold text-slate-950 dark:text-white truncate">
                        {currentUser.name}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {currentUser.email}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        onSelectView('settings');
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-300 cursor-pointer mt-1"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>Workspace Settings</span>
                    </button>

                    <button
                      onClick={() => {
                        onLogout();
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 text-rose-600 dark:text-rose-400 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Dynamic Animated Content Body */}
        <main ref={mainRef} className="flex-1 overflow-y-auto p-3.5 sm:p-6 lg:p-8 pb-24 md:pb-8">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentView}
              custom={direction}
              variants={viewVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                duration: 0.26,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="w-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (App-like 1-tap switching) */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/90 dark:border-slate-800 px-3 py-1.5 flex items-center justify-around pb-safe select-none shadow-lg"
      >
        <button
          onClick={() => onSelectView('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer relative ${
            currentView === 'dashboard'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          {currentView === 'dashboard' && (
            <motion.div
              layoutId="mobileNavActivePill"
              className="absolute inset-0 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
          <BarChart3 className="w-5 h-5 relative z-10" />
          <span className="text-[10px] mt-0.5 relative z-10 font-medium">Home</span>
        </button>

        <button
          onClick={() => onSelectView('agents')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer relative ${
            currentView === 'agents' || currentView === 'create-agent'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          {(currentView === 'agents' || currentView === 'create-agent') && (
            <motion.div
              layoutId="mobileNavActivePill"
              className="absolute inset-0 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
          <Bot className="w-5 h-5 relative z-10" />
          <span className="text-[10px] mt-0.5 relative z-10 font-medium">Agents</span>
        </button>

        <button
          onClick={onOpenWebVoice}
          className="flex flex-col items-center justify-center -mt-5 relative z-10 cursor-pointer"
        >
          <div className="w-11 h-11 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-md active:scale-95 transition-transform">
            <Mic className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 font-bold text-emerald-600 dark:text-emerald-400">Live Test</span>
        </button>

        <button
          onClick={() => onSelectView('calls')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer relative ${
            currentView === 'calls'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          {currentView === 'calls' && (
            <motion.div
              layoutId="mobileNavActivePill"
              className="absolute inset-0 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
          <PhoneCall className="w-5 h-5 relative z-10" />
          <span className="text-[10px] mt-0.5 relative z-10 font-medium">Calls</span>
        </button>

        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-slate-500 dark:text-slate-400 cursor-pointer"
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
            className="fixed inset-0 z-50 md:hidden bg-slate-950/60 backdrop-blur-xs flex"
          >
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              onClick={(e) => e.stopPropagation()}
              className="w-72 bg-white dark:bg-slate-900 h-full p-4 flex flex-col justify-between shadow-2xl"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <Logo size="sm" />
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 text-slate-400 hover:text-slate-950 dark:hover:text-white"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4 overflow-y-auto max-h-[70vh]">
                  {navSections.map((sec, i) => (
                    <div key={i} className="space-y-1">
                      <div className="text-[10px] font-bold uppercase text-slate-400 px-2">
                        {sec.title}
                      </div>
                      {sec.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            onSelectView(item.id);
                            setMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold ${
                            currentView === item.id
                              ? 'bg-slate-900 text-white dark:bg-slate-800'
                              : 'text-slate-600 dark:text-slate-400'
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

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <button
                  onClick={() => {
                    onBackToWebsite();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Website
                </button>
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
