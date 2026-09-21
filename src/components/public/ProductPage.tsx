import React from 'react';
import { Mic, PhoneForwarded, BrainCircuit, Zap, Globe2, ShieldCheck, Database, Sliders, CheckCircle2, ArrowRight } from 'lucide-react';

interface ProductPageProps {
  onGetStarted: () => void;
  onOpenPlayground: () => void;
}

export const ProductPage: React.FC<ProductPageProps> = ({ onGetStarted, onOpenPlayground }) => {
  return (
    <div className="py-16 bg-[#F5FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* Product Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFFAF1] border border-[#65C978]/30 text-xs font-bold text-[#38A85B]">
            <BrainCircuit className="w-3.5 h-3.5" />
            Human-Grade Voice Intelligence
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#123047] tracking-tight">
            Conversational AI Built for Real Phone Lines
          </h1>
          <p className="text-base text-[#52636D] leading-relaxed">
            Auris bridges the gap between state-of-the-art LLM reasoning and real-world PSTN/SIP telephony. Experience fluid dialogue with sub-350ms response times, natural pitch inflections, and instant interruption tolerance.
          </p>
          <div className="flex justify-center gap-4 pt-2">
            <button
              onClick={onGetStarted}
              className="px-6 py-3 rounded-xl text-sm font-bold text-white bg-[#38A85B] hover:bg-[#2f8f4d] shadow-sm transition-all"
            >
              Start Free Trial
            </button>
            <button
              onClick={onOpenPlayground}
              className="px-6 py-3 rounded-xl text-sm font-semibold text-[#2189C8] bg-white border border-[#DDEBEF] hover:bg-[#EEF8FC] shadow-xs transition-all flex items-center gap-2"
            >
              <Mic className="w-4 h-4" />
              Test Live in Browser
            </button>
          </div>
        </div>

        {/* 4 Pillars of Auris Voice */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-[#DDEBEF] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#EEF8FC] text-[#2189C8] flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#123047] text-base">Ultra-Low Latency</h3>
            <p className="text-xs text-[#52636D] leading-relaxed">
              Standard chatbots take 2-4 seconds to respond. Auris voice agents respond in under 350ms, matching the speed of a human conversation.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#DDEBEF] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#EFFAF1] text-[#38A85B] flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#123047] text-base">Natural Interruptions</h3>
            <p className="text-xs text-[#52636D] leading-relaxed">
              Callers can interrupt or redirect the AI at any word. The agent stops speaking instantly and listens without awkward collision.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#DDEBEF] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#EEF8FC] text-[#2189C8] flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#123047] text-base">Live Knowledge RAG</h3>
            <p className="text-xs text-[#52636D] leading-relaxed">
              Index your clinic protocols, real estate listings, or menu specs. Auris cites accurate facts with zero hallucinated pricing.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#DDEBEF] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#EFFAF1] text-[#38A85B] flex items-center justify-center">
              <Globe2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#123047] text-base">50+ Global Languages</h3>
            <p className="text-xs text-[#52636D] leading-relaxed">
              Native accents in English (US, UK, Indian, Australian), Spanish, Hindi, French, German, and more with localized tone matching.
            </p>
          </div>
        </div>

        {/* Feature Deep Dive: Provider Abstraction */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#DDEBEF] shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-[#2189C8]">
                OmniDimension Telephony Backbone
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#123047]">
                Architected with Modern Voice Provider Abstraction
              </h2>
              <p className="text-sm text-[#52636D] leading-relaxed">
                Auris decouples high-level business intelligence from low-level audio transports. Initially deployed on OmniDimension's battle-tested voice carrier infrastructure, Auris features clean pluggable provider interfaces that support future native engine upgrades without changing your workflow.
              </p>
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#123047]">
                  <CheckCircle2 className="w-4 h-4 text-[#38A85B]" />
                  <span>Direct WebRTC & SIP trunking with HD audio codecs</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#123047]">
                  <CheckCircle2 className="w-4 h-4 text-[#38A85B]" />
                  <span>Real-time speech-to-text token streaming</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#123047]">
                  <CheckCircle2 className="w-4 h-4 text-[#38A85B]" />
                  <span>Zero frontend-exposed API secrets or provider vendor lock-in</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 bg-[#123047] rounded-2xl p-6 text-white font-mono text-xs shadow-lg space-y-3">
              <div className="flex items-center justify-between text-[#55B9E8] pb-2 border-b border-white/10">
                <span>Auris Provider Layer</span>
                <span className="text-[10px] bg-[#38A85B] text-white px-2 py-0.5 rounded">CONNECTED</span>
              </div>
              <div className="text-[#82919A] text-[11px]">
                // Universal Voice Engine Dispatcher<br />
                const provider = getActiveVoiceProvider();
              </div>
              <div className="text-green-400">
                &gt; provider.name: "OmniDimension"<br />
                &gt; provider.version: "2026.04.1-v3"<br />
                &gt; mean_latency: 342ms<br />
                &gt; interruption_handling: "active_full_duplex"<br />
                &gt; telephony_carrier: "OmniDimension Tier-1 SIP"
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
