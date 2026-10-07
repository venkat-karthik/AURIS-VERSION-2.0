import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { mockPlans } from '../../services/mockData';
import {
  Check,
  Sparkles,
  HelpCircle,
  ArrowRight,
  Shield,
  Zap,
  Calculator,
  CreditCard,
  TrendingUp,
  Clock,
  Radio,
  Cloud,
  Phone,
  Cpu,
  Layers,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { RazorpayPaymentModal } from '../common/RazorpayPaymentModal';
import { PricingFeatureComparison } from './PricingFeatureComparison';
import { PricingFAQ } from './PricingFAQ';

interface PricingPageProps {
  onSelectPlan: (planId: string, billingCycle: 'monthly' | 'yearly') => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onSelectPlan }) => {
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [callMinutesSlider, setCallMinutesSlider] = useState(800);
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<any>(null);

  const handleSelect = (planId: string) => {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#10B981', '#06B6D4', '#6366F1', '#3B82F6'],
    });
    onSelectPlan(planId, billingCycle);
  };

  const handleOpenRazorpay = (plan: any) => {
    const isYearly = billingCycle === 'yearly';
    const priceInr = isYearly ? plan.priceYearlyInr : plan.priceMonthlyInr;
    const priceUsd = isYearly ? plan.priceYearly : plan.priceMonthly;

    setSelectedPlanForPayment({
      name: plan.name,
      minutes: plan.minutesIncluded,
      priceInr,
      priceUsd,
    });
    setIsRazorpayOpen(true);
  };

  // Recommended plan according to slider minutes
  const getRecommendedPlan = (minutes: number) => {
    if (minutes <= 450) return 'starter';
    if (minutes <= 1500) return 'growth';
    if (minutes <= 4500) return 'business';
    return 'enterprise';
  };

  const recommended = getRecommendedPlan(callMinutesSlider);

  // ROI Cost calculation: Human receptionist vs AI Voice Agent
  const estimatedCallsPerMonth = Math.round(callMinutesSlider / 2.2);
  const humanReceptionistCostInr = 22000;
  const aiAgentPlanCostInr = callMinutesSlider <= 450 ? 4999 : callMinutesSlider <= 1500 ? 7850 : 24999;
  const netMonthlySavingsInr = Math.max(0, humanReceptionistCostInr - aiAgentPlanCostInr);
  const savingsPercent = Math.round((netMonthlySavingsInr / humanReceptionistCostInr) * 100);

  return (
    <div className="py-16 bg-white dark:bg-[#021024] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with animated entrance */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-center max-w-3xl mx-auto mb-12 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#052659]/15 dark:bg-[#052659]/40 border border-[#1D64C2]/30 dark:border-[#7DA0CA]/30 text-xs font-bold text-[#1D64C2] dark:text-[#C1E8FF] shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Transparent Enterprise B2B Pricing</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-slate-950 dark:text-white tracking-tight">
            Predictable Plans for Growing Businesses
          </h1>

          <p className="text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
            All plans include Cartesia Sonic & Sarvam AI Indic models, dedicated Plivo India +91 phone numbers, and dual-track call recordings on Cloudinary.
          </p>

          {/* Controls: Currency Switcher + Billing Cycle Toggle */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            {/* Currency Switcher */}
            <div className="inline-flex items-center bg-white dark:bg-[#052659]/60 p-1 rounded-xl border border-slate-200 dark:border-[#5483B3]/30 shadow-2xs">
              <button
                onClick={() => setCurrency('INR')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  currency === 'INR'
                    ? 'bg-[#021024] text-white dark:bg-[#052659] dark:text-[#C1E8FF] shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 dark:text-[#7DA0CA] dark:hover:text-[#C1E8FF]'
                }`}
              >
                ₹ INR (India)
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  currency === 'USD'
                    ? 'bg-[#021024] text-white dark:bg-[#052659] dark:text-[#C1E8FF] shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 dark:text-[#7DA0CA] dark:hover:text-[#C1E8FF]'
                }`}
              >
                $ USD (Global)
              </button>
            </div>

            {/* Billing Cycle Toggle */}
            <div className="inline-flex items-center bg-white dark:bg-[#052659]/60 p-1 rounded-xl border border-slate-200 dark:border-[#5483B3]/30 shadow-2xs">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  billingCycle === 'monthly'
                    ? 'bg-slate-900 text-white dark:bg-[#021024] dark:text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 dark:text-[#7DA0CA] dark:hover:text-[#C1E8FF]'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  billingCycle === 'yearly'
                    ? 'bg-gradient-to-r from-[#052659] to-[#1D64C2] text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 dark:text-[#7DA0CA] dark:hover:text-[#C1E8FF]'
                }`}
              >
                <span>Annual Commit</span>
                <span className="px-1.5 py-0.2 text-[9px] bg-white/20 text-[#C1E8FF] rounded font-extrabold">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Pricing Cards Grid with Motion */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 items-stretch">
          {mockPlans.map((plan, i) => {
            const isYearly = billingCycle === 'yearly';
            const price = currency === 'INR'
              ? (isYearly ? plan.priceYearlyInr : plan.priceMonthlyInr)
              : (isYearly ? plan.priceYearly : plan.priceMonthly);
            const currencySymbol = currency === 'INR' ? '₹' : '$';
            const isPopular = plan.popular;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className={`relative bg-white dark:bg-[#052659]/30 rounded-3xl p-6 border flex flex-col justify-between transition-all ${
                  isPopular
                    ? 'border-[#1D64C2] shadow-xl ring-2 ring-[#1D64C2]/25'
                    : 'border-slate-200 dark:border-[#5483B3]/25 shadow-xs hover:border-[#7DA0CA]/50'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-[#052659] via-[#1D64C2] to-[#2563EB] text-white text-[10px] font-black tracking-wider uppercase shadow-xs flex items-center gap-1 border border-[#7DA0CA]/40">
                    <Sparkles className="w-3 h-3 text-[#C1E8FF]" />
                    <span>Best Seller</span>
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-lg font-black text-slate-950 dark:text-white">{plan.name}</h3>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 min-h-[36px] mb-4 leading-relaxed">
                    {plan.description}
                  </p>

                  <div className="flex items-baseline gap-1 mb-5 pb-5 border-b border-slate-100 dark:border-[#5483B3]/25">
                    <span className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white font-mono">
                      {currencySymbol}{price.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">/ month</span>
                  </div>

                  {/* Key Resource Allocations */}
                  <div className="space-y-1.5 mb-5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Resource Allocation:
                    </div>
                    <div className="text-xs flex items-center justify-between py-1.5 px-2.5 rounded-xl bg-slate-50 dark:bg-[#021024]/60 border border-slate-100 dark:border-[#5483B3]/25">
                      <span className="text-slate-500 dark:text-slate-400">Included Minutes</span>
                      <span className="font-extrabold text-[#1D64C2] dark:text-[#C1E8FF] font-mono">
                        {plan.minutesIncluded.toLocaleString()} min
                      </span>
                    </div>
                    <div className="text-xs flex items-center justify-between py-1.5 px-2.5 rounded-xl bg-slate-50 dark:bg-[#021024]/60 border border-slate-100 dark:border-[#5483B3]/25">
                      <span className="text-slate-500 dark:text-slate-400">Plivo India (+91 DID)</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {plan.phoneNumbersLimit} Number{plan.phoneNumbersLimit > 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="text-xs flex items-center justify-between py-1.5 px-2.5 rounded-xl bg-slate-50 dark:bg-[#021024]/60 border border-slate-100 dark:border-[#5483B3]/25">
                      <span className="text-slate-500 dark:text-slate-400">Voice Agents</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {plan.agentsLimit} Assistant{plan.agentsLimit > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Included Features Checklist */}
                  <div className="space-y-2 mb-6">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Included Capabilities:
                    </div>
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                        <Check className="w-3.5 h-3.5 text-[#1D64C2] dark:text-[#C1E8FF] flex-shrink-0 mt-0.5" />
                        <span className="leading-snug">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 mt-auto pt-4 border-t border-slate-100 dark:border-[#5483B3]/25">
                  <button
                    id={`select-plan-${plan.id}-btn`}
                    onClick={() => handleSelect(plan.id)}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs ${
                      isPopular
                        ? 'bg-gradient-to-r from-[#052659] via-[#1D64C2] to-[#2563EB] hover:from-[#1D64C2] hover:to-[#3B82F6] text-white shadow-md shadow-[#1D64C2]/20'
                        : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-[#021024] dark:hover:bg-[#021024]/80'
                    }`}
                  >
                    <span>Choose {plan.name}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenRazorpay(plan)}
                    className="w-full py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-[#C1E8FF] bg-slate-50 hover:bg-slate-100 dark:bg-[#021024]/50 dark:hover:bg-[#021024] border border-slate-200 dark:border-[#5483B3]/30 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-[#1D64C2] dark:text-[#C1E8FF]" />
                    <span>Pay with Razorpay / UPI</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* 2. SIDE-BY-SIDE FEATURE COMPARISON MATRIX */}
        <PricingFeatureComparison
          currency={currency}
          billingCycle={billingCycle}
          onSelectPlan={handleSelect}
          onOpenRazorpay={handleOpenRazorpay}
        />

        {/* 3. INTERACTIVE ROI & COST SAVINGS CALCULATOR */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white dark:bg-[#052659]/30 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-[#5483B3]/25 shadow-sm mb-16"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1D64C2] dark:text-[#C1E8FF] uppercase tracking-wider">
                <Calculator className="w-4 h-4" />
                <span>B2B Cost Analysis & ROI Calculator</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
                Compare Against Full-Time Staff Costs
              </h2>

              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-300 leading-relaxed">
                In India, hiring an on-premise receptionist costs ~₹18,000 to ₹22,000/mo, yet they miss calls after 6 PM and only speak 1–2 languages. Auris works 24/7 in 10+ Indic languages for a fraction of the cost.
              </p>

              <div className="pt-2 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-700 dark:text-slate-300">Expected Monthly Call Minutes:</span>
                  <span className="text-lg font-mono font-black text-[#1D64C2] dark:text-[#C1E8FF]">
                    {callMinutesSlider.toLocaleString()} mins (~{estimatedCallsPerMonth} calls)
                  </span>
                </div>

                <input
                  type="range"
                  min="200"
                  max="4000"
                  step="100"
                  value={callMinutesSlider}
                  onChange={(e) => setCallMinutesSlider(Number(e.target.value))}
                  className="w-full accent-[#1D64C2] cursor-pointer h-2 bg-slate-200 dark:bg-[#021024] rounded-lg"
                />

                <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                  <span>200 mins (Solo Clinic)</span>
                  <span>1,200 mins (Real Estate Team)</span>
                  <span>4,000 mins (High Volume)</span>
                </div>
              </div>
            </div>

            {/* Comparison Cards */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Human Receptionist Cost */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#021024]/60 border border-slate-200/80 dark:border-[#5483B3]/25 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>Human Receptionist</span>
                  <span className="text-[10px] text-rose-500 font-mono">High Overhead</span>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                  ₹{humanReceptionistCostInr.toLocaleString()}<span className="text-xs font-normal text-slate-400">/mo</span>
                </div>
                <ul className="text-[11px] text-slate-500 space-y-1.5 pt-1">
                  <li>• Only available 9:00 AM – 6:00 PM</li>
                  <li>• Misses ~35% of evening & weekend leads</li>
                  <li>• Speaks 1 or 2 regional languages</li>
                  <li>• Sick leave & turnover re-training costs</li>
                </ul>
              </div>

              {/* Auris AI Agent Cost & Savings */}
              <div className="p-5 rounded-2xl bg-[#052659]/15 dark:bg-[#052659]/60 border border-[#1D64C2]/30 dark:border-[#7DA0CA]/30 space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between text-xs font-bold text-[#1D64C2] dark:text-[#C1E8FF]">
                  <span>Auris AI Voice Agent</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-[#052659] to-[#1D64C2] text-white font-mono font-bold">
                    Save {savingsPercent}%
                  </span>
                </div>

                <div className="text-2xl font-black text-[#052659] dark:text-[#C1E8FF] font-mono">
                  ₹{aiAgentPlanCostInr.toLocaleString()}<span className="text-xs font-normal text-[#1D64C2]/80 dark:text-[#7DA0CA]">/mo</span>
                </div>

                <div className="text-xs font-bold text-[#052659] dark:text-[#C1E8FF] flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-[#1D64C2] dark:text-[#C1E8FF]" />
                  <span>Annual Savings: ₹{(netMonthlySavingsInr * 12).toLocaleString()}</span>
                </div>

                <ul className="text-[11px] text-slate-700 dark:text-[#C1E8FF]/90 space-y-1.5 pt-1">
                  <li>• 24/7/365 instant pickup (zero wait)</li>
                  <li>• Multilingual Hindi, Telugu, English</li>
                  <li>• Dual-track recordings on Cloudinary</li>
                  <li>• Direct calendar & WhatsApp booking</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 3. TRANSPARENT UNIT ECONOMICS & INFRASTRUCTURE BREAKDOWN */}
        <div className="bg-slate-50 dark:bg-[#052659]/20 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-[#5483B3]/25 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#1D64C2] dark:text-[#C1E8FF]" />
                <h3 className="text-base font-black text-slate-950 dark:text-white">
                  Transparent Infrastructure COGS Breakdown
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                How our stack operates efficiently in India to yield 70–80% gross profit margins:
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#052659]/15 text-[#1D64C2] dark:bg-[#052659]/50 dark:text-[#C1E8FF] border border-[#1D64C2]/30 dark:border-[#7DA0CA]/30 self-start sm:self-auto">
              Estimated Raw Cost: ~₹950 / customer / mo
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#021024]/60 border border-slate-200/90 dark:border-[#5483B3]/25 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#1D64C2] dark:text-[#C1E8FF]" /> Plivo India Telephony
                </span>
                <span className="text-[11px] font-mono text-slate-400">~₹400/DID + usage</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Dedicated +91 virtual number rental (~₹400/mo) plus inbound/outbound pulse rate of ~₹0.60/min.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#021024]/60 border border-slate-200/90 dark:border-[#5483B3]/25 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-[#5483B3] dark:text-[#7DA0CA]" /> Sarvam AI & Cartesia
                </span>
                <span className="text-[11px] font-mono text-slate-400">~₹0.20 – ₹2.50/min</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Sarvam AI Indic STT/TTS (Saaras/Bulbul) is ultra-cost effective (~₹0.20/min). Cartesia Sonic handles sub-100ms English.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#021024]/60 border border-slate-200/90 dark:border-[#5483B3]/25 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Cloud className="w-3.5 h-3.5 text-[#7DA0CA] dark:text-[#C1E8FF]" /> Cloudinary & Firebase
                </span>
                <span className="text-[11px] font-mono text-[#1D64C2] dark:text-[#C1E8FF] font-bold">₹0 Free Tier</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Cloudinary's free 25GB storage tier handles thousands of dual-track call audio recordings. Firebase handles 50k reads/day for free.
              </p>
            </div>
          </div>
        </div>

        {/* 4. FREQUENTLY ASKED QUESTIONS ACCORDION */}
        <PricingFAQ />
      </div>

      {/* Razorpay Checkout Modal */}
      {selectedPlanForPayment && (
        <RazorpayPaymentModal
          isOpen={isRazorpayOpen}
          onClose={() => setIsRazorpayOpen(false)}
          defaultPlan={selectedPlanForPayment}
          onPaymentSuccess={() => {
            setIsRazorpayOpen(false);
            onSelectPlan(selectedPlanForPayment.name.toLowerCase(), billingCycle);
          }}
        />
      )}
    </div>
  );
};
