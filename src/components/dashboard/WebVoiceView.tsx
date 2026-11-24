import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Agent, Call } from '../../types';
import { WebVoiceClient, WebVoiceCallStatus, WebVoiceTranscriptEvent } from '../../services/webVoiceClient.ts';
import {
  Mic,
  MicOff,
  PhoneOff,
  PhoneCall,
  Volume2,
  Sparkles,
  Bot,
  User,
  Radio,
  RefreshCw,
  CheckCircle2,
  BrainCircuit,
  Download,
  AlertCircle,
  Activity,
} from 'lucide-react';

interface WebVoiceViewProps {
  agents: Agent[];
  onCallFinished?: (newCall: Call) => void;
}

export const WebVoiceView: React.FC<WebVoiceViewProps> = ({ agents, onCallFinished }) => {
  const [selectedAgentId, setSelectedAgentId] = useState(agents[0]?.id || '');
  const [callStatus, setCallStatus] = useState<WebVoiceCallStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [transcript, setTranscript] = useState<WebVoiceTranscriptEvent[]>([]);
  const [volume, setVolume] = useState({ input: 0, output: 0 });
  const [isInterrupted, setIsInterrupted] = useState(false);
  const [lastCallId, setLastCallId] = useState<string | null>(null);

  const clientRef = useRef<WebVoiceClient | null>(null);
  const timerRef = useRef<any>(null);
  const transcriptBottomRef = useRef<HTMLDivElement | null>(null);

  const selectedAgent = agents.find((a) => a.id === selectedAgentId) || agents[0];

  // Auto-scroll transcript to bottom
  useEffect(() => {
    transcriptBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  // Call duration timer
  useEffect(() => {
    if (callStatus === 'connected' || callStatus === 'speaking' || callStatus === 'listening') {
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callStatus]);

  // Clean up client on unmount
  useEffect(() => {
    return () => {
      if (clientRef.current) {
        clientRef.current.hangup().catch(() => {});
      }
    };
  }, []);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const handleStartCall = async () => {
    setErrorMessage(null);
    setTranscript([]);
    setCallDuration(0);
    setIsInterrupted(false);

    try {
      const client = new WebVoiceClient({
        onStatusChange: (status, detail) => {
          setCallStatus(status);
          if (status === 'error') {
            setErrorMessage(detail || 'Connection error occurred');
          }
          if (status === 'disconnected') {
            const endedCallId = client.getCallId();
            if (endedCallId) {
              setLastCallId(endedCallId);
            }
          }
        },
        onTranscript: (event) => {
          setTranscript((prev) => {
            // If the latest message from same speaker is partial, update it in place
            if (!event.isFinal && prev.length > 0 && prev[prev.length - 1].speaker === event.speaker && !prev[prev.length - 1].isFinal) {
              const updated = [...prev];
              updated[updated.length - 1] = event;
              return updated;
            }
            return [...prev, event];
          });
        },
        onVolume: (vols) => {
          setVolume(vols);
        },
        onInterrupted: () => {
          setIsInterrupted(true);
          setTimeout(() => setIsInterrupted(false), 2000);
        },
      });

      clientRef.current = client;
      await client.startSession({
        agentId: selectedAgent?.id || 'agent_default',
        language: selectedAgent?.language || 'Telugu',
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to start browser voice session');
      setCallStatus('error');
    }
  };

  const handleEndCall = async () => {
    if (clientRef.current) {
      const endedId = clientRef.current.getCallId();
      await clientRef.current.hangup();
      if (endedId) {
        setLastCallId(endedId);
      }
    }
    setCallStatus('disconnected');
  };

  const handleToggleMute = () => {
    if (clientRef.current) {
      const nextMute = !isMuted;
      clientRef.current.setMute(nextMute);
      setIsMuted(nextMute);
    }
  };

  const isLive = callStatus === 'connected' || callStatus === 'speaking' || callStatus === 'listening';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight">
              In-Browser Voice Playground
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#6366F1]/15 text-[#6366F1] border border-[#6366F1]/30">
              Low-Latency Mesh
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Talk directly with your conversational agent using your computer microphone. Test Telugu pronunciation, natural phrasing, and sub-second barge-in without carrier call charges.
          </p>
        </div>

        {/* Agent Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-400">Agent:</label>
          <select
            disabled={isLive}
            value={selectedAgentId}
            onChange={(e) => setSelectedAgentId(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-900 text-white font-medium focus:outline-none focus:border-[#6366F1] disabled:opacity-50"
          >
            {agents.map((ag) => (
              <option key={ag.id} value={ag.id}>
                {ag.name} ({ag.language || 'Telugu'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Stage & Audio Visualizer */}
        <div className="lg:col-span-7 bg-[#090D16] border border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between min-h-[460px] relative overflow-hidden">
          {/* Ambient Glow */}
          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
              callStatus === 'speaking'
                ? 'bg-[#6366F1]/25 scale-125'
                : callStatus === 'listening'
                ? 'bg-emerald-500/20 scale-100'
                : 'bg-transparent'
            }`}
          />

          {/* Top Stage Bar */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700/80 flex items-center justify-center">
                <Bot className="w-5 h-5 text-[#6366F1]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{selectedAgent?.name || 'Auris Voice Specialist'}</h3>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span>{selectedAgent?.language || 'Telugu (Sarvam Bulbul)'}</span>
                  <span>•</span>
                  <span>Voice: {selectedAgent?.voiceId || 'kavya'}</span>
                </div>
              </div>
            </div>

            {/* Live Indicator / Timer */}
            {isLive ? (
              <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-mono font-bold text-white">{formatTime(callDuration)}</span>
              </div>
            ) : (
              <span className="text-xs font-mono text-slate-500">Ready to Connect</span>
            )}
          </div>

          {/* Central Sphere / Wave Visualizer */}
          <div className="flex flex-col items-center justify-center my-8 z-10">
            <div className="relative flex items-center justify-center">
              {/* Pulsing Rings */}
              {isLive && (
                <>
                  <motion.div
                    animate={{
                      scale: callStatus === 'speaking' ? [1, 1.35, 1] : [1, 1.1, 1],
                      opacity: callStatus === 'speaking' ? [0.3, 0.7, 0.3] : [0.2, 0.4, 0.2],
                    }}
                    transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                    className="absolute w-44 h-44 rounded-full border border-[#6366F1]/40"
                  />
                  <motion.div
                    animate={{
                      scale: callStatus === 'speaking' ? [1, 1.6, 1] : [1, 1.2, 1],
                      opacity: callStatus === 'speaking' ? [0.15, 0.4, 0.15] : [0.1, 0.2, 0.1],
                    }}
                    transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                    className="absolute w-44 h-44 rounded-full border border-[#6366F1]/20"
                  />
                </>
              )}

              {/* Main Avatar Core */}
              <div
                className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl ${
                  callStatus === 'speaking'
                    ? 'bg-gradient-to-br from-[#6366F1] to-blue-600 shadow-[#6366F1]/40 scale-105'
                    : callStatus === 'listening'
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-700 shadow-emerald-500/30 scale-100'
                    : 'bg-slate-800/80 border border-slate-700'
                }`}
              >
                {callStatus === 'speaking' ? (
                  <Volume2 className="w-12 h-12 text-white animate-bounce" />
                ) : callStatus === 'listening' ? (
                  <Mic className="w-12 h-12 text-white animate-pulse" />
                ) : (
                  <Bot className="w-12 h-12 text-slate-400" />
                )}
              </div>
            </div>

            {/* Live Audio Status Pill */}
            <div className="mt-6 flex flex-col items-center gap-1.5">
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  callStatus === 'speaking'
                    ? 'bg-[#6366F1]/15 border-[#6366F1]/40 text-[#6366F1]'
                    : callStatus === 'listening'
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                    : callStatus === 'connecting' || callStatus === 'requesting-permission'
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                {callStatus === 'speaking'
                  ? 'Agent Speaking (Sarvam Bulbul)...'
                  : callStatus === 'listening'
                  ? 'Listening to Your Microphone...'
                  : callStatus === 'connecting'
                  ? 'Negotiating Real-Time Stream...'
                  : callStatus === 'requesting-permission'
                  ? 'Requesting Microphone Access...'
                  : 'Microphone Idle'}
              </span>

              {isInterrupted && (
                <span className="text-[11px] font-mono text-amber-400 font-bold animate-pulse">
                  ⚡ Barge-in Triggered (Playback Purged)
                </span>
              )}
            </div>

            {/* Simulated Live Audio Level Meters */}
            {isLive && (
              <div className="flex items-center gap-1.5 mt-4">
                {[...Array(16)].map((_, i) => {
                  const activeHeight =
                    callStatus === 'speaking'
                      ? Math.max(4, Math.sin(i * 0.6 + Date.now() * 0.005) * 20 + 12)
                      : Math.max(4, volume.input * 30 + Math.random() * 4);
                  return (
                    <div
                      key={i}
                      style={{ height: `${activeHeight}px` }}
                      className={`w-1 rounded-full transition-all duration-75 ${
                        callStatus === 'speaking'
                          ? 'bg-[#6366F1]'
                          : callStatus === 'listening'
                          ? 'bg-emerald-400'
                          : 'bg-slate-700'
                      }`}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Bottom Control Actions */}
          <div className="flex items-center justify-center gap-4 z-10 pt-4 border-t border-slate-800/80">
            {!isLive ? (
              <button
                type="button"
                onClick={handleStartCall}
                disabled={callStatus === 'connecting' || callStatus === 'requesting-permission'}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#6366F1] to-blue-600 hover:from-[#4F46E5] hover:to-blue-700 text-white font-bold text-sm flex items-center gap-2.5 shadow-lg shadow-[#6366F1]/25 cursor-pointer transition-all disabled:opacity-50"
              >
                <Mic className="w-5 h-5" />
                <span>Start In-Browser Call</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleToggleMute}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isMuted
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                  }`}
                  title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                <button
                  type="button"
                  onClick={handleEndCall}
                  className="px-6 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm flex items-center gap-2 cursor-pointer shadow-lg shadow-rose-600/30 transition-all"
                >
                  <PhoneOff className="w-5 h-5" />
                  <span>End Voice Session</span>
                </button>
              </>
            )}
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mt-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Right Column: Live Telephony Transcript Stream */}
        <div className="lg:col-span-5 bg-[#090D16] border border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between min-h-[460px]">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-[#6366F1]" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Live Voice Transcript
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {transcript.length} turns
              </span>
            </div>

            {/* Transcript Messages Container */}
            <div className="space-y-3 mt-4 max-h-[320px] overflow-y-auto pr-1">
              {transcript.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500 space-y-2">
                  <Radio className="w-8 h-8 opacity-40 text-[#6366F1]" />
                  <p className="text-xs">No active dialogue yet.</p>
                  <p className="text-[11px] text-slate-600 max-w-xs">
                    Click &quot;Start In-Browser Call&quot; to speak in Telugu or English. Transcribed turns appear here in real time.
                  </p>
                </div>
              ) : (
                transcript.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col p-3 rounded-2xl text-xs leading-relaxed ${
                      item.speaker === 'agent'
                        ? 'bg-[#6366F1]/10 border border-[#6366F1]/20 text-slate-100 mr-4'
                        : 'bg-slate-800/80 border border-slate-700/60 text-slate-200 ml-4'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1 text-[10px] font-mono text-slate-400">
                      <span className="font-bold flex items-center gap-1">
                        {item.speaker === 'agent' ? (
                          <>
                            <Bot className="w-3 h-3 text-[#6366F1]" />
                            <span>{selectedAgent?.name || 'Agent'}</span>
                          </>
                        ) : (
                          <>
                            <User className="w-3 h-3 text-slate-400" />
                            <span>You (Microphone)</span>
                          </>
                        )}
                      </span>
                      <span>{item.timestamp}</span>
                    </div>
                    <p className="font-medium text-slate-100">{item.text}</p>
                    {!item.isFinal && (
                      <span className="text-[10px] text-[#6366F1] animate-pulse mt-0.5">
                        Transcribing...
                      </span>
                    )}
                  </div>
                ))
              )}
              <div ref={transcriptBottomRef} />
            </div>
          </div>

          {/* Bottom Card: Recording Link if available */}
          {lastCallId && (
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Session Synchronized
              </span>
              <a
                href={`/api/calls/${lastCallId}/audio`}
                download={`${lastCallId}.wav`}
                className="text-[#6366F1] hover:text-[#818CF8] font-bold flex items-center gap-1 text-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download WAV Audio</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
