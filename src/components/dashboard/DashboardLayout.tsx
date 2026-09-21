import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from '../common/Logo';
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
    <div className="min-h-screen bg-[#F5FAFC] flex text-[#123047]">
      {/* 1. LEFT SIDEBAR (Desktop) */}
      <aside
        className={`hidden md:flex flex-col bg-white border-r border-[#DDEBEF] transition-all duration-300 z-30 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Sidebar Header / Logo */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-[#DDEBEF]">
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
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#EEF8FC] text-[#2189C8] font-bold shadow-xs'
                    : item.highlight
                    ? 'text-[#38A85B] hover:bg-[#EFFAF1]'
                    : 'text-[#52636D] hover:text-[#123047] hover:bg-[#F5FAFC]'
                }`}
                title={item.label}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#2189C8]' : ''}`} />
                {!sidebarCollapsed && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}
                {!sidebarCollapsed && item.highlight && (
                  <span className="w-2 h-2 rounded-full bg-[#38A85B] animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom User & Help Section */}
        <div className="p-3 border-t border-[#DDEBEF] space-y-2">
          <button
            onClick={() => onSelectView('architecture')}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#82919A] hover:text-[#123047] rounded-lg hover:bg-[#F5FAFC]"
          >
            <HelpCircle className="w-4 h-4 flex-shrink-0" />
            {!sidebarCollapsed && <span>Help & Docs</span>}
          </button>

          {/* User Profile Card */}
          <div className="p-2.5 rounded-xl bg-[#F5FAFC] border border-[#DDEBEF] flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              />
              {!sidebarCollapsed && (
                <div className="truncate text-left">
                  <p className="text-xs font-bold text-[#123047] truncate">{currentUser.name}</p>
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
        <header className="h-20 bg-white border-b border-[#DDEBEF] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 sticky top-0 z-20">
          {/* Mobile menu button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-[#52636D] hover:text-[#123047] rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Global Search Input */}
            <div className="relative w-64 lg:w-80">
              <Search className="w-4 h-4 text-[#82919A] absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search calls, agents, numbers..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-[#F5FAFC] border border-[#DDEBEF] text-[#123047] focus:outline-none focus:border-[#2189C8] transition-colors"
              />
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">
            {/* Quick Action: Talk to Auris Live */}
            <button
              id="topbar-live-call-btn"
              onClick={onOpenWebVoice}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#38A85B] bg-[#EFFAF1] hover:bg-[#def5e3] border border-[#65C978]/30 rounded-xl transition-all cursor-pointer"
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
                className="p-2 text-[#52636D] hover:text-[#123047] hover:bg-[#F5FAFC] rounded-xl relative transition-colors"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#38A85B]" />
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-[#DDEBEF] rounded-2xl shadow-xl p-4 z-50 text-xs space-y-3">
                  <div className="flex justify-between items-center font-bold text-[#123047]">
                    <span>Notifications</span>
                    <span className="text-[10px] text-[#2189C8] font-normal">Mark all read</span>
                  </div>
                  <div className="space-y-2">
                    <div className="p-2 rounded-lg bg-[#F5FAFC] border border-[#DDEBEF]">
                      <p className="font-semibold text-[#123047]">Appointment Booked</p>
                      <p className="text-[#52636D] text-[11px]">Dr. Mehta booked for Rajesh Sharma via Receptionist.</p>
                    </div>
                    <div className="p-2 rounded-lg bg-[#F5FAFC] border border-[#DDEBEF]">
                      <p className="font-semibold text-[#123047]">Monthly Quota Alert</p>
                      <p className="text-[#52636D] text-[11px]">845 of 1,000 minutes utilized (84.5%).</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Business Selector Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowBizDropdown(!showBizDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#DDEBEF] bg-[#F5FAFC] hover:bg-[#EEF8FC] text-xs font-semibold text-[#123047] transition-all cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-[#38A85B]" />
                <span className="max-w-[120px] truncate">{currentBusiness.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#82919A]" />
              </button>

              {showBizDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-[#DDEBEF] rounded-2xl shadow-xl p-2 z-50 text-xs">
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
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between ${
                        biz.id === currentBusiness.id
                          ? 'bg-[#EEF8FC] text-[#2189C8] font-bold'
                          : 'text-[#52636D] hover:bg-[#F5FAFC]'
                      }`}
                    >
                      <span className="truncate">{biz.name}</span>
                      <span className="text-[10px] text-[#82919A]">{biz.industry}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Back to Public Site link */}
            <button
              onClick={onBackToWebsite}
              className="text-xs font-semibold text-[#52636D] hover:text-[#123047] flex items-center gap-1 border-l border-[#DDEBEF] pl-3"
              title="View Public Marketing Website"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Website</span>
            </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="w-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* 3. MOBILE SLIDEOUT MENU */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-[#123047]/50 backdrop-blur-xs flex md:hidden">
          <div className="w-72 bg-white h-full p-4 flex flex-col justify-between shadow-2xl">
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-[#DDEBEF]">
                <Logo size="sm" />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-[#82919A]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
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
                          ? 'bg-[#EEF8FC] text-[#2189C8] font-bold'
                          : 'text-[#52636D] hover:bg-[#F5FAFC]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-[#DDEBEF] space-y-2">
              <button
                onClick={onBackToWebsite}
                className="w-full py-2 text-xs font-bold text-[#2189C8] bg-[#EEF8FC] rounded-lg"
              >
                Public Website
              </button>
              <button
                onClick={onLogout}
                className="w-full py-2 text-xs font-medium text-red-600 rounded-lg"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
