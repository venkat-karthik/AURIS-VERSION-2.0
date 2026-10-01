import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Phone,
  Play,
  Pause,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  Headphones,
  UserCheck,
  Building2,
  Volume2,
  ShieldCheck,
  Zap,
  Radio,
  FileText,
  Clock,
  Layers,
  Flame,
  Cloud,
  ChevronRight,
  Activity,
  Cpu,
} from 'lucide-react';

interface HomeProps {
  onGetStarted: () => void;
  onWatchDemo: () => void;
  onExploreIndustry?: (industry: string) => void;
  onOpenDashboard: () => void;
}

export const Home: React.FC<HomeProps> = ({
  onGetStarted,
  onWatchDemo,
  onExploreIndustry,
}) => {
  const [selectedEngine, setSelectedEngine] = useState<'cartesia' | 'sarvam_hindi' | 'sarvam_telugu'>('cartesia');
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);
  const [activeTurn, setActiveTurn] = useState<number>(0);
  const audioIntervalRef = useRef<any>(null);

  const voiceEngines = [
    {
      id: 'cartesia' as const,
      name: 'Cartesia Sonic 2',
      tag: '<95ms Latency',
      accent: 'English (Indian / Global)',
      model: 'en-in-Chirp3-HD-Despina',
      description: 'Ultra-low latency expressive conversational voice with natural inflection and breathing.',
      sampleText: 'Namaste! Welcome to our real estate advisory. I can check flat availability, schedule a site tour, or connect you with a senior manager.',
    },
    {
      id: 'sarvam_hindi' as const,
      name: 'Sarvam AI Saaras v2',
      tag: 'Native Indic',
      accent: 'Hindi (National)',
      model: 'sarvam-saaras-v2-hi',
      description: 'Authentic Hindi conversational synthesis tailored for Indian customer support and lead follow-up.',
      sampleText: 'नमस्ते! हमारी रियल एस्टेट सर्विस में आपका स्वागत है। क्या आप 2 या 3 BHK फ्लैट्स के बारे में जानकारी चाहते हैं?',
    },
    {
      id: 'sarvam_telugu' as const,
      name: 'Sarvam AI Bulbul v2',
      tag: 'Indic Regional',
      accent: 'Telugu (Regional)',
      model: 'sarvam-bulbul-v2-te',
      description: 'Regional Indic model with fluent dialectal nuances, ideal for local Telangana & Andhra customers.',
      sampleText: 'నమస్కారం! మా అపాయింట్‌మెంట్ సర్వీస్‌కు స్వాగతం. మీరు ఏ ప్రాపర్టీ వివరాలు తెలుసుకోవాలనుకుంటున్నారు?',
    },
  ];

  const currentEngineData = voiceEngines.find((e) => e.id === selectedEngine) || voiceEngines[0];

  // Turn-by-turn simulated dual-track dialogue
  const conversationDialogue = [
    { speaker: 'caller', text: 'Hi, I saw your luxury villas listing in Gachibowli. Is there a 3BHK duplex available for a site visit this Saturday?' },
    { speaker: 'agent', text: 'Yes, absolutely! We have 2 premium duplex villas scheduled for exclusive walkthroughs this Saturday at 11:30 AM or 3:00 PM. Which time suits you best?' },
    { speaker: 'caller', text: '11:30 AM works great for me. Please reserve it under Karthik.' },
    { speaker: 'agent', text: 'Confirmed, Karthik. I have booked your private walkthrough for Saturday at 11:30 AM. A confirmation SMS with the GPS pin has been dispatched.' },
  ];

  const handleToggleVoicePlayback = () => {
    if (isPlayingDemo) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      clearInterval(audioIntervalRef.current);
      setIsPlayingDemo(false);
      setActiveTurn(0);
      return;
    }

    setIsPlayingDemo(true);
    let step = 0;
    setActiveTurn(0);

    const playNextTurn = () => {
      if (step >= conversationDialogue.length) {
        setIsPlayingDemo(false);
        setActiveTurn(0);
        return;
      }

      setActiveTurn(step);
      const text = conversationDialogue[step].text;

      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        if (conversationDialogue[step].speaker === 'caller') {
          utterance.pitch = 0.85; // deep human caller voice
        } else {
          utterance.pitch = 1.1; // crisp responsive agent voice
        }

        utterance.onend = () => {
          step++;
          audioIntervalRef.current = setTimeout(playNextTurn, 600);
        };
        utterance.onerror = () => {
          setIsPlayingDemo(false);
        };
        window.speechSynthesis.speak(utterance);
      } else {
        step++;
        audioIntervalRef.current = setTimeout(playNextTurn, 2200);
      }
    };

    playNextTurn();
  };

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      clearTimeout(audioIntervalRef.current);
    };
  }, []);

  return (
    <div className="overflow-hidden bg-[#F8FAFC] dark:bg-[#070D18] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* 1. ENTERPRISE HERO SECTION */}
      <section className="relative pt-12 pb-18 md:pt-18 md:pb-24 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070D18]">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f015_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f015_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6 flex flex-col items-center">
            {/* Architecture Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-2xs"
            >
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">Cartesia Sonic</span>
              <span className="text-slate-400">•</span>
              <span className="font-mono text-[11px] text-sky-600 dark:text-sky-400 font-bold">Sarvam Indic AI</span>
              <span className="text-slate-400">•</span>
              <span>Plivo India Telecom</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 dark:text-white leading-[1.1] tracking-tight max-w-3xl"
            >
              Autonomous Voice AI <br />
              <span className="text-emerald-600 dark:text-emerald-400">
                Built for Real Telecom.
              </span>
            </motion.h1>

            {/* Enterprise Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed font-normal"
            >
              Deploy conversational AI agents that automate inbound reception, qualify leads, and resolve queries with sub-100ms response speed. Native Indian language support, exact human & AI dual-track call recordings on Cloudinary, and direct Plivo India virtual numbers.
            </motion.p>

            {/* Call to Actions */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="flex flex-wrap items-center justify-center gap-3 pt-2"
            >
              <button
                id="hero-get-started-cta"
                onClick={onGetStarted}
                className="px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-2 active:scale-98"
              >
                <span>Create Voice Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="hero-test-console-cta"
                onClick={handleToggleVoicePlayback}
                className="px-5 py-3.5 rounded-xl font-bold text-sm text-slate-800 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer flex items-center gap-2"
              >
                {isPlayingDemo ? <Pause className="w-4 h-4 text-rose-500" /> : <Play className="w-4 h-4 text-emerald-500 fill-current" />}
                <span>{isPlayingDemo ? 'Stop Live Audio' : 'Test Voice Latency'}</span>
              </button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-3 gap-6 sm:gap-12 pt-6 border-t border-slate-200 dark:border-slate-800/80 max-w-lg w-full"
            >
              <div>
                <div className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white font-mono">&lt;100ms</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Cartesia Latency</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">10+ Indic</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Sarvam AI Languages</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-sky-600 dark:text-sky-400 font-mono">Dual-Track</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Cloudinary Audio CDN</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. ARCHITECTURE PIPELINE */}
      <section className="py-16 bg-white dark:bg-[#070D18] border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2">
              High-Precision Telephony Pipeline
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
              Enterprise Voice Infrastructure from SIP to Archive
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Phone className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-950 dark:text-white">1. Plivo India SIP Ingestion</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Connects direct Indian +91 DIDs and toll-free numbers via Carrier SIP mesh with instant caller identification.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
                <Radio className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-950 dark:text-white">2. Sarvam AI Indic STT</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Speech recognition for English, Hindi, Telugu, and Tamil with native accent comprehension and code-switching.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-950 dark:text-white">3. Cartesia Sonic Synthesis</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Ultra-low latency speech generation (&lt;100ms) with emotional cadence, interruption handling, and natural tone.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                <Cloud className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-950 dark:text-white">4. Cloudinary Recording CDN</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Dual-track stereo audio files and turn-by-turn transcripts archived securely with instant audio streaming.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. BUSINESS SOLUTIONS */}
      <section className="py-18 bg-[#F8FAFC] dark:bg-[#0A1120]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1.5">
                Targeted Deployments
              </h2>
              <p className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
                Autonomous Voice Workflows for Your Industry
              </p>
            </div>
            <button
              onClick={onGetStarted}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-900 dark:text-white bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <span>Explore All Solutions</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Solution 1: Real Estate */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 hover:border-emerald-500/50 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-950 dark:text-white">Real Estate Lead Qualification</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Captures caller budget, preferred BHK, location parameters, and schedules verified site visits directly into Google Calendar & CRM.
              </p>
              <div className="pt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span>94% Lead Conversion Rate</span>
              </div>
            </div>

            {/* Solution 2: Healthcare & Clinics */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 hover:border-emerald-500/50 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-950 dark:text-white">Healthcare & Dental Front-Desk</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Answers practice FAQs, patient prep questions, doctor schedule inquiries, and locks in appointment slots without busy signals.
              </p>
              <div className="pt-2 text-xs font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1">
                <span>Zero Missed Patient Calls</span>
              </div>
            </div>

            {/* Solution 3: Outbound Campaigns */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 hover:border-emerald-500/50 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-950 dark:text-white">Outbound Dispatch & Re-engagement</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Re-engages stale CRM prospects, confirms event attendance, and verifies loan eligibility with high answering machine detection accuracy.
              </p>
              <div className="pt-2 text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <span>1,200+ Calls per Hour</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CALL TO ACTION STRIP */}
      <section className="py-16 bg-slate-900 dark:bg-[#050913] text-white border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Ready to upgrade your enterprise voice operations?
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            Deploy voice agents powered by Cartesia Sonic and Sarvam AI. Connect your Plivo India phone numbers and store recordings on Cloudinary in minutes.
          </p>
          <div className="pt-2 flex justify-center">
            <button
              onClick={onGetStarted}
              className="px-7 py-3.5 rounded-xl font-bold text-sm text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Get Started with Google SSO</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
