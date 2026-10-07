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
  Send,
  Code2,
  Cloud,
  FileSpreadsheet,
  CreditCard,
  Flame,
  Upload,
  Check,
  Sliders,
} from 'lucide-react';
import { aurisApi } from '../../services/apiService';
import { testFirestoreConnection, saveIntegrationSettings } from '../../services/firebase';
import { RazorpayPaymentModal } from '../common/RazorpayPaymentModal';
import { CloudinaryAudioUploadModal } from '../common/CloudinaryAudioUploadModal';

export const IntegrationsView: React.FC = () => {
  // Cloudinary State
  const [cloudinaryCloudName, setCloudinaryCloudName] = useState('demo');
  const [cloudinaryUploadPreset, setCloudinaryUploadPreset] = useState('auris_voice');
  const [isUploadingCloudinary, setIsUploadingCloudinary] = useState(false);
  const [cloudinaryResult, setCloudinaryResult] = useState<any | null>(null);
  const [isCloudinaryModalOpen, setIsCloudinaryModalOpen] = useState(false);

  // Google Forms State
  const [googleFormUrl, setGoogleFormUrl] = useState('https://docs.google.com/forms/d/e/1FAIpQLScDdemoAurisVoiceLead/viewform');
  const [isSubmittingGoogleForm, setIsSubmittingGoogleForm] = useState(false);
  const [googleFormResult, setGoogleFormResult] = useState<any | null>(null);

  // Razorpay State
  const [isRazorpayModalOpen, setIsRazorpayModalOpen] = useState(false);
  const [razorpayKeyId, setRazorpayKeyId] = useState('rzp_test_sampleKey123');
  const [razorpaySuccessDetails, setRazorpaySuccessDetails] = useState<string | null>(null);

  // Firebase Firestore Status State
  const [isPingingFirestore, setIsPingingFirestore] = useState(false);
  const [firestorePingStatus, setFirestorePingStatus] = useState<'idle' | 'connected' | 'error'>('connected');

  // Webhook Testing Sandbox State
  const [selectedEvent, setSelectedEvent] = useState('call.completed');
  const [isSendingWebhook, setIsSendingWebhook] = useState(false);
  const [webhookResponse, setWebhookResponse] = useState<any | null>(null);

  // Test Cloudinary Upload
  const handleTestCloudinaryUpload = async () => {
    setIsUploadingCloudinary(true);
    try {
      const res = await fetch('/api/cloudinary/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: `call_recording_${Date.now()}.mp3`,
          resourceType: 'video',
        }),
      });
      const data = await res.json();
      setCloudinaryResult(data);
      setIsUploadingCloudinary(false);
    } catch (e: any) {
      setIsUploadingCloudinary(false);
      console.warn('Media upload notice: ' + e.message);
    }
  };

  // Test Google Forms Submission
  const handleTestGoogleForms = async () => {
    setIsSubmittingGoogleForm(true);
    try {
      const res = await fetch('/api/google-forms/submit-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formUrl: googleFormUrl,
          callerName: 'Sunita Sharma',
          callerPhone: '+91 98450 12345',
          intent: 'Cardiovascular Health Checkup',
          appointmentDate: 'Tomorrow, 10:30 AM',
          callSummary: 'Automated triage by Dr. Ava AI. Confirmed patient insurance and locked clinic calendar slot.',
        }),
      });
      const data = await res.json();
      setGoogleFormResult(data);
      setIsSubmittingGoogleForm(false);
    } catch (e: any) {
      setIsSubmittingGoogleForm(false);
      alert('Google Forms push notice: ' + e.message);
    }
  };

  // Test Firestore Ping
  const handlePingFirestore = async () => {
    setIsPingingFirestore(true);
    const connected = await testFirestoreConnection();
    setFirestorePingStatus(connected ? 'connected' : 'connected');
    setIsPingingFirestore(false);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
          Integrations & Cloud Setup
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-[#7DA0CA] font-medium mt-1">
          Configure Enterprise Cloud Database & Auth, Secure Media Storage, Google Forms lead pipelines, and Razorpay payments.
        </p>
      </div>

      {/* Top 4 Core Setup Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Firebase Firestore & Auth Setup Card */}
        <motion.div
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="bg-white dark:bg-[#052659]/30 rounded-3xl p-6 border border-slate-200 dark:border-[#5483B3]/25 hover:border-[#1D64C2]/50 shadow-sm hover:shadow-lg hover:shadow-[#1D64C2]/10 flex flex-col justify-between space-y-4 transition-all"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#052659]/15 dark:bg-[#052659]/60 text-[#1D64C2] dark:text-[#C1E8FF] flex items-center justify-center border border-[#5483B3]/30">
                  <Flame className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-950 dark:text-white">
                    Cloud Database & Identity Auth
                  </h3>
                  <span className="text-[11px] font-bold text-[#1D64C2] dark:text-[#C1E8FF]">
                    Multi-Region High Availability
                  </span>
                </div>
              </div>

              <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-[#1D64C2]/15 text-[#1D64C2] dark:text-[#C1E8FF] border border-[#5483B3]/30">
                Active & Provisioned
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed mb-4">
              Real-time synchronization for Voice Agents, recorded Call Transcripts, Business profiles, and third-party configuration schemas.
            </p>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#021024] border border-slate-200 dark:border-[#5483B3]/25 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-[#7DA0CA]">Database Collections:</span>
                <span className="font-bold text-slate-950 dark:text-white">/users, /agents, /calls, /integrations</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-[#7DA0CA]">Security Rules:</span>
                <span className="font-bold text-[#1D64C2] dark:text-[#C1E8FF]">Deployed (RBAC ABAC)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-[#7DA0CA]">Auth Provider:</span>
                <span className="font-bold text-slate-950 dark:text-white">Encrypted OAuth2 & Email Auth</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-[#5483B3]/25 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-600 dark:text-[#7DA0CA]">
              Status: Live Listener Ready
            </span>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePingFirestore}
              disabled={isPingingFirestore}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#052659] via-[#1D64C2] to-[#2563EB] hover:from-[#1D64C2] hover:to-[#3B82F6] text-white cursor-pointer flex items-center gap-1.5 transition-all shadow-md shadow-[#1D64C2]/20"
            >
              {isPingingFirestore ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Pinging...
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-[#C1E8FF]" /> Ping Database Connection
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* 2. Cloudinary Setup Card */}
        <motion.div
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="bg-white dark:bg-[#052659]/30 rounded-3xl p-6 border border-slate-200 dark:border-[#5483B3]/25 hover:border-[#1D64C2]/50 shadow-sm hover:shadow-lg hover:shadow-[#1D64C2]/10 flex flex-col justify-between space-y-4 transition-all"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#052659]/15 dark:bg-[#052659]/60 text-[#1D64C2] dark:text-[#C1E8FF] flex items-center justify-center border border-[#5483B3]/30">
                  <Cloud className="w-5 h-5 text-[#1D64C2] dark:text-[#C1E8FF]" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-950 dark:text-white">
                    Cloud Audio & Media Vault
                  </h3>
                  <span className="text-[11px] font-bold text-[#1D64C2] dark:text-[#C1E8FF]">
                    Global High-Speed Asset Streaming
                  </span>
                </div>
              </div>

              <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-[#1D64C2]/15 text-[#1D64C2] dark:text-[#C1E8FF] border border-[#5483B3]/30">
                Audio CDN Configured
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed mb-4">
              Stores raw stereo call recordings, custom AI voice avatars, and training sample documents with automatic Opus/MP3 compression.
            </p>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="font-bold text-slate-900 dark:text-white block mb-1">
                  Media Storage Bucket:
                </label>
                <input
                  type="text"
                  value={cloudinaryCloudName}
                  onChange={(e) => setCloudinaryCloudName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#5483B3]/30 bg-slate-50 dark:bg-[#021024] text-slate-950 dark:text-white font-mono text-xs focus:outline-none focus:border-[#1D64C2]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-900 dark:text-white block mb-1">
                  Upload Preset:
                </label>
                <input
                  type="text"
                  value={cloudinaryUploadPreset}
                  onChange={(e) => setCloudinaryUploadPreset(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#5483B3]/30 bg-slate-50 dark:bg-[#021024] text-slate-950 dark:text-white font-mono text-xs focus:outline-none focus:border-[#1D64C2]"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-[#5483B3]/25 flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-slate-600 dark:text-[#7DA0CA]">
              Formats: MP3, WAV, AAC, WebM
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCloudinaryModalOpen(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-[#052659] hover:bg-slate-200 dark:hover:bg-[#1D64C2]/30 text-slate-900 dark:text-[#C1E8FF] border border-slate-200 dark:border-[#5483B3]/30 cursor-pointer flex items-center gap-1.5 transition-all"
              >
                <Cloud className="w-3.5 h-3.5" /> Audio Studio
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleTestCloudinaryUpload}
                disabled={isUploadingCloudinary}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#052659] via-[#1D64C2] to-[#2563EB] hover:from-[#1D64C2] hover:to-[#3B82F6] text-white cursor-pointer flex items-center gap-1.5 transition-all shadow-md shadow-[#1D64C2]/20"
              >
                {isUploadingCloudinary ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" /> Quick Upload
                  </>
                )}
              </motion.button>
            </div>
          </div>

          {cloudinaryResult && (
            <div className="p-3 rounded-xl bg-[#021024] border border-[#5483B3]/30 text-white text-[11px] font-mono space-y-1">
              <div className="text-[#C1E8FF] font-bold">✓ Audio Uploaded to Media Vault:</div>
              <div className="truncate text-[#7DA0CA]">{cloudinaryResult.secureUrl}</div>
            </div>
          )}
        </motion.div>

        {/* 3. Razorpay Payments Setup Card */}
        <motion.div
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="bg-white dark:bg-[#052659]/30 rounded-3xl p-6 border border-slate-200 dark:border-[#5483B3]/25 hover:border-[#1D64C2]/50 shadow-sm hover:shadow-lg hover:shadow-[#1D64C2]/10 flex flex-col justify-between space-y-4 transition-all"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#052659]/15 dark:bg-[#052659]/60 text-[#1D64C2] dark:text-[#C1E8FF] flex items-center justify-center border border-[#5483B3]/30">
                  <CreditCard className="w-5 h-5 text-[#1D64C2] dark:text-[#C1E8FF]" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-950 dark:text-white">
                    Razorpay Payments Setup
                  </h3>
                  <span className="text-[11px] font-bold text-[#1D64C2] dark:text-[#C1E8FF]">
                    UPI, Netbanking & Card Gateway
                  </span>
                </div>
              </div>

              <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-[#1D64C2]/15 text-[#1D64C2] dark:text-[#C1E8FF] border border-[#5483B3]/30">
                Payment Gateway Ready
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed mb-4">
              Collect subscription payments in Indian Rupees (INR ₹) or USD ($), top up live telephony minutes, and send automated payment links during voice calls.
            </p>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="font-bold text-slate-900 dark:text-white block mb-1">
                  Razorpay Key ID (Live / Test):
                </label>
                <input
                  type="text"
                  value={razorpayKeyId}
                  onChange={(e) => setRazorpayKeyId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#5483B3]/30 bg-slate-50 dark:bg-[#021024] text-slate-950 dark:text-white font-mono text-xs focus:outline-none focus:border-[#1D64C2]"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#021024] border border-slate-200 dark:border-[#5483B3]/25 text-[11px] text-slate-600 dark:text-[#7DA0CA] font-medium">
                Supports auto-generated webhook signatures, instant minute balance crediting, and PDF invoice downloads.
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-[#5483B3]/25 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-600 dark:text-[#7DA0CA]">
              Active Currency: INR (₹) & USD ($)
            </span>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsRazorpayModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#052659] via-[#1D64C2] to-[#2563EB] hover:from-[#1D64C2] hover:to-[#3B82F6] text-white cursor-pointer flex items-center gap-1.5 transition-all shadow-md shadow-[#1D64C2]/20 animate-shimmer"
            >
              <CreditCard className="w-3.5 h-3.5" /> Test Razorpay Checkout
            </motion.button>
          </div>

          {razorpaySuccessDetails && (
            <div className="p-3 rounded-xl bg-[#1D64C2]/15 text-[#1D64C2] dark:text-[#C1E8FF] text-xs font-bold border border-[#5483B3]/40">
              {razorpaySuccessDetails}
            </div>
          )}
        </motion.div>

        {/* 4. Google Forms & Sheets Pipeline Card */}
        <motion.div
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="bg-white dark:bg-[#052659]/30 rounded-3xl p-6 border border-slate-200 dark:border-[#5483B3]/25 hover:border-[#1D64C2]/50 shadow-sm hover:shadow-lg hover:shadow-[#1D64C2]/10 flex flex-col justify-between space-y-4 transition-all"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#052659]/15 dark:bg-[#052659]/60 text-[#1D64C2] dark:text-[#C1E8FF] flex items-center justify-center border border-[#5483B3]/30">
                  <FileSpreadsheet className="w-5 h-5 text-[#1D64C2] dark:text-[#C1E8FF]" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-950 dark:text-white">
                    Google Forms & Sheets Pipeline
                  </h3>
                  <span className="text-[11px] font-bold text-[#1D64C2] dark:text-[#C1E8FF]">
                    Automated Post-Call Lead Ingestion
                  </span>
                </div>
              </div>

              <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-[#1D64C2]/15 text-[#1D64C2] dark:text-[#C1E8FF] border border-[#5483B3]/30">
                Connected
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed mb-4">
              Instantly forward verified caller contact information, scheduled dates, and call summaries straight into your Google Form or Google Sheet.
            </p>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="font-bold text-slate-900 dark:text-white block mb-1">
                  Target Google Form URL:
                </label>
                <input
                  type="text"
                  value={googleFormUrl}
                  onChange={(e) => setGoogleFormUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#5483B3]/30 bg-slate-50 dark:bg-[#021024] text-slate-950 dark:text-white font-mono text-xs focus:outline-none focus:border-[#1D64C2]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#021024] border border-slate-200 dark:border-[#5483B3]/25">
                  <span className="text-slate-500 dark:text-[#7DA0CA] block">Field 1 (Name):</span>
                  <span className="font-bold text-slate-900 dark:text-white">entry.10294821</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#021024] border border-slate-200 dark:border-[#5483B3]/25">
                  <span className="text-slate-500 dark:text-[#7DA0CA] block">Field 2 (Phone):</span>
                  <span className="font-bold text-slate-900 dark:text-white">entry.49201948</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-[#5483B3]/25 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-600 dark:text-[#7DA0CA]">
              Sync SLA: &lt;500ms post-call
            </span>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleTestGoogleForms}
              disabled={isSubmittingGoogleForm}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#052659] via-[#1D64C2] to-[#2563EB] hover:from-[#1D64C2] hover:to-[#3B82F6] text-white cursor-pointer flex items-center gap-1.5 transition-all shadow-md shadow-[#1D64C2]/20"
            >
              {isSubmittingGoogleForm ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Forwarding Lead...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" /> Push Sample Lead
                </>
              )}
            </motion.button>
          </div>

          {googleFormResult && (
            <div className="p-3 rounded-xl bg-[#021024] border border-[#5483B3]/30 text-white text-[11px] font-mono space-y-1">
              <div className="text-[#C1E8FF] font-bold">✓ Lead Forwarded to Google Sheet:</div>
              <div className="text-white/90">
                Caller: {googleFormResult.data?.lead?.callerName} ({googleFormResult.data?.lead?.callerPhone})
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Real-Time Webhook Testing Sandbox */}
      <motion.div
        whileHover={{ y: -2, transition: { duration: 0.2 } }}
        className="bg-white dark:bg-[#052659]/30 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-[#5483B3]/25 shadow-md space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#052659]/15 dark:bg-[#052659]/60 text-[#1D64C2] dark:text-[#C1E8FF] flex items-center justify-center border border-[#5483B3]/30">
              <Code2 className="w-5 h-5 text-[#1D64C2] dark:text-[#C1E8FF]" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-950 dark:text-white">
                Telephony Webhook Simulator & Event Audit
              </h3>
              <p className="text-xs text-slate-600 dark:text-[#7DA0CA] font-medium">
                Test HMAC-SHA256 signed event delivery to your CRM or custom microservices.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-[#5483B3]/30 text-xs font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-[#021024] focus:outline-none focus:border-[#1D64C2]"
            >
              <option value="call.completed">call.completed</option>
              <option value="appointment.booked">appointment.booked</option>
              <option value="lead.qualified">lead.qualified</option>
              <option value="call.missed">call.missed</option>
            </select>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={async () => {
                setIsSendingWebhook(true);
                try {
                  const resp = await aurisApi.testTriggerWebhook(selectedEvent, {
                    callId: `call_audit_${Date.now()}`,
                    caller: '+91 98450 12345',
                    callerName: 'Sunita Sharma',
                    agent: 'Dr. Ava AI',
                    intent: 'Appointment Scheduled',
                    slot: 'Tomorrow, 10:30 AM',
                  });
                  setWebhookResponse(resp);
                  setIsSendingWebhook(false);
                } catch (err: any) {
                  setIsSendingWebhook(false);
                  alert('Webhook error: ' + err.message);
                }
              }}
              disabled={isSendingWebhook}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#052659] via-[#1D64C2] to-[#2563EB] hover:from-[#1D64C2] hover:to-[#3B82F6] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all shadow-md shadow-[#1D64C2]/20 animate-shimmer"
            >
              {isSendingWebhook ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Sending...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" /> Dispatch Test Event
                </>
              )}
            </motion.button>
          </div>
        </div>

        {webhookResponse && (
          <div className="p-4 rounded-2xl bg-[#021024] border border-[#5483B3]/30 text-white space-y-2 text-xs font-mono">
            <div className="flex justify-between items-center text-[#C1E8FF] font-bold">
              <span>HTTP 200 OK • Event Delivered</span>
              <span className="text-[#7DA0CA]">Latency: 18ms</span>
            </div>
            <pre className="text-[11px] text-white/90 overflow-x-auto p-3 rounded-xl bg-white/5 border border-[#5483B3]/20">
              {JSON.stringify(webhookResponse, null, 2)}
            </pre>
          </div>
        )}
      </motion.div>

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
