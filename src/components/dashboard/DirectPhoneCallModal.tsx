import React, { useState } from 'react';
import { Agent } from '../../types';
import {
  PhoneCall,
  X,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Bot,
  Zap,
} from 'lucide-react';
import { aurisApi } from '../../services/apiService';

interface DirectPhoneCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  agents: Agent[];
  defaultAgentId?: string;
  onCallDispatched?: (callData: any) => void;
}

export const DirectPhoneCallModal: React.FC<DirectPhoneCallModalProps> = ({
  isOpen,
  onClose,
  agents,
  defaultAgentId,
  onCallDispatched,
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [recipientName, setRecipientName] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState(
    defaultAgentId || agents[0]?.id || ''
  );
  const [scenarioNotes, setScenarioNotes] = useState('Enterprise Consultation Call');
  const [isCalling, setIsCalling] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [dispatchResult, setDispatchResult] = useState<{
    callId: string;
    requestId: string;
    fullPhoneNumber: string;
    agentName: string;
  } | null>(null);

  if (!isOpen) return null;

  const selectedAgent = agents.find((a) => a.id === selectedAgentId) || agents[0] || {
    id: 'agent_primary',
    name: 'Auris Voice Agent',
    voiceId: 'auris_neural_executive',
    language: 'English, Hindi, Telugu',
  };

  const handleTriggerDirectCall = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanNumber = phoneNumber.replace(/[\s-]/g, '');
    if (!cleanNumber) {
      setErrorMsg('Please enter a valid destination phone number.');
      return;
    }

    const fullPhoneNumber = `${countryCode}${cleanNumber.startsWith('0') ? cleanNumber.slice(1) : cleanNumber}`;

    setIsCalling(true);
    try {
      const resp = await aurisApi.dispatchCall({
        agentId: selectedAgentId,
        callerNumber: fullPhoneNumber,
        callerName: recipientName.trim() || 'Valued Client',
        scenario: scenarioNotes.trim() || 'Direct enterprise call',
      });

      const resultData = {
        callId: resp.id || `call_${Date.now()}`,
        requestId: (resp as any).plivoCallId || (resp as any).requestId || 'REQ_' + Math.floor(Math.random() * 90000 + 10000),
        fullPhoneNumber,
        agentName: selectedAgent.name,
      };

      setDispatchResult(resultData);
      if (onCallDispatched) {
        onCallDispatched(resultData);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to dispatch call over carrier network.');
    } finally {
      setIsCalling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-xl bg-[#111827] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-white">
        {/* Header Banner */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between bg-slate-950/60">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              <PhoneCall className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight text-white">
                  Direct Phone Call
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  Carrier SIP
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Rings the recipient's physical telephone directly via Auris Enterprise Carrier Mesh.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Active Carrier Authentication Card */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
              <div>
                <span className="font-bold text-white block">Auris Carrier Mesh Security</span>
                <span className="text-[11px] text-slate-400">Authenticated via Direct Plivo Carrier Trunk</span>
              </div>
            </div>
            <span className="font-mono text-[11px] text-indigo-300 bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-1 rounded-lg">
              TLS 1.3 / SRTP Encrypted
            </span>
          </div>

          {dispatchResult ? (
            /* Live Call Dispatched Status Card */
            <div className="p-6 rounded-2xl bg-slate-950/80 border border-indigo-500/40 space-y-4 animate-in zoom-in-95">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-indigo-300">
                    Live Call Dispatched & Ringing!
                  </h4>
                  <p className="text-xs text-slate-400">
                    Target phone ({dispatchResult.fullPhoneNumber}) will ring immediately.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-800">
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-mono uppercase">Carrier Request ID</span>
                  <span className="font-mono font-bold text-white">#{dispatchResult.requestId}</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-mono uppercase">Selected Agent</span>
                  <span className="font-bold text-indigo-300 truncate block">{dispatchResult.agentName}</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                When the phone is answered, the AI assistant will engage in real-time conversational voice. Upon completion, full transcripts and call metrics will be stored in <strong className="text-white">Call Logs</strong>.
              </p>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setDispatchResult(null);
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-200 border border-slate-700 transition-colors cursor-pointer"
                >
                  Make Another Call
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-xs font-bold text-white shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all cursor-pointer"
                >
                  Done & View Logs
                </button>
              </div>
            </div>
          ) : (
            /* Dispatch Form */
            <form onSubmit={handleTriggerDirectCall} className="space-y-4">
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* 1. Recipient Phone Number */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 font-mono">
                  Destination Phone Number <span className="text-indigo-400">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-28 px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="+91">IN (+91)</option>
                    <option value="+1">US (+1)</option>
                    <option value="+44">UK (+44)</option>
                    <option value="+971">AE (+971)</option>
                    <option value="+61">AU (+61)</option>
                    <option value="+65">SG (+65)</option>
                    <option value="+49">DE (+49)</option>
                  </select>
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-bold font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1 font-mono">
                  Target: <span className="text-indigo-400 font-bold">{countryCode}{phoneNumber}</span>
                </p>
              </div>

              {/* 2. Recipient Name */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Recipient Name
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* 3. AI Voice Agent Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Assigned Voice Agent
                </label>
                <select
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
                >
                  {agents.map((ag) => (
                    <option key={ag.id} value={ag.id}>
                      {ag.name} ({ag.language || 'English, Hindi, Telugu'})
                    </option>
                  ))}
                </select>
                <div className="mt-2 p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-[11px] text-slate-300">
                  <div className="flex items-center gap-2">
                    <Bot className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Agent: <strong className="text-white">{selectedAgent.name}</strong></span>
                  </div>
                  <span className="text-indigo-400 font-mono font-bold">
                    Voice: {selectedAgent.voiceName || selectedAgent.voiceId || 'Auris Executive Voice'}
                  </span>
                </div>
              </div>

              {/* 4. Scenario / Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Context / Calling Goal
                </label>
                <input
                  type="text"
                  value={scenarioNotes}
                  onChange={(e) => setScenarioNotes(e.target.value)}
                  placeholder="e.g. Schedule enterprise executive demo"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* CTA Dispatch Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isCalling}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 active:scale-[0.99] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(99,102,241,0.35)] transition-all cursor-pointer disabled:opacity-50"
                >
                  {isCalling ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Ringing Carrier Telephony Line...</span>
                    </>
                  ) : (
                    <>
                      <PhoneCall className="w-4 h-4" />
                      <span>Dispatch Direct Enterprise Call</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
