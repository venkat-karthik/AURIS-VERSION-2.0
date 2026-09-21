import React, { useState } from 'react';
import { Campaign, Agent, Call } from '../../types';
import {
  Megaphone,
  Plus,
  Play,
  Pause,
  Upload,
  CheckCircle2,
  Users,
  PhoneForwarded,
  Clock,
  ArrowRight,
  X,
  RefreshCw,
  Radio,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CampaignsViewProps {
  campaigns: Campaign[];
  agents: Agent[];
  onCreateCampaign: (campaign: Campaign) => void;
  onToggleCampaign: (id: string) => void;
  onStepCampaign?: (campaignId: string) => Promise<{ campaign: Campaign; newCall: Call }>;
}

export const CampaignsView: React.FC<CampaignsViewProps> = ({
  campaigns,
  agents,
  onCreateCampaign,
  onToggleCampaign,
  onStepCampaign,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [agentId, setAgentId] = useState(agents[0]?.id || '');
  const [contactsCount, setContactsCount] = useState(150);
  const [concurrentCalls, setConcurrentCalls] = useState(5);
  const [csvFileName, setCsvFileName] = useState('patient_checkup_leads_q3.csv');
  const [steppingCampId, setSteppingCampId] = useState<string | null>(null);
  const [stepNotice, setStepNotice] = useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    confetti({ particleCount: 50, spread: 60 });
    const selectedAgent = agents.find((a) => a.id === agentId) || agents[0];
    const newCamp: Campaign = {
      id: `camp_${Date.now()}`,
      businessId: 'biz_apollo_01',
      name: name || 'Preventive Recall Outreach',
      agentId: selectedAgent.id,
      agentName: selectedAgent.name,
      status: 'scheduled',
      totalContacts: contactsCount,
      completedContacts: 0,
      answeredContacts: 0,
      failedContacts: 0,
      completedCalls: 0,
      answeredCalls: 0,
      conversionRate: '0.0%',
      scheduleTime: 'Today, 2:00 PM',
      scheduledTime: 'Today, 2:00 PM',
      concurrentCalls,
      minutesUsed: 0,
      createdAt: new Date().toISOString(),
    };
    onCreateCampaign(newCamp);
    setIsModalOpen(false);
    setName('');
  };

  const handleTriggerStep = async (camp: Campaign) => {
    if (!onStepCampaign) return;
    setSteppingCampId(camp.id);
    try {
      const result = await onStepCampaign(camp.id);
      setSteppingCampId(null);
      setStepNotice(`Batch step complete for "${camp.name}"! Dispatched 25 concurrent calls. New appointment booked for ${result.newCall.callerName}.`);
      setTimeout(() => setStepNotice(null), 5000);
    } catch (err: any) {
      setSteppingCampId(null);
      alert('Failed to execute campaign step: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. TITLE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#123047] tracking-tight">Outbound Campaigns & Patient Recall</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EFFAF1] text-[#38A85B] border border-[#65C978]/30 flex items-center gap-1">
              <Radio className="w-3 h-3 animate-pulse" />
              Multi-Line Carrier Dialer
            </span>
          </div>
          <p className="text-xs text-[#52636D] mt-0.5">
            Automate preventive health recalls, vaccination outreach, and corporate checkup booking campaigns.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#38A85B] hover:bg-[#2f8f4d] text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Outbound Campaign
        </button>
      </div>

      {/* Step Notification Notice */}
      {stepNotice && (
        <div className="p-4 rounded-2xl bg-[#EFFAF1] border border-[#65C978]/40 text-xs font-semibold text-[#123047] flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#38A85B] shrink-0" />
          <span>{stepNotice}</span>
        </div>
      )}

      {/* 2. CAMPAIGNS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((camp) => {
          const completed = camp.completedContacts || camp.completedCalls || 0;
          const answered = camp.answeredContacts || camp.answeredCalls || 0;
          const progressPercent = Math.min(100, Math.round((completed / (camp.totalContacts || 1)) * 100)) || 0;
          const isStepping = steppingCampId === camp.id;

          return (
            <div
              key={camp.id}
              className="bg-white rounded-2xl p-6 border border-[#DDEBEF] shadow-xs flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#123047]">{camp.name}</h3>
                    <p className="text-xs text-[#2189C8] font-medium mt-0.5">
                      Voice Agent: {camp.agentName}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize ${
                      camp.status === 'running'
                        ? 'bg-[#EFFAF1] text-[#38A85B] border border-[#65C978]/30 animate-pulse'
                        : camp.status === 'completed'
                        ? 'bg-[#EEF8FC] text-[#2189C8]'
                        : 'bg-[#FFF6EE] text-[#F38A3E]'
                    }`}
                  >
                    {camp.status}
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-[#123047]">
                    <span>Progress: {completed} / {camp.totalContacts} calls</span>
                    <span className="text-[#38A85B]">{progressPercent}%</span>
                  </div>
                  <div className="w-full bg-[#EEF4F6] rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#38A85B] h-2 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-[#DDEBEF] text-xs">
                  <div>
                    <span className="text-[10px] text-[#82919A] block">Answered & Qualified</span>
                    <span className="font-bold text-[#123047]">{answered} ({camp.conversionRate || '91.0%'})</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#82919A] block">Concurrent Lines</span>
                    <span className="font-bold text-[#2189C8]">{camp.concurrentCalls || 5} SIP Trunks</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#DDEBEF] flex items-center gap-2">
                <button
                  onClick={() => handleTriggerStep(camp)}
                  disabled={isStepping || camp.status === 'completed'}
                  className="flex-1 py-2 px-3 rounded-xl bg-[#2189C8] hover:bg-[#1a74ab] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 transition-colors"
                >
                  {isStepping ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Dispatching Batch...
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5" />
                      Run Batch (25 Calls)
                    </>
                  )}
                </button>

                <button
                  onClick={() => onToggleCampaign(camp.id)}
                  className="p-2 rounded-xl border border-[#DDEBEF] hover:bg-[#F5FAFC] text-[#52636D] cursor-pointer"
                  title={camp.status === 'running' ? 'Pause' : 'Resume'}
                >
                  {camp.status === 'running' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. MODAL: CREATE CAMPAIGN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#123047]/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#DDEBEF] relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full text-[#82919A] hover:text-[#123047]"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-[#123047] mb-1">Create Outbound Voice Campaign</h3>
            <p className="text-xs text-[#52636D] mb-6">
              Configure recipient CSV, concurrency channels, and assigned conversational AI agent.
            </p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#123047] mb-1">Campaign Objective & Title</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Q4 Senior Citizen Cardiac Health Checkup"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDEBEF] text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#123047] mb-1">Assigned Agent</label>
                  <select
                    value={agentId}
                    onChange={(e) => setAgentId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#DDEBEF] text-xs"
                  >
                    {agents.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#123047] mb-1">Concurrent SIP Channels</label>
                  <input
                    type="number"
                    min="1"
                    max="25"
                    value={concurrentCalls}
                    onChange={(e) => setConcurrentCalls(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#DDEBEF] text-xs"
                  />
                </div>
              </div>

              {/* Upload CSV Dropzone */}
              <div>
                <label className="block text-xs font-bold text-[#123047] mb-1">Upload Recipient Contacts (.csv)</label>
                <div className="p-4 rounded-xl border-2 border-dashed border-[#55B9E8]/40 bg-[#EEF8FC]/50 text-center space-y-1">
                  <Upload className="w-6 h-6 text-[#2189C8] mx-auto" />
                  <p className="text-xs font-bold text-[#123047]">{csvFileName}</p>
                  <p className="text-[10px] text-[#82919A]">240 contacts verified • Schema: Phone, Patient Name, Preferred Slot</p>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#38A85B] hover:bg-[#2f8f4d] text-white text-xs font-bold shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                Launch Outbound Campaign
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
