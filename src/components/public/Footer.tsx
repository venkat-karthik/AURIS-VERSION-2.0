import React from 'react';
import { Logo } from '../common/Logo';

interface FooterProps {
  onNavigate: (page: string) => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenAuth }) => {
  return (
    <footer className="bg-white dark:bg-[#0B132B] border-t border-[#DDEBEF] dark:border-[#1E2E4A] pt-16 pb-12 text-[#52636D] dark:text-[#94A3B8] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-12 border-b border-[#DDEBEF] dark:border-[#1E2E4A]">
          {/* Company Brand Column */}
          <div className="col-span-2 space-y-4">
            <Logo size="md" />
            <p className="text-sm text-[#52636D] dark:text-[#94A3B8] max-w-sm leading-relaxed">
              Auris builds human-like AI voice agents that empower businesses to automate inbound customer calls, qualify leads, schedule appointments, and grow 24/7.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#EFFAF1] dark:bg-[#0F2D1F] text-[#38A85B] border border-[#65C978]/30">
                <span className="w-2 h-2 rounded-full bg-[#38A85B] animate-ping" />
                Carrier SIP Network Live
              </span>
              <span className="text-xs text-[#82919A] dark:text-[#64748B]">Powered by OmniDimension Infrastructure</span>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#123047] dark:text-white mb-4">Product</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => onNavigate('product')} className="hover:text-[#2189C8] dark:hover:text-[#55B9E8] transition-colors cursor-pointer">
                  AI Voice Agents
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('product')} className="hover:text-[#2189C8] dark:hover:text-[#55B9E8] transition-colors cursor-pointer">
                  Inbound Receptionist
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('product')} className="hover:text-[#2189C8] dark:hover:text-[#55B9E8] transition-colors cursor-pointer">
                  Outbound Campaigns
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('product')} className="hover:text-[#2189C8] dark:hover:text-[#55B9E8] transition-colors cursor-pointer">
                  Web Voice Simulator
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('resources')} className="hover:text-[#2189C8] dark:hover:text-[#55B9E8] transition-colors cursor-pointer">
                  Provider Abstraction
                </button>
              </li>
            </ul>
          </div>

          {/* Solutions Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#123047] dark:text-white mb-4">Solutions</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => onNavigate('solutions')} className="hover:text-[#2189C8] dark:hover:text-[#55B9E8] transition-colors cursor-pointer">
                  Healthcare & Clinics
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('solutions')} className="hover:text-[#2189C8] dark:hover:text-[#55B9E8] transition-colors cursor-pointer">
                  Fitness & Gyms
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('solutions')} className="hover:text-[#2189C8] dark:hover:text-[#55B9E8] transition-colors cursor-pointer">
                  Real Estate Agencies
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('solutions')} className="hover:text-[#2189C8] dark:hover:text-[#55B9E8] transition-colors cursor-pointer">
                  Hospitality & Stays
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('solutions')} className="hover:text-[#2189C8] dark:hover:text-[#55B9E8] transition-colors cursor-pointer">
                  Restaurants & Dining
                </button>
              </li>
            </ul>
          </div>

          {/* Resources & Trust */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#123047] dark:text-white mb-4">Resources</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => onNavigate('pricing')} className="hover:text-[#2189C8] dark:hover:text-[#55B9E8] transition-colors cursor-pointer">
                  Pricing Plans
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('resources')} className="hover:text-[#2189C8] dark:hover:text-[#55B9E8] transition-colors cursor-pointer">
                  API & Webhooks
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-[#2189C8] dark:hover:text-[#55B9E8] transition-colors cursor-pointer">
                  Security & Compliance
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-[#2189C8] dark:hover:text-[#55B9E8] transition-colors cursor-pointer">
                  Contact Support
                </button>
              </li>
              <li>
                <button onClick={() => onOpenAuth('signup')} className="text-[#38A85B] font-bold hover:underline cursor-pointer">
                  Create Account
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#82919A] dark:text-[#64748B] gap-4">
          <p>© {new Date().getFullYear()} Auris Voice Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-[#123047] dark:hover:text-white cursor-pointer">Privacy Policy</span>
            <span className="hover:text-[#123047] dark:hover:text-white cursor-pointer">Terms of Service</span>
            <span className="hover:text-[#123047] dark:hover:text-white cursor-pointer">Security Overview</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
