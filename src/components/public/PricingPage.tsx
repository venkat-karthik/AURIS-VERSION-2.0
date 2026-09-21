import React, { useState } from 'react';
import { motion } from 'motion/react';
import { mockPlans } from '../../services/mockData';
import { Check, Sparkles, HelpCircle, ArrowRight, Shield, Zap, Calculator } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PricingPageProps {
  onSelectPlan: (planId: string, billingCycle: 'monthly' | 'yearly') => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onSelectPlan }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [callMinutesSlider, setCallMinutesSlider] = useState(1500);

  const handleSelect = (planId: string) => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#38A85B', '#55B9E8', '#2189C8', '#65C978'],
    });
    onSelectPlan(planId, billingCycle);
  };

  // Recommended plan according to slider minutes
  const getRecommendedPlan = (minutes: number) => {
    if (minutes <= 300) return 'starter';
    if (minutes <= 1200) return 'growth';
    if (minutes <= 4000) return 'business';
    return 'enterprise';
  };

  const recommended = getRecommendedPlan(callMinutesSlider);

  return (
    <div className="py-16 bg-[#F5FAFC] dark:bg-[#0A1120] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-12 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEF8FC] dark:bg-[#162742] border border-[#55B9E8]/30 dark:border-[#2D486B] text-xs font-bold text-[#2189C8] dark:text-[#55B9E8]">
            <Sparkles className="w-3.5 h-3.5" />
            Simple, Transparent SaaS Pricing
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#123047] dark:text-white tracking-tight">
            Plans for Businesses of Every Size
          </h1>
          <p className="text-base text-[#52636D] dark:text-[#94A3B8]">
            All plans include natural human-like voice synthesis, calendar integrations, and our sub-280ms carrier telephony backbone. No hidden setup fees.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="inline-flex items-center bg-white dark:bg-[#111C38] p-1 rounded-xl border border-[#DDEBEF] dark:border-[#1E2E4A] shadow-xs mt-4">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-[#123047] dark:bg-[#2189C8] text-white shadow-xs'
                  : 'text-[#52636D] dark:text-[#94A3B8] hover:text-[#123047] dark:hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                billingCycle === 'yearly'
                  ? 'bg-[#38A85B] text-white shadow-xs'
                  : 'text-[#52636D] dark:text-[#94A3B8] hover:text-[#123047] dark:hover:text-white'
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-1.5 py-0.5 text-[10px] bg-white/20 text-white rounded font-extrabold">
                Save 20%
              </span>
            </button>
          </div>
        </motion.div>

        {/* Pricing Cards Grid with Motion */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {mockPlans.map((plan, i) => {
            const price = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;
            const isPopular = plan.popular;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className={`relative bg-white dark:bg-[#111C38] rounded-2xl p-6 border transition-all flex flex-col justify-between ${
                  isPopular
                    ? 'border-[#38A85B] shadow-xl ring-2 ring-[#38A85B]/30'
                    : 'border-[#DDEBEF] dark:border-[#1E2E4A] shadow-xs hover:shadow-lg'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#38A85B] text-white text-[11px] font-extrabold tracking-wide uppercase shadow-xs">
                    Most Popular
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-bold text-[#123047] dark:text-white">{plan.name}</h3>
                  </div>

                  <p className="text-xs text-[#52636D] dark:text-[#94A3B8] min-h-[36px] mb-4">
                    {plan.description}
                  </p>

                  <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-[#DDEBEF] dark:border-[#1E2E4A]">
                    <span className="text-4xl font-extrabold text-[#123047] dark:text-white">${price}</span>
                    <span className="text-xs font-medium text-[#52636D] dark:text-[#94A3B8]">/ month</span>
                  </div>

                  <div className="space-y-2 mb-6">
                    <div className="text-xs font-bold text-[#123047] dark:text-white uppercase tracking-wider mb-2">
                      Key Allocations:
                    </div>
                    <div className="text-xs text-[#123047] dark:text-white flex items-center justify-between py-1 bg-[#F5FAFC] dark:bg-[#16223F] px-2.5 rounded">
                      <span className="text-[#52636D] dark:text-[#94A3B8]">Included Minutes</span>
                      <span className="font-bold text-[#2189C8] dark:text-[#55B9E8]">{plan.minutesIncluded.toLocaleString()} min</span>
                    </div>
                    <div className="text-xs text-[#123047] dark:text-white flex items-center justify-between py-1 bg-[#F5FAFC] dark:bg-[#16223F] px-2.5 rounded">
                      <span className="text-[#52636D] dark:text-[#94A3B8]">AI Voice Agents</span>
                      <span className="font-bold">{plan.agentsLimit} Agents</span>
                    </div>
                    <div className="text-xs text-[#123047] dark:text-white flex items-center justify-between py-1 bg-[#F5FAFC] dark:bg-[#16223F] px-2.5 rounded">
                      <span className="text-[#52636D] dark:text-[#94A3B8]">Phone Numbers</span>
                      <span className="font-bold">{plan.phoneNumbersLimit} Lines</span>
                    </div>
                  </div>

                  <div className="space-y-2.5 mb-8">
                    <div className="text-xs font-bold text-[#123047] dark:text-white uppercase tracking-wider mb-2">
                      Included Features:
                    </div>
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-[#52636D] dark:text-[#94A3B8]">
                        <Check className="w-4 h-4 text-[#38A85B] flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <motion.button
                  id={`select-plan-${plan.id}-btn`}
                  onClick={() => handleSelect(plan.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    isPopular
                      ? 'bg-[#38A85B] hover:bg-[#2f8f4d] text-white shadow-sm hover:shadow'
                      : 'bg-[#EEF8FC] dark:bg-[#162742] hover:bg-[#DDEBEF] text-[#2189C8] dark:text-[#55B9E8] border border-[#55B9E8]/30'
                  }`}
                >
                  Choose {plan.name}
                  <ArrowRight className="w-3.5 h-3.5" />
                </motion.button>
              </motion.div>
            );
          })}
        </div>

        {/* Interactive Usage Minute Calculator */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-[#111C38] rounded-3xl p-8 border border-[#DDEBEF] dark:border-[#1E2E4A] shadow-xs mb-16"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2189C8] dark:text-[#55B9E8] uppercase tracking-wider">
                <Calculator className="w-4 h-4" />
                Interactive Usage Calculator
              </div>
              <h2 className="text-2xl font-bold text-[#123047] dark:text-white">
                Estimate Your Expected Call Volume
              </h2>
              <p className="text-sm text-[#52636D] dark:text-[#94A3B8]">
                Drag the slider to find the plan that matches your monthly voice call minutes. Overages are billed transparently at just $0.09/min.
              </p>

              <div className="pt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-[#123047] dark:text-white">Estimated Monthly Minutes:</span>
                  <span className="text-xl font-extrabold text-[#38A85B]">{callMinutesSlider.toLocaleString()} mins</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="6000"
                  step="50"
                  value={callMinutesSlider}
                  onChange={(e) => setCallMinutesSlider(Number(e.target.value))}
                  className="w-full accent-[#38A85B] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-[#82919A] dark:text-[#64748B]">
                  <span>100 mins (Solo practice)</span>
                  <span>1,500 mins (Active clinic)</span>
                  <span>6,000+ mins (Enterprise)</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 p-6 rounded-2xl bg-[#F5FAFC] dark:bg-[#16223F] border border-[#DDEBEF] dark:border-[#1E2E4A] space-y-4">
              <div className="text-xs font-bold text-[#82919A] dark:text-[#64748B] uppercase tracking-wider">
                Recommended Plan for Your Volume
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#123047] dark:text-white capitalize">
                  {recommended} Tier
                </span>
                <span className="text-xs text-[#38A85B] font-bold bg-[#EFFAF1] dark:bg-[#0F2D1F] px-2 py-0.5 rounded-full">
                  Best Value Match
                </span>
              </div>
              <p className="text-xs text-[#52636D] dark:text-[#94A3B8]">
                Provides sufficient pooled minutes, seamless integration to OmniDimension voice infrastructure, and automated calendar confirmations.
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelect(recommended)}
                className="w-full py-2.5 rounded-xl bg-[#123047] dark:bg-[#2189C8] hover:bg-[#1a4261] text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                Proceed with {recommended.toUpperCase()}
                <ArrowRight className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Enterprise & Telephony Guarantees */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <motion.div whileHover={{ y: -4 }} className="bg-white dark:bg-[#111C38] p-6 rounded-2xl border border-[#DDEBEF] dark:border-[#1E2E4A] shadow-xs">
            <Shield className="w-8 h-8 text-[#38A85B] mx-auto mb-3" />
            <h4 className="font-bold text-sm text-[#123047] dark:text-white mb-1">HIPAA & SOC-2 Ready</h4>
            <p className="text-xs text-[#52636D] dark:text-[#94A3B8]">End-to-end encrypted voice tunnels with zero persistent audio storage options.</p>
          </motion.div>

          <motion.div whileHover={{ y: -4 }} className="bg-white dark:bg-[#111C38] p-6 rounded-2xl border border-[#DDEBEF] dark:border-[#1E2E4A] shadow-xs">
            <Zap className="w-8 h-8 text-[#2189C8] dark:text-[#55B9E8] mx-auto mb-3" />
            <h4 className="font-bold text-sm text-[#123047] dark:text-white mb-1">Sub-280ms Latency</h4>
            <p className="text-xs text-[#52636D] dark:text-[#94A3B8]">Powered by OmniDimension ultra-low latency audio pipeline for authentic conversations.</p>
          </motion.div>

          <motion.div whileHover={{ y: -4 }} className="bg-white dark:bg-[#111C38] p-6 rounded-2xl border border-[#DDEBEF] dark:border-[#1E2E4A] shadow-xs">
            <HelpCircle className="w-8 h-8 text-[#38A85B] mx-auto mb-3" />
            <h4 className="font-bold text-sm text-[#123047] dark:text-white mb-1">24/7 Priority Support</h4>
            <p className="text-xs text-[#52636D] dark:text-[#94A3B8]">Dedicated onboarding specialists and technical engineers to optimize your prompts.</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
