import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock,
  ArrowRight,
  Sparkles,
  Bot,
  Phone,
  PhoneCall,
  Calendar,
  Award,
  Megaphone,
  BookOpen,
  Mic,
  Blocks,
  BarChart3,
  Layers,
  CreditCard,
  Settings,
  LayoutDashboard,
  CheckCircle2,
  Cpu,
  Database,
  Radio,
  Network,
  Zap,
  ShieldCheck,
  ChevronRight,
  Code2,
  Terminal,
} from 'lucide-react';

interface FeatureFlowchartViewProps {
  currentView: string;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onDemoLogin?: () => void;
}

interface FlowchartStep {
  id: string;
  stepNumber: string;
  title: string;
  nodeType: 'ingress' | 'processing' | 'ai' | 'integration' | 'egress';
  description: string;
  tech: string;
  latency: string;
  inputSample: string;
  outputSample: string;
}

interface FeatureSpec {
  title: string;
  subtitle: string;
  category: string;
  protocolBadge: string;
  icon: any;
  overview: string;
  steps: FlowchartStep[];
  capabilities: { title: string; desc: string; stat: string }[];
}

export const FeatureFlowchartView: React.FC<FeatureFlowchartViewProps> = ({
  currentView,
  onOpenAuth,
  onDemoLogin,
}) => {
  const [selectedStepIndex, setSelectedStepIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'flowchart' | 'payload' | 'specs'>('flowchart');

  const featureSpecs: Record<string, FeatureSpec> = {
    dashboard: {
      title: 'Real-Time Telephony & Operations Console',
      subtitle: 'Live call telemetry, active carrier gateways, and unified business voice metrics',
      category: 'Core Operations',
      protocolBadge: 'SIP Trunking + WebSockets',
      icon: LayoutDashboard,
      overview:
        'The Auris Operations Console aggregates inbound and outbound voice sessions across your enterprise SIP carrier trunks, streaming live transcripts, slot holds, and latency metrics in real-time.',
      steps: [
        {
          id: 'step-1',
          stepNumber: '01',
          title: 'Carrier Ingress Gateway',
          nodeType: 'ingress',
          description: 'Receives PSTN or WebRTC call packet and initiates sub-50ms carrier handshake.',
          tech: 'Twilio / Telnyx SIP Trunk',
          latency: '24ms',
          inputSample: '{"callSid": "CA981240", "direction": "inbound", "callerNumber": "+14159823412"}',
          outputSample: '{"channel": "sip-trunk-01", "codec": "Opus-48kHz", "handshake": "ACK"}',
        },
        {
          id: 'step-2',
          stepNumber: '02',
          title: 'Speech Streaming & VAD',
          nodeType: 'processing',
          description: 'Bi-directional audio streaming with sub-80ms Voice Activity Detection & barge-in.',
          tech: 'Deepgram Nova-2 / WebRTC',
          latency: '68ms',
          inputSample: '{"stream": "pcm16_chunk", "sampleRate": 16000, "bargeIn": false}',
          outputSample: '{"transcript": "Hi, I need to book a dental checkup for tomorrow morning."}',
        },
        {
          id: 'step-3',
          stepNumber: '03',
          title: 'Gemini 2.5 Flash Reasoning',
          nodeType: 'ai',
          description: 'Contextual prompt evaluation, entity extraction, and business logic execution.',
          tech: 'Gemini 2.5 Flash Speech',
          latency: '110ms',
          inputSample: '{"prompt": "Dental_Receptionist_v3", "intent": "Appointment_Booking"}',
          outputSample: '{"reply": "I can certainly arrange that. Does 10:30 AM work with Dr. Mitchell?"}',
        },
        {
          id: 'step-4',
          stepNumber: '04',
          title: 'Telemetry & EMR Sync',
          nodeType: 'integration',
          description: 'Dispatches webhook events to Google Calendar and writes audit record to Encrypted Cloud Database.',
          tech: 'Google Workspace + Cloud DB',
          latency: '42ms',
          inputSample: '{"action": "HOLD_SLOT", "slot": "2026-09-23T10:30:00Z", "patient": "John D."}',
          outputSample: '{"status": "CONFIRMED", "eventId": "cal_evt_991823", "syncLatency": "38ms"}',
        },
      ],
      capabilities: [
        { title: 'Sub-280ms Total Roundtrip', desc: 'Imperceptible turn-taking latency with natural barge-in interruption.', stat: '<280ms' },
        { title: '99.98% Gateway SLA', desc: 'Redundant multi-region telephony routing across carrier backbones.', stat: '99.98%' },
        { title: 'Instant Google Calendar Sync', desc: 'Real-time two-way slot availability verification without double-booking.', stat: 'Real-Time' },
      ],
    },
    agents: {
      title: 'Autonomous AI Voice Agents Engine',
      subtitle: 'Custom voice personas, RAG knowledge attachment, and dynamic workflow prompts',
      category: 'Agent Intelligence',
      protocolBadge: 'Gemini Prompt Engine + RAG',
      icon: Bot,
      overview:
        'Create and train domain-specific voice assistants with distinct tones, knowledge constraints, and tool integrations (CRM write, transfer to human, calendar holds).',
      steps: [
        {
          id: 'step-1',
          stepNumber: '01',
          title: 'Persona Definition',
          nodeType: 'ingress',
          description: 'Configure tone, greeting scripts, speaking cadence, and permitted tool invocations.',
          tech: 'System Instruction Engine',
          latency: 'Instant',
          inputSample: '{"agentName": "Dr. Sarah Mitchell", "role": "Clinic Receptionist", "accent": "Warm English"}',
          outputSample: '{"personaConfig": "INITIALIZED", "safetyFilters": "STRICT"}',
        },
        {
          id: 'step-2',
          stepNumber: '02',
          title: 'Vector Knowledge Ingestion',
          nodeType: 'processing',
          description: 'Retrieves relevant clinic FAQs, pricing tables, and doctor schedules during live dialog.',
          tech: 'Milvus / pgvector RAG',
          latency: '34ms',
          inputSample: '{"query": "Does clinic accept Delta Dental Insurance?"}',
          outputSample: '{"matches": [{"doc": "Insurance_List.pdf", "confidence": 0.98}]}',
        },
        {
          id: 'step-3',
          stepNumber: '03',
          title: 'Dynamic Tool Calling',
          nodeType: 'ai',
          description: 'Agent decides autonomously when to book appointments or transfer callers to supervisors.',
          tech: 'Function Calling API',
          latency: '85ms',
          inputSample: '{"function": "checkCalendarSlot", "params": {"date": "2026-09-24"}}',
          outputSample: '{"available": true, "slots": ["09:00", "11:30", "15:00"]}',
        },
        {
          id: 'step-4',
          stepNumber: '04',
          title: 'Multi-Tenant Deployment',
          nodeType: 'egress',
          description: 'Deploys agent to SIP numbers and WebRTC voice widgets across all client locations.',
          tech: 'Carrier Router',
          latency: '15ms',
          inputSample: '{"action": "BIND_AGENT", "phoneId": "ph_ny_01", "agentId": "ag_reception"}',
          outputSample: '{"status": "ACTIVE", "carrierRoute": "READY"}',
        },
      ],
      capabilities: [
        { title: 'Natural Speech Flow', desc: 'Trained on conversational pauses, filler words, and empathetic tone adjustments.', stat: 'Human-like' },
        { title: 'Strict Guardrails', desc: 'Zero medical misdiagnosis or unapproved claims with deterministic negative prompts.', stat: '100% Guarded' },
        { title: 'Zero-Code Builder', desc: 'Configure instructions, test responses, and deploy live in under 5 minutes.', stat: '<5 min' },
      ],
    },
    'call-scheduling': {
      title: 'Automated Outbound Call Scheduling Engine',
      subtitle: 'Autonomous patient follow-ups, appointment reminders, and lead callbacks',
      category: 'Telephony Automation',
      protocolBadge: 'Cron Scheduler + SIP Trunk',
      icon: Calendar,
      overview:
        'Schedule high-priority outbound calls triggered by calendar events, lead form submissions, or routine medical check-up intervals with automated timezone coordination.',
      steps: [
        {
          id: 'step-1',
          stepNumber: '01',
          title: 'Schedule Trigger Ingestion',
          nodeType: 'ingress',
          description: 'Receives target caller list via CSV upload, REST API, or CRM webhook.',
          tech: 'REST Webhook / Cloud Task',
          latency: '12ms',
          inputSample: '{"patient": "Robert Chen", "targetTime": "2026-09-23T09:00:00Z", "reason": "Dental Cleaning"}',
          outputSample: '{"jobId": "job_sch_7721", "status": "QUEUED"}',
        },
        {
          id: 'step-2',
          stepNumber: '02',
          title: 'Timezone & Compliance Check',
          nodeType: 'processing',
          description: 'Enforces FCC & TCPA calling hours rules, DNC compliance, and optimal pick-up probability.',
          tech: 'TCPA Compliance Engine',
          latency: '8ms',
          inputSample: '{"callerTimezone": "America/New_York", "localTime": "09:05:00 AM"}',
          outputSample: '{"compliant": true, "permittedWindow": "08:00 - 20:00"}',
        },
        {
          id: 'step-3',
          stepNumber: '03',
          title: 'Carrier Outbound Dialing',
          nodeType: 'ai',
          description: 'Triggers outbound carrier call; once caller picks up, hands over audio stream to AI agent.',
          tech: 'SIP Outbound Trunk',
          latency: '450ms (Dialing)',
          inputSample: '{"destination": "+1 (212) 555-0199", "assignedAgent": "ag_reception"}',
          outputSample: '{"carrierStatus": "ANSWERED_HUMAN", "streamAttached": true}',
        },
        {
          id: 'step-4',
          stepNumber: '04',
          title: 'Conversation Logging',
          nodeType: 'egress',
          description: 'Analyzes outcome (Confirmed / Rescheduled / Voicemail) and updates schedule record.',
          tech: 'PostgreSQL + Webhook',
          latency: '25ms',
          inputSample: '{"outcome": "APPOINTMENT_CONFIRMED", "notes": "Confirmed for 9/24 at 10 AM"}',
          outputSample: '{"jobStatus": "COMPLETED", "calendarUpdated": true}',
        },
      ],
      capabilities: [
        { title: '84% Pickup Rate', desc: 'Smart local-presence caller ID routing drives 3x higher answer rates.', stat: '84% Connect' },
        { title: 'TCPA Compliant', desc: 'Strict observance of local calling hour boundaries and DNC registries.', stat: '100% Compliant' },
        { title: 'Auto Answering-Machine Detect', desc: 'Detects voicemail boxes in 1.2s and leaves a tailored personalized audio message.', stat: '<1.2s AMD' },
      ],
    },
    'agent-performance': {
      title: 'Agent Performance & Conversational Coaching',
      subtitle: 'Real-time CSAT tracking, script drop-off analysis, and prompt optimization',
      category: 'AI Telemetry',
      protocolBadge: 'Gemini Evaluator + Analytics',
      icon: Award,
      overview:
        'Continuous evaluation of every conversation using LLM evaluators to measure empathy, resolution speed, sentiment shifts, and protocol adherence.',
      steps: [
        {
          id: 'step-1',
          stepNumber: '01',
          title: 'Full Audio & Transcript Log',
          nodeType: 'ingress',
          description: 'Ingests stereo call recording and word-by-word timestamped transcript.',
          tech: 'Carrier Storage / Cloud Storage',
          latency: 'Sub-second',
          inputSample: '{"callId": "call_9901", "duration": 240, "channels": 2}',
          outputSample: '{"audioAvailable": true, "transcriptWords": 580}',
        },
        {
          id: 'step-2',
          stepNumber: '02',
          title: 'Sentiment & Tone Curve',
          nodeType: 'processing',
          description: 'Computes caller emotional trajectory from opening greeting to closing resolution.',
          tech: 'Auris Sentiment Engine',
          latency: '80ms',
          inputSample: '{"speaker": "Caller", "utterance": "I was nervous but that explains it thoroughly."}',
          outputSample: '{"sentiment": "+0.85 (Positive)", "confidence": 0.94}',
        },
        {
          id: 'step-3',
          stepNumber: '03',
          title: 'Prompt Evaluation Matrix',
          nodeType: 'ai',
          description: 'Scores accuracy against business knowledge base and flags compliance edge cases.',
          tech: 'Gemini Auto-Coach',
          latency: '150ms',
          inputSample: '{"rubric": ["Politeness", "Speed", "Policy Accuracy", "Booking Success"]}',
          outputSample: '{"score": 96.4, "flags": [], "improvementTips": "Agent could offer morning slot first."}',
        },
        {
          id: 'step-4',
          stepNumber: '04',
          title: 'Executive Dashboard Sync',
          nodeType: 'egress',
          description: 'Aggregates team benchmarks and alerts operations manager if resolution drops below 90%.',
          tech: 'Real-Time Stream Engine',
          latency: '15ms',
          inputSample: '{"dailyAverage": 94.8, "target": 90.0}',
          outputSample: '{"status": "HEALTHY", "csatLeader": "Dr. Sarah Mitchell"}',
        },
      ],
      capabilities: [
        { title: '100% Call Coverage', desc: 'No sample audits—every single phone interaction is scored objectively.', stat: '100% Inspected' },
        { title: 'Real-time Coaching Alerts', desc: 'Instant email/Slack alerts when an escalated inquiry requires human supervisor review.', stat: '<5s Alert' },
        { title: 'Prompt Auto-Tuning', desc: 'Identifies friction phrasing and suggests optimized prompt revisions.', stat: '+24% CSAT' },
      ],
    },
    'phone-numbers': {
      title: 'Global Carrier SIP Trunk & Number Provisioning',
      subtitle: 'Local DID, toll-free, and international phone numbers with instant carrier routing',
      category: 'Telephony Carrier',
      protocolBadge: 'PSTN / E.164 Routing',
      icon: Phone,
      overview:
        'Provision local and toll-free telephone numbers across 100+ countries, bind them to dedicated AI agents, and configure rollover routing to human backup staff.',
      steps: [
        {
          id: 'step-1',
          stepNumber: '01',
          title: 'Carrier Search & Allocation',
          nodeType: 'ingress',
          description: 'Searches Tier-1 telecommunication carriers for available local area codes and toll-free DIDs.',
          tech: 'Telnyx / Twilio Telephony API',
          latency: '210ms',
          inputSample: '{"country": "US", "areaCode": "212", "type": "local"}',
          outputSample: '{"allocatedNumber": "+1 (212) 555-0199", "status": "RESERVED"}',
        },
        {
          id: 'step-2',
          stepNumber: '02',
          title: 'SIP Trunk Termination',
          nodeType: 'processing',
          description: 'Establishes encrypted TLS / SRTP media gateway to Auris low-latency edge servers.',
          tech: 'SIP / TLS / SRTP',
          latency: '45ms',
          inputSample: '{"sipUri": "sip:inbound@edge.auris.ai", "encryption": "AES-256"}',
          outputSample: '{"status": "TRUNK_BOUND", "latency": "18ms"}',
        },
        {
          id: 'step-3',
          stepNumber: '03',
          title: 'Agent Assignment & Routing',
          nodeType: 'ai',
          description: 'Maps inbound DID to specific agent persona, timezone rules, and business hours logic.',
          tech: 'Routing Rule Engine',
          latency: '5ms',
          inputSample: '{"number": "+1 (212) 555-0199", "assignedAgentId": "ag_sarah_dental"}',
          outputSample: '{"routing": "ACTIVE", "failover": "+1 (212) 555-0100"}',
        },
        {
          id: 'step-4',
          stepNumber: '04',
          title: 'E.164 Regulatory Verification',
          nodeType: 'egress',
          description: 'Registers CNAM caller ID branding and STIR/SHAKEN A-level attestation for zero spam flags.',
          tech: 'STIR/SHAKEN Protocol',
          latency: 'Async',
          inputSample: '{"cnam": "Apollo Care", "attestation": "Level-A"}',
          outputSample: '{"spamFlagging": "0%", "carrierTrustScore": "100/100"}',
        },
      ],
      capabilities: [
        { title: 'Instant Provisioning', desc: 'Activate local phone numbers in 100+ countries with one click.', stat: '100+ Countries' },
        { title: 'STIR/SHAKEN Level-A', desc: 'Full carrier identity attestation prevents calls from being labeled spam.', stat: 'Level-A Certified' },
        { title: 'Failover to Human Staff', desc: 'Automatic rollover to human front desk if call requires complex triage.', stat: 'Zero Drop' },
      ],
    },
    calls: {
      title: 'Carrier Call Records, Audio Recordings & Transcripts',
      subtitle: 'Complete forensic audit trails with audio playback, key entity extraction, and CRM sync',
      category: 'Telephony Operations',
      protocolBadge: 'Cloud Storage + EMR Audit',
      icon: PhoneCall,
      overview:
        'Every second of every call is securely encrypted, transcribed, and structured into searchable clinical or sales entities (appointment requested, doctor name, insurance provider, callback number).',
      steps: [
        {
          id: 'step-1',
          stepNumber: '01',
          title: 'Stereo Audio Ingestion',
          nodeType: 'ingress',
          description: 'Splits caller and agent audio into separate channels for crystal-clear playback and analysis.',
          tech: 'Opus-to-MP3 Encoder',
          latency: '200ms',
          inputSample: '{"audioChannels": 2, "sampleRate": 48000, "duration": 182}',
          outputSample: '{"storedUri": "gs://auris-recordings/call_77182.mp3"}',
        },
        {
          id: 'step-2',
          stepNumber: '02',
          title: 'Diarized Dual-Track Transcription',
          nodeType: 'processing',
          description: 'Generates word-accurate transcript with sub-second timestamps and caller/agent labels.',
          tech: 'Deepgram Nova-2',
          latency: '90ms',
          inputSample: '{"audioStream": "channel_0 + channel_1"}',
          outputSample: '{"transcription": [{"speaker": "agent", "text": "Apollo Care, how may I help you?"}]}',
        },
        {
          id: 'step-3',
          stepNumber: '03',
          title: 'Structured Entity Extraction',
          nodeType: 'ai',
          description: 'Extracts critical fields: Caller Name, Phone, Appointment Slot, Insurance, Budget, and Urgent Flags.',
          tech: 'Gemini Entity Extractor',
          latency: '110ms',
          inputSample: '{"transcript": "This is Mark, booking for Friday 3pm, I have BlueCross."}',
          outputSample: '{"name": "Mark", "time": "Friday 15:00", "insurance": "BlueCross BlueShield"}',
        },
        {
          id: 'step-4',
          stepNumber: '04',
          title: 'Database & CRM Synchronization',
          nodeType: 'egress',
          description: 'Persists structured call log in encrypted cloud database and triggers connected integrations.',
          tech: 'Secure Cloud DB + Webhooks',
          latency: '30ms',
          inputSample: '{"recordId": "call_77182", "syncToHubSpot": true}',
          outputSample: '{"dbWrite": "SUCCESS", "hubspotContactId": "ct_8829"}',
        },
      ],
      capabilities: [
        { title: 'HIPAA & GDPR Compliant', desc: 'Automated PII scrubbing for patient health privacy compliance.', stat: 'HIPAA Safe' },
        { title: 'Searchable Transcripts', desc: 'Instant full-text query across thousands of historical voice sessions.', stat: '<100ms Search' },
        { title: 'Real-time Webhook Push', desc: 'Push call outcomes directly into your CRM, Slack, or ticketing system.', stat: 'Real-Time' },
      ],
    },
    campaigns: {
      title: 'High-Velocity Outbound Voice Campaigns',
      subtitle: 'Batch phone outreach for patient recall, payment reminders, and event invitations',
      category: 'Telephony Automation',
      protocolBadge: 'Predictive Dialing + SIP Trunk',
      icon: Megaphone,
      overview:
        'Upload thousands of contacts and dispatch AI-driven phone calls with rate-limiting, intelligent retry rules, and real-time conversion monitoring.',
      steps: [
        {
          id: 'step-1',
          stepNumber: '01',
          title: 'Audience Upload & Segmentation',
          nodeType: 'ingress',
          description: 'Ingest contact spreadsheet or sync leads directly from Google Sheets / Salesforce.',
          tech: 'CSV Parser & Lead Deduplicator',
          latency: '50ms',
          inputSample: '{"campaign": "Q3 Dental Hygiene Recall", "leadsCount": 450}',
          outputSample: '{"validatedLeads": 448, "dncFiltered": 2}',
        },
        {
          id: 'step-2',
          stepNumber: '02',
          title: 'Rate-Limiting & Concurrency Control',
          nodeType: 'processing',
          description: 'Maintains carrier line throughput (e.g. 5 concurrent lines) to prevent line exhaustion.',
          tech: 'Distributed Queue (Redis / BullMQ)',
          latency: '5ms',
          inputSample: '{"targetConcurrency": 5, "throttlePerMinute": 20}',
          outputSample: '{"activeCalls": 5, "inQueue": 443}',
        },
        {
          id: 'step-3',
          stepNumber: '03',
          title: 'Dynamic Agent Conversation',
          nodeType: 'ai',
          description: 'Agent uses personalized variables (e.g. Last Visit Date, Doctor Name) during the live call.',
          tech: 'Dynamic Persona Injection',
          latency: 'Real-time',
          inputSample: '{"caller": "Sarah", "lastVisit": "6 months ago", "doctor": "Dr. Mehta"}',
          outputSample: '{"openingLine": "Hi Sarah, Dr. Mehta wanted us to check if you are ready for your routine cleaning."}',
        },
        {
          id: 'step-4',
          stepNumber: '04',
          title: 'Live Conversion Analytics',
          nodeType: 'egress',
          description: 'Tracks confirmed appointments, callback requests, and voicemails in a live funnel.',
          tech: 'Campaign Analytics Engine',
          latency: '10ms',
          inputSample: '{"completedCalls": 120, "booked": 48}',
          outputSample: '{"conversionRate": "40.0%", "estimatedRevenue": "$7,200"}',
        },
      ],
      capabilities: [
        { title: '3.8x Higher Connect Rate', desc: 'Outperforms manual cold dialing by 380% with human-like conversational responsiveness.', stat: '3.8x Lift' },
        { title: 'Smart Retry Algorithms', desc: 'Intelligently retries unanswered calls at different hours across 3 business days.', stat: '3-Tier Retry' },
        { title: 'Instant Lead Hand-Off', desc: 'Hot prospects ready to purchase or book are immediately routed to your live sales staff.', stat: 'Live Transfer' },
      ],
    },
    knowledge: {
      title: 'Multimodal Document Vector RAG Knowledge Base',
      subtitle: 'Upload PDFs, Word docs, clinic manuals, and FAQs for instant voice hallucination suppression',
      category: 'Knowledge Retrieval',
      protocolBadge: 'Vector Embeddings + Cloud Storage',
      icon: BookOpen,
      overview:
        'Equip your voice agents with accurate facts about your services, pricing, practitioner credentials, and policies by simply uploading PDF, TXT, or DOCX files.',
      steps: [
        {
          id: 'step-1',
          stepNumber: '01',
          title: 'Document Ingestion & Chunking',
          nodeType: 'ingress',
          description: 'Parses uploaded clinic manuals or service price lists into semantically coherent text chunks.',
          tech: 'PDF / Text Semantic Chunker',
          latency: '1.2s',
          inputSample: '{"file": "Clinic_Services_Pricing_2026.pdf", "size": "2.4MB"}',
          outputSample: '{"chunksCount": 84, "overlap": "50 tokens"}',
        },
        {
          id: 'step-2',
          stepNumber: '02',
          title: 'Vector Embedding Generation',
          nodeType: 'processing',
          description: 'Transforms text chunks into dense 768-dimensional semantic embeddings.',
          tech: 'Text-Embedding-004 / Gemini',
          latency: '240ms',
          inputSample: '{"chunk": "Teeth whitening pricing is $249 for in-office LED treatment."}',
          outputSample: '{"vector": [0.021, -0.418, 0.119, "..."]}',
        },
        {
          id: 'step-3',
          stepNumber: '03',
          title: 'Sub-30ms Vector Similarity Search',
          nodeType: 'ai',
          description: 'When caller asks a question, finds the top 3 most relevant factual snippets in under 30ms.',
          tech: 'HNSW / Cosine Vector Index',
          latency: '22ms',
          inputSample: '{"callerQuery": "How much does the laser whitening cost?"}',
          outputSample: '{"topMatch": "Teeth whitening pricing is $249...", "similarity": 0.94}',
        },
        {
          id: 'step-4',
          stepNumber: '04',
          title: 'Factual Prompt Augmentation',
          nodeType: 'egress',
          description: 'Injects verified context directly into the agent reasoning prompt to guarantee 0% hallucination.',
          tech: 'Auris RAG Guard',
          latency: '10ms',
          inputSample: '{"verifiedContext": "$249 in-office LED whitening"}',
          outputSample: '{"agentSpeech": "Our in-office whitening treatment is currently $249."}',
        },
      ],
      capabilities: [
        { title: 'Zero Hallucinations', desc: 'Agents strictly cite verified knowledge documents without fabricating policies.', stat: '0% Hallucination' },
        { title: 'Multi-Format Support', desc: 'Accepts PDF, DOCX, CSV, TXT, and live webpage URLs for automated synchronization.', stat: 'Any Document' },
        { title: 'Instant Cloud Sync', desc: 'Changes made to uploaded files propagate to active phone agents within seconds.', stat: '<5s Propagation' },
      ],
    },
    'web-voice': {
      title: 'Ultra-Low Latency WebRTC Audio Sandbox & Talk to Auris',
      subtitle: 'Real-time browser microphone streaming with Gemini 2.5 Live Voice',
      category: 'Audio Engineering',
      protocolBadge: 'WebRTC + AudioWorklet',
      icon: Mic,
      overview:
        'Test talk with your AI agent straight from your browser. Uses high-fidelity WebRTC PCM audio streams, bidirectional WebSockets, and real-time visual waveform feedback.',
      steps: [
        {
          id: 'step-1',
          stepNumber: '01',
          title: 'Browser Microphone Capture',
          nodeType: 'ingress',
          description: 'Captures 16kHz PCM audio via browser AudioWorklet with echo cancellation and noise suppression.',
          tech: 'WebRTC / AudioWorklet API',
          latency: '8ms',
          inputSample: '{"sampleRate": 16000, "echoCancellation": true, "noiseSuppression": true}',
          outputSample: '{"audioFrames": "16-bit PCM Linear", "packetSize": "512 samples"}',
        },
        {
          id: 'step-2',
          stepNumber: '02',
          title: 'Bi-directional WebSocket Pipe',
          nodeType: 'processing',
          description: 'Streams raw audio packets directly to the server with zero transcoding overhead.',
          tech: 'Binary WebSocket (wss://)',
          latency: '18ms',
          inputSample: '{"streamId": "webrtc_session_881", "direction": "client_to_server"}',
          outputSample: '{"packetState": "ACK", "jitter": "1.2ms"}',
        },
        {
          id: 'step-3',
          stepNumber: '03',
          title: 'Speech-to-Speech LLM Processing',
          nodeType: 'ai',
          description: 'Gemini real-time speech processing synthesizes natural audio reply with genuine cadence.',
          tech: 'Gemini 2.5 Flash Voice Engine',
          latency: '140ms',
          inputSample: '{"userUtteranceAudio": "<binary_pcm>"}',
          outputSample: '{"agentSpeechChunk": "<binary_opus>", "transcript": "Hello, how can I assist you today?"}',
        },
        {
          id: 'step-4',
          stepNumber: '04',
          title: 'Live Waveform & Audio Playback',
          nodeType: 'egress',
          description: 'Streams audio back to client headphones and renders real-time reactive canvas frequency bands.',
          tech: 'Web Audio API AnalyserNode',
          latency: '6ms',
          inputSample: '{"receivedAudio": "<opus_stream>"}',
          outputSample: '{"decibelPeak": "-12dB", "canvasFps": 60}',
        },
      ],
      capabilities: [
        { title: 'Sub-200ms Interactive Latency', desc: 'Speaking with the agent feels natural and immediate like a real phone call.', stat: '<200ms' },
        { title: 'Barge-In Interruption', desc: 'Interrupt the agent mid-sentence naturally; the agent stops talking and listens instantly.', stat: 'Instant Barge-in' },
        { title: 'Full Browser Compatibility', desc: 'Works seamlessly on Chrome, Safari, Edge, and iOS/Android mobile browsers.', stat: 'Universal' },
      ],
    },
    integrations: {
      title: 'Enterprise CRM & Webhook Automation',
      subtitle: 'Native connectors for Google Calendar, Salesforce, HubSpot, Razorpay, and Secure Media Storage',
      category: 'API Ecosystem',
      protocolBadge: 'OAuth2 + REST Webhooks',
      icon: Blocks,
      overview:
        'Connect your voice agents directly to your existing toolstack. Book appointments directly into Google Calendar, push leads into HubSpot, and notify your team on Slack.',
      steps: [
        {
          id: 'step-1',
          stepNumber: '01',
          title: 'Event Detection & Payload Build',
          nodeType: 'ingress',
          description: 'Call concludes and triggers structured event package (Caller, Duration, Entities, Action).',
          tech: 'Event Dispatcher',
          latency: '5ms',
          inputSample: '{"event": "call.completed", "entities": {"appointment": true, "email": "clara@gmail.com"}}',
          outputSample: '{"eventPayload": "READY", "targetDestinations": ["GoogleCalendar", "HubSpot"]}',
        },
        {
          id: 'step-2',
          stepNumber: '02',
          title: 'OAuth2 Token Refresh & Auth',
          nodeType: 'processing',
          description: 'Validates API credentials securely using AES-256 encrypted server environment secrets.',
          tech: 'OAuth2 Client Manager',
          latency: '20ms',
          inputSample: '{"integration": "Google Calendar", "scope": "calendar.events"}',
          outputSample: '{"authHeader": "Bearer ya29.a0AX...", "expiresIn": 3600}',
        },
        {
          id: 'step-3',
          stepNumber: '03',
          title: 'Bi-directional Data Mutation',
          nodeType: 'ai',
          description: 'Inserts calendar event, updates CRM contact stage, and dispatches SMS confirmation to caller.',
          tech: 'Google Calendar API + Twilio SMS',
          latency: '95ms',
          inputSample: '{"summary": "Dental Consultation - Clara", "start": "2026-09-24T14:00:00Z"}',
          outputSample: '{"calendarEventId": "evt_99184", "smsDeliveryStatus": "DELIVERED"}',
        },
        {
          id: 'step-4',
          stepNumber: '04',
          title: 'Delivery Receipt & Retry Log',
          nodeType: 'egress',
          description: 'Logs delivery receipt in audit database with automatic exponential backoff if third-party is slow.',
          tech: 'Cloud Event Audit Engine',
          latency: '15ms',
          inputSample: '{"eventId": "evt_99184", "status": "200_OK"}',
          outputSample: '{"syncStatus": "SUCCESSFUL", "auditLogged": true}',
        },
      ],
      capabilities: [
        { title: 'Google Calendar 2-Way Sync', desc: 'Real-time slot checking ensures zero double-bookings or conflicting appointments.', stat: '2-Way Sync' },
        { title: 'Instant Lead Push', desc: 'Leads arrive in your CRM within 3 seconds of hanging up the phone.', stat: '<3s Sync' },
        { title: 'Secure OAuth2 Credentials', desc: 'Your API secrets never touch the browser; all requests are signed on server.', stat: 'AES-256' },
      ],
    },
    analytics: {
      title: 'Telephony Throughput, Latency & SLA Analytics',
      subtitle: 'Executive dashboards, minute utilization charts, resolution rates, and carrier health',
      category: 'Business Intelligence',
      protocolBadge: 'Timeseries Telemetry',
      icon: BarChart3,
      overview:
        'Monitor carrier trunk uptime, peak hour call traffic, appointment conversion rates, and telephony spend in one unified analytics dashboard.',
      steps: [
        {
          id: 'step-1',
          stepNumber: '01',
          title: 'Timeseries Data Collection',
          nodeType: 'ingress',
          description: 'Collects sub-second latency, duration, caller sentiment, and termination reasons.',
          tech: 'InfluxDB / Timeseries DB',
          latency: 'Continuous',
          inputSample: '{"timestamp": "2026-09-22T12:00:00Z", "latencyMs": 242, "status": "resolved"}',
          outputSample: '{"buffered": true, "windowSize": "1 minute"}',
        },
        {
          id: 'step-2',
          stepNumber: '02',
          title: 'Aggregation & Hourly Rollups',
          nodeType: 'processing',
          description: 'Calculates rolling averages for resolution rate, average call duration, and hourly peaks.',
          tech: 'Analytical Query Engine',
          latency: '40ms',
          inputSample: '{"query": "ROLLUP_7D", "metrics": ["totalCalls", "answeredRate", "bookingRate"]}',
          outputSample: '{"totalCalls": 248, "answeredRate": 98.4, "avgDuration": "3m 12s"}',
        },
        {
          id: 'step-3',
          stepNumber: '03',
          title: 'Anomaly & Spike Detection',
          nodeType: 'ai',
          description: 'Machine learning flags unusual spikes in missed calls, high carrier latency, or spam surges.',
          tech: 'Anomaly Detection Engine',
          latency: '25ms',
          inputSample: '{"currentTraffic": "45 calls/hr", "historicalBaseline": "12 calls/hr"}',
          outputSample: '{"alert": "SURGE_DETECTED", "severity": "INFO"}',
        },
        {
          id: 'step-4',
          stepNumber: '04',
          title: 'Executive Visual Rendering',
          nodeType: 'egress',
          description: 'Streams responsive SVG charts and key performance metrics to the dashboard.',
          tech: 'Recharts & Vector SVG',
          latency: '16ms (60 FPS)',
          inputSample: '{"chartData": [{"day": "Mon", "answered": 42}, "..."]}',
          outputSample: '{"renderStatus": "OPTIMAL"}',
        },
      ],
      capabilities: [
        { title: 'Sub-Minute Rollups', desc: 'Real-time telemetry reflects call outcomes as soon as callers hang up.', stat: '<1 min Freshness' },
        { title: 'Financial ROI Tracking', desc: 'Measures front-desk labor hours saved and total revenue generated from bookings.', stat: 'ROI Analytics' },
        { title: 'Carrier Quality Metrics', desc: 'Deep visibility into jitter, MOS scores, packet loss, and connection latency.', stat: 'MOS 4.4+' },
      ],
    },
    billing: {
      title: 'Carrier Usage Metering & Real-Time Billing',
      subtitle: 'Transparent minute tracking, plan management, top-ups, and invoice history',
      category: 'Billing & Usage',
      protocolBadge: 'Stripe + Razorpay Gateway',
      icon: CreditCard,
      overview:
        'Real-time usage metering tracks active telephony minutes to the exact second. Top up calling credit securely with automated low-balance safeguards.',
      steps: [
        {
          id: 'step-1',
          stepNumber: '01',
          title: 'Call Duration Metering',
          nodeType: 'ingress',
          description: 'Calculates exact billing seconds from carrier SIP BYE packet.',
          tech: 'Carrier Usage Meter',
          latency: 'Real-time',
          inputSample: '{"callSid": "CA9921", "billableSeconds": 184, "carrierCostPerMin": 0.04}',
          outputSample: '{"deductedMinutes": 3.07, "status": "METERED"}',
        },
        {
          id: 'step-2',
          stepNumber: '02',
          title: 'Account Ledger Deduction',
          nodeType: 'processing',
          description: 'Deducts utilized minutes from company plan quota in an atomic database transaction.',
          tech: 'Atomic Transaction Engine',
          latency: '18ms',
          inputSample: '{"businessId": "biz_01", "minutesDeducted": 3.07}',
          outputSample: '{"remainingMinutes": 748.2, "status": "BALANCED"}',
        },
        {
          id: 'step-3',
          stepNumber: '03',
          title: 'Low Balance Protection',
          nodeType: 'ai',
          description: 'Sends automated warning when plan minutes reach below 10%, preventing service disruption.',
          tech: 'Billing Alert Engine',
          latency: '5ms',
          inputSample: '{"remainingPercent": 15, "threshold": 10}',
          outputSample: '{"alertNeeded": false, "health": "SUFFICIENT"}',
        },
        {
          id: 'step-4',
          stepNumber: '04',
          title: 'Instant Top-Up Gateway',
          nodeType: 'egress',
          description: 'Process one-click minute top-ups via Stripe or Razorpay with instant allocation.',
          tech: 'Stripe / Razorpay Payment',
          latency: '450ms',
          inputSample: '{"topupPack": "500 Minutes", "amount": "$45.00"}',
          outputSample: '{"paymentStatus": "PAID", "receiptUrl": "https://auris.ai/inv/8821"}',
        },
      ],
      capabilities: [
        { title: 'Per-Second Accuracy', desc: 'No rounding up to full minutes. You only pay for exact connected time.', stat: 'Exact Second' },
        { title: 'Rollover Minutes', desc: 'Unused plan minutes roll over to the next billing period automatically.', stat: 'Auto Rollover' },
        { title: 'Instant Quota Topup', desc: 'Add 500 or 2,000 minutes anytime with 1-click checkout.', stat: 'Instant Credit' },
      ],
    },
    settings: {
      title: 'Enterprise Security, SIP Trunks & RBAC Governance',
      subtitle: 'Workspace credentials, multi-location configuration, API keys, and access control',
      category: 'Governance & Security',
      protocolBadge: 'RBAC + 256-bit Encryption',
      icon: Settings,
      overview:
        'Manage business profile, team roles (Owner, Manager, Front Desk), carrier webhooks, and security audit logs with end-to-end data encryption.',
      steps: [
        {
          id: 'step-1',
          stepNumber: '01',
          title: 'Role-Based Access Control',
          nodeType: 'ingress',
          description: 'Enforces strict permission boundaries for clinicians, operators, and billing admins.',
          tech: 'Identity Auth & Security Rules',
          latency: '10ms',
          inputSample: '{"userRole": "operator", "action": "EDIT_BILLING"}',
          outputSample: '{"authorized": false, "reason": "REQUIRES_OWNER_ROLE"}',
        },
        {
          id: 'step-2',
          stepNumber: '02',
          title: 'Encrypted Credential Storage',
          nodeType: 'processing',
          description: 'Stores third-party API keys and carrier credentials with AES-256 envelope encryption.',
          tech: 'GCP Secret Manager',
          latency: '22ms',
          inputSample: '{"keyName": "TWILIO_AUTH_TOKEN", "status": "ENCRYPTED"}',
          outputSample: '{"cipher": "aes-gcm-256", "keyVersion": "v2"}',
        },
        {
          id: 'step-3',
          stepNumber: '03',
          title: 'Audit Logging & Forensic Trail',
          nodeType: 'ai',
          description: 'Every configuration change and agent prompt edit is timestamped and signed.',
          tech: 'Immutable Security Audit Log',
          latency: '15ms',
          inputSample: '{"action": "PROMPT_UPDATED", "modifiedBy": "Dr. Sarah", "timestamp": "2026-09-22T08:00:00Z"}',
          outputSample: '{"auditId": "aud_88291", "verified": true}',
        },
        {
          id: 'step-4',
          stepNumber: '04',
          title: 'Compliance & Export Tools',
          nodeType: 'egress',
          description: 'Download full SOC2, HIPAA audit reports and export complete workspace data in JSON/CSV.',
          tech: 'Compliance Export Engine',
          latency: 'Async',
          inputSample: '{"reportType": "HIPAA_AUDIT", "period": "Last 90 Days"}',
          outputSample: '{"downloadUrl": "https://auris.ai/reports/hipaa_q3.pdf"}',
        },
      ],
      capabilities: [
        { title: 'Role-Based Multi-User', desc: 'Invite staff members with restricted views (e.g. view calls only, no prompt editing).', stat: 'RBAC Multi-Role' },
        { title: 'HIPAA & SOC 2 Ready', desc: 'Enterprise data retention controls and complete audit trails for compliance.', stat: 'SOC2 Ready' },
        { title: 'Zero Vendor Lock-in', desc: 'Export your call recordings, transcripts, and contact history anytime in one click.', stat: 'Full Portability' },
      ],
    },
  };

  // Default fallback for any view
  const spec: FeatureSpec = featureSpecs[currentView] || featureSpecs.dashboard;
  const currentStep = spec.steps[selectedStepIndex] || spec.steps[0];
  const Icon = spec.icon;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* 1. TOP ACCESS GATE BANNER */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-5 sm:p-6 bg-slate-900 dark:bg-slate-950 text-white border border-slate-800 shadow-xl relative overflow-hidden"
      >
        {/* Subtle accent glow */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -top-10 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Lock className="w-3.5 h-3.5" />
                Live Feature Locked
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                <Network className="w-3.5 h-3.5 text-sky-400" />
                Architecture & Telemetry Preview Mode
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Sign in to operate live <span className="text-emerald-400">{spec.title}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Below is the verified end-to-end operational architecture and data pipeline. Log in to your Auris account or create a free workspace to deploy, configure, and monitor live agents in real time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onOpenAuth('login')}
              className="px-5 py-3 rounded-xl bg-white text-slate-950 hover:bg-slate-100 font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Sign In to Access</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onOpenAuth('signup')}
              className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Create Free Account</span>
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </motion.button>

            {onDemoLogin && (
              <button
                onClick={onDemoLogin}
                className="w-full sm:w-auto px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition-colors cursor-pointer"
                title="Log in instantly as a verified demo operator"
              >
                1-Click Instant Demo Login
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* 2. FEATURE HEADER CARD */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200/60 dark:border-emerald-800/60 shadow-xs">
            <Icon className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {spec.category}
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-sky-50 text-sky-700 dark:bg-sky-950/80 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                {spec.protocolBadge}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight">
              {spec.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
              {spec.subtitle}
            </p>
          </div>
        </div>

        {/* Tab switcher for deeper inspection */}
        <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 self-start md:self-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('flowchart')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'flowchart'
                ? 'bg-white dark:bg-slate-700 text-slate-950 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-950'
            }`}
          >
            Interactive Flowchart
          </button>
          <button
            onClick={() => setActiveTab('payload')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'payload'
                ? 'bg-white dark:bg-slate-700 text-slate-950 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-950'
            }`}
          >
            Payload & Telemetry
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'specs'
                ? 'bg-white dark:bg-slate-700 text-slate-950 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-950'
            }`}
          >
            Capabilities
          </button>
        </div>
      </div>

      {/* 3. MAIN INTERACTIVE FLOWCHART PIPELINE */}
      {activeTab === 'flowchart' && (
        <div className="space-y-6">
          {/* Horizontal Sequential Flowchart Nodes */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs transition-colors">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Live Operational Pipeline Architecture
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Click any node to inspect execution latency, data transformations, and telemetry.
                </p>
              </div>

              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Pipeline Verified
              </span>
            </div>

            {/* Nodes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
              {spec.steps.map((step, idx) => {
                const isSelected = selectedStepIndex === idx;
                return (
                  <motion.div
                    key={step.id}
                    onClick={() => setSelectedStepIndex(idx)}
                    whileHover={{ y: -3, scale: 1.01 }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between relative ${
                      isSelected
                        ? 'bg-slate-50 dark:bg-slate-800/90 border-emerald-500 dark:border-emerald-400 shadow-md ring-2 ring-emerald-500/20'
                        : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    {/* Top Step Counter & Latency */}
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`text-xs font-black px-2 py-0.5 rounded-md ${
                          isSelected
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        STEP {step.stepNumber}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 font-mono">
                        {step.latency}
                      </span>
                    </div>

                    {/* Step Title & Description */}
                    <div className="space-y-1.5 mb-4">
                      <h4 className="font-extrabold text-slate-950 dark:text-white text-sm">
                        {step.title}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                        {step.description}
                      </p>
                    </div>

                    {/* Bottom Tech Badge */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      <span className="truncate">{step.tech}</span>
                      {isSelected ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Detailed Selected Step Deep-Dive */}
          <div className="bg-slate-900 dark:bg-slate-950 rounded-2xl p-6 text-white border border-slate-800 shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800 mb-6">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Inspecting Stage {currentStep.stepNumber} of {spec.steps.length}
                </span>
                <h3 className="text-lg font-black text-white mt-0.5">
                  {currentStep.title} &bull; <span className="font-mono text-slate-400 text-sm">{currentStep.tech}</span>
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-mono">
                  SLA Execution: <strong className="text-emerald-400">{currentStep.latency}</strong>
                </span>
                <button
                  onClick={() => onOpenAuth('signup')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Lock className="w-3 h-3" />
                  Unlock Live Execution
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Ingress Packet */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-sky-400" />
                    Ingress Payload Schema
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">application/json</span>
                </div>
                <pre className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-sky-300 font-mono text-xs overflow-x-auto">
                  {JSON.stringify(JSON.parse(currentStep.inputSample), null, 2)}
                </pre>
              </div>

              {/* Output Response */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                    Transformed Egress Output
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">200 OK</span>
                </div>
                <pre className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-emerald-300 font-mono text-xs overflow-x-auto">
                  {JSON.stringify(JSON.parse(currentStep.outputSample), null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. PAYLOAD & TELEMETRY VIEW */}
      {activeTab === 'payload' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-extrabold text-slate-950 dark:text-white">
              End-to-End Pipeline Telemetry & Data Payloads
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              Review every JSON payload and transformation event handled by this feature in production.
            </p>
          </div>

          <div className="space-y-4">
            {spec.steps.map((st) => (
              <div
                key={st.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-black bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                      STEP {st.stepNumber}
                    </span>
                    <span className="font-bold text-sm text-slate-950 dark:text-white">{st.title}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    Latency: {st.latency}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Input</p>
                    <code className="text-sky-700 dark:text-sky-300">{st.inputSample}</code>
                  </div>
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Output</p>
                    <code className="text-emerald-700 dark:text-emerald-300">{st.outputSample}</code>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. CAPABILITIES VIEW */}
      {activeTab === 'specs' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {spec.capabilities.map((cap, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                  {cap.stat}
                </span>
                <h4 className="text-base font-extrabold text-slate-950 dark:text-white">
                  {cap.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                  {cap.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Enterprise SLA Guaranteed</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 6. BOTTOM CONVERSION CARD */}
      <div className="p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center md:text-left">
          <h3 className="text-xl font-black text-white">
            Ready to deploy your customized {spec.title}?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Join hundreds of healthcare clinics, real estate firms, and service businesses automating voice calls with Auris.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
          <button
            onClick={() => onOpenAuth('login')}
            className="px-6 py-3 rounded-xl bg-white text-slate-950 hover:bg-slate-100 font-extrabold text-xs shadow-md transition-all cursor-pointer"
          >
            Log In
          </button>
          <button
            onClick={() => onOpenAuth('signup')}
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
          >
            <span>Start Free Trial</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
