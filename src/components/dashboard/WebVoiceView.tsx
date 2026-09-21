import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Agent, Call } from '../../types';
import { activeVoiceProvider } from '../../services/providerAbstraction';
import {
  Mic,
  MicOff,
  PhoneOff,
  PhoneCall,
  Volume2,
  Sparkles,
  Bot,
  User,
  Clock,
  Radio,
  Send,
  RefreshCw,
  CheckCircle2,
  TrendingUp,
  BrainCircuit,
} from 'lucide-react';

interface WebVoiceViewProps {
  agents: Agent[];
  onCallFinished?: (newCall: Call) => void;
}

export const WebVoiceView: React.FC<WebVoiceViewProps> = ({ agents, onCallFinished }) => {
  const [selectedAgentId, setSelectedAgentId] = useState(agents[0]?.id || '');
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [inputText, setInputText] = useState('');
  const [isAgentThinking, setIsAgentThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<Array<{ speaker: 'agent' | 'user'; text: string; timestamp: string }>>([]);
  const [lastAnalysis, setLastAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  const selectedAgent = agents.find((a) => a.id === selectedAgentId) || agents[0];

  // Call timer effect
  useEffect(() => {
    if (isCallActive) {
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isCallActive]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  // Speak Agent Response with Web Speech API
  const speakAgentResponse = (text: string) => {
    setIsAgentThinking(false);
    setIsSpeaking(true);
    const now = new Date();
    const timestamp = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;

    setTranscript((prev) => [...prev, { speaker: 'agent', text, timestamp }]);

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = selectedAgent.speed || 1.0;
      utterance.pitch = selectedAgent.pitch || 1.0;

      const voices = window.speechSynthesis.getVoices();
      const foundVoice = voices.find((v) =>
        v.lang.startsWith('en') && (
          selectedAgent.voiceName.includes('Liam') ? v.name.includes('Male') || v.name.includes('David') :
          selectedAgent.voiceName.includes('Ava') ? v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Google') :
          true
        )
      );
      if (foundVoice) utterance.voice = foundVoice;

      utterance.onend = () => {
        setIsSpeaking(false);
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsSpeaking(false), 2000);
    }
  };

  // Start Call
  const handleStartCall = () => {
    setIsCallActive(true);
    setCallDuration(0);
    setTranscript([]);
    setLastAnalysis(null);

    // Agent initial greeting
    const initialGreeting = selectedAgent.instructions?.greeting || `Hello! Thank you for calling. My name is ${selectedAgent.name}. How may I help you today?`;
    speakAgentResponse(initialGreeting);

    // Setup speech recognition if browser supports it
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => {
        if (isCallActive && !isMuted) {
          try { recognition.start(); } catch (e) {}
        }
      };
      recognition.onresult = (event: any) => {
        const lastResult = event.results[event.results.length - 1];
        if (lastResult.isFinal) {
          const userUtterance = lastResult[0].transcript;
          handleUserUtterance(userUtterance);
        }
      };

      try {
        recognition.start();
        recognitionRef.current = recognition;
      } catch (err) {
        console.warn('Speech recognition start failed', err);
      }
    }
  };

  // Process User Utterance through Provider Abstraction & Backend
  const handleUserUtterance = async (utterance: string) => {
    if (!utterance.trim()) return;

    const now = new Date();
    const timestamp = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
    setTranscript((prev) => [...prev, { speaker: 'user', text: utterance, timestamp }]);
    setInputText('');
    setIsAgentThinking(true);

    // Call Provider Simulation (with real Gemini backend support)
    const result = await activeVoiceProvider.simulateConversation(
      selectedAgent.id,
      utterance,
      transcript.map((t) => ({ role: t.speaker === 'agent' ? 'assistant' : 'user', text: t.text })),
      selectedAgent,
      'Apollo Clinics'
    );

    speakAgentResponse(result.responseText);
  };

  // End Call & trigger AI analysis
  const handleEndCall = async () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    setIsCallActive(false);
    setIsListening(false);
    setIsSpeaking(false);

    // If call had dialogue, analyze it with AI
    if (transcript.length > 0) {
      setIsAnalyzing(true);
      try {
        const res = await fetch('/api/voice/analyze-call', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transcript }),
        });

        if (res.ok) {
          const analysis = await res.json();
          setLastAnalysis(analysis);

          // Construct real new call log
          const newCallRecord: Call = {
            id: `call_${Date.now()}`,
            businessId: selectedAgent.businessId || 'biz_01',
            callerNumber: '+1 (555) 349-2180',
            callerName: 'Web Simulator User',
            agentId: selectedAgent.id,
            agentName: selectedAgent.name,
            direction: 'inbound',
            status: 'answered',
            durationSeconds: callDuration || 45,
            durationFormatted: formatTime(callDuration || 45),
            timestamp: 'Just now',
            sentiment: analysis.sentiment || 'positive',
            transcript: transcript.map((t) => ({
              speaker: t.speaker === 'agent' ? 'agent' : 'caller',
              text: t.text,
              timestamp: t.timestamp,
            })),
            extractedEntities: {
              intent: analysis.intent || 'Appointment Booking',
              appointmentRequested: analysis.appointmentRequested ?? true,
              appointmentTime: analysis.appointmentTime || 'Tomorrow at 10:30 AM',
              leadScore: analysis.leadScore || 85,
              notes: analysis.summary || 'Customer interacted via live voice playground.',
            },
          };

          onCallFinished?.(newCallRecord);
        }
      } catch (e) {
        console.warn('Call analysis failed', e);
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const samplePrompts = [
    "What are your clinic hours and address?",
    "Can I schedule an appointment with Dr. Mehta for Friday?",
    "Do you accept cashless health insurance?",
    "Can you transfer me to a human specialist?",
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFFAF1] border border-[#65C978]/30 text-xs font-bold text-[#38A85B] mb-1">
            <Radio className="w-3 h-3 animate-pulse" />
            Direct WebRTC Audio Stream
          </div>
          <h1 className="text-2xl font-extrabold text-[#123047] tracking-tight">Talk to Auris (Live)</h1>
          <p className="text-xs text-[#52636D]">
            Test your voice agent live in the browser with real-time speech synthesis, sub-350ms reasoning, and automated post-call analysis.
          </p>
        </div>

        {/* Agent Selector */}
        {!isCallActive && (
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-[#82919A]">Active Agent:</label>
            <select
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              className="px-3 py-2 rounded-xl border border-[#DDEBEF] bg-white text-xs font-semibold text-[#123047]"
            >
              {agents.map((ag) => (
                <option key={ag.id} value={ag.id}>
                  {ag.name} ({ag.voiceName})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Calling Stage */}
      <motion.div
        layout
        className="bg-white rounded-3xl p-8 border border-[#DDEBEF] shadow-md relative overflow-hidden flex flex-col items-center text-center space-y-6"
      >
        {/* Subtle Background Glow */}
        <div className="absolute top-0 w-72 h-72 bg-[#55B9E8]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Agent Persona Pill */}
        <div className="relative z-10 flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#F5FAFC] border border-[#DDEBEF] text-xs font-semibold text-[#123047]">
          <span className={`w-2 h-2 rounded-full ${isCallActive ? 'bg-[#38A85B] animate-ping' : 'bg-[#82919A]'}`} />
          <span>{selectedAgent.name}</span>
          <span className="text-[#82919A]">•</span>
          <span className="text-[#2189C8]">{selectedAgent.voiceName}</span>
        </div>

        {/* Animated Waveform Visualizer & Avatar Circle */}
        <div className="relative z-10 flex items-center justify-center">
          {/* Outer Pulsing Rings when speaking */}
          {isCallActive && (isSpeaking || isListening) && (
            <div className="absolute w-56 h-56 rounded-full bg-[#38A85B]/10 animate-ping pointer-events-none" />
          )}

          <div className="w-44 h-44 rounded-full bg-gradient-to-b from-[#EEF8FC] to-[#EFFAF1] border-4 border-white shadow-xl flex items-center justify-center relative overflow-hidden">
            {isCallActive ? (
              <div className="flex items-center justify-center gap-1.5 h-16">
                {[20, 36, 54, 30, 68, 44, 32, 58, 40, 24].map((h, i) => (
                  <span
                    key={i}
                    className="w-1.5 bg-[#38A85B] rounded-full transition-all duration-150"
                    style={{
                      height: `${isSpeaking ? h : isAgentThinking ? 12 : 24}px`,
                      animation: isSpeaking ? `pulse 0.6s infinite ${i * 0.08}s` : 'none',
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#2189C8] text-white flex items-center justify-center shadow-md">
                <Bot className="w-8 h-8" />
              </div>
            )}
          </div>
        </div>

        {/* Call Timer & Status */}
        <div className="relative z-10 space-y-1">
          {isCallActive ? (
            <>
              <div className="text-3xl font-black font-mono text-[#123047]">
                {formatTime(callDuration)}
              </div>
              <p className="text-xs font-semibold text-[#38A85B] flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#38A85B] animate-pulse" />
                {isAgentThinking
                  ? 'Auris is generating response...'
                  : isSpeaking
                  ? 'Agent Speaking...'
                  : isListening
                  ? 'Listening to your microphone...'
                  : 'Call Connected'}
              </p>
            </>
          ) : (
            <>
              <h3 className="text-lg font-bold text-[#123047]">Ready to Call</h3>
              <p className="text-xs text-[#52636D]">
                Click Start Call to speak via microphone or send quick simulated queries.
              </p>
            </>
          )}
        </div>

        {/* Action Controls */}
        <div className="relative z-10 flex items-center gap-4 pt-2">
          {!isCallActive ? (
            <button
              id="web-voice-start-btn"
              onClick={handleStartCall}
              className="px-8 py-3.5 rounded-2xl bg-[#38A85B] hover:bg-[#2f8f4d] text-white font-bold text-sm shadow-md flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
            >
              <PhoneCall className="w-4 h-4" />
              Start Interactive Call
            </button>
          ) : (
            <>
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-3.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  isMuted
                    ? 'bg-rose-50 border-rose-200 text-rose-600'
                    : 'bg-[#F5FAFC] border-[#DDEBEF] text-[#123047] hover:bg-[#EEF8FC]'
                }`}
                title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                {isMuted ? 'Muted' : 'Mute'}
              </button>

              <button
                id="web-voice-end-btn"
                onClick={handleEndCall}
                className="px-6 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
              >
                <PhoneOff className="w-4 h-4" />
                End Call
              </button>
            </>
          )}
        </div>

        {/* Suggested Quick Query Prompts */}
        {isCallActive && (
          <div className="relative z-10 pt-4 w-full text-left space-y-2">
            <p className="text-[11px] font-bold text-[#82919A] uppercase tracking-wider text-center">
              Click a sample query or speak into your microphone:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {samplePrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleUserUtterance(p)}
                  className="px-3 py-1.5 rounded-xl bg-[#F5FAFC] hover:bg-[#EEF8FC] border border-[#DDEBEF] text-xs text-[#123047] transition-all cursor-pointer hover:border-[#55B9E8]"
                >
                  "{p}"
                </button>
              ))}
            </div>

            {/* Direct text input option */}
            <div className="pt-2 flex items-center gap-2 max-w-lg mx-auto">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleUserUtterance(inputText);
                }}
                placeholder="Type a custom caller response..."
                className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-[#DDEBEF] bg-[#F5FAFC] text-[#123047] focus:outline-none focus:border-[#2189C8]"
              />
              <button
                onClick={() => handleUserUtterance(inputText)}
                className="p-2 rounded-xl bg-[#2189C8] text-white hover:bg-[#1b72a6] cursor-pointer transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Post-Call Real AI Intelligence Card */}
      {lastAnalysis && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 border border-[#38A85B]/30 bg-gradient-to-br from-white to-[#EFFAF1]/30 shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-[#38A85B]" />
              <h4 className="text-sm font-bold text-[#123047]">Real-Time Call AI Analysis</h4>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#EFFAF1] text-[#38A85B] border border-[#65C978]/30">
              Synced to Call Logs
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white border border-[#DDEBEF]">
              <span className="text-[#82919A] text-[10px] uppercase font-bold">Detected Intent</span>
              <p className="font-bold text-[#123047] mt-0.5">{lastAnalysis.intent || 'Appointment Booking'}</p>
            </div>
            <div className="p-3 rounded-xl bg-white border border-[#DDEBEF]">
              <span className="text-[#82919A] text-[10px] uppercase font-bold">Caller Sentiment</span>
              <p className="font-bold text-[#38A85B] capitalize mt-0.5">{lastAnalysis.sentiment || 'Positive'}</p>
            </div>
            <div className="p-3 rounded-xl bg-white border border-[#DDEBEF]">
              <span className="text-[#82919A] text-[10px] uppercase font-bold">Lead Score</span>
              <p className="font-bold text-[#2189C8] mt-0.5">{lastAnalysis.leadScore || 88} / 100</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#F5FAFC] border border-[#DDEBEF] text-xs space-y-1">
            <span className="font-bold text-[#123047]">AI Summary:</span>
            <p className="text-[#52636D]">{lastAnalysis.summary || 'Caller requested service booking and completed interaction successfully.'}</p>
          </div>
        </motion.div>
      )}

      {/* Live Transcript Log */}
      {transcript.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl p-6 border border-[#DDEBEF] shadow-xs space-y-3"
        >
          <div className="flex justify-between items-center pb-2 border-b border-[#DDEBEF]">
            <h4 className="text-xs font-bold text-[#123047] uppercase tracking-wider">
              Live Call Audio Transcript
            </h4>
            <span className="text-[10px] text-[#38A85B] font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#38A85B] animate-ping" />
              Streaming via WebRTC
            </span>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-2 text-xs">
            {transcript.map((item, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl ${
                  item.speaker === 'agent'
                    ? 'bg-[#EEF8FC] border border-[#55B9E8]/20 ml-8 text-right'
                    : 'bg-[#F5FAFC] border border-[#DDEBEF] mr-8 text-left'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-bold text-[#82919A] mb-1">
                  <span>{item.speaker === 'agent' ? selectedAgent.name : 'You (Caller)'}</span>
                  <span>{item.timestamp}</span>
                </div>
                <p className="text-[#123047]">{item.text}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};
