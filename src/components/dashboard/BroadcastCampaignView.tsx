import React, { useState } from 'react';
import {
  Radio,
  Plus,
  Play,
  Pause,
  Users,
  CheckCircle2,
  Clock,
  Send,
  Volume2,
  Calendar,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';

export const BroadcastCampaignView: React.FC = () => {
  const [broadcastName, setBroadcastName] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('Inbound Real Estate Appointment Scheduler');
  const [broadcastMessage, setBroadcastMessage] = useState(
    'నమస్తే! This is an exclusive update from our Indiranagar premium residency project. New 3BHK preview apartments are now open for weekend visits.'
  );
  const [recipientsCount, setRecipientsCount] = useState(250);
  const [scheduledDate, setScheduledDate] = useState('2026-09-25T11:00');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploySuccess, setDeploySuccess] = useState(false);

  const [broadcasts, setBroadcasts] = useState<Array<{
    id: string;
    name: string;
    agent: string;
    totalRecipients: number;
    delivered: number;
    answered: number;
    scheduledFor: string;
    status: string;
    successRate: string;
  }>>([
    {
      id: 'bc_01',
      name: 'Client Outreach & Appointment Follow-up',
      agent: 'Inbound Real Estate Appointment Scheduler',
      totalRecipients: 150,
      delivered: 142,
      answered: 128,
      scheduledFor: 'Recently Scheduled',
      status: 'Active',
      successRate: '90.1%',
    },
  ]);

  const handleLaunchBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastName.trim()) return;

    setIsDeploying(true);
    setTimeout(() => {
      const newBc = {
        id: `bc_${Date.now()}`,
        name: broadcastName.trim(),
        agent: selectedAgent,
        totalRecipients: recipientsCount,
        delivered: 0,
        answered: 0,
        scheduledFor: new Date(scheduledDate).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        status: 'Active',
        successRate: '—',
      };
      setBroadcasts((prev) => [newBc, ...prev]);
      setIsDeploying(false);
      setDeploySuccess(true);
      setTimeout(() => setDeploySuccess(false), 4000);
      setBroadcastName('');
    }, 1500);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Broadcast
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white shadow-xs">
              New
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Dispatch mass high-concurrency automated voice broadcasts with interactive caller replies.
          </p>
        </div>
      </div>

      {deploySuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Broadcast campaign queued for delivery over carrier lines!</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Broadcast Campaign */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-emerald-500" />
            <h2 className="text-base font-black text-slate-900 dark:text-white">
              New Voice Broadcast
            </h2>
          </div>

          <form onSubmit={handleLaunchBroadcast} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Campaign Name <span className="text-emerald-500">*</span>
              </label>
              <input
                type="text"
                required
                value={broadcastName}
                onChange={(e) => setBroadcastName(e.target.value)}
                placeholder="e.g. Festival Exclusive Preview"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Voice Agent
              </label>
              <select
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Inbound Real Estate Appointment Scheduler">
                  Inbound Real Estate Appointment Scheduler (ID: 143143)
                </option>
                <option value="Ava - Clinic Receptionist">Ava - Clinic Receptionist</option>
                <option value="Oliver - Preventive Health Recall">Oliver - Preventive Health Recall</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Spoken Broadcast Prompt / Script
              </label>
              <textarea
                rows={3}
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Recipients Count
                </label>
                <input
                  type="number"
                  value={recipientsCount}
                  onChange={(e) => setRecipientsCount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Schedule Time
                </label>
                <input
                  type="datetime-local"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isDeploying || !broadcastName.trim()}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isDeploying ? 'Deploying Broadcast...' : 'Launch Broadcast Campaign'}
            </button>
          </form>
        </div>

        {/* Existing Broadcast Campaigns */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-900 dark:text-white">
              Active Broadcasts ({broadcasts.length})
            </h2>
            <span className="text-xs text-slate-400 font-semibold">
              Carrier Trunking Powered
            </span>
          </div>

          <div className="space-y-4">
            {broadcasts.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 text-center text-slate-500 text-sm">
                No active broadcasts yet. Launch a new broadcast campaign from the left panel.
              </div>
            ) : (
              broadcasts.map((bc) => (
              <div
                key={bc.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {bc.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Handled by: <strong className="text-emerald-600 dark:text-emerald-400">{bc.agent}</strong>
                    </p>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      bc.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {bc.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Audience</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">{bc.totalRecipients} contacts</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Delivered</span>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{bc.delivered}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Pickup Rate</span>
                    <span className="font-extrabold text-sky-600 dark:text-sky-400">{bc.successRate}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Scheduled</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px] truncate">{bc.scheduledFor}</span>
                  </div>
                </div>
              </div>
            )))}
          </div>
        </div>
      </div>
    </div>
  );
};
