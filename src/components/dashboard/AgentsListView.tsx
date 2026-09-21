import React, { useState } from 'react';
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
  Sliders,
} from 'lucide-react';

interface AgentsListViewProps {
  agents: Agent[];
  onOpenCreateAgent: () => void;
  onOpenWebVoiceWithAgent: (agentId: string) => void;
  onToggleAgentStatus: (agentId: string) => void;
  onDeleteAgent: (agentId: string) => void;
}

export const AgentsListView: React.FC<AgentsListViewProps> = ({
  agents,
  onOpenCreateAgent,
  onOpenWebVoiceWithAgent,
  onToggleAgentStatus,
  onDeleteAgent,
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
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#123047] tracking-tight">AI Voice Agents</h1>
          <p className="text-xs text-[#52636D] mt-0.5">
            Configure custom prompts, knowledge bases, and voice personas for each business function.
          </p>
        </div>

        <button
          onClick={onOpenCreateAgent}
          className="px-4 py-2.5 rounded-xl bg-[#38A85B] hover:bg-[#2f8f4d] text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create New Agent
        </button>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="bg-white rounded-2xl p-6 border border-[#DDEBEF] shadow-xs flex flex-col justify-between space-y-4 hover:border-[#2189C8] transition-all"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#123047] text-white flex items-center justify-center font-bold">
                    <Bot className="w-5 h-5 text-[#55B9E8]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#123047]">{agent.name}</h3>
                    <p className="text-[11px] text-[#2189C8] font-medium">{agent.industry}</p>
                  </div>
                </div>

                <button
                  onClick={() => onToggleAgentStatus(agent.id)}
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full cursor-pointer transition-colors ${
                    agent.status === 'active'
                      ? 'bg-[#EFFAF1] text-[#38A85B] border border-[#65C978]/30'
                      : 'bg-[#FFF6EE] text-[#F38A3E] border border-[#F38A3E]/30'
                  }`}
                >
                  {agent.status === 'active' ? 'Active' : 'Paused'}
                </button>
              </div>

              {/* Description */}
              <p className="text-xs text-[#52636D] mt-3 line-clamp-2">
                {agent.description}
              </p>

              {/* Specs Pill Matrix */}
              <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-[#DDEBEF] text-[11px]">
                <span className="px-2 py-1 rounded-lg bg-[#F5FAFC] border border-[#DDEBEF] text-[#123047]">
                  Voice: <span className="font-semibold text-[#2189C8]">{agent.voiceName}</span>
                </span>
                <span className="px-2 py-1 rounded-lg bg-[#F5FAFC] border border-[#DDEBEF] text-[#123047]">
                  Lang: <span className="font-semibold">{agent.language}</span>
                </span>
                <span className="px-2 py-1 rounded-lg bg-[#EFFAF1] text-[#38A85B] font-semibold">
                  {agent.callsCount} calls handled
                </span>
              </div>
            </div>

            {/* Card Action Controls */}
            <div className="pt-3 border-t border-[#DDEBEF] flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleTestVoice(agent)}
                  className="p-2 text-xs font-semibold rounded-lg bg-[#EEF8FC] text-[#2189C8] hover:bg-[#DDEBEF] flex items-center gap-1 cursor-pointer"
                  title="Audition voice"
                >
                  {playingVoiceId === agent.id ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">Audition</span>
                </button>

                <button
                  onClick={() => onOpenWebVoiceWithAgent(agent.id)}
                  className="p-2 text-xs font-semibold rounded-lg bg-[#EFFAF1] text-[#38A85B] hover:bg-[#def5e3] flex items-center gap-1 cursor-pointer"
                  title="Simulate call"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Live Test</span>
                </button>
              </div>

              <div className="flex items-center gap-1 text-[#82919A]">
                <button
                  onClick={() => onDeleteAgent(agent.id)}
                  className="p-2 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Delete agent"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
