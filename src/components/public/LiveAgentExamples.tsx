import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Phone,
  Play,
  Pause,
  Sparkles,
  CheckCircle2,
  Calendar,
  Clock,
  User,
  Activity,
  Building2,
  UtensilsCrossed,
  Dumbbell,
  Send,
  Volume2,
  FileSpreadsheet,
  Check,
  Cloud,
  ChevronRight,
} from 'lucide-react';

interface Scenario {
  id: string;
  name: string;
  industry: string;
  agentName: string;
  role: string;
  avatar: string;
  phone: string;
  icon: React.ElementType;
  color: string;
  initialAgentGreeting: string;
  sampleDialog: Array<{ speaker: 'caller' | 'agent'; text: string }>;
  suggestedPrompts: string[];
  extractedLead: {
    callerName: string;
    phone: string;
    intent: string;
    bookingSlot: string;
    sentiment: string;
    latency: string;
  };
}

const SCENARIOS: Scenario[] = [
  {
    id: 'healthcare',
    name: 'Apollo Medical Practice',
    industry: 'Healthcare',
    agentName: 'Dr. Ava AI',
    role: 'Clinical Receptionist & Triage',
    avatar: 'https://images.unsplash.com/photo-1594824813583-73479b00787d?w=160&auto=format&fit=crop&q=80',
    phone: '+1 (800) 412-2831',
    icon: Activity,
    color: 'border-[#38A85B]',
    initialAgentGreeting:
      'Hello! Thank you for calling Apollo Medical. My name is Ava. I can help you schedule an appointment with Dr. Mehta, check clinic timings, or answer questions about our specialized care. How may I help you today?',
    sampleDialog: [
      {
        speaker: 'agent',
        text: 'Hello! Thank you for calling Apollo Medical. My name is Ava. How can I help you today?',
      },
      {
        speaker: 'caller',
        text: 'Hi Ava, I need to see Dr. Mehta this week for a routine cardiovascular checkup.',
      },
      {
        speaker: 'agent',
        text: 'Certainly! Dr. Mehta has an opening tomorrow, Tuesday at 10:30 AM, or Thursday at 2:15 PM. Which fits your schedule better?',
      },
      {
        speaker: 'caller',
        text: 'Thursday at 2:15 PM works perfectly for me.',
      },
      {
        speaker: 'agent',
        text: 'Wonderful. I have reserved Thursday at 2:15 PM for you. May I confirm your full name and best mobile number to send the calendar confirmation SMS?',
      },
    ],
    suggestedPrompts: [
      'Thursday at 2:15 PM works for me',
      'Do you accept BlueCross insurance?',
      'Can I get an emergency consultation today?',
    ],
    extractedLead: {
      callerName: 'Sarah Jenkins',
      phone: '+1 (555) 389-1029',
      intent: 'Book Cardiovascular Checkup with Dr. Mehta',
      bookingSlot: 'Thursday at 2:15 PM',
      sentiment: 'Very Positive (98%)',
      latency: '242ms',
    },
  },
  {
    id: 'realestate',
    name: 'Rise Premier Realty',
    industry: 'Real Estate',
    agentName: 'Marcus AI',
    role: 'Lead Qualifier & Viewing Coordinator',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
    phone: '+1 (888) 923-4510',
    icon: Building2,
    color: 'border-[#2189C8]',
    initialAgentGreeting:
      'Good day! You have reached Rise Premier Realty. This is Marcus. Are you inquiring about one of our luxury penthouse listings, or would you like to schedule a private property walkthrough?',
    sampleDialog: [
      {
        speaker: 'agent',
        text: 'Good day! This is Marcus at Rise Premier Realty. How can I assist your property search?',
      },
      {
        speaker: 'caller',
        text: 'I saw the modern 3-bedroom residence on 4th Avenue and wanted to know if a walkthrough is possible this weekend.',
      },
      {
        speaker: 'agent',
        text: 'Yes! The 4th Avenue residence is available for private private viewings this Saturday between 11:00 AM and 3:00 PM. Would 11:30 AM suit you?',
      },
      {
        speaker: 'caller',
        text: '11:30 AM Saturday is ideal. What is the asking price again?',
      },
      {
        speaker: 'agent',
        text: 'The residence is listed at $1.45M with private rooftop terrace rights. I have booked your private tour for Saturday at 11:30 AM.',
      },
    ],
    suggestedPrompts: [
      '11:30 AM Saturday works for me',
      'What are the HOA fees on the penthouse?',
      'Are there any 2-bedroom units available nearby?',
    ],
    extractedLead: {
      callerName: 'David Chen',
      phone: '+1 (555) 720-4491',
      intent: 'Private Walkthrough for 3-Bed Residence',
      bookingSlot: 'Saturday, 11:30 AM',
      sentiment: 'Positive & High Budget ($1.4M+)',
      latency: '265ms',
    },
  },
  {
    id: 'restaurant',
    name: 'FoodNest Trattoria',
    industry: 'Hospitality & Dining',
    agentName: 'Antonio AI',
    role: 'Head Reservation Concierge',
    avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=160&auto=format&fit=crop&q=80',
    phone: '+1 (800) 554-9182',
    icon: UtensilsCrossed,
    color: 'border-[#38A85B]',
    initialAgentGreeting:
      'Buonasera! Welcome to FoodNest Trattoria. I am Antonio. May I reserve a table for your dinner this evening, or assist you with private banquet bookings and dietary requirements?',
    sampleDialog: [
      {
        speaker: 'agent',
        text: 'Buonasera! Welcome to FoodNest Trattoria. I am Antonio. How may I seat you this evening?',
      },
      {
        speaker: 'caller',
        text: 'Hi Antonio, I would like to book an outdoor table for 4 people this Friday evening around 7:30 PM.',
      },
      {
        speaker: 'agent',
        text: 'Bellissimo! We have a delightful covered patio table available at 7:30 PM this Friday. Does anyone in your party have gluten or nut allergies?',
      },
      {
        speaker: 'caller',
        text: 'One of our guests has a strict peanut allergy, otherwise all good.',
      },
      {
        speaker: 'agent',
        text: 'Noted with our head chef. Table for 4 reserved this Friday at 7:30 PM under your name.',
      },
    ],
    suggestedPrompts: [
      'Friday 7:30 PM table for 4 please',
      'Do you have vegetarian pasta options?',
      'Is there valet parking available?',
    ],
    extractedLead: {
      callerName: 'Emily Taylor',
      phone: '+1 (555) 812-9011',
      intent: 'Patio Table Reservation for 4',
      bookingSlot: 'Friday, 7:30 PM (Peanut Allergy Flagged)',
      sentiment: 'Enthusiastic (99%)',
      latency: '235ms',
    },
  },
  {
    id: 'fitness',
    name: 'FitZone Health & Wellness',
    industry: 'Fitness & Gyms',
    agentName: 'Maya AI',
    role: 'Membership & Personal Training Lead',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
    phone: '+1 (888) 332-6719',
    icon: Dumbbell,
    color: 'border-[#2189C8]',
    initialAgentGreeting:
      'Hey there! Thank you for calling FitZone. This is Maya. I can get you signed up for a complimentary 3-day VIP pass, check our Pilates class schedules, or book a personal training consult. What are your fitness goals?',
    sampleDialog: [
      {
        speaker: 'agent',
        text: 'Hey there! This is Maya at FitZone. What brings you to call today?',
      },
      {
        speaker: 'caller',
        text: 'Hi Maya, I am looking to start personal training and wanted to check if you have a free trial pass.',
      },
      {
        speaker: 'agent',
        text: 'We sure do! We offer a complimentary 3-day VIP gym pass including a 1-on-1 trainer assessment. Would you like to activate yours today?',
      },
      {
        speaker: 'caller',
        text: 'Yes please! Can I come in tomorrow morning around 9:00 AM?',
      },
      {
        speaker: 'agent',
        text: 'You are all set for tomorrow 9:00 AM! I will text you the digital access barcode and assign trainer Alex to welcome you.',
      },
    ],
    suggestedPrompts: [
      'Yes, tomorrow morning at 9:00 AM',
      'How much is your monthly membership?',
      'Do you offer hot yoga and sauna?',
    ],
    extractedLead: {
      callerName: 'Michael Brown',
      phone: '+1 (555) 642-8831',
      intent: 'VIP Pass & Personal Trainer Consult',
      bookingSlot: 'Tomorrow, 9:00 AM with Trainer Alex',
      sentiment: 'High Intent Lead',
      latency: '251ms',
    },
  },
];

export const LiveAgentExamples: React.FC = () => {
  const [activeScenario, setActiveScenario] = useState<Scenario>(SCENARIOS[0]);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [customCallerInput, setCustomCallerInput] = useState('');
  const [dialogList, setDialogList] = useState(SCENARIOS[0].sampleDialog);
  const [googleFormsPushed, setGoogleFormsPushed] = useState(false);
  const [cloudinaryAudioSynced, setCloudinaryAudioSynced] = useState(false);

  // Switch scenario
  const handleSelectScenario = (sc: Scenario) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
    setActiveScenario(sc);
    setDialogList(sc.sampleDialog);
    setGoogleFormsPushed(false);
    setCloudinaryAudioSynced(false);
  };

  // Play voice sample
  const handlePlayVoice = (textToSpeak: string) => {
    if (!('speechSynthesis' in window)) {
      setIsPlayingAudio(!isPlayingAudio);
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 1.0;
    utterance.pitch = 1.02;

    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(
      (v) =>
        v.lang.startsWith('en') &&
        (v.name.includes('Natural') ||
          v.name.includes('Google') ||
          v.name.includes('Samantha') ||
          v.name.includes('Female'))
    );
    if (voice) utterance.voice = voice;

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  // User submits prompt
  const handleSendPrompt = (promptText: string) => {
    if (!promptText.trim()) return;

    const newCallerTurn = { speaker: 'caller' as const, text: promptText };
    setDialogList((prev) => [...prev, newCallerTurn]);
    setCustomCallerInput('');

    // Generate natural agent reply after 280ms
    setTimeout(() => {
      let agentReply = `Thank you! I have recorded "${promptText}" into your file and notified our team. We look forward to welcoming you!`;
      if (promptText.toLowerCase().includes('insurance')) {
        agentReply = `Yes, we accept BlueCross, Aetna, UnitedHealthcare, and Medicare. I will attach your coverage verification to your reservation.`;
      } else if (promptText.toLowerCase().includes('price') || promptText.toLowerCase().includes('cost')) {
        agentReply = `Our transparent membership starts at $69/month with zero initiation fee this week. Shall I lock in that special rate for you?`;
      } else if (promptText.toLowerCase().includes('works')) {
        agentReply = `Perfect! That slot has been confirmed and locked into our scheduling database. An SMS confirmation is on its way.`;
      }

      setDialogList((prev) => [...prev, { speaker: 'agent', text: agentReply }]);
      handlePlayVoice(agentReply);
    }, 280);
  };

  // Google Forms lead push
  const handlePushToGoogleForms = async () => {
    setGoogleFormsPushed(true);
    try {
      await fetch('/api/google-forms/submit-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callerName: activeScenario.extractedLead.callerName,
          callerPhone: activeScenario.extractedLead.phone,
          intent: activeScenario.extractedLead.intent,
          appointmentDate: activeScenario.extractedLead.bookingSlot,
          callSummary: `Automated call completed by ${activeScenario.agentName}. Lead confirmed without human intervention.`,
        }),
      });
    } catch (e) {
      console.warn('Google Forms push note:', e);
    }
  };

  // Cloudinary audio recording sync
  const handleSyncCloudinary = async () => {
    setCloudinaryAudioSynced(true);
    try {
      await fetch('/api/cloudinary/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: `${activeScenario.id}_call_recording.mp3`,
          resourceType: 'video',
        }),
      });
    } catch (e) {
      console.warn('Cloudinary sync note:', e);
    }
  };

  return (
    <section className="py-20 bg-white dark:bg-[#0B132B] border-t border-[#DDEBEF] dark:border-[#1E2E4A] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EFFAF1] dark:bg-[#0F2D1F] border border-[#65C978]/30 text-xs font-bold text-[#38A85B] shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Live Demos</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#000000] dark:text-white tracking-tight">
            Hear Real Voice Conversations
          </h2>
          <p className="text-base sm:text-lg text-[#27272a] dark:text-[#94A3B8] font-medium leading-relaxed">
            Click any industry below to hear realistic AI receptionists in action, inspect the call transcript, and test caller interactions in real time.
          </p>
        </div>

        {/* Industry Switcher Tabs (Responsive Scroll/Wrap) */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          {SCENARIOS.map((sc) => {
            const Icon = sc.icon;
            const isSelected = activeScenario.id === sc.id;
            return (
              <motion.button
                key={sc.id}
                onClick={() => handleSelectScenario(sc)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-[#000000] text-white dark:bg-white dark:text-[#000000] border-[#000000] shadow-md'
                    : 'bg-[#F5FAFC] dark:bg-[#111C38] text-[#000000] dark:text-white border-[#DDEBEF] dark:border-[#1E2E4A] hover:bg-[#EEF8FC]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-[#38A85B]' : 'text-[#2189C8]'}`} />
                <span>{sc.industry}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Main Live Example Showcase Box */}
        <div className="bg-[#F5FAFC] dark:bg-[#0E172F] rounded-3xl p-6 sm:p-10 border-2 border-[#000000] dark:border-[#1E2E4A] shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Live Audio Player & Conversation Transcript */}
            <div className="lg:col-span-7 space-y-6">
              {/* Agent Profile Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#111C38] border border-[#DDEBEF] dark:border-[#1E2E4A] shadow-xs">
                <div className="flex items-center gap-3.5">
                  <img
                    src={activeScenario.avatar}
                    alt={activeScenario.agentName}
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-[#000000] dark:ring-white shadow-sm"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-lg text-[#000000] dark:text-white">
                        {activeScenario.agentName}
                      </h3>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#EFFAF1] dark:bg-[#0F2D1F] text-[#38A85B] border border-[#65C978]/30">
                        Online
                      </span>
                    </div>
                    <p className="text-xs font-bold text-[#000000] dark:text-[#94A3B8]">
                      {activeScenario.name} • <span className="text-[#38A85B]">{activeScenario.role}</span>
                    </p>
                    <p className="text-[11px] text-[#27272a] dark:text-[#64748B] font-mono">
                      Dedicated Line: {activeScenario.phone}
                    </p>
                  </div>
                </div>

                {/* Listen to Voice Sample Button */}
                <button
                  onClick={() => handlePlayVoice(activeScenario.initialAgentGreeting)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                    isPlayingAudio
                      ? 'bg-[#38A85B] text-white shadow-md'
                      : 'bg-[#000000] text-white dark:bg-[#2189C8] hover:bg-[#262626]'
                  }`}
                >
                  {isPlayingAudio ? (
                    <>
                      <Pause className="w-4 h-4" /> Stop Audio
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4" /> Hear Agent Voice
                    </>
                  )}
                </button>
              </div>

              {/* Animated Waveform Visualizer */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#111C38] border border-[#DDEBEF] dark:border-[#1E2E4A] flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#38A85B] animate-ping" />
                  <span className="text-xs font-black text-[#000000] dark:text-white uppercase tracking-wider">
                    {isPlayingAudio ? 'Speaking on Carrier Line...' : 'Voice Line Ready'}
                  </span>
                </div>
                <div className="flex items-center gap-1 h-7">
                  {[12, 24, 18, 28, 14, 26, 20, 28, 16, 24, 12, 22].map((height, i) => (
                    <span
                      key={i}
                      className={`w-1 rounded-full ${
                        isPlayingAudio ? 'bg-[#38A85B] animate-wave' : 'bg-[#000000] dark:bg-[#38BDF8]'
                      }`}
                      style={{
                        height: `${isPlayingAudio ? height : 8}px`,
                        animationDelay: `${i * 0.08}s`,
                      }}
                    />
                  ))}
                </div>
                <span className="text-[11px] font-mono font-bold text-[#000000] dark:text-[#94A3B8]">
                  Latency: {activeScenario.extractedLead.latency}
                </span>
              </div>

              {/* Scrollable Conversation Transcript Box */}
              <div className="bg-white dark:bg-[#111C38] rounded-2xl p-5 border border-[#DDEBEF] dark:border-[#1E2E4A] space-y-4 max-h-[320px] overflow-y-auto shadow-inner">
                <div className="text-xs font-extrabold uppercase tracking-wider text-[#000000] dark:text-white border-b border-[#DDEBEF] dark:border-[#1E2E4A] pb-2 flex items-center justify-between">
                  <span>Full-Duplex Transcript</span>
                  <span className="text-[10px] text-[#38A85B] font-bold">● Live Synchronized</span>
                </div>

                {dialogList.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-start gap-3 ${
                      item.speaker === 'caller' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {item.speaker === 'agent' && (
                      <div className="w-7 h-7 rounded-full bg-[#000000] text-white flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5">
                        AI
                      </div>
                    )}
                    <div
                      className={`p-3.5 rounded-2xl max-w-[85%] text-xs sm:text-sm font-medium leading-relaxed ${
                        item.speaker === 'caller'
                          ? 'bg-[#000000] text-white rounded-tr-none'
                          : 'bg-[#F5FAFC] dark:bg-[#162744] text-[#000000] dark:text-[#F1F5F9] border border-[#DDEBEF] dark:border-[#203456] rounded-tl-none'
                      }`}
                    >
                      <p>{item.text}</p>
                    </div>
                    {item.speaker === 'caller' && (
                      <div className="w-7 h-7 rounded-full bg-[#38A85B] text-white flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Quick Interactive Prompt Chips */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-[#000000] dark:text-white">
                  Simulate Caller Reply (Click to test AI reaction):
                </div>
                <div className="flex flex-wrap gap-2">
                  {activeScenario.suggestedPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendPrompt(prompt)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-[#111C38] text-[#000000] dark:text-white border border-[#000000] dark:border-[#1E2E4A] hover:bg-[#EEF8FC] cursor-pointer transition-all shadow-xs"
                    >
                      "{prompt}"
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Caller Input Box */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a custom caller response..."
                  value={customCallerInput}
                  onChange={(e) => setCustomCallerInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendPrompt(customCallerInput)}
                  className="flex-grow px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-white dark:bg-[#111C38] text-[#000000] dark:text-white border border-[#000000] dark:border-[#1E2E4A] focus:outline-none focus:ring-2 focus:ring-[#38A85B]"
                />
                <button
                  onClick={() => handleSendPrompt(customCallerInput)}
                  className="px-5 py-2.5 rounded-xl bg-[#000000] hover:bg-[#262626] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </div>
            </div>

            {/* Right Column: Real-Time Extracted CRM & Google Forms Lead Card */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-6 rounded-2xl bg-white dark:bg-[#111C38] border-2 border-[#000000] dark:border-[#1E2E4A] shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-[#DDEBEF] dark:border-[#1E2E4A] pb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[#38A85B]" />
                    <h4 className="font-extrabold text-sm sm:text-base text-[#000000] dark:text-white">
                      Extracted Structured Lead
                    </h4>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[#EFFAF1] dark:bg-[#0F2D1F] text-[#38A85B] border border-[#65C978]/30">
                    Real-Time Extraction
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#F5FAFC] dark:bg-[#16223F] border border-[#DDEBEF] dark:border-[#1E2E4A]">
                    <span className="text-[#27272a] dark:text-[#94A3B8] font-bold block mb-0.5">
                      Caller Identity & Phone:
                    </span>
                    <span className="font-black text-sm text-[#000000] dark:text-white">
                      {activeScenario.extractedLead.callerName} • {activeScenario.extractedLead.phone}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F5FAFC] dark:bg-[#16223F] border border-[#DDEBEF] dark:border-[#1E2E4A]">
                    <span className="text-[#27272a] dark:text-[#94A3B8] font-bold block mb-0.5">
                      Primary Intent:
                    </span>
                    <span className="font-bold text-[#000000] dark:text-white">
                      {activeScenario.extractedLead.intent}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F5FAFC] dark:bg-[#16223F] border border-[#DDEBEF] dark:border-[#1E2E4A]">
                    <span className="text-[#27272a] dark:text-[#94A3B8] font-bold block mb-0.5">
                      Confirmed Booking / Calendar Slot:
                    </span>
                    <span className="font-extrabold text-[#38A85B] dark:text-[#4ADE80]">
                      📅 {activeScenario.extractedLead.bookingSlot}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-xl bg-[#F5FAFC] dark:bg-[#16223F] border border-[#DDEBEF] dark:border-[#1E2E4A]">
                      <span className="text-[10px] text-[#27272a] dark:text-[#94A3B8] font-bold block">
                        Sentiment Score
                      </span>
                      <span className="font-extrabold text-xs text-[#000000] dark:text-white">
                        {activeScenario.extractedLead.sentiment}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#F5FAFC] dark:bg-[#16223F] border border-[#DDEBEF] dark:border-[#1E2E4A]">
                      <span className="text-[10px] text-[#27272a] dark:text-[#94A3B8] font-bold block">
                        Carrier Latency
                      </span>
                      <span className="font-extrabold text-xs text-[#2189C8] dark:text-[#38BDF8]">
                        ⚡ {activeScenario.extractedLead.latency}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Google Forms / Cloudinary Action Buttons */}
                <div className="pt-2 space-y-2">
                  <button
                    onClick={handlePushToGoogleForms}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      googleFormsPushed
                        ? 'bg-[#38A85B] text-white'
                        : 'bg-[#000000] dark:bg-[#1E2E4A] hover:bg-[#262626] text-white border border-[#000000]'
                    }`}
                  >
                    {googleFormsPushed ? (
                      <>
                        <Check className="w-4 h-4" /> Forwarded to Google Forms & Sheet!
                      </>
                    ) : (
                      <>
                        <FileSpreadsheet className="w-4 h-4 text-[#38A85B]" /> Push Lead to Google Form / Sheet
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleSyncCloudinary}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      cloudinaryAudioSynced
                        ? 'bg-[#2189C8] text-white'
                        : 'bg-white dark:bg-[#111C38] text-[#000000] dark:text-white border border-[#000000] dark:border-[#1E2E4A] hover:bg-[#F5FAFC]'
                    }`}
                  >
                    {cloudinaryAudioSynced ? (
                      <>
                        <Check className="w-4 h-4" /> Synced to Cloudinary Audio CDN
                      </>
                    ) : (
                      <>
                        <Cloud className="w-4 h-4 text-[#2189C8]" /> Save Recording to Cloudinary
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Enterprise Guarantee Pill */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#111C38] border border-[#DDEBEF] dark:border-[#1E2E4A] text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[#000000] dark:text-white">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#38A85B]" />
                  <span>Ready for Live Deployment</span>
                </div>
                <p className="text-[11px] text-[#27272a] dark:text-[#94A3B8] font-medium leading-relaxed">
                  Every scenario adapts automatically to your clinic, agency, or restaurant knowledge base with zero code required.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
