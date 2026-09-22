import React, { useState, useEffect } from 'react';
import {
  Brain,
  Database,
  PhoneCall,
  Zap,
  CheckCircle2,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Bot,
  FileText,
  Volume2,
  Send,
  ShieldCheck,
  ChevronRight,
  Layers,
  Activity,
} from 'lucide-react';

interface FlowStep {
  id: number;
  title: string;
  subtitle: string;
  badge: string;
  icon: any;
  color: string;
  accentBg: string;
  details: {
    description: string;
    keyPoints: string[];
    technicalHighlight: string;
    samplePayload: Record<string, any>;
  };
}

const FLOW_STEPS: FlowStep[] = [
  {
    id: 1,
    title: 'Define Voice Agent',
    subtitle: 'Persona, tone & language',
    badge: 'Step 1: Configuration',
    icon: Bot,
    color: '#38A85B',
    accentBg: '#EFFAF1',
    details: {
      description:
        'Specify the agent persona, welcome greeting, response guidelines, and voice acoustic style. The agent is trained on your exact business instructions.',
      keyPoints: [
        'Natural multi-lingual voice synthesis',
        'Custom greeting & brand persona adherence',
        'Interruption handling & human-like conversational turn-taking',
      ],
      technicalHighlight: 'Decoupled prompt engineering & customizable temperature',
      samplePayload: {
        agent: 'Dr. Ava AI',
        role: 'Healthcare Concierge',
        voice: 'Tara (Warm & Empathetic)',
        language: 'en-US / hi-IN',
        turnTakingLatency: '<250ms',
      },
    },
  },
  {
    id: 2,
    title: 'Ground with Knowledge',
    subtitle: 'Docs, CSVs & Cloudinary CDN',
    badge: 'Step 2: Grounding',
    icon: Database,
    color: '#2189C8',
    accentBg: '#EEF8FC',
    details: {
      description:
        'Upload your clinical guidelines, pricing packages, FAQs, or raw CSVs. Files are hosted on Cloudinary CDN and indexed into semantic embeddings for zero-hallucination accuracy.',
      keyPoints: [
        'Cloudinary CDN integration for documents & audio',
        'Direct CSV import for structured Q&A catalogs',
        'Strict guardrails ensuring verified factual answers only',
      ],
      technicalHighlight: 'Sub-40ms vector similarity retrieval & context injection',
      samplePayload: {
        indexedSources: ['OPD_Doctor_Rosters.pdf', 'Pricing_Packages.csv'],
        storageEngine: 'Cloudinary CDN + Firestore Sync',
        retrievalAccuracy: '99.4%',
      },
    },
  },
  {
    id: 3,
    title: 'Attach Telephony DID',
    subtitle: 'SIP trunk & phone numbers',
    badge: 'Step 3: Connectivity',
    icon: PhoneCall,
    color: '#8B5CF6',
    accentBg: '#F3E8FF',
    details: {
      description:
        'Connect local Indian (+91), US (+1), or UK (+44) phone numbers. Inbound calls are answered immediately; outbound campaigns dispatch at scale with custom caller ID.',
      keyPoints: [
        'Instant virtual number procurement',
        'Inbound call auto-reception with zero wait time',
        'Outbound scheduled queue with automatic retry logic',
      ],
      technicalHighlight: 'Tier-1 global SIP carrier interconnect with Opus compression',
      samplePayload: {
        didNumber: '+91 80 4719 3200',
        direction: 'Two-Way (Inbound & Outbound)',
        carrierProtocol: 'SIP / WebRTC Low Latency',
      },
    },
  },
  {
    id: 4,
    title: 'Real-Time Voice Engine',
    subtitle: 'STT → Reasoning → TTS',
    badge: 'Step 4: Live Processing',
    icon: Zap,
    color: '#F59E0B',
    accentBg: '#FEF3C7',
    details: {
      description:
        'During the call, caller speech is transcribed in real time (<100ms), reasoned by the neural LLM engine, and streamed back through neural audio speech synthesis (<200ms) with zero awkward silence.',
      keyPoints: [
        'Full duplex audio streaming with acoustic echo cancellation',
        'Dynamic entity extraction (caller name, date, intent)',
        'Live transfer to human team if complex escalation occurs',
      ],
      technicalHighlight: 'Under 300ms total glass-to-glass latency SLA',
      samplePayload: {
        sttSpeed: '85ms',
        llmInference: '110ms',
        ttsStream: '75ms',
        totalRoundtrip: '270ms',
      },
    },
  },
  {
    id: 5,
    title: 'Post-Call Intelligence',
    subtitle: 'Summary, CRM & Webhooks',
    badge: 'Step 5: Automation',
    icon: CheckCircle2,
    color: '#10B981',
    accentBg: '#D1FAE5',
    details: {
      description:
        'The second a call ends, an AI call summary is generated, appointment slots are booked into your calendar, leads are pushed to Google Sheets/Forms, and signed webhooks notify your CRM.',
      keyPoints: [
        'Automatic executive call summary & sentiment scoring',
        'Google Forms / Google Sheets real-time lead ingestion',
        'Signed HMAC-SHA256 webhooks & SMS confirmation alerts',
      ],
      technicalHighlight: 'Automated post-call pipelines dispatching in <500ms',
      samplePayload: {
        outcome: 'Appointment Scheduled (Tomorrow 10:30 AM)',
        leadScore: 94,
        syncedTo: ['Google Sheets', 'Webhook Endpoint', 'SMS Alert'],
      },
    },
  },
];

export const InteractiveAgentFlowChart: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const [activeStepId, setActiveStepId] = useState<number>(1);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationIndex, setSimulationIndex] = useState<number>(0);

  // Auto-play interactive tour
  useEffect(() => {
    let interval: any;
    if (isSimulating) {
      interval = setInterval(() => {
        setSimulationIndex((prev) => {
          const next = (prev + 1) % FLOW_STEPS.length;
          setActiveStepId(FLOW_STEPS[next].id);
          return next;
        });
      }, 3200);
    }
    return () => clearInterval(interval);
  }, [isSimulating]);

  const activeStep = FLOW_STEPS.find((s) => s.id === activeStepId) || FLOW_STEPS[0];

  return (
    <div className="bg-white dark:bg-[#111C38] rounded-3xl p-6 sm:p-8 border-2 border-[#000000] dark:border-[#1E2E4A] shadow-md space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFFAF1] dark:bg-[#0F2D1F] text-[11px] font-black text-[#38A85B] border border-[#65C978]/30 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Interactive Architecture Walkthrough</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#000000] dark:text-white tracking-tight">
            How Voice Agents Work End-to-End
          </h2>
          <p className="text-xs sm:text-sm text-[#27272a] dark:text-[#94A3B8] font-medium mt-0.5">
            Click any step to inspect the real-time telephony, knowledge grounding, and automation pipeline.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
              isSimulating
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-[#000000] hover:bg-[#262626] dark:bg-white dark:hover:bg-gray-100 text-white dark:text-[#000000]'
            }`}
          >
            {isSimulating ? (
              <>
                <Pause className="w-3.5 h-3.5" /> Pause Flow
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" /> Simulate Live Call
              </>
            )}
          </button>
        </div>
      </div>

      {/* Interactive Flow Chart Timeline / Bento Node Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {FLOW_STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isActive = step.id === activeStepId;
          const isPassed = step.id < activeStepId;

          return (
            <button
              key={step.id}
              onClick={() => {
                setActiveStepId(step.id);
                setIsSimulating(false);
              }}
              className={`p-3.5 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between cursor-pointer group ${
                isActive
                  ? 'border-[#000000] dark:border-white bg-[#F5FAFC] dark:bg-[#162744] shadow-md -translate-y-0.5'
                  : 'border-[#000000]/10 dark:border-[#1E2E4A] bg-white dark:bg-[#0D162C] hover:border-[#000000]/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center border"
                    style={{
                      backgroundColor: step.accentBg,
                      borderColor: `${step.color}40`,
                      color: step.color,
                    }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-black text-[#27272a] dark:text-[#94A3B8]">
                    0{step.id}
                  </span>
                </div>

                <div className="font-extrabold text-xs text-[#000000] dark:text-white group-hover:text-[#2189C8] transition-colors leading-tight">
                  {step.title}
                </div>
                <div className="text-[11px] text-[#27272a] dark:text-[#94A3B8] font-medium truncate mt-0.5">
                  {step.subtitle}
                </div>
              </div>

              {/* Active indicator dot */}
              <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#000000]/5 dark:border-[#1E2E4A]">
                <span
                  className={`text-[9px] font-extrabold uppercase ${
                    isActive ? 'text-[#38A85B]' : 'text-[#27272a] dark:text-[#94A3B8]'
                  }`}
                >
                  {isActive ? '● Active Step' : 'Click to View'}
                </span>
                {idx < FLOW_STEPS.length - 1 && (
                  <ArrowRight className="w-3 h-3 text-[#27272a]/40 dark:text-white/20 hidden sm:block" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Step Deep Dive Interactive Panel */}
      <div className="rounded-2xl p-5 sm:p-6 bg-[#F5FAFC] dark:bg-[#0D162C] border-2 border-[#000000] dark:border-[#1E2E4A] grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left explanation */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-2">
            <span
              className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full"
              style={{
                backgroundColor: activeStep.accentBg,
                color: activeStep.color,
              }}
            >
              {activeStep.badge}
            </span>
            <span className="text-xs font-bold text-[#27272a] dark:text-[#94A3B8]">
              {activeStep.details.technicalHighlight}
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-extrabold text-[#000000] dark:text-white">
            {activeStep.title}: {activeStep.subtitle}
          </h3>

          <p className="text-xs sm:text-sm text-[#27272a] dark:text-[#CBD5E1] font-medium leading-relaxed">
            {activeStep.details.description}
          </p>

          <div className="space-y-2 pt-1">
            {activeStep.details.keyPoints.map((point, i) => (
              <div key={i} className="flex items-center gap-2 text-xs font-bold text-[#000000] dark:text-white">
                <CheckCircle2 className="w-4 h-4 text-[#38A85B] shrink-0" />
                <span>{point}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={() => {
                setActiveStepId((prev) => (prev % FLOW_STEPS.length) + 1);
              }}
              className="px-4 py-2 rounded-xl bg-[#000000] dark:bg-white text-white dark:text-[#000000] text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-[#262626] transition-all shadow-xs"
            >
              <span>Next Stage</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] text-[#27272a] dark:text-[#94A3B8] font-medium">
              Step {activeStep.id} of 5 in automated execution loop
            </span>
          </div>
        </div>

        {/* Right Live Simulation Payload Inspector */}
        <div className="lg:col-span-5 bg-[#000000] rounded-2xl p-4 sm:p-5 text-white shadow-xl space-y-3 font-mono">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#38A85B] animate-pulse" />
              <span className="text-xs font-bold text-white tracking-wide">
                Live Telemetry Inspector
              </span>
            </div>
            <span className="text-[10px] text-white/50">stage_id: 0{activeStep.id}</span>
          </div>

          <div className="text-[11px] text-[#38A85B] font-bold">
            // Real-Time Signal & State Payload:
          </div>

          <pre className="text-[11px] text-white/90 overflow-x-auto p-3 rounded-xl bg-white/5 border border-white/10 leading-relaxed max-h-48 scrollbar-thin">
            {JSON.stringify(activeStep.details.samplePayload, null, 2)}
          </pre>

          <div className="flex items-center justify-between text-[10px] text-white/60 pt-1">
            <span>Latency SLA: Sub-300ms</span>
            <span className="text-[#55B9E8]">Carrier Status: Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
};
