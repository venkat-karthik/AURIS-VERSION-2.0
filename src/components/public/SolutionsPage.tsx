import React from 'react';
import { motion } from 'motion/react';
import {
  PhoneCall,
  UserCheck,
  CalendarCheck,
  Clock,
  Check,
  ArrowRight,
  Globe2,
  Sparkles,
  ShieldCheck,
  Zap,
  Building2,
  Activity,
  Phone,
  Radio,
  Cloud,
} from 'lucide-react';

interface SolutionsPageProps {
  onSelectSolution: (slug: string) => void;
  onGetStarted: () => void;
}

export const SolutionsPage: React.FC<SolutionsPageProps> = ({ onGetStarted }) => {
  const solutions = [
    {
      title: 'Inbound Receptionist & Appointment Booking',
      slug: 'receptionist',
      icon: PhoneCall,
      color: 'sapphire',
      tag: 'Real Estate & Clinics',
      headline: 'Answer 100% of simultaneous inbound calls on the first ring.',
      desc: 'Greets callers warmly in Hindi, Telugu, or English, answers FAQs from your knowledge base, quotes pricing, and books confirmed slots directly into Google Calendar.',
      points: [
        'Zero busy signals during peak morning consultation hours',
        'Collects caller name, requirements, and callback confirmation',
        'Warm transfer to staff mobile numbers for VIP or urgent cases',
        'Dual-track recording automatically archived to Cloudinary',
      ],
    },
    {
      title: 'Speed-to-Lead Outbound Qualification',
      slug: 'lead-qualification',
      icon: UserCheck,
      color: 'cobalt',
      tag: 'Real Estate & B2B Sales',
      headline: 'Engage web form inquiries within 30 seconds of submission.',
      desc: 'When a prospect fills out a website form, Auris dispatches an outbound call through Plivo India while intent is fresh. Qualifies budget, readiness, and preferred location.',
      points: [
        'Sub-30-second speed-to-lead outbound triggering',
        'Dynamic qualification questionnaire with real-time scoring',
        'Pushes qualified lead tags & transcripts to CRM & WhatsApp',
        'Instant SMS confirmation with brochure download link',
      ],
    },
    {
      title: 'Automated Site Visit & Calendar Scheduling',
      slug: 'appointments',
      icon: CalendarCheck,
      color: 'purple',
      tag: 'Property Tours & Consultations',
      headline: 'Turn conversations directly into verified calendar events.',
      desc: 'Two-way sync with Google Calendar. The agent checks open slots, books the client, handles reschedules over the phone, and sends 24-hour reminder confirmations.',
      points: [
        'Conflict-free real-time slot checking across staff calendars',
        'Reschedules & cancellations handled autonomously',
        'Automated 24-hour pre-visit verification calls to cut no-shows',
        'Eliminates receptionist phone tag completely',
      ],
    },
    {
      title: '24/7 After-Hours Emergency Support',
      slug: 'after-hours',
      icon: Clock,
      color: 'sapphire',
      tag: 'Healthcare & Facilities',
      headline: 'Your business stays open even when your office is closed.',
      desc: 'Capture late-night inquiries, emergency service requests, and weekend calls. Customers speak with an empathetic voice assistant rather than hitting a voicemail box.',
      points: [
        'Triages urgent emergencies vs next-business-day items',
        'Answers questions directly from verified PDF knowledge store',
        'Delivers morning summary digest to management via email/SMS',
        'Reduces client churn and captures high-value weekend leads',
      ],
    },
  ];

  const networkPops = [
    { city: 'Bangalore (KA)', provider: 'Plivo India Primary SIP POP', ping: '12ms', status: 'Online' },
    { city: 'Mumbai (MH)', provider: 'Western Telecom Carrier Mesh', ping: '18ms', status: 'Online' },
    { city: 'Delhi-NCR (DL)', provider: 'Northern Carrier POP', ping: '22ms', status: 'Online' },
    { city: 'Hyderabad (TS)', provider: 'Deccan Carrier Mesh', ping: '16ms', status: 'Online' },
    { city: 'Singapore (SG)', provider: 'Southeast Asia Voice Gateway', ping: '42ms', status: 'Online' },
    { city: 'Frankfurt (EU)', provider: 'European Voice Edge Node', ping: '110ms', status: 'Online' },
  ];

  return (
    <div className="py-16 bg-white dark:bg-[#021024] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#052659]/15 dark:bg-[#052659]/40 border border-[#1D64C2]/30 dark:border-[#7DA0CA]/30 text-xs font-bold text-[#1D64C2] dark:text-[#C1E8FF] shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Turnkey B2B Voice Solutions</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-slate-950 dark:text-white tracking-tight">
            Conversational Workflows Tailored to Your Industry
          </h1>

          <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            Eliminate phone bottlenecks with autonomous voice agents powered by Cartesia Sonic and Sarvam AI Indic models.
          </p>
        </motion.div>

        {/* 4 Solutions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {solutions.map((sol, i) => {
            const Icon = sol.icon;
            return (
              <motion.div
                key={sol.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="bg-white dark:bg-[#052659]/30 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-[#5483B3]/25 shadow-xs hover:border-[#7DA0CA]/50 transition-all flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-[#052659]/15 dark:bg-[#052659]/60 text-[#1D64C2] dark:text-[#C1E8FF] flex items-center justify-center font-bold">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#021024]/60 text-slate-600 dark:text-[#7DA0CA]">
                      {sol.tag}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-xl font-black text-slate-950 dark:text-white mb-1">
                      {sol.title}
                    </h2>
                    <p className="text-xs font-bold text-[#1D64C2] dark:text-[#C1E8FF]">
                      {sol.headline}
                    </p>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {sol.desc}
                  </p>

                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-[#5483B3]/20">
                    {sol.points.map((pt, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                        <Check className="w-3.5 h-3.5 text-[#1D64C2] dark:text-[#C1E8FF] flex-shrink-0 mt-0.5" />
                        <span className="leading-snug">{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-[#5483B3]/20 flex items-center justify-between">
                  <button
                    onClick={onGetStarted}
                    className="text-xs font-bold text-[#1D64C2] dark:text-[#C1E8FF] hover:underline flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Deploy this Workflow</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] text-slate-400 font-mono">Setup in ~5 mins</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Carrier POP & Infrastructure Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white dark:bg-[#052659]/30 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-[#5483B3]/25 shadow-sm space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#1D64C2] dark:text-[#C1E8FF] uppercase tracking-wider mb-1">
                <Globe2 className="w-4 h-4" />
                <span>Multi-Region Carrier Telephony Mesh</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white">
                Direct Indian & Global Telephony Edge Nodes
              </h2>
            </div>
            <span className="text-xs font-mono text-[#1D64C2] dark:text-[#C1E8FF] bg-[#052659]/15 dark:bg-[#052659]/60 px-3 py-1 rounded-full font-bold border border-[#1D64C2]/30 dark:border-[#7DA0CA]/30 self-start sm:self-auto">
              Overall SLA: 99.99% Uptime
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {networkPops.map((pop, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#021024]/60 border border-slate-200/80 dark:border-[#5483B3]/25 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#C1E8FF] shadow-[0_0_8px_#C1E8FF] animate-pulse" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{pop.city}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">{pop.provider}</p>
                </div>
                <span className="text-xs font-mono font-bold text-[#1D64C2] dark:text-[#C1E8FF]">
                  {pop.ping}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
