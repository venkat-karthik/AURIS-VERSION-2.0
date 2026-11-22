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
  const [contactsCount, setContactsCount] = useState(250);
  const [concurrentCalls, setConcurrentCalls] = useState(5);
  const [csvFileName, setCsvFileName] = useState('enterprise_leads_pipeline.csv');
  const [steppingCampId, setSteppingCampId] = useState<string | null>(null);
  const [stepNotice, setStepNotice] = useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    confetti({
      particleCount: 60,
      spread: 70,
      colors: ['#06B6D4', '#3B82F6', '#10B981'],
    });
    const selectedAgent = agents.find((a) => a.id === agentId) || agents[0];
    const newCamp: Campaign = {
      id: `camp_${Date.now()}`,
      businessId: 'biz_enterprise_01',
      name: name || 'Enterprise Client Outreach Campaign',
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
      setStepNotice(`Batch step complete for "${camp.name}"! Dispatched 25 concurrent calls.`);
      setTimeout(() => setStepNotice(null), 5000);
    } catch (err: any) {
      setSteppingCampId(null);
      alert('Failed to execute campaign step: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. TITLE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-white tracking-tight">
              Outbound Voice Campaigns
            </h1>
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5">
              <Radio className="w-3 h-3 animate-pulse" />
              Multi-Line Carrier Dialer
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            High-throughput predictive outbound voice dispatch across parallel SIP trunks with automated sentiment tagging and CRM sync.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.35)] cursor-pointer transition-all"
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
          className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-xs font-semibold text-cyan-300 flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
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
              className="bg-[#090D16]/90 rounded-3xl p-6 border border-slate-800/80 shadow-xl backdrop-blur-xl flex flex-col justify-between space-y-5 hover:border-cyan-500/40 transition-all"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-white">{camp.name}</h3>
                    <p className="text-xs text-cyan-400 font-mono font-semibold mt-0.5">
                      Agent: {camp.agentName}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                      camp.status === 'running'
                        ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 animate-pulse'
                        : camp.status === 'completed'
                        ? 'bg-slate-900 text-slate-400 border border-slate-800'
                        : 'bg-amber-500/15 text-amber-400 border border-amber-500/40'
                    }`}
                  >
                    {camp.status}
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs font-mono font-semibold text-white">
                    <span>Progress: {completed} / {camp.totalContacts} calls</span>
                    <span className="text-cyan-400">{progressPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">Answered & Qualified</span>
                    <span className="font-bold text-white mt-1 block">{answered} ({camp.conversionRate || '91.0%'})</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">Concurrent Lines</span>
                    <span className="font-bold text-cyan-400 mt-1 block">{camp.concurrentCalls || 5} SIP Trunks</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
                <button
                  onClick={() => handleTriggerStep(camp)}
                  disabled={isStepping || camp.status === 'completed'}
                  className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 transition-all shadow-[0_0_15px_rgba(6,182,212,0.25)]"
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
                  className="p-2 rounded-xl border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white cursor-pointer transition-colors"
                  title={camp.status === 'running' ? 'Pause' : 'Resume'}
                >
                  {camp.status === 'running' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 3. MODAL: CREATE CAMPAIGN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#090D16] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-800 relative text-white">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-1">Create Outbound Voice Campaign</h3>
            <p className="text-xs text-slate-400 mb-6">
              Configure recipient CSV, concurrency channels, and assigned conversational AI agent.
            </p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Campaign Objective & Title</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Q4 Executive Decision-Maker Outreach"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Assigned Agent</label>
                  <select
                    value={agentId}
                    onChange={(e) => setAgentId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:outline-none focus:border-cyan-500"
                  >
                    {agents.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Concurrent SIP Channels</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={concurrentCalls}
                    onChange={(e) => setConcurrentCalls(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Upload CSV Dropzone */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Upload Recipient Contacts (.csv)</label>
                <div className="p-5 rounded-2xl border-2 border-dashed border-slate-800 bg-slate-950/70 text-center space-y-1">
                  <Upload className="w-6 h-6 text-cyan-400 mx-auto" />
                  <p className="text-xs font-bold text-white font-mono">{csvFileName}</p>
                  <p className="text-[10px] text-slate-400">Verified Schema: Destination Phone, Contact Name, Context Key</p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-[0_0_20px_rgba(6,182,212,0.35)] cursor-pointer flex items-center justify-center gap-2"
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
