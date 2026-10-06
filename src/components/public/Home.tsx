import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Phone,
  Play,
  Pause,
  Sparkles,
  ArrowRight,
  Building2,
  Cloud,
  ChevronRight,
  Activity,
  Cpu,
  Radio,
  Zap,
} from 'lucide-react';
import { Interactive3DAgentAvatar } from '../common/Interactive3DAgentAvatar';
import { Interactive3DDevice } from '../common/Interactive3DDevice';
import { Interactive3DStudioMic } from '../common/Interactive3DStudioMic';

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
  const [hero3DTab, setHero3DTab] = useState<'ai-agent' | 'device-pod' | 'studio-mic'>('ai-agent');
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);
  const [, setActiveTurn] = useState<number>(0);
  const audioIntervalRef = useRef<any>(null);

  // Turn-by-turn simulated dual-track dialogue
  const conversationDialogue = [
    { speaker: 'caller', text: 'Hi, I saw your luxury villas listing in Gachibowli. Is there a 3BHK duplex available for a site visit this Saturday?' },
    { speaker: 'agent', text: 'Yes, absolutely! We have 2 premium duplex villas scheduled for walkthroughs this Saturday at 11:30 AM or 3:00 PM. Which time suits you best?' },
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
          utterance.pitch = 0.85;
        } else {
          utterance.pitch = 1.1;
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
    <div className="overflow-hidden bg-white dark:bg-[#070D18] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* 1. ENTERPRISE HERO SECTION */}
      <section className="relative pt-12 pb-18 md:pt-18 md:pb-24 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070D18]">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f015_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f015_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content Column */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7 space-y-6 text-left"
            >
              {/* Architecture Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-xs font-semibold text-emerald-700 dark:text-emerald-300 shadow-2xs">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="font-semibold tracking-wide">Next-Gen Autonomous Voice AI</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 dark:text-white leading-[1.12] tracking-tight">
                Autonomous Voice AI <br />
                <span className="text-emerald-600 dark:text-emerald-400">
                  Built for Modern Business.
                </span>
              </h1>

              {/* Enterprise Subtitle - Clean, punchy & uncluttered */}
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed font-normal">
                Deploy human-like voice agents that automate customer calls, qualify inbound leads, and resolve inquiries 24/7 with sub-100ms response speed.
              </p>

              {/* Call to Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
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
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-6 sm:gap-12 pt-6 border-t border-slate-200 dark:border-slate-800/80 max-w-lg w-full">
                <div>
                  <div className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white font-mono">&lt;95ms</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Response Latency</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">10+ Dialects</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Multilingual Support</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-sky-600 dark:text-sky-400 font-mono">99.9%</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Telecom Uptime</div>
                </div>
              </div>
            </motion.div>

            {/* Right Visual Composition with 3D Models & AI Video Avatars */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5 relative flex flex-col items-center"
            >
              {/* 3D Showcase Tab Switcher */}
              <div className="w-full max-w-[460px] mb-3 p-1 rounded-2xl bg-white dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 shadow-sm flex items-center justify-between text-xs font-bold">
                <button
                  id="tab-ai-agent-btn"
                  onClick={() => setHero3DTab('ai-agent')}
                  className={`flex-1 py-2 px-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    hero3DTab === 'ai-agent'
                      ? 'bg-emerald-600 text-white shadow-xs font-extrabold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Voice Specialist</span>
                </button>
                <button
                  id="tab-device-pod-btn"
                  onClick={() => setHero3DTab('device-pod')}
                  className={`flex-1 py-2 px-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    hero3DTab === 'device-pod'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs font-extrabold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Terminal Node</span>
                </button>
                <button
                  id="tab-studio-mic-btn"
                  onClick={() => setHero3DTab('studio-mic')}
                  className={`flex-1 py-2 px-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    hero3DTab === 'studio-mic'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs font-extrabold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>Studio Array</span>
                </button>
              </div>

              {/* Central Active 3D / Video Stage Container */}
              <div className="w-full max-w-[460px]">
                {hero3DTab === 'ai-agent' && (
                  <Interactive3DAgentAvatar height={430} />
                )}

                {hero3DTab === 'device-pod' && (
                  <Interactive3DDevice size={380} />
                )}

                {hero3DTab === 'studio-mic' && (
                  <Interactive3DStudioMic size={380} />
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. ARCHITECTURE PIPELINE - Scroll animated */}
      <motion.section
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="py-18 bg-white dark:bg-[#070D18] border-b border-slate-200 dark:border-slate-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
              Telephony Pipeline
            </h2>
            <p className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
              Enterprise Voice Infrastructure
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: Phone,
                colorBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
                title: '1. Carrier SIP Ingestion',
                desc: 'Direct virtual phone numbers and toll-free lines with instant caller identification.',
              },
              {
                icon: Radio,
                colorBg: 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400',
                title: '2. Neural Speech-to-Text',
                desc: 'Accurate multilingual voice recognition with native accent comprehension and code-switching.',
              },
              {
                icon: Cpu,
                colorBg: 'bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400',
                title: '3. Ultra-Low Latency Speech',
                desc: 'High-fidelity voice synthesis with natural human cadence, emotion, and zero robotic lag.',
              },
              {
                icon: Cloud,
                colorBg: 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400',
                title: '4. Audio Cloud Archive',
                desc: 'Dual-track stereo call recordings and transcripts archived securely with instant streaming.',
              },
            ].map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all space-y-3"
                >
                  <div className={`w-10 h-10 rounded-xl ${step.colorBg} flex items-center justify-center font-bold`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-950 dark:text-white">{step.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {step.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* 3. BUSINESS SOLUTIONS - Scroll animated */}
      <motion.section
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="py-18 bg-white dark:bg-[#0A1120] border-b border-slate-200 dark:border-slate-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1.5">
                Targeted Deployments
              </h2>
              <p className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
                Voice Automation for Every Industry
              </p>
            </div>
            <button
              onClick={onGetStarted}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <span>Explore All Solutions</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Building2,
                colorBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
                badgeText: '94% Lead Conversion Rate',
                badgeColor: 'text-emerald-600 dark:text-emerald-400',
                title: 'Real Estate Lead Qualification',
                desc: 'Captures caller budget, preferred BHK, location parameters, and schedules verified site visits directly into your calendar.',
              },
              {
                icon: Activity,
                colorBg: 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400',
                badgeText: 'Zero Missed Patient Calls',
                badgeColor: 'text-sky-600 dark:text-sky-400',
                title: 'Healthcare Front-Desk',
                desc: 'Answers practice FAQs, patient prep questions, doctor schedule inquiries, and locks in appointment slots without busy signals.',
              },
              {
                icon: Phone,
                colorBg: 'bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400',
                badgeText: '1,200+ Calls per Hour',
                badgeColor: 'text-teal-600 dark:text-teal-400',
                title: 'Outbound Dispatch & Follow-up',
                desc: 'Re-engages stale CRM prospects, confirms event attendance, and verifies loan eligibility with high answering machine detection accuracy.',
              },
            ].map((sol, idx) => {
              const Icon = sol.icon;
              return (
                <motion.div
                  key={sol.title}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 hover:border-emerald-500/50 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className={`w-12 h-12 rounded-2xl ${sol.colorBg} flex items-center justify-center font-bold`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-extrabold text-slate-950 dark:text-white">{sol.title}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {sol.desc}
                    </p>
                  </div>
                  <div className={`pt-2 text-xs font-bold ${sol.badgeColor} flex items-center gap-1`}>
                    <span>{sol.badgeText}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* 4. CALL TO ACTION STRIP - Scroll animated */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="py-20 bg-white dark:bg-[#070D18] border-t border-slate-200 dark:border-slate-800"
      >
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950 dark:text-white">
            Ready to upgrade your enterprise voice operations?
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            Deploy autonomous voice agents and connect your virtual phone numbers in under five minutes.
          </p>
          <div className="pt-2 flex justify-center">
            <button
              onClick={onGetStarted}
              className="px-7 py-3.5 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-2 active:scale-98"
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
