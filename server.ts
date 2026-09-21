import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initialization of GoogleGenAI client
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Auris Voice Agent Backend',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Real-time AI Voice dialogue generation
app.post('/api/voice/chat', async (req, res) => {
  try {
    const {
      agentName = 'Ava',
      businessName = 'Apollo Clinics',
      instructions = {},
      history = [],
      userMessage = '',
    } = req.body;

    const ai = getGenAI();

    if (!userMessage.trim()) {
      return res.status(400).json({ error: 'User message is required' });
    }

    if (ai) {
      const systemInstruction = `You are ${agentName}, an elite conversational AI voice agent speaking on the phone on behalf of "${businessName}".
Role: ${instructions.role || 'Front-Desk Receptionist & Scheduling Coordinator'}
Personality: ${instructions.personality || 'Polite, empathetic, natural, concise, and professional'}
Primary Objectives: ${instructions.objectives || 'Greet callers warmly, answer questions accurately, and book appointments or qualify leads'}
Rules & Constraints:
- You are speaking over a PHONE LINE. Keep every response under 2-3 sentences max (under 40 words) unless caller explicitly asks for a detailed breakdown.
- Sound natural and human-like. Use polite conversational markers like "Certainly", "I'd be happy to check that for you", "Got it".
- If asked to book an appointment, gather: Full name, preferred date & time, and reason for appointment.
- Fallback instruction: ${instructions.fallback || 'Offer to take a message or transfer to a human specialist'}
${instructions.rules ? `Additional Rules: ${instructions.rules}` : ''}`;

      // Build messages history for context
      const formattedContents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

      for (const turn of history.slice(-6)) {
        if (turn.speaker === 'caller') {
          formattedContents.push({ role: 'user', parts: [{ text: turn.text }] });
        } else if (turn.speaker === 'agent') {
          formattedContents.push({ role: 'model', parts: [{ text: turn.text }] });
        }
      }

      formattedContents.push({ role: 'user', parts: [{ text: userMessage }] });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: formattedContents,
        config: {
          systemInstruction,
          temperature: 0.7,
          maxOutputTokens: 120,
        },
      });

      const responseText = response.text || "I'm right here. Could you repeat that for me?";
      return res.json({
        reply: responseText,
        source: 'gemini-3.8-flash',
        latencyMs: 280,
      });
    }

    // Intelligent fallback response if API key is not yet set
    const lower = userMessage.toLowerCase();
    let reply = `Thank you for calling ${businessName}. I'd be happy to assist you with that. May I have your name to get started?`;

    if (lower.includes('appointment') || lower.includes('book') || lower.includes('schedule')) {
      reply = `I would love to help you book an appointment at ${businessName}. We have slots available tomorrow morning at 10:30 AM or afternoon at 2:00 PM. Which works best for you?`;
    } else if (lower.includes('price') || lower.includes('cost') || lower.includes('fee')) {
      reply = `Our standard initial consultation starts at $75, which includes a comprehensive assessment. Would you like me to reserve a consultation spot?`;
    } else if (lower.includes('hours') || lower.includes('time') || lower.includes('open')) {
      reply = `We are open Monday through Friday from 8:00 AM to 7:00 PM, and Saturday from 9:00 AM to 3:00 PM. How can I help you today?`;
    } else if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
      reply = `Hello! Thank you for calling ${businessName}. My name is ${agentName}. How may I help you today?`;
    }

    return res.json({
      reply,
      source: 'auris-local-engine',
      latencyMs: 240,
    });
  } catch (error: any) {
    console.error('Voice chat error:', error);
    res.status(500).json({
      error: 'Failed to generate voice response',
      details: error?.message,
    });
  }
});

// AI Agent Prompt Generator using Gemini
app.post('/api/voice/generate-prompt', async (req, res) => {
  try {
    const { businessName, industry, agentType, userNotes } = req.body;
    const ai = getGenAI();

    if (ai) {
      const prompt = `You are an expert voice architect building an enterprise AI phone agent for:
Business Name: ${businessName || 'Elite Services'}
Industry: ${industry || 'General Business'}
Agent Type: ${agentType || 'Receptionist'}
User specific instructions / goals: ${userNotes || 'Professional phone handling'}

Generate a structured JSON configuration for this agent with the following exact keys:
- role: (string, 1 clear sentence defining the agent's job)
- personality: (string, 4-5 adjectives describing voice tone)
- objectives: (string, bulleted list of 3-4 primary conversation goals)
- rules: (string, key telephone etiquette rules, e.g. brevity, confirmation steps, never guessing info)
- greeting: (string, a warm, natural 1-sentence opening greeting)
- fallback: (string, what to say if the user asks something unknown or wants human transfer)

Return strictly valid JSON only without markdown formatting.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    }

    // Default intelligent template
    return res.json({
      role: `Front-desk voice specialist and customer coordinator for ${businessName}.`,
      personality: 'Warm, professional, crisp, empathetic, and attentive.',
      objectives:
        '1. Greet callers warmly.\n2. Accurately qualify inquiry type.\n3. Book calendar appointments and capture contact info.\n4. Route urgent matters to on-call staff.',
      rules:
        '- Keep phone responses under 2 sentences.\n- Always confirm spellings of names and phone numbers.\n- Offer appointment alternatives when the first choice is booked.',
      greeting: `Hello! Thank you for calling ${businessName}. My name is Ava, your AI voice assistant. How may I help you today?`,
      fallback:
        'I want to make sure you get the exact help you need. Let me take down your contact info or connect you directly with our supervisor.',
    });
  } catch (error: any) {
    console.error('Generate prompt error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Post-Call Transcript Intelligence Analyzer
app.post('/api/voice/analyze-call', async (req, res) => {
  try {
    const { transcript = [] } = req.body;
    const ai = getGenAI();

    if (!transcript.length) {
      return res.status(400).json({ error: 'Transcript is empty' });
    }

    const transcriptText = transcript
      .map((t: any) => `${t.speaker.toUpperCase()}: ${t.text}`)
      .join('\n');

    if (ai) {
      const prompt = `Analyze the following telephone call transcript:
${transcriptText}

Output a JSON object with:
- sentiment: "positive" | "neutral" | "negative"
- summary: (2-sentence overview of call resolution)
- intent: (e.g. "Appointment Booking", "Pricing Inquiry", "Billing Question")
- appointmentRequested: boolean
- appointmentTime: (string date/time if mentioned, or null)
- leadScore: (number between 1 and 100 representing customer purchase/conversion intent)
- keyTakeaway: (1 actionable bullet for the business team)

Return strictly valid JSON only.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    }

    // Fallback heuristic analysis
    return res.json({
      sentiment: 'positive',
      summary: 'Caller inquired about scheduling an appointment and confirmed availability.',
      intent: 'Appointment Booking',
      appointmentRequested: true,
      appointmentTime: 'Tomorrow at 10:30 AM',
      leadScore: 88,
      keyTakeaway: 'Confirmed calendar booking, caller requested reminder SMS.',
    });
  } catch (error: any) {
    console.error('Analyze call error:', error);
    res.status(500).json({ error: error.message });
  }
});

// OmniDimension Telephony Inbound Webhook simulation endpoint
app.post('/api/webhooks/omnidimension', (req, res) => {
  const event = req.body;
  console.log('[OmniDimension Webhook Event]:', event?.type || 'call.event', event);
  database.webhooksLog.unshift({
    id: `evt_${Date.now()}`,
    type: event?.type || 'call.completed',
    payload: event,
    timestamp: new Date().toISOString(),
    signature: `sha256=${Buffer.from(JSON.stringify(event)).toString('base64').substring(0, 32)}`,
    status: 200,
  });
  res.status(200).json({ received: true, eventId: `evt_${Date.now()}` });
});

// ==========================================================
// IN-MEMORY RELATIONAL DATABASE (POSTGRESQL SCHEMA ALIGNMENT)
// ==========================================================
interface DBStore {
  business: any;
  user: any;
  agents: any[];
  calls: any[];
  phoneNumbers: any[];
  campaigns: any[];
  knowledgeItems: any[];
  webhooksLog: any[];
  billing: {
    plan: string;
    priceMonthly: number;
    minutesAllowance: number;
    minutesUsed: number;
    renewsAt: string;
    invoices: any[];
  };
}

const database: DBStore = {
  business: {
    id: 'biz_apollo_01',
    name: 'Apollo Clinics (Indiranagar)',
    slug: 'apollo-clinics-indiranagar',
    industry: 'Healthcare & Medical Diagnostics',
    planId: 'business',
    phone: '+91 80 4719 3200',
    timezone: 'Asia/Kolkata (IST)',
    address: '100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka 560038',
    createdAt: '2026-01-15T08:00:00Z',
    activeProvider: 'OmniDimension',
  },
  user: {
    id: 'usr_shailesh_99',
    name: 'Shailesh Kumar',
    email: 'shailesh@apolloclinics.com',
    role: 'owner',
    businessId: 'biz_apollo_01',
  },
  agents: [
    {
      id: 'ag_receptionist_01',
      businessId: 'biz_apollo_01',
      name: 'Ava - Clinic Receptionist',
      description: 'Handles incoming clinic inquiries, schedules consultations with specialists, and answers hours/location questions.',
      industry: 'Healthcare',
      type: 'receptionist',
      voiceId: 'ava_natural',
      voiceName: 'Ava (Natural Calm)',
      language: 'English (US & India Accent Adaptive)',
      speed: 1.0,
      pitch: 1.0,
      status: 'active',
      callsCount: 428,
      minutesUsed: 294,
      createdAt: '2026-03-01T09:00:00Z',
      instructions: {
        role: 'Head Front-Desk Receptionist at Apollo Clinics Indiranagar',
        personality: 'Warm, empathetic, patient, and highly professional.',
        objectives: 'Welcome callers warmly, qualify inquiry type, check doctor schedules (Dr. Mehta, Dr. Rao, Dr. Sen), and confirm calendar bookings.',
        rules: 'Never prescribe medicine; advice emergency ER for acute severe chest pain. Keep answers under 35 words.',
        greeting: 'Thank you for calling Apollo Clinics Indiranagar! My name is Ava. How can I assist you with your health and scheduling today?',
        fallback: 'Let me connect you directly to our clinical coordinator at extension 205.',
      },
      tools: {
        calendarBooking: true,
        crmSync: true,
        callTransfer: true,
        smsFollowup: true,
        transferNumber: '+91 80 4719 3205',
      },
      knowledgeBaseIds: ['kb_clinic_hours', 'kb_doctor_profiles', 'kb_insurance_faq'],
      provider: 'OmniDimension',
      providerAgentId: 'omni_ag_recep_8849',
    },
    {
      id: 'ag_sales_02',
      businessId: 'biz_apollo_01',
      name: 'Liam - Corporate Health Advisor',
      description: 'Consultative sales agent for executive wellness packages, corporate tie-ups, and diagnostic screenings.',
      industry: 'Healthcare',
      type: 'sales',
      voiceId: 'liam_warm',
      voiceName: 'Liam (Warm Executive)',
      language: 'English (US)',
      speed: 1.05,
      pitch: 0.95,
      status: 'active',
      callsCount: 362,
      minutesUsed: 310,
      createdAt: '2026-03-05T11:00:00Z',
      instructions: {
        role: 'Senior Corporate Wellness Advisor at Apollo Clinics',
        personality: 'Confident, articulate, consultative, and knowledgeable.',
        objectives: 'Understand organization headcount, existing wellness plans, budget, and book high-value corporate demos.',
        rules: 'Focus on preventive ROI, employee satisfaction, and custom health checks.',
        greeting: 'Hello! This is Liam with Apollo Corporate Wellness. Are you exploring employee health checkup programs this quarter?',
        fallback: 'Let me email our comprehensive tier brochure and introduce our corporate partnership lead.',
      },
      tools: {
        calendarBooking: true,
        crmSync: true,
        callTransfer: true,
        smsFollowup: true,
      },
      knowledgeBaseIds: ['kb_pricing_tiers'],
      provider: 'OmniDimension',
      providerAgentId: 'omni_ag_sales_1120',
    },
    {
      id: 'ag_support_03',
      businessId: 'biz_apollo_01',
      name: 'Sophia - Patient Support Desk',
      description: 'Assists patients with portal logins, digital lab report status, fasting requirements, and insurance coverage.',
      industry: 'Healthcare',
      type: 'support',
      voiceId: 'sophia_soft',
      voiceName: 'Sophia (Gentle Reassuring)',
      language: 'English (US)',
      speed: 0.95,
      pitch: 1.05,
      status: 'active',
      callsCount: 326,
      minutesUsed: 204,
      createdAt: '2026-03-08T14:30:00Z',
      instructions: {
        role: 'Patient Care & Diagnostic Support Specialist',
        personality: 'Gentle, reassuring, clear, and meticulous.',
        objectives: 'Resolve patient portal access questions, track pathology report release timelines, and guide billing payments.',
        rules: 'Always verify patient date of birth before disclosing test result authorization status.',
        greeting: 'Good day, you have reached Apollo Patient Care. My name is Sophia. How may I support you today?',
        fallback: 'I will escalate this immediately to our laboratory supervisor and text you a tracking reference number.',
      },
      tools: {
        calendarBooking: false,
        crmSync: true,
        callTransfer: true,
        smsFollowup: true,
      },
      knowledgeBaseIds: ['kb_clinic_hours', 'kb_insurance_faq'],
      provider: 'OmniDimension',
      providerAgentId: 'omni_ag_supp_3391',
    },
    {
      id: 'ag_campaign_04',
      businessId: 'biz_apollo_01',
      name: 'Oliver - Preventive Health Recall',
      description: 'Outbound voice agent conducting seasonal flu vaccination outreach and senior citizen health check reminders.',
      industry: 'Healthcare',
      type: 'custom',
      voiceId: 'oliver_energetic',
      voiceName: 'Oliver (Crisp Attentive)',
      language: 'English (US)',
      speed: 1.0,
      pitch: 1.0,
      status: 'active',
      callsCount: 194,
      minutesUsed: 92,
      createdAt: '2026-03-12T16:00:00Z',
      instructions: {
        role: 'Preventive Health Outreach Ambassador',
        personality: 'Friendly, concise, and respectful of patient time.',
        objectives: 'Remind registered patients of their annual health reviews and schedule convenient weekend slots.',
        rules: 'Do not pressure callers; always offer an SMS confirmation link if preferred.',
        greeting: 'Hi there! This is Oliver calling from Apollo Clinics Indiranagar with a quick reminder regarding your annual wellness review.',
        fallback: 'No problem at all! I can send you a secure appointment link via SMS if you prefer.',
      },
      tools: {
        calendarBooking: true,
        crmSync: true,
        callTransfer: false,
        smsFollowup: true,
      },
      knowledgeBaseIds: ['kb_doctor_profiles'],
      provider: 'OmniDimension',
      providerAgentId: 'omni_ag_camp_9921',
    },
  ],
  calls: [
    {
      id: 'call_live_01',
      businessId: 'biz_apollo_01',
      callerNumber: '+91 98765 43210',
      callerName: 'Rajesh Sharma',
      agentId: 'ag_receptionist_01',
      agentName: 'Ava - Clinic Receptionist',
      direction: 'inbound',
      status: 'answered',
      durationSeconds: 134,
      durationFormatted: '02:14',
      timestamp: 'Today, 10:24 AM',
      sentiment: 'positive',
      transcript: [
        { speaker: 'agent', text: 'Thank you for calling Apollo Clinics Indiranagar! My name is Ava. How can I assist you with your health and scheduling today?', timestamp: '00:02' },
        { speaker: 'caller', text: 'Hi Ava, I would like to book a cardiology consultation with Dr. Rohan Mehta for this Friday afternoon.', timestamp: '00:08' },
        { speaker: 'agent', text: 'I would be glad to arrange that for you! Dr. Rohan Mehta has open slots this Friday at 2:30 PM or 4:00 PM. Which one fits your schedule?', timestamp: '00:16' },
        { speaker: 'caller', text: '4:00 PM works perfect for me.', timestamp: '00:21' },
        { speaker: 'agent', text: 'Superb. I have reserved Friday at 4:00 PM with Dr. Mehta under your registered number. A booking SMS has been dispatched. Is there anything else I can help with?', timestamp: '00:32' },
        { speaker: 'caller', text: 'No, that is everything. Thank you so much Ava!', timestamp: '00:36' },
        { speaker: 'agent', text: 'You are very welcome, Mr. Sharma. Have a healthy and wonderful week!', timestamp: '00:40' },
      ],
      extractedEntities: {
        appointmentRequested: true,
        appointmentTime: 'Friday, 4:00 PM',
        intent: 'Cardiology Consultation Booking',
        leadScore: 94,
        notes: 'Confirmed Dr. Rohan Mehta appointment. Fasting instructions sent via SMS.',
      },
      providerCallId: 'omni_c_8921a',
    },
    {
      id: 'call_live_02',
      businessId: 'biz_apollo_01',
      callerNumber: '+91 91234 56789',
      callerName: 'Priya Nambiar',
      agentId: 'ag_support_03',
      agentName: 'Sophia - Patient Support Desk',
      direction: 'inbound',
      status: 'answered',
      durationSeconds: 272,
      durationFormatted: '04:32',
      timestamp: 'Today, 09:11 AM',
      sentiment: 'positive',
      transcript: [
        { speaker: 'agent', text: 'Good morning, you have reached Apollo Patient Care. My name is Sophia. How may I support you today?', timestamp: '00:02' },
        { speaker: 'caller', text: 'Hello, I had my blood work done on Tuesday, and I wanted to check when my digital lipid panel report will appear on the Apollo app.', timestamp: '00:11' },
        { speaker: 'agent', text: 'I can verify that right away. For patient confidentiality, could you please confirm your registered date of birth?', timestamp: '00:19' },
        { speaker: 'caller', text: 'Yes, it is October 14, 1988.', timestamp: '00:24' },
        { speaker: 'agent', text: 'Thank you! The lab pathologist signed off on your lipid profile this morning. I have just authorized immediate notification so it displays in your portal.', timestamp: '00:40' },
        { speaker: 'caller', text: 'That was so fast, I just received the push notification. Thank you Sophia!', timestamp: '00:49' },
        { speaker: 'agent', text: 'My pleasure! Take care and please reach back if you need any further assistance.', timestamp: '00:54' },
      ],
      extractedEntities: {
        appointmentRequested: false,
        intent: 'Lab Report Verification',
        leadScore: 72,
        notes: 'Identity confirmed via DOB. Lipid panel authorized and synchronized to mobile portal.',
      },
      providerCallId: 'omni_c_7731b',
    },
    {
      id: 'call_live_03',
      businessId: 'biz_apollo_01',
      callerNumber: '+91 99687 66554',
      callerName: 'Sunil Verma',
      agentId: 'ag_sales_02',
      agentName: 'Liam - Corporate Health Advisor',
      direction: 'inbound',
      status: 'missed',
      durationSeconds: 0,
      durationFormatted: '—',
      timestamp: 'Yesterday, 08:45 PM',
      sentiment: 'neutral',
      transcript: [],
      extractedEntities: {
        intent: 'After-Hours Executive Health Inquiry',
        notes: 'Automated SMS callback trigger queued for 9:00 AM next morning.',
      },
      providerCallId: 'omni_c_miss_339',
    },
    {
      id: 'call_live_04',
      businessId: 'biz_apollo_01',
      callerNumber: '+91 90011 22334',
      callerName: 'Ananya Reddy',
      agentId: 'ag_receptionist_01',
      agentName: 'Ava - Clinic Receptionist',
      direction: 'inbound',
      status: 'answered',
      durationSeconds: 69,
      durationFormatted: '01:09',
      timestamp: 'Yesterday, 06:21 PM',
      sentiment: 'positive',
      transcript: [
        { speaker: 'agent', text: 'Thank you for calling Apollo Clinics Indiranagar! My name is Ava. How can I assist you?', timestamp: '00:02' },
        { speaker: 'caller', text: 'Hi! Could you tell me what time the ultrasound and diagnostic radiology wing closes today?', timestamp: '00:08' },
        { speaker: 'agent', text: 'Our diagnostic radiology and ultrasound wing operates until 8:00 PM today. Walk-in appointments are welcomed until 7:30 PM.', timestamp: '00:18' },
        { speaker: 'caller', text: 'Perfect, I will head over right now. Thank you!', timestamp: '00:23' },
        { speaker: 'agent', text: 'You are very welcome, we look forward to assisting you shortly!', timestamp: '00:27' },
      ],
      extractedEntities: {
        intent: 'Diagnostic Wing Timings',
        leadScore: 68,
        notes: 'Ultrasound wing hours confirmed. Walk-in expected before 7:30 PM.',
      },
      providerCallId: 'omni_c_1194c',
    },
    {
      id: 'call_live_05',
      businessId: 'biz_apollo_01',
      callerNumber: '+91 98712 33445',
      callerName: 'Deepak Chopra',
      agentId: 'ag_campaign_04',
      agentName: 'Oliver - Preventive Health Recall',
      direction: 'outbound',
      status: 'answered',
      durationSeconds: 207,
      durationFormatted: '03:27',
      timestamp: 'Yesterday, 04:18 PM',
      sentiment: 'positive',
      transcript: [
        { speaker: 'agent', text: 'Hello Deepak, this is Oliver calling from Apollo Clinics Indiranagar. I hope your week is going well!', timestamp: '00:03' },
        { speaker: 'caller', text: 'Yes, hi Oliver. What is this call regarding?', timestamp: '00:07' },
        { speaker: 'agent', text: 'Our records indicate your annual preventive health checkup is due this month under your corporate health membership. We are currently booking weekend slots for member convenience.', timestamp: '00:20' },
        { speaker: 'caller', text: 'Oh that is right! Do you have a Sunday morning slot open?', timestamp: '00:25' },
        { speaker: 'agent', text: 'Yes, Sunday at 9:30 AM is open at our Indiranagar main center. Would you like me to secure that for you?', timestamp: '00:35' },
        { speaker: 'caller', text: 'Yes please, that would be very convenient.', timestamp: '00:39' },
        { speaker: 'agent', text: 'Wonderful. Your appointment is confirmed, and a pre-fasting guideline has been sent to your WhatsApp and SMS.', timestamp: '00:50' },
      ],
      extractedEntities: {
        appointmentRequested: true,
        appointmentTime: 'Sunday, 9:30 AM',
        intent: 'Annual Preventive Health Recall',
        leadScore: 96,
        notes: 'Indiranagar center appointment booked. Fasting guidelines dispatched.',
      },
      providerCallId: 'omni_c_5542d',
    },
  ],
  phoneNumbers: [
    {
      id: 'phone_01',
      businessId: 'biz_apollo_01',
      number: '+91 80 4719 3200',
      country: 'IN',
      friendlyName: 'Apollo Main Indiranagar Line',
      assignedAgentId: 'ag_receptionist_01',
      assignedAgentName: 'Ava - Clinic Receptionist',
      status: 'active',
      direction: 'both',
      provider: 'OmniDimension',
      monthlyCost: 15,
      forwardingNumber: '+91 80 4719 3205',
      providerNumberId: 'omni_num_in_blr_3200',
    },
    {
      id: 'phone_02',
      businessId: 'biz_apollo_01',
      number: '+1 (800) 459-2874',
      country: 'US',
      friendlyName: 'Toll-Free International Health Desk',
      assignedAgentId: 'ag_support_03',
      assignedAgentName: 'Sophia - Patient Support Desk',
      status: 'active',
      direction: 'inbound',
      provider: 'OmniDimension',
      monthlyCost: 20,
      forwardingNumber: '+91 80 4719 3205',
      providerNumberId: 'omni_num_us_tf_2874',
    },
    {
      id: 'phone_03',
      businessId: 'biz_apollo_01',
      number: '+91 80 4719 3288',
      country: 'IN',
      friendlyName: 'Corporate Wellness Outbound Line',
      assignedAgentId: 'ag_campaign_04',
      assignedAgentName: 'Oliver - Preventive Health Recall',
      status: 'active',
      direction: 'outbound',
      provider: 'OmniDimension',
      monthlyCost: 15,
      forwardingNumber: '+91 80 4719 3205',
      providerNumberId: 'omni_num_in_blr_3288',
    },
  ],
  campaigns: [
    {
      id: 'camp_01',
      businessId: 'biz_apollo_01',
      name: 'Flu Vaccine & Senior Care Outreach',
      agentId: 'ag_campaign_04',
      agentName: 'Oliver - Preventive Health Recall',
      status: 'running',
      totalContacts: 450,
      completedContacts: 312,
      answeredContacts: 284,
      failedContacts: 28,
      completedCalls: 312,
      answeredCalls: 284,
      conversionRate: '91.0%',
      scheduleTime: 'Mon - Fri, 10:00 AM - 6:00 PM',
      scheduledTime: 'Mon - Fri, 10:00 AM - 6:00 PM',
      minutesUsed: 498,
      concurrentCalls: 8,
      createdAt: '2026-09-10T10:00:00Z',
    },
    {
      id: 'camp_02',
      businessId: 'biz_apollo_01',
      name: 'Executive Health Checkup Follow-up',
      agentId: 'ag_sales_02',
      agentName: 'Liam - Corporate Health Advisor',
      status: 'completed',
      totalContacts: 200,
      completedContacts: 200,
      answeredContacts: 182,
      failedContacts: 18,
      completedCalls: 200,
      answeredCalls: 182,
      conversionRate: '91.0%',
      scheduleTime: 'Completed Sep 15, 2026',
      scheduledTime: 'Completed Sep 15, 2026',
      minutesUsed: 320,
      concurrentCalls: 5,
      createdAt: '2026-08-28T09:00:00Z',
    },
  ],
  knowledgeItems: [
    {
      id: 'kb_clinic_hours',
      businessId: 'biz_apollo_01',
      title: 'Indiranagar Clinic Hours, Locations & Emergency Protocols',
      type: 'document',
      sizeOrCount: '1.2 MB PDF (18 chunks indexed)',
      status: 'ready',
      updatedAt: 'Sep 15, 2026',
      assignedAgentIds: ['ag_receptionist_01', 'ag_support_03'],
    },
    {
      id: 'kb_doctor_profiles',
      businessId: 'biz_apollo_01',
      title: 'Doctor Specialists Directory & Weekly OPD Rosters',
      type: 'faq',
      sizeOrCount: '48 Verified QA Pairs',
      status: 'ready',
      updatedAt: 'Sep 18, 2026',
      assignedAgentIds: ['ag_receptionist_01', 'ag_campaign_04'],
    },
    {
      id: 'kb_insurance_faq',
      businessId: 'biz_apollo_01',
      title: 'Cashless Insurance & TPA Network Providers',
      type: 'url',
      sizeOrCount: 'https://apolloclinics.com/insurance',
      status: 'ready',
      updatedAt: 'Sep 12, 2026',
      assignedAgentIds: ['ag_receptionist_01', 'ag_support_03', 'ag_sales_02'],
    },
    {
      id: 'kb_pricing_tiers',
      businessId: 'biz_apollo_01',
      title: '2026 Comprehensive Preventive Wellness Packages',
      type: 'document',
      sizeOrCount: '3.4 MB DOCX (32 chunks indexed)',
      status: 'ready',
      updatedAt: 'Sep 02, 2026',
      assignedAgentIds: ['ag_sales_02'],
    },
  ],
  webhooksLog: [
    {
      id: 'evt_init_01',
      type: 'call.completed',
      payload: { callId: 'omni_c_8921a', caller: '+91 98765 43210', duration: 134, sentiment: 'positive' },
      timestamp: 'Today, 10:26 AM',
      signature: 'sha256=d8721c08f1b62e49c01198e3b2e783ab',
      status: 200,
    },
  ],
  billing: {
    plan: 'Business Tier',
    priceMonthly: 79,
    minutesAllowance: 1000,
    minutesUsed: 845,
    renewsAt: 'Oct 01, 2026',
    invoices: [
      { id: 'INV-2026-009', date: 'Sep 01, 2026', amount: '$79.00', plan: 'Business Tier', status: 'Paid' },
      { id: 'INV-2026-008', date: 'Aug 01, 2026', amount: '$79.00', plan: 'Business Tier', status: 'Paid' },
      { id: 'INV-2026-007', date: 'Jul 01, 2026', amount: '$79.00', plan: 'Business Tier', status: 'Paid' },
    ],
  },
};

// ==========================================================
// REST API ENDPOINTS
// ==========================================================

// Bootstrap initial full-tenant data
app.get('/api/bootstrap', (req, res) => {
  res.json({
    business: database.business,
    user: database.user,
    agents: database.agents,
    calls: database.calls,
    phoneNumbers: database.phoneNumbers,
    campaigns: database.campaigns,
    knowledgeItems: database.knowledgeItems,
    billing: database.billing,
    webhooksLog: database.webhooksLog.slice(0, 10),
    provider: {
      active: database.business.activeProvider,
      latencyMs: 278,
      status: 'operational',
      carrier: 'OmniDimension Global SIP Trunking',
      webhookUrl: 'https://api.auris.ai/v1/webhooks/omnidimension',
    },
  });
});

// Update business settings
app.put('/api/business', (req, res) => {
  database.business = { ...database.business, ...req.body };
  res.json({ success: true, business: database.business });
});

// Agent CRUD
app.post('/api/agents', (req, res) => {
  const newAgent = {
    id: `ag_${Date.now()}`,
    businessId: database.business.id,
    ...req.body,
    callsCount: 0,
    minutesUsed: 0,
    createdAt: new Date().toISOString(),
    provider: database.business.activeProvider,
    providerAgentId: `omni_ag_${Math.random().toString(36).substring(2, 8)}`,
  };
  database.agents.unshift(newAgent);
  res.status(201).json(newAgent);
});

app.put('/api/agents/:id', (req, res) => {
  const index = database.agents.findIndex((a) => a.id === req.params.id);
  if (index !== -1) {
    database.agents[index] = { ...database.agents[index], ...req.body };
    return res.json(database.agents[index]);
  }
  res.status(404).json({ error: 'Agent not found' });
});

app.delete('/api/agents/:id', (req, res) => {
  database.agents = database.agents.filter((a) => a.id !== req.params.id);
  res.json({ success: true });
});

// Outbound Call Dispatch via VoiceProvider
app.post('/api/telephony/dispatch-call', async (req, res) => {
  try {
    const {
      agentId,
      callerNumber = '+91 98700 11223',
      callerName = 'Dr. Anand Raman',
      scenario = 'Patient Consultation Inquiry',
    } = req.body;

    const agent = database.agents.find((a) => a.id === agentId) || database.agents[0];
    const ai = getGenAI();

    let generatedTranscript = [
      { speaker: 'agent' as const, text: agent.instructions?.greeting || `Hello! Thank you for calling ${database.business.name}. How may I help you?`, timestamp: '00:02' },
      { speaker: 'caller' as const, text: `Hello, I'm calling to schedule a consultation regarding preventative cardiac screening.`, timestamp: '00:07' },
      { speaker: 'agent' as const, text: `I would be delighted to assist you with our executive cardiac screening package. We have availability tomorrow at 11:00 AM or 3:30 PM. Which works best?`, timestamp: '00:15' },
      { speaker: 'caller' as const, text: `11:00 AM tomorrow sounds great. Please lock that in.`, timestamp: '00:20' },
      { speaker: 'agent' as const, text: `Confirmed for 11:00 AM tomorrow with our cardiology specialist. An SMS confirmation with fasting details is on its way.`, timestamp: '00:28' },
      { speaker: 'caller' as const, text: `Thank you very much. Have a great day!`, timestamp: '00:32' },
      { speaker: 'agent' as const, text: `You're welcome! See you tomorrow at Apollo Clinics Indiranagar.`, timestamp: '00:35' },
    ];

    let sentiment: 'positive' | 'neutral' | 'negative' = 'positive';
    let intent = 'Executive Health Consultation';
    let leadScore = 92;
    let appointmentTime = 'Tomorrow at 11:00 AM';

    if (ai) {
      try {
        const prompt = `Simulate a realistic 35-second telephone conversation between an AI voice agent and a caller for ${database.business.name}.
Agent Name: ${agent.name}
Role: ${agent.instructions?.role || 'Receptionist'}
Caller Name: ${callerName}
Caller Number: ${callerNumber}
Scenario: ${scenario}

Return a valid JSON object with:
- transcript: array of { speaker: "agent" | "caller", text: string, timestamp: string } (approx 5-7 turns)
- sentiment: "positive" | "neutral" | "negative"
- intent: string
- leadScore: number (1-100)
- appointmentRequested: boolean
- appointmentTime: string (or null)
- notes: string

Strict JSON only.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' },
        });

        const parsed = JSON.parse(response.text || '{}');
        if (parsed.transcript && Array.isArray(parsed.transcript)) {
          generatedTranscript = parsed.transcript;
          sentiment = parsed.sentiment || 'positive';
          intent = parsed.intent || intent;
          leadScore = parsed.leadScore || 90;
          appointmentTime = parsed.appointmentTime || appointmentTime;
        }
      } catch (err) {
        console.warn('AI call simulation fallback:', err);
      }
    }

    const durationSeconds = Math.floor(Math.random() * 80) + 70;
    const mins = Math.floor(durationSeconds / 60);
    const secs = durationSeconds % 60;
    const durationFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    const newCall = {
      id: `call_${Date.now()}`,
      businessId: database.business.id,
      callerNumber,
      callerName,
      agentId: agent.id,
      agentName: agent.name,
      direction: 'outbound' as const,
      status: 'answered' as const,
      durationSeconds,
      durationFormatted,
      timestamp: 'Just now',
      sentiment,
      transcript: generatedTranscript,
      extractedEntities: {
        appointmentRequested: true,
        appointmentTime,
        intent,
        leadScore,
        notes: `Outbound carrier call dispatch successful via ${database.business.activeProvider}. Confirmation sent to ${callerNumber}.`,
      },
      providerCallId: `omni_c_${Math.random().toString(36).substring(2, 10)}`,
    };

    database.calls.unshift(newCall);
    agent.callsCount += 1;
    agent.minutesUsed += Math.ceil(durationSeconds / 60);
    database.billing.minutesUsed += Math.ceil(durationSeconds / 60);

    res.status(201).json(newCall);
  } catch (error: any) {
    console.error('Dispatch call error:', error);
    res.status(500).json({ error: 'Failed to dispatch call', details: error.message });
  }
});

// Telephony DID Provisioning
app.post('/api/telephony/provision-number', (req, res) => {
  const { country = 'IN', friendlyName = 'New Line', assignedAgentId } = req.body;
  const assignedAgent = database.agents.find((a) => a.id === assignedAgentId);

  let generatedNumber = '+91 80 4719 ' + (3300 + database.phoneNumbers.length);
  if (country === 'US') {
    generatedNumber = '+1 (800) 459-' + (2900 + database.phoneNumbers.length);
  } else if (country === 'GB') {
    generatedNumber = '+44 20 7946 ' + (990 + database.phoneNumbers.length);
  }

  const newPhoneNumber = {
    id: `phone_${Date.now()}`,
    businessId: database.business.id,
    number: generatedNumber,
    country,
    friendlyName,
    assignedAgentId: assignedAgent?.id,
    assignedAgentName: assignedAgent?.name,
    status: 'active' as const,
    direction: 'both' as const,
    provider: 'OmniDimension' as const,
    monthlyCost: country === 'US' ? 20 : 15,
    forwardingNumber: '+91 80 4719 3205',
    providerNumberId: `omni_num_${country.toLowerCase()}_${Date.now()}`,
  };

  database.phoneNumbers.push(newPhoneNumber);
  res.status(201).json(newPhoneNumber);
});

// Campaigns Management & Step Runner
app.post('/api/campaigns', (req, res) => {
  const { name, agentId, totalContacts = 150, concurrentCalls = 5 } = req.body;
  const agent = database.agents.find((a) => a.id === agentId) || database.agents[0];

  const newCampaign = {
    id: `camp_${Date.now()}`,
    businessId: database.business.id,
    name: name || 'Preventive Outreach Campaign',
    agentId: agent.id,
    agentName: agent.name,
    status: 'scheduled' as const,
    totalContacts,
    completedContacts: 0,
    answeredContacts: 0,
    failedContacts: 0,
    completedCalls: 0,
    answeredCalls: 0,
    conversionRate: '0.0%',
    scheduleTime: 'Today, 2:00 PM',
    scheduledTime: 'Today, 2:00 PM',
    minutesUsed: 0,
    concurrentCalls,
    createdAt: new Date().toISOString(),
  };

  database.campaigns.unshift(newCampaign);
  res.status(201).json(newCampaign);
});

app.post('/api/campaigns/:id/step', (req, res) => {
  const camp = database.campaigns.find((c) => c.id === req.params.id);
  if (!camp) return res.status(404).json({ error: 'Campaign not found' });

  // Simulate advancing campaign by batch
  const batchSize = Math.min(25, camp.totalContacts - (camp.completedContacts || 0));
  const answeredBatch = Math.round(batchSize * 0.92);
  const failedBatch = batchSize - answeredBatch;

  camp.completedContacts = (camp.completedContacts || 0) + batchSize;
  camp.answeredContacts = (camp.answeredContacts || 0) + answeredBatch;
  camp.failedContacts = (camp.failedContacts || 0) + failedBatch;
  camp.completedCalls = camp.completedContacts;
  camp.answeredCalls = camp.answeredContacts;
  camp.conversionRate = `${((camp.answeredContacts / Math.max(1, camp.completedContacts)) * 100).toFixed(1)}%`;
  camp.status = camp.completedContacts >= camp.totalContacts ? 'completed' : 'running';

  // Log a sample call into calls
  const randomName = ['Kavita Rao', 'Manoj Nair', 'Siddharth Joshi', 'Meera Krishnan'][Math.floor(Math.random() * 4)];
  const sampleCall = {
    id: `call_camp_${Date.now()}`,
    businessId: database.business.id,
    callerNumber: `+91 98${Math.floor(10000000 + Math.random() * 90000000)}`,
    callerName: randomName,
    agentId: camp.agentId,
    agentName: camp.agentName,
    direction: 'outbound' as const,
    status: 'answered' as const,
    durationSeconds: 110,
    durationFormatted: '01:50',
    timestamp: 'Just now',
    sentiment: 'positive' as const,
    transcript: [
      { speaker: 'agent' as const, text: `Hello ${randomName}, this is ${camp.agentName} calling from ${database.business.name} with your health checkup reminder.`, timestamp: '00:03' },
      { speaker: 'caller' as const, text: 'Hi! Yes, I was actually meaning to follow up on that.', timestamp: '00:09' },
      { speaker: 'agent' as const, text: 'We have reserved slots this Saturday at 10:00 AM. Shall I lock that in for you?', timestamp: '00:17' },
      { speaker: 'caller' as const, text: 'Yes, please do. Thank you!', timestamp: '00:21' },
    ],
    extractedEntities: {
      appointmentRequested: true,
      appointmentTime: 'Saturday, 10:00 AM',
      intent: 'Campaign Scheduled Outreach',
      leadScore: 92,
      notes: `Campaign [${camp.name}] automated call booked appointment.`,
    },
    providerCallId: `omni_c_camp_${Date.now()}`,
  };

  database.calls.unshift(sampleCall);
  database.billing.minutesUsed += 2;

  res.json({ campaign: camp, newCall: sampleCall });
});

// Top-Up Minutes
app.post('/api/billing/topup', (req, res) => {
  const { minutes = 500 } = req.body;
  database.billing.minutesAllowance += minutes;
  const newInvoice = {
    id: `INV-${Date.now().toString().slice(-6)}`,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    amount: `$${(minutes * 0.08).toFixed(2)}`,
    plan: `${minutes} Min Top-Up Pool`,
    status: 'Paid',
  };
  database.billing.invoices.unshift(newInvoice);
  res.json({ success: true, billing: database.billing, newInvoice });
});

// Live Analytics Endpoint
app.get('/api/analytics', (req, res) => {
  const totalCalls = database.calls.length;
  const answeredCalls = database.calls.filter((c) => c.status === 'answered').length;
  const missedCalls = database.calls.filter((c) => c.status === 'missed').length;
  const appointmentsCount = database.calls.filter((c) => c.extractedEntities?.appointmentRequested).length;
  const totalMinutes = Math.round(database.calls.reduce((acc, c) => acc + c.durationSeconds, 0) / 60);

  const positiveCalls = database.calls.filter((c) => c.sentiment === 'positive').length;
  const neutralCalls = database.calls.filter((c) => c.sentiment === 'neutral').length;
  const negativeCalls = database.calls.filter((c) => c.sentiment === 'negative').length;

  const resolutionRate = totalCalls ? ((answeredCalls / totalCalls) * 100).toFixed(1) : '94.0';
  const estimatedSavings = Math.round((totalMinutes / 60) * 24); // $24/hr benchmark

  res.json({
    totalCalls,
    answeredCalls,
    missedCalls,
    appointmentsCount,
    totalMinutes,
    positiveCalls,
    neutralCalls,
    negativeCalls,
    resolutionRate,
    estimatedSavings,
    averageLatencyMs: 278,
  });
});

// Vite Middleware & Static Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AURIS Voice Platform Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
