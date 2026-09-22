import {
  Agent,
  AgentCoachingInsight,
  AgentPerformanceMetrics,
  Business,
  Call,
  Campaign,
  KnowledgeItem,
  PhoneNumber,
  ScheduledCall,
  User,
} from '../types';

export interface BootstrapResponse {
  business: Business;
  user: User;
  agents: Agent[];
  calls: Call[];
  scheduledCalls?: ScheduledCall[];
  phoneNumbers: PhoneNumber[];
  campaigns: Campaign[];
  knowledgeItems: KnowledgeItem[];
  billing: {
    plan: string;
    priceMonthly: number;
    minutesAllowance: number;
    minutesUsed: number;
    renewsAt: string;
    invoices: Array<{
      id: string;
      date: string;
      amount: string;
      plan: string;
      status: string;
    }>;
  };
  webhooksLog: Array<{
    id: string;
    type: string;
    payload: any;
    timestamp: string;
    signature: string;
    status: number;
  }>;
  provider: {
    active: string;
    latencyMs: number;
    status: string;
    carrier: string;
    webhookUrl: string;
  };
}

export interface AnalyticsResponse {
  totalCalls: number;
  answeredCalls: number;
  missedCalls: number;
  appointmentsCount: number;
  totalMinutes: number;
  positiveCalls: number;
  neutralCalls: number;
  negativeCalls: number;
  resolutionRate: string;
  estimatedSavings: number;
  averageLatencyMs: number;
}

class AurisApiClient {
  private baseUrl = '';

  async getBootstrapData(): Promise<BootstrapResponse> {
    const res = await fetch(`${this.baseUrl}/api/bootstrap`);
    if (!res.ok) throw new Error('Failed to load system state');
    return res.json();
  }

  async updateBusiness(payload: Partial<Business>): Promise<{ success: boolean; business: Business }> {
    const res = await fetch(`${this.baseUrl}/api/business`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update business');
    return res.json();
  }

  async createAgent(payload: Partial<Agent>): Promise<Agent> {
    const res = await fetch(`${this.baseUrl}/api/agents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to create agent');
    return res.json();
  }

  async updateAgent(agentId: string, payload: Partial<Agent>): Promise<Agent> {
    const res = await fetch(`${this.baseUrl}/api/agents/${agentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update agent');
    return res.json();
  }

  async deleteAgent(agentId: string): Promise<boolean> {
    const res = await fetch(`${this.baseUrl}/api/agents/${agentId}`, {
      method: 'DELETE',
    });
    return res.ok;
  }

  async dispatchCall(params: {
    agentId: string;
    callerNumber?: string;
    callerName?: string;
    scenario?: string;
  }): Promise<Call> {
    const res = await fetch(`${this.baseUrl}/api/telephony/dispatch-call`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Failed to dispatch carrier call');
    return res.json();
  }

  async getCalls(): Promise<Call[]> {
    const res = await fetch(`${this.baseUrl}/api/calls`);
    if (!res.ok) throw new Error('Failed to fetch calls');
    return res.json();
  }

  async provisionPhoneNumber(params: Partial<PhoneNumber> & {
    country?: string;
    friendlyName?: string;
    assignedAgentId?: string;
  }): Promise<PhoneNumber> {
    const res = await fetch(`${this.baseUrl}/api/telephony/provision-number`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Failed to provision phone number');
    return res.json();
  }

  async createCampaign(params: {
    name: string;
    agentId: string;
    totalContacts?: number;
    concurrentCalls?: number;
  }): Promise<Campaign> {
    const res = await fetch(`${this.baseUrl}/api/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Failed to create campaign');
    return res.json();
  }

  async stepCampaign(campaignId: string): Promise<{ campaign: Campaign; newCall: Call }> {
    const res = await fetch(`${this.baseUrl}/api/campaigns/${campaignId}/step`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to execute campaign batch step');
    return res.json();
  }

  async topupMinutes(minutes: number, amount?: number): Promise<{ success: boolean; billing: any; newInvoice: any }> {
    const res = await fetch(`${this.baseUrl}/api/billing/topup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ minutes, amount }),
    });
    if (!res.ok) throw new Error('Failed to top up minutes');
    return res.json();
  }

  async getAnalytics(): Promise<AnalyticsResponse> {
    const res = await fetch(`${this.baseUrl}/api/analytics`);
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  }

  async testTriggerWebhook(eventType: string, payload?: any): Promise<any> {
    const body = typeof eventType === 'object' ? eventType : { event: eventType, data: payload, timestamp: new Date().toISOString() };
    const res = await fetch(`${this.baseUrl}/api/webhooks/omnidimension`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return res.json();
  }

  // ==========================================
  // CALL SCHEDULING METHODS
  // ==========================================

  async getScheduledCalls(params?: { status?: string; agentId?: string }): Promise<ScheduledCall[]> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.agentId) query.set('agentId', params.agentId);

    const res = await fetch(`${this.baseUrl}/api/scheduled-calls?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch scheduled calls');
    return res.json();
  }

  async createScheduledCall(payload: Partial<ScheduledCall>): Promise<ScheduledCall> {
    const res = await fetch(`${this.baseUrl}/api/scheduled-calls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to create scheduled call' }));
      throw new Error(err.error || 'Failed to create scheduled call');
    }
    return res.json();
  }

  async updateScheduledCall(id: string, payload: Partial<ScheduledCall>): Promise<ScheduledCall> {
    const res = await fetch(`${this.baseUrl}/api/scheduled-calls/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update scheduled call');
    return res.json();
  }

  async deleteScheduledCall(id: string): Promise<boolean> {
    const res = await fetch(`${this.baseUrl}/api/scheduled-calls/${id}`, {
      method: 'DELETE',
    });
    return res.ok;
  }

  async triggerScheduledCall(id: string): Promise<{
    success: boolean;
    message: string;
    call: Call;
    scheduledCall: ScheduledCall;
  }> {
    const res = await fetch(`${this.baseUrl}/api/scheduled-calls/${id}/trigger`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to trigger scheduled call');
    return res.json();
  }

  async smartScheduleWithAI(text: string, referenceTime?: string): Promise<{
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    purpose: string;
    scheduledAt: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    agentId: string;
    notes?: string;
  }> {
    const res = await fetch(`${this.baseUrl}/api/ai/smart-schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, referenceTime }),
    });
    if (!res.ok) throw new Error('Failed to parse schedule with AI');
    return res.json();
  }

  // ==========================================
  // AGENT PERFORMANCE & COACHING METHODS
  // ==========================================

  async getAgentsPerformance(): Promise<{
    summary: {
      fleetTotalCalls: number;
      fleetAvgCSAT: number;
      fleetAvgResolution: number;
      fleetAvgHandleTime: number;
      activeAgentsCount: number;
    };
    agents: AgentPerformanceMetrics[];
  }> {
    const res = await fetch(`${this.baseUrl}/api/agents/performance`);
    if (!res.ok) throw new Error('Failed to load agent performance metrics');
    return res.json();
  }

  async coachAgentWithAI(agentId: string): Promise<AgentCoachingInsight> {
    const res = await fetch(`${this.baseUrl}/api/ai/coach-agent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId }),
    });
    if (!res.ok) throw new Error('Failed to generate AI agent coaching');
    return res.json();
  }

  async generateFollowupDraft(params: {
    callId?: string;
    recipientName?: string;
    recipientPhone?: string;
    purpose?: string;
    outcome?: string;
  }): Promise<{
    smsMessage: string;
    emailSubject: string;
    emailBody: string;
    crmNotes: string;
  }> {
    const res = await fetch(`${this.baseUrl}/api/ai/followup-draft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Failed to generate follow-up draft');
    return res.json();
  }
}

export const aurisApi = new AurisApiClient();
