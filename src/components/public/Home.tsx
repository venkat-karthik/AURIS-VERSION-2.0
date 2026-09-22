import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Phone,
  Play,
  Pause,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  Globe2,
  Headphones,
  UserCheck,
  Activity,
  Dumbbell,
  Building2,
  BedDouble,
  UtensilsCrossed,
  GraduationCap,
  Volume2,
  Shield,
  ShieldCheck,
  Zap,
  Star,
} from 'lucide-react';
import { LiveAgentExamples } from './LiveAgentExamples';
import { ArchitectureFlow3D } from '../common/ArchitectureFlow3D';
import { Interactive3DGlobe } from '../common/Interactive3DGlobe';
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
  onOpenDashboard,
}) => {
  const [hero3DTab, setHero3DTab] = useState<'ai-agent' | 'device-pod' | 'studio-mic'>('ai-agent');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeSpeechSample] = useState(
    "Hello! Thank you for calling Apollo Clinics. My name is Ava, your AI receptionist. I can help you schedule an appointment with Dr. Mehta, check clinic timings, or answer questions about our services. How may I help you today?"
  );

  const handlePlayVoiceSample = () => {
    if ('speechSynthesis' in window) {
      if (isPlayingAudio) {
        window.speechSynthesis.cancel();
        setIsPlayingAudio(false);
      } else {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(activeSpeechSample);
        utterance.rate = 1.0;
        utterance.pitch = 1.05;

        // Find a natural sounding voice if available
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(
          (v) =>
            v.lang.startsWith('en') &&
            (v.name.includes('Natural') ||
              v.name.includes('Female') ||
              v.name.includes('Google') ||
              v.name.includes('Samantha'))
        );
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        setIsPlayingAudio(true);
        window.speechSynthesis.speak(utterance);
      }
    } else {
      setIsPlayingAudio(!isPlayingAudio);
    }
  };

  return (
    <div className="overflow-hidden bg-[#F5FAFC] dark:bg-[#0A1120] transition-colors duration-200">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-20 md:pt-16 md:pb-28 bg-gradient-to-b from-sky-50/60 via-slate-50 to-white dark:from-[#0B1528] dark:via-[#080D1A] dark:to-[#080D1A] transition-colors">
        {/* Subtle Nature Atmospheric Blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[550px] pointer-events-none overflow-hidden opacity-40 dark:opacity-20">
          <div className="absolute -top-24 left-1/4 w-96 h-96 bg-[#55B9E8]/20 rounded-full blur-3xl" />
          <div className="absolute top-20 right-1/4 w-96 h-96 bg-[#65C978]/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content Column with motion entrance */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="lg:col-span-7 space-y-6 text-left"
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 shadow-xs">
                <Sparkles className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span className="text-xs font-bold text-sky-700 dark:text-sky-300 tracking-wide">
                  AI Voice Agents for Real Businesses
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 dark:text-white leading-[1.12] tracking-tight">
                Let Conversations <br />
                <span className="text-emerald-600 dark:text-emerald-400 inline-block font-extrabold">
                  Grow Your Business.
                </span>
              </h1>

              {/* Supporting Subtitle */}
              <p className="text-base sm:text-lg text-slate-700 dark:text-slate-200 max-w-xl leading-relaxed font-normal">
                Auris helps businesses automate calls, book appointments, qualify leads, and provide 24/7 support with natural, human-like AI voice agents.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <motion.button
                  id="hero-get-started-cta"
                  onClick={onGetStarted}
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-7 py-3.5 rounded-xl font-bold text-base text-white bg-emerald-600 hover:bg-emerald-500 shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2 group"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </motion.button>

                <motion.button
                  id="hero-watch-demo-cta"
                  onClick={onWatchDemo}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3.5 rounded-xl font-bold text-base text-slate-900 dark:text-white bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-sm transition-all cursor-pointer flex items-center gap-2.5"
                >
                  <div className="w-6 h-6 rounded-full bg-sky-50 dark:bg-slate-800 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                    <Play className="w-3 h-3 fill-current ml-0.5" />
                  </div>
                  Watch Demo
                </motion.button>
              </div>

              {/* Trust Micro-Indicators */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-6 pt-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Setup in minutes</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Works in 50+ languages</span>
                </div>
              </div>
            </motion.div>

            {/* Right Visual Composition with 3D Models Showcase */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
              className="lg:col-span-5 relative flex flex-col items-center"
            >
              {/* 3D Showcase Tab Switcher */}
              <div className="w-full max-w-[460px] mb-3 p-1 rounded-2xl bg-white dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 shadow-sm flex items-center justify-between text-xs font-bold">
                <button
                  onClick={() => setHero3DTab('ai-agent')}
                  className={`flex-1 py-2 px-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    hero3DTab === 'ai-agent'
                      ? 'bg-emerald-600 text-white shadow-xs font-extrabold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>3D AI Agent</span>
                </button>
                <button
                  onClick={() => setHero3DTab('device-pod')}
                  className={`flex-1 py-2 px-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    hero3DTab === 'device-pod'
                      ? 'bg-sky-600 text-white shadow-xs font-extrabold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>3D Phone Unit</span>
                </button>
                <button
                  onClick={() => setHero3DTab('studio-mic')}
                  className={`flex-1 py-2 px-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    hero3DTab === 'studio-mic'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs font-extrabold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>3D Studio Mic</span>
                </button>
              </div>

              {/* Active Tab Content */}
              <div className="w-full max-w-[460px]">
                {hero3DTab === 'ai-agent' && (
                  <Interactive3DAgentAvatar
                    height={380}
                  />
                )}

                {hero3DTab === 'device-pod' && (
                  <Interactive3DDevice
                    size={380}
                  />
                )}

                {hero3DTab === 'studio-mic' && (
                  <Interactive3DStudioMic
                    size={380}
                  />
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. TRUSTED BY SECTION */}
      <section className="py-14 bg-white dark:bg-slate-900 border-y border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-8">
            Trusted by forward-thinking businesses and healthcare providers worldwide
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 lg:gap-12">
            <div className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-2 text-slate-900 dark:text-white font-extrabold text-base shadow-xs hover:border-slate-300 dark:hover:border-slate-600 transition-all">
              <span className="text-emerald-600 dark:text-emerald-400 font-black text-lg">Apollo</span>Clinics
            </div>
            <div className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-2 text-slate-900 dark:text-white font-black tracking-wider text-base shadow-xs hover:border-slate-300 dark:hover:border-slate-600 transition-all">
              <Dumbbell className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              FITZONE
            </div>
            <div className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-2 text-slate-900 dark:text-white font-medium text-base shadow-xs hover:border-slate-300 dark:hover:border-slate-600 transition-all">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              the herb room
            </div>
            <div className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-2 text-slate-900 dark:text-white font-extrabold text-base uppercase tracking-tight shadow-xs hover:border-slate-300 dark:hover:border-slate-600 transition-all">
              <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              RISE REALTY
            </div>
            <div className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-2 text-slate-900 dark:text-white font-black text-base tracking-wider shadow-xs hover:border-slate-300 dark:hover:border-slate-600 transition-all">
              <UtensilsCrossed className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              FOODNEST
            </div>
            <div className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-2 text-slate-900 dark:text-white font-semibold text-base italic shadow-xs hover:border-slate-300 dark:hover:border-slate-600 transition-all">
              SereneStay
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE FEATURES PILLS WITH MOTION HOVER */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
              Enterprise Voice Infrastructure Out-of-the-Box
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
              Zero coding needed. Connect your telephony and let intelligent agents handle phone traffic with sub-second responsiveness.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {[
              {
                icon: Phone,
                title: 'AI Receptionist',
                desc: 'Never let another patient or client reach voicemail',
                bg: 'bg-sky-50 dark:bg-sky-950/60',
                color: 'text-sky-600 dark:text-sky-400',
                badge: 'Zero Drop Rate',
              },
              {
                icon: UserCheck,
                title: 'Lead Qualification',
                desc: 'Instantly score caller intent & gather budget requirements',
                bg: 'bg-emerald-50 dark:bg-emerald-950/60',
                color: 'text-emerald-600 dark:text-emerald-400',
                badge: 'Real-Time CRM Push',
              },
              {
                icon: Calendar,
                title: 'Appointment Booking',
                desc: 'Direct 2-way sync with Google Calendar, Outlook, and EMRs',
                bg: 'bg-sky-50 dark:bg-sky-950/60',
                color: 'text-sky-600 dark:text-sky-400',
                badge: 'Instant Confirmation',
              },
              {
                icon: Headphones,
                title: '24/7 Phone Support',
                desc: 'Answers midnight emergencies, quotes pricing, and logs calls',
                bg: 'bg-emerald-50 dark:bg-emerald-950/60',
                color: 'text-emerald-600 dark:text-emerald-400',
                badge: 'Always Available',
              },
              {
                icon: Globe2,
                title: 'Multilingual Voice',
                desc: 'Seamlessly speaks 50+ languages with regional accents',
                bg: 'bg-sky-50 dark:bg-sky-950/60',
                color: 'text-sky-600 dark:text-sky-400',
                badge: 'Auto Accent Detect',
              },
            ].map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={idx}
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all group flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-12 h-12 rounded-xl ${feat.bg} ${feat.color} flex items-center justify-center group-hover:scale-105 transition-transform`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {feat.badge}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-950 dark:text-white text-base mb-1.5">{feat.title}</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{feat.desc}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* LIVE AGENT EXAMPLES WITH AUDIO & CONVERSATION TESTER */}
      <LiveAgentExamples />

      {/* 4. BUILT FOR EVERY BUSINESS (Industries with motion hover cards) */}
      <section className="py-20 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300 shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Domain-Specific AI Personas</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight">
              Built for Every Business Workflow
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-300">
              From local medical clinics to multi-city real estate brokerages, Auris arrives pre-trained on your industry's exact terminology and scheduling rules.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Healthcare & Clinics',
                desc: 'Book patient consults, answer insurance FAQs, and triage urgent triage queries 24/7.',
                img: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&auto=format&fit=crop&q=80',
                badgeColor: 'text-emerald-600 dark:text-emerald-400',
                stat: '99.4% booking accuracy',
                icon: Activity,
              },
              {
                title: 'Fitness & Wellness',
                desc: 'Qualify inbound trial inquiries, manage membership questions, and register group classes.',
                img: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600&auto=format&fit=crop&q=80',
                badgeColor: 'text-sky-600 dark:text-sky-400',
                stat: '3x trial conversions',
                icon: Dumbbell,
              },
              {
                title: 'Real Estate Brokerages',
                desc: 'Screen buyer budgets, schedule property walk-throughs, and dispatch calendar invites.',
                img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80',
                badgeColor: 'text-emerald-600 dark:text-emerald-400',
                stat: '<30s speed-to-lead',
                icon: Building2,
              },
              {
                title: 'Hotels & Hospitality',
                desc: 'Confirm direct room reservations, handle late check-ins, and resolve concierge requests.',
                img: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&auto=format&fit=crop&q=80',
                badgeColor: 'text-sky-600 dark:text-sky-400',
                stat: 'Zero missed night calls',
                icon: BedDouble,
              },
              {
                title: 'Dining & Restaurants',
                desc: 'Take phone table reservations, accommodate dietary needs, and reduce front-house stress.',
                img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80',
                badgeColor: 'text-emerald-600 dark:text-emerald-400',
                stat: '100% call answered',
                icon: UtensilsCrossed,
              },
              {
                title: 'Education & Academies',
                desc: 'Answer admissions queries, enroll prospective students, and arrange guided campus visits.',
                img: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&auto=format&fit=crop&q=80',
                badgeColor: 'text-sky-600 dark:text-sky-400',
                stat: 'Automated campus tours',
                icon: GraduationCap,
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={i}
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="group rounded-2xl overflow-hidden border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="h-48 overflow-hidden relative">
                      <img
                        src={item.img}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 px-3 py-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm border border-slate-200/60 dark:border-slate-800">
                        <Icon className={`w-3.5 h-3.5 ${item.badgeColor}`} />
                        <span className="text-slate-950 dark:text-white font-extrabold">{item.title}</span>
                      </div>
                      <div className="absolute bottom-3 right-3 px-2 py-0.5 bg-slate-950/80 backdrop-blur-xs rounded text-[10px] font-mono text-emerald-400 font-bold">
                        {item.stat}
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-base font-extrabold text-slate-950 dark:text-white mb-1.5">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                  <div className="px-5 pb-5 pt-1">
                    <button
                      onClick={onGetStarted}
                      className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      Deploy this Persona
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. MORE THAN AUTOMATION (Metrics and Live Operations Console) */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 border border-slate-200/90 dark:border-slate-800 shadow-md">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Left Column Text & Metrics */}
              <div className="lg:col-span-6 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-xs font-bold text-sky-700 dark:text-sky-300 shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Carrier-Grade Reliability</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight leading-snug">
                  More Than Automation. <br />
                  <span className="text-sky-600 dark:text-sky-400">Autonomous Telephony for High Growth.</span>
                </h2>

                <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  Auris handles your entire phone intake stack — from instant greeting and speech recognition to live qualification and calendar appointment booking, with zero human staff fatigue.
                </p>

                {/* 4 Metric Callouts with motion */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 py-2">
                  {[
                    { val: '10X', label: 'More Conversions', color: 'text-slate-950 dark:text-white' },
                    { val: '24/7', label: 'Availability', color: 'text-emerald-600 dark:text-emerald-400' },
                    { val: '60%', label: 'Lower Staff Overheads', color: 'text-sky-600 dark:text-sky-400' },
                    { val: '98%', label: 'Patient Satisfaction', color: 'text-slate-950 dark:text-white' },
                  ].map((metric, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.03 }}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700"
                    >
                      <div className={`text-2xl sm:text-3xl font-extrabold ${metric.color}`}>
                        {metric.val}
                      </div>
                      <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1">
                        {metric.label}
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="pt-2">
                  <motion.button
                    id="section-start-free-btn"
                    onClick={onGetStarted}
                    whileHover={{ scale: 1.03, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-7 py-3.5 rounded-xl font-extrabold text-sm text-white bg-emerald-600 hover:bg-emerald-500 shadow-md transition-all cursor-pointer flex items-center gap-2"
                  >
                    Start Free Trial
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>

              {/* Right Live Operations Console Mockup */}
              <div className="lg:col-span-6">
                <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 text-white shadow-xl">
                  {/* Console Header */}
                  <div className="px-5 py-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-bold font-mono text-slate-200">Auris Telephony Hub • Live Session</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                        142ms LATENCY
                      </span>
                    </div>
                  </div>

                  {/* Console Body */}
                  <div className="p-5 space-y-4 font-mono text-xs">
                    {/* Active Caller Card */}
                    <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-sky-950 text-sky-400 border border-sky-800 flex items-center justify-center">
                          <Phone className="w-4 h-4 animate-bounce" />
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm">Rachel Chen (Patient ID: #8204)</div>
                          <div className="text-[11px] text-slate-400">Incoming line: +1 (555) 234-8901 • Route: Clinic Scheduling</div>
                        </div>
                      </div>
                      <span className="text-emerald-400 text-xs font-bold">01:42</span>
                    </div>

                    {/* Speech Transcript Feed */}
                    <div className="space-y-2">
                      <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80">
                        <div className="text-[10px] text-sky-400 font-bold uppercase tracking-wider mb-1">Human Caller</div>
                        <div className="text-slate-300 text-xs font-sans">"Hi, I was hoping to move my Tuesday appointment with Dr. Mehta to Thursday afternoon if anything is open?"</div>
                      </div>

                      <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-900/50">
                        <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3" /> Auris AI Voice Agent
                        </div>
                        <div className="text-slate-200 text-xs font-sans">"Certainly, Rachel! Dr. Mehta has a 2:30 PM slot open this Thursday, October 24th. Shall I lock that in and send a confirmation to your phone?"</div>
                      </div>
                    </div>

                    {/* Automated Actions Triggered */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="text-[11px] text-slate-300 truncate">Google Calendar Slot Synced</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="text-[11px] text-slate-300 truncate">EMR Record Auto-Updated</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3D GLOBAL TELEPHONY CARRIER MESH */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950 border-y border-slate-200/80 dark:border-slate-800 transition-colors relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-xs font-bold text-sky-700 dark:text-sky-300 shadow-xs">
              <Globe2 className="w-3.5 h-3.5" />
              <span>Worldwide Low-Latency Carrier Mesh</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 dark:text-white tracking-tight">
              Global 3D Telephony Network
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
              Experience our low-latency voice transport network rendered in interactive 3D.
              Rotate the globe 360°, inspect Tier-1 carrier nodes across continents, and observe real-time audio routing arcs.
            </p>
          </div>

          <Interactive3DGlobe height={520} />
        </div>
      </section>

      {/* 3D FLOW CHART ARCHITECTURE */}
      <ArchitectureFlow3D />

      {/* 6. HOW IT WORKS */}
      <section className="py-20 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300 shadow-xs">
              <Zap className="w-3.5 h-3.5" />
              <span>Fast 4-Step Onboarding</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight">
              Simple Setup. Enterprise Performance.
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-300">
              Deploy your first enterprise AI voice agent in four intuitive steps with zero coding required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                num: '01',
                title: 'Select Voice Persona',
                desc: 'Pick an industry-optimized template, customize accent and conversational cadence, and set up clinic or firm policies.',
                badge: 'Template & Tone',
                color: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-800',
              },
              {
                num: '02',
                title: 'Upload Knowledge Base',
                desc: 'Sync your website URLs, upload PDF guidelines, or paste FAQs so your agent knows your exact services and schedules.',
                badge: 'Document RAG',
                color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800',
              },
              {
                num: '03',
                title: 'Connect Phone Line',
                desc: 'Instantly provision a dedicated local or toll-free number, or forward existing business lines via standard SIP trunking.',
                badge: 'SIP & WebRTC',
                color: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-800',
              },
              {
                num: '04',
                title: 'Go Live 24/7',
                desc: 'Auris answers customer calls 24/7, books appointments in your Google Calendar, and pushes CRM transcripts automatically.',
                badge: 'Autonomous',
                color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800',
              },
            ].map((step, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/90 dark:border-slate-700/80 space-y-4 relative shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-2xl font-black text-slate-900 dark:text-white">
                      {step.num}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${step.color}`}>
                      {step.badge}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-slate-950 dark:text-white text-base">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. TESTIMONIALS */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-xs font-bold text-amber-700 dark:text-amber-300 shadow-xs">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              <span>Verified Customer Outcomes</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight">
              Loved by Business Leaders
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-300">
              Hear how clinics, fitness centers, and real estate brokerages use Auris to eliminate missed calls.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote:
                  'Auris handles all our patient calls and books appointments flawlessly. It feels like having a dedicated front desk receptionist around the clock with zero hold times.',
                author: 'Dr. Rohan Mehta',
                role: 'Medical Director, Apollo Clinics',
                rating: 5,
                metric: '480+ Monthly Appts Booked',
                img: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=120&auto=format&fit=crop&q=80',
              },
              {
                quote:
                  "We've seen a 3x increase in trial bookings since using Auris. The conversational voice sounds so warm and natural that callers don't even realize it's AI!",
                author: 'Sneha Iyer',
                role: 'Operations Lead, FitZone Gyms',
                rating: 5,
                metric: '3.2x Lead Conversion',
                img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
              },
              {
                quote:
                  'Simple to set up, rock solid, and our real estate property viewings are booked directly into Google Calendar without manual coordination ping-pong.',
                author: 'Arjun Rao',
                role: 'Principal Broker, Rise Realty',
                rating: 5,
                metric: '<30s Speed-to-Lead',
                img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
              },
            ].map((test, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {[...Array(test.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                      {test.metric}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-normal">
                    "{test.quote}"
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <img
                    src={test.img}
                    alt={test.author}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800"
                  />
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-950 dark:text-white">
                      {test.author}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{test.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. READY TO GIVE YOUR BUSINESS A VOICE CTA BANNER */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto my-12">
        <motion.div
          whileHover={{ scale: 1.005 }}
          transition={{ duration: 0.2 }}
          className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950 p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 border border-slate-800"
        >
          {/* Subtle grid pattern overlay */}
          <div className="absolute inset-0 opacity-15 pointer-events-none mix-blend-overlay bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />

          <div className="space-y-2.5 text-center md:text-left relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ready for Instant Deployment</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              Ready to Give Your Business a Voice?
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              Join hundreds of clinics, agencies, and businesses eliminating missed calls with Auris Voice Agents.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 relative z-10 shrink-0">
            <motion.button
              id="cta-banner-get-started-btn"
              onClick={onGetStarted}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="px-6 py-3.5 rounded-xl font-extrabold text-sm text-slate-950 bg-white hover:bg-slate-100 shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </motion.button>
            <motion.button
              id="cta-banner-talk-btn"
              onClick={onWatchDemo}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="px-6 py-3.5 rounded-xl font-extrabold text-sm text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-all cursor-pointer flex items-center gap-2"
            >
              <Headphones className="w-4 h-4 text-sky-400" />
              Talk to Our Team
            </motion.button>
          </div>
        </motion.div>
      </section>
    </div>
  );
};
