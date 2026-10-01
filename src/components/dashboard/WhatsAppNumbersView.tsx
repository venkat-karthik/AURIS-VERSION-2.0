import React, { useState } from 'react';
import {
  MessageSquare,
  Plus,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  ShieldCheck,
  Send,
  RefreshCw,
  QrCode,
  Smartphone,
} from 'lucide-react';

export const WhatsAppNumbersView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'numbers' | 'templates'>('numbers');
  const [testNumber, setTestNumber] = useState('+91 78421 64904');
  const [selectedTemplate, setSelectedTemplate] = useState('appointment_confirmation');
  const [sendingTest, setSendingTest] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  const whatsappNumbers = [
    {
      id: 'wa_01',
      number: '+91 80487 99695',
      name: 'Auris Enterprise Workspace',
      status: 'Connected',
      tier: 'Tier 2 (10,000 msgs/day)',
      qualityRating: 'High (Green)',
      wabaId: 'WABA_99210481239',
      phoneId: 'PN_44810239102',
    },
  ];

  const templates = [
    {
      id: 'appointment_confirmation',
      name: 'appointment_confirmation',
      category: 'Utility',
      language: 'English (en) / Telugu (te)',
      status: 'Approved',
      body: 'Hello {{1}}, your appointment for {{2}} has been confirmed for {{3}}. To reschedule or cancel, reply to this message.',
    },
    {
      id: 'post_call_brochure',
      name: 'post_call_brochure',
      category: 'Marketing',
      language: 'English (en)',
      status: 'Approved',
      body: 'Thank you for speaking with our AI specialist. As discussed, here is the detailed brochure and floor plan: {{1}}',
    },
    {
      id: 'lead_followup',
      name: 'lead_followup',
      category: 'Utility',
      language: 'English (en)',
      status: 'Approved',
      body: 'Hi {{1}}, we missed your call earlier regarding {{2}}. Would you like us to call you back today?',
    },
  ];

  const handleSendTestMessage = (e: React.FormEvent) => {
    e.preventDefault();
    setSendingTest(true);
    setTimeout(() => {
      setSendingTest(false);
      setSendSuccess(true);
      setTimeout(() => setSendSuccess(false), 4000);
    }, 1200);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              WhatsApp Numbers
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              Meta Cloud API
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Connect Meta WhatsApp Business numbers to send automated post-call booking confirmations, brochures, and follow-ups.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer">
            <Plus className="w-4 h-4" />
            Connect WhatsApp Number
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('numbers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'numbers'
              ? 'bg-slate-900 text-white dark:bg-slate-800'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Connected Numbers ({whatsappNumbers.length})
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'templates'
              ? 'bg-slate-900 text-white dark:bg-slate-800'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Message Templates ({templates.length})
        </button>
      </div>

      {activeTab === 'numbers' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {whatsappNumbers.map((wa) => (
              <div
                key={wa.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 md:col-span-2"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <Smartphone className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                        {wa.name}
                      </h3>
                      <p className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {wa.number}
                      </p>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    {wa.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Quality Rating</span>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{wa.qualityRating}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Messaging Limit</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">{wa.tier}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">WABA Account</span>
                    <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300">{wa.wabaId}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button className="py-2 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-900 dark:text-white transition-colors cursor-pointer">
                    Manage Webhooks
                  </button>
                  <button className="py-2 px-4 rounded-xl bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 text-xs font-bold text-emerald-700 dark:text-emerald-300 transition-colors cursor-pointer">
                    Sync Templates
                  </button>
                </div>
              </div>
            ))}

            {/* Test Send Panel */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-500" />
                Dispatch Test Message
              </h3>

              {sendSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>WhatsApp message dispatched!</span>
                </div>
              )}

              <form onSubmit={handleSendTestMessage} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Destination Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={testNumber}
                    onChange={(e) => setTestNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Select Template
                  </label>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.category})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={sendingTest}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {sendingTest ? 'Sending...' : 'Send WhatsApp Test'}
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        /* Templates List */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {templates.map((t) => (
            <div
              key={t.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold uppercase bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                  {t.category}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {t.status}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white font-mono">
                  {t.name}
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">{t.language}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed">
                "{t.body}"
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
