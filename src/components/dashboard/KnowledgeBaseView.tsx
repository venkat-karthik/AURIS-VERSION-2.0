import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { KnowledgeItem } from '../../types';
import {
  BookOpen,
  Plus,
  Upload,
  Globe,
  FileText,
  RefreshCw,
  CheckCircle2,
  Search,
  Sparkles,
  X,
  Layers,
  Database,
  ExternalLink,
} from 'lucide-react';

interface KnowledgeBaseViewProps {
  knowledgeItems: KnowledgeItem[];
  onAddItem: (item: KnowledgeItem) => void;
}

export const KnowledgeBaseView: React.FC<KnowledgeBaseViewProps> = ({
  knowledgeItems,
  onAddItem,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'document' | 'website' | 'faq'>('document');
  const [title, setTitle] = useState('');
  const [contentOrUrl, setContentOrUrl] = useState('');
  const [isIndexing, setIsIndexing] = useState(false);
  
  // Test RAG Search Query
  const [testQuery, setTestQuery] = useState('');
  const [retrievedResult, setRetrievedResult] = useState<{
    source: string;
    text: string;
    score: number;
    chunks: number;
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleTestQuery = () => {
    if (!testQuery.trim()) return;
    setIsSearching(true);
    setTimeout(() => {
      const q = testQuery.toLowerCase();
      if (q.includes('insurance') || q.includes('tpa') || q.includes('cashless') || q.includes('star')) {
        setRetrievedResult({
          source: '2026 Insurance & TPA Network',
          text: 'Apollo Clinics Indiranagar Ind-Branch accepts cashless settlement across Star Health, Care Health, HDFC ERGO, Max Bupa, and ICICI Lombard. Pre-authorization takes 15-30 minutes at desk #2.',
          score: 0.96,
          chunks: 4,
        });
      } else if (q.includes('hour') || q.includes('time') || q.includes('sunday') || q.includes('open') || q.includes('address') || q.includes('location')) {
        setRetrievedResult({
          source: 'Apollo Clinic Hours & Location',
          text: 'Operating Hours: Monday through Saturday 8:00 AM – 8:00 PM; Sunday 9:00 AM – 2:00 PM. Address: 104 Indiranagar 100ft Road, Bengaluru, Karnataka 560038. Metro Landmark: Near 12th Main Junction.',
          score: 0.94,
          chunks: 6,
        });
      } else if (q.includes('price') || q.includes('cost') || q.includes('fee') || q.includes('consultation')) {
        setRetrievedResult({
          source: 'Specialist Consultation Pricing & Services',
          text: 'General Physician: $40 | Senior Cardiologist / Neurologist: $75 | Dental Scaling & Polishing: $60. Full Body Annual Health Checkup package: $180 (includes 64 biochemical parameters).',
          score: 0.92,
          chunks: 3,
        });
      } else {
        const primaryItem = knowledgeItems[0] || { title: 'Verified Knowledge Base' };
        setRetrievedResult({
          source: primaryItem.title,
          text: `Retrieved verified business context: "${primaryItem.title}" specifies patient onboarding guidelines, prompt specialist appointment allocation, and rapid SMS confirmation routing upon caller booking.`,
          score: 0.89,
          chunks: 2,
        });
      }
      setIsSearching(false);
    }, 350);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    setIsIndexing(true);

    setTimeout(() => {
      const newItem: KnowledgeItem = {
        id: `kb_${Date.now()}`,
        businessId: 'biz_apollo_01',
        title: title || (modalType === 'website' ? contentOrUrl.replace(/^https?:\/\//, '') : 'New Knowledge Document'),
        type: modalType,
        status: 'ready',
        sizeOrCount: modalType === 'website' ? '18 pages indexed' : '1.8 MB (42 chunks)',
        updatedAt: 'Just now',
        assignedAgents: ['Ava (Receptionist)', 'Liam (Sales Representative)'],
      };
      onAddItem(newItem);
      setIsIndexing(false);
      setIsModalOpen(false);
      setTitle('');
      setContentOrUrl('');
    }, 600);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#123047] tracking-tight">Knowledge Base & RAG</h1>
          <p className="text-xs text-[#52636D] mt-0.5">
            Train your AI voice agents on verified company documents, clinic schedules, physician directories, and pricing sheets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setModalType('document');
              setIsModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-[#38A85B] hover:bg-[#2f8f4d] text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add Knowledge Source
          </button>
        </div>
      </div>

      {/* Interactive RAG Retrieval Playground */}
      <div className="bg-white rounded-2xl p-6 border border-[#DDEBEF] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#EEF8FC] text-[#2189C8] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#123047]">RAG Vector Retrieval Simulator</h3>
              <p className="text-[11px] text-[#52636D]">
                Test semantic grounding in sub-200ms before deploying to live callers.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#EFFAF1] text-[#38A85B] border border-[#65C978]/30">
            HNSW Index Active
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={testQuery}
            onChange={(e) => setTestQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleTestQuery();
            }}
            placeholder="Ask a question (e.g. What are your Sunday hours and cashless insurance partners?)..."
            className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-[#DDEBEF] bg-[#F5FAFC] text-[#123047] focus:outline-none focus:border-[#2189C8]"
          />
          <button
            onClick={handleTestQuery}
            disabled={isSearching}
            className="px-5 py-2.5 rounded-xl bg-[#2189C8] text-white text-xs font-bold hover:bg-[#1b72a6] cursor-pointer transition-all flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            {isSearching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            Test Retrieval
          </button>
        </div>

        {/* Suggested Quick Questions */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
          <span className="text-[#82919A] font-semibold">Try sample queries:</span>
          {[
            'What are your Sunday hours?',
            'Which cashless TPAs do you accept?',
            'What is the price of cardiologist consultation?',
          ].map((q, idx) => (
            <button
              key={idx}
              onClick={() => {
                setTestQuery(q);
                setTimeout(() => handleTestQuery(), 50);
              }}
              className="px-2.5 py-1 rounded-lg bg-[#F5FAFC] hover:bg-[#EEF8FC] border border-[#DDEBEF] text-[#123047] cursor-pointer transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        <AnimatePresence>
          {retrievedResult && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="p-4 rounded-xl bg-[#EFFAF1] border border-[#65C978]/40 text-xs text-[#123047] space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#38A85B] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Semantic Vector Hit from "{retrievedResult.source}"
                </span>
                <span className="text-[10px] font-mono text-[#52636D] bg-white px-2 py-0.5 rounded-full border border-[#DDEBEF]">
                  Cosine Sim: {retrievedResult.score} • {retrievedResult.chunks} chunks
                </span>
              </div>
              <p className="text-[#123047] leading-relaxed bg-white/80 p-3 rounded-lg border border-[#65C978]/20">
                {retrievedResult.text}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sources Table */}
      <div className="bg-white rounded-2xl border border-[#DDEBEF] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#DDEBEF] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#123047]" />
            <h3 className="text-xs font-bold text-[#123047] uppercase tracking-wider">
              Connected Knowledge Sources ({knowledgeItems.length})
            </h3>
          </div>
          <span className="text-xs text-[#52636D]">Synced to RAG Pipeline</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5FAFC] border-b border-[#DDEBEF] text-[#82919A] font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-6">Source Name</th>
                <th className="py-3.5 px-6">Type</th>
                <th className="py-3.5 px-6">Index Status</th>
                <th className="py-3.5 px-6">Size / Scope</th>
                <th className="py-3.5 px-6">Last Synced</th>
                <th className="py-3.5 px-6 text-right">Assigned To</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDEBEF] text-[#123047]">
              {knowledgeItems.map((item) => (
                <tr key={item.id} className="hover:bg-[#F5FAFC] transition-colors">
                  <td className="py-4 px-6 font-bold flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#EEF8FC] text-[#2189C8] flex items-center justify-center flex-shrink-0">
                      {item.type === 'document' ? <FileText className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                    </div>
                    <span>{item.title}</span>
                  </td>

                  <td className="py-4 px-6 font-medium text-[#52636D] capitalize">
                    {item.type}
                  </td>

                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#EFFAF1] text-[#38A85B] border border-[#65C978]/30">
                      <CheckCircle2 className="w-3 h-3" />
                      Vectorized & Ready
                    </span>
                  </td>

                  <td className="py-4 px-6 text-[#52636D] font-mono text-[11px]">
                    {item.sizeOrCount}
                  </td>

                  <td className="py-4 px-6 text-[#82919A]">
                    {item.updatedAt}
                  </td>

                  <td className="py-4 px-6 text-right text-[#52636D] font-medium">
                    {item.assignedAgents?.join(', ') || 'All Agents'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Adding Knowledge Source */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-[#123047]/40 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#DDEBEF] shadow-2xl space-y-6"
            >
              <div className="flex justify-between items-center pb-2 border-b border-[#DDEBEF]">
                <div>
                  <h3 className="text-lg font-bold text-[#123047]">Add Knowledge Source</h3>
                  <p className="text-xs text-[#52636D]">Empower your voice agents with real facts.</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg text-[#82919A] hover:text-[#123047] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Source Type Selector */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setModalType('document')}
                  className={`py-2 text-xs font-bold rounded-xl border cursor-pointer transition-all ${
                    modalType === 'document' ? 'border-[#38A85B] bg-[#EFFAF1] text-[#38A85B]' : 'border-[#DDEBEF]'
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setModalType('website')}
                  className={`py-2 text-xs font-bold rounded-xl border cursor-pointer transition-all ${
                    modalType === 'website' ? 'border-[#38A85B] bg-[#EFFAF1] text-[#38A85B]' : 'border-[#DDEBEF]'
                  }`}
                >
                  Website URL
                </button>
                <button
                  type="button"
                  onClick={() => setModalType('faq')}
                  className={`py-2 text-xs font-bold rounded-xl border cursor-pointer transition-all ${
                    modalType === 'faq' ? 'border-[#38A85B] bg-[#EFFAF1] text-[#38A85B]' : 'border-[#DDEBEF]'
                  }`}
                >
                  Manual FAQ
                </button>
              </div>

              <form onSubmit={handleSaveItem} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#123047] mb-1">Document Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. 2026 Insurance & TPA Network"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDEBEF] text-xs focus:outline-none focus:border-[#2189C8]"
                  />
                </div>

                {modalType === 'document' && (
                  <div className="p-6 rounded-xl border-2 border-dashed border-[#55B9E8]/40 bg-[#EEF8FC]/40 text-center space-y-1">
                    <Upload className="w-8 h-8 text-[#2189C8] mx-auto" />
                    <p className="text-xs font-bold text-[#123047]">Drag & drop PDF, DOCX, or TXT</p>
                    <p className="text-[10px] text-[#82919A]">Automatic chunking into 512-token vectors</p>
                  </div>
                )}

                {modalType === 'website' && (
                  <div>
                    <label className="block text-xs font-bold text-[#123047] mb-1">Target URL to Crawl</label>
                    <input
                      type="url"
                      required
                      value={contentOrUrl}
                      onChange={(e) => setContentOrUrl(e.target.value)}
                      placeholder="https://apolloclinics.com/services"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDEBEF] text-xs focus:outline-none focus:border-[#2189C8]"
                    />
                  </div>
                )}

                {modalType === 'faq' && (
                  <div>
                    <label className="block text-xs font-bold text-[#123047] mb-1">Frequently Asked Questions</label>
                    <textarea
                      rows={4}
                      required
                      value={contentOrUrl}
                      onChange={(e) => setContentOrUrl(e.target.value)}
                      placeholder="Q: What time does Dr. Mehta take walk-ins?&#10;A: Between 10:00 AM and 1:00 PM on weekdays."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDEBEF] text-xs focus:outline-none focus:border-[#2189C8]"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isIndexing}
                  className="w-full py-3 rounded-xl bg-[#38A85B] hover:bg-[#2f8f4d] text-white text-xs font-bold shadow-xs cursor-pointer transition-all flex items-center justify-center gap-2"
                >
                  {isIndexing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Chunking & Vectorizing...
                    </>
                  ) : (
                    'Index & Sync to Voice Agents'
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
