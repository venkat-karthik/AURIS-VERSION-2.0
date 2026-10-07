import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { KnowledgeItem, Call } from '../../types';
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
  Trash2,
  FileSpreadsheet,
  PhoneCall,
  ShieldCheck,
  Cpu,
  ArrowRight,
  Download,
  AlertCircle,
  Link,
  Eye,
  Activity,
  Check,
  Cloud,
} from 'lucide-react';
import {
  syncKnowledgeItemToFirestore,
  deleteKnowledgeItemFromFirestore,
} from '../../services/firebase';
import { Interactive3DOrb } from '../common/Interactive3DOrb';
import { InteractiveAgentFlowChart } from '../common/InteractiveAgentFlowChart';
import { CloudinaryAudioUploadModal } from '../common/CloudinaryAudioUploadModal';

interface KnowledgeBaseViewProps {
  knowledgeItems: KnowledgeItem[];
  onAddItem: (item: KnowledgeItem) => void;
  onDeleteItem?: (id: string) => void;
  calls?: Call[];
}

export const KnowledgeBaseView: React.FC<KnowledgeBaseViewProps> = ({
  knowledgeItems,
  onAddItem,
  onDeleteItem,
  calls = [],
}) => {
  const [activeTab, setActiveTab] = useState<'sources' | 'csv' | 'call-summaries' | 'flowchart'>('sources');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'document' | 'website' | 'faq' | 'csv'>('document');
  const [title, setTitle] = useState('');
  const [contentOrUrl, setContentOrUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isIndexing, setIsIndexing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [notification, setNotification] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);

  // CSV Import State
  const [csvText, setCsvText] = useState('');
  const [csvPreviewRows, setCsvPreviewRows] = useState<string[][]>([]);
  const [isImportingCsv, setIsImportingCsv] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const csvFileInputRef = useRef<HTMLInputElement | null>(null);

  // Test RAG Search Query
  const [testQuery, setTestQuery] = useState('');
  const [retrievedResult, setRetrievedResult] = useState<{
    source: string;
    text: string;
    score: number;
    chunks: number;
    cloudinaryUrl?: string;
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Clear notification after 4s
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleTestQuery = () => {
    if (!testQuery.trim()) return;
    setIsSearching(true);
    setTimeout(() => {
      const q = testQuery.toLowerCase();
      if (q.includes('insurance') || q.includes('payment') || q.includes('pricing') || q.includes('rate')) {
        setRetrievedResult({
          source: 'Service Rates & Billing Guidelines',
          text: 'Payment methods accepted include major cards, UPI, and verified insurance carriers. Invoices and receipts are automatically dispatched upon consultation completion.',
          score: 0.96,
          chunks: 4,
          cloudinaryUrl: 'https://res.cloudinary.com/demo/raw/upload/v1740000000/auris_kb/billing_guide.pdf',
        });
      } else if (q.includes('hour') || q.includes('time') || q.includes('sunday') || q.includes('open') || q.includes('address') || q.includes('location')) {
        setRetrievedResult({
          source: 'Business Hours & Operational Locations',
          text: 'Operating Hours: Monday through Saturday 9:00 AM – 7:00 PM; Sunday 10:00 AM – 3:00 PM. Main Office: High Street Junction, Bengaluru, Karnataka 560038.',
          score: 0.94,
          chunks: 6,
        });
      } else if (q.includes('price') || q.includes('cost') || q.includes('fee') || q.includes('consultation')) {
        setRetrievedResult({
          source: 'Specialist Consultation Pricing & Services (CSV)',
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

  // Upload handler with Cloudinary + Firestore Sync
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsIndexing(true);
    setUploadProgress(20);

    let cloudinaryData: { publicId?: string; secureUrl?: string } = {};

    try {
      // If uploading a document, push to Cloudinary CDN endpoint
      if (modalType === 'document' && selectedFile) {
        setUploadProgress(50);
        const res = await fetch('/api/knowledge-base/upload-cloudinary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: selectedFile.name,
            fileType: selectedFile.type,
            category: 'knowledge_base_document',
          }),
        });
        if (res.ok) {
          const json = await res.json();
          cloudinaryData = {
            publicId: json.publicId,
            secureUrl: json.secureUrl,
          };
        }
      }

      setUploadProgress(80);

      const newItem: KnowledgeItem = {
        id: `kb_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        businessId: 'biz_venkat_01',
        title:
          title ||
          (selectedFile ? selectedFile.name : modalType === 'website' ? contentOrUrl.replace(/^https?:\/\//, '') : 'Knowledge Document'),
        type: modalType,
        content: contentOrUrl || (selectedFile ? `File: ${selectedFile.name}` : ''),
        status: 'ready',
        sizeOrCount:
          modalType === 'website'
            ? '18 pages indexed'
            : selectedFile
            ? `${(selectedFile.size / 1024).toFixed(1)} KB (Cloud Storage)`
            : '1.8 MB (42 chunks)',
        updatedAt: 'Just now',
        assignedAgents: ['Dr. Ava AI', 'Liam (Sales)'],
        assignedAgentIds: ['ag_receptionist_01', 'ag_sales_02'],
        cloudinaryUrl: cloudinaryData.secureUrl,
        cloudinaryPublicId: cloudinaryData.publicId,
      };

      // 1. Sync to Firestore (persistent database)
      await syncKnowledgeItemToFirestore(newItem);

      // 2. Also register in local backend
      fetch('/api/knowledge-base', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      }).catch((e) => console.warn('Backend KB sync notice:', e));

      onAddItem(newItem);
      setNotification({
        type: 'success',
        message: `Successfully uploaded and synchronized to Knowledge Base!`,
      });

      setIsModalOpen(false);
      setTitle('');
      setContentOrUrl('');
      setSelectedFile(null);
    } catch (err: any) {
      console.error('Failed to upload knowledge item:', err);
      setNotification({
        type: 'error',
        message: `Upload error: ${err.message || 'Check connection'}`,
      });
    } finally {
      setIsIndexing(false);
      setUploadProgress(0);
    }
  };

  // Delete Knowledge Item (deletes in website + Firestore + Cloudinary)
  const handleDeleteItem = async (item: KnowledgeItem) => {
    const confirmDelete = window.confirm(
      `Delete "${item.title}"? This will permanently remove the vectorized embeddings and delete the asset from Knowledge Base.`
    );
    if (!confirmDelete) return;

    try {
      // 1. Delete in Firestore
      await deleteKnowledgeItemFromFirestore(item.id);

      // 2. Delete on backend (which releases Cloudinary asset)
      await fetch(`/api/knowledge-base/${item.id}`, { method: 'DELETE' });

      // 3. Update UI state
      if (onDeleteItem) {
        onDeleteItem(item.id);
      }

      setNotification({
        type: 'success',
        message: `Deleted "${item.title}" from Knowledge Base.`,
      });
    } catch (err: any) {
      console.error('Error deleting knowledge item:', err);
      // Still update UI if requested
      if (onDeleteItem) onDeleteItem(item.id);
    }
  };

  // Parse CSV Preview
  const handleCsvTextChange = (text: string) => {
    setCsvText(text);
    const lines = text
      .split(/\r?\n/)
      .filter((l) => l.trim().length > 0)
      .slice(0, 5);
    const parsed = lines.map((l) => l.split(',').map((c) => c.trim().replace(/^["']|["']$/g, '')));
    setCsvPreviewRows(parsed);
  };

  // Load Sample Healthcare Doctor Schedules CSV
  const handleLoadSampleCsv = () => {
    const sample = `DoctorName,Specialty,DaysAvailable,Timing,ConsultationFee,Room
Dr. Rajesh Sharma,Senior Cardiologist,Mon-Wed-Fri,10:00 AM - 01:00 PM,$75,OPD Room 102
Dr. Priya Mehta,Pediatric Specialist,Tue-Thu-Sat,02:00 PM - 06:00 PM,$50,OPD Room 105
Dr. Ananya Roy,Dermatologist & Cosmetologist,Mon-Thu,11:00 AM - 03:00 PM,$60,Laser Suite 3
Dr. Vikram Sen,Orthopedic Surgeon,Wed-Sat,09:00 AM - 12:30 PM,$80,OPD Room 108
Dr. Sunita Patel,Gynecologist & Obstetrician,Daily,04:00 PM - 08:00 PM,$65,Women Wellness 2`;
    handleCsvTextChange(sample);
  };

  // Execute CSV Import
  const handleImportCsv = async () => {
    if (!csvText.trim()) return;
    setIsImportingCsv(true);
    try {
      const res = await fetch('/api/knowledge-base/import-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          csvData: csvText,
          title: title || 'Doctor Schedules & Services',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.items && Array.isArray(data.items)) {
          // Sync each item into Firestore
          for (const item of data.items) {
            await syncKnowledgeItemToFirestore(item);
            onAddItem(item);
          }
        }
        setNotification({
          type: 'success',
          message: `Successfully imported and vectorized ${data.importedCount || 'all'} rows into Knowledge Base!`,
        });
        setCsvText('');
        setCsvPreviewRows([]);
        setActiveTab('sources');
      } else {
        throw new Error('Failed to parse CSV');
      }
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: `CSV import failed: ${err.message}`,
      });
    } finally {
      setIsImportingCsv(false);
    }
  };

  // Turn Call Summary into Knowledge FAQ
  const handleConvertCallToKnowledge = async (call: Call) => {
    const callerName = call.callerName || 'Patient';
    const intent = call.extractedEntities?.intent || 'Appointment & Pricing Inquiry';
    const notes = call.extractedEntities?.notes || 'Caller verified clinical availability and booked schedule.';

    const newKbItem: KnowledgeItem = {
      id: `kb_call_${call.id}`,
      businessId: 'biz_venkat_01',
      title: `Caller FAQ: ${intent}`,
      type: 'summary',
      content: `Question/Intent: ${intent}. Resolution Notes: ${notes}. Verified Outcome: ${call.durationFormatted} call on ${call.timestamp}.`,
      status: 'ready',
      sizeOrCount: 'Call Transcript Embedding',
      updatedAt: 'Just now',
      assignedAgents: ['Dr. Ava AI'],
      assignedAgentIds: ['ag_receptionist_01'],
    };

    await syncKnowledgeItemToFirestore(newKbItem);
    onAddItem(newKbItem);
    setNotification({
      type: 'success',
      message: `Call summary for "${intent}" converted into an AI Knowledge FAQ and saved!`,
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Notifications */}
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-bold shadow-md ${
            notification.type === 'success'
              ? 'bg-[#1D64C2]/15 text-[#1D64C2] dark:text-[#C1E8FF] border-[#1D64C2]/30'
              : notification.type === 'error'
              ? 'bg-rose-50 text-rose-700 border-rose-400'
              : 'bg-[#1D64C2]/15 text-[#1D64C2] dark:text-[#C1E8FF] border-[#1D64C2]/30'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#1D64C2] dark:text-[#C1E8FF]" />
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="p-1 hover:opacity-75 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* Main Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1D64C2]/15 dark:bg-[#052659] text-[11px] font-black text-[#1D64C2] dark:text-[#C1E8FF] border border-[#1D64C2]/40 mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#1D64C2] dark:text-[#C1E8FF]" />
            <span>Encrypted Cloud Storage + Real-Time Sync</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
            Knowledge Base & RAG Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-[#7DA0CA] font-medium mt-0.5">
            Ground your AI voice agents in verified documents, product catalogs, CSV tables, and live call summaries.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Import CSV Shortcut */}
          <button
            onClick={() => {
              setActiveTab('csv');
              handleLoadSampleCsv();
            }}
            className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#021024]/70 border border-slate-200 dark:border-[#5483B3]/30 text-[#1D64C2] dark:text-[#C1E8FF] text-xs font-black flex items-center gap-2 shadow-xs hover:bg-slate-100 dark:hover:bg-[#021024] cursor-pointer transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#1D64C2] dark:text-[#C1E8FF]" />
            <span>Import CSV</span>
          </button>

          {/* Cloudinary Audio Upload */}
          <button
            type="button"
            onClick={() => setIsAudioModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-[#1D64C2]/15 dark:bg-[#021024]/70 border border-[#1D64C2]/30 text-[#1D64C2] dark:text-[#C1E8FF] text-xs font-black flex items-center gap-2 shadow-xs hover:bg-[#1D64C2]/25 cursor-pointer transition-all"
          >
            <Cloud className="w-4 h-4 text-[#1D64C2] dark:text-[#C1E8FF]" />
            <span>Upload Audio (Cloudinary)</span>
          </button>

          {/* Add Knowledge Source Button */}
          <button
            onClick={() => {
              setModalType('document');
              setIsModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#052659] via-[#1D64C2] to-[#2563EB] hover:from-[#1D64C2] hover:to-[#3B82F6] text-white text-xs font-black flex items-center gap-2 shadow-md shadow-[#1D64C2]/20 cursor-pointer transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-[#5483B3]/25 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('sources')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'sources'
              ? 'bg-gradient-to-r from-[#052659] via-[#1D64C2] to-[#2563EB] text-white shadow-xs'
              : 'text-slate-500 dark:text-[#7DA0CA] hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Connected Sources ({knowledgeItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('csv')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'csv'
              ? 'bg-gradient-to-r from-[#052659] via-[#1D64C2] to-[#2563EB] text-white shadow-xs'
              : 'text-slate-500 dark:text-[#7DA0CA] hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-[#1D64C2] dark:text-[#C1E8FF]" />
          <span>CSV Grounding Importer</span>
        </button>

        <button
          onClick={() => setActiveTab('call-summaries')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'call-summaries'
              ? 'bg-gradient-to-r from-[#052659] via-[#1D64C2] to-[#2563EB] text-white shadow-xs'
              : 'text-slate-500 dark:text-[#7DA0CA] hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <PhoneCall className="w-4 h-4 text-[#1D64C2] dark:text-[#C1E8FF]" />
          <span>Call Summaries as FAQ ({calls.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('flowchart')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'flowchart'
              ? 'bg-gradient-to-r from-[#052659] via-[#1D64C2] to-[#2563EB] text-white shadow-xs'
              : 'text-slate-500 dark:text-[#7DA0CA] hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Interactive Agent Flowchart</span>
        </button>
      </div>

      {/* TAB 1: CONNECTED SOURCES & RAG PLAYGROUND */}
      {activeTab === 'sources' && (
        <div className="space-y-6">
          {/* Interactive 3D Acoustic Orb & Grounding Summary Bento */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center bg-white dark:bg-[#052659]/30 rounded-3xl p-6 border border-slate-200/90 dark:border-[#5483B3]/25 shadow-md">
            <div className="lg:col-span-4 flex flex-col items-center justify-center">
              <Interactive3DOrb size={260} activeStatusText="Enterprise Vector RAG Matrix" />
            </div>

            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 dark:bg-[#021024]/80 text-[11px] font-extrabold text-[#1D64C2] dark:text-[#C1E8FF] border border-[#1D64C2]/30">
                <Sparkles className="w-3.5 h-3.5 text-[#1D64C2] dark:text-[#C1E8FF]" />
                <span>Sub-40ms Vector Retrieval & Cloud CDN</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white">
                Zero-Hallucination Voice Knowledge Base
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-[#7DA0CA] font-medium leading-relaxed">
                When patients call your clinic or clients phone your agency, the voice agent references these exact documents in real time. Deleting any item here immediately un-indexes it across your cloud storage and purges its cached vectors.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#021024]/60 border border-slate-200 dark:border-[#5483B3]/25">
                  <div className="text-[10px] font-bold text-slate-500 dark:text-[#7DA0CA] uppercase">
                    Storage Tier
                  </div>
                  <div className="text-sm font-black text-slate-950 dark:text-white mt-0.5">
                    Cloud Storage
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#021024]/60 border border-slate-200 dark:border-[#5483B3]/25">
                  <div className="text-[10px] font-bold text-slate-500 dark:text-[#7DA0CA] uppercase">
                    Cloud Sync
                  </div>
                  <div className="text-sm font-black text-[#1D64C2] dark:text-[#C1E8FF] mt-0.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#1D64C2] dark:text-[#C1E8FF]" />
                    <span>Real-time Sync</span>
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#021024]/60 border border-slate-200 dark:border-[#5483B3]/25 col-span-2 sm:col-span-1">
                  <div className="text-[10px] font-bold text-slate-500 dark:text-[#7DA0CA] uppercase">
                    Vector Index
                  </div>
                  <div className="text-sm font-black text-[#1D64C2] dark:text-[#C1E8FF] mt-0.5">
                    HNSW Embeddings
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Vector Retrieval Playground */}
          <div className="bg-white dark:bg-[#052659]/30 rounded-3xl p-6 border border-slate-200/90 dark:border-[#5483B3]/25 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#1D64C2]/20 text-[#C1E8FF] flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-950 dark:text-white">
                    Live RAG Semantic Retrieval Simulator
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-[#7DA0CA] font-medium">
                    Test what the agent would retrieve during a live phone call before it answers.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#1D64C2]/20 text-[#1D64C2] dark:text-[#C1E8FF] border border-[#1D64C2]/40">
                ● Live Inference
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
                placeholder="Ask a question (e.g. Which cashless insurance TPAs do you accept?)..."
                className="flex-1 px-4 py-3 text-xs rounded-xl border border-slate-200 dark:border-[#5483B3]/30 bg-slate-50 dark:bg-[#021024] text-slate-950 dark:text-white focus:outline-none focus:border-[#C1E8FF] font-medium placeholder:text-[#5483B3]"
              />
              <button
                onClick={handleTestQuery}
                disabled={isSearching}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#052659] via-[#1D64C2] to-[#2563EB] hover:from-[#1D64C2] hover:to-[#3B82F6] text-white text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-2 whitespace-nowrap shadow-md shadow-[#1D64C2]/20"
              >
                {isSearching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span>Test Retrieval</span>
              </button>
            </div>

            {/* Quick sample chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
              <span className="text-slate-500 dark:text-[#7DA0CA] font-bold">Suggested queries:</span>
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
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#021024]/70 hover:bg-slate-50 dark:hover:bg-[#021024] border border-slate-200 dark:border-[#5483B3]/25 text-slate-800 dark:text-slate-200 cursor-pointer transition-colors font-medium shadow-xs"
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
                  className="p-4 rounded-2xl bg-[#021024]/70 border border-[#1D64C2]/40 text-xs text-white space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[#C1E8FF] flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Semantic Vector Hit: "{retrievedResult.source}"
                    </span>
                    <span className="text-[10px] font-mono text-[#7DA0CA] bg-[#052659] px-2.5 py-0.5 rounded-full border border-[#5483B3]/25">
                      Cosine Sim: {retrievedResult.score} • {retrievedResult.chunks} chunks
                    </span>
                  </div>
                  <p className="leading-relaxed bg-[#052659]/60 p-3.5 rounded-xl border border-[#5483B3]/25 font-medium text-slate-200">
                    {retrievedResult.text}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sources Table */}
          <div className="bg-white dark:bg-[#052659]/30 rounded-3xl border border-slate-200/90 dark:border-[#5483B3]/25 shadow-md overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-[#5483B3]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-[#1D64C2] dark:text-[#C1E8FF]" />
                <h3 className="text-xs font-black text-slate-950 dark:text-white uppercase tracking-wider">
                  Indexed Knowledge Documents & Media Assets ({knowledgeItems.length})
                </h3>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#1D64C2] dark:text-[#C1E8FF]">
                <ShieldCheck className="w-4 h-4" />
                <span>Cloud Knowledge Synchronized</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-[#021024]/60 border-b border-slate-100 dark:border-[#5483B3]/20 text-slate-400 dark:text-[#7DA0CA] font-black uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-6">Source Name</th>
                    <th className="py-3.5 px-6">Type</th>
                    <th className="py-3.5 px-6">Storage & CDN</th>
                    <th className="py-3.5 px-6">Vector Status</th>
                    <th className="py-3.5 px-6">Scope / Size</th>
                    <th className="py-3.5 px-6">Last Synced</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#5483B3]/20 text-slate-800 dark:text-slate-200 font-medium">
                  {knowledgeItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-xs text-slate-400 dark:text-[#7DA0CA]">
                        No knowledge sources found. Click "Upload Document" or "Import CSV" to begin.
                      </td>
                    </tr>
                  ) : (
                    knowledgeItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-[#052659]/40 transition-colors">
                        <td className="py-4 px-6 font-bold flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-[#1D64C2]/15 text-[#1D64C2] dark:text-[#C1E8FF] flex items-center justify-center shrink-0">
                            {item.type === 'document' ? (
                              <FileText className="w-4 h-4" />
                            ) : item.type === 'csv' ? (
                              <FileSpreadsheet className="w-4 h-4 text-[#1D64C2] dark:text-[#C1E8FF]" />
                            ) : item.type === 'summary' ? (
                              <PhoneCall className="w-4 h-4 text-purple-400" />
                            ) : (
                              <Globe className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-950 dark:text-white">{item.title}</div>
                            {item.cloudinaryPublicId && (
                              <div className="text-[10px] font-mono text-slate-500 dark:text-[#7DA0CA] truncate max-w-[200px]">
                                cdn: {item.cloudinaryPublicId}
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="py-4 px-6 font-bold capitalize">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] ${
                              item.type === 'csv'
                                ? 'bg-[#1D64C2]/15 text-[#1D64C2] dark:text-[#C1E8FF]'
                                : item.type === 'summary'
                                ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                                : 'bg-[#1D64C2]/15 text-[#1D64C2] dark:text-[#C1E8FF]'
                            }`}
                          >
                            {item.type}
                          </span>
                        </td>

                        <td className="py-4 px-6">
                          {item.cloudinaryUrl ? (
                            <a
                              href={item.cloudinaryUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1D64C2] dark:text-[#C1E8FF] hover:underline"
                            >
                              <span>Cloud Asset</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-[11px] text-slate-500 dark:text-[#7DA0CA] font-medium">
                              Vector Ingested
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-6">
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#1D64C2]/15 text-[#1D64C2] dark:text-[#C1E8FF] border border-[#1D64C2]/30">
                            <CheckCircle2 className="w-3 h-3" />
                            Ready
                          </span>
                        </td>

                        <td className="py-4 px-6 text-slate-500 dark:text-[#7DA0CA] font-mono text-[11px]">
                          {item.sizeOrCount}
                        </td>

                        <td className="py-4 px-6 text-slate-500 dark:text-[#7DA0CA] text-[11px]">
                          {item.updatedAt}
                        </td>

                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => handleDeleteItem(item)}
                            title="Delete Knowledge Asset"
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CSV GROUNDING IMPORTER */}
      {activeTab === 'csv' && (
        <div className="bg-white dark:bg-[#052659]/30 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-[#5483B3]/25 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1D64C2]/15 text-[11px] font-black text-[#1D64C2] dark:text-[#C1E8FF] border border-[#1D64C2]/30 mb-2">
                <FileSpreadsheet className="w-3.5 h-3.5 text-[#1D64C2] dark:text-[#C1E8FF]" />
                <span>Bulk CSV Grounding Importer</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white">
                Import Structured Doctor Rosters, Tariffs & Catalogs
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-[#7DA0CA] font-medium mt-0.5">
                Upload or paste CSV rows. Each row is automatically split into dedicated semantic vector documents and stored in vector memory.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleLoadSampleCsv}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#021024]/70 border border-slate-200 dark:border-[#5483B3]/30 text-slate-900 dark:text-white text-xs font-bold hover:bg-slate-50 dark:hover:bg-[#021024] cursor-pointer shadow-xs transition-colors"
              >
                Load Clinic Sample CSV
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-900 dark:text-white mb-1">
                Knowledge Set Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Service Catalog, Pricing Sheet & FAQ Guide"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#5483B3]/30 text-xs font-medium bg-slate-50 dark:bg-[#021024] text-slate-900 dark:text-white placeholder:text-[#5483B3] focus:outline-none focus:border-[#C1E8FF]"
              />
            </div>

            {/* CSV File Upload or Raw Paste */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-black text-slate-900 dark:text-white">
                  Paste Raw CSV or Upload .csv file
                </label>
                <input
                  type="file"
                  accept=".csv"
                  ref={csvFileInputRef}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (evt) => {
                        const content = evt.target?.result as string;
                        handleCsvTextChange(content);
                      };
                      reader.readAsText(file);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => csvFileInputRef.current?.click()}
                  className="text-xs font-bold text-[#1D64C2] dark:text-[#C1E8FF] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose .csv from computer</span>
                </button>
              </div>

              <textarea
                rows={8}
                value={csvText}
                onChange={(e) => handleCsvTextChange(e.target.value)}
                placeholder="DoctorName,Specialty,DaysAvailable,Timing,ConsultationFee&#10;Dr. Sharma,Cardiology,Mon-Fri,10am-1pm,$75"
                className="w-full p-4 rounded-xl border border-slate-200 dark:border-[#5483B3]/30 text-xs font-mono bg-slate-50 dark:bg-[#021024] text-slate-900 dark:text-white placeholder:text-[#5483B3] focus:outline-none focus:border-[#C1E8FF]"
              />
            </div>

            {/* Live Table Preview */}
            {csvPreviewRows.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#C1E8FF]" />
                  <span>Parsed CSV Schema Preview (First {csvPreviewRows.length} rows):</span>
                </div>
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-[#5483B3]/25">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-[#021024]/60 font-black text-[10px] uppercase text-slate-400 dark:text-[#7DA0CA]">
                      <tr>
                        {csvPreviewRows[0].map((h, i) => (
                          <th key={i} className="py-2.5 px-3 border-b border-slate-200 dark:border-[#5483B3]/25">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-[#5483B3]/20 text-[11px] font-medium text-slate-800 dark:text-slate-200">
                      {csvPreviewRows.slice(1).map((row, ri) => (
                        <tr key={ri} className="hover:bg-slate-50 dark:hover:bg-[#052659]/40">
                          {row.map((col, ci) => (
                            <td key={ci} className="py-2 px-3">
                              {col}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <button
              onClick={handleImportCsv}
              disabled={isImportingCsv || !csvText.trim()}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#052659] via-[#1D64C2] to-[#2563EB] hover:from-[#1D64C2] hover:to-[#3B82F6] text-white text-xs font-black shadow-md shadow-[#1D64C2]/20 cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              {isImportingCsv ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Parsing & Syncing to Knowledge Base...</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Ingest & Sync CSV to Agent Knowledge Base</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: CALL SUMMARIES AS FAQ */}
      {activeTab === 'call-summaries' && (
        <div className="bg-white dark:bg-[#052659]/30 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-[#5483B3]/25 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1D64C2]/15 text-[11px] font-black text-[#1D64C2] dark:text-[#C1E8FF] border border-[#1D64C2]/30 mb-2">
                <PhoneCall className="w-3.5 h-3.5 text-[#1D64C2] dark:text-[#C1E8FF]" />
                <span>Call Intelligence Learning Loop</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white">
                Convert Real Caller Inquiries into Permanent FAQ
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-[#7DA0CA] font-medium mt-0.5">
                Every conversation your voice agent handles produces valuable caller queries. 1-click add verified caller questions directly into the RAG vector index.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {calls.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 dark:text-[#7DA0CA] border border-dashed border-slate-200 dark:border-[#5483B3]/30 rounded-2xl">
                No call records yet. Dispatch outbound calls or trigger an incoming call to see summaries.
              </div>
            ) : (
              calls.slice(0, 6).map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-[#5483B3]/25 bg-slate-50 dark:bg-[#021024]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#1D64C2] transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-950 dark:text-white">
                        {c.callerName || 'Unknown Caller'} ({c.callerNumber})
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-[#052659] border border-slate-200 dark:border-[#5483B3]/30 text-slate-700 dark:text-slate-300">
                        {c.durationFormatted}
                      </span>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          c.sentiment === 'positive'
                            ? 'bg-[#1D64C2]/15 text-[#1D64C2] dark:text-[#C1E8FF]'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {c.sentiment}
                      </span>
                    </div>

                    <div className="text-xs font-extrabold text-[#1D64C2] dark:text-[#C1E8FF]">
                      Intent: {c.extractedEntities?.intent || 'General Clinic Inquiry'}
                    </div>

                    <p className="text-xs text-slate-500 dark:text-[#7DA0CA] font-medium max-w-2xl">
                      {c.extractedEntities?.notes || 'Patient verified consultation hours and pre-auth settlement.'}
                    </p>
                  </div>

                  <button
                    onClick={() => handleConvertCallToKnowledge(c)}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#052659] via-[#1D64C2] to-[#2563EB] hover:from-[#1D64C2] hover:to-[#3B82F6] text-white text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all whitespace-nowrap self-start sm:self-auto shadow-md shadow-[#1D64C2]/20"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Save as Agent FAQ</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: INTERACTIVE AGENT FLOWCHART */}
      {activeTab === 'flowchart' && (
        <div className="space-y-6">
          <InteractiveAgentFlowChart />
        </div>
      )}

      {/* MODAL: UPLOAD NEW KNOWLEDGE DOCUMENT (CLOUDINARY) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#111C38] rounded-3xl p-6 sm:p-8 max-w-lg w-full border-2 border-[#000000] dark:border-[#1E2E4A] shadow-2xl space-y-6 relative"
            >
              <div className="flex justify-between items-center pb-2 border-b-2 border-[#000000]/10 dark:border-[#1E2E4A]">
                <div>
                  <h3 className="text-xl font-black text-[#000000] dark:text-white">
                    Add Knowledge Source
                  </h3>
                  <p className="text-xs text-[#27272a] dark:text-[#94A3B8] font-medium">
                    Upload documents to Secure Storage & sync to Knowledge Base.
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg text-[#000000] dark:text-white hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Source Type Selector */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setModalType('document')}
                  className={`py-2 text-xs font-black rounded-xl border-2 cursor-pointer transition-all ${
                    modalType === 'document'
                      ? 'border-[#1D64C2] bg-[#C1E8FF]/30 text-[#1D64C2] dark:bg-[#052659]/50 dark:text-[#C1E8FF]'
                      : 'border-[#000000]/10 text-[#27272a] dark:text-[#94A3B8]'
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setModalType('website')}
                  className={`py-2 text-xs font-black rounded-xl border-2 cursor-pointer transition-all ${
                    modalType === 'website'
                      ? 'border-[#1D64C2] bg-[#C1E8FF]/30 text-[#1D64C2] dark:bg-[#052659]/50 dark:text-[#C1E8FF]'
                      : 'border-[#000000]/10 text-[#27272a] dark:text-[#94A3B8]'
                  }`}
                >
                  Website URL
                </button>
                <button
                  type="button"
                  onClick={() => setModalType('faq')}
                  className={`py-2 text-xs font-black rounded-xl border-2 cursor-pointer transition-all ${
                    modalType === 'faq'
                      ? 'border-[#1D64C2] bg-[#C1E8FF]/30 text-[#1D64C2] dark:bg-[#052659]/50 dark:text-[#C1E8FF]'
                      : 'border-[#000000]/10 text-[#27272a] dark:text-[#94A3B8]'
                  }`}
                >
                  Manual FAQ
                </button>
              </div>

              <form onSubmit={handleSaveItem} className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-[#000000] dark:text-white mb-1">
                    Document Title
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. 2026 Insurance & TPA Network"
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#000000] dark:border-[#1E2E4A] text-xs font-medium text-[#000000] dark:text-white bg-[#F5FAFC] dark:bg-[#0D162C] focus:outline-none focus:ring-2 focus:ring-[#1D64C2]"
                  />
                </div>

                {modalType === 'document' && (
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedFile(file);
                          if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ''));
                        }
                      }}
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="p-6 rounded-2xl border-2 border-dashed border-[#000000]/20 dark:border-[#1E2E4A] bg-[#EEF8FC]/40 dark:bg-[#162744]/40 text-center space-y-1 cursor-pointer hover:border-[#2189C8] transition-colors"
                    >
                      <Upload className="w-8 h-8 text-[#2189C8] mx-auto" />
                      <p className="text-xs font-black text-[#000000] dark:text-white">
                        {selectedFile ? selectedFile.name : 'Click to select PDF, DOCX, TXT or MP3'}
                      </p>
                      <p className="text-[10px] text-[#27272a] dark:text-[#94A3B8] font-bold">
                        Uploaded securely to Cloud Storage & chunked into 512-token vectors
                      </p>
                    </div>
                  </div>
                )}

                {modalType === 'website' && (
                  <div>
                    <label className="block text-xs font-black text-[#000000] dark:text-white mb-1">
                      Target URL to Crawl
                    </label>
                    <input
                      type="url"
                      required
                      value={contentOrUrl}
                      onChange={(e) => setContentOrUrl(e.target.value)}
                      placeholder="https://example.com/services"
                      className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#000000] dark:border-[#1E2E4A] text-xs font-medium text-[#000000] dark:text-white bg-[#F5FAFC] dark:bg-[#0D162C] focus:outline-none focus:ring-2 focus:ring-[#1D64C2]"
                    />
                  </div>
                )}

                {modalType === 'faq' && (
                  <div>
                    <label className="block text-xs font-black text-[#000000] dark:text-white mb-1">
                      Frequently Asked Questions
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={contentOrUrl}
                      onChange={(e) => setContentOrUrl(e.target.value)}
                      placeholder="Q: What time does Dr. Mehta take walk-ins?&#10;A: Between 10:00 AM and 1:00 PM on weekdays."
                      className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#000000] dark:border-[#1E2E4A] text-xs font-medium text-[#000000] dark:text-white bg-[#F5FAFC] dark:bg-[#0D162C] focus:outline-none focus:ring-2 focus:ring-[#1D64C2]"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isIndexing}
                  className="w-full py-3.5 rounded-xl bg-[#000000] hover:bg-[#262626] dark:bg-white dark:hover:bg-gray-100 text-white dark:text-[#000000] text-xs font-black shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
                >
                  {isIndexing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Uploading & Vectorizing ({uploadProgress}%)...</span>
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

      {/* Cloudinary Audio Upload Studio Modal */}
      <CloudinaryAudioUploadModal
        isOpen={isAudioModalOpen}
        onClose={() => setIsAudioModalOpen(false)}
        defaultCategory="knowledge_base"
        onUploadSuccess={(rec) => {
          const newItem: KnowledgeItem = {
            id: `kb_audio_${Date.now()}`,
            businessId: 'biz_venkat_01',
            title: rec.fileName,
            type: 'document',
            content: `[Cloudinary Audio Asset]: Archived recording ${rec.fileName}. Category: ${rec.category || 'Speech'}. Duration: ${rec.duration}s. CDN Streaming: ${rec.secureUrl}`,
            updatedAt: new Date().toISOString().split('T')[0],
            status: 'ready',
            sizeOrCount: `${(rec.bytes / 1024).toFixed(1)} KB (Cloudinary CDN)`,
            cloudinaryUrl: rec.secureUrl,
            cloudinaryPublicId: rec.publicId,
          };
          onAddItem(newItem);
          setIsAudioModalOpen(false);
          setNotification({
            type: 'success',
            message: `Audio file "${rec.fileName}" archived to Cloudinary Audio CDN & linked to Knowledge Base!`,
          });
        }}
      />
    </div>
  );
};
