import React, { useState } from 'react';
import {
  Check,
  Minus,
  Sparkles,
  PhoneCall,
  Webhook,
  Cpu,
  ShieldCheck,
  Layers,
  Search,
  SlidersHorizontal,
  ArrowRight,
  CreditCard,
  HelpCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { mockPlans } from '../../services/mockData';

export type FeatureCategory = 'All' | 'Telephony & Voice' | 'Integrations & Webhooks' | 'Intelligence & Media' | 'Support & Security';

export interface ComparisonFeature {
  id: string;
  category: 'Telephony & Voice' | 'Integrations & Webhooks' | 'Intelligence & Media' | 'Support & Security';
  feature: string;
  description: string;
  starter: string | boolean;
  growth: string | boolean;
  business: string | boolean;
  enterprise: string | boolean;
  highlight?: boolean;
}

const COMPARISON_FEATURES: ComparisonFeature[] = [
  // 1. Telephony & Voice
  {
    id: 'concurrent-calls',
    category: 'Telephony & Voice',
    feature: 'Concurrent Simultaneous Calls',
    description: 'Number of parallel inbound or outbound telephone conversations processed without queueing or busy tones.',
    starter: '3 calls',
    growth: '10 calls',
    business: '35 calls',
    enterprise: 'Unlimited (Dedicated PRI)',
    highlight: true,
  },
  {
    id: 'monthly-minutes',
    category: 'Telephony & Voice',
    feature: 'Included Pooled Minutes',
    description: 'Shared conversational minutes per billing cycle for both inbound reception and outbound dialing.',
    starter: '400 mins/mo',
    growth: '1,200 mins/mo',
    business: '3,500 mins/mo',
    enterprise: '10,000+ mins/mo',
  },
  {
    id: 'phone-numbers',
    category: 'Telephony & Voice',
    feature: 'Dedicated +91 Virtual Numbers',
    description: 'Licensed Indian telecom phone numbers provisioned directly via Plivo India carrier infrastructure.',
    starter: '1 Number',
    growth: '2 Numbers (Inbound + Outbound)',
    business: '5 Numbers',
    enterprise: 'Up to 25 Numbers (or Bring Your Own)',
  },
  {
    id: 'custom-voice-models',
    category: 'Telephony & Voice',
    feature: 'Custom Voice Models & Voice Cloning',
    description: 'Deploy personalized AI voice replicas calibrated to staff members, founders, or bespoke brand avatars.',
    starter: '2 Presets (No cloning)',
    growth: '1 Custom Voice Clone',
    business: '5 Custom Voice Models',
    enterprise: 'Unlimited Studio-Calibrated Models',
    highlight: true,
  },
  {
    id: 'latency-ttfa',
    category: 'Telephony & Voice',
    feature: 'Turn-Taking Latency (TTFA)',
    description: 'Time to First Audio packet delivered through SIP trunking, mimicking natural human cadence.',
    starter: '~110ms',
    growth: '<100ms (Cartesia Sonic)',
    business: '<85ms (Fast Routing)',
    enterprise: '<75ms (Private Edge POPs)',
  },
  {
    id: 'indic-languages',
    category: 'Telephony & Voice',
    feature: 'Multilingual Indic Languages',
    description: 'Supported vernacular Indian languages powered by native Sarvam AI language meshes.',
    starter: 'English & Hindi',
    growth: '10+ Indic Languages',
    business: '12+ Indic & Global',
    enterprise: 'Custom Dialect & Accent Training',
  },

  // 2. Integrations & Webhooks
  {
    id: 'webhook-access',
    category: 'Integrations & Webhooks',
    feature: 'Webhook Access & Real-Time Event Dispatch',
    description: 'Automated HTTPS webhooks triggered for call initiation, turn-by-turn speech events, and call summaries.',
    starter: 'Basic (Call-Ended event)',
    growth: 'Real-time Signed Webhooks',
    business: 'High-Throughput (1,000 req/s)',
    enterprise: 'Bidirectional SIP & Kafka Streams',
    highlight: true,
  },
  {
    id: 'crm-calendar-integrations',
    category: 'Integrations & Webhooks',
    feature: 'CRM & Calendar Integrations',
    description: 'Sync bookings, lead notes, and transcripts directly to your business databases and schedulers.',
    starter: 'Google Sheets & Calendar',
    growth: 'HubSpot, Zoho & WhatsApp',
    business: 'Salesforce, LeadSquared, Zapier',
    enterprise: 'Custom Core Banking / ERP / HIS',
  },
  {
    id: 'outbound-campaigns',
    category: 'Integrations & Webhooks',
    feature: 'Automated Outbound Dialing',
    description: 'Dispatch proactive appointment confirmations, payment reminders, and lead outreach at scale.',
    starter: 'Manual one-click calls',
    growth: 'Up to 250 calls / day',
    business: 'Up to 2,500 calls/day + AMD',
    enterprise: '10,000+ calls/day multi-trunk',
  },
  {
    id: 'api-access',
    category: 'Integrations & Webhooks',
    feature: 'REST API & Agent Dispatch Tokens',
    description: 'Full programmatic control to spin up agents, trigger outbound calls, and query transcripts via API.',
    starter: 'Basic API (Rate-limited)',
    growth: 'Full REST API (100 req/min)',
    business: 'Enterprise API (1,000 req/min)',
    enterprise: 'Dedicated Gateway + Custom SDKs',
  },

  // 3. Intelligence & Media
  {
    id: 'dual-track-recordings',
    category: 'Intelligence & Media',
    feature: 'Dual-Track Call Audio (Cloudinary)',
    description: 'Isolated stereo recordings separating caller and AI channels, archived and streamed instantly via Cloudinary CDN.',
    starter: 'Dual-Track (30 days retention)',
    growth: 'Dual-Track HD (90 days retention)',
    business: 'Lossless Audio (180 days retention)',
    enterprise: 'Unlimited Archive & Custom S3 Bucket',
  },
  {
    id: 'knowledge-base',
    category: 'Intelligence & Media',
    feature: 'Knowledge Base (Vector RAG / PDFs)',
    description: 'Upload internal business documents, rate cards, and catalogs to ground agent conversations in factual data.',
    starter: 'Up to 5 Docs (5 MB total)',
    growth: 'Up to 25 Docs (25 MB total)',
    business: '100 Docs + Web Scraper',
    enterprise: 'Unlimited Docs + Intranet Connectors',
  },
  {
    id: 'sentiment-classification',
    category: 'Intelligence & Media',
    feature: 'Sentiment & Urgency Priority Analysis',
    description: 'Real-time NLP classification tagging frustrated callers, high-value leads, or immediate booking requests.',
    starter: 'Standard sentiment flags',
    growth: 'Sentiment & Escalation routing',
    business: 'Custom scoring matrix & tags',
    enterprise: 'Real-time supervisor takeover alerts',
  },

  // 4. Support & Security
  {
    id: 'team-seats',
    category: 'Support & Security',
    feature: 'Team Seats & Granular Permissions',
    description: 'Manage administrator, supervisor, and operator roles with customized view-only or editing rights.',
    starter: '1 Admin Seat',
    growth: '5 Team Seats',
    business: '20 Team Seats',
    enterprise: 'Unlimited Seats + SAML SSO',
  },
  {
    id: 'support-sla',
    category: 'Support & Security',
    feature: 'Support Channels & Response SLA',
    description: 'Guaranteed support availability and resolution times from our telephony engineering squad.',
    starter: 'Email support (48h SLA)',
    growth: 'Priority WhatsApp & Email (4h SLA)',
    business: '24/7 Priority Hotline (1h SLA)',
    enterprise: '15-min SLA + Dedicated Architect',
  },
  {
    id: 'regulatory-compliance',
    category: 'Support & Security',
    feature: 'Telecom Compliance & Data Residency',
    description: 'Strict adherence to Indian Department of Telecom (DoT), TRAI DLT regulations, and data security.',
    starter: 'DoT & TRAI guidelines',
    growth: 'DoT + NDNC DND scrub filter',
    business: 'TRAI DLT registration aid',
    enterprise: 'HIPAA, SOC-2 & Indian Data Residency',
  },
];

interface PricingFeatureComparisonProps {
  currency: 'INR' | 'USD';
  billingCycle: 'monthly' | 'yearly';
  onSelectPlan: (planId: string) => void;
  onOpenRazorpay: (plan: any) => void;
}

export const PricingFeatureComparison: React.FC<PricingFeatureComparisonProps> = ({
  currency,
  billingCycle,
  onSelectPlan,
  onOpenRazorpay,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<FeatureCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories: FeatureCategory[] = [
    'All',
    'Telephony & Voice',
    'Integrations & Webhooks',
    'Intelligence & Media',
    'Support & Security',
  ];

  const filteredFeatures = COMPARISON_FEATURES.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.feature.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(item.starter).toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(item.growth).toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(item.business).toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(item.enterprise).toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getPlanPrice = (planId: string) => {
    const plan = mockPlans.find((p) => p.id === planId);
    if (!plan) return '';
    const isYearly = billingCycle === 'yearly';
    const amount =
      currency === 'INR'
        ? isYearly
          ? plan.priceYearlyInr
          : plan.priceMonthlyInr
        : isYearly
        ? plan.priceYearly
        : plan.priceMonthly;
    const symbol = currency === 'INR' ? '₹' : '$';
    return `${symbol}${amount.toLocaleString()}`;
  };

  const renderCellContent = (value: string | boolean, isHighlighted = false) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="w-5 h-5 text-emerald-500 mx-auto" />
      ) : (
        <Minus className="w-4 h-4 text-slate-300 dark:text-slate-600 mx-auto" />
      );
    }

    return (
      <span
        className={`text-xs font-semibold leading-relaxed block ${
          isHighlighted
            ? 'text-emerald-700 dark:text-emerald-300 font-bold'
            : 'text-slate-700 dark:text-slate-300'
        }`}
      >
        {value}
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm mb-16 space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Side-by-Side Inclusions</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
            Detailed Feature Matrix by Pricing Tier
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Compare concurrent call capacity, webhook capabilities, custom voice cloning, and telephony allocations across all Auris plans.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search features (e.g. webhooks, voice)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-all"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-slate-950 text-white dark:bg-emerald-600 dark:text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-400'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Comparison Table Container with Horizontal Scroll Safeguard */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left border-collapse min-w-[760px]">
          {/* Table Header */}
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-850/80 border-b border-slate-200 dark:border-slate-800">
              <th className="py-4 px-5 w-[32%] text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Feature & Capability
              </th>

              {/* Starter Column */}
              <th className="py-4 px-4 w-[17%] text-center border-l border-slate-200/80 dark:border-slate-800">
                <div className="text-xs font-black text-slate-950 dark:text-white">Starter</div>
                <div className="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {getPlanPrice('starter')}
                  <span className="text-[10px] text-slate-400 font-normal">/mo</span>
                </div>
              </th>

              {/* Growth & Real Estate Column (Highlighted) */}
              <th className="py-4 px-4 w-[17%] text-center border-l border-r border-emerald-500/40 bg-emerald-50/60 dark:bg-emerald-950/40 relative">
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider mb-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>Popular</span>
                </div>
                <div className="text-xs font-black text-slate-950 dark:text-white">Growth & Real Estate</div>
                <div className="text-sm font-black font-mono text-emerald-700 dark:text-emerald-400 mt-0.5">
                  {getPlanPrice('growth')}
                  <span className="text-[10px] text-slate-400 font-normal">/mo</span>
                </div>
              </th>

              {/* Business Scale Column */}
              <th className="py-4 px-4 w-[17%] text-center border-r border-slate-200/80 dark:border-slate-800">
                <div className="text-xs font-black text-slate-950 dark:text-white">Business Scale</div>
                <div className="text-sm font-black font-mono text-slate-900 dark:text-slate-200 mt-0.5">
                  {getPlanPrice('business')}
                  <span className="text-[10px] text-slate-400 font-normal">/mo</span>
                </div>
              </th>

              {/* Enterprise Column */}
              <th className="py-4 px-4 w-[17%] text-center">
                <div className="text-xs font-black text-slate-950 dark:text-white">Enterprise Custom</div>
                <div className="text-sm font-black font-mono text-slate-900 dark:text-slate-200 mt-0.5">
                  {getPlanPrice('enterprise')}
                  <span className="text-[10px] text-slate-400 font-normal">/mo</span>
                </div>
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {filteredFeatures.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-500 dark:text-slate-400">
                  No features found matching &quot;{searchQuery}&quot;. Try clearing your search filter.
                </td>
              </tr>
            ) : (
              filteredFeatures.map((item, index) => {
                const isOdd = index % 2 === 1;
                return (
                  <tr
                    key={item.id}
                    className={`transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-850/50 ${
                      isOdd ? 'bg-slate-50/30 dark:bg-slate-900/30' : 'bg-white dark:bg-slate-900'
                    }`}
                  >
                    {/* Feature Title and Info */}
                    <td className="py-3.5 px-5">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 dark:text-white text-xs">
                            {item.feature}
                          </span>
                          {item.highlight && (
                            <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-mono text-[9px] font-bold">
                              Key Metric
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                          {item.description}
                        </p>
                      </div>
                    </td>

                    {/* Starter Value */}
                    <td className="py-3.5 px-4 text-center border-l border-slate-100 dark:border-slate-800/80">
                      {renderCellContent(item.starter)}
                    </td>

                    {/* Growth Value (Highlighted Column) */}
                    <td className="py-3.5 px-4 text-center border-l border-r border-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/20">
                      {renderCellContent(item.growth, true)}
                    </td>

                    {/* Business Value */}
                    <td className="py-3.5 px-4 text-center border-r border-slate-100 dark:border-slate-800/80">
                      {renderCellContent(item.business)}
                    </td>

                    {/* Enterprise Value */}
                    <td className="py-3.5 px-4 text-center">
                      {renderCellContent(item.enterprise)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

          {/* Table Footer with CTAs */}
          <tfoot>
            <tr className="bg-slate-50 dark:bg-slate-850/90 border-t border-slate-200 dark:border-slate-800">
              <td className="py-4 px-5 text-xs font-bold text-slate-600 dark:text-slate-400">
                Ready to deploy your conversational voice team?
              </td>

              {/* Starter CTA */}
              <td className="py-4 px-4 text-center border-l border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => onSelectPlan('starter')}
                  className="w-full py-2 px-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 transition-all cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
                >
                  <span>Select</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </td>

              {/* Growth CTA */}
              <td className="py-4 px-4 text-center border-l border-r border-emerald-500/40 bg-emerald-50/60 dark:bg-emerald-950/40">
                <button
                  type="button"
                  onClick={() => onSelectPlan('growth')}
                  className="w-full py-2 px-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                >
                  <span>Choose Growth</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </td>

              {/* Business CTA */}
              <td className="py-4 px-4 text-center border-r border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => onSelectPlan('business')}
                  className="w-full py-2 px-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 transition-all cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
                >
                  <span>Select</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </td>

              {/* Enterprise CTA */}
              <td className="py-4 px-4 text-center">
                <button
                  type="button"
                  onClick={() => onSelectPlan('enterprise')}
                  className="w-full py-2 px-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 transition-all cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
                >
                  <span>Contact Sales</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Footnote about Carrier SLA and Razorpay */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 gap-2">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>All tiers include 99.99% Carrier SLA via Plivo India & Cloudinary media archive guarantee.</span>
        </div>
        <div className="flex items-center gap-1.5 font-mono">
          <CreditCard className="w-3.5 h-3.5 text-slate-400" />
          <span>Instant billing via Razorpay UPI & Corporate NetBanking with GST invoice.</span>
        </div>
      </div>
    </div>
  );
};
