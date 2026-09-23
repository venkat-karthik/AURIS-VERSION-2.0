import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  PhoneCall,
  Activity,
  Cpu,
  Volume2,
  Database,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Layers,
  Zap,
  Radio,
  FileSpreadsheet,
} from 'lucide-react';

import { Interactive3DOrb } from './Interactive3DOrb';

interface StageNode {
  id: string;
  step: number;
  title: string;
  subtitle: string;
  latency: string;
  icon: React.ElementType;
  badge: string;
  description: string;
  techDetails: {
    protocol: string;
    throughput: string;
    specs: string;
  };
  color: string;
  darkColor: string;
  accentBg: string;
}

const STAGES: StageNode[] = [
  {
    id: 'sip',
    step: 1,
    title: 'Carrier SIP Ingest',
    subtitle: 'OmniDimension Telephony',
    latency: '35ms',
    icon: PhoneCall,
    badge: 'PSTN / VoIP',
    description: 'Inbound customer call arrives through global Tier-1 telecom carriers with jitter buffer normalization and G.711/Opus transcoding.',
    techDetails: {
      protocol: 'SIP over TLS / SRTP',
      throughput: '100k+ concurrent calls',
      specs: 'Lossless audio streaming',
    },
    color: 'from-[#2189C8] to-[#55B9E8]',
    darkColor: 'from-[#38BDF8] to-[#0284C7]',
    accentBg: 'bg-[#EEF8FC] dark:bg-[#162742]',
  },
  {
    id: 'vad-stt',
    step: 2,
    title: 'Deep VAD & Streaming STT',
    subtitle: 'Continuous Speech Recognition',
    latency: '85ms',
    icon: Activity,
    badge: 'Sub-100ms VAD',
    description: 'Barge-in voice activity detection immediately detects when human speaks, stopping AI speech and streaming speech tokens in real time.',
    techDetails: {
      protocol: 'Bi-directional WebSocket',
      throughput: 'Chunked 20ms frames',
      specs: 'Barge-in interrupt latency <60ms',
    },
    color: 'from-[#38A85B] to-[#65C978]',
    darkColor: 'from-[#4ADE80] to-[#22C55E]',
    accentBg: 'bg-[#EFFAF1] dark:bg-[#0F2D1F]',
  },
  {
    id: 'rag-llm',
    step: 3,
    title: 'Auris Neural Brain + RAG',
    subtitle: 'Knowledge Grounding Engine',
    latency: '110ms',
    icon: Cpu,
    badge: 'Vector Search',
    description: 'Zero-latency prompt compiler injects clinic/business policies, calendar availability, and caller intent with sub-sentence token generation.',
    techDetails: {
      protocol: 'Ultra-Fast Inference Engine',
      throughput: 'Streaming partial tokens',
      specs: 'Cloud CDN & Vector Embeddings',
    },
    color: 'from-[#2189C8] to-[#38A85B]',
    darkColor: 'from-[#38BDF8] to-[#4ADE80]',
    accentBg: 'bg-[#EEF8FC] dark:bg-[#162742]',
  },
  {
    id: 'tts',
    step: 4,
    title: 'Expressive Neural TTS',
    subtitle: 'Human-Like Voice Synthesis',
    latency: '48ms',
    icon: Volume2,
    badge: 'Emotional Voice',
    description: 'Converts streamed tokens into natural human prosody with conversational pauses, correct breathing inflection, and tone adaptation.',
    techDetails: {
      protocol: 'Opus 48kHz audio chunks',
      throughput: 'First audio packet in 48ms',
      specs: '50+ localized languages',
    },
    color: 'from-[#38A85B] to-[#2189C8]',
    darkColor: 'from-[#4ADE80] to-[#38BDF8]',
    accentBg: 'bg-[#EFFAF1] dark:bg-[#0F2D1F]',
  },
  {
    id: 'actions',
    step: 5,
    title: 'Live Actions & Integrations',
    subtitle: 'Media Storage, Google Forms & CRM',
    latency: 'Immediate',
    icon: FileSpreadsheet,
    badge: 'Auto Sync',
    description: 'Call recordings stream to secure media storage, extracted appointment details sync to Google Forms/Calendar, and billing updates via Razorpay.',
    techDetails: {
      protocol: 'Webhooks & Secure Media API',
      throughput: 'Atomic cloud sync',
      specs: 'Google Forms + Sheet automation',
    },
    color: 'from-[#2189C8] to-[#55B9E8]',
    darkColor: 'from-[#38BDF8] to-[#0284C7]',
    accentBg: 'bg-[#EEF8FC] dark:bg-[#162742]',
  },
];

export const ArchitectureFlow3D: React.FC = () => {
  const [selectedStage, setSelectedStage] = useState<StageNode>(STAGES[2]);
  const [rotateX, setRotateX] = useState<number>(18);
  const [rotateY, setRotateY] = useState<number>(-12);
  const [isAutoSpin, setIsAutoSpin] = useState<boolean>(true);
  const [activePacketStep, setActivePacketStep] = useState<number>(1);
  const isDragging = useRef<boolean>(false);
  const startPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Packet animation loop
  useEffect(() => {
    const timer = setInterval(() => {
      setActivePacketStep((prev) => (prev >= 5 ? 1 : prev + 1));
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  // Subtle auto-spin effect if enabled
  useEffect(() => {
    if (!isAutoSpin) return;
    let angle = -12;
    const interval = setInterval(() => {
      angle = angle === -12 ? 8 : -12;
      setRotateY(angle);
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoSpin]);

  // Touch / mouse interaction
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startPos.current = { x: e.clientX, y: e.clientY };
    setIsAutoSpin(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    setRotateY((prev) => Math.max(-35, Math.min(35, prev + dx * 0.15)));
    setRotateX((prev) => Math.max(5, Math.min(40, prev - dy * 0.15)));
    startPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  return (
    <section className="py-20 bg-gradient-to-b from-[#F5FAFC] via-white to-[#F5FAFC] dark:from-[#0A1120] dark:via-[#0E1B33] dark:to-[#0A1120] relative overflow-hidden transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EEF8FC] dark:bg-[#162742] border border-[#55B9E8]/30 dark:border-[#2D486B] text-xs font-bold text-[#000000] dark:text-[#55B9E8] shadow-xs">
            <Radio className="w-3.5 h-3.5 text-[#2189C8] animate-pulse" />
            <span>Interactive 3D Pipeline Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#000000] dark:text-white tracking-tight">
            How Auris Voice Agents Work
          </h2>
          <p className="text-base sm:text-lg text-[#27272a] dark:text-[#94A3B8] font-medium leading-relaxed">
            Drag to rotate in 3D space. Explore our sub-280ms full-duplex conversational voice pipeline.
          </p>

          {/* 3D Controls */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setIsAutoSpin(!isAutoSpin)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isAutoSpin
                  ? 'bg-[#38A85B] text-white shadow-xs'
                  : 'bg-white dark:bg-[#111C38] text-[#000000] dark:text-white border border-[#DDEBEF] dark:border-[#1E2E4A]'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAutoSpin ? 'animate-spin' : ''}`} />
              Auto Orbit: {isAutoSpin ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={() => {
                setRotateX(18);
                setRotateY(-12);
              }}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-[#111C38] text-[#000000] dark:text-white border border-[#DDEBEF] dark:border-[#1E2E4A] hover:bg-[#F5FAFC] cursor-pointer"
            >
              Reset 3D Perspective
            </button>
            <span className="text-xs text-[#000000] dark:text-[#94A3B8] font-semibold hidden sm:inline-block">
              (Total Round-Trip Latency: ~278ms)
            </span>
          </div>
        </div>

        {/* 3D Isometric Canvas Stage Container */}
        <div
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="relative w-full rounded-3xl p-6 sm:p-10 bg-white/80 dark:bg-[#111C38]/80 backdrop-blur-md border border-[#DDEBEF] dark:border-[#1E2E4A] shadow-xl overflow-hidden cursor-grab active:cursor-grabbing select-none"
          style={{ perspective: '1200px' }}
        >
          {/* Subtle 3D Grid floor pattern */}
          <div
            className="absolute inset-0 opacity-15 dark:opacity-10 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#000000 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* 3D Transformed Layer Group */}
          <div
            className="transition-transform duration-300 ease-out py-6"
            style={{
              transformStyle: 'preserve-3d',
              transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`,
            }}
          >
            {/* Live Packet Conduit Line */}
            <div className="hidden lg:flex justify-between items-center relative z-0 px-8 mb-6">
              <div className="absolute top-1/2 left-10 right-10 h-1.5 bg-gradient-to-r from-[#2189C8] via-[#38A85B] to-[#2189C8] rounded-full opacity-40 dark:opacity-30" />
            </div>

            {/* Stages Row in 3D space */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 relative z-10">
              {STAGES.map((st) => {
                const Icon = st.icon;
                const isSelected = selectedStage.id === st.id;
                const isPacketActive = activePacketStep === st.step;

                return (
                  <motion.div
                    key={st.id}
                    onClick={() => setSelectedStage(st)}
                    whileHover={{ scale: 1.04, translateZ: 30 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative rounded-2xl p-5 border cursor-pointer transition-all flex flex-col justify-between min-h-[220px] ${
                      isSelected
                        ? 'bg-white dark:bg-[#162744] border-[#000000] dark:border-[#38BDF8] shadow-2xl ring-2 ring-[#38A85B]'
                        : 'bg-[#F5FAFC] dark:bg-[#0D162C] border-[#DDEBEF] dark:border-[#1E2E4A] shadow-md hover:border-[#2189C8]'
                    }`}
                    style={{
                      transformStyle: 'preserve-3d',
                      boxShadow: isSelected
                        ? '0 20px 30px -10px rgba(0,0,0,0.15), 0 0 15px rgba(56,168,91,0.3)'
                        : undefined,
                    }}
                  >
                    {/* Glowing Traveling Packet Indicator */}
                    {isPacketActive && (
                      <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-[#38A85B] text-white text-[10px] font-black uppercase tracking-wider shadow-md animate-bounce flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Live
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div
                          className={`w-11 h-11 rounded-xl ${st.accentBg} flex items-center justify-center text-[#000000] dark:text-white shadow-xs border border-[#000000]/10 dark:border-white/10`}
                        >
                          <Icon className="w-5 h-5 text-[#2189C8] dark:text-[#38BDF8]" />
                        </div>
                        <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-[#000000] text-white dark:bg-white dark:text-[#000000]">
                          Stage {st.step}
                        </span>
                      </div>

                      <h3 className="font-extrabold text-base text-[#000000] dark:text-white leading-tight mb-1">
                        {st.title}
                      </h3>
                      <p className="text-xs text-[#27272a] dark:text-[#94A3B8] font-semibold mb-3">
                        {st.subtitle}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#DDEBEF] dark:border-[#1E2E4A] flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#000000] dark:text-white px-2 py-0.5 rounded bg-white dark:bg-[#1E2E4A] border border-[#DDEBEF] dark:border-transparent">
                        {st.badge}
                      </span>
                      <span className="text-xs font-extrabold text-[#38A85B] dark:text-[#4ADE80]">
                        ⚡ {st.latency}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Interactive Inspection Card for Selected Stage + 3D Neural Acoustic Orb */}
          <motion.div
            key={selectedStage.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-8 p-6 rounded-3xl bg-white dark:bg-[#0B132B] border-2 border-[#000000] dark:border-[#2A3B5C] shadow-lg"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Details */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#EFFAF1] dark:bg-[#0F2D1F] text-[#38A85B] border border-[#65C978]/30">
                    Inspecting Stage {selectedStage.step}: {selectedStage.title}
                  </span>
                  <span className="text-xs font-bold text-[#000000] dark:text-white">
                    Processing SLA: {selectedStage.latency}
                  </span>
                </div>
                <h4 className="text-xl font-black text-[#000000] dark:text-white">
                  {selectedStage.subtitle}
                </h4>
                <p className="text-sm text-[#27272a] dark:text-[#CBD5E1] font-medium leading-relaxed">
                  {selectedStage.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-[#F5FAFC] dark:bg-[#111C38] border border-[#DDEBEF] dark:border-[#1E2E4A]">
                    <div className="text-[10px] font-bold text-[#27272a] dark:text-[#94A3B8] uppercase">
                      Protocol
                    </div>
                    <div className="text-xs font-extrabold text-[#000000] dark:text-white mt-0.5">
                      {selectedStage.techDetails.protocol}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F5FAFC] dark:bg-[#111C38] border border-[#DDEBEF] dark:border-[#1E2E4A]">
                    <div className="text-[10px] font-bold text-[#27272a] dark:text-[#94A3B8] uppercase">
                      Throughput
                    </div>
                    <div className="text-xs font-extrabold text-[#000000] dark:text-white mt-0.5">
                      {selectedStage.techDetails.throughput}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F5FAFC] dark:bg-[#111C38] border border-[#DDEBEF] dark:border-[#1E2E4A]">
                    <div className="text-[10px] font-bold text-[#27272a] dark:text-[#94A3B8] uppercase">
                      Storage & Embeddings
                    </div>
                    <div className="text-xs font-extrabold text-[#38A85B] dark:text-[#4ADE80] mt-0.5">
                      {selectedStage.techDetails.specs}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Live Interactive 3D Acoustic Matrix */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center border-t lg:border-t-0 lg:border-l border-[#000000]/10 dark:border-[#1E2E4A] pt-6 lg:pt-0 lg:pl-6">
                <Interactive3DOrb size={220} activeStatusText="Live Acoustic Stream Matrix" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
