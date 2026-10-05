import { User, Business, Agent, Call, PhoneNumber, Campaign, KnowledgeItem, IntegrationItem, Plan } from '../types';

export const mockCurrentUser: User = {
  id: 'usr_venkat_76715',
  name: 'Venkat Karthik',
  email: 'karthikvenkat316@gmail.com',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  role: 'owner',
  businessId: 'biz_venkat_01',
};

export const mockBusinesses: Business[] = [
  {
    id: 'biz_venkat_01',
    name: 'Auris Voice AI Cloud',
    slug: 'auris-voice-cloud',
    industry: 'Real Estate & Customer Engagement',
    planId: 'business',
    phone: '+91 80 4879 9695',
    timezone: 'Asia/Kolkata (IST)',
    createdAt: '2026-03-01T08:00:00Z',
  },
];

export const mockAgents: Agent[] = [];

export const mockCalls: Call[] = [];

export const mockCallActivityData = [
  { date: 'Mon', answered: 0, missed: 0, total: 0 },
  { date: 'Tue', answered: 0, missed: 0, total: 0 },
  { date: 'Wed', answered: 0, missed: 0, total: 0 },
  { date: 'Thu', answered: 0, missed: 0, total: 0 },
  { date: 'Fri', answered: 0, missed: 0, total: 0 },
];

export const mockPhoneNumbers: PhoneNumber[] = [];

export const mockCampaigns: Campaign[] = [];

export const mockKnowledgeItems: KnowledgeItem[] = [];

export const mockIntegrations: IntegrationItem[] = [
  {
    id: 'int_gcal',
    name: 'Google Calendar',
    category: 'calendar',
    description: 'Direct real-time two-way sync for scheduling consultations, demos, and client meetings.',
    connected: true,
    icon: 'Calendar',
    lastSynced: 'Live Sync',
  },
  {
    id: 'int_hubspot',
    name: 'HubSpot CRM',
    category: 'crm',
    description: 'Auto-log voice calls, transcripts, sentiment scores, and created contacts instantly.',
    connected: true,
    icon: 'Database',
    lastSynced: '15 mins ago',
  },
  {
    id: 'int_salesforce',
    name: 'Salesforce',
    category: 'crm',
    description: 'Enterprise pipeline management with automatic lead qualification recording.',
    connected: false,
    icon: 'Cloud',
  },
  {
    id: 'int_slack',
    name: 'Slack Alerts',
    category: 'communication',
    description: 'Send instant notifications to dedicated channels on missed calls or high-value leads.',
    connected: true,
    icon: 'MessageSquare',
    lastSynced: 'Active',
  },
  {
    id: 'int_razorpay',
    name: 'Razorpay Payments',
    category: 'payments',
    description: 'Seamless subscription billing and usage fee collection powered by Razorpay.',
    connected: true,
    icon: 'CreditCard',
    lastSynced: 'Today',
  },
  {
    id: 'int_webhook',
    name: 'Enterprise Telephony Webhooks',
    category: 'webhooks',
    description: 'Receive signed HTTPS payloads on call.started, call.completed, and appointment.created.',
    connected: true,
    icon: 'Webhook',
    lastSynced: 'Active listener',
  },
];

export const mockPlans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    priceMonthly: 59,
    priceYearly: 49,
    priceMonthlyInr: 4999,
    priceYearlyInr: 3999,
    minutesIncluded: 400,
    agentsLimit: 2,
    phoneNumbersLimit: 1,
    description: 'Perfect for solo clinics, real estate brokers, and local businesses automating inbound receptionist calls.',
    features: [
      '400 Inbound & Outbound minutes/mo',
      '1 Dedicated +91 Indian Phone Number (Plivo India)',
      '2 Custom Voice Agents (Cartesia Sonic & Sarvam AI)',
      'Sub-100ms ultra-low latency conversational engine',
      'Google Calendar & WhatsApp booking confirmations',
      'Dual-track human & AI call recordings on Cloudinary',
      'Full sentiment & urgency priority analysis',
      'Email & WhatsApp priority support',
    ],
  },
  {
    id: 'growth',
    name: 'Growth & Real Estate',
    popular: true,
    priceMonthly: 94,
    priceYearly: 75,
    priceMonthlyInr: 7850,
    priceYearlyInr: 6280,
    minutesIncluded: 1200,
    agentsLimit: 5,
    phoneNumbersLimit: 2,
    description: 'Tailored for active real estate agencies, multi-doctor clinics, and outbound lead follow-up teams.',
    features: [
      '1,200 Inbound & Outbound minutes/mo',
      '2 Dedicated +91 Indian Phone Numbers (Inbound + Outbound)',
      '5 Custom Multilingual Voice Agents (English, Hindi, Telugu, Tamil)',
      'Native Sarvam AI Indic language model switching',
      'CRM integration (HubSpot, Google Sheets & Webhooks)',
      'Custom Knowledge Base (PDF vectorization via Cloudinary)',
      'Automated Outbound Campaigns & Lead follow-ups',
      'Lead priority classification & immediate escalation',
      'Dedicated onboarding manager',
    ],
  },
  {
    id: 'business',
    name: 'Business Scale',
    priceMonthly: 299,
    priceYearly: 249,
    priceMonthlyInr: 24999,
    priceYearlyInr: 19999,
    minutesIncluded: 3500,
    agentsLimit: 15,
    phoneNumbersLimit: 5,
    description: 'For high-volume operations, automotive dealerships, healthcare chains, and customer support centers.',
    features: [
      '3,500 Inbound & Outbound minutes/mo',
      '5 Dedicated +91 Indian Phone Numbers',
      '15 Custom Voice Agents + Voice Cloning (Staff voices)',
      'Lowest latency routing (<95ms with Cartesia Sonic)',
      'High-capacity Outbound Broadcasts (1,000+ calls/day)',
      'Advanced Call Sentiment & Rapport indexing',
      'Cloudinary Enterprise media storage with instant streaming',
      'Direct Carrier SIP trunking & Multi-channel fallback',
      '24/7 Priority SLA & Dedicated Solutions Architect',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise Custom',
    priceMonthly: 599,
    priceYearly: 499,
    priceMonthlyInr: 49999,
    priceYearlyInr: 39999,
    minutesIncluded: 10000,
    agentsLimit: 999,
    phoneNumbersLimit: 25,
    description: 'Tailored carrier infrastructure, custom fine-tuned voice models, and dedicated Indian telecom trunks.',
    features: [
      '10,000+ Pooled call minutes/mo (Custom overage rates)',
      'Unlimited AI Voice Agents & Concurrent call channels',
      'Custom Voice Cloning & Fine-tuned Brand Tone',
      'Dedicated Plivo India Primary Rate Interface (PRI) / SIP Trunks',
      'Hybrid or Private cloud deployment options',
      'HIPAA & SOC-2 compliance data storage guarantees',
      'Custom CRM & ERP deep workflow engineering',
      '15-minute response SLA & 24/7 dedicated telephone support',
    ],
  },
];

export const mockScheduledCalls: any[] = [];
