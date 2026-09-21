import React, { useState } from 'react';
import { Logo } from '../common/Logo';
import { Menu, X, ArrowRight, Sparkles, PhoneCall } from 'lucide-react';

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

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'product', label: 'Product' },
    { id: 'solutions', label: 'Solutions' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'resources', label: 'Resources' },
    { id: 'about', label: 'About' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#DDEBEF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          id="navbar-logo-btn"
          onClick={() => onNavigate('home')}
          className="cursor-pointer"
        >
          <Logo size="md" />
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = currentTab === link.id;
            return (
              <button
                key={link.id}
                id={`nav-link-${link.id}`}
                onClick={() => onNavigate(link.id)}
                className={`text-sm font-medium transition-colors cursor-pointer py-1 relative ${
                  isActive
                    ? 'text-[#2189C8] font-semibold'
                    : 'text-[#52636D] hover:text-[#123047]'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2189C8] rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <button
            id="nav-demo-dashboard-btn"
            onClick={onEnterDemoDashboard}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#2189C8] bg-[#EEF8FC] hover:bg-[#DDEBEF] rounded-lg border border-[#55B9E8]/30 transition-all cursor-pointer"
            title="Open interactive customer dashboard"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#2189C8]" />
            Dashboard
          </button>

          <button
            id="nav-signin-btn"
            onClick={() => onOpenAuth('login')}
            className="px-4 py-2 text-sm font-medium text-[#123047] hover:text-[#2189C8] transition-colors cursor-pointer"
          >
            Sign in
          </button>

          <button
            id="nav-getstarted-btn"
            onClick={() => onOpenAuth('signup')}
            className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white bg-[#38A85B] hover:bg-[#2f8f4d] shadow-sm hover:shadow transition-all rounded-lg cursor-pointer"
          >
            Get Started
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="md:hidden flex items-center gap-2">
          <button
            id="nav-mobile-demo-btn"
            onClick={onEnterDemoDashboard}
            className="p-2 text-xs font-semibold text-[#2189C8] bg-[#EEF8FC] rounded-lg"
          >
            App
          </button>
          <button
            id="nav-mobile-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#123047] hover:text-[#2189C8] rounded-lg focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#DDEBEF] px-4 pt-2 pb-6 space-y-3 shadow-lg">
          <div className="grid grid-cols-2 gap-2 py-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  onNavigate(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`text-left px-3 py-2 text-sm rounded-lg ${
                  currentTab === link.id
                    ? 'bg-[#EEF8FC] text-[#2189C8] font-semibold'
                    : 'text-[#52636D] hover:bg-[#F5FAFC]'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>
          <div className="pt-2 border-t border-[#DDEBEF] flex flex-col gap-2.5">
            <button
              onClick={() => {
                onEnterDemoDashboard();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-[#2189C8] bg-[#EEF8FC] rounded-lg"
            >
              <Sparkles className="w-4 h-4" />
              Open Live Dashboard
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onOpenAuth('login');
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-2.5 text-sm font-medium border border-[#DDEBEF] text-[#123047] rounded-lg"
              >
                Sign in
              </button>
              <button
                onClick={() => {
                  onOpenAuth('signup');
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-2.5 text-sm font-semibold text-white bg-[#38A85B] rounded-lg flex items-center justify-center gap-1"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
