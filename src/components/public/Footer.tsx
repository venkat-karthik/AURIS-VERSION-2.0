import React from 'react';
import { Logo } from '../common/Logo';

interface FooterProps {
  onNavigate: (page: string) => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenAuth }) => {
  return (
    <footer className="bg-white border-t border-[#DDEBEF] pt-16 pb-12 text-[#52636D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-12 border-b border-[#DDEBEF]">
          {/* Company Brand Column */}
          <div className="col-span-2 space-y-4">
            <Logo size="md" />
            <p className="text-sm text-[#52636D] max-w-sm leading-relaxed">
              Auris builds human-like AI voice agents that empower businesses to automate inbound customer calls, qualify leads, schedule appointments, and grow 24/7.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#EFFAF1] text-[#38A85B] border border-[#65C978]/30">
                <span className="w-2 h-2 rounded-full bg-[#38A85B] animate-ping" />
                Telephony Network Live
              </span>
              <span className="text-xs text-[#82919A]">Powered by OmniDimension Infrastructure</span>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#123047] mb-4">Product</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => onNavigate('product')} className="hover:text-[#2189C8] transition-colors">
                  AI Voice Agents
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('product')} className="hover:text-[#2189C8] transition-colors">
                  Inbound Receptionist
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('product')} className="hover:text-[#2189C8] transition-colors">
                  Outbound Campaigns
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('product')} className="hover:text-[#2189C8] transition-colors">
                  Web Voice Simulator
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('resources')} className="hover:text-[#2189C8] transition-colors">
                  Provider Abstraction
                </button>
              </li>
            </ul>
          </div>

          {/* Solutions Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#123047] mb-4">Solutions</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => onNavigate('solutions')} className="hover:text-[#2189C8] transition-colors">
                  Healthcare & Clinics
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('solutions')} className="hover:text-[#2189C8] transition-colors">
                  Fitness & Gyms
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('solutions')} className="hover:text-[#2189C8] transition-colors">
                  Real Estate Agencies
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('solutions')} className="hover:text-[#2189C8] transition-colors">
                  Hospitality & Stays
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('solutions')} className="hover:text-[#2189C8] transition-colors">
                  Restaurants & Dining
                </button>
              </li>
            </ul>
          </div>

          {/* Resources & Trust */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#123047] mb-4">Resources</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => onNavigate('pricing')} className="hover:text-[#2189C8] transition-colors">
                  Pricing Plans
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('resources')} className="hover:text-[#2189C8] transition-colors">
                  System Architecture
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('resources')} className="hover:text-[#2189C8] transition-colors">
                  Database & Security
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-[#2189C8] transition-colors">
                  About Auris
                </button>
              </li>
              <li>
                <button onClick={() => onOpenAuth('login')} className="hover:text-[#2189C8] transition-colors">
                  Customer Portal
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & nature philosophy */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#82919A]">
          <div className="flex items-center gap-6">
            <span>© 2026 Auris. All rights reserved.</span>
            <span>Built for a more connected tomorrow.</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => onNavigate('resources')} className="hover:text-[#123047]">Privacy Policy</button>
            <button onClick={() => onNavigate('resources')} className="hover:text-[#123047]">Terms of Service</button>
            <button onClick={() => onNavigate('resources')} className="hover:text-[#123047]">Security Standards</button>
          </div>
        </div>
      </div>
    </footer>
  );
};
