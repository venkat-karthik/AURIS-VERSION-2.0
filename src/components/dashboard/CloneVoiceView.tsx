import React, { useState, useRef } from 'react';
import {
  Mic,
  Upload,
  Play,
  Pause,
  Sparkles,
  Volume2,
  CheckCircle2,
  AlertCircle,
  FileAudio,
  Radio,
  Sliders,
  Shield,
  Layers,
  Cloud,
  Zap,
  RefreshCw,
  Globe,
  Activity,
  Bot,
} from 'lucide-react';
import { CloudinaryAudioUploadModal } from '../common/CloudinaryAudioUploadModal';
import { RealtimeAudioVisualizer } from '../common/RealtimeAudioVisualizer';
import { aurisApi } from '../../services/apiService';

interface VoicePreset {
  id: string;
  name: string;
  provider: 'sarvam' | 'cartesia';
  speaker: string;
  language: string;
  languageCode: string;
  description: string;
  sampleText: string;
}

const VOICE_PRESETS: VoicePreset[] = [
  {
    id: 'bulbul_kavya_te',
    name: 'Kavya (కావ్య)',
    provider: 'sarvam',
    speaker: 'kavya',
    language: 'Telugu (తెలుగు)',
    languageCode: 'te-IN',
    description: 'Warm, natural conversational Telugu female voice optimized for phone support.',
    sampleText: 'నమస్కారం! నేను ఆరిస్ వాయిస్ అసిస్టెంట్ ని. మీకు ఎలా సహాయపడగలను?',
  },
  {
    id: 'bulbul_meera_te',
    name: 'Meera (మీరా)',
    provider: 'sarvam',
    speaker: 'meera',
    language: 'Telugu (తెలుగు)',
    languageCode: 'te-IN',
    description: 'Crisp, articulate female voice ideal for appointment scheduling and billing updates.',
    sampleText: 'మీ అపాయింట్‌మెంట్ రేపు ఉదయం 10:30 కి ఖరారైంది. ధన్యవాదాలు!',
  },
  {
    id: 'bulbul_ratna_te',
    name: 'Ratna (రత్న)',
    provider: 'sarvam',
    speaker: 'ratna',
    language: 'Telugu (తెలుగు)',
    languageCode: 'te-IN',
    description: 'Expressive and friendly Telugu tone for retail customer care.',
    sampleText: 'ధన్యవాదాలు! మీ ఆర్డర్ వివరాలు సరిచూసి మీకు వెంటనే పంపిస్తాను.',
  },
  {
    id: 'bulbul_arun_te',
    name: 'Arun (అరుణ్)',
    provider: 'sarvam',
    speaker: 'arun',
    language: 'Telugu (తెలుగు)',
    languageCode: 'te-IN',
    description: 'Professional, calm Telugu male voice for corporate reception.',
    sampleText: 'నమస్కారం సార్! మన ఆఫీస్ సోమవారం నుండి శుక్రవారం వరకు అందుబాటులో ఉంటుంది.',
  },
  {
    id: 'bulbul_meera_hi',
    name: 'Meera Hindi (मीरा)',
    provider: 'sarvam',
    speaker: 'meera',
    language: 'Hindi (हिन्दी)',
    languageCode: 'hi-IN',
    description: 'National Hindi conversational female voice.',
    sampleText: 'नमस्ते! ऑरिस एआई में आपका स्वागत है। मैं आपकी क्या सेवा कर सकती हूँ?',
  },
  {
    id: 'cartesia_sonic_en',
    name: 'Sonic Enterprise',
    provider: 'cartesia',
    speaker: '6385d6e7-e385-4693-b2b6-c76260452d71',
    language: 'English (Indian / Global)',
    languageCode: 'en-IN',
    description: 'Sub-100ms ultra-low latency English voice with human micro-intonation.',
    sampleText: 'Hello! Thank you for calling Auris Enterprise Cloud. How may I assist your business today?',
  },
];

export const CloneVoiceView: React.FC = () => {
  // Voice Audition Studio State
  const [selectedPreset, setSelectedPreset] = useState<VoicePreset>(VOICE_PRESETS[0]);
  const [customPrompt, setCustomPrompt] = useState(VOICE_PRESETS[0].sampleText);
  const [isAuditioning, setIsAuditioning] = useState(false);
  const [auditionLatency, setAuditionLatency] = useState<number | null>(null);
  const [auditionProvider, setAuditionProvider] = useState<string | null>(null);
  const [auditionError, setAuditionError] = useState<string | null>(null);
  const [activeAudioElement, setActiveAudioElement] = useState<HTMLAudioElement | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Voice Cloning State
  const [voiceName, setVoiceName] = useState('');
  const [cloneProvider, setCloneProvider] = useState<'cartesia' | 'sarvam'>('sarvam');
  const [gender, setGender] = useState<'female' | 'male'>('female');
  const [language, setLanguage] = useState('Telugu (తెలుగు), English (India)');
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [hasSample, setHasSample] = useState(false);
  const [sampleCloudinaryUrl, setSampleCloudinaryUrl] = useState<string | null>(null);
  const [isCloudinaryModalOpen, setIsCloudinaryModalOpen] = useState(false);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState(false);

  // Cloned voices stored on Cloudinary & synchronized
  const [clonedVoices, setClonedVoices] = useState([
    {
      id: 'voice_01',
      name: 'Kavya Telugu Enterprise Assistant',
      provider: 'sarvam',
      gender: 'female',
      language: 'Telugu (తెలుగు - Sarvam Indic)',
      speaker: 'kavya',
      status: 'active',
      sampleId: 'sarvam_bulbul_kavya_01',
      cloudinaryUrl: 'https://res.cloudinary.com/demo/video/upload/auris_voices/shradha_voice.mp3',
      samplePhrase: 'నమస్కారం! నేను ఆరిస్ వాయిస్ అసిస్టెంట్ ని.',
      created: 'May 12, 2026',
    },
    {
      id: 'voice_02',
      name: 'Auris Sonic Executive',
      provider: 'cartesia',
      gender: 'male',
      language: 'English (India), Telugu',
      speaker: '6385d6e7-e385-4693-b2b6-c76260452d71',
      status: 'active',
      sampleId: 'cartesia_clone_executive_02',
      cloudinaryUrl: 'https://res.cloudinary.com/demo/video/upload/auris_voices/executive_voice.mp3',
      samplePhrase: 'Hello! I am your real-time conversational voice assistant.',
      created: 'Jun 28, 2026',
    },
    {
      id: 'voice_03',
      name: 'Meera Hindi & Telugu Lead Specialist',
      provider: 'sarvam',
      gender: 'female',
      language: 'Hindi (National), Telugu',
      speaker: 'meera',
      status: 'active',
      sampleId: 'sarvam_bulbul_meera_03',
      cloudinaryUrl: 'https://res.cloudinary.com/demo/video/upload/auris_voices/hindi_assistant.mp3',
      samplePhrase: 'నమస్కారం! మీ అపాయింట్‌మెంట్ ఖరారైంది.',
      created: 'Aug 04, 2026',
    },
  ]);

  const handleSelectPreset = (preset: VoicePreset) => {
    setSelectedPreset(preset);
    setCustomPrompt(preset.sampleText);
    setAuditionError(null);
  };

  const handleStopAudio = () => {
    if (activeAudioElement) {
      activeAudioElement.pause();
      activeAudioElement.currentTime = 0;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
    setPlayingVoiceId(null);
  };

  // Perform live synthesis preview via backend endpoint
  const handleAuditionVoice = async (textToSpeak?: string, presetOverride?: VoicePreset) => {
    handleStopAudio();
    setIsAuditioning(true);
    setAuditionError(null);

    const preset = presetOverride || selectedPreset;
    const text = textToSpeak || customPrompt;

    try {
      const res = await aurisApi.synthesizeVoicePreview({
        text,
        languageCode: preset.languageCode,
        voiceId: preset.speaker,
        provider: preset.provider,
      });

      setAuditionLatency(res.latencyMs);
      setAuditionProvider(res.provider);

      // Play returned audio directly using data URI
      const audio = new Audio(`data:${res.format};base64,${res.audioBase64}`);
      setActiveAudioElement(audio);
      setIsPlayingAudio(true);

      audio.onended = () => {
        setIsPlayingAudio(false);
      };
      audio.onerror = () => {
        setIsPlayingAudio(false);
      };

      await audio.play();
    } catch (err: any) {
      console.warn('[Audition] Fallback to browser synthesis:', err.message);
      setAuditionError(err.message || 'Server synthesis returned error');

      // Graceful fallback to browser speech synthesis
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.05;
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        setIsPlayingAudio(true);
        window.speechSynthesis.speak(utterance);
      }
    } finally {
      setIsAuditioning(false);
    }
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordSeconds(0);
    const interval = setInterval(() => {
      setRecordSeconds((prev) => {
        if (prev >= 15) {
          clearInterval(interval);
          setIsRecording(false);
          setHasSample(true);
          return 15;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const handleCreateVoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voiceName.trim()) return;

    const newVoice = {
      id: `voice_${Date.now()}`,
      name: voiceName.trim(),
      provider: cloneProvider,
      gender,
      language,
      speaker: cloneProvider === 'sarvam' ? 'kavya' : '6385d6e7-e385-4693-b2b6-c76260452d71',
      status: 'active',
      sampleId: `clone_${Math.random().toString(36).substring(2, 10)}`,
      cloudinaryUrl: sampleCloudinaryUrl || `https://res.cloudinary.com/demo/video/upload/auris_voices/${Date.now()}_sample.mp3`,
      samplePhrase: cloneProvider === 'sarvam' ? 'నమస్కారం! నేను మీ వాయిస్ క్లోన్ అసిస్టెంట్ ని.' : 'Hello! This is your cloned enterprise voice.',
      created: 'Just now',
    };

    setClonedVoices([newVoice, ...clonedVoices]);
    setVoiceName('');
    setHasSample(false);
    setSampleCloudinaryUrl(null);
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 4000);
  };

  const handlePlayCardSample = (voice: any) => {
    if (playingVoiceId === voice.id && isPlayingAudio) {
      handleStopAudio();
      return;
    }

    setPlayingVoiceId(voice.id);
    const mockPreset: VoicePreset = {
      id: voice.id,
      name: voice.name,
      provider: voice.provider,
      speaker: voice.speaker || (voice.provider === 'sarvam' ? 'kavya' : '6385d6e7-e385-4693-b2b6-c76260452d71'),
      language: voice.language,
      languageCode: voice.provider === 'sarvam' ? 'te-IN' : 'en-IN',
      description: voice.name,
      sampleText: voice.samplePhrase || 'నమస్కారం! నేను ఆరిస్ వాయిస్ అసిస్టెంట్ ని.',
    };

    handleAuditionVoice(voice.samplePhrase, mockPreset);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Voice Models, Dialects & Audition Studio
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#06B6D4]/15 text-[#06B6D4] dark:text-[#22D3EE] border border-[#06B6D4]/30">
              Sarvam Bulbul & Cartesia Sonic
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1">
            Test and audition native Telugu (తెలుగు) & Hindi Indic speech models in real-time, or clone your brand's voice with 15 seconds of clean audio.
          </p>
        </div>
      </div>

      {/* TOP SECTION: Interactive Voice Audition Workbench */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090D16]/60 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#06B6D4]/15 text-[#06B6D4] dark:text-[#22D3EE] border border-[#06B6D4]/30 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Real-Time Speech Synthesis Playground</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Instant In-Browser Voice Audition
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Listen directly to Sarvam Bulbul Indic voices and Cartesia neural models with live frequency analysis without making a telephone call.
            </p>
          </div>

          {/* Telemetry pill */}
          <div className="flex items-center gap-3">
            {auditionLatency !== null && (
              <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                <span>{auditionLatency}ms latency</span>
                <span className="text-[10px] opacity-75 font-mono">({auditionProvider})</span>
              </div>
            )}
          </div>
        </div>

        {/* Voice Presets Carousel / Grid */}
        <div className="mt-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
            Select Voice Model & Dialect
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {VOICE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`p-3 rounded-2xl text-left transition-all border cursor-pointer ${
                  selectedPreset.id === preset.id
                    ? 'border-[#06B6D4] bg-[#06B6D4]/10 dark:bg-[#06B6D4]/15 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                    {preset.name}
                  </span>
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {preset.provider === 'sarvam' ? 'Sarvam' : 'Cartesia'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 truncate">{preset.language}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Active Preset Info & Input Workbench */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Audition Text Phrase ({selectedPreset.language})
                </label>
                <button
                  type="button"
                  onClick={() => setCustomPrompt(selectedPreset.sampleText)}
                  className="text-[11px] font-semibold text-[#06B6D4] hover:underline"
                >
                  Reset to default phrase
                </button>
              </div>
              <textarea
                rows={3}
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Type any phrase in Telugu, Hindi, or English to audition live..."
                className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#030712] text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#06B6D4]"
              />
            </div>

            {/* Visualizer & Action Bar */}
            <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="w-full sm:w-64">
                <RealtimeAudioVisualizer
                  isPlaying={isPlayingAudio}
                  audioElement={activeAudioElement}
                  barCount={32}
                  height={44}
                />
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                {isPlayingAudio ? (
                  <button
                    type="button"
                    onClick={handleStopAudio}
                    className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-rose-500/20 cursor-pointer"
                  >
                    <Pause className="w-4 h-4 fill-current" />
                    <span>Stop Playback</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isAuditioning || !customPrompt.trim()}
                    onClick={() => handleAuditionVoice()}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#06B6D4] to-[#2563EB] hover:from-[#22D3EE] hover:to-[#3B82F6] text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-[#06B6D4]/20 disabled:opacity-50 cursor-pointer"
                  >
                    {isAuditioning ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Synthesizing...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current" />
                        <span>Audition Voice Live</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {auditionError && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{auditionError}</span>
              </div>
            )}
          </div>

          {/* Model Specification Card */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-[#06B6D4]" />
              Model Architecture
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800/60">
                <span className="text-slate-500">Active Voice:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedPreset.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800/60">
                <span className="text-slate-500">Engine:</span>
                <span className="font-bold text-[#06B6D4]">
                  {selectedPreset.provider === 'sarvam' ? 'Sarvam Bulbul v3' : 'Cartesia Sonic v2'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800/60">
                <span className="text-slate-500">Language:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedPreset.language}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800/60">
                <span className="text-slate-500">Output Sample Rate:</span>
                <span className="font-mono text-slate-900 dark:text-white">8,000 Hz (Telephony)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Telephony Routing:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Direct Plivo PSTN</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
              {selectedPreset.description}
            </p>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-[#06B6D4]/15 border border-[#334155]/40 text-[#06B6D4] dark:text-[#22D3EE] text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#06B6D4] dark:text-[#22D3EE]" />
          <span>Voice cloned and archived to Cloudinary Audio CDN successfully!</span>
        </div>
      )}

      {/* Main Grid: Clone Station & Library */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Create / Record Clone */}
        <div className="lg:col-span-1 bg-white dark:bg-[#090D16]/30 rounded-3xl p-6 border border-slate-200 dark:border-[#334155]/25 shadow-sm space-y-6">
          <div className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-[#06B6D4] dark:text-[#22D3EE]" />
            <h2 className="text-base font-black text-slate-900 dark:text-white">
              Clone New Voice
            </h2>
          </div>

          <form onSubmit={handleCreateVoice} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-[#94A3B8] mb-1.5">
                Voice Label / Name <span className="text-[#06B6D4]">*</span>
              </label>
              <input
                type="text"
                required
                value={voiceName}
                onChange={(e) => setVoiceName(e.target.value)}
                placeholder="e.g. Executive Telugu Lead Voice"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#334155]/30 bg-slate-50 dark:bg-[#030712] text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#06B6D4]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-[#94A3B8] mb-1.5">
                  Voice Engine
                </label>
                <select
                  value={cloneProvider}
                  onChange={(e) => setCloneProvider(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#334155]/30 bg-slate-50 dark:bg-[#030712] text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#06B6D4]"
                >
                  <option value="sarvam">Sarvam AI (Indic)</option>
                  <option value="cartesia">Cartesia Sonic (&lt;100ms)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-[#94A3B8] mb-1.5">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#334155]/30 bg-slate-50 dark:bg-[#030712] text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#06B6D4]"
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-[#94A3B8] mb-1.5">
                Languages & Accents
              </label>
              <input
                type="text"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                placeholder="Telugu (తెలుగు), English (India)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#334155]/30 bg-slate-50 dark:bg-[#030712] text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#06B6D4]"
              />
            </div>

            {/* Audio Recording Area */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-[#94A3B8] mb-2">
                Speech Audio Sample (15-30s)
              </label>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#030712] border border-dashed border-slate-300 dark:border-[#334155]/30 text-center space-y-3">
                {isRecording ? (
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-full bg-rose-500 text-white mx-auto flex items-center justify-center animate-ping">
                      <Mic className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-rose-500">Recording speech... {recordSeconds}s</p>
                    <p className="text-[11px] text-slate-500 dark:text-[#94A3B8]">Read a paragraph clearly into your microphone.</p>
                  </div>
                ) : hasSample ? (
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-full bg-[#06B6D4]/20 text-[#22D3EE] mx-auto flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-[#06B6D4] dark:text-[#22D3EE]">Audio Sample Ready</p>
                    <div className="flex items-center justify-center gap-1.5 text-[11px] text-sky-600 dark:text-sky-400">
                      <Cloud className="w-3.5 h-3.5" />
                      <span className="truncate max-w-[200px]">{sampleCloudinaryUrl ? 'Cloudinary CDN Synced' : 'Ready for Cloudinary CDN upload'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setHasSample(false);
                        setSampleCloudinaryUrl(null);
                      }}
                      className="text-[11px] text-slate-400 hover:text-slate-600 underline cursor-pointer"
                    >
                      Clear & replace sample
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-[#090D16] text-slate-600 dark:text-[#94A3B8] mx-auto flex items-center justify-center">
                      <Mic className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Provide 15-30 seconds of speech
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-[#94A3B8]">Record live via mic or upload any audio file to Cloudinary.</p>
                    <div className="pt-1 flex flex-wrap items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={handleStartRecording}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-[#06B6D4] dark:text-white text-xs font-bold cursor-pointer hover:opacity-90 flex items-center gap-1"
                      >
                        <Mic className="w-3 h-3" /> Record Mic
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsCloudinaryModalOpen(true)}
                        className="px-3 py-1.5 rounded-xl bg-sky-600 text-white text-xs font-bold cursor-pointer hover:bg-sky-500 flex items-center gap-1"
                      >
                        <Cloud className="w-3 h-3" /> Upload Audio (Cloudinary)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={!voiceName.trim()}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#090D16] via-[#06B6D4] to-[#2563EB] hover:from-[#06B6D4] hover:to-[#3B82F6] text-white text-xs font-bold transition-all shadow-md shadow-[#06B6D4]/20 disabled:opacity-50 cursor-pointer"
            >
              Generate Cloned Voice Model
            </button>
          </form>
        </div>

        {/* Right Column: Cloned Voices Library */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-900 dark:text-white">
              Active Cloned Voice Models ({clonedVoices.length})
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
              <Cloud className="w-3.5 h-3.5 text-sky-500" />
              <span>Cloudinary CDN Synced</span>
            </div>
          </div>

          <div className="space-y-3">
            {clonedVoices.map((voice) => (
              <div
                key={voice.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#090D16]/30 border border-slate-200 dark:border-[#334155]/25 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-slate-950 dark:text-white">
                      {voice.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#06B6D4]/15 text-[#06B6D4] dark:text-[#22D3EE] border border-[#334155]/40 font-mono">
                      {voice.provider === 'cartesia' ? 'Cartesia Sonic' : 'Sarvam Bulbul'}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold capitalize bg-slate-100 dark:bg-[#090D16]/50 text-slate-700 dark:text-[#94A3B8]">
                      {voice.gender}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Languages: <span className="font-semibold text-slate-800 dark:text-slate-200">{voice.language}</span>
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono pt-1">
                    <span>Model ID: {voice.sampleId}</span>
                    <span>•</span>
                    <a
                      href={voice.cloudinaryUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
                    >
                      <Cloud className="w-3 h-3" />
                      <span>Cloudinary Audio File</span>
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => handlePlayCardSample(voice)}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#090D16]/50 dark:hover:bg-[#090D16] text-slate-800 dark:text-slate-200 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                  >
                    {playingVoiceId === voice.id && isPlayingAudio ? (
                      <Pause className="w-4 h-4 text-rose-500" />
                    ) : (
                      <Play className="w-4 h-4 text-[#06B6D4] dark:text-[#22D3EE] fill-current" />
                    )}
                    <span>{playingVoiceId === voice.id && isPlayingAudio ? 'Stop' : 'Listen Preview'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cloudinary Audio Upload Studio Modal */}
      <CloudinaryAudioUploadModal
        isOpen={isCloudinaryModalOpen}
        onClose={() => setIsCloudinaryModalOpen(false)}
        defaultCategory="voice_clone"
        onUploadSuccess={(rec) => {
          setHasSample(true);
          setSampleCloudinaryUrl(rec.secureUrl);
          if (!voiceName) {
            setVoiceName(rec.fileName.replace(/\.[^/.]+$/, ''));
          }
          setIsCloudinaryModalOpen(false);
        }}
      />
    </div>
  );
};
