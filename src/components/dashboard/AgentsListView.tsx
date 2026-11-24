import React from 'react';
import { motion } from 'motion/react';
import { Agent } from '../../types';
import {
  Bot,
  Plus,
  Trash2,
  Phone,
  Sliders,
  ArrowRight,
  Zap,
  Activity,
  Layers,
} from 'lucide-react';

interface AgentsListViewProps {
  agents: Agent[];
  onOpenCreateAgent: () => void;
  onOpenWebVoiceWithAgent?: (agentId: string) => void;
  onToggleAgentStatus: (agentId: string) => void;
  onDeleteAgent: (agentId: string) => void;
  onOpenDirectCallWithAgent?: (agentId: string) => void;
}

export const AgentsListView: React.FC<AgentsListViewProps> = ({
  agents,
  onOpenCreateAgent,
  onToggleAgentStatus,
  onDeleteAgent,
  onOpenDirectCallWithAgent,
}) => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Title Header with interactive create button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-white tracking-tight">AI Voice Telephony Assistants</h1>
            <span className="text-[10px] font-mono font-bold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              {agents.length} Provisioned Trunks
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Multi-lingual conversational AI agents running on Plivo bidirectional media streaming, Sarvam Indic STT, and Gemini real-time reasoning.
          </p>
        </div>

        <motion.button
          onClick={onOpenCreateAgent}
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          className="group px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(99,102,241,0.35)] cursor-pointer transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 transition-transform group-hover:rotate-90 duration-200" />
          <span>Deploy Voice Agent</span>
          <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
        </motion.button>
      </div>

      {/* Agents Grid with Staggered Entrance and Smooth Hover */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent, idx) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: idx * 0.06, ease: 'easeOut' }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-[#111827]/90 rounded-3xl p-6 border border-slate-800/80 shadow-xl flex flex-col justify-between space-y-5 hover:border-indigo-500/40 backdrop-blur-xl transition-all"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white leading-snug">{agent.name}</h3>
                    <p className="text-[11px] text-indigo-400 font-mono font-semibold">{agent.industry}</p>
                  </div>
                </div>

                <button
                  onClick={() => onToggleAgentStatus(agent.id)}
                  className={`text-[10px] font-mono font-bold px-3 py-1 rounded-full cursor-pointer transition-all uppercase tracking-wider ${
                    agent.status === 'active'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                      : 'bg-amber-500/15 text-amber-400 border border-amber-500/40'
                  }`}
                >
                  {agent.status === 'active' ? 'Active' : 'Paused'}
                </button>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-400 mt-3 line-clamp-2 leading-relaxed">
                {agent.description}
              </p>

              {/* Specs Pill Matrix */}
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-800/80 text-[11px]">
                <span className="px-3 py-1 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-300">
                  Voice Model: <span className="font-semibold text-indigo-400">{agent.voiceName}</span>
                </span>
                <span className="px-3 py-1 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-300">
                  Dialect: <span className="font-semibold text-white">{agent.language}</span>
                </span>
                <span className="px-3 py-1 rounded-xl bg-indigo-500/10 text-indigo-300 font-bold font-mono border border-indigo-500/30">
                  {agent.callsCount} Live Calls Handled
                </span>
              </div>
            </div>

            {/* Card Action Controls */}
            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {onOpenDirectCallWithAgent && (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onOpenDirectCallWithAgent(agent.id)}
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all"
                    title="Place real telephone call via Plivo carrier trunk"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Place Call</span>
                  </motion.button>
                )}

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={onOpenCreateAgent}
                  className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 flex items-center gap-1.5 cursor-pointer transition-colors"
                  title="Configure agent prompt & knowledge base"
                >
                  <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Configure</span>
                </motion.button>
              </div>

              <div className="flex items-center gap-1 text-slate-500">
                <button
                  onClick={() => onDeleteAgent(agent.id)}
                  className="p-2 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                  title="Delete agent"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
