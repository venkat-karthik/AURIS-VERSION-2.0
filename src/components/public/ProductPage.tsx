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
              className="px-7 py-3 rounded-xl text-sm font-black text-[#2189C8] dark:text-[#55B9E8] bg-white dark:bg-[#111C38] border-2 border-[#000000] dark:border-[#1E2E4A] hover:bg-[#EEF8FC] dark:hover:bg-[#162744] shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <Mic className="w-4 h-4" />
              Test Live in Browser
            </button>
          </div>
        </div>

        {/* 3D Interactive Telephony Hardware & Acoustic Showcase */}
        <div className="bg-white dark:bg-[#0D162B] rounded-3xl p-6 sm:p-10 border-2 border-[#000000] dark:border-[#1E2E4A] shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Explanatory & Feature Highlights */}
            <div className="lg:col-span-6 space-y-5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-[#2189C8] dark:text-[#55B9E8] flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" />
                  Interactive 3D Voice Agent Engine & Hardware
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#000000] dark:text-white tracking-tight">
                Enterprise AI Voice Agent Architecture
              </h2>
              <p className="text-sm text-[#27272a] dark:text-[#94A3B8] font-medium leading-relaxed">
                Interact with our 3D voice models below. Test our 3D AI agent avatar with real-time cursor gaze tracking and voice synthesis, inspect the SIP edge transceiver hardware, or test the high-fidelity broadcast studio microphone array.
              </p>

              {/* Model Tab Switcher */}
              <div className="flex flex-wrap items-center gap-2 p-1 bg-[#F5FAFC] dark:bg-[#16223F] rounded-xl border border-[#DDEBEF] dark:border-[#203456] w-fit">
                <button
                  onClick={() => setActiveTab('avatar')}
                  className={`px-4 py-2 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                    activeTab === 'avatar'
                      ? 'bg-[#38A85B] text-white shadow-xs'
                      : 'text-[#52636D] dark:text-[#94A3B8] hover:text-black dark:hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  3D AI Voice Agent
                </button>
                <button
                  onClick={() => setActiveTab('device')}
                  className={`px-4 py-2 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                    activeTab === 'device'
                      ? 'bg-[#2189C8] text-white shadow-xs'
                      : 'text-[#52636D] dark:text-[#94A3B8] hover:text-black dark:hover:text-white'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  3D Phone Terminal
                </button>
                <button
                  onClick={() => setActiveTab('mic')}
                  className={`px-4 py-2 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                    activeTab === 'mic'
                      ? 'bg-[#000000] text-white dark:bg-white dark:text-black shadow-xs'
                      : 'text-[#52636D] dark:text-[#94A3B8] hover:text-black dark:hover:text-white'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                  3D Studio Mic
                </button>
              </div>

              {/* Checklist */}
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center gap-2.5 text-xs font-bold text-[#000000] dark:text-white">
                  <CheckCircle2 className="w-4 h-4 text-[#38A85B] flex-shrink-0" />
                  <span>Sub-150ms audio latency via Opus/G.711 carrier codecs</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-bold text-[#000000] dark:text-white">
                  <CheckCircle2 className="w-4 h-4 text-[#38A85B] flex-shrink-0" />
                  <span>Zero-delay voice interruption with dynamic echo cancellation</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-bold text-[#000000] dark:text-white">
                  <CheckCircle2 className="w-4 h-4 text-[#38A85B] flex-shrink-0" />
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
          <div className="bg-white dark:bg-[#111C38] p-6 rounded-2xl border-2 border-[#000000] dark:border-[#1E2E4A] shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#EEF8FC] dark:bg-[#162742] text-[#2189C8] flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-[#000000] dark:text-white text-base">Ultra-Low Latency</h3>
            <p className="text-xs text-[#27272a] dark:text-[#94A3B8] font-medium leading-relaxed">
              Standard chatbots take 2-4 seconds to respond. Auris voice agents respond in under 150ms-300ms, matching the natural cadence of a human conversation.
            </p>
          </div>

          <div className="bg-white dark:bg-[#111C38] p-6 rounded-2xl border-2 border-[#000000] dark:border-[#1E2E4A] shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#EFFAF1] dark:bg-[#0F2D1F] text-[#38A85B] flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-[#000000] dark:text-white text-base">Natural Interruptions</h3>
            <p className="text-xs text-[#27272a] dark:text-[#94A3B8] font-medium leading-relaxed">
              Callers can interrupt or redirect the AI at any syllable. The agent ceases playback instantly and adapts its reasoning without awkward collision.
            </p>
          </div>

          <div className="bg-white dark:bg-[#111C38] p-6 rounded-2xl border-2 border-[#000000] dark:border-[#1E2E4A] shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#EEF8FC] dark:bg-[#162742] text-[#2189C8] flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-[#000000] dark:text-white text-base">Knowledge RAG & Cloudinary</h3>
            <p className="text-xs text-[#27272a] dark:text-[#94A3B8] font-medium leading-relaxed">
              Index PDFs, CSV patient lists, real estate docs, and Cloudinary-stored voice training files. Auris cites accurate facts with zero hallucinations.
            </p>
          </div>

          <div className="bg-white dark:bg-[#111C38] p-6 rounded-2xl border-2 border-[#000000] dark:border-[#1E2E4A] shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#EFFAF1] dark:bg-[#0F2D1F] text-[#38A85B] flex items-center justify-center">
              <Globe2 className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-[#000000] dark:text-white text-base">50+ Global Languages</h3>
            <p className="text-xs text-[#27272a] dark:text-[#94A3B8] font-medium leading-relaxed">
              Native accents in English (US, UK, Indian, Australian), Spanish, Hindi, French, German, and Japanese with localized conversational style.
            </p>
          </div>
        </div>

        {/* Feature Deep Dive: Provider Abstraction */}
        <div className="bg-white dark:bg-[#111C38] rounded-3xl p-8 sm:p-12 border-2 border-[#000000] dark:border-[#1E2E4A] shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-4">
              <div className="text-xs font-black uppercase tracking-wider text-[#2189C8] dark:text-[#55B9E8]">
                OmniDimension Telephony Carrier Backbone
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#000000] dark:text-white tracking-tight">
                Architected with Modular Voice Provider Abstraction
              </h2>
              <p className="text-sm text-[#27272a] dark:text-[#94A3B8] font-medium leading-relaxed">
                Auris decouples high-level business intelligence from low-level audio transports. Initially deployed on OmniDimension's battle-tested voice carrier infrastructure, Auris features clean pluggable provider interfaces that support native engine upgrades without disrupting live operations.
              </p>
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#000000] dark:text-white">
                  <CheckCircle2 className="w-4 h-4 text-[#38A85B]" />
                  <span>Direct WebRTC & SIP trunking with HD audio codecs</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-[#000000] dark:text-white">
                  <CheckCircle2 className="w-4 h-4 text-[#38A85B]" />
                  <span>Real-time speech-to-text token streaming</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-[#000000] dark:text-white">
                  <CheckCircle2 className="w-4 h-4 text-[#38A85B]" />
                  <span>Zero frontend-exposed API secrets or provider vendor lock-in</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 bg-[#0D182B] rounded-2xl p-6 text-white font-mono text-xs shadow-xl space-y-3 border border-[#213554]">
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
