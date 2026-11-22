import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  MessageSquare,
  Plus,
  CheckCircle2,
  Copy,
  ExternalLink,
  ShieldCheck,
  Smartphone,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';

export const WhatsAppNumbersView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'numbers' | 'templates'>('numbers');
  const [copiedWaba, setCopiedWaba] = useState<string | null>(null);

  const whatsappNumbers = [
    {
      id: 'wa_01',
      number: '+91 80 4879 9695',
      name: 'Auris Direct Meta Business Trunk',
      status: 'Active Live',
      tier: 'Enterprise Tier (100,000 msgs/day)',
      qualityRating: 'High Quality (Tier 1)',
      wabaId: 'WABA_99210481239',
      phoneId: 'PN_44810239102',
      deliveryRate: '99.8%',
      latency: '240ms',
    },
  ];

  const templates = [
    {
      id: 'appointment_confirmation',
      name: 'appointment_confirmation',
      category: 'Transactional / Utility',
      language: 'English (en) / Indic (te, hi)',
      status: 'Meta Approved',
      body: 'Hello {{1}}, your appointment for {{2}} has been confirmed for {{3}}. To reschedule or cancel, reply to this message.',
    },
    {
      id: 'post_call_brochure',
      name: 'post_call_brochure',
      category: 'Marketing Automation',
      language: 'English (en)',
      status: 'Meta Approved',
      body: 'Thank you for speaking with our AI specialist. As requested on the phone call, here is the executive specification and pricing brochure: {{1}}',
    },
    {
      id: 'lead_followup',
      name: 'lead_followup',
      category: 'High-Intent Follow-Up',
      language: 'English (en)',
      status: 'Meta Approved',
      body: 'Hi {{1}}, we missed your call regarding {{2}}. Would you like our senior AI voice specialist to reconnect today at {{3}}?',
    },
  ];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedWaba(id);
    setTimeout(() => setCopiedWaba(null), 2000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-white tracking-tight">
              Meta WhatsApp Business Trunks
            </h1>
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Official Cloud API
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Enterprise multi-channel post-call workflows. Dispatch automated booking links, digital contracts, and instant brochures directly after conversational voice sessions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.35)] cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            Provision WhatsApp Trunk
          </motion.button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('numbers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'numbers'
              ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Registered Phone Trunks ({whatsappNumbers.length})
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'templates'
              ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Meta HSM Templates ({templates.length})
        </button>
      </div>

      {activeTab === 'numbers' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {whatsappNumbers.map((wa) => (
              <div
                key={wa.id}
                className="lg:col-span-2 bg-[#090D16]/90 rounded-3xl p-6 border border-slate-800/80 shadow-xl space-y-6 backdrop-blur-xl hover:border-cyan-500/30 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                      <Smartphone className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white">
                        {wa.name}
                      </h3>
                      <p className="text-sm font-mono font-bold text-cyan-400 mt-0.5">
                        {wa.number}
                      </p>
                    </div>
                  </div>

                  <span className="px-3.5 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    {wa.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Quality Metric</span>
                    <span className="font-extrabold text-cyan-400 mt-1 block">{wa.qualityRating}</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Throughput Tier</span>
                    <span className="font-extrabold text-white mt-1 block">{wa.tier}</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Delivery SLA</span>
                    <span className="font-extrabold text-emerald-400 mt-1 block">{wa.deliveryRate}</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Dispatch Latency</span>
                    <span className="font-extrabold text-white mt-1 block">{wa.latency}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Meta WABA Account ID</span>
                    <p className="font-mono text-xs text-slate-300 font-semibold">{wa.wabaId}</p>
                  </div>
                  <button
                    onClick={() => handleCopy(wa.wabaId, wa.id)}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-700 flex items-center gap-1.5 cursor-pointer text-xs font-semibold self-start sm:self-auto"
                  >
                    {copiedWaba === wa.id ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedWaba === wa.id ? 'Copied' : 'Copy WABA'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <button className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white border border-slate-700 transition-colors cursor-pointer flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    Security & Webhooks
                  </button>
                  <button className="py-2.5 px-4 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-xs font-bold text-cyan-300 border border-cyan-500/30 transition-colors cursor-pointer flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Sync Meta Cloud Status
                  </button>
                </div>
              </div>
            ))}

            {/* Enterprise Telephony Integration Card */}
            <div className="bg-[#090D16]/90 rounded-3xl p-6 border border-slate-800/80 shadow-xl space-y-5 backdrop-blur-xl flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">
                      Automated Voice-to-WhatsApp
                    </h3>
                    <p className="text-xs text-slate-400">Deterministic triggers</p>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Upon completion of inbound or outbound voice calls, Auris 2.0 inspects call sentiment and booking confirmations to trigger immediate WhatsApp template dispatches.
                </p>

                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-300 font-medium">Automatic Booking Confirmations</span>
                    <span className="text-emerald-400 font-bold font-mono">ENABLED</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-300 font-medium">Post-Call Floor Plan & Brochure</span>
                    <span className="text-emerald-400 font-bold font-mono">ENABLED</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-300 font-medium">Missed Call Smart Follow-Up</span>
                    <span className="text-cyan-400 font-bold font-mono">ACTIVE</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 text-xs text-slate-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Zero middleman markup: billed directly via your Meta Cloud account.</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Templates List */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {templates.map((t) => (
            <div
              key={t.id}
              className="bg-[#090D16]/90 rounded-3xl p-6 border border-slate-800/80 shadow-xl space-y-4 backdrop-blur-xl hover:border-cyan-500/30 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold uppercase bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  {t.category}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  {t.status}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-extrabold text-white font-mono">
                  {t.name}
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">{t.language}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 italic leading-relaxed font-sans">
                "{t.body}"
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
