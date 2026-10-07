import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Cloud,
  Mic,
  MicOff,
  Play,
  Pause,
  Trash2,
  CheckCircle2,
  Copy,
  ExternalLink,
  X,
  FileAudio,
  Radio,
  Sparkles,
  Download,
  RefreshCw,
  Volume2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface CloudinaryRecording {
  id: string;
  publicId: string;
  fileName: string;
  url: string;
  secureUrl: string;
  format: string;
  bytes: number;
  duration?: number;
  category?: string;
  agentName?: string;
  caller?: string;
  uploadedAt: string;
}

interface CloudinaryAudioUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess?: (recording: CloudinaryRecording) => void;
  defaultCategory?: 'voice_clone' | 'call_recording' | 'knowledge_base' | 'custom_audio';
  agentId?: string;
  agentName?: string;
}

export const CloudinaryAudioUploadModal: React.FC<CloudinaryAudioUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
  defaultCategory = 'custom_audio',
  agentId,
  agentName,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'record' | 'library'>('upload');
  const [category, setCategory] = useState<string>(defaultCategory);
  const [customTitle, setCustomTitle] = useState('');
  
  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [recentUpload, setRecentUpload] = useState<CloudinaryRecording | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<any>(null);

  // Library state
  const [recordings, setRecordings] = useState<CloudinaryRecording[]>([]);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Fetch recordings library
  const loadRecordings = async () => {
    setIsLoadingLibrary(true);
    try {
      const res = await fetch('/api/cloudinary/recordings');
      if (res.ok) {
        const data = await res.json();
        setRecordings(data);
      }
    } catch (err) {
      console.warn('Failed to load Cloudinary library', err);
    } finally {
      setIsLoadingLibrary(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadRecordings();
      setRecentUpload(null);
      setErrorMessage(null);
    }
  }, [isOpen]);

  // Handle file drop/selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|ogg|webm|m4a|aac)$/i)) {
        setErrorMessage('Please select a valid audio file (.mp3, .wav, .m4a, .ogg, .webm).');
        return;
      }
      setSelectedFile(file);
      setCustomTitle(file.name.replace(/\.[^/.]+$/, ''));
      setFilePreviewUrl(URL.createObjectURL(file));
      setErrorMessage(null);
    }
  };

  // Convert File/Blob to base64
  const fileToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Upload to Cloudinary API
  const handlePerformUpload = async (fileToUpload: File | Blob, fileName: string, durationEstimate: number) => {
    setIsUploading(true);
    setUploadProgress(15);
    setErrorMessage(null);

    try {
      const progressTimer = setInterval(() => {
        setUploadProgress((p) => (p < 85 ? p + 15 : p));
      }, 200);

      const base64Data = await fileToBase64(fileToUpload);
      setUploadProgress(70);

      const res = await fetch('/api/cloudinary/upload-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioData: base64Data,
          fileName: fileName.endsWith('.mp3') || fileName.endsWith('.wav') ? fileName : `${fileName}.mp3`,
          mimeType: fileToUpload.type || 'audio/mpeg',
          duration: durationEstimate,
          agentId,
          agentName,
          category,
          caller: 'Uploaded Studio Media',
        }),
      });

      clearInterval(progressTimer);
      setUploadProgress(100);

      if (!res.ok) {
        throw new Error(`Upload server responded with status: ${res.status}`);
      }

      const data = await res.json();
      if (data.recording) {
        setRecentUpload(data.recording);
        setRecordings((prev) => [data.recording, ...prev]);
        onUploadSuccess?.(data.recording);
      }
    } catch (err: any) {
      console.error('Cloudinary upload failure', err);
      setErrorMessage(err.message || 'Failed to upload audio to Cloudinary.');
    } finally {
      setIsUploading(false);
    }
  };

  // Start live microphone recording
  const handleStartRecording = async () => {
    setRecordedBlob(null);
    setRecordedAudioUrl(null);
    setErrorMessage(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedBlob(audioBlob);
        setRecordedAudioUrl(URL.createObjectURL(audioBlob));
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      setRecordDuration(0);

      recordTimerRef.current = setInterval(() => {
        setRecordDuration((d) => d + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone error:', err);
      setErrorMessage('Microphone access denied or unavailable: ' + err.message);
    }
  };

  // Stop recording
  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      clearInterval(recordTimerRef.current);
      setIsRecording(false);
    }
  };

  // Play audio in library
  const handleTogglePlay = (id: string, url: string) => {
    if (playingId === id) {
      audioPlayerRef.current?.pause();
      setPlayingId(null);
    } else {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.src = url;
        audioPlayerRef.current.play().catch((e) => console.warn('Audio play error:', e));
        setPlayingId(id);
      }
    }
  };

  // Delete recording from Cloudinary library
  const handleDeleteRecording = async (id: string) => {
    try {
      const res = await fetch(`/api/cloudinary/recordings/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setRecordings((prev) => prev.filter((r) => r.id !== id && r.publicId !== id));
      }
    } catch (err) {
      console.warn('Delete error', err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#021024]/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white dark:bg-[#052659] rounded-3xl border border-slate-200 dark:border-[#5483B3]/30 shadow-2xl max-w-2xl w-full overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Hidden HTML audio element for library playback */}
          <audio
            ref={audioPlayerRef}
            onEnded={() => setPlayingId(null)}
            className="hidden"
          />

          {/* Modal Header */}
          <div className="px-6 py-4 border-b border-slate-200 dark:border-[#5483B3]/25 flex items-center justify-between bg-slate-50/80 dark:bg-[#021024]/70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#1D64C2]/20 text-[#C1E8FF] flex items-center justify-center border border-[#1D64C2]/30">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Cloudinary Audio Studio
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#1D64C2]/20 text-[#1D64C2] dark:text-[#C1E8FF] border border-[#1D64C2]/40">
                    Dual-Track CDN
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-[#7DA0CA]">
                  Upload audio files or capture speech to archive on Cloudinary Audio Storage
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#021024]/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="px-6 pt-3 border-b border-slate-200 dark:border-[#5483B3]/25 flex gap-2">
            <button
              onClick={() => setActiveTab('upload')}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'upload'
                  ? 'border-[#1D64C2] text-[#1D64C2] dark:text-[#C1E8FF]'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-[#7DA0CA] dark:hover:text-white'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Audio File</span>
            </button>

            <button
              onClick={() => setActiveTab('record')}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'record'
                  ? 'border-[#1D64C2] text-[#1D64C2] dark:text-[#C1E8FF]'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-[#7DA0CA] dark:hover:text-white'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Record Live Speech</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('library');
                loadRecordings();
              }}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'library'
                  ? 'border-[#1D64C2] text-[#1D64C2] dark:text-[#C1E8FF]'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-[#7DA0CA] dark:hover:text-white'
              }`}
            >
              <FileAudio className="w-3.5 h-3.5" />
              <span>Cloudinary Library ({recordings.length})</span>
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold">
                {errorMessage}
              </div>
            )}

            {/* TAB 1: FILE UPLOAD */}
            {activeTab === 'upload' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-[#7DA0CA] mb-1">
                      Audio Asset Title
                    </label>
                    <input
                      type="text"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      placeholder="e.g. Inbound Agent Call Sample"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#5483B3]/30 bg-slate-50 dark:bg-[#021024] text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-[#7DA0CA] mb-1">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#5483B3]/30 bg-slate-50 dark:bg-[#021024] text-xs text-slate-900 dark:text-white"
                    >
                      <option value="custom_audio">Custom Audio / Voice Clip</option>
                      <option value="voice_clone">Voice Clone Training Sample</option>
                      <option value="call_recording">Telephony Call Recording</option>
                      <option value="knowledge_base">Knowledge Base Training Speech</option>
                    </select>
                  </div>
                </div>

                {/* Dropzone */}
                <div
                  className={`p-6 rounded-2xl border-2 border-dashed transition-all text-center space-y-3 cursor-pointer ${
                    selectedFile
                      ? 'border-[#1D64C2] bg-[#1D64C2]/10 dark:bg-[#021024]/60'
                      : 'border-slate-300 dark:border-[#5483B3]/30 hover:border-[#1D64C2] bg-slate-50/50 dark:bg-[#021024]/40'
                  }`}
                  onClick={() => document.getElementById('cloudinary-file-input')?.click()}
                >
                  <input
                    id="cloudinary-file-input"
                    type="file"
                    accept="audio/*,.mp3,.wav,.ogg,.webm,.m4a,.aac"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <div className="w-12 h-12 rounded-2xl bg-[#1D64C2]/20 text-[#C1E8FF] mx-auto flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>

                  {selectedFile ? (
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {selectedFile.name}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-[#7DA0CA] font-mono">
                        {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type || 'audio file'}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Drop audio file here or click to browse
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-[#7DA0CA] mt-0.5">
                        Supports MP3, WAV, M4A, OGG, AAC, WebM up to 100MB
                      </p>
                    </div>
                  )}
                </div>

                {/* File Audio Preview */}
                {filePreviewUrl && (
                  <div className="p-3 rounded-2xl bg-slate-100 dark:bg-[#021024]/60 border border-slate-200 dark:border-[#5483B3]/25 flex items-center gap-3">
                    <Volume2 className="w-4 h-4 text-[#C1E8FF] shrink-0" />
                    <audio controls src={filePreviewUrl} className="w-full h-8" />
                  </div>
                )}

                {/* Upload Action Button */}
                <button
                  type="button"
                  disabled={!selectedFile || isUploading}
                  onClick={() =>
                    selectedFile &&
                    handlePerformUpload(selectedFile, customTitle || selectedFile.name, 30.0)
                  }
                  className="w-full py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-[#052659] via-[#1D64C2] to-[#2563EB] hover:from-[#1D64C2] hover:to-[#3B82F6] text-white transition-all shadow-md shadow-[#1D64C2]/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Uploading to Cloudinary CDN ({uploadProgress}%)...</span>
                    </>
                  ) : (
                    <>
                      <Cloud className="w-4 h-4" />
                      <span>Upload & Archive to Cloudinary</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* TAB 2: LIVE SPEECH RECORDING */}
            {activeTab === 'record' && (
              <div className="space-y-4 text-center">
                <div className="p-8 rounded-3xl bg-slate-50 dark:bg-[#021024]/60 border border-slate-200 dark:border-[#5483B3]/30 space-y-4">
                  {isRecording ? (
                    <div className="space-y-3">
                      <div className="w-16 h-16 rounded-full bg-rose-500 text-white mx-auto flex items-center justify-center animate-ping">
                        <Mic className="w-8 h-8" />
                      </div>
                      <div className="text-sm font-black text-rose-500 font-mono">
                        Recording Speech... 00:{recordDuration.toString().padStart(2, '0')}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-[#7DA0CA]">
                        Speak clearly into your microphone to create an audio sample.
                      </p>
                      <button
                        type="button"
                        onClick={handleStopRecording}
                        className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md cursor-pointer transition-all"
                      >
                        Stop Recording
                      </button>
                    </div>
                  ) : recordedAudioUrl ? (
                    <div className="space-y-4">
                      <div className="w-14 h-14 rounded-full bg-[#1D64C2]/20 text-[#C1E8FF] mx-auto flex items-center justify-center border border-[#1D64C2]/40">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          Voice Recording Captured ({recordDuration}s)
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-[#7DA0CA]">
                          Listen to verify quality before archiving to Cloudinary.
                        </p>
                      </div>

                      <div className="max-w-md mx-auto">
                        <audio controls src={recordedAudioUrl} className="w-full h-8" />
                      </div>

                      <div className="flex items-center justify-center gap-2 pt-2">
                        <button
                          type="button"
                          onClick={handleStartRecording}
                          className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-[#7DA0CA] hover:bg-slate-100 dark:hover:bg-[#021024]/60 cursor-pointer"
                        >
                          Record Again
                        </button>

                        <button
                          type="button"
                          disabled={isUploading}
                          onClick={() =>
                            recordedBlob &&
                            handlePerformUpload(
                              recordedBlob,
                              customTitle || `mic_recording_${Date.now()}`,
                              recordDuration
                            )
                          }
                          className="px-6 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#052659] via-[#1D64C2] to-[#2563EB] hover:from-[#1D64C2] hover:to-[#3B82F6] text-white shadow-md shadow-[#1D64C2]/20 cursor-pointer flex items-center gap-1.5"
                        >
                          {isUploading ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Uploading...
                            </>
                          ) : (
                            <>
                              <Cloud className="w-3.5 h-3.5" /> Upload to Cloudinary
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-[#021024] text-slate-600 dark:text-[#C1E8FF] mx-auto flex items-center justify-center border border-[#5483B3]/30">
                        <Mic className="w-8 h-8 text-[#C1E8FF]" />
                      </div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        Record 15 to 60 Seconds of Clean Audio
                      </div>
                      <p className="text-xs text-slate-500 dark:text-[#7DA0CA] max-w-sm mx-auto">
                        Your browser will capture your microphone stream and upload it directly to Cloudinary Audio CDN.
                      </p>
                      <button
                        type="button"
                        onClick={handleStartRecording}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#052659] via-[#1D64C2] to-[#2563EB] hover:from-[#1D64C2] hover:to-[#3B82F6] text-white text-xs font-bold shadow-md shadow-[#1D64C2]/20 cursor-pointer transition-all"
                      >
                        Start Microphone Recording
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: CLOUDINARY RECORDINGS LIBRARY */}
            {activeTab === 'library' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#7DA0CA] pb-1">
                  <span>Archived Audio Files ({recordings.length})</span>
                  <button
                    onClick={loadRecordings}
                    className="flex items-center gap-1 text-[#1D64C2] dark:text-[#C1E8FF] hover:underline cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLoadingLibrary ? 'animate-spin' : ''}`} /> Refresh
                  </button>
                </div>

                {recordings.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 dark:text-[#7DA0CA] text-xs">
                    No audio recordings archived on Cloudinary yet.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {recordings.map((rec) => (
                      <div
                        key={rec.id || rec.publicId}
                        className="p-3 rounded-2xl border border-slate-200 dark:border-[#5483B3]/25 bg-white dark:bg-[#021024]/60 flex items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-[#1D64C2]/50 transition-all"
                      >
                        <button
                          type="button"
                          onClick={() => handleTogglePlay(rec.id, rec.url || rec.secureUrl)}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                            playingId === rec.id
                              ? 'bg-rose-500 text-white'
                              : 'bg-[#1D64C2]/20 text-[#C1E8FF] hover:bg-[#1D64C2] hover:text-white'
                          }`}
                        >
                          {playingId === rec.id ? (
                            <Pause className="w-4 h-4 fill-current" />
                          ) : (
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {rec.fileName}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-[#7DA0CA] font-mono flex items-center gap-2 mt-0.5">
                            <span>{rec.format.toUpperCase()}</span>
                            <span>•</span>
                            <span>{rec.duration ? `${rec.duration}s` : 'audio'}</span>
                            <span>•</span>
                            <span className="text-[#C1E8FF] truncate max-w-[140px]">
                              {rec.publicId}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => copyToClipboard(rec.secureUrl)}
                            title="Copy Cloudinary CDN URL"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#C1E8FF] hover:bg-slate-100 dark:hover:bg-[#052659] cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          <a
                            href={rec.secureUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open in Cloudinary CDN"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#C1E8FF] hover:bg-slate-100 dark:hover:bg-[#052659] cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          <button
                            type="button"
                            onClick={() => handleDeleteRecording(rec.id)}
                            title="Delete Audio"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-[#052659] cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Success Upload Card */}
            {recentUpload && (
              <div className="p-4 rounded-2xl bg-[#021024]/70 border border-[#1D64C2]/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#C1E8FF]" />
                    <span className="text-xs font-bold text-[#C1E8FF]">
                      Successfully Archived to Cloudinary Audio CDN!
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#C1E8FF]">
                    200 OK
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-white dark:bg-[#052659] border border-slate-200 dark:border-[#5483B3]/30 flex items-center justify-between text-[11px] font-mono">
                  <span className="truncate text-slate-600 dark:text-slate-300 max-w-sm">
                    {recentUpload.secureUrl}
                  </span>
                  <button
                    onClick={() => copyToClipboard(recentUpload.secureUrl)}
                    className="px-2 py-1 rounded bg-[#1D64C2] text-white text-[10px] font-bold cursor-pointer shrink-0 ml-2"
                  >
                    {copiedUrl ? 'Copied!' : 'Copy CDN URL'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-3.5 border-t border-slate-200 dark:border-[#5483B3]/25 bg-slate-50/60 dark:bg-[#021024]/70 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-500 dark:text-[#7DA0CA]">
              Cloudinary Media CDN • Opus / MP3 Compression
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl font-bold text-xs bg-slate-200 hover:bg-slate-300 dark:bg-[#052659] dark:hover:bg-[#021024] text-slate-800 dark:text-white border border-[#5483B3]/30 cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
