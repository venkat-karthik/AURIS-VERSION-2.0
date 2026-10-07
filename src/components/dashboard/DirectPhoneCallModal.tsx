import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  PhoneCall,
  X,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  PhoneForwarded,
  Volume2,
  Activity,
  Bot,
  RefreshCw,
} from 'lucide-react';
import { Agent } from '../../types';

interface DirectPhoneCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  agents: Agent[];
  onCallDispatched?: (call: any) => void;
}

export const DirectPhoneCallModal: React.FC<DirectPhoneCallModalProps> = ({
  isOpen,
  onClose,
  agents,
  onCallDispatched,
}) => {
  const [selectedAgentId, setSelectedAgentId] = useState<string>(
    agents.find((a) => a.id === '143143' || a.providerAgentId === '143143')?.id ||
      agents[0]?.id ||
      '143143'
  );
  const [countryCode, setCountryCode] = useState<string>('+91');
  const [phoneNumber, setPhoneNumber] = useState<string>('7842164904');
  const [recipientName, setRecipientName] = useState<string>('Venkat Karthik');
  const [scenarioNotes, setScenarioNotes] = useState<string>(
    'Inbound Real Estate & Property Consultation Inquiry'
  );
  const [isCalling, setIsCalling] = useState<boolean>(false);
  const [dispatchResult, setDispatchResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedAgent =
    agents.find((a) => a.id === selectedAgentId) ||
    agents[0] || {
      name: 'Inbound Real Estate Appointment Scheduler',
      voiceId: 'en-in-Chirp3-HD-Despina',
      language: 'English (India), Hindi, Telugu',
    };

  const handleTriggerDirectCall = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalling(true);
    setErrorMsg(null);
    setDispatchResult(null);

    // Clean phone number
    const rawNumber = phoneNumber.trim().replace(/[^\d]/g, '');
    if (!rawNumber) {
      setErrorMsg('Please enter a valid phone number');
      setIsCalling(false);
      return;
    }

    const fullPhoneNumber = `${countryCode}${rawNumber}`;

    try {
      const response = await fetch('/api/telephony/dispatch-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: selectedAgentId,
          callerNumber: fullPhoneNumber,
          callerName: recipientName.trim() || 'Client',
          scenario: scenarioNotes.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok && (data.liveCarrierDispatched || data.success)) {
        setDispatchResult({
          success: true,
          fullPhoneNumber,
          requestId: data.requestId || data.carrierResponse?.callSid || '7843280',
          agentName: selectedAgent.name,
          message: data.message || `Live telephone call dispatched to ${fullPhoneNumber}.`,
          timestamp: new Date().toLocaleTimeString(),
        });
        if (onCallDispatched) {
          onCallDispatched(data);
        }
      } else {
        setErrorMsg(data.error || data.details || 'Carrier refused call dispatch. Check number format.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to dispatch call over carrier network.');
    } finally {
      setIsCalling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#021024]/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-xl bg-[#052659] border border-[#5483B3]/30 rounded-3xl shadow-2xl overflow-hidden text-white">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#021024] via-[#052659] to-[#1D64C2]/40 p-6 border-b border-[#5483B3]/25 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#1D64C2]/20 border border-[#1D64C2]/40 flex items-center justify-center text-[#C1E8FF] shrink-0">
              <PhoneCall className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight text-white">
                  Direct Phone Call
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#1D64C2]/20 text-[#C1E8FF] border border-[#1D64C2]/30">
                  Live Carrier SIP
                </span>
              </div>
              <p className="text-xs text-[#7DA0CA] mt-0.5">
                Rings the recipient's physical telephone directly via Auris Enterprise Voice Network.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#7DA0CA] hover:text-white rounded-xl hover:bg-[#021024]/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Active Carrier Authentication Card */}
          <div className="p-3.5 rounded-2xl bg-[#021024]/60 border border-[#5483B3]/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#C1E8FF] shrink-0" />
              <div>
                <span className="font-bold text-white block">Auris Carrier Mesh Security</span>
                <span className="text-[11px] text-[#7DA0CA]">Authenticated via Encrypted SIP Trunk</span>
              </div>
            </div>
            <span className="font-mono text-[11px] text-[#C1E8FF] bg-[#1D64C2]/20 border border-[#1D64C2]/40 px-2.5 py-1 rounded-lg">
              TLS 1.3 / SRTP Encrypted
            </span>
          </div>

          {dispatchResult ? (
            /* Live Call Dispatched Status Card */
            <div className="p-6 rounded-2xl bg-[#021024]/70 border border-[#1D64C2]/50 space-y-4 animate-in zoom-in-95">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1D64C2]/25 border border-[#C1E8FF]/40 flex items-center justify-center text-[#C1E8FF]">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-[#C1E8FF]">
                    Live Call Dispatched & Ringing!
                  </h4>
                  <p className="text-xs text-[#7DA0CA]">
                    Your phone ({dispatchResult.fullPhoneNumber}) should ring in a few seconds.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-[#5483B3]/20">
                <div className="bg-[#021024]/60 p-3 rounded-xl border border-[#5483B3]/20">
                  <span className="text-[10px] text-[#7DA0CA] block font-bold uppercase">Carrier Request ID</span>
                  <span className="font-mono font-bold text-white">#{dispatchResult.requestId}</span>
                </div>
                <div className="bg-[#021024]/60 p-3 rounded-xl border border-[#5483B3]/20">
                  <span className="text-[10px] text-[#7DA0CA] block font-bold uppercase">Selected Agent</span>
                  <span className="font-bold text-[#C1E8FF] truncate block">{dispatchResult.agentName}</span>
                </div>
              </div>

              <p className="text-xs text-[#7DA0CA]">
                When you pick up the call, you will speak with the AI assistant. Once you hang up, the full multi-turn conversation and audio recording will appear in your <strong className="text-white">Call Logs</strong>.
              </p>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setDispatchResult(null);
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#021024]/60 hover:bg-[#021024] text-xs font-bold text-slate-200 border border-[#5483B3]/30 transition-colors cursor-pointer"
                >
                  Make Another Call
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#052659] via-[#1D64C2] to-[#2563EB] hover:from-[#1D64C2] hover:to-[#3B82F6] text-xs font-bold text-white shadow-md shadow-[#1D64C2]/20 transition-all cursor-pointer"
                >
                  Done & View Call Logs
                </button>
              </div>
            </div>
          ) : (
            /* Dispatch Form */
            <form onSubmit={handleTriggerDirectCall} className="space-y-4">
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* 1. Recipient Phone Number */}
              <div>
                <label className="block text-xs font-bold text-[#7DA0CA] mb-1.5">
                  Recipient Phone Number <span className="text-[#C1E8FF]">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-28 px-3 py-2.5 rounded-xl bg-[#021024] border border-[#5483B3]/40 text-xs font-bold text-white focus:outline-none focus:border-[#C1E8FF]"
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
                    placeholder="e.g. 7842164904"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#021024] border border-[#5483B3]/40 text-sm font-bold font-mono text-white placeholder:text-[#5483B3] focus:outline-none focus:border-[#C1E8FF]"
                  />
                </div>
                <p className="text-[11px] text-[#7DA0CA] mt-1">
                  Full dial target: <span className="font-mono text-[#C1E8FF] font-bold">{countryCode}{phoneNumber}</span>
                </p>
              </div>

              {/* 2. Recipient Name */}
              <div>
                <label className="block text-xs font-bold text-[#7DA0CA] mb-1.5">
                  Recipient / Customer Name
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g. Venkat Karthik"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#021024] border border-[#5483B3]/40 text-xs font-semibold text-white placeholder:text-[#5483B3] focus:outline-none focus:border-[#C1E8FF]"
                />
              </div>

              {/* 3. AI Voice Agent Selector */}
              <div>
                <label className="block text-xs font-bold text-[#7DA0CA] mb-1.5">
                  Voice Agent
                </label>
                <select
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#021024] border border-[#5483B3]/40 text-xs font-semibold text-white focus:outline-none focus:border-[#C1E8FF]"
                >
                  {agents.map((ag) => (
                    <option key={ag.id} value={ag.id}>
                      {ag.name} ({ag.language || 'English, Hindi, Telugu'})
                    </option>
                  ))}
                </select>
                <div className="mt-2 p-3 rounded-xl bg-[#021024]/60 border border-[#5483B3]/25 flex items-center justify-between text-[11px] text-slate-300">
                  <div className="flex items-center gap-2">
                    <Bot className="w-3.5 h-3.5 text-[#C1E8FF]" />
                    <span>Agent ID: <strong className="text-white">{selectedAgentId}</strong></span>
                  </div>
                  <span className="text-[#C1E8FF] font-bold">
                    Voice: {selectedAgent.voiceId || 'shradha mam'}
                  </span>
                </div>
              </div>

              {/* 4. Scenario / Notes */}
              <div>
                <label className="block text-xs font-bold text-[#7DA0CA] mb-1.5">
                  Context / Calling Goal
                </label>
                <input
                  type="text"
                  value={scenarioNotes}
                  onChange={(e) => setScenarioNotes(e.target.value)}
                  placeholder="e.g. Schedule weekend property viewing"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#021024] border border-[#5483B3]/40 text-xs text-white placeholder:text-[#5483B3] focus:outline-none focus:border-[#C1E8FF]"
                />
              </div>

              {/* CTA Dispatch Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isCalling}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#052659] via-[#1D64C2] to-[#2563EB] hover:from-[#1D64C2] hover:to-[#3B82F6] active:scale-[0.99] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#1D64C2]/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isCalling ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Ringing Carrier Telephony Line...</span>
                    </>
                  ) : (
                    <>
                  <PhoneCall className="w-4 h-4" />
                  <span>Ring Direct Phone Number Now</span>
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
