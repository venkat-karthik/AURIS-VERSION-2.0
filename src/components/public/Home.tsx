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
  Zap,
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
      <section className="relative pt-12 pb-20 md:pt-16 md:pb-28 bg-gradient-to-b from-[#EEF8FC] via-[#F5FAFC] to-white dark:from-[#0B172E] dark:via-[#0A1120] dark:to-[#0A1120] transition-colors">
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
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EEF8FC] dark:bg-[#162742] border border-[#55B9E8]/30 dark:border-[#2D486B] shadow-xs">
                <Sparkles className="w-4 h-4 text-[#2189C8] dark:text-[#55B9E8]" />
                <span className="text-xs font-bold text-[#2189C8] dark:text-[#55B9E8] tracking-wide">
                  AI Voice Agents for Real Businesses
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#123047] dark:text-white leading-[1.12] tracking-tight">
                Let Conversations <br />
                <span className="text-[#38A85B] dark:text-[#4ADE80] inline-block font-extrabold">
                  Grow Your Business.
                </span>
              </h1>

              {/* Supporting Subtitle */}
              <p className="text-base sm:text-lg text-[#52636D] dark:text-[#94A3B8] max-w-xl leading-relaxed font-normal">
                Auris helps businesses automate calls, book appointments, qualify leads, and provide 24/7 support with natural, human-like AI voice agents.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <motion.button
                  id="hero-get-started-cta"
                  onClick={onGetStarted}
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-7 py-3.5 rounded-xl font-bold text-base text-white bg-gradient-to-r from-[#38A85B] to-[#2f8f4d] hover:from-[#329852] hover:to-[#287d43] shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2 group"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </motion.button>

                <motion.button
                  id="hero-watch-demo-cta"
                  onClick={onWatchDemo}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3.5 rounded-xl font-semibold text-base text-[#123047] dark:text-white bg-white dark:bg-[#111C38] hover:bg-[#F5FAFC] dark:hover:bg-[#162444] border border-[#DDEBEF] dark:border-[#1E2E4A] shadow-xs hover:shadow-sm transition-all cursor-pointer flex items-center gap-2.5"
                >
                  <div className="w-6 h-6 rounded-full bg-[#EEF8FC] dark:bg-[#162742] text-[#2189C8] dark:text-[#55B9E8] flex items-center justify-center">
                    <Play className="w-3 h-3 fill-current ml-0.5" />
                  </div>
                  Watch Demo
                </motion.button>
              </div>

              {/* Trust Micro-Indicators */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-6 pt-4 text-xs font-semibold text-[#52636D] dark:text-[#94A3B8]">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#38A85B]" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#38A85B]" />
                  <span>Setup in minutes</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#38A85B]" />
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
              <div className="w-full max-w-[460px] mb-3 p-1 rounded-2xl bg-white/90 dark:bg-[#111D38]/90 backdrop-blur-md border-2 border-[#000000] dark:border-[#233554] shadow-sm flex items-center justify-between text-xs font-black">
                <button
                  onClick={() => setHero3DTab('ai-agent')}
                  className={`flex-1 py-2 px-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    hero3DTab === 'ai-agent'
                      ? 'bg-[#38A85B] text-white shadow-xs'
                      : 'text-[#123047] dark:text-[#CBD5E1] hover:text-[#38A85B]'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>3D AI Agent</span>
                </button>
                <button
                  onClick={() => setHero3DTab('device-pod')}
                  className={`flex-1 py-2 px-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    hero3DTab === 'device-pod'
                      ? 'bg-[#2189C8] text-white shadow-xs'
                      : 'text-[#123047] dark:text-[#CBD5E1] hover:text-[#2189C8]'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>3D Phone Unit</span>
                </button>
                <button
                  onClick={() => setHero3DTab('studio-mic')}
                  className={`flex-1 py-2 px-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    hero3DTab === 'studio-mic'
                      ? 'bg-[#000000] text-white dark:bg-white dark:text-[#000000] shadow-xs'
                      : 'text-[#123047] dark:text-[#CBD5E1] hover:text-black dark:hover:text-white'
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
      <section className="py-12 bg-white dark:bg-[#0B132B] border-y border-[#DDEBEF] dark:border-[#1E2E4A] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-[#82919A] dark:text-[#64748B] mb-8">
            Trusted by modern businesses worldwide
          </p>

          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-80 grayscale hover:grayscale-0 transition-all duration-300">
            <div className="flex items-center gap-2 text-[#123047] dark:text-white font-bold text-lg">
              <span className="text-[#38A85B] font-black text-xl">Apollo</span>Clinics
            </div>
            <div className="flex items-center gap-1.5 text-[#123047] dark:text-white font-black tracking-widest text-lg">
              <Dumbbell className="w-5 h-5 text-[#2189C8]" />
              FITZONE
            </div>
            <div className="flex items-center gap-2 text-[#123047] dark:text-white font-serif text-lg tracking-wide lowercase">
              <span className="w-3 h-3 rounded-full bg-[#65C978]" />
              the herb room
            </div>
            <div className="flex items-center gap-1.5 text-[#123047] dark:text-white font-extrabold text-lg uppercase tracking-tight">
              <Building2 className="w-5 h-5 text-[#38A85B]" />
              RISE REALTY
            </div>
            <div className="flex items-center gap-1.5 text-[#123047] dark:text-white font-black text-lg tracking-wider">
              <UtensilsCrossed className="w-4 h-4 text-[#2189C8]" />
              FOODNEST
            </div>
            <div className="flex items-center gap-2 text-[#123047] dark:text-white font-medium text-lg italic">
              SereneStay
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE FEATURES PILLS WITH MOTION HOVER */}
      <section className="py-16 bg-[#F5FAFC] dark:bg-[#0A1120] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              {
                icon: Phone,
                title: 'AI Receptionist',
                desc: 'Never miss a call',
                bg: 'bg-[#EEF8FC] dark:bg-[#162742]',
                color: 'text-[#2189C8]',
              },
              {
                icon: UserCheck,
                title: 'Lead Qualification',
                desc: 'Find real opportunities',
                bg: 'bg-[#EFFAF1] dark:bg-[#0F2D1F]',
                color: 'text-[#38A85B]',
              },
              {
                icon: Calendar,
                title: 'Appointment Booking',
                desc: 'Syncs with your calendar',
                bg: 'bg-[#EEF8FC] dark:bg-[#162742]',
                color: 'text-[#2189C8]',
              },
              {
                icon: Headphones,
                title: '24/7 Support',
                desc: 'Always available',
                bg: 'bg-[#EFFAF1] dark:bg-[#0F2D1F]',
                color: 'text-[#38A85B]',
              },
              {
                icon: Globe2,
                title: 'Multilingual',
                desc: 'Talks in 50+ languages',
                bg: 'bg-[#EEF8FC] dark:bg-[#162742]',
                color: 'text-[#2189C8]',
                extraCol: 'col-span-2 md:col-span-1',
              },
            ].map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={idx}
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  className={`${feat.extraCol || ''} bg-white dark:bg-[#111C38] rounded-2xl p-5 border border-[#DDEBEF] dark:border-[#1E2E4A] shadow-xs text-center space-y-2 hover:border-[#55B9E8] dark:hover:border-[#3B82F6] transition-all group`}
                >
                  <div
                    className={`w-12 h-12 mx-auto rounded-full ${feat.bg} ${feat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-[#123047] dark:text-white text-sm">{feat.title}</h3>
                  <p className="text-xs text-[#52636D] dark:text-[#94A3B8]">{feat.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* LIVE AGENT EXAMPLES WITH AUDIO & CONVERSATION TESTER */}
      <LiveAgentExamples />

      {/* 4. BUILT FOR EVERY BUSINESS (Industries with motion hover cards) */}
      <section className="py-20 bg-white dark:bg-[#0B132B] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#123047] dark:text-white tracking-tight">
              Built for Every Business
            </h2>
            <p className="text-base text-[#52636D] dark:text-[#94A3B8]">
              From local practices to multi-location enterprises, Auris adapts to your domain knowledge.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Healthcare',
                desc: 'Book appointments, answer patient queries, and triage symptoms 24/7.',
                img: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&auto=format&fit=crop&q=80',
                badgeColor: 'text-[#38A85B]',
                icon: Activity,
              },
              {
                title: 'Fitness & Wellness',
                desc: 'Convert leads, manage membership trials, and book group classes.',
                img: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600&auto=format&fit=crop&q=80',
                badgeColor: 'text-[#2189C8]',
                icon: Dumbbell,
              },
              {
                title: 'Real Estate',
                desc: 'Qualify home buyers, schedule property viewings, and send follow-ups.',
                img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80',
                badgeColor: 'text-[#38A85B]',
                icon: Building2,
              },
              {
                title: 'Hospitality',
                desc: 'Handle direct room bookings, guest questions, and check-in assistance.',
                img: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&auto=format&fit=crop&q=80',
                badgeColor: 'text-[#2189C8]',
                icon: BedDouble,
              },
              {
                title: 'Restaurants',
                desc: 'Take phone orders, reserve dining tables, and answer menu dietary FAQs.',
                img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80',
                badgeColor: 'text-[#38A85B]',
                icon: UtensilsCrossed,
              },
              {
                title: 'Education',
                desc: 'Answer admissions FAQs, enroll prospective students, and manage campus visits.',
                img: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&auto=format&fit=crop&q=80',
                badgeColor: 'text-[#2189C8]',
                icon: GraduationCap,
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={i}
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="group rounded-2xl overflow-hidden border border-[#DDEBEF] dark:border-[#1E2E4A] bg-white dark:bg-[#111C38] shadow-xs hover:shadow-xl transition-all"
                >
                  <div className="h-48 overflow-hidden relative">
                    <img
                      src={item.img}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 dark:bg-[#0B132B]/90 backdrop-blur-sm rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs">
                      <Icon className={`w-3.5 h-3.5 ${item.badgeColor}`} />
                      <span className="text-[#123047] dark:text-white">{item.title}</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-[#123047] dark:text-white mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-[#52636D] dark:text-[#94A3B8]">{item.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. MORE THAN AUTOMATION (Metrics and overlay block) */}
      <section className="py-20 bg-gradient-to-b from-white via-[#EEF8FC]/50 to-[#F5FAFC] dark:from-[#0B132B] dark:via-[#0E1B33] dark:to-[#0A1120] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-[#111C38] rounded-3xl p-8 sm:p-12 border border-[#DDEBEF] dark:border-[#1E2E4A] shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Left Column Text & Metrics */}
              <div className="lg:col-span-7 space-y-6">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#123047] dark:text-white tracking-tight leading-snug">
                  More Than Automation. <br />
                  <span className="text-[#2189C8] dark:text-[#55B9E8]">A Smarter Way to Communicate.</span>
                </h2>

                <p className="text-base text-[#52636D] dark:text-[#94A3B8] leading-relaxed">
                  Auris isn't just about AI — it's about giving your team time to focus on what matters while voice agents handle front-line phone inquiries.
                </p>

                {/* 4 Metric Callouts with motion */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4">
                  {[
                    { val: '10X', label: 'More Conversions', color: 'text-[#123047] dark:text-white' },
                    { val: '24/7', label: 'Availability', color: 'text-[#38A85B]' },
                    { val: '60%', label: 'Lower Costs', color: 'text-[#2189C8] dark:text-[#55B9E8]' },
                    { val: '98%', label: 'Patient Satisfaction', color: 'text-[#123047] dark:text-white' },
                  ].map((metric, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.03 }}
                      className="p-4 rounded-xl bg-[#F5FAFC] dark:bg-[#16223F] border border-[#DDEBEF] dark:border-[#1E2E4A]"
                    >
                      <div className={`text-2xl sm:text-3xl font-extrabold ${metric.color}`}>
                        {metric.val}
                      </div>
                      <div className="text-xs font-semibold text-[#52636D] dark:text-[#94A3B8] mt-1">
                        {metric.label}
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div>
                  <motion.button
                    id="section-start-free-btn"
                    onClick={onGetStarted}
                    whileHover={{ scale: 1.03, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-7 py-3 rounded-xl font-bold text-sm text-white bg-[#38A85B] hover:bg-[#2f8f4d] shadow-sm transition-all cursor-pointer"
                  >
                    Start for Free
                  </motion.button>
                </div>
              </div>

              {/* Right Nature Photography Frame with Overlay Pill */}
              <div className="lg:col-span-5 relative">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-md border border-[#DDEBEF] dark:border-[#1E2E4A]">
                  <img
                    src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80"
                    alt="Man relaxing peacefully outdoors surrounded by clear sky"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#123047]/60 via-transparent to-transparent" />

                  {/* Overlay Badge */}
                  <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-white/90 dark:bg-[#0B132B]/90 backdrop-blur-md border border-white/80 dark:border-[#1E2E4A] text-center shadow-lg">
                    <p className="text-sm font-bold text-[#123047] dark:text-white">
                      Less Missed Calls. More Possibilities.
                    </p>
                    <p className="text-xs text-[#52636D] dark:text-[#94A3B8]">
                      Let Auris handle incoming phone queues while your staff delivers care.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3D GLOBAL TELEPHONY CARRIER MESH */}
      <section className="py-20 bg-gradient-to-b from-[#F5FAFC] via-white to-[#F5FAFC] dark:from-[#080E1C] dark:via-[#0B1426] dark:to-[#070D18] border-y border-[#DDEBEF] dark:border-[#1E2E4A] transition-colors relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#2189C8]/10 dark:bg-[#2189C8]/20 border border-[#2189C8]/30 text-xs font-black text-[#2189C8] dark:text-[#55B9E8] shadow-xs">
              <Globe2 className="w-3.5 h-3.5" />
              <span>Worldwide Carrier Infrastructure</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#000000] dark:text-white tracking-tight">
              Global 3D Telephony Mesh
            </h2>
            <p className="text-base sm:text-lg text-[#27272a] dark:text-[#94A3B8] font-medium leading-relaxed">
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
      <section className="py-20 bg-white dark:bg-[#0B132B] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#123047] dark:text-white tracking-tight">
              Simple Outside. Powerful Inside.
            </h2>
            <p className="text-base text-[#52636D] dark:text-[#94A3B8]">
              Deploy your first enterprise AI voice agent in four intuitive steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                num: '1',
                title: 'Create Your Agent',
                desc: 'Choose an industry template, select natural voice characteristics, and define your persona.',
                numColor: 'bg-[#EEF8FC] dark:bg-[#162742] text-[#2189C8] dark:text-[#55B9E8]',
              },
              {
                num: '2',
                title: 'Add Your Knowledge',
                desc: 'Upload PDFs, sync website URLs, or write FAQs so your agent knows your exact services and policies.',
                numColor: 'bg-[#EFFAF1] dark:bg-[#0F2D1F] text-[#38A85B]',
              },
              {
                num: '3',
                title: 'Connect Phone Number',
                desc: 'Assign a dedicated local or toll-free number, or forward existing lines via SIP trunking in seconds.',
                numColor: 'bg-[#EEF8FC] dark:bg-[#162742] text-[#2189C8] dark:text-[#55B9E8]',
              },
              {
                num: '4',
                title: 'Let Auris Converse',
                desc: 'Auris answers customer calls 24/7, books appointments in your calendar, and pushes transcripts to your CRM.',
                numColor: 'bg-[#EFFAF1] dark:bg-[#0F2D1F] text-[#38A85B]',
              },
            ].map((step, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="p-6 rounded-2xl bg-[#F5FAFC] dark:bg-[#111C38] border border-[#DDEBEF] dark:border-[#1E2E4A] space-y-3 relative shadow-xs"
              >
                <span
                  className={`w-8 h-8 rounded-full ${step.numColor} font-black text-sm flex items-center justify-center`}
                >
                  {step.num}
                </span>
                <h3 className="font-bold text-[#123047] dark:text-white text-base">{step.title}</h3>
                <p className="text-xs text-[#52636D] dark:text-[#94A3B8] leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. TESTIMONIALS */}
      <section className="py-20 bg-[#F5FAFC] dark:bg-[#0A1120] border-t border-[#DDEBEF] dark:border-[#1E2E4A] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#123047] dark:text-white tracking-tight">
              Loved by Business Owners
            </h2>
            <p className="text-base text-[#52636D] dark:text-[#94A3B8]">
              Real results. Real conversations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote:
                  'Auris handles all our patient calls and books appointments flawlessly. It feels like having a dedicated front desk receptionist around the clock.',
                author: 'Dr. Rohan Mehta',
                role: 'Apollo Clinics',
                img: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=120&auto=format&fit=crop&q=80',
              },
              {
                quote:
                  "We've seen a 3x increase in trial bookings since using Auris. The conversational AI sounds so natural that members don't even realize it's AI!",
                author: 'Sneha Iyer',
                role: 'FitZone Gyms',
                img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
              },
              {
                quote:
                  'Simple to set up, super reliable, and our real estate viewings are booked directly into Google Calendar without manual back-and-forth.',
                author: 'Arjun Rao',
                role: 'Rise Realty',
                img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
              },
            ].map((test, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
                className="bg-white dark:bg-[#111C38] rounded-2xl p-6 border border-[#DDEBEF] dark:border-[#1E2E4A] shadow-xs flex flex-col justify-between space-y-6"
              >
                <p className="text-sm text-[#123047] dark:text-[#E2E8F0] italic leading-relaxed">
                  "{test.quote}"
                </p>
                <div className="flex items-center gap-3 pt-3 border-t border-[#DDEBEF] dark:border-[#1E2E4A]">
                  <img
                    src={test.img}
                    alt={test.author}
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-[#DDEBEF] dark:ring-[#1E2E4A]"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-[#123047] dark:text-white">
                      {test.author}
                    </h4>
                    <p className="text-[11px] text-[#52636D] dark:text-[#94A3B8]">{test.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* INTERACTIVE 3D AI VOICE AGENTS & BROADCAST STUDIO */}
      <section className="py-20 bg-gradient-to-b from-[#F5FAFC] via-white to-[#F5FAFC] dark:from-[#080E1C] dark:via-[#0D182B] dark:to-[#070D18] border-y border-[#DDEBEF] dark:border-[#1E2E4A] transition-colors relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#38A85B]/10 dark:bg-[#38A85B]/20 border border-[#38A85B]/30 text-xs font-black text-[#38A85B] dark:text-[#4ADE80] shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Real-Time Conversational AI Voice Agents</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#000000] dark:text-white tracking-tight">
              Test 3D Voice Agents Live Before Deployment
            </h2>
            <p className="text-base sm:text-lg text-[#27272a] dark:text-[#94A3B8] font-medium leading-relaxed">
              Interact directly with our 3D agent avatars and studio telemetry. Switch between clinical healthcare receptionists, enterprise lead qualifiers, and emergency dispatchers to observe real-time speech cadence, audio frequency synthesis, and carrier-grade response times.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <div className="lg:col-span-7">
              <Interactive3DAgentAvatar height={440} className="h-full" />
            </div>
            <div className="lg:col-span-5 flex flex-col justify-between gap-6">
              <Interactive3DStudioMic size={290} />

              <div className="bg-white dark:bg-[#111C38] rounded-3xl p-6 border-2 border-[#000000] dark:border-[#1E2E4A] shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-[#2189C8] dark:text-[#55B9E8]">
                    Carrier Telephony Specs
                  </span>
                  <span className="text-[10px] font-bold bg-[#38A85B]/15 text-[#38A85B] px-2 py-0.5 rounded-full border border-[#38A85B]/30">
                    LOW LATENCY
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-[#F5FAFC] dark:bg-[#0D162B] border border-[#DDEBEF] dark:border-[#1E2E4A]">
                    <div className="text-[11px] text-[#64748B]">Mean Turnaround</div>
                    <div className="text-sm font-black text-[#000000] dark:text-white">138ms</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#F5FAFC] dark:bg-[#0D162B] border border-[#DDEBEF] dark:border-[#1E2E4A]">
                    <div className="text-[11px] text-[#64748B]">Interruption Latency</div>
                    <div className="text-sm font-black text-[#38A85B]">&lt; 80ms</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#F5FAFC] dark:bg-[#0D162B] border border-[#DDEBEF] dark:border-[#1E2E4A]">
                    <div className="text-[11px] text-[#64748B]">Audio Transports</div>
                    <div className="text-sm font-black text-[#000000] dark:text-white">SIP / WebRTC</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#F5FAFC] dark:bg-[#0D162B] border border-[#DDEBEF] dark:border-[#1E2E4A]">
                    <div className="text-[11px] text-[#64748B]">Speech Audio Codec</div>
                    <div className="text-sm font-black text-[#000000] dark:text-white">Opus HD 48kHz</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. READY TO GIVE YOUR BUSINESS A VOICE CTA BANNER */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto my-12">
        <motion.div
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
          className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-r from-[#2189C8] via-[#55B9E8] to-[#38A85B] p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8"
        >
          {/* Nature Foliage Pattern Overlay */}
          <div className="absolute inset-0 opacity-15 pointer-events-none mix-blend-overlay bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

          <div className="space-y-2 text-center md:text-left relative z-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to Give Your Business a Voice?
            </h2>
            <p className="text-sm sm:text-base text-white/90">
              Join hundreds of businesses already growing with Auris Voice Agents.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 relative z-10">
            <motion.button
              id="cta-banner-get-started-btn"
              onClick={onGetStarted}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="px-6 py-3 rounded-xl font-bold text-sm text-[#123047] bg-white hover:bg-[#F5FAFC] shadow-sm transition-all cursor-pointer"
            >
              Get Started
            </motion.button>
            <motion.button
              id="cta-banner-talk-btn"
              onClick={onWatchDemo}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="px-6 py-3 rounded-xl font-bold text-sm text-white bg-black/20 hover:bg-black/30 border border-white/40 transition-all cursor-pointer flex items-center gap-2"
            >
              <Headphones className="w-4 h-4" />
              Talk to Us
            </motion.button>
          </div>
        </motion.div>
      </section>
    </div>
  );
};
