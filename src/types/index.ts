export type Role = 'owner' | 'admin' | 'manager' | 'agent_manager' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: Role;
  businessId: string;
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
  provider: 'OmniDimension' | 'AurisEngine';
  providerAgentId?: string;
}

export type CallStatus = 'answered' | 'missed' | 'voicemail' | 'failed';
export type CallDirection = 'inbound' | 'outbound';

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
  durationSeconds: number;
  durationFormatted: string;
  timestamp: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  transcript: TranscriptEntry[];
  audioUrl?: string;
  extractedEntities?: {
    appointmentRequested?: boolean;
    appointmentTime?: string;
    intent?: string;
    leadScore?: number;
    notes?: string;
  };
  providerCallId?: string;
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
  provider: 'OmniDimension' | 'Twilio' | 'SIP';
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
  type: 'document' | 'url' | 'faq' | 'website';
  content?: string;
  sizeOrCount: string;
  status: 'ready' | 'processing' | 'failed';
  updatedAt: string;
  assignedAgentIds?: string[];
  assignedAgents?: string[];
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
  minutesIncluded: number;
  agentsLimit: number;
  phoneNumbersLimit: number;
  description: string;
  features: string[];
  popular?: boolean;
}
