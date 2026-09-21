import React, { useState } from 'react';
import { Agent, KnowledgeItem } from '../../types';
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Play,
  Pause,
  Sparkles,
  CheckCircle2,
  Calendar,
  PhoneForwarded,
  MessageSquare,
  Sliders,
  Database,
  Volume2,
  RefreshCw,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CreateAgentBuilderProps {
  onBack: () => void;
  onSaveAgent: (newAgent: Agent) => void;
  availableKnowledge: KnowledgeItem[];
}

export const CreateAgentBuilder: React.FC<CreateAgentBuilderProps> = ({
  onBack,
  onSaveAgent,
  availableKnowledge,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);

  // Form State matching screenshot
  const [agentName, setAgentName] = useState('');
  const [industry, setIndustry] = useState('Healthcare');
  const [template, setTemplate] = useState<'receptionist' | 'sales' | 'support' | 'custom'>('receptionist');
  const [description, setDescription] = useState('');

  // Voice & Audio
  const [voiceName, setVoiceName] = useState('Ava (Natural)');
  const [language, setLanguage] = useState('English (US)');
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [responseSpeed, setResponseSpeed] = useState('Normal');

  // Instructions
  const [role, setRole] = useState('Head Front-Desk Receptionist');
  const [personality, setPersonality] = useState('Warm, empathetic, professional, calm, and articulate.');
  const [objectives, setObjectives] = useState('Answer caller questions regarding clinic hours, address, services, and book doctor consultations.');
  const [rules, setRules] = useState('Never diagnose severe symptoms. Advise urgent care if caller reports chest pains. Keep answers concise under 2 sentences.');
  const [greeting, setGreeting] = useState('Hello! Thank you for calling Apollo Clinics. My name is Ava. How may I help you today?');
  const [fallback, setFallback] = useState('I want to make sure you get exact information. Let me connect you directly to our clinical coordinator.');
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);

  const handleAIGeneratePrompt = async () => {
    setIsGeneratingPrompt(true);
    try {
      const res = await fetch('/api/voice/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: 'Apollo Healthcare Studio',
          industry,
          agentType: template,
          userNotes: description || agentName || `${role} for ${industry}`,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.role) setRole(data.role);
        if (data.personality) setPersonality(data.personality);
        if (data.objectives) setObjectives(data.objectives);
        if (data.rules) setRules(data.rules);
        if (data.greeting) setGreeting(data.greeting);
        if (data.fallback) setFallback(data.fallback);
      }
    } catch (err) {
      console.warn('AI Prompt generator error', err);
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  // Knowledge & Tools
  const [selectedKbs, setSelectedKbs] = useState<string[]>(['kb_clinic_hours', 'kb_doctor_profiles']);
  const [calendarBooking, setCalendarBooking] = useState(true);
  const [crmSync, setCrmSync] = useState(true);
  const [callTransfer, setCallTransfer] = useState(true);
  const [transferNumber, setTransferNumber] = useState('+91 80 4719 3205');
  const [smsFollowup, setSmsFollowup] = useState(true);

  // Audio Playback simulation using Web Speech API
  const handlePlayVoicePreview = () => {
    if ('speechSynthesis' in window) {
      if (isPlayingVoice) {
        window.speechSynthesis.cancel();
        setIsPlayingVoice(false);
      } else {
        window.speechSynthesis.cancel();
        const sampleText = `${greeting} I speak naturally with sub-350 millisecond latency.`;
        const utterance = new SpeechSynthesisUtterance(sampleText);
        utterance.rate = speed;
        utterance.pitch = pitch;

        const voices = window.speechSynthesis.getVoices();
        const foundVoice = voices.find((v) =>
          v.lang.startsWith('en') && (
            voiceName.includes('Liam') ? v.name.includes('Male') || v.name.includes('David') :
            voiceName.includes('Ava') ? v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Google') :
            true
          )
        );
        if (foundVoice) utterance.voice = foundVoice;

        utterance.onend = () => setIsPlayingVoice(false);
        utterance.onerror = () => setIsPlayingVoice(false);
        setIsPlayingVoice(true);
        window.speechSynthesis.speak(utterance);
      }
    } else {
      setIsPlayingVoice(!isPlayingVoice);
    }
  };

  const handleTemplateSelect = (tmpl: 'receptionist' | 'sales' | 'support' | 'custom') => {
    setTemplate(tmpl);
    if (tmpl === 'receptionist') {
      setAgentName('Dental Receptionist');
      setDescription('Answers phone calls, greets patients warmly, and schedules chair bookings.');
      setRole('Front-Desk Practice Receptionist');
      setGreeting('Thank you for calling our dental studio! My name is Ava. How may I help you today?');
    } else if (tmpl === 'sales') {
      setAgentName('Inbound Sales Representative');
      setDescription('Qualifies prospective corporate buyers and books high-value consultations.');
      setRole('Senior Sales Consultant');
      setGreeting('Hello! Thank you for your interest in our solutions. What goals are you looking to accomplish?');
    } else if (tmpl === 'support') {
      setAgentName('Customer Care Specialist');
      setDescription('Assists customers with account lookups, FAQs, and ticket resolution.');
      setRole('Patient Care Specialist');
      setGreeting('Welcome to Customer Care! My name is Ava. How can I assist you right now?');
    } else {
      setAgentName('');
      setDescription('');
    }
  };

  const handleComplete = () => {
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#38A85B', '#55B9E8', '#2189C8'],
    });

    const newAgent: Agent = {
      id: `ag_${Date.now()}`,
      businessId: 'biz_apollo_01',
      name: agentName || 'New Voice Agent',
      description: description || 'Autonomous business voice agent configured via Auris.',
      industry,
      type: template,
      voiceId: voiceName.toLowerCase().replace(/\s+/g, '_'),
      voiceName,
      language,
      speed,
      pitch,
      status: 'active',
      callsCount: 0,
      minutesUsed: 0,
      createdAt: new Date().toISOString(),
      instructions: {
        role,
        personality,
        objectives,
        rules,
        greeting,
        fallback,
      },
      tools: {
        calendarBooking,
        crmSync,
        callTransfer,
        smsFollowup,
        transferNumber,
      },
      knowledgeBaseIds: selectedKbs,
      provider: 'OmniDimension',
      providerAgentId: `omni_ag_${Math.random().toString(36).substring(2, 9)}`,
    };

    onSaveAgent(newAgent);
  };

  const steps = [
    { number: 1, title: 'Basic Details' },
    { number: 2, title: 'Voice & Language' },
    { number: 3, title: 'Instructions' },
    { number: 4, title: 'Knowledge Base' },
    { number: 5, title: 'Tools & Integrations' },
    { number: 6, title: 'Review & Create' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Breadcrumb matching screenshot */}
      <div className="flex items-center gap-2 text-xs text-[#82919A]">
        <button onClick={onBack} className="hover:text-[#123047] cursor-pointer">
          Agents
        </button>
        <span>&gt;</span>
        <span className="font-semibold text-[#123047]">Create</span>
      </div>

      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#123047] tracking-tight">Create New Agent</h1>
        <p className="text-xs text-[#52636D] mt-0.5">Set up your AI agent in a few simple steps.</p>
      </div>

      {/* Main Grid: Stepper & Form on Left, Voice Preview on Right (Matching Mockup) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form & Stepper (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 sm:p-8 border border-[#DDEBEF] shadow-xs space-y-8">
          {/* Stepper Navigation */}
          <div className="flex items-center justify-between border-b border-[#DDEBEF] pb-4 overflow-x-auto gap-2">
            {steps.map((step) => {
              const isActive = currentStep === step.number;
              const isPast = currentStep > step.number;
              return (
                <button
                  key={step.number}
                  onClick={() => setCurrentStep(step.number)}
                  className="flex items-center gap-2 text-left cursor-pointer flex-shrink-0"
                >
                  <span
                    className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center transition-colors ${
                      isActive
                        ? 'bg-[#38A85B] text-white'
                        : isPast
                        ? 'bg-[#EFFAF1] text-[#38A85B]'
                        : 'bg-[#EEF4F6] text-[#82919A]'
                    }`}
                  >
                    {isPast ? <CheckCircle2 className="w-3.5 h-3.5" /> : step.number}
                  </span>
                  <span
                    className={`text-xs font-semibold ${
                      isActive ? 'text-[#123047]' : 'text-[#82919A]'
                    }`}
                  >
                    {step.title}
                  </span>
                </button>
              );
            })}
          </div>

          {/* STEP 1: BASIC DETAILS (Exact fields from reference image) */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Agent Name */}
              <div>
                <label className="block text-xs font-bold text-[#123047] mb-1.5">Agent Name</label>
                <input
                  type="text"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="e.g. Dental Receptionist"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDEBEF] text-xs focus:outline-none focus:border-[#2189C8] bg-white"
                />
              </div>

              {/* Select Industry */}
              <div>
                <label className="block text-xs font-bold text-[#123047] mb-1.5">Select Industry</label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDEBEF] text-xs focus:outline-none focus:border-[#2189C8] bg-white"
                >
                  <option value="Healthcare">Healthcare & Clinics</option>
                  <option value="Fitness">Fitness & Wellness</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Hospitality">Hospitality</option>
                  <option value="Restaurants">Restaurants</option>
                  <option value="Education">Education</option>
                </select>
              </div>

              {/* Choose a Template */}
              <div>
                <label className="block text-xs font-bold text-[#123047] mb-2">Choose a Template</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Receptionist */}
                  <div
                    onClick={() => handleTemplateSelect('receptionist')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                      template === 'receptionist'
                        ? 'border-[#38A85B] bg-[#EFFAF1]'
                        : 'border-[#DDEBEF] hover:bg-[#F5FAFC]'
                    }`}
                  >
                    <input
                      type="radio"
                      checked={template === 'receptionist'}
                      onChange={() => handleTemplateSelect('receptionist')}
                      className="mt-0.5 accent-[#38A85B]"
                    />
                    <div>
                      <p className="text-xs font-bold text-[#123047]">Receptionist</p>
                      <p className="text-[11px] text-[#52636D]">Handle calls and FAQs</p>
                    </div>
                  </div>

                  {/* Sales Agent */}
                  <div
                    onClick={() => handleTemplateSelect('sales')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                      template === 'sales'
                        ? 'border-[#38A85B] bg-[#EFFAF1]'
                        : 'border-[#DDEBEF] hover:bg-[#F5FAFC]'
                    }`}
                  >
                    <input
                      type="radio"
                      checked={template === 'sales'}
                      onChange={() => handleTemplateSelect('sales')}
                      className="mt-0.5 accent-[#38A85B]"
                    />
                    <div>
                      <p className="text-xs font-bold text-[#123047]">Sales agent</p>
                      <p className="text-[11px] text-[#52636D]">Quality leads</p>
                    </div>
                  </div>

                  {/* Support Agent */}
                  <div
                    onClick={() => handleTemplateSelect('support')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                      template === 'support'
                        ? 'border-[#38A85B] bg-[#EFFAF1]'
                        : 'border-[#DDEBEF] hover:bg-[#F5FAFC]'
                    }`}
                  >
                    <input
                      type="radio"
                      checked={template === 'support'}
                      onChange={() => handleTemplateSelect('support')}
                      className="mt-0.5 accent-[#38A85B]"
                    />
                    <div>
                      <p className="text-xs font-bold text-[#123047]">Support agent</p>
                      <p className="text-[11px] text-[#52636D]">Customer support</p>
                    </div>
                  </div>

                  {/* Custom */}
                  <div
                    onClick={() => handleTemplateSelect('custom')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                      template === 'custom'
                        ? 'border-[#38A85B] bg-[#EFFAF1]'
                        : 'border-[#DDEBEF] hover:bg-[#F5FAFC]'
                    }`}
                  >
                    <input
                      type="radio"
                      checked={template === 'custom'}
                      onChange={() => handleTemplateSelect('custom')}
                      className="mt-0.5 accent-[#38A85B]"
                    />
                    <div>
                      <p className="text-xs font-bold text-[#123047]">Custom</p>
                      <p className="text-[11px] text-[#52636D]">Build from scratch</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-[#123047] mb-1.5">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A brief description of what this agent will do..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDEBEF] text-xs focus:outline-none focus:border-[#2189C8] bg-white"
                />
              </div>

              {/* Next Button */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-2.5 rounded-xl bg-[#38A85B] hover:bg-[#2f8f4d] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                >
                  Next Step
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: VOICE & LANGUAGE */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#123047] mb-1.5">Voice Model</label>
                  <select
                    value={voiceName}
                    onChange={(e) => setVoiceName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDEBEF] text-xs"
                  >
                    <option value="Ava (Natural)">Ava (Natural Female)</option>
                    <option value="Liam (Warm)">Liam (Warm Male)</option>
                    <option value="Sophia (Soft)">Sophia (Soft Female)</option>
                    <option value="Oliver (Crisp)">Oliver (Crisp Male)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#123047] mb-1.5">Language & Accent</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDEBEF] text-xs"
                  >
                    <option value="English (US)">English (US)</option>
                    <option value="English (UK)">English (UK)</option>
                    <option value="English (IN)">English (Indian)</option>
                    <option value="Spanish (Latin)">Spanish</option>
                    <option value="Hindi">Hindi</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-bold text-[#123047] mb-1">
                    <span>Speaking Speed</span>
                    <span>{speed}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.8"
                    max="1.3"
                    step="0.05"
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    className="w-full accent-[#38A85B]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-[#123047] mb-1">
                    <span>Voice Pitch</span>
                    <span>{pitch}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.8"
                    max="1.2"
                    step="0.05"
                    value={pitch}
                    onChange={(e) => setPitch(Number(e.target.value))}
                    className="w-full accent-[#2189C8]"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-5 py-2.5 rounded-xl border border-[#DDEBEF] text-xs font-semibold text-[#52636D]"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="px-6 py-2.5 rounded-xl bg-[#38A85B] text-white text-xs font-bold flex items-center gap-1.5"
                >
                  Next Step <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: INSTRUCTIONS */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* AI Prompt Generator Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#EFFAF1] to-[#EEF8FC] border border-[#65C978]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white shadow-xs flex items-center justify-center text-[#38A85B]">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#123047]">Auris Gemini Prompt Engine</h4>
                    <p className="text-[11px] text-[#52636D]">
                      Synthesize fine-tuned system instructions, conversational guardrails, and greetings for {industry}.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAIGeneratePrompt}
                  disabled={isGeneratingPrompt}
                  className="px-4 py-2 rounded-xl bg-[#38A85B] hover:bg-[#2f8f4d] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs disabled:opacity-50 whitespace-nowrap"
                >
                  {isGeneratingPrompt ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Auto-Generate with AI
                    </>
                  )}
                </button>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#123047] mb-1">Role Persona</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#DDEBEF] text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#123047] mb-1">Primary Objectives</label>
                <textarea
                  rows={2}
                  value={objectives}
                  onChange={(e) => setObjectives(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#DDEBEF] text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#123047] mb-1">Opening Welcome Greeting</label>
                <input
                  type="text"
                  value={greeting}
                  onChange={(e) => setGreeting(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#DDEBEF] text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#123047] mb-1">Business Rules & Guardrails</label>
                <textarea
                  rows={2}
                  value={rules}
                  onChange={(e) => setRules(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#DDEBEF] text-xs"
                />
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-5 py-2.5 rounded-xl border border-[#DDEBEF] text-xs font-semibold text-[#52636D]"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(4)}
                  className="px-6 py-2.5 rounded-xl bg-[#38A85B] text-white text-xs font-bold flex items-center gap-1.5"
                >
                  Next Step <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: KNOWLEDGE BASE */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <p className="text-xs text-[#52636D]">
                Select which verified knowledge items this voice agent should cite during live calls.
              </p>
              <div className="space-y-2">
                {availableKnowledge.map((kb) => {
                  const isChecked = selectedKbs.includes(kb.id);
                  return (
                    <div
                      key={kb.id}
                      onClick={() => {
                        setSelectedKbs((prev) =>
                          isChecked ? prev.filter((id) => id !== kb.id) : [...prev, kb.id]
                        );
                      }}
                      className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between ${
                        isChecked ? 'border-[#38A85B] bg-[#EFFAF1]' : 'border-[#DDEBEF]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="accent-[#38A85B]"
                        />
                        <div>
                          <p className="text-xs font-bold text-[#123047]">{kb.title}</p>
                          <p className="text-[11px] text-[#82919A]">{kb.sizeOrCount}</p>
                        </div>
                      </div>
                      <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-[#DDEBEF] text-[#38A85B] font-semibold">
                        Ready
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="px-5 py-2.5 rounded-xl border border-[#DDEBEF] text-xs font-semibold text-[#52636D]"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(5)}
                  className="px-6 py-2.5 rounded-xl bg-[#38A85B] text-white text-xs font-bold flex items-center gap-1.5"
                >
                  Next Step <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: TOOLS & INTEGRATIONS */}
          {currentStep === 5 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-4 rounded-xl border border-[#DDEBEF] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#123047]">Calendar Booking</h4>
                  <p className="text-[11px] text-[#52636D]">Syncs with Google Calendar to book confirmed appointments.</p>
                </div>
                <input
                  type="checkbox"
                  checked={calendarBooking}
                  onChange={(e) => setCalendarBooking(e.target.checked)}
                  className="w-4 h-4 accent-[#38A85B]"
                />
              </div>

              <div className="p-4 rounded-xl border border-[#DDEBEF] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#123047]">CRM Auto-Sync</h4>
                  <p className="text-[11px] text-[#52636D]">Pushes call transcripts, sentiment, and caller tags to HubSpot/Salesforce.</p>
                </div>
                <input
                  type="checkbox"
                  checked={crmSync}
                  onChange={(e) => setCrmSync(e.target.checked)}
                  className="w-4 h-4 accent-[#38A85B]"
                />
              </div>

              <div className="p-4 rounded-xl border border-[#DDEBEF] space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[#123047]">Live Call Transfer</h4>
                    <p className="text-[11px] text-[#52636D]">Transfers call to a human specialist when emergency or complex questions arise.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={callTransfer}
                    onChange={(e) => setCallTransfer(e.target.checked)}
                    className="w-4 h-4 accent-[#38A85B]"
                  />
                </div>
                {callTransfer && (
                  <input
                    type="text"
                    value={transferNumber}
                    onChange={(e) => setTransferNumber(e.target.value)}
                    placeholder="+1 (800) 555-0199"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#DDEBEF]"
                  />
                )}
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setCurrentStep(4)}
                  className="px-5 py-2.5 rounded-xl border border-[#DDEBEF] text-xs font-semibold text-[#52636D]"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(6)}
                  className="px-6 py-2.5 rounded-xl bg-[#38A85B] text-white text-xs font-bold flex items-center gap-1.5"
                >
                  Next Step <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: REVIEW & DEPLOY */}
          {currentStep === 6 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-4 rounded-xl bg-[#F5FAFC] border border-[#DDEBEF] space-y-3">
                <h4 className="text-sm font-bold text-[#123047]">Deployment Review</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-[#82919A]">Name:</span> <span className="font-bold">{agentName || 'Dental Receptionist'}</span></div>
                  <div><span className="text-[#82919A]">Industry:</span> <span className="font-bold">{industry}</span></div>
                  <div><span className="text-[#82919A]">Voice:</span> <span className="font-bold text-[#2189C8]">{voiceName}</span></div>
                  <div><span className="text-[#82919A]">Language:</span> <span className="font-bold">{language}</span></div>
                  <div><span className="text-[#82919A]">Infrastructure:</span> <span className="font-bold text-[#38A85B]">OmniDimension Tier-1</span></div>
                  <div><span className="text-[#82919A]">Attached KBs:</span> <span className="font-bold">{selectedKbs.length} Documents</span></div>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setCurrentStep(5)}
                  className="px-5 py-2.5 rounded-xl border border-[#DDEBEF] text-xs font-semibold text-[#52636D]"
                >
                  Back
                </button>
                <button
                  id="builder-create-agent-submit"
                  onClick={handleComplete}
                  className="px-7 py-3 rounded-xl bg-[#38A85B] hover:bg-[#2f8f4d] text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  Create Agent
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Sticky "Preview Voice" Panel (Exact Match to Screenshot!) */}
        <div className="lg:col-span-4 sticky top-28 bg-white rounded-2xl p-6 border border-[#DDEBEF] shadow-xs space-y-5">
          <h3 className="text-xs font-bold text-[#82919A] uppercase tracking-wider">Preview Voice</h3>

          {/* Animated Waveform Bars in Light Green Container */}
          <div className="h-28 rounded-2xl bg-[#EFFAF1] flex items-center justify-center gap-1 px-4">
            {[14, 28, 42, 22, 50, 36, 18, 44, 30, 16].map((h, idx) => (
              <span
                key={idx}
                className={`w-1 rounded-full ${
                  isPlayingVoice ? 'bg-[#38A85B] animate-wave' : 'bg-[#65C978]'
                }`}
                style={{
                  height: `${isPlayingVoice ? Math.max(12, (h * 1.2) % 55) : h}px`,
                  animationDelay: `${idx * 0.1}s`,
                }}
              />
            ))}
          </div>

          {/* Voice Selector */}
          <div>
            <label className="block text-[11px] font-bold text-[#82919A] mb-1">Voice</label>
            <select
              value={voiceName}
              onChange={(e) => setVoiceName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#DDEBEF] text-[#123047] bg-white font-medium"
            >
              <option value="Ava (Natural)">Ava (Natural)</option>
              <option value="Liam (Warm)">Liam (Warm)</option>
              <option value="Sophia (Soft)">Sophia (Soft)</option>
              <option value="Oliver (Crisp)">Oliver (Crisp)</option>
            </select>
          </div>

          {/* Play Voice Green Button */}
          <button
            onClick={handlePlayVoicePreview}
            className="w-full py-2.5 px-4 rounded-xl bg-[#38A85B] hover:bg-[#2f8f4d] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
          >
            {isPlayingVoice ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                Stop Voice
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                Play Voice
              </>
            )}
          </button>

          {/* Language Selector */}
          <div>
            <label className="block text-[11px] font-bold text-[#82919A] mb-1">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#DDEBEF] text-[#123047] bg-white font-medium"
            >
              <option value="English (US)">English (US)</option>
              <option value="English (UK)">English (UK)</option>
              <option value="English (IN)">English (IN)</option>
              <option value="Spanish (ES)">Spanish (ES)</option>
            </select>
          </div>

          {/* Response Speed */}
          <div>
            <label className="block text-[11px] font-bold text-[#82919A] mb-1">Response Speed</label>
            <select
              value={responseSpeed}
              onChange={(e) => setResponseSpeed(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#DDEBEF] text-[#123047] bg-white font-medium"
            >
              <option value="Normal">Normal (&lt; 350ms)</option>
              <option value="Fast">Fast (&lt; 280ms)</option>
              <option value="Measured">Measured (Relaxed)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
