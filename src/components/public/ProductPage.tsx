import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  Radio,
  Cloud,
  Phone,
  Volume2,
  TrendingUp,
} from 'lucide-react';

interface ProductPageProps {
  onGetStarted: () => void;
  onOpenPlayground: () => void;
}

export const ProductPage: React.FC<ProductPageProps> = ({ onGetStarted, onOpenPlayground }) => {
  const [activeVoiceTab, setActiveVoiceTab] = useState<'cartesia' | 'sarvam' | 'piloindia' | 'cloudinary'>('cartesia');

  const voiceBenchmarks = {
    cartesia: {
      title: 'Cartesia Sonic 2 Architecture',
      subtitle: 'Sub-100ms ultra-low latency conversational voice synthesis',
      latency: '92ms',
      sampleRate: '24kHz HD',
      models: ['Despina (Indian English)', 'Barbershop (Executive Male)', 'Katie (Conversational Support)'],
      description: 'Cartesia Sonic uses state-space neural models to achieve human response cadences under 100ms, matching the real-time turn-taking speed of natural phone conversations.',
      metrics: [
        { label: 'Time-to-First-Audio', val: '92ms' },
        { label: 'Audio Quality Score', val: '4.85 / 5 MOS' },
        { label: 'Interruption Tolerance', val: '<35ms Cutoff' },
      ],
    },
    sarvam: {
      title: 'Sarvam AI Indic Language Mesh',
      subtitle: 'Native conversational models for 10+ Indian regional languages',
      latency: '115ms',
      sampleRate: '16kHz Telephony',
      models: ['Saaras v2 (Hindi & Tamil)', 'Bulbul v2 (Telugu & Kannada)', 'Mayura (Bengali)'],
      description: 'Sarvam AI powers authentic Indian speech comprehension and voice synthesis. It natively understands Hinglish and Telugish code-switching, regional idioms, and varied Indian telephony acoustics.',
      metrics: [
        { label: 'Indian Dialects', val: '10+ Languages' },
        { label: 'Code-Switching Accuracy', val: '98.2%' },
        { label: 'Cost per Min', val: '~₹0.20 / min' },
      ],
    },
    piloindia: {
      title: 'Plivo India Carrier Telephony',
      subtitle: 'Native +91 virtual DIDs, toll-free lines, and high-capacity SIP trunks',
      latency: '24ms',
      sampleRate: 'G.711 / Opus',
      models: ['Bangalore (+91-80)', 'Mumbai (+91-22)', 'Delhi-NCR (+91-11)', 'Hyderabad (+91-40)'],
      description: 'Direct interconnection with Indian telecom providers ensuring verified caller ID (CLI) pass-through, zero dropped packets, and instant inbound receptionist routing.',
      metrics: [
        { label: 'Carrier Uptime SLA', val: '99.99%' },
        { label: 'Caller ID Delivery', val: '100% Verified' },
        { label: 'Max Concurrent Calls', val: '1,000+ Channels' },
      ],
    },
    cloudinary: {
      title: 'Cloudinary Dual-Track Recording CDN',
      subtitle: 'Stereo audio archiving, instant streaming, and secure media retrieval',
      latency: 'Instant CDN',
      sampleRate: 'Lossless WAV / MP3',
      models: ['Stereo 16-bit PCM', 'Dual-track Separation', 'Auto-transcription Sync'],
      description: 'Every completed call is split into distinct caller and AI channels, encoded into master audio, and archived onto Cloudinary CDN with permanent streaming URLs and signed downloads.',
      metrics: [
        { label: 'Storage Retention', val: 'Permanent' },
        { label: 'Dual-Channel Isolation', val: '100% Split' },
        { label: 'Streaming Bandwidth', val: 'Unlimited CDN' },
      ],
    },
  };

  const currentTab = voiceBenchmarks[activeVoiceTab];

  return (
    <div className="py-16 bg-white dark:bg-[#070D18] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Product Hero */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300 shadow-2xs">
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>Real-Time Voice Architecture</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-slate-950 dark:text-white tracking-tight">
            Conversational Voice AI Built for Carrier Networks
          </h1>

          <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            Auris bridges ultra-low latency LLM reasoning with real Indian telephony. Powered by Cartesia Sonic (&lt;100ms), Sarvam AI Indic models, Plivo India phone numbers, and Cloudinary dual-track recording storage.
          </p>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              onClick={onGetStarted}
              className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Deploy Voice Agent</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onOpenPlayground}
              className="px-6 py-3 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Mic className="w-3.5 h-3.5 text-emerald-500" />
              <span>Open Web Console</span>
            </button>
          </div>
        </motion.div>

        {/* Interactive Voice Engine Benchmarks & Acoustic Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          {/* Tab Navigation */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 mb-8 w-fit">
            <button
              onClick={() => setActiveVoiceTab('cartesia')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeVoiceTab === 'cartesia'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cartesia Sonic 2</span>
            </button>
            <button
              onClick={() => setActiveVoiceTab('sarvam')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeVoiceTab === 'sarvam'
                  ? 'bg-sky-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Sarvam Indic Models</span>
            </button>
            <button
              onClick={() => setActiveVoiceTab('piloindia')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeVoiceTab === 'piloindia'
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Plivo India Telephony</span>
            </button>
            <button
              onClick={() => setActiveVoiceTab('cloudinary')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeVoiceTab === 'cloudinary'
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              <Cloud className="w-3.5 h-3.5" />
              <span>Cloudinary Audio CDN</span>
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeVoiceTab}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
            >
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  <span>LATENCY BENCHMARK: {currentTab.latency}</span>
                  <span>•</span>
                  <span>SAMPLING: {currentTab.sampleRate}</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
                  {currentTab.title}
                </h2>

                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  {currentTab.subtitle}
                </p>

                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {currentTab.description}
                </p>

                {/* Available models list */}
                <div className="pt-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Verified Production Models:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {currentTab.models.map((mod, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200"
                      >
                        {mod}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Metrics Card */}
              <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-850 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Performance Telemetry
                </div>

                <div className="space-y-3">
                  {currentTab.metrics.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex items-center justify-between"
                    >
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{m.label}</span>
                      <span className="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400">{m.val}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex items-center gap-2 text-xs text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Production verified with 99.9% uptime</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* 4 Pillars of Auris Voice */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: 0, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-black text-slate-950 dark:text-white text-base">Sub-100ms Latency</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Cartesia Sonic streams audio packets continuously to eliminate conversational lag and simulate immediate human comprehension.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
              <Sliders className="w-5 h-5" />
            </div>
            <h3 className="font-black text-slate-950 dark:text-white text-base">Instant Interruptions</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Callers can interrupt at any word. The agent stops immediately without awkward overlapping echoes or robotic speech stutter.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <Cloud className="w-5 h-5" />
            </div>
            <h3 className="font-black text-slate-950 dark:text-white text-base">Cloudinary Dual-Track</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Every verbal exchange is recorded with isolated caller and AI tracks, archived to Cloudinary, and transcribed turn-by-turn.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
              <Radio className="w-5 h-5" />
            </div>
            <h3 className="font-black text-slate-950 dark:text-white text-base">10+ Indic Languages</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Powered by Sarvam AI models for Hindi, Telugu, Tamil, Kannada, and Bengali with native accent inflection and code-mixing.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
