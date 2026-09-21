import React, { useState } from 'react';
import { CreditCard, CheckCircle2, Download, Sparkles, ShieldCheck, ArrowRight, Zap, X, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Call } from '../../types';

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
  const [currentPlan] = useState(billingInfo?.plan || 'Apollo Healthcare Enterprise');
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
  const [selectedPack, setSelectedPack] = useState({ minutes: 500, price: 40 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Dynamic calculation
  const totalMinutesUsed = billingInfo?.minutesUsed || Math.round(calls.reduce((acc, c) => acc + c.durationSeconds, 0) / 60);
  const totalMinutesAllowance = (billingInfo?.monthlyMinutesIncluded || 1000) + (billingInfo?.addonMinutes || 0);
  const remainingMinutes = Math.max(0, totalMinutesAllowance - totalMinutesUsed);
  const usagePercentage = Math.min(100, Math.round((totalMinutesUsed / totalMinutesAllowance) * 100));

  const [invoices, setInvoices] = useState([
    { id: 'INV-2026-009', date: 'Sep 01, 2026', amount: '$79.00', plan: 'Enterprise Tier', status: 'Paid' },
    { id: 'INV-2026-008', date: 'Aug 01, 2026', amount: '$79.00', plan: 'Enterprise Tier', status: 'Paid' },
    { id: 'INV-2026-007', date: 'Jul 01, 2026', amount: '$79.00', plan: 'Enterprise Tier', status: 'Paid' },
  ]);

  const handleSimulateRazorpay = async () => {
    setIsProcessing(true);
    try {
      if (onTopup) {
        await onTopup(selectedPack.minutes, selectedPack.price);
      }
      confetti({ particleCount: 75, spread: 70 });
      setPaymentSuccess(true);
      setInvoices((prev) => [
        {
          id: `INV-2026-${String(invoices.length + 10).padStart(3, '0')}`,
          date: 'Just now',
          amount: `$${selectedPack.price}.00`,
          plan: `Top-Up (+${selectedPack.minutes} Mins)`,
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
      `AURIS AI TELEPHONY PLATFORM - OFFICIAL TAX INVOICE`,
      `=============================================================`,
      `Invoice Number:     ${inv.id}`,
      `Date of Issue:      ${inv.date}`,
      `Billed To:          Apollo Clinic Koramangala (acc_apollo_blr)`,
      `GSTIN / Tax ID:     29AABCA1234F1Z8`,
      `Payment Gateway:    Razorpay Verified Merchant (live_mode)`,
      `Item Description:   ${inv.plan}`,
      `Total Paid:         ${inv.amount}`,
      `Payment Status:     ${inv.status.toUpperCase()}`,
      `-------------------------------------------------------------`,
      `Thank you for trusting Auris Voice Agents with your practice.`,
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
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#123047] tracking-tight">Billing & Minutes Allocation</h1>
        <p className="text-xs text-[#52636D] mt-0.5">
          Manage your Auris subscription tier, top-up minutes, and download verified Razorpay invoices.
        </p>
      </div>

      {/* Plan Card & Minute Quota */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Plan Card */}
        <div className="bg-white rounded-2xl p-6 border border-[#DDEBEF] shadow-xs space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#38A85B] bg-[#EFFAF1] px-2.5 py-0.5 rounded-full">
                Active Subscription
              </span>
              <h3 className="text-2xl font-extrabold text-[#123047] mt-1">{currentPlan}</h3>
              <p className="text-xs text-[#52636D]">$79 / month • Billed monthly via Razorpay</p>
            </div>
            <span className="text-xs font-bold text-[#2189C8]">Renews Oct 01, 2026</span>
          </div>

          <div className="pt-2 border-t border-[#DDEBEF] space-y-2 text-xs text-[#52636D]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#38A85B]" />
              <span>{totalMinutesAllowance.toLocaleString()} telephony minutes available</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#38A85B]" />
              <span>Unlimited active AI voice agents with live Google Calendar sync</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#38A85B]" />
              <span>Dedicated Bangalore DID line with OmniDimension Tier-1 SIP trunk</span>
            </div>
          </div>
        </div>

        {/* Minutes Usage & Top-Up Card */}
        <div className="bg-white rounded-2xl p-6 border border-[#DDEBEF] shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-[#123047]">Current Usage Meter</h4>
            <div className="flex justify-between text-xs font-bold text-[#123047]">
              <span>{totalMinutesUsed.toLocaleString()} / {totalMinutesAllowance.toLocaleString()} minutes</span>
              <span className="text-[#38A85B]">{remainingMinutes.toLocaleString()} mins remaining</span>
            </div>
            <div className="w-full bg-[#EEF4F6] rounded-full h-3 overflow-hidden">
              <div
                className="bg-[#38A85B] h-3 rounded-full transition-all duration-500"
                style={{ width: `${usagePercentage}%` }}
              />
            </div>
            <p className="text-[11px] text-[#82919A]">
              Dynamic database synchronization • Overage protected with auto-scale
            </p>
          </div>

          <button
            onClick={() => setIsRechargeModalOpen(true)}
            className="w-full py-2.5 rounded-xl bg-[#38A85B] hover:bg-[#2f8f4d] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
          >
            <Zap className="w-4 h-4" />
            Add-On Minutes Top-Up
          </button>
        </div>
      </div>

      {/* Invoice History */}
      <div className="bg-white rounded-2xl border border-[#DDEBEF] shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-[#DDEBEF] flex justify-between items-center">
          <h4 className="text-sm font-bold text-[#123047]">Billing History & Tax Receipts</h4>
          <span className="text-xs text-[#82919A]">Verified Razorpay Merchant ID: acc_auris_live</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5FAFC] border-b border-[#DDEBEF] text-[#82919A] font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-6">Invoice Ref</th>
                <th className="py-3 px-6">Date</th>
                <th className="py-3 px-6">Plan / Item</th>
                <th className="py-3 px-6">Amount Paid</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDEBEF] text-[#123047]">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-[#F5FAFC]">
                  <td className="py-3.5 px-6 font-mono font-bold">{inv.id}</td>
                  <td className="py-3.5 px-6">{inv.date}</td>
                  <td className="py-3.5 px-6">{inv.plan}</td>
                  <td className="py-3.5 px-6 font-mono font-bold">{inv.amount}</td>
                  <td className="py-3.5 px-6">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EFFAF1] text-[#38A85B]">
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <button
                      onClick={() => handleDownloadInvoice(inv)}
                      className="px-2.5 py-1 rounded-lg border border-[#DDEBEF] hover:border-[#2189C8] hover:text-[#2189C8] text-[11px] font-semibold flex items-center gap-1 ml-auto cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      Download
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#123047]/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#DDEBEF] relative">
            <button
              onClick={() => setIsRechargeModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full text-[#82919A] hover:text-[#123047]"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-[#123047] mb-1">Add-On Telephony Minutes</h3>
            <p className="text-xs text-[#52636D] mb-6">
              Instant carrier credit reload via Razorpay secure gateway.
            </p>

            {paymentSuccess ? (
              <div className="p-6 rounded-2xl bg-[#EFFAF1] border border-[#65C978]/40 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-[#38A85B] mx-auto animate-bounce" />
                <h4 className="text-base font-bold text-[#123047]">Payment Successful!</h4>
                <p className="text-xs text-[#52636D]">
                  +{selectedPack.minutes} minutes added to your account balance.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#123047]">Select Minute Pack</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { minutes: 250, price: 22 },
                      { minutes: 500, price: 40 },
                      { minutes: 1000, price: 75 },
                    ].map((pack) => (
                      <button
                        key={pack.minutes}
                        type="button"
                        onClick={() => setSelectedPack(pack)}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          selectedPack.minutes === pack.minutes
                            ? 'border-[#38A85B] bg-[#EFFAF1] text-[#123047]'
                            : 'border-[#DDEBEF] text-[#52636D] hover:bg-[#F5FAFC]'
                        }`}
                      >
                        <p className="text-sm font-extrabold">{pack.minutes}</p>
                        <p className="text-[10px] text-[#82919A]">mins</p>
                        <p className="text-xs font-bold text-[#38A85B] mt-1">${pack.price}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#F5FAFC] border border-[#DDEBEF] space-y-2 text-xs">
                  <div className="flex justify-between text-[#52636D]">
                    <span>Rate per minute:</span>
                    <span className="font-bold text-[#123047]">${(selectedPack.price / selectedPack.minutes).toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between text-[#52636D]">
                    <span>Expiry:</span>
                    <span className="font-bold text-[#123047]">Never expires</span>
                  </div>
                  <div className="pt-2 border-t border-[#DDEBEF] flex justify-between font-bold text-sm text-[#123047]">
                    <span>Total Charge:</span>
                    <span>${selectedPack.price}.00</span>
                  </div>
                </div>

                <button
                  onClick={handleSimulateRazorpay}
                  disabled={isProcessing}
                  className="w-full py-3 rounded-xl bg-[#38A85B] hover:bg-[#2f8f4d] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Processing Razorpay Payment...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      Pay ${selectedPack.price}.00 via Razorpay
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
