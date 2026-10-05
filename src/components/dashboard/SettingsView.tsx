import React, { useState } from 'react';
import { Business, User } from '../../types';
import { Building, Key, Shield, Save, CheckCircle2, Copy, Cloud, Radio, Phone, Sparkles, Check, ExternalLink } from 'lucide-react';

interface SettingsViewProps {
  business: Business;
  currentUser: User | null;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ business, currentUser }) => {
  const [bizName, setBizName] = useState(business?.name || 'Auris Voice AI Cloud');
  const [timezone, setTimezone] = useState(business?.timezone || 'Asia/Kolkata (IST)');
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const webhookUrl = 'https://api.auris.ai/v1/webhooks/voice-events';

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const integrations = [
    {
      name: 'Velfound Ultra-Low Latency Speech Mesh',
      envVar: 'SPEECH_SYNTHESIS_API_KEY',
      purpose: 'Ultra-low latency (<100ms) conversational voice synthesis (Despina, Barbershop, Katie)',
      status: 'Connected',
      type: 'Voice Synthesis Engine',
      icon: Sparkles,
      color: 'emerald',
    },
    {
      name: 'Velfound Indic Regional Language AI',
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
      color: 'emerald',
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
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Workspace preferences saved successfully.</span>
        </div>
      )}

      {/* External Integrations & Keys Audit */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-emerald-500" />
            <h2 className="text-base font-black text-slate-950 dark:text-white">External Integrations & Keys</h2>
          </div>
          <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full font-bold border border-emerald-200 dark:border-emerald-800">
            6 of 6 Services Active
          </span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          These external platforms power your voice stack, speech recognition, media archiving, and Indian telecom routing.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {integrations.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/90 dark:border-slate-800 flex flex-col justify-between space-y-2"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-emerald-500" />
                      </div>
                      <span className="text-xs font-bold text-slate-950 dark:text-white">{item.name}</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      {item.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.purpose}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Env: {item.envVar}</span>
                  <span className="text-emerald-500 font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Ready
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Business Profile */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-sky-500" />
            <h2 className="text-base font-black text-slate-950 dark:text-white">Organization Profile</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Company Name</label>
              <input
                type="text"
                value={bizName}
                onChange={(e) => setBizName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 font-medium text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Operating Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 font-medium text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Asia/Kolkata (IST)">Asia/Kolkata (GMT+5:30) - Standard IST</option>
                <option value="America/New_York (EST)">America/New_York (EST)</option>
                <option value="America/Los_Angeles (PST)">America/Los_Angeles (PST)</option>
                <option value="Europe/London (GMT)">Europe/London (GMT)</option>
                <option value="Asia/Dubai (GST)">Asia/Dubai (GST)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Primary Telecom Trunk</label>
              <input
                type="text"
                disabled
                value="Plivo India SIP Carrier Mesh (+91 80 4879 9695)"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Authenticated Account</label>
              <input
                type="text"
                disabled
                value={currentUser ? `${currentUser.name} (${currentUser.email})` : 'Google SSO Authenticated'}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500"
              />
            </div>
          </div>
        </div>

        {/* Telephony Webhooks */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-emerald-500" />
            <h2 className="text-base font-black text-slate-950 dark:text-white">Telephony Webhooks & Call Events</h2>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Inbound Call Webhook URL
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={webhookUrl}
                className="flex-1 px-3.5 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={handleCopyWebhook}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 cursor-pointer"
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
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
