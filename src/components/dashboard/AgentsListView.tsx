import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Agent } from '../../types';
import {
  Bot,
  Plus,
  Play,
  Pause,
  Edit2,
  Trash2,
  Copy,
  CheckCircle2,
  Clock,
  Sparkles,
  PhoneCall,
  Phone,
  Sliders,
  ArrowRight,
  Radio,
} from 'lucide-react';

interface AgentsListViewProps {
  agents: Agent[];
  onOpenCreateAgent: () => void;
  onOpenWebVoiceWithAgent: (agentId: string) => void;
  onToggleAgentStatus: (agentId: string) => void;
  onDeleteAgent: (agentId: string) => void;
  onOpenDirectCallWithAgent?: (agentId: string) => void;
}

export const AgentsListView: React.FC<AgentsListViewProps> = ({
  agents,
  onOpenCreateAgent,
  onOpenWebVoiceWithAgent,
  onToggleAgentStatus,
  onDeleteAgent,
  onOpenDirectCallWithAgent,
}) => {
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  const handleTestVoice = (agent: Agent) => {
    if ('speechSynthesis' in window) {
      if (playingVoiceId === agent.id) {
        window.speechSynthesis.cancel();
        setPlayingVoiceId(null);
      } else {
        window.speechSynthesis.cancel();
        const greeting = agent.instructions?.greeting || `Hello, this is ${agent.name}. How can I help you today?`;
        const utterance = new SpeechSynthesisUtterance(greeting);
        utterance.rate = agent.speed || 1.0;
        utterance.pitch = agent.pitch || 1.0;
        utterance.onend = () => setPlayingVoiceId(null);
        utterance.onerror = () => setPlayingVoiceId(null);
        setPlayingVoiceId(agent.id);
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title Header with interactive create button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight">AI Voice Assistants</h1>
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#1D64C2]/15 dark:bg-[#052659] text-[#1D64C2] dark:text-[#C1E8FF] border border-[#1D64C2]/40">
              {agents.length} Deployed
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-[#7DA0CA] mt-0.5">
            Manage your Cartesia Sonic and Sarvam AI conversational agents for inbound reception and outbound campaigns.
          </p>
        </div>

        <motion.button
          onClick={onOpenCreateAgent}
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          className="group px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#052659] via-[#1D64C2] to-[#2563EB] hover:from-[#1D64C2] hover:to-[#3B82F6] text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-[#1D64C2]/20 cursor-pointer transition-all active:scale-95 animate-shimmer"
        >
          <Plus className="w-4 h-4 transition-transform group-hover:rotate-90 duration-200" />
          <span>Create New Agent</span>
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
            className="bg-white dark:bg-[#052659]/30 rounded-3xl p-6 border border-slate-200/90 dark:border-[#5483B3]/25 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#1D64C2]/60 dark:hover:border-[#1D64C2]/50 transition-colors"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-[#021024] text-[#C1E8FF] flex items-center justify-center font-bold border border-slate-200 dark:border-[#5483B3]/30 shadow-2xs">
                    <Bot className="w-5 h-5 text-[#1D64C2] dark:text-[#C1E8FF]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-950 dark:text-white leading-snug">{agent.name}</h3>
                    <p className="text-[11px] text-[#1D64C2] dark:text-[#C1E8FF] font-semibold">{agent.industry}</p>
                  </div>
                </div>

                <button
                  onClick={() => onToggleAgentStatus(agent.id)}
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full cursor-pointer transition-colors ${
                    agent.status === 'active'
                      ? 'bg-[#1D64C2]/15 text-[#1D64C2] dark:bg-[#1D64C2]/25 dark:text-[#C1E8FF] border border-[#1D64C2]/30 dark:border-[#1D64C2]/40'
                      : 'bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                  }`}
                >
                  {agent.status === 'active' ? 'Active' : 'Paused'}
                </button>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-500 dark:text-[#7DA0CA] mt-3 line-clamp-2 leading-relaxed">
                {agent.description}
              </p>

              {/* Specs Pill Matrix */}
              <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-slate-100 dark:border-[#5483B3]/20 text-[11px]">
                <span className="px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-[#021024]/60 border border-slate-200/80 dark:border-[#5483B3]/25 text-slate-700 dark:text-[#7DA0CA]">
                  Voice: <span className="font-semibold text-[#1D64C2] dark:text-[#C1E8FF]">{agent.voiceName}</span>
                </span>
                <span className="px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-[#021024]/60 border border-slate-200/80 dark:border-[#5483B3]/25 text-slate-700 dark:text-slate-300">
                  Lang: <span className="font-semibold">{agent.language}</span>
                </span>
                <span className="px-2.5 py-1 rounded-xl bg-[#1D64C2]/10 dark:bg-[#021024]/80 text-[#1D64C2] dark:text-[#C1E8FF] font-bold font-mono border border-[#1D64C2]/20 dark:border-[#1D64C2]/30">
                  {agent.callsCount} calls handled
                </span>
              </div>
            </div>

            {/* Card Action Controls */}
            <div className="pt-3 border-t border-slate-100 dark:border-[#5483B3]/20 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleTestVoice(agent)}
                  className="px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-[#021024]/70 hover:bg-slate-200 dark:hover:bg-[#021024] text-slate-800 dark:text-slate-200 border border-transparent dark:border-[#5483B3]/20 flex items-center gap-1.5 cursor-pointer transition-colors"
                  title="Audition voice synthesis"
                >
                  {playingVoiceId === agent.id ? <Pause className="w-3.5 h-3.5 text-rose-500" /> : <Play className="w-3.5 h-3.5 text-[#1D64C2] dark:text-[#C1E8FF] fill-current" />}
                  <span className="hidden sm:inline">{playingVoiceId === agent.id ? 'Stop' : 'Audition'}</span>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onOpenWebVoiceWithAgent(agent.id)}
                  className="px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-[#1D64C2]/15 dark:bg-[#1D64C2]/25 hover:bg-[#1D64C2]/25 dark:hover:bg-[#1D64C2]/40 text-[#1D64C2] dark:text-[#C1E8FF] border border-[#1D64C2]/30 flex items-center gap-1.5 cursor-pointer transition-colors"
                  title="Simulate interactive live voice call"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Live Test</span>
                </motion.button>

                {onOpenDirectCallWithAgent && (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onOpenDirectCallWithAgent(agent.id)}
                    className="px-3 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-[#052659] via-[#1D64C2] to-[#2563EB] hover:from-[#1D64C2] hover:to-[#3B82F6] text-white flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#1D64C2]/20 transition-all"
                    title="Call external physical number via carrier trunk"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Direct Call</span>
                  </motion.button>
                )}

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={onOpenCreateAgent}
                  className="px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-[#021024]/70 hover:bg-slate-200 dark:hover:bg-[#021024] text-slate-700 dark:text-[#7DA0CA] border border-transparent dark:border-[#5483B3]/20 flex items-center gap-1.5 cursor-pointer transition-colors"
                  title="Configure or clone this agent architecture"
                >
                  <Sliders className="w-3.5 h-3.5 text-[#5483B3]" />
                  <span className="hidden lg:inline">Configure</span>
                </motion.button>
              </div>

              <div className="flex items-center gap-1 text-slate-400">
                <button
                  onClick={() => onDeleteAgent(agent.id)}
                  className="p-2 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
                  title="Delete agent"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
