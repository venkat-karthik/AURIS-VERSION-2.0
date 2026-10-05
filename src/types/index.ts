export type Role = 'super_admin' | 'admin' | 'owner' | 'manager' | 'customer_admin' | 'agent_manager' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: Role;
  businessId: string;
  organizationId?: string;
}

export type LeadStatus = 'new' | 'queued' | 'calling' | 'contacted' | 'qualified' | 'appointment_booked' | 'callback_requested' | 'unreachable' | 'failed' | 'opted_out';

export interface Lead {
  id: string;
  businessId: string;
  campaignId?: string;
  name: string;
  phone: string;
  email?: string;
  source?: string;
  status: LeadStatus;
  qualificationNotes?: string;
  leadScore?: number;
  appointmentTime?: string;
  customFields?: Record<string, string>;
  createdAt: string;
  lastContactedAt?: string;
  callsCount?: number;
}

export interface Business {
  id: string;
  name: string;
  slug: string;
  industry: string;
  planId: string;
  phone: string;
  timezone: string;
  createdAt: string;
}

export type AgentType = 'receptionist' | 'sales' | 'support' | 'custom';
export type AgentStatus = 'active' | 'paused' | 'draft';

export interface Agent {
  id: string;
  businessId: string;
  name: string;
  description: string;
  industry: string;
  type: AgentType;
  voiceId: string;
  voiceName: string;
  language: string;
  speed: number;
  pitch: number;
  status: AgentStatus;
  callsCount: number;
  minutesUsed: number;
  createdAt: string;
  instructions: {
    role: string;
    personality: string;
    objectives: string;
    rules: string;
    greeting: string;
    fallback: string;
  };
  tools: {
    calendarBooking: boolean;
    crmSync: boolean;
    callTransfer: boolean;
    smsFollowup: boolean;
    transferNumber?: string;
  };
  knowledgeBaseIds: string[];
  liveWebSearchGrounding?: boolean;
  customKnowledgeSnippet?: string;
  provider: 'AurisEngine' | 'AurisCarrierMesh' | 'CarrierMesh';
  providerAgentId?: string;
}

export type CallStatus = 'answered' | 'missed' | 'voicemail' | 'failed';
export type CallDirection = 'inbound' | 'outbound';
export type CallPriority = 'urgent' | 'high' | 'medium' | 'low';

export interface TranscriptEntry {
  speaker: 'agent' | 'caller';
  text: string;
  timestamp: string;
}

export interface Call {
  id: string;
  businessId: string;
  callerNumber: string;
  callerName?: string;
  agentId: string;
  agentName: string;
  direction: CallDirection;
  status: CallStatus;
  priority?: CallPriority;
  priorityReason?: string;
  durationSeconds: number;
  durationFormatted: string;
  timestamp: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  sentimentScorePercent?: number;
  sentimentDetails?: string;
  customerRequestCategory?: string;
  customerRequest?: string;
  extractedVariables?: Record<string, string>;
  hangupReason?: string;
  hangupSource?: string;
  transcript: TranscriptEntry[];
  audioUrl?: string;
  extractedEntities?: {
    appointmentRequested?: boolean;
    appointmentTime?: string;
    intent?: string;
    leadScore?: number;
    notes?: string;
    customerRequest?: string;
    priorityReason?: string;
  };
  providerCallId?: string;
  carrierResponse?: {
    success: boolean;
    carrierEndpoint: string;
    authHeaderUsed: string;
    callSid?: string;
    telephonyStatus: string;
    latencyMs?: number;
  };
}

export interface PhoneNumber {
  id: string;
  businessId: string;
  number: string;
  country: string;
  friendlyName?: string;
  assignedAgentId?: string;
  assignedAgentName?: string;
  status: 'active' | 'inactive';
  direction?: 'both' | 'inbound' | 'outbound';
  provider: 'PlivoIndia' | 'PiloIndia' | 'Plivo' | 'AurisCarrierMesh' | 'Twilio' | 'SIP';
  monthlyCost?: number;
  forwardingNumber?: string;
  providerNumberId?: string;
}

export interface Campaign {
  id: string;
  businessId: string;
  name: string;
  agentId: string;
  agentName: string;
  status: 'draft' | 'running' | 'paused' | 'completed' | 'scheduled';
  totalContacts: number;
  completedContacts?: number;
  answeredContacts?: number;
  failedContacts?: number;
  scheduleTime?: string;
  scheduledTime?: string;
  minutesUsed?: number;
  createdAt?: string;
  completedCalls?: number;
  answeredCalls?: number;
  conversionRate?: string;
  concurrentCalls?: number;
}

export interface KnowledgeItem {
  id: string;
  businessId: string;
  title: string;
  type: 'document' | 'url' | 'faq' | 'website' | 'csv' | 'summary';
  content?: string;
  sizeOrCount: string;
  status: 'ready' | 'processing' | 'failed';
  updatedAt: string;
  assignedAgentIds?: string[];
  assignedAgents?: string[];
  cloudinaryUrl?: string;
  cloudinaryPublicId?: string;
  csvRowCount?: number;
}

export interface IntegrationItem {
  id: string;
  name: string;
  category: 'crm' | 'calendar' | 'communication' | 'automation' | 'payments' | 'webhooks';
  description: string;
  connected: boolean;
  icon: string;
  lastSynced?: string;
}

export interface Plan {
  id: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  priceMonthlyInr: number;
  priceYearlyInr: number;
  minutesIncluded: number;
  agentsLimit: number;
  phoneNumbersLimit: number;
  description: string;
  features: string[];
  popular?: boolean;
}

export type ScheduledCallStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'failed' | 'rescheduled';

export interface ScheduledCall {
  id: string;
  businessId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  agentId: string;
  agentName: string;
  scheduledAt: string;
  timezone: string;
  purpose: string;
  status: ScheduledCallStatus;
  priority: CallPriority;
  notes?: string;
  retryCount: number;
  maxRetries: number;
  createdAt: string;
  completedAt?: string;
  callOutcome?: string;
  simulatedDuration?: number;
}

export interface AgentPerformanceMetrics {
  agentId: string;
  agentName: string;
  type: AgentType;
  voiceName: string;
  status: AgentStatus;
  totalCalls: number;
  totalMinutes: number;
  resolutionRate: number;
  avgHandleTimeSeconds: number;
  csatScore: number;
  firstCallResolution: number;
  sentimentDistribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  scriptAdherenceScore: number;
  leadConversionRate: number;
  costPerCall: number;
  topDropoffPoints: string[];
  topPerformingIntents: Array<{ intent: string; count: number; successRate: number }>;
}

export interface AgentCoachingInsight {
  overallGrade: string;
  executiveSummary: string;
  strengths: string[];
  weaknesses: string[];
  actionableRecommendations: string[];
  suggestedPromptUpdate?: string;
  generatedAt: string;
}

