import React, { useState } from 'react';
import {
  Blocks,
  CheckCircle2,
  ExternalLink,
  Calendar,
  MessageSquare,
  Database,
  ArrowRight,
  ShieldCheck,
  Zap,
  RefreshCw,
  Send,
  Code2,
} from 'lucide-react';
import { aurisApi } from '../../services/apiService';

export const IntegrationsView: React.FC = () => {
  const [integrations, setIntegrations] = useState([
    {
      id: 'gcal',
      name: 'Google Calendar',
      category: 'Scheduling',
      description: 'Allows agents to look up real-time availability and book appointments directly on staff calendars.',
      connected: true,
      lastSync: '5 mins ago',
    },
    {
      id: 'hubspot',
      name: 'HubSpot CRM',
      category: 'CRM',
      description: 'Sync caller contacts, call recordings, sentiment summaries, and auto-created deals.',
      connected: true,
      lastSync: '12 mins ago',
    },
    {
      id: 'salesforce',
      name: 'Salesforce',
      category: 'Enterprise CRM',
      description: 'Push voice activity records, enterprise lead status updates, and custom object attributes.',
      connected: false,
      lastSync: 'Never',
    },
    {
      id: 'slack',
      name: 'Slack Alerts',
      category: 'Notifications',
      description: 'Send instant team alerts when emergency calls or VIP patient inquiries are detected.',
      connected: true,
      lastSync: 'Active webhook',
    },
    {
      id: 'razorpay',
      name: 'Razorpay Payments',
      category: 'Billing & Invoicing',
      description: 'Enables outbound collection calls where callers can receive verified SMS payment links.',
      connected: true,
      lastSync: 'Verified',
    },
    {
      id: 'zapier',
      name: 'Zapier & Make',
      category: 'Automation',
      description: 'Trigger over 5,000+ app workflows upon call completion or sentiment threshold flags.',
      connected: false,
      lastSync: 'Never',
    },
  ]);

  // Webhook Testing Sandbox State
  const [selectedEvent, setSelectedEvent] = useState('call.completed');
  const [isSendingWebhook, setIsSendingWebhook] = useState(false);
  const [webhookResponse, setWebhookResponse] = useState<any | null>(null);

  const toggleConnect = (id: string) => {
    setIntegrations((prev) =>
      prev.map((item) => (item.id === id ? { ...item, connected: !item.connected } : item))
    );
  };

  const handleSendTestWebhook = async () => {
    setIsSendingWebhook(true);
    try {
      const resp = await aurisApi.testTriggerWebhook(selectedEvent, {
        callId: `call_audit_${Date.now()}`,
        caller: '+91 98450 12345',
        patientName: 'Sunita Sharma',
        agent: 'Dr. Priya (Triage AI)',
        intent: 'Appointment Scheduled',
        slot: 'Tomorrow, 10:30 AM',
      });
      setWebhookResponse(resp);
      setIsSendingWebhook(false);
    } catch (err: any) {
      setIsSendingWebhook(false);
      alert('Webhook dispatch test failed: ' + err.message);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#123047] tracking-tight">Integrations & Webhooks</h1>
        <p className="text-xs text-[#52636D] mt-0.5">
          Connect your calendar, CRM, messaging, and automation tools with zero-code authentication and verified carrier webhooks.
        </p>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl p-6 border border-[#DDEBEF] shadow-xs flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#123047]">{item.name}</h3>
                  <span className="text-[10px] font-semibold text-[#82919A] uppercase tracking-wider">
                    {item.category}
                  </span>
                </div>

                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    item.connected
                      ? 'bg-[#EFFAF1] text-[#38A85B] border border-[#65C978]/30'
                      : 'bg-[#F5FAFC] text-[#82919A] border border-[#DDEBEF]'
                  }`}
                >
                  {item.connected ? 'Connected' : 'Not Connected'}
                </span>
              </div>

              <p className="text-xs text-[#52636D] mt-3">{item.description}</p>
            </div>

            <div className="pt-3 border-t border-[#DDEBEF] flex items-center justify-between text-xs">
              <span className="text-[11px] text-[#82919A]">Sync: {item.lastSync}</span>
              <button
                onClick={() => toggleConnect(item.id)}
                className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-colors ${
                  item.connected
                    ? 'bg-[#F5FAFC] hover:bg-rose-50 hover:text-rose-600 text-[#52636D]'
                    : 'bg-[#2189C8] hover:bg-[#1a74ab] text-white'
                }`}
              >
                {item.connected ? 'Disconnect' : 'Connect'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Live Webhook Testing Sandbox */}
      <div className="bg-white rounded-2xl p-6 border border-[#DDEBEF] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#EEF8FC] text-[#2189C8] flex items-center justify-center">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#123047]">Real-Time Webhook Simulator & Audit</h3>
              <p className="text-xs text-[#52636D]">
                Test HMAC-SHA256 signed event delivery to your backend or CRM endpoints.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-[#DDEBEF] text-xs font-semibold text-[#123047] bg-white"
            >
              <option value="call.completed">call.completed</option>
              <option value="appointment.booked">appointment.booked</option>
              <option value="lead.qualified">lead.qualified</option>
              <option value="call.missed">call.missed</option>
            </select>

            <button
              onClick={handleSendTestWebhook}
              disabled={isSendingWebhook}
              className="px-4 py-1.5 rounded-xl bg-[#2189C8] hover:bg-[#1a74ab] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
            >
              {isSendingWebhook ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Dispatch Test Webhook
                </>
              )}
            </button>
          </div>
        </div>

        {webhookResponse && (
          <div className="p-4 rounded-xl bg-[#123047] text-white space-y-2 text-xs font-mono animate-in fade-in">
            <div className="flex justify-between items-center text-[#55B9E8] font-bold">
              <span>HTTP 200 OK • Event Delivered</span>
              <span>Latency: 18ms</span>
            </div>
            <pre className="text-[11px] text-white/90 overflow-x-auto p-2 rounded bg-black/30">
              {JSON.stringify(webhookResponse, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
