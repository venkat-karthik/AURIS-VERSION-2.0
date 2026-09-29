import React, { useRef, useEffect, useState } from 'react';
import {
  Volume2,
  VolumeX,
  Sparkles,
  PhoneCall,
  User,
  Activity,
  Headphones,
  CheckCircle2,
  Box,
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
      "Hello! Thank you for calling Apollo Medical. My name is Ava. I can book your consultation with Dr. Mehta, answer questions regarding clinic hours, or confirm your lab appointments. How may I care for you today?",
    voiceGender: 'female',
    avatarUrl: '/images/ava-3d-pixar.jpg',
    badge: '3D Pixar Model • Clinical Specialist',
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
    avatarUrl: '/images/marcus-3d-pixar.jpg',
    badge: '3D Pixar Model • Enterprise Advisor',
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
    avatarUrl: '/images/maya-3d-pixar.jpg',
    badge: '3D Pixar Model • 24/7 Dispatch',
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
    avatarUrl: '/images/elena-3d-pixar.jpg',
    badge: '3D Pixar Model • Concierge Dental',
  },
];

interface Interactive3DAgentAvatarProps {
  className?: string;
  height?: number;
  interactive?: boolean;
}

export const Interactive3DAgentAvatar: React.FC<Interactive3DAgentAvatarProps> = ({
  className = '',
  height = 430,
  interactive = true,
}) => {
  const [selectedPersona, setSelectedPersona] = useState<AgentPersona>(AGENT_PERSONAS[0]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState(selectedPersona.speechSample);
  const [isMuted, setIsMuted] = useState(false);
  const [headTracking, setHeadTracking] = useState(true);

  // Real-time smoothed 3D face angles
  const [faceAngle, setFaceAngle] = useState({ yaw: 0, pitch: 0, roll: 0, eyeX: 0, eyeY: 0, lightX: 50, lightY: 50 });

  // Target coordinates for smooth animation
  const targetAngleRef = useRef({ yaw: 0, pitch: 0, roll: 0, eyeX: 0, eyeY: 0, lightX: 50, lightY: 50 });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const avatarStageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setTranscript(selectedPersona.speechSample);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, [selectedPersona]);

  // 1. GLOBAL WINDOW MOUSE TRACKER: The character moves its face wherever the cursor goes across the entire window
  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      if (!headTracking || !avatarStageRef.current) return;
      const rect = avatarStageRef.current.getBoundingClientRect();
      const faceCenterX = rect.left + rect.width / 2;
      const faceCenterY = rect.top + rect.height / 2;

      // Distance from face center to mouse on the screen
      const dx = e.clientX - faceCenterX;
      const dy = e.clientY - faceCenterY;

      // Normalize offsets based on screen proportions
      const halfW = window.innerWidth * 0.45;
      const halfH = window.innerHeight * 0.45;
      const normX = Math.max(-1.3, Math.min(1.3, dx / halfW));
      const normY = Math.max(-1.1, Math.min(1.1, dy / halfH));

      // Calculate 3D angles:
      // Mouse to right -> face turns right (+yaw)
      // Mouse to left -> face turns left (-yaw)
      // Mouse up -> face tilts up (-pitch in CSS rotateX, looking up)
      // Mouse down -> face tilts down (+pitch in CSS rotateX, looking down)
      targetAngleRef.current = {
        yaw: normX * 24,       // ±24 degrees yaw rotation
        pitch: -normY * 18,    // ±18 degrees pitch rotation
        roll: normX * -4,      // subtle natural neck tilt
        eyeX: normX * 10,      // eye pupil horizontal shift (px)
        eyeY: normY * 8,       // eye pupil vertical shift (px)
        lightX: 50 + normX * 36, // dynamic 3D specular light position (%)
        lightY: 50 + normY * 36,
      };
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    return () => window.removeEventListener('mousemove', handleWindowMouseMove);
  }, [headTracking]);

  // 2. SMOOTH 60FPS SPRING / INTERPOLATION ANIMATION LOOP
  useEffect(() => {
    let animId: number;
    const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      setFaceAngle((prev) => {
        const targetYaw = targetAngleRef.current.yaw;
        const targetPitch = targetAngleRef.current.pitch;
        const targetRoll = targetAngleRef.current.roll;
        const targetEyeX = targetAngleRef.current.eyeX;
        const targetEyeY = targetAngleRef.current.eyeY;
        const targetLightX = targetAngleRef.current.lightX;
        const targetLightY = targetAngleRef.current.lightY;

        // Smooth damping (0.08 factor creates organic, lifelike head movement)
        return {
          yaw: lerp(prev.yaw, targetYaw, 0.08),
          pitch: lerp(prev.pitch, targetPitch, 0.08),
          roll: lerp(prev.roll, targetRoll, 0.08),
          eyeX: lerp(prev.eyeX, targetEyeX, 0.08),
          eyeY: lerp(prev.eyeY, targetEyeY, 0.08),
          lightX: lerp(prev.lightX, targetLightX, 0.08),
          lightY: lerp(prev.lightY, targetLightY, 0.08),
        };
      });
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Web Speech API Voice synthesis
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
      className={`relative rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-5 sm:p-6 transition-all duration-300 flex flex-col justify-between ${className}`}
      style={{
        boxShadow: `0 20px 45px -15px ${selectedPersona.glowColorHex}30`,
      }}
    >
      {/* Background Soft Studio Aura */}
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
            <div className="flex items-center gap-1.5">
              <Box className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
              <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                3D Character Viewport
              </span>
            </div>
          </div>
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

      {/* Central Interactive 3D Character Stage (Face moves wherever the cursor goes!) */}
      <div
        ref={avatarStageRef}
        className="relative z-10 my-3 flex flex-col items-center justify-center select-none"
        style={{ perspective: '1200px' }}
      >
        <div
          className="relative transition-transform duration-75 ease-out flex items-center justify-center"
          style={{
            transform: `rotateX(${faceAngle.pitch}deg) rotateY(${faceAngle.yaw}deg) rotateZ(${faceAngle.roll}deg) scale(${isSpeaking ? 1.02 : 1})`,
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

          {/* 3D Pixar Model Character Container */}
          <div className="relative w-48 h-48 sm:w-52 sm:h-52 rounded-full p-2 shadow-2xl transition-all duration-300">
            {/* 3D Ambient Rim Lighting Glow */}
            <div
              className="absolute inset-0 rounded-full blur-md opacity-75 transition-all duration-500"
              style={{
                background: `linear-gradient(135deg, ${selectedPersona.glowColorHex}, transparent 65%)`,
              }}
            />

            {/* 3D Character Surface */}
            <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-white dark:border-slate-800 shadow-inner bg-slate-100 dark:bg-slate-800">
              <img
                src={selectedPersona.avatarUrl}
                alt={selectedPersona.name}
                className="w-full h-full object-cover object-top transition-transform duration-150"
                style={{
                  transform: `scale(1.08) translate(${faceAngle.yaw * -0.15}px, ${faceAngle.pitch * 0.15}px)`,
                }}
                loading="eager"
              />

              {/* Dynamic Real-Time 3D Specular Light Glint (tracks 3D cursor position across entire window) */}
              <div
                className="absolute inset-0 pointer-events-none mix-blend-overlay transition-opacity duration-100"
                style={{
                  background: `radial-gradient(circle at ${faceAngle.lightX}% ${faceAngle.lightY}%, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.2) 28%, transparent 60%)`,
                }}
              />

              {/* PBR Surface Micro-Fresnel Sheen */}
              <div
                className="absolute inset-0 pointer-events-none rounded-full"
                style={{
                  boxShadow: `inset 0 0 24px ${selectedPersona.glowColorHex}40, inset 0 2px 8px rgba(255,255,255,0.45)`,
                }}
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

        </div>

        {/* Name, Role & Company Tag */}
        <div className="text-center mt-3.5 space-y-0.5">
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
        <div className="flex flex-wrap items-center gap-2">
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
            title="Toggle cursor gaze tracking across entire window"
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
