import React from 'react';
import { PhoneCall, UserCheck, CalendarCheck, Headphones, Megaphone, Clock, Check, ArrowRight } from 'lucide-react';

interface SolutionsPageProps {
  onSelectSolution: (slug: string) => void;
  onGetStarted: () => void;
}

export const SolutionsPage: React.FC<SolutionsPageProps> = ({ onSelectSolution, onGetStarted }) => {
  const solutions = [
    {
      title: 'Inbound AI Receptionist',
      slug: 'receptionist',
      icon: PhoneCall,
      color: '#2189C8',
      headline: 'Never let another high-intent client go to voicemail.',
      desc: 'Answer 100% of simultaneous incoming calls on the first ring. Answers common queries, quotes pricing, verifies business hours, and routes urgent cases to your staff.',
      points: [
        'Handles peak hour call spikes without busy signals',
        'Collects caller name, reason for visit, and contact details',
        'Live warm transfer to designated on-duty numbers',
        'Custom greeting matching your exact front-desk script',
      ],
    },
    {
      title: 'Outbound Lead Qualification',
      slug: 'lead-qualification',
      icon: UserCheck,
      color: '#38A85B',
      headline: 'Engage web inquiries within 30 seconds of submission.',
      desc: 'When a prospect fills out your website form, Auris calls them instantly while intent is high. Qualifies budget, readiness, and needs before booking them onto your calendar.',
      points: [
        'Instant speed-to-lead outbound triggering',
        'Dynamic qualification questionnaire with scoring',
        'Pushes lead transcripts and tags directly to HubSpot & Salesforce',
        'Automatic SMS recap with next steps',
      ],
    },
    {
      title: 'Automated Appointment Scheduling',
      slug: 'appointments',
      icon: CalendarCheck,
      color: '#2189C8',
      headline: 'Turn conversations directly into booked calendar events.',
      desc: 'Direct two-way calendar sync with Google Calendar and Outlook. The agent finds mutually open slots, books the client, and sends instant calendar invitations.',
      points: [
        'Conflict-free real-time calendar slot lookups',
        'Handles reschedules and cancellations over the phone',
        'Automated 24-hour pre-appointment confirmation calls',
        'Eliminates front-desk scheduling phone tag',
      ],
    },
    {
      title: '24/7 After-Hours Support',
      slug: 'after-hours',
      icon: Clock,
      color: '#38A85B',
      headline: 'Your business stays open even when your office is closed.',
      desc: 'Capture late-night inquiries, emergency dispatch requests, and weekend questions. Your customers speak to an empathetic voice, not a static voicemail beep.',
      points: [
        'Triages urgent emergencies vs next-business-day items',
        'Provides instant answers from your attached Knowledge Base',
        'Sends morning call digest to managers',
        'Significantly reduces customer churn and frustration',
      ],
    },
  ];

  return (
    <div className="py-16 bg-[#F5FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#123047] tracking-tight">
            Conversational Solutions Designed for Business Growth
          </h1>
          <p className="text-base text-[#52636D]">
            Explore how Auris replaces repetitive phone friction with autonomous, intelligent voice workflows tailored to your operational goals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {solutions.map((sol) => {
            const Icon = sol.icon;
            return (
              <div
                key={sol.slug}
                className="bg-white rounded-3xl p-8 border border-[#DDEBEF] shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xs"
                      style={{ backgroundColor: sol.color }}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#123047]">{sol.title}</h3>
                      <p className="text-xs text-[#82919A]">{sol.headline}</p>
                    </div>
                  </div>

                  <p className="text-sm text-[#52636D] leading-relaxed">
                    {sol.desc}
                  </p>

                  <div className="space-y-2 pt-2 border-t border-[#DDEBEF]">
                    {sol.points.map((pt, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-[#123047]">
                        <Check className="w-4 h-4 text-[#38A85B] flex-shrink-0" />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <button
                    onClick={onGetStarted}
                    className="text-xs font-bold text-[#2189C8] hover:text-[#123047] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    Deploy this Solution
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] text-[#82919A] font-medium">Ready in ~5 minutes</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
