import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronDown,
  HelpCircle,
  Sparkles,
  PhoneCall,
  Clock,
  ShieldCheck,
  CreditCard,
  Zap,
} from 'lucide-react';

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
  highlight?: boolean;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: 'cancel-anytime',
    question: 'Can I cancel anytime?',
    answer:
      'Yes, absolutely. All Auris subscriptions are billed on a flexible monthly or annual basis with zero lock-in contracts. You can cancel, downgrade, or upgrade your plan anytime directly from the Billing dashboard with a single click. When you cancel, your phone lines and voice agents remain active until the end of your current prepaid billing cycle, and no further automatic charges will occur.',
    category: 'Billing & Plans',
    highlight: true,
  },
  {
    id: 'billing-cycles',
    question: 'How do monthly vs. annual billing cycles work?',
    answer:
      'We offer both Monthly and Annual Commit billing cycles: \n\n• Monthly Billing: Provides maximum operational agility with month-to-month auto-renewal, allowing you to scale up or down without long-term contracts (Starter at ₹4,999/mo, Growth & Real Estate at ₹7,850/mo).\n\n• Annual Commit: Billed once yearly upfront, granting an automatic 20% discount (Starter at ₹3,999/mo equivalent, Growth & Real Estate at ₹6,280/mo equivalent). \n\nYou can toggle between monthly and annual billing anytime at the top of the pricing page or switch cycles in your Billing dashboard. Upgrades take effect immediately with pro-rated billing adjustments.',
    category: 'Billing & Plans',
    highlight: true,
  },
  {
    id: 'payment-methods',
    question: 'What payment methods are supported?',
    answer:
      'We support all major Indian and international payment methods processed through Razorpay PCI-DSS Level 1 certified gateway: \n\n• UPI: Instant zero-convenience-fee payment via Google Pay, PhonePe, Paytm, BHIM, and any bank VPA.\n• Credit & Debit Cards: Visa, MasterCard, RuPay, American Express, and Diners Club with tokenized security.\n• NetBanking: Direct bank integration across 50+ Indian commercial banks (HDFC, ICICI, SBI, Axis, Kotak, etc.).\n• UPI Autopay & Card e-Mandates: Seamless recurring monthly billing with 24-hour pre-debit SMS alerts.\n• NEFT / RTGS & Wire Transfers: Available for Business Scale and Enterprise annual accounts with automated PO and GST tax reconciliation.',
    category: 'Billing & Plans',
    highlight: true,
  },
  {
    id: 'concurrent-calls',
    question: 'What counts as a concurrent call?',
    answer:
      'A concurrent call is any inbound or outbound telephone session actively connected to an Auris AI agent at the exact same second. For instance, on our Growth & Real Estate tier (10 concurrent calls), up to 10 prospective buyers or patients can call your business simultaneously and speak with distinct conversational AI assistants without anyone receiving a busy signal, hold music, or voicemail drop.',
    category: 'Telephony & Limits',
    highlight: true,
  },
  {
    id: 'exceed-monthly-limits',
    question: 'What happens if I exceed my monthly call limit or concurrent capacity?',
    answer:
      'Your phone lines and customer interactions will never be abruptly disconnected or shut down: \n\n• Exceeding Monthly Minutes: Automated alerts notify your team via email and WhatsApp when you reach 80% and 100% of your pooled allowance. You can purchase instant rollover top-up minute packs (₹999 for 250 mins, ₹1,999 for 500 mins, or ₹3,499 for 1,000 mins) or enable automatic overage billing at standard carrier rates (₹2.20/min). Minutes purchased in top-up packs never expire and carry over indefinitely.\n\n• Exceeding Concurrent Channels: If all simultaneous channels are engaged (e.g. all 10 lines on Growth & Real Estate), you can configure custom overflow handling: place callers in a friendly AI hold queue with real-time wait estimation, warm-transfer immediately to a designated staff phone, or send an instant automated SMS callback confirmation.',
    category: 'Telephony & Limits',
    highlight: true,
  },
  {
    id: 'custom-voices',
    question: 'How do custom voice models and voice cloning work?',
    answer:
      'The Growth & Real Estate plan includes 1 custom voice model clone, while Business Scale includes 5. To calibrate a clone, simply upload or record a 2–3 minute audio sample of your staff member, doctor, or founder speaking in a quiet room via our Cloudinary-backed Voice Studio. Cartesia Sonic synthesizes a state-space neural voice replica that preserves tone, pitch, and natural Indian conversational cadence.',
    category: 'Voice AI Engine',
  },
  {
    id: 'indian-phone-numbers',
    question: 'How are dedicated +91 Indian phone numbers allocated?',
    answer:
      'We provision licensed virtual phone numbers (+91 mobile DIDs, STD landlines like 080 for Bangalore or 022 for Mumbai, or pan-India toll-free lines) directly through our Plivo India carrier integration. If you already have an existing business SIM or PBX number, you can simply set up unconditional or busy call forwarding to your Auris AI virtual DID in under 2 minutes.',
    category: 'Telephony & Limits',
  },
  {
    id: 'webhooks-crm',
    question: 'How does webhook access work and what events are dispatched?',
    answer:
      'Auris provides enterprise REST APIs and real-time HMAC-SHA256 signed HTTPS webhooks. Events dispatched include call.started, call.speech_turn, call.ended, sentiment.escalated, booking.created, and recording.uploaded. Webhook payloads contain caller IDs, turn-by-turn transcripts, extracted customer intents, and Cloudinary dual-track MP3 audio recording URLs for instant synchronization into HubSpot, Zoho, Google Sheets, or internal CRMs.',
    category: 'Integrations & Webhooks',
  },
  {
    id: 'gst-invoicing',
    question: 'Do you provide formal GST tax invoices for Indian businesses?',
    answer:
      'Yes! Every transaction processed via Razorpay (UPI, Credit/Debit cards, or NetBanking) generates an official GST tax invoice with our Karnataka GSTIN (29AABCA1234F1Z8), your company GSTIN, and the SAC code 9984 (Telephony & Cloud Software Services). This allows your accounting team to claim the full 18% Input Tax Credit (ITC).',
    category: 'Billing & Plans',
  },
  {
    id: 'indic-languages-support',
    question: 'Which Indian vernacular languages are natively supported?',
    answer:
      'Auris features native Sarvam AI Indic language engines optimized for Indian accents and mixed vernacular dialogue (e.g. Hinglish, Tenglish). Supported languages include Hindi, Telugu, Tamil, Marathi, Bengali, Kannada, Gujarati, Malayalam, Punjabi, Odia, and Indian English. Agents can switch between languages mid-call if the customer shifts language.',
    category: 'Voice AI Engine',
  },
];

export const PricingFAQ: React.FC = () => {
  // Track open accordion IDs (defaulting to the requested common questions)
  const [openIds, setOpenIds] = useState<string[]>([
    'cancel-anytime',
    'billing-cycles',
    'payment-methods',
    'concurrent-calls',
    'exceed-monthly-limits',
  ]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Billing & Plans', 'Telephony & Limits', 'Voice AI Engine', 'Integrations & Webhooks'];

  const toggleAccordion = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredFaqs = FAQ_DATA.filter((item) => {
    if (selectedCategory === 'All') return true;
    return item.category === selectedCategory;
  });

  return (
    <div className="bg-white dark:bg-[#052659]/30 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-[#5483B3]/25 shadow-sm mb-16 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-100 dark:border-[#5483B3]/25 pb-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#052659]/15 dark:bg-[#052659]/40 border border-[#1D64C2]/30 dark:border-[#7DA0CA]/30 text-xs font-bold text-[#1D64C2] dark:text-[#C1E8FF]">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-300">
            Clear answers regarding plan commitments, carrier concurrency, custom voice cloning, and billing.
          </p>
        </div>

        {/* Quick Help Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#021024]/60 border border-slate-200 dark:border-[#5483B3]/25 text-xs font-medium text-slate-600 dark:text-[#7DA0CA]">
          <Clock className="w-3.5 h-3.5 text-[#1D64C2] dark:text-[#C1E8FF]" />
          <span>Need custom trunks? Contact sales for PRI lines</span>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-gradient-to-r from-[#052659] to-[#1D64C2] text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-[#021024]/60 dark:hover:bg-[#021024] text-slate-600 dark:text-[#7DA0CA]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {filteredFaqs.map((faq) => {
          const isOpen = openIds.includes(faq.id);

          return (
            <div
              key={faq.id}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? 'border-[#1D64C2]/50 bg-[#052659]/15 dark:bg-[#052659]/40 shadow-xs'
                  : 'border-slate-200 dark:border-[#5483B3]/25 bg-slate-50/50 dark:bg-[#021024]/30 hover:border-[#7DA0CA]/50'
              }`}
            >
              {/* Question Trigger */}
              <button
                type="button"
                onClick={() => toggleAccordion(faq.id)}
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${faq.id}`}
                className="w-full py-4 px-5 sm:px-6 flex items-center justify-between gap-4 text-left cursor-pointer select-none transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${
                      isOpen
                        ? 'bg-gradient-to-r from-[#052659] to-[#1D64C2] text-white'
                        : 'bg-slate-200 dark:bg-[#021024] text-slate-600 dark:text-[#7DA0CA]'
                    }`}
                  >
                    Q
                  </div>
                  <span className="text-sm font-extrabold text-slate-950 dark:text-white">
                    {faq.question}
                  </span>
                  {faq.highlight && (
                    <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#052659]/15 text-[#1D64C2] dark:bg-[#052659]/60 dark:text-[#C1E8FF] font-mono">
                      Popular
                    </span>
                  )}
                </div>

                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center transition-transform duration-200 ${
                    isOpen
                      ? 'bg-gradient-to-r from-[#052659] to-[#1D64C2] text-white rotate-180'
                      : 'bg-slate-100 dark:bg-[#021024] text-slate-500'
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>

              {/* Answer Content */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={`faq-answer-${faq.id}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 sm:px-6 pb-5 pt-1 border-t border-slate-100 dark:border-[#5483B3]/20 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-2">
                      <p className="whitespace-pre-line">{faq.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Still Have Questions Banner */}
      <div className="pt-4 border-t border-slate-100 dark:border-[#5483B3]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-500 dark:text-[#7DA0CA]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#1D64C2] dark:text-[#C1E8FF]" />
          <span>Have a question not listed here? Our Bangalore technical team is on standby 24/7.</span>
        </div>
        <a
          href="mailto:support@aurisvoice.ai"
          className="font-bold text-[#1D64C2] dark:text-[#C1E8FF] hover:underline flex items-center gap-1 self-start sm:self-auto"
        >
          <span>Ask Telecom Architect</span>
          <span className="font-mono">→</span>
        </a>
      </div>
    </div>
  );
};
