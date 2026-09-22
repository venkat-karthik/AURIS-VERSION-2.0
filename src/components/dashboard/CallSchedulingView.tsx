import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  Clock,
  Plus,
  Search,
  Filter,
  PhoneCall,
  Bot,
  User as UserIcon,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCw,
  CalendarCheck,
  CalendarX,
  Copy,
  Mail,
  MessageSquare,
  ChevronRight,
  Send,
  Zap,
} from 'lucide-react';
import { Agent, ScheduledCall } from '../../types';
import { aurisApi } from '../../services/apiService';

interface CallSchedulingViewProps {
  scheduledCalls: ScheduledCall[];
  agents: Agent[];
  onRefreshCalls?: () => void;
  onCallTriggered?: (call: any) => void;
}

export const CallSchedulingView: React.FC<CallSchedulingViewProps> = ({
  scheduledCalls: initialScheduledCalls,
  agents,
  onRefreshCalls,
  onCallTriggered,
}) => {
  const [calls, setCalls] = useState<ScheduledCall[]>(initialScheduledCalls);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [agentFilter, setAgentFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list');

  // Modal & AI States
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiParsing, setIsAiParsing] = useState(false);
  const [isTriggeringId, setIsTriggeringId] = useState<string | null>(null);
  const [activeCallDetails, setActiveCallDetails] = useState<any | null>(null);
  const [followupDraft, setFollowupDraft] = useState<any | null>(null);
  const [isDraftingId, setIsDraftingId] = useState<string | null>(null);
  const [rescheduleCall, setRescheduleCall] = useState<ScheduledCall | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    agentId: agents[0]?.id || '',
    scheduledAt: new Date(Date.now() + 3600000 * 2).toISOString().slice(0, 16),
    timezone: 'Asia/Kolkata (IST)',
    purpose: 'Appointment Confirmation & Follow-up',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    notes: '',
  });

  // Sync when prop changes
  React.useEffect(() => {
    setCalls(initialScheduledCalls);
  }, [initialScheduledCalls]);

  // Filtering
  const filteredCalls = calls.filter((item) => {
    const matchesSearch =
      item.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.customerPhone.includes(searchQuery) ||
      item.purpose.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesAgent = agentFilter === 'all' || item.agentId === agentFilter;
    return matchesSearch && matchesStatus && matchesAgent;
  });

  // Metrics
  const totalScheduled = calls.filter((c) => c.status === 'scheduled').length;
  const completedCalls = calls.filter((c) => c.status === 'completed').length;
  const highPriority = calls.filter(
    (c) => (c.priority === 'high' || c.priority === 'urgent') && c.status === 'scheduled'
  ).length;

  // Handle AI Smart Natural Language Parse
  const handleAiSmartSchedule = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiParsing(true);
    try {
      const result = await aurisApi.smartScheduleWithAI(aiPrompt);
      if (result) {
        setFormData({
          customerName: result.customerName || 'Prospective Patient',
          customerPhone: result.customerPhone || '+91 98450 12345',
          customerEmail: result.customerEmail || '',
          agentId: result.agentId || agents[0]?.id || '',
          scheduledAt: result.scheduledAt ? new Date(result.scheduledAt).toISOString().slice(0, 16) : formData.scheduledAt,
          timezone: 'Asia/Kolkata (IST)',
          purpose: result.purpose || 'Doctor Consultation Booking',
          priority: result.priority || 'medium',
          notes: result.notes || '',
        });
        setIsNewModalOpen(true);
        setAiPrompt('');
      }
    } catch (err: any) {
      console.error('AI smart schedule error:', err);
      // Fallback pre-fill
      setFormData((prev) => ({
        ...prev,
        purpose: aiPrompt.slice(0, 50),
      }));
      setIsNewModalOpen(true);
    } finally {
      setIsAiParsing(false);
    }
  };

  // Submit New Scheduled Call
  const handleCreateCall = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newCall = await aurisApi.createScheduledCall({
        ...formData,
        scheduledAt: new Date(formData.scheduledAt).toISOString(),
      });
      setCalls((prev) => [newCall, ...prev]);
      setIsNewModalOpen(false);
      // Reset form
      setFormData({
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        agentId: agents[0]?.id || '',
        scheduledAt: new Date(Date.now() + 3600000 * 2).toISOString().slice(0, 16),
        timezone: 'Asia/Kolkata (IST)',
        purpose: 'Appointment Confirmation & Follow-up',
        priority: 'medium',
        notes: '',
      });
    } catch (err: any) {
      alert(err.message || 'Failed to create scheduled call');
    }
  };

  // Trigger Scheduled Call Now
  const handleTriggerNow = async (id: string) => {
    setIsTriggeringId(id);
    try {
      const response = await aurisApi.triggerScheduledCall(id);
      if (response && response.scheduledCall) {
        setCalls((prev) =>
          prev.map((c) => (c.id === id ? response.scheduledCall : c))
        );
        setActiveCallDetails(response.call);
        if (onCallTriggered) {
          onCallTriggered(response.call);
        }
        if (onRefreshCalls) {
          onRefreshCalls();
        }
      }
    } catch (err: any) {
      alert(err.message || 'Failed to trigger call');
    } finally {
      setIsTriggeringId(null);
    }
  };

  // Handle Reschedule
  const handleSaveReschedule = async () => {
    if (!rescheduleCall || !rescheduleDate) return;
    try {
      const updated = await aurisApi.updateScheduledCall(rescheduleCall.id, {
        scheduledAt: new Date(rescheduleDate).toISOString(),
        status: 'scheduled',
      });
      setCalls((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setRescheduleCall(null);
      setRescheduleDate('');
    } catch (err: any) {
      alert(err.message || 'Failed to reschedule');
    }
  };

  // Handle Cancel Call
  const handleCancelCall = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this scheduled call?')) return;
    try {
      const updated = await aurisApi.updateScheduledCall(id, { status: 'cancelled' });
      setCalls((prev) => prev.map((c) => (c.id === id ? updated : c)));
    } catch (err: any) {
      alert(err.message || 'Failed to cancel call');
    }
  };

  // Generate Followup Draft with AI
  const handleGenerateFollowup = async (call: ScheduledCall) => {
    setIsDraftingId(call.id);
    try {
      const draft = await aurisApi.generateFollowupDraft({
        recipientName: call.customerName,
        recipientPhone: call.customerPhone,
        purpose: call.purpose,
        outcome: call.notes || 'Confirmed appointment slot with clinic specialist',
      });
      setFollowupDraft({ ...draft, customerName: call.customerName });
    } catch (err: any) {
      alert(err.message || 'Failed to generate follow-up draft');
    } finally {
      setIsDraftingId(null);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(type);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  // Helper for relative time
  const formatTimeRemaining = (dateString: string) => {
    const target = new Date(dateString).getTime();
    const now = Date.now();
    const diffHours = (target - now) / (1000 * 60 * 60);

    if (diffHours < 0 && Math.abs(diffHours) < 24) {
      return `${Math.abs(Math.round(diffHours))}h ago`;
    }
    if (diffHours < 0) {
      return 'Past due';
    }
    if (diffHours < 1) {
      return `In ${Math.max(1, Math.round(diffHours * 60))} mins`;
    }
    if (diffHours < 24) {
      return `In ${Math.round(diffHours)} hours`;
    }
    const days = Math.round(diffHours / 24);
    return `In ${days} day${days > 1 ? 's' : ''}`;
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300">
            Urgent
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
            High
          </span>
        );
      case 'low':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            Low
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
            Medium
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Scheduled
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Completed
          </span>
        );
      case 'in-progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
            <RotateCw className="w-3.5 h-3.5 animate-spin text-amber-600" />
            Dialing Out...
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
            <CalendarX className="w-3.5 h-3.5" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs text-slate-600 bg-slate-100">
            {status}
          </span>
        );
    }
  };

  return (
    <div id="call-scheduling-view" className="space-y-6">
      {/* 1. Header & Quick Metrics */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white tracking-tight flex items-center gap-2.5">
            <Calendar className="w-7 h-7 text-[#0284C7]" />
            Call Scheduling & Outbound Dispatch
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Automate outgoing patient consultations, lead recall campaigns, and follow-up queues with assigned AI voice agents.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white font-medium text-sm shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Schedule New Call
          </button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0F172A] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">
            <span>Upcoming in Queue</span>
            <Clock className="w-4 h-4 text-[#0284C7]" />
          </div>
          <p className="text-2xl font-bold text-[#0F172A] dark:text-white mt-2">
            {totalScheduled}
          </p>
          <span className="text-xs text-slate-500 mt-1 block">Active automated reminders</span>
        </div>

        <div className="bg-white dark:bg-[#0F172A] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">
            <span>High & Urgent Priority</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-[#0F172A] dark:text-white mt-2">
            {highPriority}
          </p>
          <span className="text-xs text-amber-600 dark:text-amber-400 mt-1 block">Requires priority dispatch</span>
        </div>

        <div className="bg-white dark:bg-[#0F172A] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">
            <span>Successfully Executed</span>
            <CalendarCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-[#0F172A] dark:text-white mt-2">
            {completedCalls}
          </p>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 block">Outcome verified</span>
        </div>

        <div className="bg-white dark:bg-[#0F172A] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">
            <span>AI Dispatch Engine</span>
            <Zap className="w-4 h-4 text-teal-500" />
          </div>
          <p className="text-2xl font-bold text-[#0F172A] dark:text-white mt-2">
            OmniTrunk
          </p>
          <span className="text-xs text-slate-500 mt-1 block">&lt;280ms SIP Latency Active</span>
        </div>
      </div>

      {/* 3. AI Smart Natural Language Scheduler Bar */}
      <div className="bg-linear-to-r from-sky-50 via-indigo-50/40 to-cyan-50 dark:from-[#0B1528] dark:to-[#0F2038] border border-sky-200 dark:border-sky-900/60 p-4 rounded-xl shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-[#0284C7]" />
          <span className="text-xs font-semibold tracking-wide uppercase text-[#0369A1] dark:text-sky-300">
            Gemini Natural Language Scheduling Copilot
          </span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAiSmartSchedule()}
            placeholder='Type or paste: "Call Dr. Rajesh Mehta tomorrow at 3:30 PM for cardiology review, high priority"'
            className="flex-1 px-4 py-2.5 rounded-lg border border-sky-300 dark:border-sky-800 bg-white dark:bg-slate-900 text-[#0F172A] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
          />
          <button
            onClick={handleAiSmartSchedule}
            disabled={isAiParsing || !aiPrompt.trim()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer shrink-0"
          >
            {isAiParsing ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                Parsing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Auto-Fill with AI
              </>
            )}
          </button>
        </div>
      </div>

      {/* 4. Controls: Filters & Search */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white dark:bg-[#0F172A] p-3 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="flex flex-1 items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by patient, phone or purpose..."
              className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-[#0F172A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={agentFilter}
            onChange={(e) => setAgentFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Agents</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name.split(' - ')[0]}
              </option>
            ))}
          </select>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg shrink-0">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              viewMode === 'list'
                ? 'bg-white dark:bg-slate-900 text-[#0F172A] dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            List Queue
          </button>
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              viewMode === 'timeline'
                ? 'bg-white dark:bg-slate-900 text-[#0F172A] dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Timeline View
          </button>
        </div>
      </div>

      {/* 5. Scheduled Calls List / Cards */}
      {filteredCalls.length === 0 ? (
        <div className="bg-white dark:bg-[#0F172A] border border-dashed border-slate-300 dark:border-slate-800 rounded-xl p-12 text-center">
          <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-[#0F172A] dark:text-white">No scheduled calls found</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery || statusFilter !== 'all' || agentFilter !== 'all'
              ? 'Try adjusting your filters or search keywords.'
              : 'Add your first scheduled automated patient outreach call above.'}
          </p>
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Schedule Call
          </button>
        </div>
      ) : viewMode === 'list' ? (
        <div className="bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-3.5 px-4">Recipient</th>
                  <th className="py-3.5 px-4">Scheduled For</th>
                  <th className="py-3.5 px-4">Assigned Agent</th>
                  <th className="py-3.5 px-4">Purpose</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredCalls.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#0F172A] dark:text-white">
                        {item.customerName}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <span>{item.customerPhone}</span>
                        {item.customerEmail && (
                          <>
                            <span>•</span>
                            <span className="truncate max-w-[140px]">{item.customerEmail}</span>
                          </>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-xs font-medium text-[#0F172A] dark:text-white">
                        {new Date(item.scheduledAt).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        at{' '}
                        {new Date(item.scheduledAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                      <div className="text-xs text-[#0284C7] font-medium mt-0.5">
                        {formatTimeRemaining(item.scheduledAt)}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-sky-100 dark:bg-sky-950/60 flex items-center justify-center text-[#0284C7] shrink-0">
                          <Bot className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
                          {item.agentName.split(' - ')[0]}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-xs text-slate-800 dark:text-slate-200 font-medium max-w-xs truncate">
                        {item.purpose}
                      </div>
                      {item.notes && (
                        <div className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                          {item.notes}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">{getPriorityBadge(item.priority)}</td>

                    <td className="py-3.5 px-4">{getStatusBadge(item.status)}</td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {item.status === 'scheduled' && (
                          <button
                            onClick={() => handleTriggerNow(item.id)}
                            disabled={isTriggeringId === item.id}
                            title="Dial Out Now"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {isTriggeringId === item.id ? (
                              <RotateCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <Play className="w-3 h-3 fill-white" />
                            )}
                            Dial Now
                          </button>
                        )}

                        <button
                          onClick={() => handleGenerateFollowup(item)}
                          disabled={isDraftingId === item.id}
                          title="Generate AI Follow-up Draft"
                          className="p-1.5 rounded text-slate-500 hover:text-[#0284C7] hover:bg-sky-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          {isDraftingId === item.id ? (
                            <RotateCw className="w-4 h-4 animate-spin text-[#0284C7]" />
                          ) : (
                            <MessageSquare className="w-4 h-4" />
                          )}
                        </button>

                        {item.status === 'scheduled' && (
                          <>
                            <button
                              onClick={() => {
                                setRescheduleCall(item);
                                setRescheduleDate(new Date(item.scheduledAt).toISOString().slice(0, 16));
                              }}
                              title="Reschedule"
                              className="p-1.5 rounded text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              <Calendar className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleCancelCall(item.id)}
                              title="Cancel Call"
                              className="p-1.5 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            >
                              <CalendarX className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Timeline View */
        <div className="space-y-4">
          {filteredCalls.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-[#0F172A] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 flex items-center justify-center text-[#0284C7] shrink-0 mt-0.5">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-[#0F172A] dark:text-white">
                      {item.customerName}
                    </h4>
                    {getPriorityBadge(item.priority)}
                    {getStatusBadge(item.status)}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 font-medium mt-1">
                    {item.purpose}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(item.scheduledAt).toLocaleString()} ({formatTimeRemaining(item.scheduledAt)})
                    </span>
                    <span className="flex items-center gap-1">
                      <Bot className="w-3.5 h-3.5 text-[#0284C7]" />
                      {item.agentName}
                    </span>
                    <span>{item.customerPhone}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                {item.status === 'scheduled' && (
                  <button
                    onClick={() => handleTriggerNow(item.id)}
                    disabled={isTriggeringId === item.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    {isTriggeringId === item.id ? (
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-white" />
                    )}
                    Trigger Call Now
                  </button>
                )}
                <button
                  onClick={() => handleGenerateFollowup(item)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
                >
                  AI Follow-up
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 6. Modal: Create Scheduled Call */}
      <AnimatePresence>
        {isNewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#0F172A] dark:text-white">
                    Schedule Voice Agent Call
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Configure automated outbound dispatch parameters and patient context.
                  </p>
                </div>
                <button
                  onClick={() => setIsNewModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-lg p-1"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleCreateCall} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Recipient / Patient Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-[#0F172A] dark:text-white focus:ring-2 focus:ring-[#0284C7] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                      placeholder="+91 98450 12345"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-[#0F172A] dark:text-white focus:ring-2 focus:ring-[#0284C7] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Assign AI Voice Agent *
                    </label>
                    <select
                      value={formData.agentId}
                      onChange={(e) => setFormData({ ...formData, agentId: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-[#0F172A] dark:text-white focus:ring-2 focus:ring-[#0284C7] focus:outline-none"
                    >
                      {agents.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} ({a.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) =>
                        setFormData({ ...formData, priority: e.target.value as any })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-[#0F172A] dark:text-white focus:ring-2 focus:ring-[#0284C7] focus:outline-none"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                      <option value="urgent">Urgent Priority</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Scheduled Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.scheduledAt}
                    onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-[#0F172A] dark:text-white focus:ring-2 focus:ring-[#0284C7] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Call Purpose / Objective *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    placeholder="e.g. Cardiology OPD Follow-Up & ECG Scheduling"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-[#0F172A] dark:text-white focus:ring-2 focus:ring-[#0284C7] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Notes & Special Caller Context (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="e.g. Patient prefers afternoon slots with Dr. Mehta. Fasting instructions needed."
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-[#0F172A] dark:text-white focus:ring-2 focus:ring-[#0284C7] focus:outline-none"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsNewModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white text-sm font-semibold transition-colors shadow-xs cursor-pointer"
                  >
                    Schedule Call
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. Modal: Reschedule Call */}
      <AnimatePresence>
        {rescheduleCall && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-xl"
            >
              <h3 className="text-lg font-bold text-[#0F172A] dark:text-white">
                Reschedule Call
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Updating appointment timing for {rescheduleCall.customerName}.
              </p>

              <div className="mt-4">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  New Scheduled Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-[#0F172A] dark:text-white focus:ring-2 focus:ring-[#0284C7] focus:outline-none"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  onClick={() => setRescheduleCall(null)}
                  className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveReschedule}
                  className="px-4 py-2 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white text-sm font-semibold cursor-pointer"
                >
                  Save New Time
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 8. Modal: Live Call Simulation Result */}
      <AnimatePresence>
        {activeCallDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#0F172A] dark:text-white text-base">
                      Call Completed Successfully
                    </h3>
                    <span className="text-xs text-slate-500">
                      Duration: {activeCallDetails.durationFormatted} • Sentiment:{' '}
                      <span className="capitalize font-medium text-emerald-600">
                        {activeCallDetails.sentiment}
                      </span>
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setActiveCallDetails(null)}
                  className="text-slate-400 hover:text-slate-600 text-lg p-1"
                >
                  ×
                </button>
              </div>

              {/* Call Transcript Box */}
              <div className="mt-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Live Conversation Transcript
                </h4>
                <div className="space-y-2 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 max-h-56 overflow-y-auto text-xs">
                  {activeCallDetails.transcript?.map((t: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span
                        className={`font-semibold capitalize shrink-0 ${
                          t.speaker === 'agent'
                            ? 'text-[#0284C7]'
                            : 'text-[#0F172A] dark:text-white'
                        }`}
                      >
                        {t.speaker}:
                      </span>
                      <span className="text-slate-700 dark:text-slate-300">{t.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Extracted Outcome */}
              <div className="mt-4 p-3.5 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-xs text-emerald-900 dark:text-emerald-200">
                <div className="font-semibold mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Outcome Verified & Logged
                </div>
                <p>{activeCallDetails.extractedEntities?.notes}</p>
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  onClick={() => setActiveCallDetails(null)}
                  className="px-4 py-2 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white text-sm font-semibold transition-colors"
                >
                  Close & View Call Logs
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 9. Modal: AI Follow-up Draft */}
      <AnimatePresence>
        {followupDraft && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#0284C7]" />
                  <h3 className="font-bold text-[#0F172A] dark:text-white">
                    AI Follow-Up Communications Draft
                  </h3>
                </div>
                <button
                  onClick={() => setFollowupDraft(null)}
                  className="text-slate-400 hover:text-slate-600 text-lg p-1"
                >
                  ×
                </button>
              </div>

              <div className="mt-4 space-y-4">
                {/* SMS Section */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-[#0284C7]" />
                      Direct SMS Message
                    </span>
                    <button
                      onClick={() => copyToClipboard(followupDraft.smsMessage, 'sms')}
                      className="text-xs text-[#0284C7] hover:underline flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      {copySuccess === 'sms' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-mono bg-white dark:bg-slate-950 p-2.5 rounded border border-slate-200 dark:border-slate-800">
                    {followupDraft.smsMessage}
                  </p>
                </div>

                {/* Email Section */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-indigo-500" />
                      Follow-up Email Body
                    </span>
                    <button
                      onClick={() => copyToClipboard(followupDraft.emailBody, 'email')}
                      className="text-xs text-[#0284C7] hover:underline flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      {copySuccess === 'email' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-xs font-semibold text-[#0F172A] dark:text-white mb-1">
                    Subject: {followupDraft.emailSubject}
                  </p>
                  <div className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line bg-white dark:bg-slate-950 p-2.5 rounded border border-slate-200 dark:border-slate-800 max-h-36 overflow-y-auto">
                    {followupDraft.emailBody}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  onClick={() => setFollowupDraft(null)}
                  className="px-4 py-2 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white text-sm font-semibold transition-colors"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
