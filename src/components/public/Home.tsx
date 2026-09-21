import React, { useState } from 'react';
import {
  Phone,
  Play,
  Pause,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Globe2,
  Headphones,
  UserCheck,
  Activity,
  HeartHandshake,
  Dumbbell,
  Building2,
  BedDouble,
  UtensilsCrossed,
  GraduationCap,
  Volume2,
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
  onOpenDashboard,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeSpeechSample, setActiveSpeechSample] = useState(
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
          (v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Female') || v.name.includes('Google') || v.name.includes('Samantha'))
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
    <div className="overflow-hidden bg-[#F5FAFC]">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-20 md:pt-16 md:pb-28 bg-gradient-to-b from-[#EEF8FC] via-[#F5FAFC] to-white">
        {/* Subtle Nature Atmospheric Blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[550px] pointer-events-none overflow-hidden opacity-40">
          <div className="absolute -top-24 left-1/4 w-96 h-96 bg-[#55B9E8]/20 rounded-full blur-3xl" />
          <div className="absolute top-20 right-1/4 w-96 h-96 bg-[#65C978]/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EEF8FC] border border-[#55B9E8]/30 shadow-xs">
                <Sparkles className="w-4 h-4 text-[#2189C8]" />
                <span className="text-xs font-bold text-[#2189C8] tracking-wide">
                  AI Voice Agents for Real Businesses
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#123047] leading-[1.12] tracking-tight">
                Let Conversations <br />
                <span className="text-[#38A85B] inline-block font-extrabold">
                  Grow Your Business.
                </span>
              </h1>

              {/* Supporting Subtitle */}
              <p className="text-base sm:text-lg text-[#52636D] max-w-xl leading-relaxed font-normal">
                Auris helps businesses automate calls, book appointments, qualify leads and provide 24/7 support with natural, human-like AI voice agents.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  id="hero-get-started-cta"
                  onClick={onGetStarted}
                  className="px-7 py-3.5 rounded-xl font-bold text-base text-white bg-[#38A85B] hover:bg-[#2f8f4d] shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-2 group"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  id="hero-watch-demo-cta"
                  onClick={onWatchDemo}
                  className="px-6 py-3.5 rounded-xl font-semibold text-base text-[#123047] bg-white hover:bg-[#F5FAFC] border border-[#DDEBEF] shadow-xs hover:shadow-sm transition-all cursor-pointer flex items-center gap-2.5"
                >
                  <div className="w-6 h-6 rounded-full bg-[#EEF8FC] text-[#2189C8] flex items-center justify-center">
                    <Play className="w-3 h-3 fill-current ml-0.5" />
                  </div>
                  Watch Demo
                </button>
              </div>

              {/* Trust Micro-Indicators */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-6 pt-4 text-xs font-semibold text-[#52636D]">
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
            </div>

            {/* Right Visual Composition - Nature & Floating Call Card */}
            <div className="lg:col-span-5 relative flex justify-center">
              {/* Nature Backdrop Artistry */}
              <div className="relative w-full max-w-[420px] aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border border-white/60 bg-gradient-to-b from-[#55B9E8]/30 to-[#38A85B]/20 flex flex-col justify-between p-6">
                {/* Background Scenic Nature Image */}
                <img
                  src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80"
                  alt="Nature landscape with clear skies and lake"
                  className="absolute inset-0 w-full h-full object-cover object-center mix-blend-overlay opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#123047]/60 via-transparent to-transparent pointer-events-none" />

                {/* Floating Leaves & Script Accent */}
                <div className="relative z-10 flex justify-between items-start">
                  <div className="bg-white/85 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-semibold text-[#123047] border border-white shadow-xs">
                    Live Telephony
                  </div>
                  <span className="text-white/90 text-xs font-serif italic text-right leading-tight drop-shadow">
                    Conversations for a<br />Better Tomorrow.
                  </span>
                </div>

                {/* Main Floating Auris Calling Card (Matching Mockup) */}
                <div className="relative z-20 bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white text-center space-y-4 transform hover:-translate-y-1 transition-all duration-300">
                  {/* Phone Icon in Deep Sky Blue Circle */}
                  <div className="mx-auto w-14 h-14 rounded-full bg-[#2189C8] text-white flex items-center justify-center shadow-md">
                    <Phone className="w-6 h-6 animate-pulse" />
                  </div>

                  {/* Calling Status */}
                  <div>
                    <h3 className="font-bold text-lg text-[#123047]">Auris AI</h3>
                    <p className="text-xs font-medium text-[#2189C8] flex items-center justify-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#38A85B] animate-ping" />
                      Calling...
                    </p>
                  </div>

                  {/* Pulsing Audio Waveform Bars */}
                  <div className="flex items-center justify-center gap-1.5 h-9 py-1">
                    {[16, 28, 20, 36, 24, 32, 18, 30, 22].map((height, i) => (
                      <span
                        key={i}
                        className={`w-1 rounded-full ${
                          isPlayingAudio ? 'animate-wave bg-[#38A85B]' : 'bg-[#55B9E8]'
                        }`}
                        style={{
                          height: `${isPlayingAudio ? Math.max(12, (height * 1.1) % 36) : height}px`,
                          animationDelay: `${i * 0.1}s`,
                        }}
                      />
                    ))}
                  </div>

                  {/* AI Receptionist Status Line */}
                  <p className="text-xs italic text-[#52636D] font-medium border-t border-[#DDEBEF] pt-3">
                    "Your AI receptionist is speaking..."
                  </p>

                  {/* Interactive Voice Sample Trigger */}
                  <button
                    id="hero-play-sample-btn"
                    onClick={handlePlayVoiceSample}
                    className="w-full py-2 px-3 text-xs font-bold rounded-lg bg-[#EFFAF1] text-[#38A85B] hover:bg-[#d8f5dd] border border-[#65C978]/30 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    {isPlayingAudio ? (
                      <>
                        <Pause className="w-3.5 h-3.5" /> Stop Sample Audio
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5" /> Listen to Voice Sample
                      </>
                    )}
                  </button>
                </div>

                {/* Micro Footer on Card */}
                <div className="relative z-10 flex items-center justify-between text-[11px] text-white/90">
                  <span>99.98% Telephony Uptime</span>
                  <span className="font-semibold">Sub-350ms Latency</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUSTED BY SECTION (Placeholders as specified) */}
      <section className="py-12 bg-white border-y border-[#DDEBEF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-[#82919A] mb-8">
            Trusted by modern businesses
          </p>

          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-80 grayscale hover:grayscale-0 transition-all duration-300">
            {/* Apollo Clinics */}
            <div className="flex items-center gap-2 text-[#123047] font-bold text-lg">
              <span className="text-[#38A85B] font-black text-xl">Apollo</span>Clinics
            </div>

            {/* FITZONE */}
            <div className="flex items-center gap-1.5 text-[#123047] font-black tracking-widest text-lg">
              <Dumbbell className="w-5 h-5 text-[#2189C8]" />
              FITZONE
            </div>

            {/* the herb room */}
            <div className="flex items-center gap-2 text-[#123047] font-serif text-lg tracking-wide lowercase">
              <span className="w-3 h-3 rounded-full bg-[#65C978]" />
              the herb room
            </div>

            {/* RISE REALTY */}
            <div className="flex items-center gap-1.5 text-[#123047] font-extrabold text-lg uppercase tracking-tight">
              <Building2 className="w-5 h-5 text-[#38A85B]" />
              RISE REALTY
            </div>

            {/* FOODNEST */}
            <div className="flex items-center gap-1.5 text-[#123047] font-black text-lg tracking-wider">
              <UtensilsCrossed className="w-4 h-4 text-[#2189C8]" />
              FOODNEST
            </div>

            {/* SereneStay */}
            <div className="flex items-center gap-2 text-[#123047] font-medium text-lg italic">
              SereneStay
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE FEATURES PILLS */}
      <section className="py-16 bg-[#F5FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {/* AI Receptionist */}
            <div className="bg-white rounded-2xl p-5 border border-[#DDEBEF] shadow-xs text-center space-y-2 hover:border-[#55B9E8] transition-all group">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#EEF8FC] text-[#2189C8] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Phone className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#123047] text-sm">AI Receptionist</h3>
              <p className="text-xs text-[#52636D]">Never miss a call</p>
            </div>

            {/* Lead Qualification */}
            <div className="bg-white rounded-2xl p-5 border border-[#DDEBEF] shadow-xs text-center space-y-2 hover:border-[#65C978] transition-all group">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#EFFAF1] text-[#38A85B] flex items-center justify-center group-hover:scale-110 transition-transform">
                <UserCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#123047] text-sm">Lead Qualification</h3>
              <p className="text-xs text-[#52636D]">Find real opportunities</p>
            </div>

            {/* Appointment Booking */}
            <div className="bg-white rounded-2xl p-5 border border-[#DDEBEF] shadow-xs text-center space-y-2 hover:border-[#55B9E8] transition-all group">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#EEF8FC] text-[#2189C8] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#123047] text-sm">Appointment Booking</h3>
              <p className="text-xs text-[#52636D]">Syncs with your calendar</p>
            </div>

            {/* 24/7 Customer Support */}
            <div className="bg-white rounded-2xl p-5 border border-[#DDEBEF] shadow-xs text-center space-y-2 hover:border-[#65C978] transition-all group">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#EFFAF1] text-[#38A85B] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Headphones className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#123047] text-sm">24/7 Customer Support</h3>
              <p className="text-xs text-[#52636D]">Always available</p>
            </div>

            {/* Multilingual */}
            <div className="col-span-2 md:col-span-1 bg-white rounded-2xl p-5 border border-[#DDEBEF] shadow-xs text-center space-y-2 hover:border-[#55B9E8] transition-all group">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#EEF8FC] text-[#2189C8] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Globe2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#123047] text-sm">Multilingual</h3>
              <p className="text-xs text-[#52636D]">Talks like a human</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. BUILT FOR EVERY BUSINESS (Industries with nature & business photography) */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#123047] tracking-tight">
              Built for Every Business
            </h2>
            <p className="text-base text-[#52636D]">
              From local businesses to growing enterprises, Auris adapts to your needs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Healthcare */}
            <div className="group rounded-2xl overflow-hidden border border-[#DDEBEF] bg-white shadow-xs hover:shadow-lg transition-all">
              <div className="h-48 overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&auto=format&fit=crop&q=80"
                  alt="Modern clean healthcare clinic interior"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-xs font-bold text-[#38A85B] flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  Healthcare
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-[#123047] mb-1">Healthcare</h3>
                <p className="text-sm text-[#52636D]">Book appointments, answer patient queries, and triage symptoms 24/7.</p>
              </div>
            </div>

            {/* Fitness & Wellness */}
            <div className="group rounded-2xl overflow-hidden border border-[#DDEBEF] bg-white shadow-xs hover:shadow-lg transition-all">
              <div className="h-48 overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600&auto=format&fit=crop&q=80"
                  alt="Fitness gym and wellness center"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-xs font-bold text-[#2189C8] flex items-center gap-1.5">
                  <Dumbbell className="w-3.5 h-3.5" />
                  Fitness & Wellness
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-[#123047] mb-1">Fitness & Wellness</h3>
                <p className="text-sm text-[#52636D]">Convert leads, manage membership trials, and book group classes.</p>
              </div>
            </div>

            {/* Real Estate */}
            <div className="group rounded-2xl overflow-hidden border border-[#DDEBEF] bg-white shadow-xs hover:shadow-lg transition-all">
              <div className="h-48 overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80"
                  alt="Modern architectural home exterior"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-xs font-bold text-[#38A85B] flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  Real Estate
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-[#123047] mb-1">Real Estate</h3>
                <p className="text-sm text-[#52636D]">Qualify home buyers, schedule property viewings, and send follow-ups.</p>
              </div>
            </div>

            {/* Hospitality */}
            <div className="group rounded-2xl overflow-hidden border border-[#DDEBEF] bg-white shadow-xs hover:shadow-lg transition-all">
              <div className="h-48 overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&auto=format&fit=crop&q=80"
                  alt="Cozy boutique hotel room"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-xs font-bold text-[#2189C8] flex items-center gap-1.5">
                  <BedDouble className="w-3.5 h-3.5" />
                  Hospitality
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-[#123047] mb-1">Hospitality</h3>
                <p className="text-sm text-[#52636D]">Handle direct room bookings, guest questions, and check-in assistance.</p>
              </div>
            </div>

            {/* Restaurants */}
            <div className="group rounded-2xl overflow-hidden border border-[#DDEBEF] bg-white shadow-xs hover:shadow-lg transition-all">
              <div className="h-48 overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80"
                  alt="Atmospheric warm restaurant dining room"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-xs font-bold text-[#38A85B] flex items-center gap-1.5">
                  <UtensilsCrossed className="w-3.5 h-3.5" />
                  Restaurants
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-[#123047] mb-1">Restaurants</h3>
                <p className="text-sm text-[#52636D]">Take phone orders, reserve dining tables, and answer menu dietary FAQs.</p>
              </div>
            </div>

            {/* Education */}
            <div className="group rounded-2xl overflow-hidden border border-[#DDEBEF] bg-white shadow-xs hover:shadow-lg transition-all">
              <div className="h-48 overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&auto=format&fit=crop&q=80"
                  alt="Modern classroom education campus"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-xs font-bold text-[#2189C8] flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5" />
                  Education
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-[#123047] mb-1">Education</h3>
                <p className="text-sm text-[#52636D]">Answer admissions FAQs, enroll prospective students, and manage campus visits.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. MORE THAN AUTOMATION (Section with metrics and nature photo overlay) */}
      <section className="py-20 bg-gradient-to-b from-white via-[#EEF8FC]/50 to-[#F5FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#DDEBEF] shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Left Column Text & Metrics */}
              <div className="lg:col-span-7 space-y-6">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#123047] tracking-tight leading-snug">
                  More Than Automation. <br />
                  <span className="text-[#2189C8]">A Smarter Way to Communicate.</span>
                </h2>

                <p className="text-base text-[#52636D] leading-relaxed">
                  Auris isn't just about AI — it's about giving you time to focus on what matters, while we handle the conversations.
                </p>

                {/* 4 Metric Callouts */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4">
                  <div className="p-4 rounded-xl bg-[#F5FAFC] border border-[#DDEBEF]">
                    <div className="text-2xl sm:text-3xl font-extrabold text-[#123047]">10X</div>
                    <div className="text-xs font-semibold text-[#52636D] mt-1">More Conversions</div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#F5FAFC] border border-[#DDEBEF]">
                    <div className="text-2xl sm:text-3xl font-extrabold text-[#38A85B]">24/7</div>
                    <div className="text-xs font-semibold text-[#52636D] mt-1">Availability</div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#F5FAFC] border border-[#DDEBEF]">
                    <div className="text-2xl sm:text-3xl font-extrabold text-[#2189C8]">60%</div>
                    <div className="text-xs font-semibold text-[#52636D] mt-1">Lower Costs</div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#F5FAFC] border border-[#DDEBEF]">
                    <div className="text-2xl sm:text-3xl font-extrabold text-[#123047]">98%</div>
                    <div className="text-xs font-semibold text-[#52636D] mt-1">Customer Satisfaction</div>
                  </div>
                </div>

                <div>
                  <button
                    id="section-start-free-btn"
                    onClick={onGetStarted}
                    className="px-7 py-3 rounded-xl font-bold text-sm text-white bg-[#38A85B] hover:bg-[#2f8f4d] shadow-sm transition-all cursor-pointer"
                  >
                    Start for Free
                  </button>
                </div>
              </div>

              {/* Right Nature Photography Frame with Overlay Pill */}
              <div className="lg:col-span-5 relative">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-md border border-[#DDEBEF]">
                  <img
                    src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80"
                    alt="Man relaxing peacefully outdoors surrounded by clear sky and natural scenery"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#123047]/60 via-transparent to-transparent" />
                  
                  {/* Overlay Badge */}
                  <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-white/90 backdrop-blur-md border border-white text-center">
                    <p className="text-sm font-bold text-[#123047]">Less Missed Calls. More Possibilities.</p>
                    <p className="text-xs text-[#52636D]">Let Auris handle phone queues while your team thrives.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. HOW IT WORKS */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#123047] tracking-tight">
              Simple Outside. Powerful Inside.
            </h2>
            <p className="text-base text-[#52636D]">
              Deploy your first enterprise AI voice agent in four intuitive steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-[#F5FAFC] border border-[#DDEBEF] space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-[#EEF8FC] text-[#2189C8] font-black text-sm flex items-center justify-center">
                1
              </span>
              <h3 className="font-bold text-[#123047] text-base">Create Your Agent</h3>
              <p className="text-xs text-[#52636D] leading-relaxed">
                Choose an industry template, select natural voice characteristics, and define your business persona.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F5FAFC] border border-[#DDEBEF] space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-[#EFFAF1] text-[#38A85B] font-black text-sm flex items-center justify-center">
                2
              </span>
              <h3 className="font-bold text-[#123047] text-base">Add Your Knowledge</h3>
              <p className="text-xs text-[#52636D] leading-relaxed">
                Upload PDFs, sync website URLs, or write clinic FAQs so your agent knows your exact services and policies.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F5FAFC] border border-[#DDEBEF] space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-[#EEF8FC] text-[#2189C8] font-black text-sm flex items-center justify-center">
                3
              </span>
              <h3 className="font-bold text-[#123047] text-base">Connect Phone Number</h3>
              <p className="text-xs text-[#52636D] leading-relaxed">
                Assign a dedicated local or toll-free number, or forward existing lines via SIP in seconds.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F5FAFC] border border-[#DDEBEF] space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-[#EFFAF1] text-[#38A85B] font-black text-sm flex items-center justify-center">
                4
              </span>
              <h3 className="font-bold text-[#123047] text-base">Let Auris Converse</h3>
              <p className="text-xs text-[#52636D] leading-relaxed">
                Auris answers customer calls 24/7, books appointments in your calendar, and pushes transcripts to your CRM.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. TESTIMONIALS (From mock businesses) */}
      <section className="py-20 bg-[#F5FAFC] border-t border-[#DDEBEF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#123047] tracking-tight">
              Loved by Business Owners
            </h2>
            <p className="text-base text-[#52636D]">
              Real results. Real conversations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Dr. Rohan Mehta */}
            <div className="bg-white rounded-2xl p-6 border border-[#DDEBEF] shadow-xs flex flex-col justify-between space-y-6">
              <p className="text-sm text-[#123047] italic leading-relaxed">
                "Auris handles all our calls and books appointments flawlessly. It feels like having a real team member."
              </p>
              <div className="flex items-center gap-3 pt-3 border-t border-[#DDEBEF]">
                <img
                  src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=120&auto=format&fit=crop&q=80"
                  alt="Dr. Rohan Mehta avatar"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h4 className="text-xs font-bold text-[#123047]">Dr. Rohan Mehta</h4>
                  <p className="text-[11px] text-[#52636D]">Apollo Clinics</p>
                </div>
              </div>
            </div>

            {/* Sneha Iyer */}
            <div className="bg-white rounded-2xl p-6 border border-[#DDEBEF] shadow-xs flex flex-col justify-between space-y-6">
              <p className="text-sm text-[#123047] italic leading-relaxed">
                "We've seen a 3x increase in trial bookings since using Auris. Game changer for our gym!"
              </p>
              <div className="flex items-center gap-3 pt-3 border-t border-[#DDEBEF]">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80"
                  alt="Sneha Iyer avatar"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h4 className="text-xs font-bold text-[#123047]">Sneha Iyer</h4>
                  <p className="text-[11px] text-[#52636D]">FitZone</p>
                </div>
              </div>
            </div>

            {/* Arjun Rao */}
            <div className="bg-white rounded-2xl p-6 border border-[#DDEBEF] shadow-xs flex flex-col justify-between space-y-6">
              <p className="text-sm text-[#123047] italic leading-relaxed">
                "Simple to set up, super reliable, and the voice sounds so natural. Highly recommended!"
              </p>
              <div className="flex items-center gap-3 pt-3 border-t border-[#DDEBEF]">
                <img
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80"
                  alt="Arjun Rao avatar"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h4 className="text-xs font-bold text-[#123047]">Arjun Rao</h4>
                  <p className="text-[11px] text-[#52636D]">Rise Realty</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. READY TO GIVE YOUR BUSINESS A VOICE CTA BANNER */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto my-12">
        <div className="relative rounded-3xl overflow-hidden shadow-xl bg-gradient-to-r from-[#2189C8] via-[#55B9E8] to-[#38A85B] p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Nature Foliage Overlay */}
          <div className="absolute inset-0 opacity-15 pointer-events-none mix-blend-overlay bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

          <div className="space-y-2 text-center md:text-left relative z-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to Give Your Business a Voice?
            </h2>
            <p className="text-sm sm:text-base text-white/90">
              Join hundreds of businesses already growing with Auris.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 relative z-10">
            <button
              id="cta-banner-get-started-btn"
              onClick={onGetStarted}
              className="px-6 py-3 rounded-xl font-bold text-sm text-[#123047] bg-white hover:bg-[#F5FAFC] shadow-sm transition-all cursor-pointer"
            >
              Get Started
            </button>
            <button
              id="cta-banner-talk-btn"
              onClick={onWatchDemo}
              className="px-6 py-3 rounded-xl font-bold text-sm text-white bg-black/20 hover:bg-black/30 border border-white/40 transition-all cursor-pointer flex items-center gap-2"
            >
              <Headphones className="w-4 h-4" />
              Talk to Us
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
