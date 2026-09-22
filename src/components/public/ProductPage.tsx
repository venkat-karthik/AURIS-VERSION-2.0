import React, { useState } from 'react';
import {
  Mic,
  BrainCircuit,
  Zap,
  Globe2,
  Database,
  Sliders,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Cpu,
  Layers,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { Interactive3DDevice } from '../common/Interactive3DDevice';
import { Interactive3DAgentAvatar } from '../common/Interactive3DAgentAvatar';
import { Interactive3DStudioMic } from '../common/Interactive3DStudioMic';

interface ProductPageProps {
  onGetStarted: () => void;
  onOpenPlayground: () => void;
}

export const ProductPage: React.FC<ProductPageProps> = ({ onGetStarted, onOpenPlayground }) => {
  const [activeTab, setActiveTab] = useState<'avatar' | 'device' | 'mic'>('avatar');

  return (
    <div className="py-16 bg-[#F5FAFC] dark:bg-[#080E1C] text-[#123047] dark:text-[#F1F5F9] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* Product Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EFFAF1] dark:bg-[#0F2D1F] border border-[#65C978]/30 text-xs font-black text-[#38A85B] shadow-xs">
            <BrainCircuit className="w-3.5 h-3.5" />
            Human-Grade Voice Intelligence Engine
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-[#000000] dark:text-white tracking-tight">
            Conversational Voice AI Built for Real Carrier Networks
          </h1>
          <p className="text-base text-[#27272a] dark:text-[#94A3B8] font-medium leading-relaxed">
            Auris bridges the gap between state-of-the-art LLM reasoning and real-world PSTN/SIP telephony. Experience fluid dialogue with sub-150ms voice transport, native pitch inflections, and instant interruption tolerance.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <button
              onClick={onGetStarted}
              className="px-7 py-3 rounded-xl text-sm font-black text-white bg-[#38A85B] hover:bg-[#2f8f4d] shadow-sm transition-all cursor-pointer"
            >
              Start Free Trial
            </button>
            <button
              onClick={onOpenPlayground}
              className="px-7 py-3 rounded-xl text-sm font-bold text-sky-700 dark:text-sky-300 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <Mic className="w-4 h-4" />
              Test Live in Browser
            </button>
          </div>
        </div>

        {/* 3D Interactive Telephony Hardware & Acoustic Showcase */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200/90 dark:border-slate-800 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Explanatory & Feature Highlights */}
            <div className="lg:col-span-6 space-y-5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" />
                  Interactive 3D Voice Agent Engine & Hardware
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
                Enterprise AI Voice Agent Architecture
              </h2>
              <p className="text-sm text-slate-700 dark:text-slate-200 font-normal leading-relaxed">
                Interact with our 3D voice models below. Test our 3D AI agent avatar with real-time cursor gaze tracking and voice synthesis, inspect the SIP edge transceiver hardware, or test the high-fidelity broadcast studio microphone array.
              </p>

              {/* Model Tab Switcher */}
              <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100/90 dark:bg-slate-800/80 rounded-2xl border border-slate-200/90 dark:border-slate-700 w-fit">
                <button
                  onClick={() => setActiveTab('avatar')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                    activeTab === 'avatar'
                      ? 'bg-emerald-600 text-white shadow-sm font-extrabold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>3D AI Voice Agent</span>
                </button>
                <button
                  onClick={() => setActiveTab('device')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                    activeTab === 'device'
                      ? 'bg-sky-600 text-white shadow-sm font-extrabold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>3D Phone Terminal</span>
                </button>
                <button
                  onClick={() => setActiveTab('mic')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                    activeTab === 'mic'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm font-extrabold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>3D Studio Mic</span>
                </button>
              </div>

              {/* Checklist */}
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <span>Sub-150ms audio latency via Opus/G.711 carrier codecs</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <span>Zero-delay voice interruption with dynamic echo cancellation</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <span>Interactive 3D Agent Avatars with custom domain personas</span>
                </div>
              </div>
            </div>

            {/* Right: Embedded 3D Component */}
            <div className="lg:col-span-6 flex justify-center">
              {activeTab === 'avatar' && (
                <Interactive3DAgentAvatar height={380} className="w-full" />
              )}
              {activeTab === 'device' && (
                <Interactive3DDevice size={360} className="w-full" />
              )}
              {activeTab === 'mic' && (
                <Interactive3DStudioMic size={360} className="w-full" />
              )}
            </div>
          </div>
        </div>

        {/* 4 Pillars of Auris Voice */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-950 dark:text-white text-base">Ultra-Low Latency</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
              Standard chatbots take 2-4 seconds to respond. Auris voice agents respond in under 150ms-300ms, matching the natural cadence of a human conversation.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-950 dark:text-white text-base">Natural Interruptions</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
              Callers can interrupt or redirect the AI at any syllable. The agent ceases playback instantly and adapts its reasoning without awkward collision.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-950 dark:text-white text-base">Knowledge RAG & Cloudinary</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
              Index PDFs, CSV patient lists, real estate docs, and Cloudinary-stored voice training files. Auris cites accurate facts with zero hallucinations.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Globe2 className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-950 dark:text-white text-base">50+ Global Languages</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
              Native accents in English (US, UK, Indian, Australian), Spanish, Hindi, French, German, and Japanese with localized conversational style.
            </p>
          </div>
        </div>

        {/* Feature Deep Dive: Provider Abstraction */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 border border-slate-200/90 dark:border-slate-800 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300">
                OmniDimension Telephony Carrier Backbone
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
                Architected with Modular Voice Provider Abstraction
              </h2>
              <p className="text-sm text-slate-700 dark:text-slate-300 font-normal leading-relaxed">
                Auris decouples high-level business intelligence from low-level audio transports. Initially deployed on OmniDimension's battle-tested voice carrier infrastructure, Auris features clean pluggable provider interfaces that support native engine upgrades without disrupting live operations.
              </p>
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Direct WebRTC & SIP trunking with HD audio codecs</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Real-time speech-to-text token streaming</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Zero frontend-exposed API secrets or provider vendor lock-in</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 bg-[#0B132B] rounded-2xl p-6 text-white font-mono text-xs shadow-xl space-y-3 border border-slate-700/80">
              <div className="flex items-center justify-between text-[#55B9E8] pb-2 border-b border-white/10">
                <span>Auris Provider Layer</span>
                <span className="text-[10px] bg-[#38A85B] text-white font-bold px-2 py-0.5 rounded">CONNECTED</span>
              </div>
              <div className="text-[#82919A] text-[11px]">
                // Universal Voice Engine Dispatcher<br />
                const provider = getActiveVoiceProvider();
              </div>
              <div className="text-green-400">
                &gt; provider.name: "OmniDimension"<br />
                &gt; provider.version: "2026.04.1-v3"<br />
                &gt; mean_latency: 148ms<br />
                &gt; interruption_handling: "active_full_duplex"<br />
                &gt; telephony_carrier: "Tier-1 SIP Trunk Mesh"
              </div>
              <div className="pt-2 text-[#82919A] text-[11px]">
                // Future-proof roadmap allows seamless migration to AurisVoiceEngine without UI interruption.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
