import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
    <div className="overflow-hidden bg-white dark:bg-[#021024] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* 1. ENTERPRISE HERO SECTION */}
      <section className="relative pt-12 pb-18 md:pt-18 md:pb-24 border-b border-slate-200 dark:border-[#5483B3]/20 bg-white dark:bg-[#021024] overflow-hidden">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#5483b310_1px,transparent_1px),linear-gradient(to_bottom,#5483b310_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        {/* High-End Ambient Floating Mesh Gradients */}
        <div className="absolute -top-12 left-1/12 w-[480px] h-[480px] bg-gradient-to-tr from-[#1D64C2]/20 via-[#052659]/30 to-transparent rounded-full blur-3xl pointer-events-none animate-float-slow -z-10" />
        <div className="absolute top-1/4 right-1/12 w-[440px] h-[440px] bg-gradient-to-bl from-[#7DA0CA]/15 via-[#5483B3]/20 to-transparent rounded-full blur-3xl pointer-events-none animate-float-reverse -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content Column */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7 space-y-6 text-left"
            >
              {/* Architecture Badge with Shimmer */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#052659]/15 dark:bg-[#052659]/50 border border-[#1D64C2]/40 dark:border-[#7DA0CA]/40 text-xs font-semibold text-[#1D64C2] dark:text-[#C1E8FF] shadow-xs backdrop-blur-md animate-shimmer cursor-default"
              >
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1D64C2] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1D64C2] dark:bg-[#C1E8FF]"></span>
                </span>
                <span className="font-semibold tracking-wide">Next-Gen Autonomous Voice AI • Sub-100ms</span>
                <Sparkles className="w-3.5 h-3.5 text-[#C1E8FF] animate-pulse" />
              </motion.div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 dark:text-white leading-[1.12] tracking-tight">
                Autonomous Voice AI <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1D64C2] via-[#5483B3] to-[#7DA0CA] dark:from-[#5483B3] dark:via-[#7DA0CA] dark:to-[#C1E8FF]">
                  Built for Modern Business.
                </span>
              </h1>

              {/* Enterprise Subtitle */}
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed font-normal">
                Deploy human-like voice agents that automate customer calls, qualify inbound leads, and resolve inquiries 24/7 with sub-100ms response speed.
              </p>

              {/* Call to Actions with Fluid Springs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <motion.button
                  whileHover={{ scale: 1.025, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  id="hero-get-started-cta"
                  onClick={onGetStarted}
                  className="px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#052659] via-[#1D64C2] to-[#2563EB] hover:from-[#1D64C2] hover:to-[#3B82F6] shadow-md shadow-[#1D64C2]/25 hover:shadow-xl hover:shadow-[#1D64C2]/30 transition-all cursor-pointer flex items-center gap-2 group animate-shimmer"
                >
                  <span>Create Voice Workspace</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  id="hero-test-console-cta"
                  onClick={handleToggleVoicePlayback}
                  className={`px-5 py-3.5 rounded-xl font-bold text-sm border transition-all cursor-pointer flex items-center gap-2.5 ${
                    isPlayingDemo
                      ? 'bg-rose-50 text-rose-600 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800 shadow-md'
                      : 'text-slate-800 dark:text-[#C1E8FF] bg-slate-100 hover:bg-slate-200 dark:bg-[#052659]/50 dark:hover:bg-[#052659] border-slate-200 dark:border-[#5483B3]/30 hover:border-[#1D64C2]/50'
                  }`}
                >
                  {isPlayingDemo ? (
                    <>
                      <Pause className="w-4 h-4 text-rose-500 animate-pulse" />
                      <span>Stop Live Audio</span>
                      <div className="flex items-center gap-0.5 h-4 ml-1">
                        <span className="w-1 bg-rose-500 rounded-full animate-bar-1" />
                        <span className="w-1 bg-rose-500 rounded-full animate-bar-2" />
                        <span className="w-1 bg-rose-500 rounded-full animate-bar-3" />
                        <span className="w-1 bg-rose-500 rounded-full animate-bar-1" />
                      </div>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 text-[#1D64C2] dark:text-[#C1E8FF] fill-current" />
                      <span>Test Voice Latency</span>
                    </>
                  )}
                </motion.button>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-6 sm:gap-12 pt-6 border-t border-slate-200 dark:border-[#5483B3]/25 max-w-lg w-full">
                <div className="transition-transform hover:-translate-y-0.5 duration-200">
                  <div className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white font-mono flex items-baseline gap-1">
                    <span>&lt;95ms</span>
                    <span className="text-[10px] text-[#1D64C2] dark:text-[#C1E8FF]">RTT</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-[#7DA0CA] font-medium">Response Latency</div>
                </div>
                <div className="transition-transform hover:-translate-y-0.5 duration-200">
                  <div className="text-xl sm:text-2xl font-black text-[#1D64C2] dark:text-[#C1E8FF] font-mono">10+ Dialects</div>
                  <div className="text-[11px] text-slate-500 dark:text-[#7DA0CA] font-medium">Multilingual Support</div>
                </div>
                <div className="transition-transform hover:-translate-y-0.5 duration-200">
                  <div className="text-xl sm:text-2xl font-black text-[#5483B3] dark:text-[#7DA0CA] font-mono">99.9%</div>
                  <div className="text-[11px] text-slate-500 dark:text-[#7DA0CA] font-medium">Telecom Uptime</div>
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
              {/* Central Active Neural Voice Specialist Stage */}
              <div className="w-full max-w-[460px] relative">
                <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-[#1D64C2]/30 via-[#5483B3]/20 to-[#C1E8FF]/30 blur-xl opacity-60 -z-10" />
                <Interactive3DAgentAvatar height={450} />
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
        className="py-18 bg-white dark:bg-[#021024] border-b border-slate-200 dark:border-[#5483B3]/20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-xs font-bold text-[#1D64C2] dark:text-[#7DA0CA] uppercase tracking-widest">
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
                colorBg: 'bg-[#052659]/15 dark:bg-[#052659]/60 text-[#1D64C2] dark:text-[#C1E8FF]',
                title: '1. Carrier SIP Ingestion',
                desc: 'Direct virtual phone numbers and toll-free lines with instant caller identification.',
              },
              {
                icon: Radio,
                colorBg: 'bg-[#5483B3]/15 dark:bg-[#5483B3]/30 text-[#1D64C2] dark:text-[#7DA0CA]',
                title: '2. Neural Speech-to-Text',
                desc: 'Accurate multilingual voice recognition with native accent comprehension and code-switching.',
              },
              {
                icon: Cpu,
                colorBg: 'bg-[#1D64C2]/15 dark:bg-[#1D64C2]/30 text-[#1D64C2] dark:text-[#C1E8FF]',
                title: '3. Ultra-Low Latency Speech',
                desc: 'High-fidelity voice synthesis with natural human cadence, emotion, and zero robotic lag.',
              },
              {
                icon: Cloud,
                colorBg: 'bg-[#7DA0CA]/15 dark:bg-[#7DA0CA]/30 text-[#052659] dark:text-[#C1E8FF]',
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
                  className="p-5 rounded-2xl bg-white dark:bg-[#052659]/30 border border-slate-200 dark:border-[#5483B3]/25 shadow-xs hover:shadow-md hover:border-[#7DA0CA]/50 transition-all space-y-3"
                >
                  <div className={`w-10 h-10 rounded-xl ${step.colorBg} flex items-center justify-center font-bold`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-950 dark:text-white">{step.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
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
        className="py-18 bg-slate-50/60 dark:bg-[#052659]/15 border-b border-slate-200 dark:border-[#5483B3]/20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-xs font-bold text-[#1D64C2] dark:text-[#7DA0CA] uppercase tracking-widest mb-1.5">
                Targeted Deployments
              </h2>
              <p className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
                Voice Automation for Every Industry
              </p>
            </div>
            <button
              onClick={onGetStarted}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-900 dark:text-[#C1E8FF] bg-slate-100 dark:bg-[#052659] hover:bg-slate-200 dark:hover:bg-[#052659]/80 border border-transparent dark:border-[#5483B3]/30 transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <span>Explore All Solutions</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Building2,
                colorBg: 'bg-[#052659]/15 dark:bg-[#052659]/60 text-[#1D64C2] dark:text-[#C1E8FF]',
                badgeText: '94% Lead Conversion Rate',
                badgeColor: 'text-[#1D64C2] dark:text-[#C1E8FF]',
                title: 'Real Estate Lead Qualification',
                desc: 'Captures caller budget, preferred BHK, location parameters, and schedules verified site visits directly into your calendar.',
              },
              {
                icon: Activity,
                colorBg: 'bg-[#5483B3]/15 dark:bg-[#5483B3]/30 text-[#1D64C2] dark:text-[#7DA0CA]',
                badgeText: 'Zero Missed Patient Calls',
                badgeColor: 'text-[#1D64C2] dark:text-[#7DA0CA]',
                title: 'Healthcare Front-Desk',
                desc: 'Answers practice FAQs, patient prep questions, doctor schedule inquiries, and locks in appointment slots without busy signals.',
              },
              {
                icon: Phone,
                colorBg: 'bg-[#7DA0CA]/15 dark:bg-[#7DA0CA]/30 text-[#052659] dark:text-[#C1E8FF]',
                badgeText: '1,200+ Calls per Hour',
                badgeColor: 'text-[#1D64C2] dark:text-[#C1E8FF]',
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
                  className="p-6 rounded-3xl bg-white dark:bg-[#052659]/30 border border-slate-200 dark:border-[#5483B3]/25 space-y-4 hover:border-[#7DA0CA]/50 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className={`w-12 h-12 rounded-2xl ${sol.colorBg} flex items-center justify-center font-bold`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-extrabold text-slate-950 dark:text-white">{sol.title}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
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
        className="py-20 bg-white dark:bg-[#021024] border-t border-slate-200 dark:border-[#5483B3]/20"
      >
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950 dark:text-white">
            Ready to upgrade your enterprise voice operations?
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
            Deploy autonomous voice agents and connect your virtual phone numbers in under five minutes.
          </p>
          <div className="pt-2 flex justify-center">
            <button
              onClick={onGetStarted}
              className="px-7 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#052659] via-[#1D64C2] to-[#2563EB] hover:from-[#1D64C2] hover:to-[#3B82F6] shadow-md shadow-[#1D64C2]/25 hover:shadow-lg transition-all cursor-pointer flex items-center gap-2 active:scale-98"
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

