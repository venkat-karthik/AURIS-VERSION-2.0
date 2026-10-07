import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
    confetti({
      particleCount: 60,
      spread: 70,
      colors: ['#1D64C2', '#5483B3', '#C1E8FF', '#052659'],
    });
    const selectedAgent = agents.find((a) => a.id === agentId) || agents[0];
    const newCamp: Campaign = {
      id: `camp_${Date.now()}`,
      businessId: 'biz_venkat_01',
      name: name || 'Client Follow-up Campaign',
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
            <h1 className="text-2xl font-extrabold text-slate-950 dark:text-white tracking-tight">
              Outbound Campaigns & Patient Recall
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#1D64C2]/15 text-[#1D64C2] dark:text-[#C1E8FF] border border-[#5483B3]/30 flex items-center gap-1">
              <Radio className="w-3 h-3 animate-pulse" />
              Multi-Line Carrier Dialer
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-[#7DA0CA] mt-0.5">
            Automate preventive health recalls, vaccination outreach, and corporate checkup booking campaigns.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#052659] via-[#1D64C2] to-[#2563EB] hover:from-[#1D64C2] hover:to-[#3B82F6] text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-[#1D64C2]/20 cursor-pointer transition-all animate-shimmer"
        >
          <Plus className="w-4 h-4" />
          Create Outbound Campaign
        </motion.button>
      </div>

      {/* Step Notification Notice */}
      {stepNotice && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-[#052659]/15 dark:bg-[#052659]/40 border border-[#1D64C2]/30 text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-[#1D64C2] dark:text-[#C1E8FF] shrink-0" />
          <span>{stepNotice}</span>
        </motion.div>
      )}

      {/* 2. CAMPAIGNS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((camp) => {
          const completed = camp.completedContacts || camp.completedCalls || 0;
          const answered = camp.answeredContacts || camp.answeredCalls || 0;
          const progressPercent = Math.min(100, Math.round((completed / (camp.totalContacts || 1)) * 100)) || 0;
          const isStepping = steppingCampId === camp.id;

          return (
            <motion.div
              key={camp.id}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-white dark:bg-[#052659]/30 rounded-2xl p-6 border border-slate-200 dark:border-[#5483B3]/25 hover:border-[#1D64C2]/50 shadow-xs hover:shadow-lg hover:shadow-[#1D64C2]/10 flex flex-col justify-between space-y-4 transition-all"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-950 dark:text-white">{camp.name}</h3>
                    <p className="text-xs text-[#1D64C2] dark:text-[#C1E8FF] font-medium mt-0.5">
                      Voice Agent: {camp.agentName}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize ${
                      camp.status === 'running'
                        ? 'bg-[#1D64C2]/15 text-[#1D64C2] dark:text-[#C1E8FF] border border-[#5483B3]/40 animate-pulse'
                        : camp.status === 'completed'
                        ? 'bg-[#052659] text-[#7DA0CA]'
                        : 'bg-amber-500/15 text-amber-500 dark:text-amber-300'
                    }`}
                  >
                    {camp.status}
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-slate-900 dark:text-white">
                    <span>Progress: {completed} / {camp.totalContacts} calls</span>
                    <span className="text-[#1D64C2] dark:text-[#C1E8FF]">{progressPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-[#021024] rounded-full h-2 overflow-hidden border border-slate-200/60 dark:border-[#5483B3]/20">
                    <div
                      className="bg-gradient-to-r from-[#052659] via-[#1D64C2] to-[#2563EB] h-2 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-[#5483B3]/20 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-[#7DA0CA] block">Answered & Qualified</span>
                    <span className="font-bold text-slate-900 dark:text-white">{answered} ({camp.conversionRate || '91.0%'})</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-[#7DA0CA] block">Concurrent Lines</span>
                    <span className="font-bold text-[#1D64C2] dark:text-[#C1E8FF]">{camp.concurrentCalls || 5} SIP Trunks</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-[#5483B3]/20 flex items-center gap-2">
                <button
                  onClick={() => handleTriggerStep(camp)}
                  disabled={isStepping || camp.status === 'completed'}
                  className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-[#052659] via-[#1D64C2] to-[#2563EB] hover:from-[#1D64C2] hover:to-[#3B82F6] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 transition-colors shadow-md shadow-[#1D64C2]/20"
                >
                  {isStepping ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Dispatching Batch...
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 text-[#C1E8FF]" />
                      Run Batch (25 Calls)
                    </>
                  )}
                </button>

                <button
                  onClick={() => onToggleCampaign(camp.id)}
                  className="p-2 rounded-xl border border-slate-200 dark:border-[#5483B3]/30 hover:bg-slate-100 dark:hover:bg-[#052659] text-slate-600 dark:text-[#7DA0CA] cursor-pointer transition-colors"
                  title={camp.status === 'running' ? 'Pause' : 'Resume'}
                >
                  {camp.status === 'running' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 3. MODAL: CREATE CAMPAIGN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#021024]/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#052659] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-[#5483B3]/30 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-slate-950 dark:text-white mb-1">Create Outbound Voice Campaign</h3>
            <p className="text-xs text-slate-500 dark:text-[#7DA0CA] mb-6">
              Configure recipient CSV, concurrency channels, and assigned conversational AI agent.
            </p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1">Campaign Objective & Title</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Q4 Senior Citizen Cardiac Health Checkup"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#5483B3]/30 bg-slate-50 dark:bg-[#021024] text-slate-950 dark:text-white text-xs focus:outline-none focus:border-[#1D64C2]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1">Assigned Agent</label>
                  <select
                    value={agentId}
                    onChange={(e) => setAgentId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#5483B3]/30 bg-slate-50 dark:bg-[#021024] text-slate-950 dark:text-white text-xs focus:outline-none focus:border-[#1D64C2]"
                  >
                    {agents.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1">Concurrent SIP Channels</label>
                  <input
                    type="number"
                    min="1"
                    max="25"
                    value={concurrentCalls}
                    onChange={(e) => setConcurrentCalls(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#5483B3]/30 bg-slate-50 dark:bg-[#021024] text-slate-950 dark:text-white text-xs focus:outline-none focus:border-[#1D64C2]"
                  />
                </div>
              </div>

              {/* Upload CSV Dropzone */}
              <div>
                <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1">Upload Recipient Contacts (.csv)</label>
                <div className="p-4 rounded-xl border-2 border-dashed border-[#5483B3]/40 bg-slate-50 dark:bg-[#021024]/50 text-center space-y-1">
                  <Upload className="w-6 h-6 text-[#1D64C2] dark:text-[#C1E8FF] mx-auto" />
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{csvFileName}</p>
                  <p className="text-[10px] text-slate-500 dark:text-[#7DA0CA]">240 contacts verified • Schema: Phone, Patient Name, Preferred Slot</p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#052659] via-[#1D64C2] to-[#2563EB] hover:from-[#1D64C2] hover:to-[#3B82F6] text-white text-xs font-bold shadow-md shadow-[#1D64C2]/20 cursor-pointer flex items-center justify-center gap-1.5 animate-shimmer"
              >
                Launch Outbound Campaign
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
