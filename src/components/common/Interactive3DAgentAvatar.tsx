import React, { useRef, useEffect, useState } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  PhoneCall,
  User,
  Activity,
  Headphones,
  RotateCcw,
  CheckCircle2,
  Radio,
} from 'lucide-react';

export interface AgentPersona {
  id: string;
  name: string;
  role: string;
  company: string;
  primaryColor: string;
  glowColorHex: string;
  tagColor: string;
  accentGradient: string;
  speechSample: string;
  voiceGender: 'female' | 'male';
  avatarUrl: string;
  badge: string;
}

export const AGENT_PERSONAS: AgentPersona[] = [
  {
    id: 'ava',
    name: 'Ava',
    role: 'Medical Clinic Coordinator',
    company: 'Apollo Care Network',
    primaryColor: '#10B981',
    glowColorHex: '#10B981',
    tagColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    accentGradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    speechSample:
      "Hello! Thank you for calling Apollo Medical. My name is Ava. I can book your consultation with Dr. Mehta or confirm your lab appointments. How may I care for you today?",
    voiceGender: 'female',
    avatarUrl:
      'https://images.unsplash.com/photo-1594824813587-4d7a4eb31a89?auto=format&fit=crop&w=800&q=85',
    badge: 'Clinical Care • HIPAA Compliant',
  },
  {
    id: 'marcus',
    name: 'Marcus',
    role: 'Enterprise Solutions Advisor',
    company: 'Apex Cloud Systems',
    primaryColor: '#0EA5E9',
    glowColorHex: '#0EA5E9',
    tagColor: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30',
    accentGradient: 'from-sky-500/20 via-blue-500/10 to-transparent',
    speechSample:
      "Good afternoon! This is Marcus from Apex Cloud. I noticed you requested a solution architecture review for your enterprise voice infrastructure. Do you have two minutes to discuss sizing?",
    voiceGender: 'male',
    avatarUrl:
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=85',
    badge: 'Enterprise B2B • Inbound Lead SDR',
  },
  {
    id: 'maya',
    name: 'Maya',
    role: '24/7 Operations Dispatcher',
    company: 'Metropolitan Fleet Services',
    primaryColor: '#F59E0B',
    glowColorHex: '#F59E0B',
    tagColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    accentGradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
    speechSample:
      "Metropolitan Priority Dispatch, agent Maya speaking. I am prioritizing your dispatch request right now. Please confirm your cross streets and if any immediate vehicle assistance is required.",
    voiceGender: 'female',
    avatarUrl:
      'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=800&q=85',
    badge: 'Emergency Response • 24/7 Live Line',
  },
  {
    id: 'elena',
    name: 'Elena',
    role: 'Patient Care & Concierge',
    company: 'Elevate Dental Wellness',
    primaryColor: '#8B5CF6',
    glowColorHex: '#8B5CF6',
    tagColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
    accentGradient: 'from-purple-500/20 via-pink-500/10 to-transparent',
    speechSample:
      "Hi there! Welcome to Elevate Dental Wellness. I'm Elena, your patient care concierge. I can check our schedule for preventive cleanings, cosmetic consults, or handle your insurance pre-authorizations.",
    voiceGender: 'female',
    avatarUrl:
      'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=800&q=85',
    badge: 'Concierge Dental • Warm Cadence',
  },
];

interface Interactive3DAgentAvatarProps {
  className?: string;
  height?: number;
  interactive?: boolean;
}

export const Interactive3DAgentAvatar: React.FC<Interactive3DAgentAvatarProps> = ({
  className = '',
  height = 420,
  interactive = true,
}) => {
  const [selectedPersona, setSelectedPersona] = useState<AgentPersona>(AGENT_PERSONAS[0]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState(selectedPersona.speechSample);
  const [isMuted, setIsMuted] = useState(false);
  const [headTracking, setHeadTracking] = useState(true);

  // Mouse tilt tracking state for realistic 3D perspective
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Audio Equalizer bars animation state
  const [audioLevels, setAudioLevels] = useState<number[]>([18, 36, 64, 42, 85, 50, 72, 30, 15]);

  useEffect(() => {
    setTranscript(selectedPersona.speechSample);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, [selectedPersona]);

  // Audio level simulation when speaking
  useEffect(() => {
    if (!isSpeaking) {
      setAudioLevels([12, 16, 20, 15, 22, 18, 14, 12, 10]);
      return;
    }
    const interval = setInterval(() => {
      setAudioLevels([
        Math.floor(20 + Math.random() * 60),
        Math.floor(35 + Math.random() * 65),
        Math.floor(40 + Math.random() * 55),
        Math.floor(25 + Math.random() * 75),
        Math.floor(50 + Math.random() * 50),
        Math.floor(30 + Math.random() * 70),
        Math.floor(45 + Math.random() * 55),
        Math.floor(20 + Math.random() * 60),
        Math.floor(15 + Math.random() * 45),
      ]);
    }, 120);

    return () => clearInterval(interval);
  }, [isSpeaking]);

  // Handle 3D perspective gaze / tilt on mouse movement
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!headTracking || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const maxTilt = 10;
    const tiltX = -(y / (rect.height / 2)) * maxTilt;
    const tiltY = (x / (rect.width / 2)) * maxTilt;

    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  // Web Speech API Voice synthesis with persona-appropriate rate and pitch
  const handleToggleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported by your browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(selectedPersona.speechSample);
    utterance.rate = 1.0;
    utterance.pitch = selectedPersona.voiceGender === 'female' ? 1.08 : 0.95;

    // Pick a natural matching voice if available
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const preferred = voices.find((v) =>
        selectedPersona.voiceGender === 'female'
          ? /female|samantha|zira|karen|victoria|moira/i.test(v.name)
          : /male|daniel|david|george|alex/i.test(v.name)
      );
      if (preferred) utterance.voice = preferred;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-5 sm:p-6 transition-all duration-300 flex flex-col justify-between ${className}`}
      style={{
        boxShadow: `0 20px 40px -15px ${selectedPersona.glowColorHex}25`,
      }}
    >
      {/* Background Soft Studio Aura (Harmonious lighting matched to the persona, not dark blue) */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-700 opacity-60 dark:opacity-40"
        style={{
          background: `radial-gradient(circle at 50% 30%, ${selectedPersona.glowColorHex}22 0%, transparent 70%)`,
        }}
      />

      {/* Header: Persona Switcher */}
      <div className="relative z-10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ backgroundColor: selectedPersona.glowColorHex }}
              />
              <span
                className="relative inline-flex rounded-full h-2.5 w-2.5"
                style={{ backgroundColor: selectedPersona.glowColorHex }}
              />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              AI Voice Specialist
            </span>
          </div>

          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {selectedPersona.badge}
          </span>
        </div>

        {/* Persona Select Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {AGENT_PERSONAS.map((p) => {
            const isSelected = selectedPersona.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPersona(p)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 border ${
                  isSelected
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-slate-900 dark:border-white shadow-xs font-extrabold'
                    : 'bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>{p.name} ({p.role.split(' ')[0]})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Central Interactive Human Voice Specialist Stage */}
      <div
        className="relative z-10 my-4 flex flex-col items-center justify-center select-none"
        style={{ perspective: '1000px' }}
      >
        <div
          className="relative transition-transform duration-150 ease-out flex items-center justify-center"
          style={{
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isSpeaking ? 1.02 : 1})`,
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Outer Pulsing Sound Waves when speaking */}
          {isSpeaking && (
            <>
              <div
                className="absolute w-64 h-64 rounded-full animate-ping opacity-25 pointer-events-none"
                style={{ backgroundColor: selectedPersona.glowColorHex }}
              />
              <div
                className="absolute w-56 h-56 rounded-full animate-pulse opacity-40 pointer-events-none"
                style={{
                  border: `2px solid ${selectedPersona.glowColorHex}`,
                }}
              />
            </>
          )}

          {/* Realistic Human Voice Specialist Portrait */}
          <div className="relative w-44 h-44 sm:w-48 sm:h-48 rounded-full p-1.5 shadow-2xl transition-all duration-300">
            {/* Ambient Rim Lighting */}
            <div
              className="absolute inset-0 rounded-full blur-md opacity-70 transition-all duration-500"
              style={{
                background: `linear-gradient(135deg, ${selectedPersona.glowColorHex}, transparent 60%)`,
              }}
            />

            {/* Portrait Image Container */}
            <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-white dark:border-slate-800 shadow-inner bg-slate-100 dark:bg-slate-800">
              <img
                src={selectedPersona.avatarUrl}
                alt={selectedPersona.name}
                className="w-full h-full object-cover object-top transition-transform duration-500 hover:scale-105"
                loading="eager"
              />

              {/* Headset / Communication Icon Watermark */}
              <div className="absolute bottom-2 right-2 p-1.5 rounded-full bg-slate-900/80 backdrop-blur-md text-white border border-white/20 shadow-md">
                <Headphones className="w-3.5 h-3.5" style={{ color: selectedPersona.glowColorHex }} />
              </div>

              {/* Speaking overlay highlight */}
              {isSpeaking && (
                <div
                  className="absolute inset-0 opacity-15 mix-blend-overlay pointer-events-none animate-pulse"
                  style={{ backgroundColor: selectedPersona.glowColorHex }}
                />
              )}
            </div>
          </div>

          {/* Real-Time Floating Frequency Equalizer Bar */}
          <div className="absolute -bottom-3 flex items-end justify-center gap-1 px-3 py-1.5 rounded-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-md">
            <Radio className="w-3 h-3 text-emerald-500 mr-1 shrink-0 animate-pulse" />
            {audioLevels.map((lvl, idx) => (
              <span
                key={idx}
                className="w-1 rounded-full transition-all duration-100"
                style={{
                  height: `${Math.max(6, Math.min(24, (lvl / 100) * 24))}px`,
                  backgroundColor: isSpeaking ? selectedPersona.glowColorHex : '#94A3B8',
                }}
              />
            ))}
          </div>
        </div>

        {/* Name, Role & Company Tag */}
        <div className="text-center mt-6 space-y-0.5">
          <h3 className="text-base font-black text-slate-950 dark:text-white flex items-center justify-center gap-1.5">
            <span>{selectedPersona.name}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </h3>
          <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
            {selectedPersona.role}
          </p>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {selectedPersona.company}
          </p>
        </div>
      </div>

      {/* Live Voice Synthesis Transcript Bubble */}
      <div className="relative z-10 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl p-3.5 mb-3 backdrop-blur-md space-y-1.5 shadow-inner">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" />
            Live Voice Synthesis Transcript
          </span>
          <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
            {isSpeaking ? '● Speaking now...' : 'Studio 48kHz HD Audio'}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-100 font-medium leading-relaxed italic">
          "{transcript}"
        </p>
      </div>

      {/* Control Actions Row */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <button
            id="agent-avatar-speak-trigger-btn"
            onClick={handleToggleSpeak}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-2 shadow-xs ${
              isSpeaking
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-4 h-4" />
                <span>Interrupt Agent</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" />
                <span>Hear {selectedPersona.name} Speak</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isMuted
                ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setHeadTracking(!headTracking)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer hidden sm:flex items-center gap-1.5 ${
              headTracking
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
            }`}
            title="Toggle cursor gaze tracking"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>3D Gaze: {headTracking ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <PhoneCall className="w-3.5 h-3.5 text-emerald-500" />
          <span>Carrier Ready • SIP/WebRTC</span>
        </div>
      </div>
    </div>
  );
};
