import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  const [stepDirection, setStepDirection] = useState<number>(1);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);

  const goToStep = (stepNumber: number) => {
    setStepDirection(stepNumber > currentStep ? 1 : -1);
    setCurrentStep(stepNumber);
  };

  const stepMotionVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 24 : -24,
      opacity: 0,
      filter: 'blur(2px)',
    }),
    center: {
      x: 0,
      opacity: 1,
      filter: 'blur(0px)',
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -24 : 24,
      opacity: 0,
      filter: 'blur(2px)',
    }),
  };

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
  const [role, setRole] = useState('Front-Desk AI Receptionist');
  const [personality, setPersonality] = useState('Warm, polite, professional, calm, and articulate.');
  const [objectives, setObjectives] = useState('Answer caller questions regarding services, address, hours, and schedule appointments.');
  const [rules, setRules] = useState('Keep answers concise, polite, and helpful under 2 sentences.');
  const [greeting, setGreeting] = useState('Hello! Welcome to our office. How may I assist you today?');
  const [fallback, setFallback] = useState('I want to make sure you get exact information. Let me connect you directly to our lead coordinator.');
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);

  const handleAIGeneratePrompt = async () => {
    setIsGeneratingPrompt(true);
    try {
      const res = await fetch('/api/voice/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: 'Auris Voice AI Cloud',
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
  const [localKnowledgeList, setLocalKnowledgeList] = useState<KnowledgeItem[]>(availableKnowledge);
  const [selectedKbs, setSelectedKbs] = useState<string[]>([]);
  const [isAddingKb, setIsAddingKb] = useState(false);
  const [newKbTitle, setNewKbTitle] = useState('');
  const [newKbType, setNewKbType] = useState<'faq' | 'document' | 'url'>('faq');
  const [newKbContent, setNewKbContent] = useState('');
  const [customKnowledgeSnippet, setCustomKnowledgeSnippet] = useState('');
  const [liveWebSearchGrounding, setLiveWebSearchGrounding] = useState(true);

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
      setAgentName('Front-Desk Practice Receptionist');
      setDescription('Answers incoming calls, greets callers warmly, addresses FAQs, and books confirmed appointments.');
      setRole('Front-Desk Operations Coordinator');
      setGreeting('Thank you for calling our office! My name is Ava. How may I assist you today?');
    } else if (tmpl === 'sales') {
      setAgentName('Inbound Sales Representative');
      setDescription('Qualifies prospective buyers, shares pricing tiers, and schedules discovery consultations.');
      setRole('Senior Sales Consultant');
      setGreeting('Hello! Thank you for your interest in our solutions. What goals are you looking to accomplish?');
    } else if (tmpl === 'support') {
      setAgentName('Customer Care Specialist');
      setDescription('Assists customers with service inquiries, account questions, and ticket routing.');
      setRole('Customer Support Specialist');
      setGreeting('Welcome to Customer Care! My name is Ava. How can I assist you today?');
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
      businessId: 'biz_venkat_01',
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
      liveWebSearchGrounding,
      customKnowledgeSnippet,
      provider: 'AurisEngine',
      providerAgentId: `auris_ag_${Math.random().toString(36).substring(2, 9)}`,
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
      {/* Top Navigation & Breadcrumb with interactive back button */}
      <div className="flex items-center justify-between">
        <motion.button
          onClick={onBack}
          whileHover={{ x: -3 }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors shadow-2xs group cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-emerald-500 transition-transform group-hover:-translate-x-1" />
          <span>Back to Voice AI Assistants</span>
        </motion.button>

        <div className="flex items-center gap-2 text-xs text-[#82919A]">
          <span>Step <strong className="text-emerald-600">{currentStep}</strong> of 6</span>
        </div>
      </div>

      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight">Create New Agent</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Set up your AI agent in a few simple steps with sub-millisecond voice intelligence.</p>
      </div>

      {/* Main Grid: Stepper & Form on Left, Voice Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form & Stepper (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 sm:space-y-8">
          {/* Stepper Navigation - Horizontal Scrollable on Mobile */}
          <div className="flex items-center justify-start sm:justify-between border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto gap-1 sm:gap-2 no-scrollbar">
            {steps.map((step) => {
              const isActive = currentStep === step.number;
              const isPast = currentStep > step.number;
              return (
                <button
                  key={step.number}
                  onClick={() => goToStep(step.number)}
                  className="relative flex items-center gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-left cursor-pointer shrink-0 transition-colors"
                >
                  {isActive && (
                    <motion.div
                      layoutId="builderStepActiveIndicator"
                      className="absolute inset-0 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/40 rounded-xl"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <span
                    className={`relative z-10 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center transition-colors ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : isPast
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {isPast ? <CheckCircle2 className="w-3.5 h-3.5" /> : step.number}
                  </span>
                  <span
                    className={`relative z-10 text-xs font-semibold whitespace-nowrap ${
                      isActive ? 'text-slate-950 dark:text-white font-bold' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {step.title}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Animated Multi-Step Form Container */}
          <div className="overflow-hidden min-h-[460px]">
            <AnimatePresence mode="wait" custom={stepDirection}>
              <motion.div
                key={currentStep}
                custom={stepDirection}
                variants={stepMotionVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              >

          {/* STEP 1: BASIC DETAILS (Exact fields from reference image) */}
          {currentStep === 1 && (
            <div className="space-y-6">
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
                  onClick={() => goToStep(2)}
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
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#123047] mb-1.5">Voice Model</label>
                  <select
                    value={voiceName}
                    onChange={(e) => setVoiceName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDEBEF] text-xs font-semibold"
                  >
                    <optgroup label="Cartesia Sonic Engine (<100ms Latency)">
                      <option value="Cartesia Sonic - Despina (Indian English)">Cartesia Sonic - Despina (Indian English Female)</option>
                      <option value="Cartesia Sonic - Barbershop (Warm Male)">Cartesia Sonic - Barbershop (Warm Male)</option>
                      <option value="Cartesia Sonic - Katie (Conversational)">Cartesia Sonic - Katie (Conversational Female)</option>
                      <option value="Cartesia Sonic - Mason (Executive Male)">Cartesia Sonic - Mason (Executive Male)</option>
                    </optgroup>
                    <optgroup label="Sarvam AI Indic Engine (Native Indian Languages)">
                      <option value="Sarvam AI - Bulbul v2 (Hindi Female)">Sarvam AI - Bulbul v2 (Hindi Female)</option>
                      <option value="Sarvam AI - Saaras v2 (Hindi Male)">Sarvam AI - Saaras v2 (Hindi Male)</option>
                      <option value="Sarvam AI - Bulbul v2 (Telugu Female)">Sarvam AI - Bulbul v2 (Telugu Female)</option>
                      <option value="Sarvam AI - Saaras v2 (Tamil Male)">Sarvam AI - Saaras v2 (Tamil Male)</option>
                      <option value="Sarvam AI - Bulbul v2 (Kannada Female)">Sarvam AI - Bulbul v2 (Kannada Female)</option>
                      <option value="Sarvam AI - Bulbul v2 (Bengali Female)">Sarvam AI - Bulbul v2 (Bengali Female)</option>
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#123047] mb-1.5">Primary Language & Dialect</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDEBEF] text-xs font-semibold"
                  >
                    <option value="English (India)">English (India)</option>
                    <option value="Hindi">Hindi (National)</option>
                    <option value="Telugu">Telugu (Telangana & AP)</option>
                    <option value="Tamil">Tamil (Tamil Nadu)</option>
                    <option value="Kannada">Kannada (Karnataka)</option>
                    <option value="Bengali">Bengali</option>
                    <option value="English (Global)">English (Global)</option>
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
                  onClick={() => goToStep(1)}
                  className="px-5 py-2.5 rounded-xl border border-[#DDEBEF] text-xs font-semibold text-[#52636D]"
                >
                  Back
                </button>
                <button
                  onClick={() => goToStep(3)}
                  className="px-6 py-2.5 rounded-xl bg-[#38A85B] text-white text-xs font-bold flex items-center gap-1.5"
                >
                  Next Step <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: INSTRUCTIONS */}
          {currentStep === 3 && (
            <div className="space-y-4">
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
                  onClick={() => goToStep(2)}
                  className="px-5 py-2.5 rounded-xl border border-[#DDEBEF] text-xs font-semibold text-[#52636D]"
                >
                  Back
                </button>
                <button
                  onClick={() => goToStep(4)}
                  className="px-6 py-2.5 rounded-xl bg-[#38A85B] text-white text-xs font-bold flex items-center gap-1.5"
                >
                  Next Step <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: KNOWLEDGE BASE */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-[#123047] dark:text-white">Agent Knowledge Base & Live Grounding</h3>
                <p className="text-xs text-[#52636D] mt-0.5">
                  Equip this agent with company documents, FAQs, and real-time live search so it answers caller questions accurately.
                </p>
              </div>

              {/* 1. Attached Knowledge Items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#123047] uppercase tracking-wider">
                    Select Knowledge Documents ({selectedKbs.length} selected)
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsAddingKb(!isAddingKb)}
                    className="text-xs font-bold text-[#38A85B] hover:text-[#2f8f4d] flex items-center gap-1 cursor-pointer"
                  >
                    + Add New Document / FAQs
                  </button>
                </div>

                {/* Inline New Knowledge Creator */}
                {isAddingKb && (
                  <div className="p-4 rounded-2xl bg-white border-2 border-[#38A85B] shadow-sm space-y-3 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-[#123047]">Add Knowledge to Workspace & Agent</span>
                      <button
                        type="button"
                        onClick={() => setIsAddingKb(false)}
                        className="text-xs text-slate-400 hover:text-slate-600"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-[#123047] mb-1">Document / FAQ Title</label>
                        <input
                          type="text"
                          value={newKbTitle}
                          onChange={(e) => setNewKbTitle(e.target.value)}
                          placeholder="e.g. Service Offerings & Pricing Rules"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-[#DDEBEF] focus:outline-none focus:border-[#38A85B]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#123047] mb-1">Knowledge Type</label>
                        <select
                          value={newKbType}
                          onChange={(e) => setNewKbType(e.target.value as any)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-[#DDEBEF] bg-white focus:outline-none focus:border-[#38A85B]"
                        >
                          <option value="faq">FAQ / Q&A Pairs</option>
                          <option value="document">Custom Document / Policy</option>
                          <option value="url">Website URL</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#123047] mb-1">
                        {newKbType === 'url' ? 'Website URL to Index' : 'Knowledge Content / Information'}
                      </label>
                      <textarea
                        rows={3}
                        value={newKbContent}
                        onChange={(e) => setNewKbContent(e.target.value)}
                        placeholder={
                          newKbType === 'url'
                            ? 'https://example.com/pricing'
                            : 'Enter company details, services, business hours, refund policy, pricing tiers, or FAQs...'
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#DDEBEF] focus:outline-none focus:border-[#38A85B]"
                      />
                    </div>

                    <button
                      type="button"
                      disabled={!newKbTitle.trim() || !newKbContent.trim()}
                      onClick={async () => {
                        const newKb: KnowledgeItem = {
                          id: `kb_${Date.now()}`,
                          businessId: 'biz_venkat_01',
                          title: newKbTitle.trim(),
                          type: newKbType,
                          sizeOrCount: newKbType === 'url' ? newKbContent : `${newKbContent.length} chars`,
                          content: newKbContent.trim(),
                          status: 'ready',
                          updatedAt: 'Just now',
                        };
                        try {
                          await fetch('/api/knowledge-base', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(newKb),
                          });
                        } catch (e) {}
                        setLocalKnowledgeList((prev) => [newKb, ...prev]);
                        setSelectedKbs((prev) => [...prev, newKb.id]);
                        setNewKbTitle('');
                        setNewKbContent('');
                        setIsAddingKb(false);
                      }}
                      className="px-4 py-2 rounded-xl bg-[#38A85B] text-white text-xs font-bold disabled:opacity-40 cursor-pointer"
                    >
                      Save & Attach to This Agent
                    </button>
                  </div>
                )}

                {/* List of Knowledge Items */}
                <div className="space-y-2">
                  {localKnowledgeList.length === 0 ? (
                    <div className="p-4 rounded-xl border border-dashed border-[#DDEBEF] text-center text-xs text-slate-500">
                      No documents created yet. Click "+ Add New Document / FAQs" above or paste custom notes below.
                    </div>
                  ) : (
                    localKnowledgeList.map((kb) => {
                      const isChecked = selectedKbs.includes(kb.id);
                      return (
                        <div
                          key={kb.id}
                          onClick={() => {
                            setSelectedKbs((prev) =>
                              isChecked ? prev.filter((id) => id !== kb.id) : [...prev, kb.id]
                            );
                          }}
                          className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition-colors ${
                            isChecked ? 'border-[#38A85B] bg-[#EFFAF1]' : 'border-[#DDEBEF] hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              className="accent-[#38A85B] w-4 h-4 cursor-pointer"
                            />
                            <div>
                              <p className="text-xs font-bold text-[#123047]">{kb.title}</p>
                              <p className="text-[11px] text-[#82919A]">{kb.sizeOrCount || 'Document'}</p>
                            </div>
                          </div>
                          <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-[#DDEBEF] text-[#38A85B] font-semibold">
                            Ready
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* 2. Direct Agent Knowledge Snippet */}
              <div>
                <label className="block text-xs font-bold text-[#123047] mb-1">
                  Agent-Specific Knowledge Notes & FAQs (Optional)
                </label>
                <textarea
                  rows={3}
                  value={customKnowledgeSnippet}
                  onChange={(e) => setCustomKnowledgeSnippet(e.target.value)}
                  placeholder="Paste additional key facts, special offers, office directions, or custom rules for this specific assistant..."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#DDEBEF] text-xs focus:outline-none focus:border-[#38A85B]"
                />
                <p className="text-[11px] text-[#82919A] mt-1">
                  Injected directly into the live reasoning prompt when this agent answers phone calls.
                </p>
              </div>

              {/* 3. Live Web Search Grounding Toggle */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-50 to-emerald-50 border border-sky-200 dark:border-sky-900 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#123047]">
                      Live Web Search Grounding (Free AI Fallback Engine)
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#38A85B] text-white">
                      Included Free
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    When callers ask questions outside your custom knowledge base (current news, live weather, external facts), the agent queries the web in real time and answers accurately during the call.
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={liveWebSearchGrounding}
                    onChange={(e) => setLiveWebSearchGrounding(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#38A85B]" />
                </label>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => goToStep(3)}
                  className="px-5 py-2.5 rounded-xl border border-[#DDEBEF] text-xs font-semibold text-[#52636D]"
                >
                  Back
                </button>
                <button
                  onClick={() => goToStep(5)}
                  className="px-6 py-2.5 rounded-xl bg-[#38A85B] text-white text-xs font-bold flex items-center gap-1.5"
                >
                  Next Step <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: TOOLS & INTEGRATIONS */}
          {currentStep === 5 && (
            <div className="space-y-4">
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
                  onClick={() => goToStep(4)}
                  className="px-5 py-2.5 rounded-xl border border-[#DDEBEF] text-xs font-semibold text-[#52636D]"
                >
                  Back
                </button>
                <button
                  onClick={() => goToStep(6)}
                  className="px-6 py-2.5 rounded-xl bg-[#38A85B] text-white text-xs font-bold flex items-center gap-1.5"
                >
                  Next Step <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: REVIEW & DEPLOY */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-[#F5FAFC] border border-[#DDEBEF] space-y-3">
                <h4 className="text-sm font-bold text-[#123047]">Deployment Review</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-[#82919A]">Name:</span> <span className="font-bold">{agentName || 'Dental Receptionist'}</span></div>
                  <div><span className="text-[#82919A]">Industry:</span> <span className="font-bold">{industry}</span></div>
                  <div><span className="text-[#82919A]">Voice:</span> <span className="font-bold text-[#2189C8]">{voiceName}</span></div>
                  <div><span className="text-[#82919A]">Language:</span> <span className="font-bold">{language}</span></div>
                  <div><span className="text-[#82919A]">Infrastructure:</span> <span className="font-bold text-[#38A85B]">Carrier SIP Tier-1</span></div>
                  <div><span className="text-[#82919A]">Attached KBs:</span> <span className="font-bold">{selectedKbs.length} Documents</span></div>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => goToStep(5)}
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
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column: Sticky "Preview Voice" Panel */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Preview Voice</h3>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              Cartesia & Sarvam
            </span>
          </div>

          {/* Animated Waveform Bars Container */}
          <div className="h-28 rounded-2xl bg-emerald-50/80 dark:bg-slate-950 border border-emerald-100 dark:border-slate-800 flex items-center justify-center gap-1.5 px-4 overflow-hidden relative">
            <div className="absolute top-2 left-3 flex items-center gap-1 text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
              <span className={`w-1.5 h-1.5 rounded-full ${isPlayingVoice ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`} />
              <span>{isPlayingVoice ? 'Synthesizing (<92ms)' : 'Standby'}</span>
            </div>
            {[14, 28, 42, 22, 50, 36, 18, 44, 30, 16, 32, 20, 48, 26].map((h, idx) => (
              <span
                key={idx}
                className={`w-1.5 rounded-full transition-all duration-150 ${
                  isPlayingVoice ? 'bg-emerald-500 dark:bg-emerald-400 animate-wave' : 'bg-emerald-300 dark:bg-slate-700'
                }`}
                style={{
                  height: `${isPlayingVoice ? Math.max(14, (h * 1.3) % 65) : h}px`,
                  animationDelay: `${idx * 0.08}s`,
                }}
              />
            ))}
          </div>

          {/* Voice Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Voice Persona</label>
            <select
              value={voiceName}
              onChange={(e) => setVoiceName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 font-semibold focus:outline-none focus:border-emerald-500"
            >
              <option value="Ava (Natural Indian English)">Ava (Natural Indian English)</option>
              <option value="Priya (Warm Hindi & Hinglish)">Priya (Warm Hindi & Hinglish)</option>
              <option value="Kavya (Fluent Telugu & English)">Kavya (Fluent Telugu & English)</option>
              <option value="Ananya (Clear Tamil & English)">Ananya (Clear Tamil & English)</option>
              <option value="Liam (Executive British English)">Liam (Executive British English)</option>
              <option value="Oliver (American Crisp Corporate)">Oliver (American Crisp Corporate)</option>
            </select>
          </div>

          {/* Play Voice Green Button */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handlePlayVoicePreview}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
          >
            {isPlayingVoice ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Stop Voice Preview</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play Live Voice Audition</span>
              </>
            )}
          </motion.button>

          {/* Language Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Primary Dialogue Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 font-medium focus:outline-none focus:border-emerald-500"
            >
              <option value="English (IN)">English (India - Bilingual)</option>
              <option value="Hindi (IN)">Hindi (हिन्दी - Sarvam Indic)</option>
              <option value="Telugu (IN)">Telugu (తెలుగు - Sarvam Indic)</option>
              <option value="Tamil (IN)">Tamil (தமிழ் - Sarvam Indic)</option>
              <option value="English (US)">English (US - Global)</option>
              <option value="English (UK)">English (UK - Global)</option>
            </select>
          </div>

          {/* Response Speed */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Response Latency Profile</label>
            <select
              value={responseSpeed}
              onChange={(e) => setResponseSpeed(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 font-medium focus:outline-none focus:border-emerald-500"
            >
              <option value="Fast">Ultra-Fast (&lt; 180ms - Cartesia Sonic)</option>
              <option value="Normal">Balanced (&lt; 320ms - Recommended)</option>
              <option value="Measured">Relaxed (&lt; 480ms - Deliberate)</option>
            </select>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
            <span className="font-bold text-slate-700 dark:text-slate-300 block">Telecom Compliance:</span>
            <span>TRAI DLT registered CLI pass-through with verified Indian carrier routing.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
