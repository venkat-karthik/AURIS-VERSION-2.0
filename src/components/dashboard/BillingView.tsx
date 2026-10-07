import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, CheckCircle2, Download, Sparkles, ShieldCheck, ArrowRight, Zap, X, RefreshCw, Phone, Cloud, TrendingUp } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Call } from '../../types';
import { RazorpayPaymentModal } from '../common/RazorpayPaymentModal';

interface BillingViewProps {
  calls?: Call[];
  billingInfo?: {
    plan: string;
    status: string;
    monthlyMinutesIncluded: number;
    minutesUsed: number;
    addonMinutes: number;
    billingCycleEnd: string;
  };
  onTopup?: (minutes: number, amount: number) => Promise<any>;
}

export const BillingView: React.FC<BillingViewProps> = ({ calls = [], billingInfo, onTopup }) => {
  const [currentPlan] = useState(billingInfo?.plan || 'Growth & Real Estate Plan');
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
  const [isRazorpayModalOpen, setIsRazorpayModalOpen] = useState(false);
  const [selectedPack, setSelectedPack] = useState({ minutes: 500, priceInr: 1999 });
  const [razorpayPlan, setRazorpayPlan] = useState({
    name: 'Growth Voice Pack',
    minutes: 500,
    priceInr: 1999,
    priceUsd: 24,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Dynamic calculation
  const totalMinutesUsed = billingInfo?.minutesUsed || Math.round(calls.reduce((acc, c) => acc + c.durationSeconds, 0) / 60);
  const totalMinutesAllowance = (billingInfo?.monthlyMinutesIncluded || 1200) + (billingInfo?.addonMinutes || 0);
  const remainingMinutes = Math.max(0, totalMinutesAllowance - totalMinutesUsed);
  const usagePercentage = Math.min(100, Math.round((totalMinutesUsed / totalMinutesAllowance) * 100));

  const [invoices, setInvoices] = useState([
    { id: 'INV-2026-009', date: 'Sep 01, 2026', amount: '₹9,999.00', plan: 'Growth Plan (1,200 Mins)', status: 'Paid' },
    { id: 'INV-2026-008', date: 'Aug 01, 2026', amount: '₹9,999.00', plan: 'Growth Plan (1,200 Mins)', status: 'Paid' },
    { id: 'INV-2026-007', date: 'Jul 01, 2026', amount: '₹9,999.00', plan: 'Growth Plan (1,200 Mins)', status: 'Paid' },
  ]);

  const handleSimulateRazorpay = async () => {
    setIsProcessing(true);
    try {
      if (onTopup) {
        await onTopup(selectedPack.minutes, selectedPack.priceInr);
      }
      confetti({ particleCount: 75, spread: 70 });
      setPaymentSuccess(true);
      setInvoices((prev) => [
        {
          id: `INV-2026-${String(invoices.length + 10).padStart(3, '0')}`,
          date: 'Just now',
          amount: `₹${selectedPack.priceInr.toLocaleString()}.00`,
          plan: `Add-On Top-Up (+${selectedPack.minutes} Mins)`,
          status: 'Paid',
        },
        ...prev,
      ]);
      setTimeout(() => {
        setIsProcessing(false);
        setPaymentSuccess(false);
        setIsRechargeModalOpen(false);
      }, 1500);
    } catch (err: any) {
      setIsProcessing(false);
      alert('Payment processing failed: ' + err.message);
    }
  };

  const handleDownloadInvoice = (inv: { id: string; date: string; amount: string; plan: string; status: string }) => {
    const text = [
      `=============================================================`,
      `AURIS AI TELEPHONY PLATFORM - GST TAX INVOICE`,
      `=============================================================`,
      `Invoice Number:     ${inv.id}`,
      `Date of Issue:      ${inv.date}`,
      `Billed To:          Auris Enterprise Workspace (karthikvenkat316@gmail.com)`,
      `GSTIN / Tax ID:     29AABCA1234F1Z8 (Karnataka, India)`,
      `Payment Gateway:    Razorpay Verified Merchant (live_mode)`,
      `Telephony Provider: Plivo India Telecom (+91 DID Allocation)`,
      `Voice Infrastructure: Cartesia Sonic & Sarvam AI Indic Engine`,
      `Item Description:   ${inv.plan}`,
      `Total Paid:         ${inv.amount}`,
      `Payment Status:     ${inv.status.toUpperCase()}`,
      `-------------------------------------------------------------`,
      `Thank you for deploying Auris Voice Agents.`,
      `=============================================================`,
    ].join('\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${inv.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight">Billing & Quotas</h1>
        <p className="text-xs text-slate-500 dark:text-[#7DA0CA] mt-1">
          Manage your Auris subscription tier, pooled minutes, and download verified Razorpay GST tax receipts.
        </p>
      </div>

      {/* Plan Card & Minute Quota */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Plan Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#052659]/30 rounded-3xl p-6 border border-slate-200/90 dark:border-[#5483B3]/25 shadow-xs space-y-4"
        >
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#1D64C2] dark:text-[#C1E8FF] bg-[#1D64C2]/15 dark:bg-[#021024]/80 px-2.5 py-0.5 rounded-full border border-[#1D64C2]/30 dark:border-[#1D64C2]/40 font-mono">
                Active B2B Tier
              </span>
              <h3 className="text-xl font-black text-slate-950 dark:text-white mt-1.5">{currentPlan}</h3>
              <p className="text-xs text-slate-500 dark:text-[#7DA0CA]">
                ₹9,999 / month • Billed via Razorpay Auto-Debit
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-[#1D64C2] dark:text-[#C1E8FF] bg-[#1D64C2]/10 dark:bg-[#021024]/60 px-2.5 py-1 rounded-xl border border-[#1D64C2]/30">
              Renews Oct 01, 2026
            </span>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-[#5483B3]/20 space-y-2 text-xs text-slate-600 dark:text-[#7DA0CA]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#1D64C2] dark:text-[#C1E8FF]" />
              <span>{totalMinutesAllowance.toLocaleString()} pooled minutes included every billing cycle</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#1D64C2] dark:text-[#C1E8FF]" />
              <span>2 Dedicated +91 Indian Phone Numbers via Plivo India</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#1D64C2] dark:text-[#C1E8FF]" />
              <span>Sarvam AI Indic Models + Cartesia Sonic Sub-100ms Voice</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#1D64C2] dark:text-[#C1E8FF]" />
              <span>100% Dual-track call recordings archived to Cloudinary</span>
            </div>
          </div>
        </motion.div>

        {/* Minutes Usage & Top-Up Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="bg-white dark:bg-[#052659]/30 rounded-3xl p-6 border border-slate-200/90 dark:border-[#5483B3]/25 shadow-xs flex flex-col justify-between space-y-4"
        >
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-950 dark:text-white">Live Telephony Usage Meter</h4>
              <span className="text-[11px] font-mono text-[#1D64C2] dark:text-[#C1E8FF] font-bold">
                {remainingMinutes.toLocaleString()} mins available
              </span>
            </div>

            <div className="flex justify-between text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
              <span>{totalMinutesUsed.toLocaleString()} mins used</span>
              <span>{totalMinutesAllowance.toLocaleString()} mins total pool</span>
            </div>

            <div className="w-full bg-slate-100 dark:bg-[#021024] rounded-full h-3 overflow-hidden border border-transparent dark:border-[#5483B3]/20">
              <div
                className="bg-gradient-to-r from-[#052659] via-[#1D64C2] to-[#2563EB] h-3 rounded-full transition-all duration-500"
                style={{ width: `${usagePercentage}%` }}
              />
            </div>

            <p className="text-[11px] text-slate-400 dark:text-[#7DA0CA]">
              Telephony pulses synced in real time with Plivo India and OmniDimension dispatch servers.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setRazorpayPlan({
                  name: `Telephony Pack (+${selectedPack.minutes} Mins)`,
                  minutes: selectedPack.minutes,
                  priceInr: selectedPack.priceInr,
                  priceUsd: Math.round(selectedPack.priceInr / 85),
                });
                setIsRazorpayModalOpen(true);
              }}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#052659] via-[#1D64C2] to-[#2563EB] hover:from-[#1D64C2] hover:to-[#3B82F6] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-[#1D64C2]/20 cursor-pointer transition-all"
            >
              <CreditCard className="w-4 h-4" />
              <span>Pay ₹{selectedPack.priceInr.toLocaleString()} via Razorpay</span>
            </button>
            <button
              onClick={() => setIsRechargeModalOpen(true)}
              className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-[#5483B3]/30 bg-slate-50 dark:bg-[#021024]/70 text-slate-700 dark:text-[#C1E8FF] text-xs font-bold hover:bg-slate-100 dark:hover:bg-[#021024] cursor-pointer flex items-center gap-1 transition-colors"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Packs</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Invoice History */}
      <div className="bg-white dark:bg-[#052659]/30 rounded-3xl border border-slate-200/90 dark:border-[#5483B3]/25 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-[#5483B3]/20 flex flex-wrap justify-between items-center gap-2">
          <h4 className="text-sm font-bold text-slate-950 dark:text-white">Billing History & GST Tax Receipts</h4>
          <span className="text-xs text-slate-400 dark:text-[#7DA0CA] font-mono">Razorpay Live Gateway: acc_auris_live</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#021024]/60 border-b border-slate-100 dark:border-[#5483B3]/20 text-slate-400 dark:text-[#7DA0CA] font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-6">Invoice Ref</th>
                <th className="py-3 px-6">Date</th>
                <th className="py-3 px-6">Plan / Item</th>
                <th className="py-3 px-6">Amount Paid</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#5483B3]/20 text-slate-800 dark:text-slate-200">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-[#052659]/40 transition-colors">
                  <td className="py-3.5 px-6 font-mono font-bold text-slate-950 dark:text-white">{inv.id}</td>
                  <td className="py-3.5 px-6 text-slate-600 dark:text-[#7DA0CA]">{inv.date}</td>
                  <td className="py-3.5 px-6">{inv.plan}</td>
                  <td className="py-3.5 px-6 font-mono font-bold text-[#1D64C2] dark:text-[#C1E8FF]">{inv.amount}</td>
                  <td className="py-3.5 px-6">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1D64C2]/15 text-[#1D64C2] dark:bg-[#1D64C2]/25 dark:text-[#C1E8FF] border border-[#1D64C2]/30">
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <button
                      onClick={() => handleDownloadInvoice(inv)}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-[#5483B3]/30 hover:border-[#1D64C2] hover:text-[#1D64C2] dark:hover:text-[#C1E8FF] text-[11px] font-semibold flex items-center gap-1 ml-auto cursor-pointer transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download Receipt</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: TOP-UP MINUTES */}
      {isRechargeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#021024]/80 backdrop-blur-md">
          <div className="bg-white dark:bg-[#052659] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-[#5483B3]/30 relative">
            <button
              onClick={() => setIsRechargeModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-slate-950 dark:text-white mb-1">Add-On Telephony Minutes</h3>
            <p className="text-xs text-slate-500 dark:text-[#7DA0CA] mb-6">
              Instant carrier credit reload via Razorpay / UPI secure gateway.
            </p>

            {paymentSuccess ? (
              <div className="p-6 rounded-2xl bg-[#021024]/60 border border-[#1D64C2]/40 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-[#C1E8FF] mx-auto animate-bounce" />
                <h4 className="text-base font-bold text-slate-950 dark:text-white">Payment Confirmed!</h4>
                <p className="text-xs text-slate-600 dark:text-[#7DA0CA]">
                  +{selectedPack.minutes} minutes added to your account balance.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#7DA0CA]">Select Minute Pack</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { minutes: 250, priceInr: 999 },
                      { minutes: 500, priceInr: 1999 },
                      { minutes: 1000, priceInr: 3499 },
                    ].map((pack) => (
                      <button
                        key={pack.minutes}
                        type="button"
                        onClick={() => setSelectedPack(pack)}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          selectedPack.minutes === pack.minutes
                            ? 'border-[#1D64C2] bg-[#1D64C2]/15 dark:bg-[#021024]/80 text-slate-950 dark:text-white shadow-2xs'
                            : 'border-slate-200 dark:border-[#5483B3]/25 text-slate-500 hover:bg-slate-50 dark:hover:bg-[#021024]/40'
                        }`}
                      >
                        <p className="text-sm font-black font-mono">{pack.minutes}</p>
                        <p className="text-[10px] text-slate-400 dark:text-[#7DA0CA]">mins</p>
                        <p className="text-xs font-bold text-[#1D64C2] dark:text-[#C1E8FF] mt-1">₹{pack.priceInr}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#021024]/60 border border-slate-200/80 dark:border-[#5483B3]/25 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-500 dark:text-[#7DA0CA]">
                    <span>Effective rate:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      ₹{(selectedPack.priceInr / selectedPack.minutes).toFixed(2)}/min
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500 dark:text-[#7DA0CA]">
                    <span>Validity:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">Rollover / Never expires</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 dark:border-[#5483B3]/25 flex justify-between font-bold text-sm text-slate-950 dark:text-white">
                    <span>Total Charge:</span>
                    <span className="text-[#1D64C2] dark:text-[#C1E8FF] font-mono">₹{selectedPack.priceInr.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setRazorpayPlan({
                      name: `Add-On Top-Up (${selectedPack.minutes} Mins)`,
                      minutes: selectedPack.minutes,
                      priceInr: selectedPack.priceInr,
                      priceUsd: Math.round(selectedPack.priceInr / 85),
                    });
                    setIsRechargeModalOpen(false);
                    setIsRazorpayModalOpen(true);
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#052659] via-[#1D64C2] to-[#2563EB] hover:from-[#1D64C2] hover:to-[#3B82F6] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-[#1D64C2]/20 cursor-pointer transition-all"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Checkout ₹{selectedPack.priceInr.toLocaleString()} via Razorpay</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Razorpay Checkout Modal */}
      <RazorpayPaymentModal
        isOpen={isRazorpayModalOpen}
        onClose={() => setIsRazorpayModalOpen(false)}
        defaultPlan={razorpayPlan}
        onPaymentSuccess={(details) => {
          if (onTopup) {
            onTopup(details.minutes, details.amount);
          }
          setInvoices((prev) => [
            details.invoice || {
              id: `INV-2026-${String(invoices.length + 10).padStart(3, '0')}`,
              date: 'Just now',
              amount: `₹${details.amount.toLocaleString()}.00`,
              plan: razorpayPlan.name,
              status: 'Paid',
            },
            ...prev,
          ]);
        }}
      />
    </div>
  );
};
