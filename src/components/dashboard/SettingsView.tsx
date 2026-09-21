import React, { useState } from 'react';
import { Business, User } from '../../types';
import { Building, Key, Users, Shield, Save, CheckCircle2, Copy } from 'lucide-react';

interface SettingsViewProps {
  business: Business;
  currentUser: User;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ business, currentUser }) => {
  const [bizName, setBizName] = useState(business.name);
  const [timezone, setTimezone] = useState(business.timezone || 'Asia/Kolkata (IST)');
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const webhookUrl = 'https://api.auris.ai/v1/webhooks/omnidimension';

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

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#123047] tracking-tight">Workspace Settings</h1>
        <p className="text-xs text-[#52636D] mt-0.5">
          Configure business details, telephony credentials, and voice provider webhook endpoints.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Business Profile */}
        <div className="bg-white rounded-2xl p-6 border border-[#DDEBEF] shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-[#2189C8]" />
            <h3 className="text-sm font-bold text-[#123047]">Business Profile</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#123047] mb-1">Company / Organization</label>
              <input
                type="text"
                value={bizName}
                onChange={(e) => setBizName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#DDEBEF]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#123047] mb-1">Industry</label>
              <input
                type="text"
                disabled
                value={business.industry}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#DDEBEF] bg-[#F5FAFC] text-[#82919A]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#123047] mb-1">Operating Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#DDEBEF] text-xs"
              >
                <option value="Asia/Kolkata (IST)">Asia/Kolkata (GMT+5:30)</option>
                <option value="America/New_York (EST)">America/New_York (EST)</option>
                <option value="America/Los_Angeles (PST)">America/Los_Angeles (PST)</option>
                <option value="Europe/London (GMT)">Europe/London (GMT)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#123047] mb-1">Account Owner</label>
              <input
                type="text"
                disabled
                value={`${currentUser.name} (${currentUser.email})`}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#DDEBEF] bg-[#F5FAFC] text-[#82919A]"
              />
            </div>
          </div>
        </div>

        {/* Voice Telephony & Provider Configuration */}
        <div className="bg-white rounded-2xl p-6 border border-[#DDEBEF] shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-[#38A85B]" />
            <h3 className="text-sm font-bold text-[#123047]">Voice Provider Configuration</h3>
          </div>
          <p className="text-xs text-[#52636D]">
            Auris delegates carrier telephony and real-time audio models via the decoupled <span className="font-mono text-[#2189C8]">VoiceProvider</span> abstraction layer.
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-[#123047] mb-1">Active Engine</label>
              <input
                type="text"
                disabled
                value="OmniDimension Voice Carrier API (Production Tier-1)"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#DDEBEF] bg-[#F5FAFC] text-[#123047] font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#123047] mb-1">Inbound Webhook Endpoint</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={webhookUrl}
                  className="flex-1 px-3.5 py-2 text-xs font-mono rounded-xl border border-[#DDEBEF] bg-[#F5FAFC]"
                />
                <button
                  type="button"
                  onClick={handleCopyWebhook}
                  className="px-3 py-2 rounded-xl border border-[#DDEBEF] hover:bg-[#EEF8FC] text-xs font-bold text-[#2189C8] flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          {saved && (
            <span className="text-xs font-bold text-[#38A85B] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Settings updated successfully!
            </span>
          )}
          <button
            type="submit"
            className="ml-auto px-6 py-2.5 rounded-xl bg-[#38A85B] hover:bg-[#2f8f4d] text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};
