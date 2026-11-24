import {
  Agent,
  AgentCoachingInsight,
  AgentPerformanceMetrics,
  Business,
  Call,
  Campaign,
  KnowledgeItem,
  Lead,
  PhoneNumber,
  ScheduledCall,
  User,
  WorkspaceWallet,
  WalletTransaction,
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
  leads?: Lead[];
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
  private token: string | null = null;
  private activeBusinessId: string | null = null;

  constructor() {
    if (typeof window !== 'undefined' && window.localStorage) {
      this.token = localStorage.getItem('auris_session_token');
      this.activeBusinessId = localStorage.getItem('auris_active_business_id');
    }
  }

  setToken(token: string | null): void {
    this.token = token;
    if (typeof window !== 'undefined' && window.localStorage) {
      if (token) {
        localStorage.setItem('auris_session_token', token);
      } else {
        localStorage.removeItem('auris_session_token');
      }
    }
  }

  getToken(): string | null {
    return this.token;
  }

  setActiveBusinessId(bizId: string | null): void {
    this.activeBusinessId = bizId;
    if (typeof window !== 'undefined' && window.localStorage) {
      if (bizId) {
        localStorage.setItem('auris_active_business_id', bizId);
      } else {
        localStorage.removeItem('auris_active_business_id');
      }
    }
  }

  getActiveBusinessId(): string | null {
    return this.activeBusinessId;
  }

  private getHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
    const headers: Record<string, string> = { ...extraHeaders };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    if (this.activeBusinessId) {
      headers['x-business-id'] = this.activeBusinessId;
    }
    return headers;
  }

  async signup(params: {
    email: string;
    password: string;
    name: string;
    businessName?: string;
  }): Promise<{ token: string; user: User; business: Business; starterAgent: Agent }> {
    const res = await fetch(`${this.baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create account');
    }
    const data = await res.json();
    this.setToken(data.token);
    this.setActiveBusinessId(data.business.id);
    return data;
  }

  async login(params: {
    email: string;
    password: string;
  }): Promise<{ token: string; user: User; business: Business; businesses: Business[] }> {
    const res = await fetch(`${this.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to sign in');
    }
    const data = await res.json();
    this.setToken(data.token);
    this.setActiveBusinessId(data.business.id);
    return data;
  }

  async getMe(): Promise<{ user: User; business: Business; businesses: Business[] }> {
    const res = await fetch(`${this.baseUrl}/api/auth/me`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Session invalid');
    }
    return res.json();
  }

  async switchWorkspace(businessId: string): Promise<{ success: boolean; activeBusinessId: string; business: Business }> {
    const res = await fetch(`${this.baseUrl}/api/auth/switch-workspace`, {
      method: 'POST',
      headers: this.getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ businessId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to switch workspace');
    }
    const data = await res.json();
    this.setActiveBusinessId(data.activeBusinessId);
    return data;
  }

  logout(): void {
    this.setToken(null);
    this.setActiveBusinessId(null);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('auris_session_token');
      localStorage.removeItem('auris_active_business_id');
      localStorage.removeItem('auris_active_session_user');
    }
  }

  async getBootstrapData(): Promise<BootstrapResponse> {
    const res = await fetch(`${this.baseUrl}/api/bootstrap`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load system state');
    return res.json();
  }

  async updateBusiness(payload: Partial<Business>): Promise<{ success: boolean; business: Business }> {
    const res = await fetch(`${this.baseUrl}/api/business`, {
      method: 'PUT',
      headers: this.getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update business');
    return res.json();
  }

  async createAgent(payload: Partial<Agent>): Promise<Agent> {
    const res = await fetch(`${this.baseUrl}/api/agents`, {
      method: 'POST',
      headers: this.getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to create agent');
    return res.json();
  }

  async updateAgent(agentId: string, payload: Partial<Agent>): Promise<Agent> {
    const res = await fetch(`${this.baseUrl}/api/agents/${agentId}`, {
      method: 'PUT',
      headers: this.getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update agent');
    return res.json();
  }

  async deleteAgent(agentId: string): Promise<boolean> {
    const res = await fetch(`${this.baseUrl}/api/agents/${agentId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
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
      headers: this.getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      let errMsg = 'Failed to dispatch carrier call';
      try {
        const errJson = await res.json();
        errMsg = errJson.details || errJson.error || errMsg;
      } catch {
        // ignore
      }
      throw new Error(errMsg);
    }
    return res.json();
  }

  async startWebCall(params: {
    agentId: string;
    language?: string;
  }): Promise<{
    success: boolean;
    callId: string;
    token: string;
    langCode: string;
    agentName: string;
  }> {
    const res = await fetch(`${this.baseUrl}/api/voice/web-call/start`, {
      method: 'POST',
      headers: this.getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to start in-browser voice session');
    }
    return res.json();
  }

  async stopWebCall(callId: string): Promise<void> {
    await fetch(`${this.baseUrl}/api/voice/web-call/stop`, {
      method: 'POST',
      headers: this.getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ callId }),
    }).catch(() => {});
  }

  async getTelephonyMode(): Promise<{
    telephonyMode: 'managed' | 'byok';
    byokConfigured: {
      hasPlivoAuthId: boolean;
      hasPlivoAuthToken: boolean;
      hasSarvamApiKey: boolean;
      hasOpenaiApiKey: boolean;
    };
    plivoCallerId: string;
  }> {
    const res = await fetch(`${this.baseUrl}/api/workspace/telephony-mode`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load telephony mode');
    return res.json();
  }

  async updateTelephonyMode(payload: {
    telephonyMode: 'managed' | 'byok';
    byokCredentials?: {
      plivoAuthId?: string;
      plivoAuthToken?: string;
      sarvamApiKey?: string;
      openaiApiKey?: string;
      callerId?: string;
    };
  }): Promise<{ success: boolean; telephonyMode: string; message: string }> {
    const res = await fetch(`${this.baseUrl}/api/workspace/telephony-mode`, {
      method: 'POST',
      headers: this.getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update telephony mode');
    return res.json();
  }

  async getWallet(): Promise<WorkspaceWallet> {
    const res = await fetch(`${this.baseUrl}/api/wallet`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load workspace wallet');
    return res.json();
  }

  async rechargeWallet(
    amountInr: number,
    paymentMethod: string = 'razorpay_upi'
  ): Promise<{
    success: boolean;
    balanceInr: number;
    creditedAmount: number;
    transaction: WalletTransaction;
    message: string;
  }> {
    const res = await fetch(`${this.baseUrl}/api/wallet/recharge`, {
      method: 'POST',
      headers: this.getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ amountInr, paymentMethod }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to process wallet recharge');
    }
    return res.json();
  }

  async setWalletRate(perMinuteRateInr: number): Promise<{ success: boolean; perMinuteRateInr: number }> {
    const res = await fetch(`${this.baseUrl}/api/wallet/rate`, {
      method: 'POST',
      headers: this.getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ perMinuteRateInr }),
    });
    if (!res.ok) throw new Error('Failed to update rate');
    return res.json();
  }

  async getCalls(): Promise<Call[]> {
    const res = await fetch(`${this.baseUrl}/api/calls`, {
      headers: this.getHeaders(),
    });
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
      headers: this.getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Failed to provision phone number');
    return res.json();
  }

  async updatePhoneNumber(phoneId: string, params: {
    assignedAgentId?: string;
    friendlyName?: string;
  }): Promise<PhoneNumber> {
    const res = await fetch(`${this.baseUrl}/api/phone-numbers/${phoneId}`, {
      method: 'PATCH',
      headers: this.getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Failed to update phone number');
    const data = await res.json();
    return data.phoneNumber || data;
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
    const res = await fetch(`${this.baseUrl}/api/webhooks/voice-events`, {
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

  // Lead Management API
  async getLeads(): Promise<Lead[]> {
    const res = await fetch(`${this.baseUrl}/api/leads`);
    if (!res.ok) throw new Error('Failed to fetch leads');
    return res.json();
  }

  async createLead(lead: Partial<Lead>): Promise<Lead> {
    const res = await fetch(`${this.baseUrl}/api/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead),
    });
    if (!res.ok) throw new Error('Failed to create lead');
    return res.json();
  }

  async updateLead(leadId: string, updates: Partial<Lead>): Promise<Lead> {
    const res = await fetch(`${this.baseUrl}/api/leads/${leadId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update lead');
    return res.json();
  }

  async deleteLead(leadId: string): Promise<boolean> {
    const res = await fetch(`${this.baseUrl}/api/leads/${leadId}`, {
      method: 'DELETE',
    });
    return res.ok;
  }

  async importLeadsCsv(csvData: string, campaignId?: string): Promise<{ success: boolean; importedCount: number; leads: Lead[] }> {
    const res = await fetch(`${this.baseUrl}/api/leads/import-csv`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ csvData, campaignId }),
    });
    if (!res.ok) throw new Error('Failed to import leads from CSV');
    return res.json();
  }

  // Voice Preview & Audition Studio API
  async synthesizeVoicePreview(params: {
    text: string;
    languageCode?: string;
    voiceId?: string;
    provider?: 'cartesia' | 'sarvam' | 'auto';
  }): Promise<{
    success: boolean;
    provider: string;
    format: string;
    sampleRate: number;
    sizeBytes: number;
    durationEstimateMs: number;
    latencyMs: number;
    audioBase64: string;
  }> {
    const res = await fetch(`${this.baseUrl}/api/voice/synthesize-preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.details || err.error || 'Failed to synthesize voice preview');
    }
    return res.json();
  }

  // Carrier Mesh & Latency Diagnostics API
  async getCarrierDiagnostics(): Promise<{
    success: boolean;
    timestamp: string;
    overallMeshHealth: string;
    nodes: Array<{
      id: string;
      name: string;
      role: string;
      region: string;
      latencyMs: number;
      status: 'online' | 'degraded' | 'offline';
      tlsVersion: string;
      carrierTrunk?: string;
      supportedLanguages?: number;
      speed?: string;
      model?: string;
      uptimePercent: string;
    }>;
  }> {
    const res = await fetch(`${this.baseUrl}/api/infrastructure/carrier-diagnostics`);
    if (!res.ok) throw new Error('Failed to fetch carrier diagnostics');
    return res.json();
  }
}

export const aurisApi = new AurisApiClient();
