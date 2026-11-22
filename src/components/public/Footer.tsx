import React from 'react';
import { Logo } from '../common/Logo';

interface FooterProps {
  onNavigate: (page: string) => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenAuth }) => {
  return (
    <footer className="bg-white dark:bg-[#030712] border-t border-slate-200 dark:border-[#334155]/25 pt-16 pb-12 text-slate-600 dark:text-[#94A3B8] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-12 border-b border-slate-200 dark:border-[#334155]/25">
          {/* Company Brand Column */}
          <div className="col-span-2 space-y-4">
            <Logo size="md" />
            <p className="text-sm text-[#090D16]/80 dark:text-[#94A3B8] max-w-sm leading-relaxed">
              Auris builds human-like AI voice agents that empower businesses to automate inbound customer calls, qualify leads, schedule appointments, and grow 24/7.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#090D16]/15 dark:bg-[#090D16]/40 text-[#06B6D4] dark:text-[#22D3EE] border border-[#06B6D4]/30 dark:border-[#94A3B8]/30">
                <span className="w-2 h-2 rounded-full bg-[#94A3B8] animate-ping" />
                Carrier SIP Network Live
              </span>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#030712] dark:text-[#22D3EE] mb-4">Product</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => onNavigate('product')} className="hover:text-[#06B6D4] dark:hover:text-[#22D3EE] transition-colors cursor-pointer">
                  AI Voice Agents
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('product')} className="hover:text-[#06B6D4] dark:hover:text-[#22D3EE] transition-colors cursor-pointer">
                  Inbound Receptionist
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('product')} className="hover:text-[#06B6D4] dark:hover:text-[#22D3EE] transition-colors cursor-pointer">
                  Outbound Campaigns
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('product')} className="hover:text-[#06B6D4] dark:hover:text-[#22D3EE] transition-colors cursor-pointer">
                  Web Voice Simulator
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('resources')} className="hover:text-[#06B6D4] dark:hover:text-[#22D3EE] transition-colors cursor-pointer">
                  Provider Abstraction
                </button>
              </li>
            </ul>
          </div>

          {/* Solutions Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#030712] dark:text-[#22D3EE] mb-4">Solutions</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => onNavigate('solutions')} className="hover:text-[#06B6D4] dark:hover:text-[#22D3EE] transition-colors cursor-pointer">
                  Healthcare & Clinics
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('solutions')} className="hover:text-[#06B6D4] dark:hover:text-[#22D3EE] transition-colors cursor-pointer">
                  Fitness & Gyms
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('solutions')} className="hover:text-[#06B6D4] dark:hover:text-[#22D3EE] transition-colors cursor-pointer">
                  Real Estate Agencies
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('solutions')} className="hover:text-[#06B6D4] dark:hover:text-[#22D3EE] transition-colors cursor-pointer">
                  Hospitality & Stays
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('solutions')} className="hover:text-[#06B6D4] dark:hover:text-[#22D3EE] transition-colors cursor-pointer">
                  Restaurants & Dining
                </button>
              </li>
            </ul>
          </div>

          {/* Resources & Trust */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#030712] dark:text-[#22D3EE] mb-4">Resources</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => onNavigate('pricing')} className="hover:text-[#06B6D4] dark:hover:text-[#22D3EE] transition-colors cursor-pointer">
                  Pricing Plans
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('resources')} className="hover:text-[#06B6D4] dark:hover:text-[#22D3EE] transition-colors cursor-pointer">
                  API & Webhooks
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-[#06B6D4] dark:hover:text-[#22D3EE] transition-colors cursor-pointer">
                  Security & Compliance
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-[#06B6D4] dark:hover:text-[#22D3EE] transition-colors cursor-pointer">
                  Contact Support
                </button>
              </li>
              <li>
                <button onClick={() => onOpenAuth('signup')} className="text-[#06B6D4] dark:text-[#22D3EE] font-bold hover:underline cursor-pointer">
                  Create Account
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-[#334155] gap-4">
          <p>© {new Date().getFullYear()} Auris Voice Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-[#030712] dark:hover:text-[#22D3EE] cursor-pointer">Privacy Policy</span>
            <span className="hover:text-[#030712] dark:hover:text-[#22D3EE] cursor-pointer">Terms of Service</span>
            <span className="hover:text-[#030712] dark:hover:text-[#22D3EE] cursor-pointer">Security Overview</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
