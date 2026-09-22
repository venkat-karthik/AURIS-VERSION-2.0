import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from '../common/Logo';
import { ThemeToggle } from '../common/ThemeToggle';
import { User, Business } from '../../types';
import {
  LayoutDashboard,
  Bot,
  Phone,
  PhoneCall,
  Megaphone,
  BookOpen,
  Mic,
  Blocks,
  BarChart3,
  CreditCard,
  Settings,
  HelpCircle,
  LogOut,
  Bell,
  Search,
  ChevronDown,
  Plus,
  Layers,
  Menu,
  X,
  Sparkles,
  Radio,
  Calendar,
  Award,
  Lock,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

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
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onDemoLogin?: () => void;
  children: React.ReactNode;
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
  onOpenAuth,
  onDemoLogin,
  children,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showBizDropdown, setShowBizDropdown] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Grouped Navigation for high visual clarity and zero clumsiness
  const navSections = [
    {
      title: 'OPERATIONS',
      items: [
        { id: 'dashboard', label: 'Console Overview', icon: LayoutDashboard },
        { id: 'agents', label: 'AI Voice Agents', icon: Bot, badge: 'Live' },
        { id: 'web-voice', label: 'Talk to Auris (Live)', icon: Mic, highlight: true },
      ],
    },
    {
      title: 'TELEPHONY & OUTREACH',
      items: [
        { id: 'phone-numbers', label: 'Phone Numbers', icon: Phone },
        { id: 'calls', label: 'Call Records & Audio', icon: PhoneCall },
        { id: 'call-scheduling', label: 'Call Scheduling', icon: Calendar, badge: 'AI' },
        { id: 'campaigns', label: 'Outbound Campaigns', icon: Megaphone },
      ],
    },
    {
      title: 'INTELLIGENCE & QUALITY',
      items: [
        { id: 'knowledge', label: 'Knowledge Base (RAG)', icon: BookOpen },
        { id: 'agent-performance', label: 'Coaching & QA', icon: Award },
        { id: 'analytics', label: 'Telephony Analytics', icon: BarChart3 },
      ],
    },
    {
      title: 'SYSTEM & GOVERNANCE',
      items: [
        { id: 'integrations', label: 'CRM & Webhooks', icon: Blocks },
        { id: 'architecture', label: 'Cloud Topology', icon: Layers },
        { id: 'billing', label: 'Minutes & Billing', icon: CreditCard },
        { id: 'settings', label: 'Settings & Security', icon: Settings },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070D18] flex text-slate-950 dark:text-slate-100 transition-colors duration-200">
      {/* 1. LEFT SIDEBAR (Desktop) */}
      <aside
        className={`hidden md:flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200/90 dark:border-slate-800 transition-all duration-300 z-30 select-none ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Sidebar Header / Logo */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800">
          <div
            onClick={onBackToWebsite}
            className="cursor-pointer"
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
                <div className="px-3 pb-1 text-[10px] font-black tracking-wider uppercase text-slate-400 dark:text-slate-500">
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
                    className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-slate-900 text-white dark:bg-slate-800 dark:text-white shadow-xs'
                        : item.highlight
                        ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50/70 dark:bg-emerald-950/40 hover:bg-emerald-100/70 dark:hover:bg-emerald-950/80'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
                    }`}
                    title={item.label}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive
                          ? 'text-emerald-400'
                          : item.highlight
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : ''
                      }`}
                    />
                    {!sidebarCollapsed && (
                      <span className="truncate flex-1 text-left">{item.label}</span>
                    )}

                    {!sidebarCollapsed && (item as any).badge && (
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold ${
                          isActive
                            ? 'bg-slate-700 text-emerald-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                        }`}
                      >
                        {(item as any).badge}
                      </span>
                    )}

                    {!sidebarCollapsed && item.highlight && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom User & Help Section */}
        <div className="p-3 border-t border-slate-200/80 dark:border-slate-800 space-y-2">
          <button
            onClick={() => onSelectView('architecture')}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span>System Topology & Docs</span>}
          </button>

          {/* User Profile Card OR Guest Preview Card */}
          {currentUser ? (
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <img
                  src={
                    currentUser.avatar ||
                    `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80`
                  }
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-slate-300 dark:ring-slate-700"
                />
                {!sidebarCollapsed && (
                  <div className="truncate text-left">
                    <p className="text-xs font-extrabold text-slate-950 dark:text-white truncate">
                      {currentUser.name}
                    </p>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Pro Business
                    </p>
                  </div>
                )}
              </div>

              {!sidebarCollapsed && (
                <button
                  onClick={onLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg cursor-pointer transition-colors"
                  title="Sign out of Auris"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-800/80 dark:to-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 flex items-center justify-center shrink-0">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                {!sidebarCollapsed && (
                  <div className="truncate text-left">
                    <p className="text-xs font-black text-slate-900 dark:text-white">Guest Operator</p>
                    <p className="text-[10px] text-amber-700 dark:text-amber-400 font-bold">Preview Mode</p>
                  </div>
                )}
              </div>
              {!sidebarCollapsed && (
                <button
                  onClick={() => onOpenAuth('login')}
                  className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition-colors flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                >
                  <span>Log In to Unlock</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar Header */}
        <header className="h-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/90 dark:border-slate-800 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 sticky top-0 z-20 transition-colors">
          {/* Mobile menu button & Search */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:text-slate-950 rounded-lg"
              aria-label="Open mobile navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Global Search Input */}
            <div className="relative w-52 sm:w-64 lg:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
              <input
                type="text"
                placeholder="Search phone lines, transcripts, agents..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700 text-slate-950 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Carrier SLA Status Indicator */}
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-300">
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

            {/* Quick Action: Talk to Auris Live */}
            <button
              id="topbar-live-call-btn"
              onClick={currentUser ? onOpenWebVoice : () => onOpenAuth('login')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-950 border border-emerald-300/60 dark:border-emerald-800 rounded-xl transition-all cursor-pointer"
            >
              <Mic className="w-3.5 h-3.5 animate-pulse text-emerald-600" />
              Test Call (Live)
            </button>

            {/* Quick Action: Create Agent */}
            <button
              id="topbar-create-agent-btn"
              onClick={currentUser ? onOpenCreateAgent : () => onOpenAuth('signup')}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Agent</span>
            </button>

            {/* Unauthenticated Quick Login CTA vs Authenticated Controls */}
            {!currentUser ? (
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3 py-1.5 text-xs font-extrabold text-slate-800 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 cursor-pointer"
              >
                Sign In
              </button>
            ) : (
              <>
                {/* Notifications Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl relative transition-colors cursor-pointer"
                  >
                    <Bell className="w-4 h-4" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500" />
                  </button>

                  {notificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-4 z-50 text-xs space-y-3 animate-in fade-in">
                      <div className="flex justify-between items-center font-bold text-slate-950 dark:text-white">
                        <span>Telephony Events</span>
                        <span className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold cursor-pointer">
                          Clear all
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
                          <p className="font-extrabold text-slate-950 dark:text-white">Appointment Confirmed</p>
                          <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                            Dr. Mitchell auto-booked Rajesh Sharma for tomorrow at 10:30 AM.
                          </p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
                          <p className="font-extrabold text-slate-950 dark:text-white">Carrier Trunk Healthy</p>
                          <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                            SIP gateway round-trip latency verified at 142ms.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Business Selector Switcher */}
                <div className="relative">
                  <button
                    onClick={() => setShowBizDropdown(!showBizDropdown)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-slate-900 dark:text-white transition-all cursor-pointer"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="max-w-[120px] truncate">{currentBusiness.name}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {showBizDropdown && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2 z-50 text-xs animate-in fade-in">
                      <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Switch Location / Client
                      </div>
                      {availableBusinesses.map((biz) => (
                        <button
                          key={biz.id}
                          onClick={() => {
                            onSelectBusiness(biz);
                            setShowBizDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer"
                        >
                          <span
                            className={
                              biz.id === currentBusiness.id
                                ? 'font-bold text-emerald-600 dark:text-emerald-400'
                                : 'text-slate-600 dark:text-slate-400'
                            }
                          >
                            {biz.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </header>

        {/* Unauthenticated Feature Flowchart Mode Banner */}
        {!currentUser && (
          <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-sky-500/10 dark:from-amber-950/40 dark:via-emerald-950/40 dark:to-sky-950/40 border-b border-amber-300/40 dark:border-amber-800/40 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
              <span className="p-1 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300">
                <Lock className="w-3.5 h-3.5" />
              </span>
              <span className="font-bold">Feature Preview & Architecture Mode:</span>
              <span className="text-slate-600 dark:text-slate-400">
                Explore each feature's live data pipelines, architecture, and payloads. Sign in to access full interactive controls.
              </span>
            </div>
            <div className="flex items-center gap-2">
              {onDemoLogin && (
                <button
                  onClick={onDemoLogin}
                  className="px-3 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
                >
                  1-Click Demo Login
                </button>
              )}
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                Sign In to Access
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Animated Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-72 bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col z-10 border-r border-slate-200 dark:border-slate-800"
            >
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <Logo size="sm" />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-950 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
                {navSections.map((section, idx) => (
                  <div key={idx} className="space-y-1">
                    <p className="px-3 text-[10px] font-black uppercase text-slate-400">
                      {section.title}
                    </p>
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = currentView === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            onSelectView(item.id);
                            setMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold ${
                            isActive
                              ? 'bg-slate-900 text-white dark:bg-slate-800'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="flex-1 text-left">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </nav>

              <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <button
                  onClick={() => {
                    onBackToWebsite();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl text-center block"
                >
                  Return to Website
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
