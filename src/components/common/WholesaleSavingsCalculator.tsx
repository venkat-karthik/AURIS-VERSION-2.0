import React, { useState } from 'react';
import {
  Calculator,
  TrendingDown,
  Sparkles,
  Zap,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  Layers,
  PhoneCall,
  Clock,
  DollarSign,
  Info,
} from 'lucide-react';

interface WholesaleSavingsCalculatorProps {
  initialMinutes?: number;
  className?: string;
  showTitle?: boolean;
}

export const WholesaleSavingsCalculator: React.FC<WholesaleSavingsCalculatorProps> = ({
  initialMinutes = 3000,
  className = '',
  showTitle = true,
}) => {
  const [minutes, setMinutes] = useState(initialMinutes);
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');

  // Rates per minute
  // Auris Direct Wholesale
  const plivoRateInr = 0.38;
  const sarvamSttRateInr = 0.50;
  const geminiLlmRateInr = 0.08;
  const ttsRateInr = 1.00; // Sarvam Bulbul Indic or Cartesia Sonic
  const aurisPerMinuteInr = plivoRateInr + sarvamSttRateInr + geminiLlmRateInr + ttsRateInr; // ₹1.96 / min

  // Middleman platforms
  const vapiPerMinuteInr = 14.15; // ~$0.17 / min
  const retellPerMinuteInr = 12.50; // ~$0.15 / min
  const humanSeatCostInr = 22000; // 1 full-time receptionist / call center seat (~1200 mins capacity)

  // Calculations
  const aurisMonthlyTotalInr = Math.round(minutes * aurisPerMinuteInr);
  const vapiMonthlyTotalInr = Math.round(minutes * vapiPerMinuteInr);
  const retellMonthlyTotalInr = Math.round(minutes * retellPerMinuteInr);
  
  // Savings vs Retell/Vapi average (~13.32/min)
  const middlemanAverageInr = Math.round(minutes * 13.32);
  const monthlySavingsInr = middlemanAverageInr - aurisMonthlyTotalInr;
  const annualSavingsInr = monthlySavingsInr * 12;
  const savingsPercent = Math.round(((middlemanAverageInr - aurisMonthlyTotalInr) / middlemanAverageInr) * 100);

  // Conversion helper
  const inrToUsdRate = 0.012; // 1 INR ~ 0.012 USD
  const formatAmount = (inr: number) => {
    if (currency === 'USD') {
      const usd = Math.round(inr * inrToUsdRate);
      return `$${usd.toLocaleString('en-US')}`;
    }
    return `₹${inr.toLocaleString('en-IN')}`;
  };

  const quickPills = [1000, 2500, 5000, 10000, 25000];

  return (
    <div
      className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-b from-white to-slate-50 dark:from-[#090D16] dark:to-[#040711] p-6 sm:p-8 shadow-xl transition-all ${className}`}
    >
      {showTitle && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#6366F1]/15 text-[#6366F1] dark:text-[#818CF8] border border-[#6366F1]/30 mb-2">
              <Calculator className="w-3.5 h-3.5" />
              <span>Unbundled Pay-As-You-Go ROI Engine</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Auris Wholesale vs. Platform Middleman Calculator
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              See exact monthly & annual cost differences when using direct unbundled provider rates (Plivo + Sarvam + Cartesia) vs. 700% middleman markups.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Currency:</span>
            <div className="inline-flex p-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setCurrency('INR')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                  currency === 'INR'
                    ? 'bg-[#6366F1] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                ₹ INR
              </button>
              <button
                type="button"
                onClick={() => setCurrency('USD')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                  currency === 'USD'
                    ? 'bg-[#6366F1] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                $ USD
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Volume Slider */}
      <div className="space-y-4 mb-8">
        <div className="flex justify-between items-end">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#6366F1]" />
              Estimated Monthly Calling Minutes
            </label>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              {minutes.toLocaleString()} <span className="text-sm font-semibold text-slate-500">minutes / mo</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-medium text-slate-500">Approx. Calls:</span>
            <div className="text-base font-bold text-[#6366F1]">
              ~{Math.round(minutes / 2.4).toLocaleString()} calls
            </div>
          </div>
        </div>

        <input
          type="range"
          min="500"
          max="30000"
          step="500"
          value={minutes}
          onChange={(e) => setMinutes(parseInt(e.target.value, 10))}
          className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#6366F1]"
        />

        {/* Quick select pills */}
        <div className="flex flex-wrap gap-2 pt-1">
          {quickPills.map((pill) => (
            <button
              key={pill}
              type="button"
              onClick={() => setMinutes(pill)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                minutes === pill
                  ? 'bg-[#6366F1] text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-[#6366F1]/50'
              }`}
            >
              {pill >= 1000 ? `${pill / 1000}k mins` : `${pill} mins`}
            </button>
          ))}
        </div>
      </div>

      {/* Main KPI Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Auris Wholesale */}
        <div className="relative rounded-xl p-5 border-2 border-[#6366F1] bg-[#6366F1]/5 dark:bg-[#6366F1]/10 shadow-lg shadow-[#6366F1]/10">
          <div className="absolute -top-3 left-4 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#6366F1] text-white">
            Direct Wholesale (Auris)
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Monthly Bill</span>
            <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
              Pure Cost ₹1.96/m
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">
            {formatAmount(aurisMonthlyTotalInr)}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Pay Plivo + Sarvam + Cartesia directly. Zero per-minute commission or middleman toll.
          </p>
        </div>

        {/* Vapi.ai Middleman */}
        <div className="rounded-xl p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Vapi.ai Middleman</span>
            <span className="text-[11px] font-semibold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded">
              ~₹14.15/m
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">
            {formatAmount(vapiMonthlyTotalInr)}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            720% markup added on top of basic Twilio/Deepgram telephony & audio streams.
          </p>
        </div>

        {/* Retell AI Middleman */}
        <div className="rounded-xl p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Retell AI Middleman</span>
            <span className="text-[11px] font-semibold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded">
              ~₹12.50/m
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">
            {formatAmount(retellMonthlyTotalInr)}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            630% markup plus locked proprietary voice routing without Indic regional specialization.
          </p>
        </div>
      </div>

      {/* Savings Highlight Banner */}
      <div className="rounded-xl p-5 bg-gradient-to-r from-emerald-500/15 via-[#6366F1]/15 to-emerald-500/10 border border-emerald-500/30 dark:border-emerald-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white">
              {savingsPercent}% Margin Retained
            </span>
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
              Direct In-Pocket Profit Savings
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            Save {formatAmount(monthlySavingsInr)} / month
            <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 ml-2">
              ({formatAmount(annualSavingsInr)} / year)
            </span>
          </div>
        </div>
        <div className="text-xs text-slate-600 dark:text-slate-300 max-w-xs text-left sm:text-right">
          By connecting your own Plivo carrier trunk and Sarvam AI keys, your business keeps the margins.
        </div>
      </div>

      {/* Unit Cost Breakdown Table */}
      <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-[#6366F1]" />
          Transparent Wholesale Cost Breakdown (Per Minute)
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Plivo India PSTN</span>
            <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">₹0.38 / min</div>
            <div className="text-[10px] text-slate-500">30-sec pulse E.164</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Sarvam Indic STT</span>
            <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">₹0.50 / min</div>
            <div className="text-[10px] text-slate-500">Saaras 8kHz low-latency</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Gemini 3.8 Flash</span>
            <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">₹0.08 / min</div>
            <div className="text-[10px] text-slate-500">Grounded AI reasoning</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Bulbul / Cartesia TTS</span>
            <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">₹1.00 / min</div>
            <div className="text-[10px] text-slate-500">Telugu / Hindi / Sonic</div>
          </div>
        </div>
      </div>
    </div>
  );
};

