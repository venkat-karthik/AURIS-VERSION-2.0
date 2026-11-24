import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Agent, Call } from '../../types';
import {
  Phone,
  PhoneCall,
  Clock,
  ArrowRight,
  Play,
  Bot,
  Radio,
  TrendingDown,
  Sparkles,
  Wallet,
} from 'lucide-react';
import { DirectPhoneCallModal } from './DirectPhoneCallModal';
import { WalletModal } from './WalletModal';
import { aurisApi } from '../../services/apiService';

interface DashboardHomeProps {
  agents: Agent[];
  calls: Call[];
  currentUser?: any;
  onOpenCreateAgent: () => void;
  onNavigateToCalls: () => void;
  onNavigateToAgents: () => void;
  onOpenCallDetails: (call: Call) => void;
  onOpenDirectCall?: () => void;
  onNavigateToWebVoice?: () => void;
  onOpenOnboardingWizard?: () => void;
  onDispatchCall?: (params: {
    agentId: string;
    callerName: string;
    callerNumber: string;
    scenario: string;
  }) => Promise<Call>;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  agents,
  calls,
  onNavigateToCalls,
  onNavigateToAgents,
  onOpenCallDetails,
  onOpenDirectCall,
  onNavigateToWebVoice,
  onOpenOnboardingWizard,
  onDispatchCall,
}) => {
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number>(500);

  React.useEffect(() => {
    aurisApi.getWallet().then((w) => setWalletBalance(w.balanceInr)).catch(() => {});
  }, []);

  const primaryAgent = agents[0] || {
    id: 'ag_default',
    name: 'Auris Indic Voice Specialist',
    language: 'Telugu (తెలుగు - Sarvam Indic)',
    voiceId: 'kavya',
    status: 'active',
  };

  const totalCalls = calls.length;
  const answeredCalls = calls.filter((c) => c.status === 'answered' || c.status === 'completed').length;
  const totalSeconds = calls.reduce((acc, c) => acc + (c.durationSeconds || (c as any).duration || 0), 0);
  const totalMinutes = Math.max(1, Math.ceil(totalSeconds / 60));

  const metricCards = [
    {
      label: 'Total Calls',
      value: totalCalls.toString(),
      subLeft: 'Inbound & Outbound',
      subRight: `${answeredCalls} Answered`,
      subRightClass: 'text-emerald-600 dark:text-emerald-400',
      icon: Phone,
      onClick: onNavigateToCalls,
    },
    {
      label: 'Billed Minutes',
      value: `${totalMinutes}`,
      unit: 'mins',
      subLeft: 'Total Duration',
      subRight: `${totalSeconds}s live`,
      subRightClass: 'text-indigo-600 dark:text-indigo-400',
      icon: Clock,
      onClick: onNavigateToCalls,
    },
    {
      label: 'Wallet Credits',
      value: `₹${walletBalance.toFixed(2)}`,
      subLeft: `~${Math.floor(walletBalance / 4.8)} Calling Mins`,
      subRight: '+ Recharge',
      subRightClass: 'text-indigo-600 dark:text-indigo-400',
      icon: Wallet,
      onClick: () => setWalletModalOpen(true),
    },
    {
      label: 'Pulse Tariff',
      value: '₹1.60',
      unit: '/ 20s',
      subLeft: 'Indian Telecom Pulse',
      subRight: '₹4.80/min',
      subRightClass: 'text-emerald-600 dark:text-emerald-400',
      icon: TrendingDown,
      onClick: () => setWalletModalOpen(true),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. CALM EXECUTIVE HERO */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#0F1219] border border-slate-200/90 dark:border-white/[0.07] flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-xs"
      >
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-500/20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-breathe" />
              Direct Plivo Carrier Trunk Online
            </span>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.07]">
              Sarvam Indic • Cartesia Sonic
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
            Voice Command Center
          </h1>

          <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            Manage inbound and outbound telephony with native Telugu, Hindi, and English models, dedicated Bangalore carrier trunks, and transparent 20-second pulse billing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onOpenOnboardingWizard && (
            <button
              type="button"
              onClick={onOpenOnboardingWizard}
              className="px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Setup Wizard</span>
            </button>
          )}

          {onNavigateToWebVoice && (
            <button
              type="button"
              onClick={onNavigateToWebVoice}
              className="px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Radio className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
              <span>Test in Browser</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              if (onOpenDirectCall) {
                onOpenDirectCall();
              } else {
                setIsDispatchModalOpen(true);
              }
            }}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Dispatch Outbound Call</span>
          </button>
        </div>
      </motion.div>

      {/* 2. METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((m, idx) => {
          const Icon = m.icon;
          return (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
              onClick={m.onClick}
              className="p-5 rounded-2xl bg-white dark:bg-[#0F1219] border border-slate-200/90 dark:border-white/[0.07] hover:border-indigo-300 dark:hover:border-indigo-500/30 transition-all cursor-pointer space-y-3 group shadow-2xs"
            >
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span>{m.label}</span>
                <Icon className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50 font-mono tracking-tight">
                {m.value}
                {m.unit && <span className="text-xs font-normal text-slate-500 ml-1">{m.unit}</span>}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/[0.06]">
                <span>{m.subLeft}</span>
                <span className={`font-mono font-semibold ${m.subRightClass}`}>{m.subRight}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 3. MAIN WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Recent Calls Stream */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Recent Voice Calls ({calls.length})</span>
            </h2>
            <button
              onClick={onNavigateToCalls}
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>View All Logs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {calls.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white dark:bg-[#0F1219] border border-slate-200/90 dark:border-white/[0.07] text-center space-y-3">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
                <PhoneCall className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">No calls placed yet</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Dispatch your first outbound telephone call to test the real-time voice pipeline.
              </p>
              <button
                type="button"
                onClick={() => (onOpenDirectCall ? onOpenDirectCall() : setIsDispatchModalOpen(true))}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Dispatch Test Call
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {calls.slice(0, 5).map((call) => (
                <div
                  key={call.id}
                  onClick={() => onOpenCallDetails(call)}
                  className="p-4 rounded-2xl bg-white dark:bg-[#0F1219] hover:bg-slate-50/80 dark:hover:bg-[#141821] border border-slate-200/90 dark:border-white/[0.07] hover:border-slate-300 dark:hover:border-white/[0.12] transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                        call.direction === 'inbound'
                          ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200/60 dark:border-indigo-500/20'
                          : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-500/20'
                      }`}
                    >
                      <PhoneCall className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-slate-900 dark:text-slate-100 text-xs">
                          {call.callerNumber}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase font-mono ${
                            call.status === 'answered' || call.status === 'completed'
                              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                              : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400'
                          }`}
                        >
                          {call.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Agent: <span className="text-slate-700 dark:text-slate-300 font-medium">{call.agentName}</span>
                        {call.callerName && call.callerName !== 'Client' ? ` • ${call.callerName}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="text-right font-mono text-xs">
                      <span className="text-slate-800 dark:text-slate-200 font-semibold">
                        {call.durationSeconds || (call as any).duration || 0}s
                      </span>
                      <span className="text-[10px] text-slate-400 block">Duration</span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenCallDetails(call);
                      }}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-white/[0.05] hover:bg-indigo-50 dark:hover:bg-indigo-500/15 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                      title="View Transcript & Audio"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Active Voice Agent & Carrier Telemetry */}
        <div className="space-y-4">
          {/* Active Agent Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0F1219] border border-slate-200/90 dark:border-white/[0.07] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Primary Assistant
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-500/20">
                Active on Trunk
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-200/60 dark:border-indigo-500/20">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{primaryAgent.name}</h3>
                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium block mt-0.5">
                  {primaryAgent.language}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#090B10] border border-slate-200/80 dark:border-white/[0.06] text-xs text-slate-600 dark:text-slate-300 space-y-1">
              <span className="text-[10px] text-slate-400 font-mono uppercase block">Greeting</span>
              <p className="italic text-[11px] leading-relaxed line-clamp-2">
                &ldquo;{primaryAgent.instructions?.greeting || 'నమస్కారం అండి! ఆరిస్ వాయిస్ కి స్వాగతం.'}&rdquo;
              </p>
            </div>

            <button
              onClick={onNavigateToAgents}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/70 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-slate-800 dark:text-slate-200 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200/70 dark:border-white/[0.06]"
            >
              <span>Configure Assistants</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Carrier Trunk Status Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0F1219] border border-slate-200/90 dark:border-white/[0.07] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-500 dark:text-slate-400">
                Plivo Carrier SIP
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[10px] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-breathe" />
                TLS 1.3 / SRTP
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-white/[0.06]">
                <span className="text-slate-500">Caller ID</span>
                <span className="text-slate-900 dark:text-slate-100 font-semibold">+91 80 6553 4512</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-white/[0.06]">
                <span className="text-slate-500">Codec</span>
                <span className="text-indigo-600 dark:text-indigo-400">G.711 μ-law (8kHz)</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Voice Engine</span>
                <span className="text-sky-600 dark:text-sky-400">Sarvam + Cartesia</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Direct Outbound Phone Call Modal */}
      <DirectPhoneCallModal
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        agents={agents}
        onCallDispatched={(newCall) => {
          if (onDispatchCall) {
            onDispatchCall({
              agentId: newCall.agentId,
              callerName: newCall.callerName || 'Client',
              callerNumber: newCall.callerNumber,
              scenario: newCall.notes || 'Consultation Call',
            });
          }
        }}
      />

      {/* Prepaid Wallet Recharge & Ledger Modal */}
      <WalletModal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        onBalanceUpdated={(newBal) => setWalletBalance(newBal)}
      />
    </div>
  );
};
