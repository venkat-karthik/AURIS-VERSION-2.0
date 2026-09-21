import React, { useState } from 'react';
import { Database, Server, Cpu, Key, ArrowRight, ShieldCheck, FileCode, CheckCircle2, Layers } from 'lucide-react';

export const ResourcesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'database' | 'provider' | 'webhooks'>('architecture');

  return (
    <div className="py-16 bg-[#F5FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEF8FC] border border-[#55B9E8]/30 text-xs font-bold text-[#2189C8]">
            <Layers className="w-3.5 h-3.5" />
            Engineering & System Specifications
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#123047] tracking-tight">
            Auris SaaS Technical Architecture
          </h1>
          <p className="text-base text-[#52636D]">
            Explore the multi-tenant architecture, relational PostgreSQL schema, and decoupling between Auris business logic and the OmniDimension voice infrastructure.
          </p>

          {/* Navigation Pill Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            <button
              onClick={() => setActiveTab('architecture')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'architecture'
                  ? 'bg-[#123047] text-white shadow-xs'
                  : 'bg-white text-[#52636D] border border-[#DDEBEF] hover:bg-[#F5FAFC]'
              }`}
            >
              System Architecture
            </button>
            <button
              onClick={() => setActiveTab('database')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'database'
                  ? 'bg-[#123047] text-white shadow-xs'
                  : 'bg-white text-[#52636D] border border-[#DDEBEF] hover:bg-[#F5FAFC]'
              }`}
            >
              Database Design (PostgreSQL)
            </button>
            <button
              onClick={() => setActiveTab('provider')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'provider'
                  ? 'bg-[#123047] text-white shadow-xs'
                  : 'bg-white text-[#52636D] border border-[#DDEBEF] hover:bg-[#F5FAFC]'
              }`}
            >
              Voice Provider Abstraction
            </button>
            <button
              onClick={() => setActiveTab('webhooks')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'webhooks'
                  ? 'bg-[#123047] text-white shadow-xs'
                  : 'bg-white text-[#52636D] border border-[#DDEBEF] hover:bg-[#F5FAFC]'
              }`}
            >
              Webhook Pipeline
            </button>
          </div>
        </div>

        {/* 1. SYSTEM ARCHITECTURE (Matching Mockup Diagram) */}
        {activeTab === 'architecture' && (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#DDEBEF] shadow-xs space-y-10">
            <div>
              <h2 className="text-2xl font-bold text-[#123047] mb-2">High-Level Flow Diagram</h2>
              <p className="text-sm text-[#52636D]">
                Multi-tier separation guaranteeing zero provider secrets reach browser clients, while maintaining sub-350ms end-to-end voice latency.
              </p>
            </div>

            {/* Architecture Node Visualizer */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
              <div className="bg-[#EEF8FC] border border-[#55B9E8]/40 p-5 rounded-2xl text-center space-y-2">
                <span className="text-[10px] font-bold text-[#2189C8] uppercase tracking-wider">Client Layer</span>
                <h4 className="font-bold text-sm text-[#123047]">Frontend Application</h4>
                <p className="text-xs text-[#52636D]">Next.js / React + Tailwind CSS client dashboard and public landing experience.</p>
              </div>

              <div className="bg-[#F5FAFC] border border-[#DDEBEF] p-5 rounded-2xl text-center space-y-2">
                <span className="text-[10px] font-bold text-[#38A85B] uppercase tracking-wider">API & Security</span>
                <h4 className="font-bold text-sm text-[#123047]">Auris Backend API</h4>
                <p className="text-xs text-[#52636D]">Multi-tenant authorization, request validation, rate limiting & role management.</p>
              </div>

              <div className="bg-[#EFFAF1] border border-[#65C978]/40 p-5 rounded-2xl text-center space-y-2">
                <span className="text-[10px] font-bold text-[#38A85B] uppercase tracking-wider">Provider Layer</span>
                <h4 className="font-bold text-sm text-[#123047]">VoiceProvider Interface</h4>
                <p className="text-xs text-[#52636D]">Decoupled adapter mediating calls, transcripts, webhooks and voice configuration.</p>
              </div>

              <div className="bg-[#123047] text-white p-5 rounded-2xl text-center space-y-2">
                <span className="text-[10px] font-bold text-[#55B9E8] uppercase tracking-wider">Infrastructure</span>
                <h4 className="font-bold text-sm text-white">OmniDimension API</h4>
                <p className="text-xs text-white/70">Carrier telephony, SIP trunking, WebRTC audio streams & STT/TTS models.</p>
              </div>
            </div>

            {/* Secondary Services Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-[#DDEBEF]">
              <div className="p-4 rounded-xl bg-[#F5FAFC] border border-[#DDEBEF]">
                <h5 className="font-bold text-xs text-[#123047] mb-1">PostgreSQL & Auth</h5>
                <p className="text-xs text-[#52636D]">Relational schema with row-level tenant separation and encrypted secret credentials.</p>
              </div>

              <div className="p-4 rounded-xl bg-[#F5FAFC] border border-[#DDEBEF]">
                <h5 className="font-bold text-xs text-[#123047] mb-1">Razorpay Billing</h5>
                <p className="text-xs text-[#52636D]">Automated subscription cycles, usage fee reconciliation, and verified webhooks.</p>
              </div>

              <div className="p-4 rounded-xl bg-[#F5FAFC] border border-[#DDEBEF]">
                <h5 className="font-bold text-xs text-[#123047] mb-1">Storage & Knowledge</h5>
                <p className="text-xs text-[#52636D]">Document chunking, vector embeddings, and verified processing state tracking.</p>
              </div>
            </div>
          </div>
        )}

        {/* 2. DATABASE DESIGN (Matching Mockup Tables) */}
        {activeTab === 'database' && (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#DDEBEF] shadow-xs space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-[#123047] mb-1">Relational Database Design (Main Tables)</h2>
              <p className="text-sm text-[#52636D]">
                Structured PostgreSQL tables designed for strict multi-tenant isolation and provider resource mapping.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* users & businesses */}
              <div className="border border-[#DDEBEF] rounded-2xl p-5 bg-[#F5FAFC] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-[#2189C8]">users</span>
                  <span className="text-[10px] bg-[#EEF8FC] text-[#2189C8] px-2 py-0.5 rounded">Core Auth</span>
                </div>
                <p className="font-mono text-xs text-[#52636D]">
                  (id, name, email, plan, role, business_id, created_at)
                </p>
                <div className="pt-2 border-t border-[#DDEBEF]">
                  <span className="font-mono font-bold text-xs text-[#38A85B]">businesses</span>
                  <p className="font-mono text-xs text-[#52636D] mt-1">
                    (id, user_id, name, industry, plan_id, timezone, settings)
                  </p>
                </div>
              </div>

              {/* agents */}
              <div className="border border-[#DDEBEF] rounded-2xl p-5 bg-[#F5FAFC] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-[#38A85B]">agents</span>
                  <span className="text-[10px] bg-[#EFFAF1] text-[#38A85B] px-2 py-0.5 rounded">Tenant Scoped</span>
                </div>
                <p className="font-mono text-xs text-[#52636D]">
                  (id, business_id, name, industry, voice_id, language, status, instructions, tools, provider, provider_agent_id)
                </p>
              </div>

              {/* phone_numbers */}
              <div className="border border-[#DDEBEF] rounded-2xl p-5 bg-[#F5FAFC] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-[#2189C8]">phone_numbers</span>
                  <span className="text-[10px] bg-[#EEF8FC] text-[#2189C8] px-2 py-0.5 rounded">Telephony</span>
                </div>
                <p className="font-mono text-xs text-[#52636D]">
                  (id, business_id, number, country, assigned_agent_id, status, provider, provider_number_id)
                </p>
              </div>

              {/* calls */}
              <div className="border border-[#DDEBEF] rounded-2xl p-5 bg-[#F5FAFC] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-[#38A85B]">calls</span>
                  <span className="text-[10px] bg-[#EFFAF1] text-[#38A85B] px-2 py-0.5 rounded">Call Center</span>
                </div>
                <p className="font-mono text-xs text-[#52636D]">
                  (id, business_id, agent_id, caller, duration, status, transcript, sentiment, provider_call_id, created_at)
                </p>
              </div>

              {/* campaigns */}
              <div className="border border-[#DDEBEF] rounded-2xl p-5 bg-[#F5FAFC] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-[#2189C8]">campaigns</span>
                  <span className="text-[10px] bg-[#EEF8FC] text-[#2189C8] px-2 py-0.5 rounded">Outbound</span>
                </div>
                <p className="font-mono text-xs text-[#52636D]">
                  (id, business_id, name, agent_id, total_contacts, answered, status, schedule_time)
                </p>
              </div>

              {/* knowledge_base & payments */}
              <div className="border border-[#DDEBEF] rounded-2xl p-5 bg-[#F5FAFC] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-[#38A85B]">knowledge_base</span>
                  <span className="text-[10px] bg-[#EFFAF1] text-[#38A85B] px-2 py-0.5 rounded">RAG Storage</span>
                </div>
                <p className="font-mono text-xs text-[#52636D]">
                  (id, business_id, title, type, url, status, agent_ids, updated_at)
                </p>
                <div className="pt-2 border-t border-[#DDEBEF]">
                  <span className="font-mono font-bold text-xs text-[#123047]">payments</span>
                  <p className="font-mono text-xs text-[#52636D] mt-1">
                    (id, user_id, amount, status, razorpay_payment_id, invoice_url)
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. VOICE PROVIDER ABSTRACTION */}
        {activeTab === 'provider' && (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#DDEBEF] shadow-xs space-y-6">
            <h2 className="text-2xl font-bold text-[#123047]">VoiceProvider TypeScript Interface</h2>
            <p className="text-sm text-[#52636D]">
              Guarantees Auris will never experience vendor lock-in. Any voice engine implementing this contract can be activated via backend environment toggle.
            </p>

            <div className="bg-[#123047] rounded-2xl p-6 text-white font-mono text-xs overflow-x-auto">
              <pre className="text-emerald-400 leading-relaxed">
{`export interface VoiceProvider {
  name: 'OmniDimension' | 'AurisVoiceEngine';
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
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#DDEBEF] shadow-xs space-y-6">
            <h2 className="text-2xl font-bold text-[#123047]">Idempotent Webhook Processing</h2>
            <p className="text-sm text-[#52636D]">
              Incoming telephony webhooks from OmniDimension are verified via HMAC-SHA256 signature, stored in audit records, and deduplicated via idempotency tokens.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#F5FAFC] border border-[#DDEBEF]">
                <span className="font-mono text-xs text-[#2189C8] font-bold">call.started</span>
                <p className="text-xs text-[#52636D] mt-1">Initiates live call session in database, assigns agent, and triggers frontend socket update.</p>
              </div>
              <div className="p-4 rounded-xl bg-[#F5FAFC] border border-[#DDEBEF]">
                <span className="font-mono text-xs text-[#38A85B] font-bold">call.completed</span>
                <p className="text-xs text-[#52636D] mt-1">Stores full speaker transcript, sentiment score, extracts calendar booking intents, and logs minute usage.</p>
              </div>
              <div className="p-4 rounded-xl bg-[#F5FAFC] border border-[#DDEBEF]">
                <span className="font-mono text-xs text-[#123047] font-bold">payment.authorized</span>
                <p className="text-xs text-[#52636D] mt-1">Razorpay webhook event updating business subscription status and resetting monthly minute quota.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
