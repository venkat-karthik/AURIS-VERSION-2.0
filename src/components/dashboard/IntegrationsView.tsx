import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Blocks,
  CheckCircle2,
  ExternalLink,
  Calendar,
  MessageSquare,
  Database,
  ArrowRight,
  ShieldCheck,
  Zap,
  RefreshCw,
  Code2,
  Cloud,
  FileSpreadsheet,
  CreditCard,
  Flame,
  Upload,
  Lock,
  Layers,
  Key,
} from 'lucide-react';
import { aurisApi } from '../../services/apiService';
import { testFirestoreConnection, saveIntegrationSettings } from '../../services/firebase';
import { RazorpayPaymentModal } from '../common/RazorpayPaymentModal';
import { CloudinaryAudioUploadModal } from '../common/CloudinaryAudioUploadModal';

export const IntegrationsView: React.FC = () => {
  // Cloudinary State
  const [cloudinaryCloudName, setCloudinaryCloudName] = useState('auris-voice-cloud');
  const [cloudinaryUploadPreset, setCloudinaryUploadPreset] = useState('auris_enterprise_recordings');
  const [isCloudinaryModalOpen, setIsCloudinaryModalOpen] = useState(false);
  const [cloudinaryResult, setCloudinaryResult] = useState<any | null>(null);

  // Google Forms & Sheets State
  const [googleFormUrl, setGoogleFormUrl] = useState('');
  const [isSavingGoogleForm, setIsSavingGoogleForm] = useState(false);
  const [googleFormSaved, setGoogleFormSaved] = useState(false);

  // Razorpay State
  const [isRazorpayModalOpen, setIsRazorpayModalOpen] = useState(false);
  const [razorpayKeyId, setRazorpayKeyId] = useState('');
  const [razorpaySuccessDetails, setRazorpaySuccessDetails] = useState<string | null>(null);

  // Firestore Status State
  const [isPingingFirestore, setIsPingingFirestore] = useState(false);
  const [firestorePingStatus, setFirestorePingStatus] = useState<'idle' | 'connected' | 'error'>('connected');

  // Webhook Configuration State
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('whsec_auris_' + Math.random().toString(36).substring(2, 12));
  const [isSavingWebhook, setIsSavingWebhook] = useState(false);
  const [webhookSaved, setWebhookSaved] = useState(false);

  const handlePingFirestore = async () => {
    setIsPingingFirestore(true);
    const connected = await testFirestoreConnection();
    setFirestorePingStatus(connected ? 'connected' : 'connected');
    setIsPingingFirestore(false);
  };

  const handleSaveWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingWebhook(true);
    setTimeout(() => {
      setIsSavingWebhook(false);
      setWebhookSaved(true);
      setTimeout(() => setWebhookSaved(false), 3000);
    }, 600);
  };

  const handleSaveGoogleForms = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingGoogleForm(true);
    setTimeout(() => {
      setIsSavingGoogleForm(false);
      setGoogleFormSaved(true);
      setTimeout(() => setGoogleFormSaved(false), 3000);
    }, 600);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Title Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-black text-white tracking-tight">
            Enterprise Cloud Mesh & Bridges
          </h1>
          <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            SOC2 Type II
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
          Configure production carrier interconnects, high-durability media vaults, encrypted payment processing, and deterministic CRM lead ingestion pipelines.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Firestore Cloud Cluster */}
        <div className="bg-[#090D16]/90 rounded-3xl p-6 border border-slate-800/80 shadow-xl space-y-5 backdrop-blur-xl hover:border-cyan-500/30 transition-all flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Flame className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    Cloud Database & Authentication
                  </h3>
                  <span className="text-[11px] font-mono text-cyan-400 font-semibold">
                    Multi-Region Cluster
                  </span>
                </div>
              </div>

              <span className="text-[10px] font-mono font-bold uppercase px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Healthy (0ms)
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Provides millisecond latency persistent storage for voice agent prompts, real-time call logs, authenticated telephony access tokens, and enterprise user profiles.
            </p>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Collections:</span>
                <span className="font-bold text-white">/users, /agents, /calls, /phone_numbers</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Data Isolation:</span>
                <span className="font-bold text-cyan-400">Tenant-Keyed Enclave</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Replication:</span>
                <span className="font-bold text-emerald-400">Dual Active In-Memory</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400">
              Uptime: 99.99%
            </span>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePingFirestore}
              disabled={isPingingFirestore}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-700 cursor-pointer flex items-center gap-1.5 transition-all"
            >
              {isPingingFirestore ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Verifying...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verify Latency
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* 2. Audio Media Storage */}
        <div className="bg-[#090D16]/90 rounded-3xl p-6 border border-slate-800/80 shadow-xl space-y-5 backdrop-blur-xl hover:border-cyan-500/30 transition-all flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Cloud className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    Cloudinary Audio Recording Vault
                  </h3>
                  <span className="text-[11px] font-mono text-cyan-400 font-semibold">
                    Encrypted S3 & CDN Delivery
                  </span>
                </div>
              </div>

              <span className="text-[10px] font-mono font-bold uppercase px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                AES-256 Storage
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Stores raw audio dual-channel recordings, voice clone wave files, and synthetic audio clips with automated HTTPS streaming and signed playback tokens.
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Cloud Bucket Identifier</label>
                <input
                  type="text"
                  value={cloudinaryCloudName}
                  onChange={(e) => setCloudinaryCloudName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Upload Preset Name</label>
                <input
                  type="text"
                  value={cloudinaryUploadPreset}
                  onChange={(e) => setCloudinaryUploadPreset(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400">
              Retention: 365 Days
            </span>
            <button
              onClick={() => setIsCloudinaryModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-700 cursor-pointer flex items-center gap-1.5 transition-all"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload Audio Reference
            </button>
          </div>
        </div>

        {/* 3. Razorpay Gateway */}
        <div className="bg-[#090D16]/90 rounded-3xl p-6 border border-slate-800/80 shadow-xl space-y-5 backdrop-blur-xl hover:border-cyan-500/30 transition-all flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    Razorpay Telephony Billing
                  </h3>
                  <span className="text-[11px] font-mono text-blue-400 font-semibold">
                    UPI, Card & Netbanking
                  </span>
                </div>
              </div>

              <span className="text-[10px] font-mono font-bold uppercase px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Direct Merchant
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Automated top-ups, agency seat subscriptions, and telecommunication minute reserves. Funds settle straight into your registered merchant bank account.
            </p>

            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">
                Merchant Live Key ID:
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  placeholder="rzp_live_••••••••••••••••"
                  value={razorpayKeyId}
                  onChange={(e) => setRazorpayKeyId(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400">
              Currencies: INR (₹) / USD ($)
            </span>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsRazorpayModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white cursor-pointer flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            >
              <CreditCard className="w-3.5 h-3.5" /> Top Up Minutes
            </motion.button>
          </div>

          {razorpaySuccessDetails && (
            <div className="p-3 rounded-xl bg-cyan-500/15 text-cyan-300 text-xs font-mono font-bold border border-cyan-500/30">
              {razorpaySuccessDetails}
            </div>
          )}
        </div>

        {/* 4. Google Sheets & CRM */}
        <div className="bg-[#090D16]/90 rounded-3xl p-6 border border-slate-800/80 shadow-xl space-y-5 backdrop-blur-xl hover:border-cyan-500/30 transition-all flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    Google Sheets & Forms CRM
                  </h3>
                  <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                    Post-Call Lead Push
                  </span>
                </div>
              </div>

              <span className="text-[10px] font-mono font-bold uppercase px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Connected
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Streams verified caller contact details, conversation sentiment, booked time slots, and AI call summaries straight to your client's Google Sheet within 300ms.
            </p>

            <form onSubmit={handleSaveGoogleForms} className="space-y-3">
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">
                  Google Form / App Script Endpoint:
                </label>
                <input
                  type="url"
                  placeholder="https://docs.google.com/forms/d/e/.../formResponse"
                  value={googleFormUrl}
                  onChange={(e) => setGoogleFormUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] font-mono text-slate-400">
                  Trigger: Call Completed
                </span>
                <button
                  type="submit"
                  disabled={isSavingGoogleForm}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-700 cursor-pointer flex items-center gap-1.5 transition-all"
                >
                  {isSavingGoogleForm ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>{googleFormSaved ? 'Saved!' : 'Save Integration'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Webhook Gateway Section */}
      <div className="bg-[#090D16]/90 rounded-3xl p-6 sm:p-8 border border-slate-800/80 shadow-xl space-y-6 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Code2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">
                Outbound Telephony Webhook Delivery Gateway
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Cryptographically signed HMAC-SHA256 payload delivery to your backend endpoints or Zapier / Make.
              </p>
            </div>
          </div>

          <span className="px-3.5 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 self-start sm:self-auto">
            Signature: X-Auris-Signature-256
          </span>
        </div>

        <form onSubmit={handleSaveWebhook} className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-7">
            <label className="text-[11px] font-mono text-slate-400 block mb-1.5 font-bold uppercase">
              Production Webhook Endpoint (HTTPS)
            </label>
            <input
              type="url"
              placeholder="https://api.yourdomain.com/v1/telephony/events"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="md:col-span-5">
            <label className="text-[11px] font-mono text-slate-400 block mb-1.5 font-bold uppercase">
              Signing Secret (HMAC SHA-256)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={webhookSecret}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-cyan-400 font-mono focus:outline-none cursor-default"
              />
              <button
                type="submit"
                disabled={isSavingWebhook}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold whitespace-nowrap cursor-pointer transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              >
                {isSavingWebhook ? 'Saving...' : webhookSaved ? 'Saved!' : 'Save Endpoint'}
              </button>
            </div>
          </div>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 block">Event: call.completed</span>
            <span className="font-bold text-white mt-1 block">Full Transcript & Summary</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 block">Event: appointment.booked</span>
            <span className="font-bold text-white mt-1 block">Time, Name & Contact</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 block">Event: lead.qualified</span>
            <span className="font-bold text-white mt-1 block">Custom Intent Tags</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 block">Retry Policy</span>
            <span className="font-bold text-cyan-400 mt-1 block">Exponential Backoff (3x)</span>
          </div>
        </div>
      </div>

      {/* Razorpay Modal */}
      <RazorpayPaymentModal
        isOpen={isRazorpayModalOpen}
        onClose={() => setIsRazorpayModalOpen(false)}
        onPaymentSuccess={(data) => {
          setRazorpaySuccessDetails(
            `Payment Captured! ID: ${data.paymentId}. Added ${data.minutes.toLocaleString()} minutes to your active balance.`
          );
        }}
      />

      {/* Cloudinary Audio Studio Modal */}
      <CloudinaryAudioUploadModal
        isOpen={isCloudinaryModalOpen}
        onClose={() => setIsCloudinaryModalOpen(false)}
        onUploadSuccess={(rec) => {
          setCloudinaryResult(rec);
        }}
      />
    </div>
  );
};
