import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WorkspaceWallet, WalletTransaction } from '../../types';
import { aurisApi } from '../../services/apiService';
import {
  Wallet,
  Plus,
  CreditCard,
  QrCode,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Sparkles,
  PhoneCall,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBalanceUpdated?: (newBalance: number) => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  onBalanceUpdated,
}) => {
  const [wallet, setWallet] = useState<WorkspaceWallet | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<number>(500);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'razorpay_upi' | 'razorpay_card'>('razorpay_upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'recharge' | 'ledger' | 'economics'>('recharge');
  const [showQrModal, setShowQrModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchWallet = async () => {
    try {
      const data = await aurisApi.getWallet();
      setWallet(data);
      onBalanceUpdated?.(data.balanceInr);
    } catch (err: any) {
      console.warn('Could not fetch wallet:', err.message);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchWallet();
      setSuccessMessage(null);
      setErrorMessage(null);
      setShowQrModal(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentBalance = wallet?.balanceInr ?? 0;
  const perMinRate = wallet?.perMinuteRateInr ?? 5.0;
  const perSlotRate = wallet?.perSlotRateInr ?? Math.round((perMinRate / 3) * 100) / 100;
  const estimatedMinsLeft = Math.floor(currentBalance / perMinRate);
  const estimatedSlotsLeft = Math.floor(currentBalance / perSlotRate);

  const presets = [
    { amount: 250, label: 'Starter', mins: 50, slots: 156 },
    { amount: 500, label: 'Growth', mins: 100, slots: 312, popular: true },
    { amount: 1500, label: 'Scale', mins: 300, slots: 937 },
    { amount: 5000, label: 'Enterprise', mins: 1000, slots: 3125 },
  ];

  const effectiveRechargeAmount = customAmount ? parseFloat(customAmount) : selectedPreset;

  const handleRecharge = async () => {
    if (isNaN(effectiveRechargeAmount) || effectiveRechargeAmount < 10) {
      setErrorMessage('Please enter a valid recharge amount of at least ₹10');
      return;
    }

    if (paymentMethod === 'razorpay_upi' && !showQrModal) {
      setShowQrModal(true);
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const result = await aurisApi.rechargeWallet(effectiveRechargeAmount, paymentMethod);
      setSuccessMessage(result.message);
      await fetchWallet();
      setCustomAmount('');
      setShowQrModal(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to process recharge');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-[#111827] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Prepaid Telephony Wallet</h2>
              <p className="text-xs text-slate-400">
                Managed Carrier Mesh • ₹{perMinRate.toFixed(2)}/min (₹{perSlotRate.toFixed(2)} per 20s pulse)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Balance Highlight Banner */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-500/15 via-violet-900/20 to-slate-900 border-b border-slate-800/60 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              Available Credits
            </span>
            <div className="text-2xl font-black text-white font-mono mt-0.5">
              ₹{currentBalance.toFixed(2)}
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              ~{estimatedSlotsLeft} Slots (~{estimatedMinsLeft} Mins)
            </span>
            <div className="text-[11px] text-slate-400 mt-1 font-mono">
              20-Second Slot Pulse • No Expiry
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800/80 bg-slate-950/50">
          <button
            onClick={() => setActiveTab('recharge')}
            className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'recharge'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Recharge Credits
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'ledger'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Billing Ledger ({wallet?.transactions?.length ?? 0})
          </button>
          <button
            onClick={() => setActiveTab('economics')}
            className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'economics'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Unit Economics (55% Margin)
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {activeTab === 'recharge' ? (
            showQrModal ? (
              /* Interactive UPI QR Code Modal */
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-indigo-500/30 text-center space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-indigo-400" />
                    <span>Scan with Any UPI App</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-indigo-400">
                    ₹{effectiveRechargeAmount.toFixed(2)}
                  </span>
                </div>

                {/* SVG UPI QR Code Representation */}
                <div className="w-44 h-44 mx-auto p-2 bg-white rounded-2xl shadow-xl flex items-center justify-center relative">
                  <svg className="w-full h-full text-slate-950" viewBox="0 0 100 100" fill="currentColor">
                    {/* Top-left position marker */}
                    <rect x="10" y="10" width="24" height="24" rx="3" fill="#000" />
                    <rect x="14" y="14" width="16" height="16" rx="2" fill="#fff" />
                    <rect x="18" y="18" width="8" height="8" rx="1" fill="#000" />
                    {/* Top-right position marker */}
                    <rect x="66" y="10" width="24" height="24" rx="3" fill="#000" />
                    <rect x="70" y="14" width="16" height="16" rx="2" fill="#fff" />
                    <rect x="74" y="18" width="8" height="8" rx="1" fill="#000" />
                    {/* Bottom-left position marker */}
                    <rect x="10" y="66" width="24" height="24" rx="3" fill="#000" />
                    <rect x="14" y="70" width="16" height="16" rx="2" fill="#fff" />
                    <rect x="18" y="74" width="8" height="8" rx="1" fill="#000" />
                    {/* Mock QR data modules */}
                    <rect x="42" y="12" width="6" height="6" fill="#000" />
                    <rect x="52" y="16" width="6" height="6" fill="#000" />
                    <rect x="42" y="26" width="12" height="6" fill="#000" />
                    <rect x="12" y="44" width="6" height="12" fill="#000" />
                    <rect x="24" y="48" width="8" height="6" fill="#000" />
                    <rect x="44" y="44" width="12" height="12" fill="#6366F1" />
                    <rect x="64" y="44" width="8" height="6" fill="#000" />
                    <rect x="76" y="48" width="12" height="6" fill="#000" />
                    <rect x="42" y="66" width="6" height="10" fill="#000" />
                    <rect x="54" y="74" width="8" height="8" fill="#000" />
                    <rect x="68" y="66" width="10" height="6" fill="#000" />
                    <rect x="82" y="78" width="6" height="10" fill="#000" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="px-1.5 py-0.5 rounded bg-indigo-600 text-white font-mono font-bold text-[9px] shadow-sm">
                      UPI
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-300 font-mono">
                  UPI ID: <span className="font-bold text-indigo-400">aurisvoice@icici</span>
                </div>

                <div className="flex items-center justify-center gap-3 text-[10px] text-slate-400 font-bold">
                  <span className="px-2 py-1 rounded bg-slate-800 text-white">Google Pay</span>
                  <span className="px-2 py-1 rounded bg-slate-800 text-white">PhonePe</span>
                  <span className="px-2 py-1 rounded bg-slate-800 text-white">Paytm</span>
                  <span className="px-2 py-1 rounded bg-slate-800 text-white">Cred</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowQrModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      setIsProcessing(true);
                      try {
                        const result = await aurisApi.rechargeWallet(effectiveRechargeAmount, 'razorpay_upi');
                        setSuccessMessage(result.message);
                        await fetchWallet();
                        setShowQrModal(false);
                      } catch (err: any) {
                        setErrorMessage(err.message || 'Payment simulation failed');
                      } finally {
                        setIsProcessing(false);
                      }
                    }}
                    disabled={isProcessing}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/20"
                  >
                    {isProcessing ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    )}
                    <span>Confirm UPI Payment</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Presets */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">
                    Select Recharge Amount (INR)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {presets.map((preset) => {
                      const isSelected = selectedPreset === preset.amount && !customAmount;
                      return (
                        <div
                          key={preset.amount}
                          onClick={() => {
                            setSelectedPreset(preset.amount);
                            setCustomAmount('');
                          }}
                          className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer relative ${
                            isSelected
                              ? 'border-indigo-500 bg-indigo-500/15 shadow-md shadow-indigo-500/20'
                              : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                          }`}
                        >
                          {preset.popular && (
                            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.2 rounded-full text-[9px] font-bold bg-indigo-600 text-white">
                              Popular
                            </span>
                          )}
                          <div className="text-sm font-black text-white font-mono">₹{preset.amount}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">~{preset.slots} slots</div>
                          <div className="text-[9px] text-indigo-400 font-mono">({preset.mins} mins)</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Amount */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Or Custom Amount (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">
                      ₹
                    </span>
                    <input
                      type="number"
                      min="10"
                      placeholder="Enter custom amount (min ₹10)"
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value);
                        setSelectedPreset(0);
                      }}
                      className="w-full pl-8 pr-4 py-2.5 text-xs font-mono rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      onClick={() => setPaymentMethod('razorpay_upi')}
                      className={`p-3 rounded-xl border-2 flex items-center gap-2.5 transition-all cursor-pointer ${
                        paymentMethod === 'razorpay_upi'
                          ? 'border-indigo-500 bg-indigo-500/10 text-white'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                      }`}
                    >
                      <QrCode className="w-4 h-4 text-indigo-400" />
                      <div>
                        <div className="text-xs font-bold">UPI / Instant QR</div>
                        <div className="text-[10px] text-slate-500">Google Pay, PhonePe, Paytm</div>
                      </div>
                    </div>

                    <div
                      onClick={() => setPaymentMethod('razorpay_card')}
                      className={`p-3 rounded-xl border-2 flex items-center gap-2.5 transition-all cursor-pointer ${
                        paymentMethod === 'razorpay_card'
                          ? 'border-indigo-500 bg-indigo-500/10 text-white'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 text-indigo-400" />
                      <div>
                        <div className="text-xs font-bold">Cards & Netbanking</div>
                        <div className="text-[10px] text-slate-500">Debit / Credit / Corporate</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security info */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-2 text-[11px] text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Encrypted Telecom Settlement. Unused credits never expire and carry over indefinitely.
                  </span>
                </div>

                {/* Submit Button */}
                <button
                  type="button"
                  onClick={handleRecharge}
                  disabled={isProcessing}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 cursor-pointer transition-all disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Processing Recharge...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>
                        {paymentMethod === 'razorpay_upi' ? 'Pay via UPI QR: ₹' : 'Recharge ₹'}
                        {effectiveRechargeAmount} Credits
                      </span>
                    </>
                  )}
                </button>
              </div>
            )
          ) : activeTab === 'ledger' ? (
            /* Billing Ledger */
            <div className="space-y-2.5">
              {(!wallet?.transactions || wallet.transactions.length === 0) ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  No billing transactions logged yet.
                </div>
              ) : (
                wallet.transactions.map((txn) => (
                  <div
                    key={txn.id}
                    className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          txn.type === 'recharge'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {txn.type === 'recharge' ? (
                          <ArrowDownLeft className="w-4 h-4" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                      </div>

                      <div>
                        <div className="font-bold text-white leading-tight">
                          {txn.description}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {new Date(txn.timestamp).toLocaleString([], {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                          {txn.callId ? ` • Ref: ${txn.callId.slice(0, 16)}...` : ''}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div
                        className={`font-mono font-black ${
                          txn.type === 'recharge' ? 'text-emerald-400' : 'text-slate-200'
                        }`}
                      >
                        {txn.type === 'recharge' ? '+' : '-'}₹{txn.amountInr.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Bal: ₹{txn.balanceAfterInr.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            /* Wholesale Unit Economics Breakdown */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-indigo-500/30">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-white">Wholesale Component Breakdown</span>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    55.4% Gross Margin
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>1. Telephony Carrier (Plivo India)</span>
                    <span className="font-mono">₹0.38 / min</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>2. Speech Recognition (Sarvam Saaras STT)</span>
                    <span className="font-mono">₹0.50 / min</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>3. Conversational Brain (Gemini Flash)</span>
                    <span className="font-mono">₹0.18 / min</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>4. Indic Voice Synthesis (Azure / Sarvam)</span>
                    <span className="font-mono">₹1.08 / min</span>
                  </div>
                  <div className="border-t border-slate-800 pt-2 flex justify-between font-bold text-indigo-400 font-mono">
                    <span>Total Wholesale Unit Cost</span>
                    <span>₹2.14 / min</span>
                  </div>
                  <div className="flex justify-between font-bold text-white font-mono">
                    <span>Customer Retail Rate (3 slots @ ₹1.60)</span>
                    <span>₹4.80 / min</span>
                  </div>
                  <div className="flex justify-between font-bold text-emerald-400 font-mono">
                    <span>Net Gross Profit</span>
                    <span>+₹2.66 / min</span>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 space-y-1">
                <p>• <strong>20-Second Slot Metering:</strong> Every call is rounded up to the nearest 20s slot, locking in 55% - 66% gross margin on short and long calls alike.</p>
                <p>• <strong>Zero Platform Telecom Markup in BYOK:</strong> When BYOK mode is toggled in Settings, platform billing is 100% bypassed.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

