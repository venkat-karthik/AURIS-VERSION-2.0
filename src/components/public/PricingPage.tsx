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
import { WholesaleSavingsCalculator } from '../common/WholesaleSavingsCalculator';

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
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6366F1', '#334155', '#818CF8', '#090D16', '#3B82F6'],
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
    <div className="py-16 bg-white dark:bg-[#030712] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with animated entrance */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-center max-w-3xl mx-auto mb-12 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#090D16]/15 dark:bg-[#090D16]/40 border border-[#6366F1]/30 dark:border-[#94A3B8]/30 text-xs font-bold text-[#6366F1] dark:text-[#818CF8] shadow-2xs">
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
            <div className="inline-flex items-center bg-white dark:bg-[#090D16]/60 p-1 rounded-xl border border-slate-200 dark:border-[#334155]/30 shadow-2xs">
              <button
                onClick={() => setCurrency('INR')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  currency === 'INR'
                    ? 'bg-[#030712] text-white dark:bg-[#090D16] dark:text-[#818CF8] shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 dark:text-[#94A3B8] dark:hover:text-[#818CF8]'
                }`}
              >
                ₹ INR (India)
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  currency === 'USD'
                    ? 'bg-[#030712] text-white dark:bg-[#090D16] dark:text-[#818CF8] shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 dark:text-[#94A3B8] dark:hover:text-[#818CF8]'
                }`}
              >
                $ USD (Global)
              </button>
            </div>

            {/* Billing Cycle Toggle with Gliding Spring Pill */}
            <div className="inline-flex items-center bg-white dark:bg-[#090D16]/60 p-1 rounded-xl border border-slate-200 dark:border-[#334155]/30 shadow-2xs relative">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`relative px-4 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer select-none ${
                  billingCycle === 'monthly'
                    ? 'text-white'
                    : 'text-slate-500 hover:text-slate-900 dark:text-[#94A3B8] dark:hover:text-[#818CF8]'
                }`}
              >
                {billingCycle === 'monthly' && (
                  <motion.span
                    layoutId="pricing-billing-cycle-pill"
                    className="absolute inset-0 bg-gradient-to-r from-[#090D16] via-[#6366F1] to-[#2563EB] rounded-lg shadow-xs z-0"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">Monthly</span>
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`relative px-4 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 select-none ${
                  billingCycle === 'yearly'
                    ? 'text-white'
                    : 'text-slate-500 hover:text-slate-900 dark:text-[#94A3B8] dark:hover:text-[#818CF8]'
                }`}
              >
                {billingCycle === 'yearly' && (
                  <motion.span
                    layoutId="pricing-billing-cycle-pill"
                    className="absolute inset-0 bg-gradient-to-r from-[#090D16] via-[#6366F1] to-[#2563EB] rounded-lg shadow-xs z-0"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">Annual Commit</span>
                <span className="relative z-10 px-1.5 py-0.2 text-[9px] bg-white/20 text-[#818CF8] rounded font-extrabold animate-pulse">
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
                className={`relative bg-white dark:bg-[#090D16]/30 rounded-3xl p-6 border flex flex-col justify-between transition-all ${
                  isPopular
                    ? 'border-[#6366F1] shadow-xl ring-2 ring-[#6366F1]/25'
                    : 'border-slate-200 dark:border-[#334155]/25 shadow-xs hover:border-[#94A3B8]/50'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-[#090D16] via-[#6366F1] to-[#2563EB] text-white text-[10px] font-black tracking-wider uppercase shadow-xs flex items-center gap-1 border border-[#94A3B8]/40">
                    <Sparkles className="w-3 h-3 text-[#818CF8]" />
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

                  <div className="flex items-baseline gap-1 mb-5 pb-5 border-b border-slate-100 dark:border-[#334155]/25">
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
                    <div className="text-xs flex items-center justify-between py-1.5 px-2.5 rounded-xl bg-slate-50 dark:bg-[#030712]/60 border border-slate-100 dark:border-[#334155]/25">
                      <span className="text-slate-500 dark:text-slate-400">Included Minutes</span>
                      <span className="font-extrabold text-[#6366F1] dark:text-[#818CF8] font-mono">
                        {plan.minutesIncluded.toLocaleString()} min
                      </span>
                    </div>
                    <div className="text-xs flex items-center justify-between py-1.5 px-2.5 rounded-xl bg-slate-50 dark:bg-[#030712]/60 border border-slate-100 dark:border-[#334155]/25">
                      <span className="text-slate-500 dark:text-slate-400">Plivo India (+91 DID)</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {plan.phoneNumbersLimit} Number{plan.phoneNumbersLimit > 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="text-xs flex items-center justify-between py-1.5 px-2.5 rounded-xl bg-slate-50 dark:bg-[#030712]/60 border border-slate-100 dark:border-[#334155]/25">
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
                        <Check className="w-3.5 h-3.5 text-[#6366F1] dark:text-[#818CF8] flex-shrink-0 mt-0.5" />
                        <span className="leading-snug">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 mt-auto pt-4 border-t border-slate-100 dark:border-[#334155]/25">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    id={`select-plan-${plan.id}-btn`}
                    onClick={() => handleSelect(plan.id)}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs ${
                      isPopular
                        ? 'bg-gradient-to-r from-[#090D16] via-[#6366F1] to-[#2563EB] hover:from-[#6366F1] hover:to-[#3B82F6] text-white shadow-md shadow-[#6366F1]/20 animate-shimmer'
                        : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-[#030712] dark:hover:bg-[#030712]/80'
                    }`}
                  >
                    <span>Choose {plan.name}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </motion.button>

                  <button
                    type="button"
                    onClick={() => handleOpenRazorpay(plan)}
                    className="w-full py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-[#818CF8] bg-slate-50 hover:bg-slate-100 dark:bg-[#030712]/50 dark:hover:bg-[#030712] border border-slate-200 dark:border-[#334155]/30 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-[#6366F1] dark:text-[#818CF8]" />
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
          className="bg-white dark:bg-[#090D16]/30 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-[#334155]/25 shadow-sm mb-16"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6366F1] dark:text-[#818CF8] uppercase tracking-wider">
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
                  <span className="text-lg font-mono font-black text-[#6366F1] dark:text-[#818CF8]">
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
                  className="w-full accent-[#6366F1] cursor-pointer h-2 bg-slate-200 dark:bg-[#030712] rounded-lg"
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
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#030712]/60 border border-slate-200/80 dark:border-[#334155]/25 space-y-3">
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
              <div className="p-5 rounded-2xl bg-[#090D16]/15 dark:bg-[#090D16]/60 border border-[#6366F1]/30 dark:border-[#94A3B8]/30 space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between text-xs font-bold text-[#6366F1] dark:text-[#818CF8]">
                  <span>Auris AI Voice Agent</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-[#090D16] to-[#6366F1] text-white font-mono font-bold">
                    Save {savingsPercent}%
                  </span>
                </div>

                <div className="text-2xl font-black text-[#090D16] dark:text-[#818CF8] font-mono">
                  ₹{aiAgentPlanCostInr.toLocaleString()}<span className="text-xs font-normal text-[#6366F1]/80 dark:text-[#94A3B8]">/mo</span>
                </div>

                <div className="text-xs font-bold text-[#090D16] dark:text-[#818CF8] flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-[#6366F1] dark:text-[#818CF8]" />
                  <span>Annual Savings: ₹{(netMonthlySavingsInr * 12).toLocaleString()}</span>
                </div>

                <ul className="text-[11px] text-slate-700 dark:text-[#818CF8]/90 space-y-1.5 pt-1">
                  <li>• 24/7/365 instant pickup (zero wait)</li>
                  <li>• Multilingual Hindi, Telugu, English</li>
                  <li>• Dual-track recordings on Cloudinary</li>
                  <li>• Direct calendar & WhatsApp booking</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Wholesale Pay-As-You-Go ROI Calculator */}
        <div className="mb-16">
          <WholesaleSavingsCalculator />
        </div>

        {/* 3. TRANSPARENT UNIT ECONOMICS & INFRASTRUCTURE BREAKDOWN */}
        <div className="bg-slate-50 dark:bg-[#090D16]/20 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-[#334155]/25 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#6366F1] dark:text-[#818CF8]" />
                <h3 className="text-base font-black text-slate-950 dark:text-white">
                  Transparent Infrastructure COGS Breakdown
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                How our stack operates efficiently in India to yield 70–80% gross profit margins:
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#090D16]/15 text-[#6366F1] dark:bg-[#090D16]/50 dark:text-[#818CF8] border border-[#6366F1]/30 dark:border-[#94A3B8]/30 self-start sm:self-auto">
              Estimated Raw Cost: ~₹950 / customer / mo
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#030712]/60 border border-slate-200/90 dark:border-[#334155]/25 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#6366F1] dark:text-[#818CF8]" /> Plivo India Telephony
                </span>
                <span className="text-[11px] font-mono text-slate-400">~₹400/DID + usage</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Dedicated +91 virtual number rental (~₹400/mo) plus inbound/outbound pulse rate of ~₹0.60/min.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#030712]/60 border border-slate-200/90 dark:border-[#334155]/25 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-[#334155] dark:text-[#94A3B8]" /> Sarvam AI & Cartesia
                </span>
                <span className="text-[11px] font-mono text-slate-400">~₹0.20 – ₹2.50/min</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Sarvam AI Indic STT/TTS (Saaras/Bulbul) is ultra-cost effective (~₹0.20/min). Cartesia Sonic handles sub-100ms English.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#030712]/60 border border-slate-200/90 dark:border-[#334155]/25 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Cloud className="w-3.5 h-3.5 text-[#94A3B8] dark:text-[#818CF8]" /> Cloudinary & Firebase
                </span>
                <span className="text-[11px] font-mono text-[#6366F1] dark:text-[#818CF8] font-bold">₹0 Free Tier</span>
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
