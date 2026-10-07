import React, { useState } from 'react';
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
} from 'lucide-react';
import { CloudinaryAudioUploadModal } from '../common/CloudinaryAudioUploadModal';

export const CloneVoiceView: React.FC = () => {
  const [voiceName, setVoiceName] = useState('');
  const [provider, setProvider] = useState<'cartesia' | 'sarvam'>('cartesia');
  const [gender, setGender] = useState<'female' | 'male'>('female');
  const [language, setLanguage] = useState('English (India) + Hindi + Telugu');
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [hasSample, setHasSample] = useState(false);
  const [sampleCloudinaryUrl, setSampleCloudinaryUrl] = useState<string | null>(null);
  const [isCloudinaryModalOpen, setIsCloudinaryModalOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState(false);

  // Cloned voices stored on Cloudinary & synchronized
  const [clonedVoices, setClonedVoices] = useState([
    {
      id: 'voice_01',
      name: 'Shradha Executive Voice',
      provider: 'cartesia',
      gender: 'female',
      language: 'English (India), Hindi, Telugu',
      status: 'active',
      sampleId: 'cartesia_clone_shradha_01',
      cloudinaryUrl: 'https://res.cloudinary.com/demo/video/upload/auris_voices/shradha_voice.mp3',
      created: 'May 12, 2026',
    },
    {
      id: 'voice_02',
      name: 'Venkat Karthik (Director Voice)',
      provider: 'cartesia',
      gender: 'male',
      language: 'English (India), Telugu',
      status: 'active',
      sampleId: 'cartesia_clone_venkat_02',
      cloudinaryUrl: 'https://res.cloudinary.com/demo/video/upload/auris_voices/venkat_voice.mp3',
      created: 'Jun 28, 2026',
    },
    {
      id: 'voice_03',
      name: 'Auris Hindi Practice Assistant',
      provider: 'sarvam',
      gender: 'female',
      language: 'Hindi (National), English (India)',
      status: 'active',
      sampleId: 'sarvam_bulbul_hindi_03',
      cloudinaryUrl: 'https://res.cloudinary.com/demo/video/upload/auris_voices/hindi_assistant.mp3',
      created: 'Aug 04, 2026',
    },
  ]);

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
      provider,
      gender,
      language,
      status: 'active',
      sampleId: `clone_${Math.random().toString(36).substring(2, 10)}`,
      cloudinaryUrl: sampleCloudinaryUrl || `https://res.cloudinary.com/demo/video/upload/auris_voices/${Date.now()}_sample.mp3`,
      created: 'Just now',
    };

    setClonedVoices([newVoice, ...clonedVoices]);
    setVoiceName('');
    setHasSample(false);
    setSampleCloudinaryUrl(null);
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 4000);
  };

  const handlePlaySample = (voiceId: string, name: string) => {
    if (isPlaying === voiceId) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setIsPlaying(null);
      return;
    }

    setIsPlaying(voiceId);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(`Hello! This is a verified voice clone sample of ${name}. I speak naturally with ultra-low latency.`);
      utterance.rate = 1.0;
      utterance.pitch = 1.05;
      utterance.onend = () => setIsPlaying(null);
      utterance.onerror = () => setIsPlaying(null);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsPlaying(null), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Voice Models & Cloning
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#1D64C2]/15 text-[#1D64C2] dark:text-[#C1E8FF] border border-[#5483B3]/40">
              Cartesia & Sarvam AI Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-[#7DA0CA] mt-1">
            Clone your voice or your staff's voice with 15 seconds of clean speech. Samples stored securely on Cloudinary and deployed instantly to inbound/outbound telephony.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-[#1D64C2]/15 border border-[#5483B3]/40 text-[#1D64C2] dark:text-[#C1E8FF] text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#1D64C2] dark:text-[#C1E8FF]" />
          <span>Voice cloned and archived to Cloudinary Audio CDN successfully!</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Create / Record Clone */}
        <div className="lg:col-span-1 bg-white dark:bg-[#052659]/30 rounded-3xl p-6 border border-slate-200 dark:border-[#5483B3]/25 shadow-sm space-y-6">
          <div className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-[#1D64C2] dark:text-[#C1E8FF]" />
            <h2 className="text-base font-black text-slate-900 dark:text-white">
              Clone New Voice
            </h2>
          </div>

          <form onSubmit={handleCreateVoice} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-[#7DA0CA] mb-1.5">
                Voice Label / Name <span className="text-[#1D64C2]">*</span>
              </label>
              <input
                type="text"
                required
                value={voiceName}
                onChange={(e) => setVoiceName(e.target.value)}
                placeholder="e.g. Karthik Executive Tone"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#5483B3]/30 bg-slate-50 dark:bg-[#021024] text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#1D64C2]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-[#7DA0CA] mb-1.5">
                  Voice Engine
                </label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#5483B3]/30 bg-slate-50 dark:bg-[#021024] text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#1D64C2]"
                >
                  <option value="cartesia">Cartesia Sonic (&lt;100ms)</option>
                  <option value="sarvam">Sarvam AI (Indic)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-[#7DA0CA] mb-1.5">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#5483B3]/30 bg-slate-50 dark:bg-[#021024] text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#1D64C2]"
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-[#7DA0CA] mb-1.5">
                Languages & Accents
              </label>
              <input
                type="text"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                placeholder="English (India), Hindi, Telugu"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#5483B3]/30 bg-slate-50 dark:bg-[#021024] text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#1D64C2]"
              />
            </div>

            {/* Audio Recording Area */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-[#7DA0CA] mb-2">
                Speech Audio Sample (15-30s)
              </label>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#021024] border border-dashed border-slate-300 dark:border-[#5483B3]/30 text-center space-y-3">
                {isRecording ? (
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-full bg-rose-500 text-white mx-auto flex items-center justify-center animate-ping">
                      <Mic className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-rose-500">Recording speech... {recordSeconds}s</p>
                    <p className="text-[11px] text-slate-500 dark:text-[#7DA0CA]">Read a paragraph clearly into your microphone.</p>
                  </div>
                ) : hasSample ? (
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-full bg-[#1D64C2]/20 text-[#C1E8FF] mx-auto flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-[#1D64C2] dark:text-[#C1E8FF]">Audio Sample Ready</p>
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
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-[#052659] text-slate-600 dark:text-[#7DA0CA] mx-auto flex items-center justify-center">
                      <Mic className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Provide 15-30 seconds of speech
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-[#7DA0CA]">Record live via mic or upload any audio file to Cloudinary.</p>
                    <div className="pt-1 flex flex-wrap items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={handleStartRecording}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-[#1D64C2] dark:text-white text-xs font-bold cursor-pointer hover:opacity-90 flex items-center gap-1"
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
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#052659] via-[#1D64C2] to-[#2563EB] hover:from-[#1D64C2] hover:to-[#3B82F6] text-white text-xs font-bold transition-all shadow-md shadow-[#1D64C2]/20 disabled:opacity-50 cursor-pointer"
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
                className="p-5 rounded-2xl bg-white dark:bg-[#052659]/30 border border-slate-200 dark:border-[#5483B3]/25 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-slate-950 dark:text-white">
                      {voice.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#1D64C2]/15 text-[#1D64C2] dark:text-[#C1E8FF] border border-[#5483B3]/40 font-mono">
                      {voice.provider === 'cartesia' ? 'Cartesia Sonic' : 'Sarvam AI'}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold capitalize bg-slate-100 dark:bg-[#052659]/50 text-slate-700 dark:text-[#7DA0CA]">
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
                    onClick={() => handlePlaySample(voice.id, voice.name)}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#052659]/50 dark:hover:bg-[#052659] text-slate-800 dark:text-slate-200 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                  >
                    {isPlaying === voice.id ? <Pause className="w-4 h-4 text-rose-500" /> : <Play className="w-4 h-4 text-[#1D64C2] dark:text-[#C1E8FF] fill-current" />}
                    <span>{isPlaying === voice.id ? 'Stop' : 'Listen Preview'}</span>
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
