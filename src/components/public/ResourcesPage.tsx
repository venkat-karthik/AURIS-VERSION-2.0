import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Database, Server, Cpu, Key, ArrowRight, ShieldCheck, FileCode, CheckCircle2, Layers } from 'lucide-react';

export const ResourcesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'database' | 'provider' | 'webhooks'>('architecture');

  return (
    <div className="py-16 bg-white dark:bg-[#070D18] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto space-y-3"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300">
            <Layers className="w-3.5 h-3.5" />
            Engineering & System Specifications
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
            Auris SaaS Technical Architecture
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-300">
            Explore the multi-tenant architecture, relational schema, and high-performance neural voice infrastructure powering Auris.
          </p>

          {/* Navigation Pill Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            <button
              onClick={() => setActiveTab('architecture')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'architecture'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              System Architecture
            </button>
            <button
              onClick={() => setActiveTab('database')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'database'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              Database Design (PostgreSQL)
            </button>
            <button
              onClick={() => setActiveTab('provider')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'provider'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              Voice Provider Abstraction
            </button>
            <button
              onClick={() => setActiveTab('webhooks')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'webhooks'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              Webhook Pipeline
            </button>
          </div>
        </motion.div>

        {/* 1. SYSTEM ARCHITECTURE (Matching Mockup Diagram) */}
        {activeTab === 'architecture' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 border border-slate-200 dark:border-slate-800 shadow-xs space-y-10">
            <div>
              <h2 className="text-2xl font-black text-slate-950 dark:text-white mb-2">High-Level Flow Diagram</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Multi-tier separation guaranteeing zero provider secrets reach browser clients, while maintaining sub-350ms end-to-end voice latency.
              </p>
            </div>

            {/* Architecture Node Visualizer */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
              <div className="bg-sky-50/70 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 p-5 rounded-2xl text-center space-y-2">
                <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">Client Layer</span>
                <h4 className="font-bold text-sm text-slate-950 dark:text-white">Frontend Application</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">Next.js / React + Tailwind CSS client dashboard and public landing experience.</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl text-center space-y-2">
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">API & Security</span>
                <h4 className="font-bold text-sm text-slate-950 dark:text-white">Auris Backend API</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">Multi-tenant authorization, request validation, rate limiting & role management.</p>
              </div>

              <div className="bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-5 rounded-2xl text-center space-y-2">
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Provider Layer</span>
                <h4 className="font-bold text-sm text-slate-950 dark:text-white">VoiceProvider Interface</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">Decoupled adapter mediating calls, transcripts, webhooks and voice configuration.</p>
              </div>

              <div className="bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 p-5 rounded-2xl text-center space-y-2">
                <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Infrastructure</span>
                <h4 className="font-bold text-sm text-slate-950 dark:text-white">Carrier Telephony Engine</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">Carrier telephony, SIP trunking, WebRTC audio streams & STT/TTS models.</p>
              </div>
            </div>

            {/* Secondary Services Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                <h5 className="font-bold text-xs text-slate-950 dark:text-white mb-1">PostgreSQL & Auth</h5>
                <p className="text-xs text-slate-600 dark:text-slate-400">Relational schema with row-level tenant separation and encrypted secret credentials.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                <h5 className="font-bold text-xs text-slate-950 dark:text-white mb-1">Razorpay Billing</h5>
                <p className="text-xs text-slate-600 dark:text-slate-400">Automated subscription cycles, usage fee reconciliation, and verified webhooks.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                <h5 className="font-bold text-xs text-slate-950 dark:text-white mb-1">Storage & Knowledge</h5>
                <p className="text-xs text-slate-600 dark:text-slate-400">Document chunking, vector embeddings, and verified processing state tracking.</p>
              </div>
            </div>
          </div>
        )}

        {/* 2. DATABASE DESIGN (Matching Mockup Tables) */}
        {activeTab === 'database' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 border border-slate-200 dark:border-slate-800 shadow-xs space-y-8">
            <div>
              <h2 className="text-2xl font-black text-slate-950 dark:text-white mb-1">Relational Database Design (Main Tables)</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Structured PostgreSQL tables designed for strict multi-tenant isolation and provider resource mapping.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* users & businesses */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 bg-slate-50/70 dark:bg-slate-850 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-sky-600 dark:text-sky-400">users</span>
                  <span className="text-[10px] bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 px-2 py-0.5 rounded">Core Auth</span>
                </div>
                <p className="font-mono text-xs text-slate-600 dark:text-slate-400">
                  (id, name, email, plan, role, business_id, created_at)
                </p>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">businesses</span>
                  <p className="font-mono text-xs text-slate-600 dark:text-slate-400 mt-1">
                    (id, user_id, name, industry, plan_id, timezone, settings)
                  </p>
                </div>
              </div>

              {/* agents */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 bg-slate-50/70 dark:bg-slate-850 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">agents</span>
                  <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded">Tenant Scoped</span>
                </div>
                <p className="font-mono text-xs text-slate-600 dark:text-slate-400">
                  (id, business_id, name, industry, voice_id, language, status, instructions, tools, provider, provider_agent_id)
                </p>
              </div>

              {/* phone_numbers */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 bg-slate-50/70 dark:bg-slate-850 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-sky-600 dark:text-sky-400">phone_numbers</span>
                  <span className="text-[10px] bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 px-2 py-0.5 rounded">Telephony</span>
                </div>
                <p className="font-mono text-xs text-slate-600 dark:text-slate-400">
                  (id, business_id, number, country, assigned_agent_id, status, provider, provider_number_id)
                </p>
              </div>

              {/* calls */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 bg-slate-50/70 dark:bg-slate-850 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">calls</span>
                  <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded">Call Center</span>
                </div>
                <p className="font-mono text-xs text-slate-600 dark:text-slate-400">
                  (id, business_id, agent_id, caller, duration, status, transcript, sentiment, provider_call_id, created_at)
                </p>
              </div>

              {/* campaigns */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 bg-slate-50/70 dark:bg-slate-850 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-sky-600 dark:text-sky-400">campaigns</span>
                  <span className="text-[10px] bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 px-2 py-0.5 rounded">Outbound</span>
                </div>
                <p className="font-mono text-xs text-slate-600 dark:text-slate-400">
                  (id, business_id, name, agent_id, total_contacts, answered, status, schedule_time)
                </p>
              </div>

              {/* knowledge_base & payments */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 bg-slate-50/70 dark:bg-slate-850 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">knowledge_base</span>
                  <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded">RAG Storage</span>
                </div>
                <p className="font-mono text-xs text-slate-600 dark:text-slate-400">
                  (id, business_id, title, type, url, status, agent_ids, updated_at)
                </p>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">payments</span>
                  <p className="font-mono text-xs text-slate-600 dark:text-slate-400 mt-1">
                    (id, user_id, amount, status, razorpay_payment_id, invoice_url)
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. VOICE PROVIDER ABSTRACTION */}
        {activeTab === 'provider' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            <h2 className="text-2xl font-black text-slate-950 dark:text-white">VoiceProvider TypeScript Interface</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Guarantees Auris will never experience vendor lock-in. Any voice engine implementing this contract can be activated via backend environment toggle.
            </p>

            <div className="bg-slate-950 rounded-2xl p-6 text-white font-mono text-xs overflow-x-auto border border-slate-800">
              <pre className="text-emerald-400 leading-relaxed">
{`export interface VoiceProvider {
  name: 'CarrierVoiceEngine' | 'AurisVoiceEngine';
  version: string;

  // Agent Management
  createAgent(payload: ProviderAgentPayload): Promise<{ providerAgentId: string }>;
  updateAgent(providerAgentId: string, payload: Partial<ProviderAgentPayload>): Promise<{ success: boolean }>;
  deleteAgent(providerAgentId: string): Promise<{ success: boolean }>;

  // Telephony Dispatch
  dispatchCall(payload: CallDispatchPayload): Promise<{ providerCallId: string }>;
  terminateCall(providerCallId: string): Promise<{ success: boolean }>;

  // Real-time Web Voice Session
  createWebVoiceSession(agentId: string): Promise<WebVoiceSession>;
}`}
              </pre>
            </div>
          </div>
        )}

        {/* 4. WEBHOOKS */}
        {activeTab === 'webhooks' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            <h2 className="text-2xl font-black text-slate-950 dark:text-white">Idempotent Webhook Processing</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Incoming telephony webhooks from carrier infrastructure are verified via HMAC-SHA256 signature, stored in audit records, and deduplicated via idempotency tokens.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                <span className="font-mono text-xs text-sky-600 dark:text-sky-400 font-bold">call.started</span>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Initiates live call session in database, assigns agent, and triggers frontend socket update.</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400 font-bold">call.completed</span>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Stores full speaker transcript, sentiment score, extracts calendar booking intents, and logs minute usage.</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                <span className="font-mono text-xs text-slate-950 dark:text-white font-bold">payment.authorized</span>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Razorpay webhook event updating business subscription status and resetting monthly minute quota.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
