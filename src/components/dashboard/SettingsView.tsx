import React, { useState, useEffect } from 'react';
import { Business, User } from '../../types';
import { aurisApi } from '../../services/apiService';
import {
  Building,
  Key,
  Shield,
  Save,
  CheckCircle2,
  Copy,
  Cloud,
  Radio,
  Phone,
  Sparkles,
  Check,
  ExternalLink,
  Cpu,
  Lock,
} from 'lucide-react';

interface SettingsViewProps {
  business: Business;
  currentUser: User | null;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ business, currentUser }) => {
  const [bizName, setBizName] = useState(business?.name || 'Auris Voice AI Cloud');
  const [timezone, setTimezone] = useState(business?.timezone || 'Asia/Kolkata (IST)');
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  // Platform Telephony Operating Mode Switch (Option A: BYOK vs Option B: Managed)
  const [telephonyMode, setTelephonyMode] = useState<'managed' | 'byok'>('managed');
  const [plivoAuthId, setPlivoAuthId] = useState('');
  const [plivoAuthToken, setPlivoAuthToken] = useState('');
  const [sarvamApiKey, setSarvamApiKey] = useState('');
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [callerId, setCallerId] = useState('+918065534512');
  const [byokStatus, setByokStatus] = useState<any>(null);

  useEffect(() => {
    aurisApi.getTelephonyMode().then((data) => {
      setTelephonyMode(data.telephonyMode || 'managed');
      setCallerId(data.plivoCallerId || '+918065534512');
      setByokStatus(data.byokConfigured);
    }).catch(() => {});
  }, []);

  const webhookUrl = 'https://api.auris.ai/v1/webhooks/voice-events';

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await aurisApi.updateTelephonyMode({
        telephonyMode,
        byokCredentials: {
          plivoAuthId: plivoAuthId || undefined,
          plivoAuthToken: plivoAuthToken || undefined,
          sarvamApiKey: sarvamApiKey || undefined,
          openaiApiKey: openaiApiKey || undefined,
          callerId: callerId || undefined,
        },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      alert(err.message || 'Failed to save settings');
    }
  };

  const integrations = [
    {
      name: 'Auris Ultra-Low Latency Speech Mesh',
      envVar: 'SPEECH_SYNTHESIS_API_KEY',
      purpose: 'Ultra-low latency (<100ms) conversational voice synthesis (Despina, Barbershop, Katie)',
      status: 'Connected',
      type: 'Voice Synthesis Engine',
      icon: Sparkles,
      color: 'blue',
    },
    {
      name: 'Auris Indic Regional Language AI',
      envVar: 'INDIC_VOICE_API_KEY',
      purpose: 'Native Indian language conversational models (Telugu, Hindi, Tamil, Kannada, English)',
      status: 'Connected',
      type: 'Regional Language AI',
      icon: Radio,
      color: 'sky',
    },
    {
      name: 'Cloud Media Storage & Call Audio Vault',
      envVar: 'MEDIA_STORAGE_BUCKET / API_SECRET',
      purpose: 'Persistent cloud storage for exact human & AI call recordings, voice samples, and knowledge docs',
      status: 'Configured',
      type: 'Audio Archive',
      icon: Cloud,
      color: 'purple',
    },
    {
      name: 'India Telephony Virtual Carrier Trunk',
      envVar: 'TELEPHONY_CARRIER_AUTH_TOKEN',
      purpose: 'Dedicated Indian (+91) virtual phone numbers, inbound receptionist trunks, and local CLI routing',
      status: 'Active',
      type: 'Telecom Carrier Mesh',
      icon: Phone,
      color: 'amber',
    },
    {
      name: 'Tenant Database & Authentication',
      envVar: 'firebase-applet-config.json',
      purpose: 'Multi-tenant database persistence and Google Workspace Authentication',
      status: 'Provisioned',
      type: 'Identity & Database',
      icon: Shield,
      color: 'blue',
    },
    {
      name: 'Carrier Upstream Core Gateway',
      envVar: 'CARRIER_GATEWAY_API_KEY',
      purpose: 'Upstream voice agent lifecycle, live call dispatching, and agent metadata synchronization',
      status: 'Connected',
      type: 'Carrier Telephony Layer',
      icon: Key,
      color: 'blue',
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight">Workspace Settings</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage your organization details, external API keys, telephony credentials, and Cloudinary media storage.
        </p>
      </div>

      {saved && (
        <div className="p-3.5 rounded-xl bg-[#6366F1]/15 border border-[#334155]/40 text-[#6366F1] dark:text-[#818CF8] text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#6366F1] dark:text-[#818CF8]" />
          <span>Workspace preferences saved successfully.</span>
        </div>
      )}

      {/* External Integrations & Keys Audit */}
      <div className="bg-white dark:bg-[#0F1219]/30 rounded-3xl p-6 border border-slate-200 dark:border-[#334155]/25 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-[#6366F1] dark:text-[#818CF8]" />
            <h2 className="text-base font-black text-slate-950 dark:text-white">External Integrations & Keys</h2>
          </div>
          <span className="text-[11px] font-mono text-[#6366F1] dark:text-[#818CF8] bg-[#6366F1]/15 px-2.5 py-1 rounded-full font-bold border border-[#334155]/40">
            6 of 6 Services Active
          </span>
        </div>

        <p className="text-xs text-slate-500 dark:text-[#94A3B8] leading-relaxed">
          These external platforms power your voice stack, speech recognition, media archiving, and Indian telecom routing.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {integrations.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-[#090B10] border border-slate-200/90 dark:border-[#334155]/25 flex flex-col justify-between space-y-2"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-white dark:bg-[#0F1219] border border-slate-200 dark:border-[#334155]/30 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-[#6366F1] dark:text-[#818CF8]" />
                      </div>
                      <span className="text-xs font-bold text-slate-950 dark:text-white">{item.name}</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-[#6366F1] dark:text-[#818CF8] bg-[#6366F1]/15 px-2 py-0.5 rounded-full border border-[#334155]/40">
                      {item.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-[#94A3B8] leading-relaxed">
                    {item.purpose}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-200/60 dark:border-[#334155]/20 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Env: {item.envVar}</span>
                  <span className="text-[#6366F1] dark:text-[#818CF8] font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Ready
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Operating & Telephony Mode Switch */}
        <div className="bg-white dark:bg-[#0F1219]/30 rounded-3xl p-6 border border-slate-200 dark:border-[#334155]/25 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-[#6366F1] dark:text-[#818CF8]" />
              <h2 className="text-base font-black text-slate-950 dark:text-white">Telephony Architecture & Billing Mode</h2>
            </div>
            <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-full bg-[#6366F1]/15 text-[#6366F1] border border-[#6366F1]/30">
              {telephonyMode === 'managed' ? 'Option B: Managed Mesh' : 'Option A: BYOK Keys'}
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Choose whether your workspace uses the pre-configured Auris Managed Carrier Mesh or your own custom telecom and AI credentials.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Option B: Managed */}
            <div
              onClick={() => setTelephonyMode('managed')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                telephonyMode === 'managed'
                  ? 'border-[#6366F1] bg-[#6366F1]/10 dark:bg-[#6366F1]/15'
                  : 'border-slate-800 bg-slate-900/40 opacity-70 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#6366F1]" />
                  Auris Managed Mesh (Option B)
                </span>
                <span className="text-[10px] font-mono font-bold bg-[#6366F1]/20 text-[#6366F1] px-2 py-0.5 rounded-full">
                  Pay-As-You-Go
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Zero infrastructure setup. Calls route through Auris shared carrier trunks (+91 80 6553 4512) and managed Sarvam Indic speech models. Deducts ₹5/min from wallet balance.
              </p>
            </div>

            {/* Option A: BYOK */}
            <div
              onClick={() => setTelephonyMode('byok')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                telephonyMode === 'byok'
                  ? 'border-[#6366F1] bg-[#6366F1]/10 dark:bg-[#6366F1]/15'
                  : 'border-slate-800 bg-slate-900/40 opacity-70 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-[#6366F1]" />
                  Bring Your Own Keys (Option A)
                </span>
                <span className="text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">
                  BYOK Enterprise
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Direct carrier routing. Enter your own Plivo Auth ID and Sarvam/OpenAI API keys. Calls route 100% through your private accounts with 0% platform telecom markup.
              </p>
            </div>
          </div>

          {/* BYOK Configuration Form */}
          {telephonyMode === 'byok' && (
            <div className="mt-4 p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Lock className="w-4 h-4 text-[#6366F1]" />
                <span>Custom BYOK API Credentials</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono font-bold text-slate-400 mb-1">
                    Plivo Auth ID {byokStatus?.hasPlivoAuthId && <span className="text-emerald-400 font-normal">(Configured)</span>}
                  </label>
                  <input
                    type="text"
                    value={plivoAuthId}
                    onChange={(e) => setPlivoAuthId(e.target.value)}
                    placeholder="e.g. MAYTFMMGI2YMQTYMJMNY"
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none focus:border-[#6366F1]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold text-slate-400 mb-1">
                    Plivo Auth Token {byokStatus?.hasPlivoAuthToken && <span className="text-emerald-400 font-normal">(Configured)</span>}
                  </label>
                  <input
                    type="password"
                    value={plivoAuthToken}
                    onChange={(e) => setPlivoAuthToken(e.target.value)}
                    placeholder="••••••••••••••••••••••••"
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none focus:border-[#6366F1]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold text-slate-400 mb-1">
                    Sarvam AI API Key {byokStatus?.hasSarvamApiKey && <span className="text-emerald-400 font-normal">(Configured)</span>}
                  </label>
                  <input
                    type="password"
                    value={sarvamApiKey}
                    onChange={(e) => setSarvamApiKey(e.target.value)}
                    placeholder="••••••••••••••••••••••••"
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none focus:border-[#6366F1]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold text-slate-400 mb-1">
                    Virtual Outbound Caller ID
                  </label>
                  <input
                    type="text"
                    value={callerId}
                    onChange={(e) => setCallerId(e.target.value)}
                    placeholder="+918065534512"
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none focus:border-[#6366F1]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Business Profile */}
        <div className="bg-white dark:bg-[#0F1219]/30 rounded-3xl p-6 border border-slate-200 dark:border-[#334155]/25 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-sky-500" />
            <h2 className="text-base font-black text-slate-950 dark:text-white">Organization Profile</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-[#94A3B8] mb-1">Company Name</label>
              <input
                type="text"
                value={bizName}
                onChange={(e) => setBizName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#334155]/30 bg-slate-50 dark:bg-[#090B10] font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#6366F1]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-[#94A3B8] mb-1">Operating Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#334155]/30 bg-slate-50 dark:bg-[#090B10] font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#6366F1]"
              >
                <option value="Asia/Kolkata (IST)">Asia/Kolkata (GMT+5:30) - Standard IST</option>
                <option value="America/New_York (EST)">America/New_York (EST)</option>
                <option value="America/Los_Angeles (PST)">America/Los_Angeles (PST)</option>
                <option value="Europe/London (GMT)">Europe/London (GMT)</option>
                <option value="Asia/Dubai (GST)">Asia/Dubai (GST)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-[#94A3B8] mb-1">Primary Telecom Trunk</label>
              <input
                type="text"
                disabled
                value="Plivo India SIP Carrier Mesh (+91 80 4879 9695)"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#334155]/30 bg-slate-100 dark:bg-[#090B10] text-slate-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-[#94A3B8] mb-1">Authenticated Account</label>
              <input
                type="text"
                disabled
                value={currentUser ? `${currentUser.name} (${currentUser.email})` : 'Google SSO Authenticated'}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#334155]/30 bg-slate-100 dark:bg-[#090B10] text-slate-500"
              />
            </div>
          </div>
        </div>

        {/* Telephony Webhooks */}
        <div className="bg-white dark:bg-[#0F1219]/30 rounded-3xl p-6 border border-slate-200 dark:border-[#334155]/25 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-[#6366F1] dark:text-[#818CF8]" />
            <h2 className="text-base font-black text-slate-950 dark:text-white">Telephony Webhooks & Call Events</h2>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-[#94A3B8] mb-1">
              Inbound Call Webhook URL
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={webhookUrl}
                className="flex-1 px-3.5 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-[#334155]/30 bg-slate-50 dark:bg-[#090B10] text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={handleCopyWebhook}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-[#334155]/30 hover:bg-slate-100 dark:hover:bg-[#0F1219] text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#090D16] via-[#6366F1] to-[#2563EB] hover:from-[#6366F1] hover:to-[#3B82F6] text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md shadow-[#6366F1]/20 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
