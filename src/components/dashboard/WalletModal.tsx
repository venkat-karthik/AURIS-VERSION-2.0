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
  const [activeTab, setActiveTab] = useState<'recharge' | 'ledger'>('recharge');
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
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentBalance = wallet?.balanceInr ?? 0;
  const perMinRate = wallet?.perMinuteRateInr ?? 5.0;
  const estimatedMinsLeft = Math.floor(currentBalance / perMinRate);

  const presets = [
    { amount: 250, label: 'Starter', mins: 50 },
    { amount: 500, label: 'Growth', mins: 100, popular: true },
    { amount: 1500, label: 'Scale', mins: 300 },
    { amount: 5000, label: 'Enterprise', mins: 1000 },
  ];

  const handleRecharge = async () => {
    const rechargeAmount = customAmount ? parseFloat(customAmount) : selectedPreset;
    if (isNaN(rechargeAmount) || rechargeAmount < 10) {
      setErrorMessage('Please enter a valid recharge amount of at least ₹10');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const result = await aurisApi.rechargeWallet(rechargeAmount, paymentMethod);
      setSuccessMessage(result.message);
      await fetchWallet();
      setCustomAmount('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to process recharge');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-[#090D16] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#06B6D4]/15 border border-[#06B6D4]/30 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-[#06B6D4]" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Prepaid Telephony Wallet</h2>
              <p className="text-xs text-slate-400">Pay-as-you-go call metering at ₹{perMinRate.toFixed(2)}/min</p>
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
        <div className="px-6 py-4 bg-gradient-to-r from-[#06B6D4]/15 via-blue-900/20 to-slate-900 border-b border-slate-800/60 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              Available Credits
            </span>
            <div className="text-2xl font-black text-white font-mono mt-0.5">
              ₹{currentBalance.toFixed(2)}
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
              ~{estimatedMinsLeft} Calling Mins Left
            </span>
            <div className="text-[11px] text-slate-400 mt-1 font-mono">
              Billed per second (No expiry)
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800/80 bg-slate-950/50">
          <button
            onClick={() => setActiveTab('recharge')}
            className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'recharge'
                ? 'border-[#06B6D4] text-[#06B6D4] bg-[#06B6D4]/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Recharge Credits
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'ledger'
                ? 'border-[#06B6D4] text-[#06B6D4] bg-[#06B6D4]/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Billing Ledger ({wallet?.transactions?.length ?? 0})
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
                            ? 'border-[#06B6D4] bg-[#06B6D4]/15 shadow-md shadow-[#06B6D4]/20'
                            : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                        }`}
                      >
                        {preset.popular && (
                          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.2 rounded-full text-[9px] font-bold bg-[#06B6D4] text-white">
                            Popular
                          </span>
                        )}
                        <div className="text-sm font-black text-white font-mono">₹{preset.amount}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">~{preset.mins} mins</div>
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
                    className="w-full pl-8 pr-4 py-2.5 text-xs font-mono rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none focus:border-[#06B6D4]"
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
                        ? 'border-[#06B6D4] bg-[#06B6D4]/10 text-white'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    <QrCode className="w-4 h-4 text-[#06B6D4]" />
                    <div>
                      <div className="text-xs font-bold">UPI / QR Code</div>
                      <div className="text-[10px] text-slate-500">Google Pay, PhonePe, Paytm</div>
                    </div>
                  </div>

                  <div
                    onClick={() => setPaymentMethod('razorpay_card')}
                    className={`p-3 rounded-xl border-2 flex items-center gap-2.5 transition-all cursor-pointer ${
                      paymentMethod === 'razorpay_card'
                        ? 'border-[#06B6D4] bg-[#06B6D4]/10 text-white'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-[#06B6D4]" />
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
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#06B6D4] to-blue-600 hover:from-[#0891b2] hover:to-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#06B6D4]/25 cursor-pointer transition-all disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing Recharge...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Recharge ₹{customAmount ? customAmount : selectedPreset} Credits</span>
                  </>
                )}
              </button>
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
};
