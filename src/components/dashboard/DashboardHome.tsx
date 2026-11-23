import React, { useState } from 'react';
import { Agent, Call } from '../../types';
import {
  Phone,
  PhoneCall,
  Clock,
  ArrowRight,
  Play,
  Volume2,
  Bot,
  Activity,
  CheckCircle2,
  Radio,
  ShieldCheck,
  Zap,
  TrendingDown,
  RefreshCw,
  KeyRound,
  ExternalLink,
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
  onDispatchCall?: (params: {
    agentId: string;
    callerName: string;
    callerNumber: string;
    scenario: string;
  }) => Promise<Call>;
  onNavigateToScheduling?: () => void;
  onNavigateToPerformance?: () => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  agents,
  calls,
  onOpenCreateAgent,
  onNavigateToCalls,
  onNavigateToAgents,
  onOpenCallDetails,
  onOpenDirectCall,
  onNavigateToWebVoice,
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

  // Metrics calculation
  const totalCalls = calls.length;
  const answeredCalls = calls.filter((c) => c.status === 'answered' || c.status === 'completed').length;
  const totalSeconds = calls.reduce((acc, c) => acc + (c.durationSeconds || (c as any).duration || 0), 0);
  const totalMinutes = Math.max(1, Math.ceil(totalSeconds / 60));
  const estimatedSpendInr = (totalMinutes * 1.96).toFixed(2);
  const savingsVsResellerInr = (totalMinutes * 12.0 - Number(estimatedSpendInr)).toFixed(2);

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* 1. TOP STATUS & DISPATCH HERO */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900/90 via-[#0B132B]/80 to-slate-950 border border-slate-800 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Direct Plivo Carrier Trunk Online
            </span>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30">
              Sarvam Indic + Cartesia Sonic
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Voice Calls Command Center
          </h1>

          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Inbound & outbound telephony engine with native Telugu (తెలుగు) & English speech models, real-time G.711 μ-law carrier streams, and wholesale Pay-As-You-Go pricing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {onNavigateToWebVoice && (
            <button
              type="button"
              onClick={onNavigateToWebVoice}
              className="px-5 py-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/10 cursor-pointer transition-all active:scale-95"
            >
              <Radio className="w-4 h-4 text-emerald-400" />
              <span>Talk Live in Browser (Mic)</span>
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
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-500/25 cursor-pointer transition-all active:scale-95"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Dispatch Outbound Call</span>
          </button>
        </div>
      </div>

      {/* 2. CORE TELEPHONY METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Calls */}
        <div className="p-5 rounded-2xl bg-[#090D16] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>TOTAL CALLS</span>
            <Phone className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-black text-white font-mono">{totalCalls}</div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/80">
            <span>Inbound & Outbound</span>
            <span className="text-emerald-400 font-mono font-bold">{answeredCalls} Answered</span>
          </div>
        </div>

        {/* Telephony Duration */}
        <div className="p-5 rounded-2xl bg-[#090D16] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>BILLED MINUTES</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-black text-white font-mono">
            {totalMinutes} <span className="text-xs text-slate-400">mins</span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/80">
            <span>Total Duration</span>
            <span className="text-cyan-400 font-mono font-bold">{totalSeconds}s live</span>
          </div>
        </div>

        {/* Prepaid Wallet Credits */}
        <div
          onClick={() => setWalletModalOpen(true)}
          className="p-5 rounded-2xl bg-[#090D16] border border-slate-800 hover:border-[#06B6D4]/50 transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>WALLET CREDITS</span>
            <Wallet className="w-4 h-4 text-[#06B6D4] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-black text-white font-mono">₹{walletBalance.toFixed(2)}</div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/80">
            <span>~{Math.floor(walletBalance / 5)} Calling Mins</span>
            <span className="text-[#06B6D4] font-mono font-bold group-hover:underline">+Recharge</span>
          </div>
        </div>

        {/* Avoided Markups */}
        <div className="p-5 rounded-2xl bg-[#090D16] border border-emerald-500/30 bg-emerald-950/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-mono font-bold">
            <span>MARGIN RETAINED</span>
            <TrendingDown className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-300 font-mono">84.5%</div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/80">
            <span>Saved vs Vapi/Retell</span>
            <span className="text-emerald-400 font-mono font-bold">₹{savingsVsResellerInr} saved</span>
          </div>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Recent Calls Stream */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-cyan-400" />
              Recent Voice Calls ({calls.length})
            </h2>
            <button
              onClick={onNavigateToCalls}
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>View All Logs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {calls.length === 0 ? (
            <div className="p-8 rounded-3xl bg-[#090D16] border border-slate-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 mx-auto flex items-center justify-center">
                <PhoneCall className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white">No calls placed yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Dispatch your first outbound telephone call to your mobile number to test the real-time pipeline.
              </p>
              <button
                type="button"
                onClick={() => setIsDispatchModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-bold transition-all cursor-pointer"
              >
                Dispatch Test Call
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {calls.slice(0, 5).map((call) => (
                <div
                  key={call.id}
                  onClick={() => onOpenCallDetails(call)}
                  className="p-4 rounded-2xl bg-[#090D16] hover:bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        call.direction === 'inbound'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      <PhoneCall className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-xs">
                          {call.callerNumber}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                            call.status === 'answered' || call.status === 'completed'
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : 'bg-rose-500/15 text-rose-400'
                          }`}
                        >
                          {call.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Agent: <span className="text-slate-300 font-medium">{call.agentName}</span>
                        {call.callerName && call.callerName !== 'Client' ? ` • ${call.callerName}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="text-right font-mono text-xs">
                      <span className="text-slate-300 font-bold">{(call.durationSeconds || (call as any).duration || 0)}s</span>
                      <span className="text-[10px] text-slate-500 block">Duration</span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenCallDetails(call);
                      }}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 transition-colors"
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
          <div className="p-5 rounded-3xl bg-[#090D16] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase text-slate-400">
                Primary Voice Agent
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Ready on Trunk
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white">{primaryAgent.name}</h3>
                <span className="text-xs text-cyan-400 font-medium block mt-0.5">
                  {primaryAgent.language}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300 space-y-1">
              <span className="text-[10px] text-slate-500 font-mono uppercase block">Greeting:</span>
              <p className="italic text-[11px] leading-relaxed text-slate-300 line-clamp-2">
                "{primaryAgent.instructions?.greeting || 'నమస్కారం అండి! ఆరిస్ వాయిస్ కి స్వాగతం.'}"
              </p>
            </div>

            <button
              onClick={onNavigateToAgents}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Edit Agent Personality & Prompts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Carrier Trunk Status Card */}
          <div className="p-5 rounded-3xl bg-[#090D16] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono font-bold uppercase text-slate-400">Plivo Carrier SIP</span>
              <span className="text-emerald-400 font-mono text-[10px] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                TLS 1.3 / SRTP
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500">Dedicated Caller ID:</span>
                <span className="text-white font-bold">+91 80 6553 4512</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500">Codec:</span>
                <span className="text-cyan-400">G.711 μ-law (8kHz)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Inbound Routing:</span>
                <span className="text-purple-400">Sarvam Bulbul Indic</span>
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
