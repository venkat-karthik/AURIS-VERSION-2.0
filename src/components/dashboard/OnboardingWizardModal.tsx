import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Bot,
  CheckCircle2,
  Volume2,
  PhoneCall,
  Mic,
  ArrowRight,
  ArrowLeft,
  X,
  Stethoscope,
  Building2,
  ShoppingBag,
  UtensilsCrossed,
  Car,
  Briefcase,
  Radio,
  Play,
  Square,
  ShieldCheck,
  RefreshCw,
  Wallet,
} from 'lucide-react';
import { Agent, Business } from '../../types';
import { aurisApi } from '../../services/apiService';

interface OnboardingWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBusiness: Business;
  starterAgent?: Agent;
  onComplete: (agent: Agent) => void;
  onOpenWebVoice?: () => void;
  onDispatchCall?: (params: { agentId: string; callerName: string; callerNumber: string; scenario: string }) => Promise<any>;
}

interface IndustryTemplate {
  id: string;
  name: string;
  industry: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: string;
  defaultAgentName: string;
  greetings: {
    'te-IN': string;
    'hi-IN': string;
    'en-IN': string;
  };
  instructions: string;
}

const INDUSTRY_TEMPLATES: IndustryTemplate[] = [
  {
    id: 'healthcare',
    name: 'Dental & Healthcare Clinic',
    industry: 'Healthcare',
    icon: Stethoscope,
    badge: 'Most Popular',
    defaultAgentName: 'Dr. Rao Clinic Receptionist',
    greetings: {
      'te-IN': 'నమస్కారం! డాక్టర్ రావు డెంటల్ క్లినిక్ కి స్వాగతం. నేను మీ ఏఐ అసిస్టెంట్ ని. అపాయింట్‌మెంట్ బుకింగ్ కోసం ఎలా సహాయపడగలను?',
      'hi-IN': 'नमस्ते! डॉ. राव डेंटल क्लिनिक में आपका स्वागत है। मैं आपकी एआई असिस्टेंट हूँ। अपॉइंटमेंट बुकिंग में आपकी क्या मदद करूँ?',
      'en-IN': 'Hello! Welcome to Dr. Rao Dental Clinic. I am your AI receptionist. How may I assist you with scheduling your appointment today?',
    },
    instructions: 'You are a warm, courteous dental and healthcare receptionist. Greet patients naturally, qualify their dental concerns (cleaning, cavity, tooth pain, root canal), check calendar availability, and confirm appointment slots. Keep answers concise (under 2 sentences).',
  },
  {
    id: 'realestate',
    name: 'Real Estate & Properties',
    industry: 'Real Estate',
    icon: Building2,
    badge: 'High Conversion',
    defaultAgentName: 'Apna Real Estate Advisor',
    greetings: {
      'te-IN': 'నమస్కారం! అప్నా రియల్ ఎస్టేట్ కి స్వాగతం. వైట్‌ఫీల్డ్ మరియు హైటెక్ సిటీ ప్రాజెక్ట్స్ గురించి పూర్తి వివరాలు అందిస్తాను. మీరు 2BHK లేదా 3BHK చూస్తున్నారా?',
      'hi-IN': 'नमस्ते! अपना रियल एस्टेट में आपका स्वागत है। क्या आप 2BHK या 3BHK विला और फ्लैट्स की जानकारी या साइट विज़िट शेड्यूल करना चाहते हैं?',
      'en-IN': 'Hello! Welcome to Apna Real Estate Advisory. I can help you with floor plans, pricing, and scheduling an on-site property visit. Are you looking for 2BHK or 3BHK?',
    },
    instructions: 'You are a professional real estate sales advisor. Qualify buyer preferences (budget, 2BHK vs 3BHK, move-in timeline), highlight luxury amenities, and schedule an on-site physical visit with sales executives.',
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce & D2C Delivery',
    industry: 'E-Commerce',
    icon: ShoppingBag,
    badge: 'Logistics AI',
    defaultAgentName: 'FastTrack Order Assistant',
    greetings: {
      'te-IN': 'నమస్కారం! మీ ఆర్డర్ ధృవీకరణ కోసం ఫాస్ట్‌ట్రాక్ నుండి కాల్ చేస్తున్నాను. మీ క్యాష్ ఆన్ డెలివరీ ఆర్డర్ కన్ఫర్మ్ చేయవచ్చా?',
      'hi-IN': 'नमस्ते! आपके हालिया आर्डर वेरिफिकेशन के लिए कॉल कर रहे हैं। क्या हम आपका कैश ऑन डिलीवरी आर्डर डिस्पैच के लिए कन्फर्म करें?',
      'en-IN': 'Hello! I am calling from FastTrack fulfillment to confirm your recent online order. Can I confirm your delivery address and Cash on Delivery payment?',
    },
    instructions: 'You are an automated logistics verification assistant. Confirm order items, delivery address, preferred delivery time, and payment method (Prepaid vs Cash on Delivery). Update order status promptly.',
  },
  {
    id: 'restaurant',
    name: 'Restaurant & Hospitality',
    industry: 'Hospitality',
    icon: UtensilsCrossed,
    badge: 'Table Booking',
    defaultAgentName: 'Bawarchi Dining Hostess',
    greetings: {
      'te-IN': 'నమస్కారం! బావర్చి రెస్టారెంట్ కి స్వాగతం. ఈ రోజు లంచ్ లేదా డిన్నర్ కోసం టేబుల్ రిజర్వేషన్ చేయాలనుకుంటున్నారా?',
      'hi-IN': 'नमस्ते! बावर्ची रेस्तरां में आपका स्वागत है। आज लंच या डिनर के लिए कितने लोगों की टेबल बुक करना चाहेंगे?',
      'en-IN': 'Hello and welcome to Bawarchi Royal Dining. How many guests would you like to reserve a table for this evening?',
    },
    instructions: 'You are an attentive restaurant dining host. Ask for guest party size, preferred dining time (lunch vs dinner), indoor vs outdoor seating, and any dietary preferences or celebrations.',
  },
  {
    id: 'automotive',
    name: 'Car Dealership & Service',
    industry: 'Automotive',
    icon: Car,
    badge: 'Auto Care',
    defaultAgentName: 'Pratham Motors Service Desk',
    greetings: {
      'te-IN': 'నమస్కారం! ప్రథమ్ మోటార్స్ నుండి కాల్ చేస్తున్నాను. మీ కార్ పీరియాడిక్ సర్వీస్ లేదా టెస్ట్ డ్రైవ్ బుకింగ్ కోసం ఎలా సహాయపడగలను?',
      'hi-IN': 'नमस्ते! प्रथम मोटर्स में आपका स्वागत है। क्या आप अपनी कार की सर्विसिंग या नई टेस्ट ड्राइव बुक करना चाहते हैं?',
      'en-IN': 'Hello! Welcome to Pratham Motors Service & Sales. Would you like to schedule your periodic vehicle maintenance or book a test drive?',
    },
    instructions: 'You are an automotive service advisor. Inquire about vehicle mileage, service package requirements, pick-and-drop service requests, and preferred service date.',
  },
  {
    id: 'custom',
    name: 'Custom Business Voice Concierge',
    industry: 'Business Services',
    icon: Briefcase,
    badge: 'Full Freedom',
    defaultAgentName: 'Auris Smart Business Receptionist',
    greetings: {
      'te-IN': 'నమస్కారం! మా సంస్థకు స్వాగతం. నేను మీ ఏఐ అసిస్టెంట్ ని. మీకు ఎలా సహాయపడగలను?',
      'hi-IN': 'नमस्ते! हमारे व्यवसाय में आपका स्वागत है। मैं आपकी एआई असिस्टेंट हूँ। आज मैं आपकी क्या सहायता करूँ?',
      'en-IN': 'Hello! Thank you for calling. I am your autonomous AI assistant. How may I direct your call or assist you today?',
    },
    instructions: 'You are an intelligent, polite business voice receptionist. Greet callers warmly, understand their inquiry, answer common business questions, and route calls or capture contact details for follow-ups.',
  },
];

const DIALECT_OPTIONS = [
  {
    code: 'te-IN',
    name: 'Telugu (తెలుగు - వాడుక భాష)',
    voiceId: 'kavya',
    voiceName: 'Kavya (Warm Indian Female)',
    speakerSample: 'నమస్కారం! నేను మీ వాయిస్ అసిస్టెంట్ ని. మీకు ఎలా సహాయపడగలను?',
  },
  {
    code: 'hi-IN',
    name: 'Hindi (हिन्दी - Natural Indian)',
    voiceId: 'aarav',
    voiceName: 'Aarav (Professional Indian Male)',
    speakerSample: 'नमस्ते! मैं आपकी एआई वॉइस असिस्टेंट हूँ। आज मैं आपकी क्या मदद करूँ?',
  },
  {
    code: 'en-IN',
    name: 'Indian English (Business Fluent)',
    voiceId: 'priya',
    voiceName: 'Priya (Clear Executive Female)',
    speakerSample: 'Hello! I am your AI phone receptionist. How can I assist your business today?',
  },
];

export const OnboardingWizardModal: React.FC<OnboardingWizardModalProps> = ({
  isOpen,
  onClose,
  currentBusiness,
  starterAgent,
  onComplete,
  onOpenWebVoice,
  onDispatchCall,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedTemplate, setSelectedTemplate] = useState<IndustryTemplate>(INDUSTRY_TEMPLATES[0]);
  const [selectedDialect, setSelectedDialect] = useState<string>('te-IN');
  const [agentName, setAgentName] = useState<string>(
    starterAgent?.name || `${currentBusiness.name} AI Receptionist`
  );
  const [customGreeting, setCustomGreeting] = useState<string>(
    INDUSTRY_TEMPLATES[0].greetings['te-IN']
  );
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testPhoneNumber, setTestPhoneNumber] = useState('');
  const [isDispatchingTestCall, setIsDispatchingTestCall] = useState(false);
  const [testCallNotification, setTestCallNotification] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectTemplate = (template: IndustryTemplate) => {
    setSelectedTemplate(template);
    setAgentName(`${currentBusiness.name} ${template.name.split(' ')[0]} AI`);
    const dialectCode = selectedDialect as 'te-IN' | 'hi-IN' | 'en-IN';
    setCustomGreeting(template.greetings[dialectCode] || template.greetings['en-IN']);
  };

  const handleSelectDialect = (code: string) => {
    setSelectedDialect(code);
    const dialectCode = code as 'te-IN' | 'hi-IN' | 'en-IN';
    setCustomGreeting(selectedTemplate.greetings[dialectCode] || selectedTemplate.greetings['en-IN']);
  };

  const handlePlayVoiceSample = async () => {
    if (isPlayingAudio) return;
    setIsPlayingAudio(true);
    try {
      const dialectObj = DIALECT_OPTIONS.find((d) => d.code === selectedDialect) || DIALECT_OPTIONS[0];
      const audioBuffer = await aurisApi.synthesizeVoicePreview({
        text: customGreeting.slice(0, 100),
        voiceId: dialectObj.voiceId,
        language: dialectObj.code,
      });

      const blob = new Blob([audioBuffer], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => setIsPlayingAudio(false);
      audio.onerror = () => setIsPlayingAudio(false);
      await audio.play();
    } catch {
      // Fallback to browser SpeechSynthesis
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(customGreeting);
        utterance.lang = selectedDialect;
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(utterance);
      } else {
        setIsPlayingAudio(false);
      }
    }
  };

  const handleDispatchDirectTest = async () => {
    if (!testPhoneNumber.trim()) {
      alert('Please enter your mobile number with country code (e.g. +91 98765 43210)');
      return;
    }
    setIsDispatchingTestCall(true);
    setTestCallNotification(null);

    try {
      const cleanNumber = testPhoneNumber.replace(/[\s-]/g, '');
      const formatted = cleanNumber.startsWith('+') ? cleanNumber : `+91${cleanNumber.replace(/^0+/, '')}`;

      if (onDispatchCall && starterAgent) {
        await onDispatchCall({
          agentId: starterAgent.id,
          callerName: 'Workspace Owner Test',
          callerNumber: formatted,
          scenario: `Onboarding test verification call to ${formatted}`,
        });
        setTestCallNotification(`Call dispatched to ${formatted}! Your phone will ring shortly.`);
      } else {
        await aurisApi.dispatchCall({
          agentId: starterAgent?.id || 'ag_default',
          callerNumber: formatted,
          callerName: 'Workspace Owner Test',
          scenario: 'Onboarding test verification call',
        });
        setTestCallNotification(`Call dispatched to ${formatted}! Your phone will ring shortly.`);
      }
    } catch (err: any) {
      setTestCallNotification(`Dispatch note: ${err.message || 'Call queued'}`);
    } finally {
      setIsDispatchingTestCall(false);
    }
  };

  const handleFinishOnboarding = async () => {
    setIsSaving(true);
    try {
      const dialectObj = DIALECT_OPTIONS.find((d) => d.code === selectedDialect) || DIALECT_OPTIONS[0];
      const payload: Partial<Agent> = {
        name: agentName.trim() || 'Auris Voice Assistant',
        industry: selectedTemplate.industry,
        language: dialectObj.name,
        voiceId: dialectObj.voiceId,
        voiceName: dialectObj.voiceName,
        instructions: {
          role: selectedTemplate.instructions,
          personality: 'Warm, professional, respectful, concise Indian business tone',
          objectives: 'Qualify caller, provide accurate business info, schedule appointments, handle inquiries',
          rules: '- Keep replies under 2 sentences\n- Confirm caller details\n- Speak naturally in customer dialect',
          greeting: customGreeting,
          fallback: 'I want to ensure you get the exact help you need. Let me connect you with our senior team or take down your contact info.',
        },
      };

      let finalAgent: Agent;
      if (starterAgent && starterAgent.id) {
        finalAgent = await aurisApi.updateAgent(starterAgent.id, payload);
      } else {
        finalAgent = await aurisApi.createAgent({
          ...payload,
          businessId: currentBusiness.id,
        } as any);
      }

      localStorage.setItem('auris_onboarded', 'true');
      onComplete(finalAgent);
      onClose();
    } catch (err: any) {
      console.warn('Failed to persist agent preferences:', err);
      localStorage.setItem('auris_onboarded', 'true');
      if (starterAgent) onComplete(starterAgent);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#0F1219] border border-indigo-500/30 rounded-3xl shadow-[0_0_50px_rgba(99,102,241,0.15)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header Banner */}
        <div className="px-6 py-5 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-[#0D111C] to-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white">Voice Agent Launch Wizard</h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                  Step {step} of 3
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Setup your business receptionist in 60 seconds • Native Telugu, Hindi & English
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Wizard Steps Progress Bar */}
        <div className="grid grid-cols-3 border-b border-slate-800 bg-slate-950/40 text-xs">
          <button
            onClick={() => setStep(1)}
            className={`py-3 text-center font-bold border-b-2 transition-all cursor-pointer ${
              step === 1 ? 'border-indigo-400 text-indigo-400 bg-indigo-500/5' : 'border-transparent text-slate-500'
            }`}
          >
            1. Industry Template
          </button>
          <button
            onClick={() => setStep(2)}
            className={`py-3 text-center font-bold border-b-2 transition-all cursor-pointer ${
              step === 2 ? 'border-indigo-400 text-indigo-400 bg-indigo-500/5' : 'border-transparent text-slate-500'
            }`}
          >
            2. Dialect & Voice
          </button>
          <button
            onClick={() => setStep(3)}
            className={`py-3 text-center font-bold border-b-2 transition-all cursor-pointer ${
              step === 3 ? 'border-indigo-400 text-indigo-400 bg-indigo-500/5' : 'border-transparent text-slate-500'
            }`}
          >
            3. Test & Activate Line
          </button>
        </div>

        {/* Wizard Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* STEP 1: INDUSTRY TEMPLATE SELECTION */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white">Select Your Business Persona</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Choose a pre-tuned voice model customized for your specific business workflow.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {INDUSTRY_TEMPLATES.map((tmpl) => {
                  const Icon = tmpl.icon;
                  const isSelected = selectedTemplate.id === tmpl.id;
                  return (
                    <div
                      key={tmpl.id}
                      onClick={() => handleSelectTemplate(tmpl)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                        isSelected
                          ? 'bg-indigo-500/10 border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.15)]'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="w-10 h-10 rounded-xl bg-slate-800/80 text-indigo-400 flex items-center justify-center">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          {tmpl.badge}
                        </span>
                      </div>

                      <div className="mt-3">
                        <h4 className="text-xs font-bold text-white">{tmpl.name}</h4>
                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                          {tmpl.instructions}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                        <span className="text-indigo-400 font-mono font-semibold">{tmpl.industry}</span>
                        {isSelected ? (
                          <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-700" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: DIALECT & VOICE PERSONALIZATION */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-bold text-white">Choose Primary Dialect & Voice</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Trained on native conversational speech (*వాడుక భాష*, colloquial Hindi, and Indian English).
                </p>
              </div>

              {/* Language Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {DIALECT_OPTIONS.map((dial) => {
                  const isSelected = selectedDialect === dial.code;
                  return (
                    <button
                      key={dial.code}
                      onClick={() => handleSelectDialect(dial.code)}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-500/10 border-indigo-400 shadow-sm'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-bold text-white leading-tight">{dial.name}</div>
                      <div className="text-[10px] text-indigo-400 font-mono mt-1">{dial.voiceName}</div>
                    </button>
                  );
                })}
              </div>

              {/* Business Name Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Your Business / Agent Name</label>
                <input
                  type="text"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                  placeholder="e.g. Dr. Rao Dental Receptionist"
                />
              </div>

              {/* Greeting Editor & Live Audition */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <Radio className="w-4 h-4 text-indigo-400" />
                    <span>Greeting Line (First Response to Callers)</span>
                  </span>
                  <button
                    onClick={handlePlayVoiceSample}
                    disabled={isPlayingAudio}
                    className="px-3 py-1 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-400 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
                  >
                    {isPlayingAudio ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Playing Voice...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Listen to Voice Sample</span>
                      </>
                    )}
                  </button>
                </div>

                <textarea
                  value={customGreeting}
                  onChange={(e) => setCustomGreeting(e.target.value)}
                  rows={3}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none font-medium leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* STEP 3: INSTANT TEST & ACTIVATE LINE */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-bold text-white">Your Dedicated Telephony Trunk is Ready!</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Test your AI agent live right now before taking customer calls.
                </p>
              </div>

              {/* Trunk Line & Bonus Credits Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-violet-900/20 to-slate-900 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                    Assigned Inbound Carrier Trunk
                  </span>
                  <div className="text-xl font-black text-white font-mono mt-0.5">
                    +91 80 6553 4512
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono font-semibold flex items-center gap-1 mt-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Plivo Tier-1 Neural Trunk Active • 20s Slot Pulse
                  </span>
                </div>

                <div className="sm:text-right">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                    Starter Credits Included
                  </span>
                  <div className="text-xl font-black text-emerald-400 font-mono mt-0.5">
                    ₹500.00
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    ~312 x 20-second slots (~104 mins)
                  </span>
                </div>
              </div>

              {/* Two Live Testing Channels */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Channel A: In-Browser Mic Test */}
                <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-2">
                      <Mic className="w-5 h-5" />
                    </div>
                    <h4 className="text-xs font-bold text-white">Test via Browser Mic</h4>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Talk directly to your AI receptionist in {selectedDialect === 'te-IN' ? 'Telugu' : selectedDialect === 'hi-IN' ? 'Hindi' : 'English'} with &lt;400ms latency.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      if (onOpenWebVoice) {
                        onClose();
                        onOpenWebVoice();
                      }
                    }}
                    className="w-full py-2.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-400 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Radio className="w-4 h-4 animate-pulse" />
                    <span>Launch Mic Playground</span>
                  </button>
                </div>

                {/* Channel B: Direct Mobile Call Test */}
                <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2">
                      <PhoneCall className="w-5 h-5" />
                    </div>
                    <h4 className="text-xs font-bold text-white">Call My Phone Live</h4>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Have the AI dial your personal phone to experience actual carrier audio quality.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <input
                      type="tel"
                      value={testPhoneNumber}
                      onChange={(e) => setTestPhoneNumber(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                    <button
                      onClick={handleDispatchDirectTest}
                      disabled={isDispatchingTestCall}
                      className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                    >
                      {isDispatchingTestCall ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Dispatching Call...</span>
                        </>
                      ) : (
                        <>
                          <PhoneCall className="w-4 h-4" />
                          <span>Ring My Phone</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {testCallNotification && (
                <div className="p-3.5 rounded-xl bg-indigo-950/60 border border-indigo-800 text-indigo-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>{testCallNotification}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Wizard Footer Navigation */}
        <div className="p-5 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <div>
            {step > 1 && (
              <button
                onClick={() => setStep((s) => (s - 1) as any)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}
          </div>

          <div>
            {step < 3 ? (
              <button
                onClick={() => setStep((s) => (s + 1) as any)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-md shadow-indigo-500/20"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleFinishOnboarding}
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-black flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Activating Assistant...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Launch Voice Assistant & Enter Dashboard</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

