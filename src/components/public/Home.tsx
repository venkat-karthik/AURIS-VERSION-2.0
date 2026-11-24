import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Phone,
  Play,
  Pause,
  ArrowRight,
  Building2,
  Cloud,
  ChevronRight,
  Activity,
  Cpu,
  Radio,
  Calculator,
  TrendingUp,
} from 'lucide-react';
import { Interactive3DAgentAvatar } from '../common/Interactive3DAgentAvatar';
import { aurisApi } from '../../services/apiService';

interface HomeProps {
  onGetStarted: () => void;
  onWatchDemo: () => void;
  onExploreIndustry?: (industry: string) => void;
  onOpenDashboard: () => void;
}

export const Home: React.FC<HomeProps> = ({
  onGetStarted,
  onExploreIndustry,
}) => {
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);
  const [activeTurn, setActiveTurn] = useState<number>(0);
  const [selectedLanguage, setSelectedLanguage] = useState<'te-IN' | 'hi-IN' | 'en-IN'>('te-IN');
  const [callVolumeMins, setCallVolumeMins] = useState<number>(3000);
  const audioIntervalRef = useRef<any>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  const dialoguesByLanguage: Record<string, Array<{ speaker: 'caller' | 'agent'; text: string }>> = {
    'te-IN': [
      { speaker: 'caller', text: 'నమస్కారం అండి! నాకు మీ బిజినెస్ వాయిస్ ఏజెంట్ డెమో కావాలి.' },
      { speaker: 'agent', text: 'నమస్కారం అండి! ఆరిస్ వాయిస్ క్లౌడ్ కి స్వాగతం. మా AI ఏజెంట్లు మీ కస్టమర్ కాల్స్ ని 24 గంటలు సహజమైన వాడుక భాషలో మాట్లాడతాయి. చెప్పండి, మీ వ్యాపారం కోసం చూడాలా?' },
      { speaker: 'caller', text: 'అవునండి, రియల్ ఎస్టేట్ లీడ్స్ క్వాలిఫికేషన్ కోసం కావాలి.' },
      { speaker: 'agent', text: 'ఖచ్చితంగా అండి! ప్రతి ఇన్కమింగ్ కాల్ ని 100 మిల్లీ సెకన్లలో ఆన్సర్ చేసి, సైట్ విజిట్ బుక్ చేస్తుంది. మీరు ఇప్పుడే ఉచితంగా టెస్ట్ చేయవచ్చు!' },
    ],
    'hi-IN': [
      { speaker: 'caller', text: 'नमस्ते, मुझे आपके नए बिज़नेस वॉइस एजेंट्स के बारे में जानना है।' },
      { speaker: 'agent', text: 'नमस्ते जी! ऑरिस वॉइस प्लेटफॉर्म में आपका स्वागत है। हमारे AI एजेंट्स आपके कॉल्स 24/7 ऑटोमेट करते हैं। क्या आप कस्टमर सपोर्ट के लिए देखना चाहते हैं?' },
      { speaker: 'caller', text: 'हाँ, हमें अपॉइंटमेंट बुकिंग और लीड कॉलिंग के लिए चाहिए।' },
      { speaker: 'agent', text: 'बिल्कुल! हम सीधे आपके फोन नंबर से कनेक्ट कर देते हैं। आप अभी फ्री में टेस्ट कॉल शुरू कर सकते हैं!' },
    ],
    'en-IN': [
      { speaker: 'caller', text: 'Hi, I saw your autonomous voice AI platform. Can this handle customer bookings?' },
      { speaker: 'agent', text: 'Hello! Welcome to Auris Voice Services. Absolutely, our sub-100ms conversational agents qualify prospects, schedule calendar appointments, and sync directly with your CRM.' },
      { speaker: 'caller', text: 'That is great. What is the pricing per minute?' },
      { speaker: 'agent', text: 'We operate on a transparent 20-second pulse at ₹1.60 per slot, which is ₹4.80 per minute with zero setup fees. Would you like to test a live call?' },
    ],
  };

  const currentDialogue = dialoguesByLanguage[selectedLanguage] || dialoguesByLanguage['te-IN'];

  const handleToggleVoicePlayback = async () => {
    if (isPlayingDemo) {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      clearTimeout(audioIntervalRef.current);
      setIsPlayingDemo(false);
      setActiveTurn(0);
      return;
    }

    setIsPlayingDemo(true);
    let step = 0;
    setActiveTurn(0);

    const playNextTurn = async () => {
      if (step >= currentDialogue.length) {
        setIsPlayingDemo(false);
        setActiveTurn(0);
        return;
      }

      setActiveTurn(step);
      const text = currentDialogue[step].text;

      try {
        const previewRes = await aurisApi.synthesizeVoicePreview({
          text,
          languageCode: selectedLanguage,
          provider: 'auto',
        });

        if (previewRes.audioBase64) {
          const audio = new Audio(`data:${previewRes.format || 'audio/wav'};base64,${previewRes.audioBase64}`);
          currentAudioRef.current = audio;
          audio.onended = () => {
            step++;
            audioIntervalRef.current = setTimeout(playNextTurn, 500);
          };
          audio.onerror = () => {
            fallbackSpeechSynth(text, () => {
              step++;
              audioIntervalRef.current = setTimeout(playNextTurn, 500);
            });
          };
          await audio.play();
          return;
        }
      } catch {
        // Fallback to Web Speech API
      }

      fallbackSpeechSynth(text, () => {
        step++;
        audioIntervalRef.current = setTimeout(playNextTurn, 500);
      });
    };

    const fallbackSpeechSynth = (text: string, onDone: () => void) => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        utterance.lang = selectedLanguage;
        utterance.onend = onDone;
        utterance.onerror = () => setIsPlayingDemo(false);
        window.speechSynthesis.speak(utterance);
      } else {
        audioIntervalRef.current = setTimeout(onDone, 2000);
      }
    };

    playNextTurn();
  };

  useEffect(() => {
    return () => {
      if (currentAudioRef.current) currentAudioRef.current.pause();
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      clearTimeout(audioIntervalRef.current);
    };
  }, []);

  return (
    <div className="overflow-hidden bg-[#F8FAFC] dark:bg-[#090B10] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* 1. CALM EXECUTIVE HERO */}
      <section className="relative pt-14 pb-20 md:pt-20 md:pb-28 border-b border-slate-200/80 dark:border-white/[0.06] overflow-hidden">
        {/* Subtle grid + soft ambient radial glow */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#64748b0d_1px,transparent_1px),linear-gradient(to_bottom,#64748b0d_1px,transparent_1px)] bg-[size:4.5rem_4.5rem] [mask-image:radial-gradient(ellipse_65%_55%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
        <div className="absolute -top-24 left-1/4 w-[520px] h-[520px] bg-indigo-500/[0.07] dark:bg-indigo-500/[0.11] rounded-full blur-3xl pointer-events-none animate-float-slow" />
        <div className="absolute top-1/3 right-1/6 w-[400px] h-[400px] bg-sky-500/[0.05] dark:bg-sky-500/[0.06] rounded-full blur-3xl pointer-events-none animate-float-reverse" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
            {/* Left Content Column */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7 space-y-6 text-left"
            >
              {/* Calm Status Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-white/[0.04] border border-slate-200/90 dark:border-white/[0.08] text-xs font-medium text-slate-700 dark:text-slate-300 shadow-2xs backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-breathe" />
                <span>Sub-100ms Autonomous Voice Infrastructure</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-bold text-slate-900 dark:text-slate-50 leading-[1.1] tracking-tight">
                Voice AI that sounds <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-sky-500 to-indigo-500 dark:from-indigo-300 dark:via-sky-300 dark:to-indigo-400">
                  calm, natural, and human.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-[17px] text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed font-normal">
                Deploy multilingual AI voice agents on dedicated Indian carrier trunks. Handle inbound bookings, qualify leads, and resolve support calls 24/7.
              </p>

              {/* Multilingual Dialect Selector */}
              <div className="space-y-2.5 pt-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Preview Regional Fluency
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { id: 'te-IN', label: 'తెలుగు (Telugu)' },
                    { id: 'hi-IN', label: 'हिन्दी (Hindi)' },
                    { id: 'en-IN', label: 'English (India)' },
                  ].map((lang) => (
                    <button
                      key={lang.id}
                      type="button"
                      onClick={() => {
                        setSelectedLanguage(lang.id as any);
                        if (isPlayingDemo) handleToggleVoicePlayback();
                      }}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
                        selectedLanguage === lang.id
                          ? 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30 font-semibold'
                          : 'bg-white dark:bg-white/[0.03] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/[0.07] hover:border-slate-300 dark:hover:border-white/[0.15]'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dual-Track Transcript Preview Box */}
              <div className="p-4 rounded-2xl bg-white/90 dark:bg-[#0F1219]/90 border border-slate-200/90 dark:border-white/[0.07] text-xs space-y-2 max-w-xl shadow-xs">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isPlayingDemo ? 'bg-emerald-500 animate-breathe' : 'bg-slate-400 dark:bg-slate-600'}`} />
                    <span>{isPlayingDemo ? 'Streaming Live Audio' : 'Interactive Dialogue Preview'}</span>
                  </span>
                  <span>Turn {activeTurn + 1} / {currentDialogue.length}</span>
                </div>
                <div className="text-[13px] text-slate-800 dark:text-slate-200 leading-relaxed">
                  <span className={`font-semibold mr-2 ${currentDialogue[activeTurn]?.speaker === 'agent' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}>
                    {currentDialogue[activeTurn]?.speaker === 'agent' ? 'Auris AI:' : 'Caller:'}
                  </span>
                  <span>&ldquo;{currentDialogue[activeTurn]?.text}&rdquo;</span>
                </div>
              </div>

              {/* Primary & Secondary CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  id="hero-get-started-cta"
                  onClick={onGetStarted}
                  className="px-6 py-3 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm transition-colors cursor-pointer flex items-center gap-2"
                >
                  <span>Create Voice Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>

                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  id="hero-experience-voice-cta"
                  onClick={handleToggleVoicePlayback}
                  className={`px-5 py-3 rounded-xl font-semibold text-sm border transition-all cursor-pointer flex items-center gap-2.5 ${
                    isPlayingDemo
                      ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/30'
                      : 'text-slate-700 dark:text-slate-200 bg-white hover:bg-slate-50 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border-slate-200 dark:border-white/[0.09]'
                  }`}
                >
                  {isPlayingDemo ? (
                    <>
                      <Pause className="w-4 h-4 text-rose-500" />
                      <span>Stop Preview</span>
                      <div className="flex items-center gap-0.5 h-4 ml-1">
                        <span className="w-1 bg-rose-500 rounded-full animate-bar-1" />
                        <span className="w-1 bg-rose-500 rounded-full animate-bar-2" />
                        <span className="w-1 bg-rose-500 rounded-full animate-bar-3" />
                      </div>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 text-indigo-600 dark:text-indigo-400 fill-current" />
                      <span>Listen to Live Voice</span>
                    </>
                  )}
                </motion.button>
              </div>

              {/* Clean Metric Strip */}
              <div className="grid grid-cols-3 gap-6 sm:gap-10 pt-6 border-t border-slate-200/80 dark:border-white/[0.06] max-w-lg w-full">
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-50 font-mono">
                    &lt;95<span className="text-xs font-normal text-slate-500 ml-0.5">ms</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Response Latency</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                    10+
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Indian Dialects</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    99.9%
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Carrier Uptime</div>
                </div>
              </div>
            </motion.div>

            {/* Right Visual Stage */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5 relative flex flex-col items-center"
            >
              <div className="w-full max-w-[460px] relative">
                <div className="absolute -inset-2 rounded-3xl bg-indigo-500/[0.08] blur-2xl -z-10" />
                <Interactive3DAgentAvatar height={440} />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. ARCHITECTURE PIPELINE */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="py-20 bg-white dark:bg-[#090B10] border-b border-slate-200/80 dark:border-white/[0.06]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.16em]">
              Telephony Pipeline
            </h2>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
              Unbundled Voice Infrastructure
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: Phone,
                title: '1. Carrier SIP Ingestion',
                desc: 'Direct virtual phone numbers and toll-free lines with instant caller identification.',
              },
              {
                icon: Radio,
                title: '2. Neural Speech-to-Text',
                desc: 'Accurate multilingual voice recognition with native accent comprehension and code-switching.',
              },
              {
                icon: Cpu,
                title: '3. Ultra-Low Latency Speech',
                desc: 'High-fidelity voice synthesis with natural human cadence and minimal conversational lag.',
              },
              {
                icon: Cloud,
                title: '4. Audio Cloud Archive',
                desc: 'Dual-track stereo call recordings and transcripts archived securely with instant playback.',
              },
            ].map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.45, delay: idx * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className="p-6 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F1219] border border-slate-200/90 dark:border-white/[0.07] hover:border-indigo-300 dark:hover:border-indigo-500/30 transition-all space-y-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/60 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{step.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {step.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* 3. BUSINESS SOLUTIONS */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="py-20 bg-[#F8FAFC] dark:bg-[#0C0F16] border-b border-slate-200/80 dark:border-white/[0.06]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.16em] mb-1.5">
                Targeted Deployments
              </h2>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
                Voice Automation for Every Industry
              </p>
            </div>
            <button
              onClick={() => (onExploreIndustry ? onExploreIndustry('all') : onGetStarted())}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-white/[0.04] hover:bg-slate-50 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.08] transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <span>Explore Solutions</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Building2,
                badgeText: '94% Lead Qualification',
                title: 'Real Estate Concierge',
                desc: 'Captures caller budget, preferred configuration, location parameters, and schedules site visits directly into your calendar.',
              },
              {
                icon: Activity,
                badgeText: 'Zero Missed Calls',
                title: 'Healthcare Front-Desk',
                desc: 'Answers practice FAQs, patient preparation questions, doctor availability, and locks in appointment slots cleanly.',
              },
              {
                icon: Phone,
                badgeText: '1,200+ Calls / Hour',
                title: 'Outbound Follow-Up',
                desc: 'Re-engages CRM prospects, confirms event attendance, and verifies eligibility with accurate answering machine detection.',
              },
            ].map((sol, idx) => {
              const Icon = sol.icon;
              return (
                <motion.div
                  key={sol.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.45, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="p-6 rounded-2xl bg-white dark:bg-[#0F1219] border border-slate-200/90 dark:border-white/[0.07] hover:border-indigo-300 dark:hover:border-indigo-500/30 transition-all flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-3.5">
                    <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/60 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{sol.title}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {sol.desc}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06] text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    {sol.badgeText}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* 4. TRANSPARENT SLOT ECONOMICS CALCULATOR */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="py-20 bg-white dark:bg-[#090B10] border-b border-slate-200/80 dark:border-white/[0.06]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.16em] flex items-center justify-center gap-1.5">
              <Calculator className="w-3.5 h-3.5" />
              <span>Transparent Slot Economics</span>
            </h2>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
              Calculate Your 20-Second Pulse Savings
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
              Billed on standard 20-second pulses (₹1.60/slot = ₹4.80/min) with zero setup fees or monthly minimums.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
            {/* Interactive Volume Slider */}
            <div className="lg:col-span-6 p-6 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F1219] border border-slate-200/90 dark:border-white/[0.07] space-y-5">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Monthly Call Minutes</span>
                  <span className="text-lg font-mono font-bold text-indigo-600 dark:text-indigo-400">{callVolumeMins.toLocaleString()} mins</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="15000"
                  step="500"
                  value={callVolumeMins}
                  onChange={(e) => setCallVolumeMins(Number(e.target.value))}
                  className="w-full accent-indigo-600 dark:accent-indigo-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1.5">
                  <span>500 mins (~75 calls/mo)</span>
                  <span>15,000 mins (~2,250 calls/mo)</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-[#090B10] border border-slate-200/80 dark:border-white/[0.06] space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Total 20-Second Slots</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">{(callVolumeMins * 3).toLocaleString()} slots</span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Wholesale Pipeline Cost (₹2.14/min)</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">₹{(callVolumeMins * 2.14).toLocaleString([], { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Billed to Business (₹4.80/min)</span>
                  <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">₹{(callVolumeMins * 4.80).toLocaleString([], { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="border-t border-slate-200 dark:border-white/[0.06] pt-2.5 flex justify-between font-semibold text-emerald-600 dark:text-emerald-400">
                  <span>Estimated Savings vs Human Team</span>
                  <span className="font-mono">₹{Math.max(0, Math.round(callVolumeMins * 18.5)).toLocaleString()} / mo</span>
                </div>
              </div>
            </div>

            {/* Summary Card */}
            <div className="lg:col-span-6 p-6 rounded-2xl bg-[#0F1219] border border-slate-800 dark:border-white/[0.08] space-y-5 text-white">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-semibold text-slate-100">Direct Unit Economics Advantage</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="text-[10px] text-slate-400 uppercase font-mono font-medium">Gross Margin</div>
                  <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">55.4%</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">+₹2.66 profit/min</div>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="text-[10px] text-slate-400 uppercase font-mono font-medium">Latency SLA</div>
                  <div className="text-2xl font-bold text-indigo-400 font-mono mt-1">&lt;140ms</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Real-time barge-in</div>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Connect your business in minutes with ₹500 starter test credits. No credit card required for initial setup.
              </p>
              <button
                type="button"
                onClick={onGetStarted}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>Launch Your AI Receptionist Free</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* 5. CALM FINAL CTA */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="py-20 bg-[#F8FAFC] dark:bg-[#090B10]"
      >
        <div className="max-w-3xl mx-auto px-4 text-center space-y-5">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Ready to elevate your voice operations?
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
            Deploy autonomous voice agents and connect your virtual phone numbers in under five minutes.
          </p>
          <div className="pt-2 flex justify-center">
            <button
              onClick={onGetStarted}
              className="px-7 py-3 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm transition-colors cursor-pointer flex items-center gap-2"
            >
              <span>Get Started with Google SSO</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.section>
    </div>
  );
};
