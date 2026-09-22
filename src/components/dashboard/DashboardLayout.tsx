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
  ExternalLink,
  Layers,
  Menu,
  X,
  Sparkles,
  Radio,
  Calendar,
  Award,
} from 'lucide-react';

interface DashboardLayoutProps {
  currentView: string;
  onSelectView: (view: string) => void;
  currentUser: User;
  currentBusiness: Business;
  availableBusinesses: Business[];
  onSelectBusiness: (biz: Business) => void;
  onLogout: () => void;
  onBackToWebsite: () => void;
  onOpenCreateAgent: () => void;
  onOpenWebVoice: () => void;
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
  children,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showBizDropdown, setShowBizDropdown] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'agents', label: 'AI Agents', icon: Bot },
    { id: 'call-scheduling', label: 'Call Scheduling', icon: Calendar, badge: 'New' },
    { id: 'agent-performance', label: 'Agent Performance', icon: Award, badge: 'AI' },
    { id: 'phone-numbers', label: 'Phone Numbers', icon: Phone },
    { id: 'calls', label: 'Calls', icon: PhoneCall },
    { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
    { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen },
    { id: 'web-voice', label: 'Talk to Auris (Live)', icon: Mic, highlight: true },
    { id: 'integrations', label: 'Integrations', icon: Blocks },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'architecture', label: 'System Architecture', icon: Layers },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F5FAFC] dark:bg-[#0A1120] flex text-[#123047] dark:text-[#F1F5F9] transition-colors duration-200">
      {/* 1. LEFT SIDEBAR (Desktop) */}
      <aside
        className={`hidden md:flex flex-col bg-white dark:bg-[#0B132B] border-r border-[#DDEBEF] dark:border-[#1E2E4A] transition-all duration-300 z-30 select-none ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Sidebar Header / Logo */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-[#DDEBEF] dark:border-[#1E2E4A]">
          <div
            onClick={onBackToWebsite}
            className="cursor-pointer"
            title="Return to Public Website"
          >
            <Logo size="sm" showTagline={!sidebarCollapsed} />
          </div>
        </div>

        {/* Navigation Items List */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => onSelectView(item.id)}
                className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#EEF8FC] dark:bg-[#162742] text-[#2189C8] dark:text-[#55B9E8] font-bold shadow-xs'
                    : item.highlight
                    ? 'text-[#38A85B] hover:bg-[#EFFAF1] dark:hover:bg-[#0E281C]'
                    : 'text-[#52636D] dark:text-[#94A3B8] hover:text-[#123047] dark:hover:text-white hover:bg-[#F5FAFC] dark:hover:bg-[#13203A]'
                }`}
                title={item.label}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#2189C8] dark:text-[#55B9E8]' : ''}`} />
                {!sidebarCollapsed && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}
                {!sidebarCollapsed && (item as any).badge && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#E0F2FE] text-[#0284C7] dark:bg-[#0C2A4A] dark:text-[#38BDF8]">
                    {(item as any).badge}
                  </span>
                )}
                {!sidebarCollapsed && item.highlight && (
                  <span className="w-2 h-2 rounded-full bg-[#38A85B] animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom User & Help Section */}
        <div className="p-3 border-t border-[#DDEBEF] dark:border-[#1E2E4A] space-y-2">
          <button
            onClick={() => onSelectView('architecture')}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#82919A] dark:text-[#64748B] hover:text-[#123047] dark:hover:text-white rounded-lg hover:bg-[#F5FAFC] dark:hover:bg-[#13203A] transition-colors"
          >
            <HelpCircle className="w-4 h-4 flex-shrink-0" />
            {!sidebarCollapsed && <span>Help & Docs</span>}
          </button>

          {/* User Profile Card */}
          <div className="p-2.5 rounded-xl bg-[#F5FAFC] dark:bg-[#111C38] border border-[#DDEBEF] dark:border-[#1E2E4A] flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover flex-shrink-0 ring-1 ring-[#DDEBEF] dark:ring-[#1E2E4A]"
              />
              {!sidebarCollapsed && (
                <div className="truncate text-left">
                  <p className="text-xs font-bold text-[#123047] dark:text-white truncate">{currentUser.name}</p>
                  <p className="text-[10px] text-[#38A85B] font-semibold">Business Plan</p>
                </div>
              )}
            </div>

            {!sidebarCollapsed && (
              <button
                onClick={onLogout}
                className="p-1 text-[#82919A] hover:text-red-600 rounded cursor-pointer transition-colors"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar Header */}
        <header className="h-20 bg-white/90 dark:bg-[#0B132B]/90 backdrop-blur-xl border-b border-[#DDEBEF] dark:border-[#1E2E4A] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 sticky top-0 z-20 transition-colors">
          {/* Mobile menu button & Search */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-[#52636D] dark:text-[#94A3B8] hover:text-[#123047] rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Global Search Input */}
            <div className="relative w-56 sm:w-64 lg:w-80">
              <Search className="w-4 h-4 text-[#82919A] absolute left-3.5 top-2.5" />
              <input
                type="text"
                placeholder="Search calls, agents, numbers..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-[#F5FAFC] dark:bg-[#111C38] border border-[#DDEBEF] dark:border-[#1E2E4A] text-[#123047] dark:text-white focus:outline-none focus:border-[#2189C8] transition-colors"
              />
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Dark/Light Theme Toggle */}
            <ThemeToggle size="md" />

            {/* Quick Action: Talk to Auris Live */}
            <button
              id="topbar-live-call-btn"
              onClick={onOpenWebVoice}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#38A85B] bg-[#EFFAF1] dark:bg-[#0E281C] hover:bg-[#def5e3] dark:hover:bg-[#143B29] border border-[#65C978]/30 rounded-xl transition-all cursor-pointer"
            >
              <Mic className="w-3.5 h-3.5 animate-pulse" />
              Test Call (Live)
            </button>

            {/* Quick Action: Create Agent */}
            <button
              id="topbar-create-agent-btn"
              onClick={onOpenCreateAgent}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#38A85B] hover:bg-[#2f8f4d] rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Agent</span>
            </button>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 text-[#52636D] dark:text-[#94A3B8] hover:text-[#123047] dark:hover:text-white hover:bg-[#F5FAFC] dark:hover:bg-[#111C38] rounded-xl relative transition-colors"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#38A85B]" />
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#111C38] border border-[#DDEBEF] dark:border-[#1E2E4A] rounded-2xl shadow-xl p-4 z-50 text-xs space-y-3 animate-in fade-in">
                  <div className="flex justify-between items-center font-bold text-[#123047] dark:text-white">
                    <span>Notifications</span>
                    <span className="text-[10px] text-[#2189C8] font-normal cursor-pointer">Mark all read</span>
                  </div>
                  <div className="space-y-2">
                    <div className="p-2 rounded-lg bg-[#F5FAFC] dark:bg-[#16223F] border border-[#DDEBEF] dark:border-[#1E2E4A]">
                      <p className="font-semibold text-[#123047] dark:text-white">Appointment Booked</p>
                      <p className="text-[#52636D] dark:text-[#94A3B8] text-[11px]">Dr. Mehta booked for Rajesh Sharma via Receptionist.</p>
                    </div>
                    <div className="p-2 rounded-lg bg-[#F5FAFC] dark:bg-[#16223F] border border-[#DDEBEF] dark:border-[#1E2E4A]">
                      <p className="font-semibold text-[#123047] dark:text-white">Carrier Trunk SLA</p>
                      <p className="text-[#52636D] dark:text-[#94A3B8] text-[11px]">OmniDimension SIP latency averaging 272ms.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Business Selector Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowBizDropdown(!showBizDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#DDEBEF] dark:border-[#1E2E4A] bg-[#F5FAFC] dark:bg-[#111C38] hover:bg-[#EEF8FC] dark:hover:bg-[#162742] text-xs font-semibold text-[#123047] dark:text-white transition-all cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-[#38A85B]" />
                <span className="max-w-[120px] truncate">{currentBusiness.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#82919A]" />
              </button>

              {showBizDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#111C38] border border-[#DDEBEF] dark:border-[#1E2E4A] rounded-2xl shadow-xl p-2 z-50 text-xs animate-in fade-in">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-[#82919A] uppercase tracking-wider">
                    Switch Workspace
                  </div>
                  {availableBusinesses.map((biz) => (
                    <button
                      key={biz.id}
                      onClick={() => {
                        onSelectBusiness(biz);
                        setShowBizDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#F5FAFC] dark:hover:bg-[#16223F] flex items-center justify-between cursor-pointer"
                    >
                      <span className={biz.id === currentBusiness.id ? 'font-bold text-[#2189C8]' : 'text-[#52636D] dark:text-[#94A3B8]'}>
                        {biz.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Animated Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
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
              className="fixed inset-0 bg-[#123047]/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-72 bg-white dark:bg-[#0B132B] h-full shadow-2xl flex flex-col z-10 border-r border-[#DDEBEF] dark:border-[#1E2E4A]"
            >
              <div className="p-4 border-b border-[#DDEBEF] dark:border-[#1E2E4A] flex items-center justify-between">
                <Logo size="sm" />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-[#82919A] hover:text-[#123047]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectView(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                        isActive
                          ? 'bg-[#EEF8FC] dark:bg-[#162742] text-[#2189C8] font-bold'
                          : 'text-[#52636D] dark:text-[#94A3B8] hover:bg-[#F5FAFC]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="flex-1 text-left">{item.label}</span>
                      {(item as any).badge && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#E0F2FE] text-[#0284C7] dark:bg-[#0C2A4A] dark:text-[#38BDF8]">
                          {(item as any).badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-[#DDEBEF] dark:border-[#1E2E4A] space-y-2">
                <button
                  onClick={() => {
                    onBackToWebsite();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 text-xs font-bold text-[#2189C8] bg-[#EEF8FC] dark:bg-[#162742] rounded-xl text-center block"
                >
                  Back to Website
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
