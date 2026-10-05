import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Upload,
  PhoneCall,
  Calendar,
  Sparkles,
  CheckCircle2,
  Clock,
  Download,
  Trash2,
  ChevronRight,
  X,
  FileSpreadsheet,
  AlertTriangle,
  Mail,
  Phone,
  Tag,
  BookOpen,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Lead, LeadStatus, Agent, Call } from '../../types';
import { aurisApi } from '../../services/apiService';

interface LeadsViewProps {
  agents: Agent[];
  onDispatchCall?: (params: { agentId: string; callerName?: string; callerNumber?: string; scenario?: string }) => Promise<Call>;
  onNavigateToCreateAgent?: () => void;
}

export const LeadsView: React.FC<LeadsViewProps> = ({
  agents,
  onDispatchCall,
  onNavigateToCreateAgent,
}) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [callingLeadId, setCallingLeadId] = useState<string | null>(null);
  const [callNotification, setCallNotification] = useState<string | null>(null);
  const [noAgentWarning, setNoAgentWarning] = useState(false);

  // Form State (Clean - no hardcoded dummy data)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    source: 'Website Lead Form',
    program: '',
  });

  // CSV Import State (Clean - empty by default)
  const [csvText, setCsvText] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const data = await aurisApi.getLeads();
      setLeads(data || []);
    } catch (err) {
      console.warn('Leads fetch note:', err);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert('Please provide at least a Lead Name and Phone Number.');
      return;
    }

    try {
      const created = await aurisApi.createLead({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        source: formData.source.trim() || 'Manual Input',
        customFields: formData.program.trim() ? { program: formData.program.trim() } : {},
      });
      setLeads((prev) => [created, ...prev]);
      setIsAddModalOpen(false);
      setFormData({ name: '', phone: '', email: '', source: 'Website Lead Form', program: '' });
      confetti({ particleCount: 40, spread: 50 });
    } catch (err: any) {
      alert('Failed to create lead: ' + err.message);
    }
  };

  const handleImportCsv = async () => {
    if (!csvText.trim()) {
      alert('Please paste CSV data with at least Name and Phone headers.');
      return;
    }
    setIsImporting(true);
    try {
      const res = await aurisApi.importLeadsCsv(csvText);
      if (res.leads && Array.isArray(res.leads)) {
        setLeads((prev) => [...res.leads, ...prev]);
      }
      setIsImporting(false);
      setIsImportModalOpen(false);
      setCsvText('');
      confetti({ particleCount: 75, spread: 70 });
    } catch (err: any) {
      setIsImporting(false);
      alert('CSV Import error: ' + err.message);
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    try {
      await aurisApi.deleteLead(id);
      setLeads((prev) => prev.filter((l) => l.id !== id));
      if (selectedLead?.id === id) setSelectedLead(null);
    } catch (err: any) {
      alert('Failed to delete lead: ' + err.message);
    }
  };

  const handleCallLead = async (lead: Lead) => {
    if (!agents || agents.length === 0) {
      setNoAgentWarning(true);
      return;
    }
    if (!onDispatchCall) return;

    setCallingLeadId(lead.id);
    try {
      const agent = agents[0];
      await onDispatchCall({
        agentId: agent.id,
        callerName: lead.name,
        callerNumber: lead.phone,
        scenario: `Outbound qualification call for prospective client ${lead.name}`,
      });
      setCallNotification(`AI Agent dispatched call to ${lead.name} (${lead.phone})!`);
      fetchLeads();
      setTimeout(() => setCallNotification(null), 5000);
    } catch (err: any) {
      alert('Call dispatch failed: ' + err.message);
    } finally {
      setCallingLeadId(null);
    }
  };

  const handleExportCsv = () => {
    if (leads.length === 0) return;
    const headers = ['ID', 'Name', 'Phone', 'Email', 'Status', 'Lead Score', 'Appointment', 'Category/Program', 'Source', 'Created At'];
    const rows = leads.map((l) => [
      l.id,
      `"${l.name.replace(/"/g, '""')}"`,
      `"${l.phone}"`,
      `"${l.email || ''}"`,
      l.status,
      l.leadScore || 60,
      `"${l.appointmentTime || ''}"`,
      `"${l.customFields?.program || ''}"`,
      `"${l.source || ''}"`,
      l.createdAt,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `leads_pipeline_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case 'appointment_booked':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            Appointment Booked
          </span>
        );
      case 'qualified':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            Qualified
          </span>
        );
      case 'contacted':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            Contacted
          </span>
        );
      case 'calling':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 animate-pulse">
            Calling...
          </span>
        );
      case 'unreachable':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            Unreachable
          </span>
        );
      case 'queued':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            Queued
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
            New Lead
          </span>
        );
    }
  };

  const filteredLeads = leads.filter((l) => {
    if (statusFilter !== 'all' && l.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = l.name.toLowerCase().includes(q);
      const matchPhone = l.phone.includes(q);
      const matchEmail = l.email?.toLowerCase().includes(q);
      const matchNotes = l.qualificationNotes?.toLowerCase().includes(q);
      const matchCustom = Object.values(l.customFields || {}).some((v) => String(v).toLowerCase().includes(q));
      if (!matchName && !matchPhone && !matchEmail && !matchNotes && !matchCustom) return false;
    }
    return true;
  });

  const qualifiedCount = leads.filter((l) => l.status === 'qualified' || l.status === 'appointment_booked').length;
  const bookedCount = leads.filter((l) => l.status === 'appointment_booked').length;
  const conversionRate = leads.length > 0 ? Math.round((qualifiedCount / leads.length) * 100) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight">Leads & Customer Pipeline</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-500" />
              Automated AI Qualification
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Import, triage, and automatically qualify inquiries into confirmed appointments and CRM conversions.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {leads.length > 0 && (
            <button
              onClick={handleExportCsv}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#0C1527] border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#131F37] text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Download className="w-4 h-4 text-slate-400" />
              Export CSV
            </button>
          )}
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#0C1527] border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#131F37] text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-2xs"
          >
            <Upload className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Import CSV
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Lead
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {callNotification && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-200 flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{callNotification}</span>
        </div>
      )}

      {/* No Agent Warning Modal */}
      {noAgentWarning && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <p className="font-bold">No Voice Agents Available</p>
              <p className="text-[11px] text-amber-700 dark:text-amber-300">
                You need at least one AI Voice Agent configured before dispatching automated telephone calls.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onNavigateToCreateAgent && (
              <button
                onClick={() => {
                  setNoAgentWarning(false);
                  onNavigateToCreateAgent();
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-500 transition-colors cursor-pointer"
              >
                Create Agent
              </button>
            )}
            <button
              onClick={() => setNoAgentWarning(false)}
              className="p-1.5 text-amber-600 hover:text-amber-800 dark:text-amber-400 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Metric Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0C1527] border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Pipeline</span>
          <p className="text-2xl font-black text-slate-950 dark:text-white mt-1 font-mono">{leads.length}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0C1527] border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Booked Appointments</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono">{bookedCount}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0C1527] border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Qualified Prospects</span>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1 font-mono">{qualifiedCount}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0C1527] border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Qualification Rate</span>
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1 font-mono">{conversionRate}%</p>
        </div>
      </div>

      {/* 3. Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-[#0C1527] border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search leads by name, phone, email, notes, program..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-[#131F37] border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-[#131F37] border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-700 dark:text-slate-200 cursor-pointer focus:outline-hidden"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="queued">Queued</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="appointment_booked">Appointment Booked</option>
            <option value="calling">Calling...</option>
            <option value="unreachable">Unreachable</option>
          </select>
        </div>
      </div>

      {/* 4. Leads Table / Empty State */}
      <div className="rounded-2xl bg-white dark:bg-[#0C1527] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-16 text-center text-slate-400 dark:text-slate-500 space-y-2">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs">Loading pipeline leads...</p>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="py-16 px-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-3xl bg-slate-100 dark:bg-[#131F37] border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mx-auto">
              <Users className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-base font-black text-slate-950 dark:text-white">
                {leads.length === 0 ? 'No Leads in Pipeline Yet' : 'No Matching Leads Found'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {leads.length === 0
                  ? 'Add your first prospective student or client, or upload a CSV contact list to initiate automated AI telephone qualification.'
                  : 'No leads match your current search query or status filter. Try clearing filters.'}
              </p>
            </div>
            {leads.length === 0 && (
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add First Lead
                </button>
                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#131F37] dark:hover:bg-[#1A2A4A] text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-2 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-emerald-500" />
                  Import CSV
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#111C33] border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="px-5 py-3.5">Lead / Contact</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Program / Category</th>
                  <th className="px-4 py-3.5">AI Lead Score</th>
                  <th className="px-4 py-3.5">Appointment</th>
                  <th className="px-4 py-3.5">Source</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-[#13203A] transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-950 dark:text-white">{lead.name}</div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">{lead.phone}</div>
                    </td>
                    <td className="px-4 py-3.5">{getStatusBadge(lead.status)}</td>
                    <td className="px-4 py-3.5 font-medium text-slate-700 dark:text-slate-300">
                      {lead.customFields?.program || 'General Admissions'}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              (lead.leadScore || 60) >= 80
                                ? 'bg-emerald-500'
                                : (lead.leadScore || 60) >= 60
                                ? 'bg-blue-500'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${lead.leadScore || 60}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300">
                          {lead.leadScore || 60}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-semibold">
                      {lead.appointmentTime ? (
                        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                          <Calendar className="w-3.5 h-3.5" />
                          {lead.appointmentTime}
                        </span>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 text-[11px]">Not Scheduled</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400">{lead.source || 'Direct'}</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleCallLead(lead)}
                          disabled={callingLeadId === lead.id}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/80 dark:hover:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] flex items-center gap-1 transition-colors border border-emerald-200 dark:border-emerald-800/80 cursor-pointer disabled:opacity-50"
                          title="Call now with AI Agent"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span>{callingLeadId === lead.id ? 'Calling...' : 'Call'}</span>
                        </button>
                        <button
                          onClick={() => setSelectedLead(lead)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                          title="View lead profile"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteLead(lead.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                          title="Delete lead"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Add Lead Modal (Dark Theme Compliant) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0C1527] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl text-slate-950 dark:text-white space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-black">Create New Lead</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#131F37] border border-slate-200 dark:border-slate-700/80 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Phone Number * (+91 format)
                </label>
                <input
                  type="text"
                  required
                  placeholder="+91 98450 12345"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#131F37] border border-slate-200 dark:border-slate-700/80 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="client@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#131F37] border border-slate-200 dark:border-slate-700/80 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Program / Inquiry Category
                </label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science / Premium Consultation"
                  value={formData.program}
                  onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#131F37] border border-slate-200 dark:border-slate-700/80 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. CSV Batch Import Modal (Clean - No pre-filled dummy data) */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0C1527] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl p-6 shadow-2xl text-slate-950 dark:text-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-base font-black">Import Contacts via CSV</h2>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Paste raw CSV text below. The first row must be a header containing at least <code className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">Name</code> and <code className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">Phone</code> columns.
            </p>

            <textarea
              rows={8}
              placeholder={`Name,Phone,Email,Program\nJohn Doe,+919876543210,john@example.com,Computer Science`}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              className="w-full p-3.5 font-mono text-xs bg-slate-50 dark:bg-[#131F37] border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 font-semibold font-mono">
                Rows detected: {csvText.trim() ? Math.max(0, csvText.split('\n').filter((l) => l.trim()).length - 1) : 0}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleImportCsv}
                  disabled={isImporting || !csvText.trim()}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50 transition-colors"
                >
                  {isImporting ? 'Importing...' : 'Upload & Parse Leads'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Lead Profile Drawer (Dark Theme Compliant) */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0C1527] border-l border-slate-200 dark:border-slate-800 w-full max-w-md h-full p-6 overflow-y-auto space-y-6 shadow-2xl text-slate-950 dark:text-white">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Lead Audit Profile
              </span>
              <button
                onClick={() => setSelectedLead(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black">{selectedLead.name}</h3>
                {getStatusBadge(selectedLead.status)}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {selectedLead.phone}
              </p>
              {selectedLead.email && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {selectedLead.email}
                </p>
              )}
            </div>

            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#131F37] border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  AI Qualification Summary
                </span>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                  {selectedLead.qualificationNotes || 'Awaiting initial AI employee qualification call.'}
                </p>
              </div>

              {selectedLead.appointmentTime && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 space-y-1">
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                    Confirmed Appointment
                  </span>
                  <p className="text-xs font-black text-emerald-900 dark:text-emerald-100 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    {selectedLead.appointmentTime}
                  </p>
                </div>
              )}

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#131F37] border border-slate-200/80 dark:border-slate-800 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block uppercase">
                    Lead Quality Score
                  </span>
                  <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                    {selectedLead.leadScore || 60} / 100
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block uppercase">
                    Calls Dispatched
                  </span>
                  <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                    {selectedLead.callsCount || 0}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <button
                onClick={() => {
                  handleCallLead(selectedLead);
                  setSelectedLead(null);
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
              >
                <PhoneCall className="w-4 h-4" />
                Dispatch AI Qualification Call
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
