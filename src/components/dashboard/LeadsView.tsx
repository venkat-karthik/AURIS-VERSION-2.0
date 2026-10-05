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
  AlertCircle,
  Clock,
  Tag,
  ArrowUpDown,
  Download,
  Trash2,
  ExternalLink,
  Bot,
  UserCheck,
  ChevronRight,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Lead, LeadStatus, Agent, Call } from '../../types';
import { aurisApi } from '../../services/apiService';

interface LeadsViewProps {
  agents: Agent[];
  onDispatchCall?: (params: { agentId: string; callerName?: string; callerNumber?: string; scenario?: string }) => Promise<Call>;
}

export const LeadsView: React.FC<LeadsViewProps> = ({ agents, onDispatchCall }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [callingLeadId, setCallingLeadId] = useState<string | null>(null);
  const [callNotification, setCallNotification] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    source: 'Website Lead Form',
    program: 'B.Tech Computer Science',
  });

  // CSV Import State
  const [csvText, setCsvText] = useState(
    'Name,Phone,Email,Program\nSuresh Reddy,+919849011223,suresh@gmail.com,B.Tech AI & Data Science\nMeenakshi Iyer,+919712033445,meenakshi@outlook.com,MBA International Business\nVikram Malhotra,+919888055667,vikram.m@yahoo.com,B.Tech Mechanical'
  );
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const data = await aurisApi.getLeads();
      setLeads(data);
    } catch (err) {
      console.warn('Leads fetch note:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await aurisApi.createLead({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        source: formData.source,
        customFields: { program: formData.program },
      });
      setLeads((prev) => [created, ...prev]);
      setIsAddModalOpen(false);
      setFormData({ name: '', phone: '', email: '', source: 'Website Lead Form', program: 'B.Tech Computer Science' });
      confetti({ particleCount: 40, spread: 50 });
    } catch (err: any) {
      alert('Failed to create lead: ' + err.message);
    }
  };

  const handleImportCsv = async () => {
    if (!csvText.trim()) return;
    setIsImporting(true);
    try {
      const res = await aurisApi.importLeadsCsv(csvText);
      if (res.leads) {
        setLeads((prev) => [...res.leads, ...prev]);
      }
      setIsImporting(false);
      setIsImportModalOpen(false);
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
    if (!onDispatchCall) return;
    setCallingLeadId(lead.id);
    try {
      const agent = agents[0];
      await onDispatchCall({
        agentId: agent.id,
        callerName: lead.name,
        callerNumber: lead.phone,
        scenario: `Outbound qualification call for prospective student ${lead.name}`,
      });
      setCallNotification(`AI Employee dispatched call to ${lead.name} (${lead.phone})!`);
      // Refresh lead status
      fetchLeads();
      setTimeout(() => setCallNotification(null), 5000);
    } catch (err: any) {
      alert('Call dispatch failed: ' + err.message);
    } finally {
      setCallingLeadId(null);
    }
  };

  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case 'appointment_booked':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">Appointment Booked</span>;
      case 'qualified':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">Qualified</span>;
      case 'contacted':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">Contacted</span>;
      case 'calling':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 animate-pulse">Calling...</span>;
      case 'unreachable':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">Unreachable</span>;
      case 'queued':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">Queued</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">New Lead</span>;
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
      if (!matchName && !matchPhone && !matchEmail && !matchNotes) return false;
    }
    return true;
  });

  const qualifiedCount = leads.filter((l) => l.status === 'qualified' || l.status === 'appointment_booked').length;
  const bookedCount = leads.filter((l) => l.status === 'appointment_booked').length;
  const conversionRate = leads.length > 0 ? Math.round((qualifiedCount / leads.length) * 100) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Leads & Student Pipeline</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Automated AI Qualification
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Import, triage, and automatically qualify inquiries into confirmed admissions appointments.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4 text-slate-500" />
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
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{callNotification}</span>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Pipeline Leads</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{leads.length}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Appointments Locked</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{bookedCount}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Qualified Prospects</span>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{qualifiedCount}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">AI Qualification Rate</span>
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">{conversionRate}%</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search leads by name, phone, course, notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="queued">Queued</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="appointment_booked">Appointment Booked</option>
            <option value="unreachable">Unreachable</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3.5">Lead / Contact</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Program / Category</th>
                <th className="px-4 py-3.5">AI Lead Score</th>
                <th className="px-4 py-3.5">Appointment</th>
                <th className="px-4 py-3.5">Source</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                    Loading pipeline leads...
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                    No leads found matching current criteria.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900 dark:text-white">{lead.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">{lead.phone}</div>
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
                              (lead.leadScore || 60) >= 80 ? 'bg-emerald-500' : (lead.leadScore || 60) >= 60 ? 'bg-blue-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${lead.leadScore || 60}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">{lead.leadScore || 60}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-700 dark:text-slate-300">
                      {lead.appointmentTime ? (
                        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                          <Calendar className="w-3.5 h-3.5" />
                          {lead.appointmentTime}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Not Scheduled</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400">{lead.source || 'Direct'}</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleCallLead(lead)}
                          disabled={callingLeadId === lead.id}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                          title="Call now with AI Agent"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          {callingLeadId === lead.id ? 'Calling...' : 'Call'}
                        </button>
                        <button
                          onClick={() => setSelectedLead(lead)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                          title="View lead details"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteLead(lead.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete lead"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Lead Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-black text-slate-900 dark:text-white">Create New Lead</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-4 mt-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sravani Rao"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Phone Number (+91 format)</label>
                <input
                  type="text"
                  required
                  placeholder="+91 98450 12345"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="sravani@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Program of Interest</label>
                <input
                  type="text"
                  placeholder="B.Tech Computer Science & AI"
                  value={formData.program}
                  onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-black text-slate-900 dark:text-white">Batch Lead Import (CSV)</h2>
              </div>
              <button onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mt-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Paste your CSV content below. Must include at least a header row with <code>Name</code> and <code>Phone</code> columns.
              </p>

              <textarea
                rows={8}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                className="w-full p-3 font-mono text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-400 font-semibold">
                  Detected rows: {Math.max(0, csvText.split('\n').filter((l) => l.trim()).length - 1)}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsImportModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleImportCsv}
                    disabled={isImporting}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {isImporting ? 'Importing...' : 'Upload & Parse Leads'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lead Details Drawer */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-2xs flex justify-end z-50">
          <div className="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 w-full max-w-md h-full p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Lead Profile</span>
              <button onClick={() => setSelectedLead(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">{selectedLead.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">{selectedLead.phone}</p>
              {selectedLead.email && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{selectedLead.email}</p>}
            </div>

            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Qualification Summary</span>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">
                  {selectedLead.qualificationNotes || 'Awaiting initial AI employee qualification call.'}
                </p>
              </div>

              {selectedLead.appointmentTime && (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Confirmed Appointment</span>
                  <p className="text-xs font-black text-emerald-800 dark:text-emerald-200 mt-1 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {selectedLead.appointmentTime}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  handleCallLead(selectedLead);
                  setSelectedLead(null);
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer"
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
