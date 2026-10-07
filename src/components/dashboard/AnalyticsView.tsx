import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Download, TrendingUp, Users, Clock, Smile, DollarSign, BarChart2, CheckCircle2, Zap } from 'lucide-react';
import { Call } from '../../types';

interface AnalyticsViewProps {
  calls?: Call[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ calls = [] }) => {
  const [range, setRange] = useState('Last 30 days');

  // Dynamic calculations from calls
  const analytics = useMemo(() => {
    const totalCalls = calls.length;
    const answeredCalls = calls.filter((c) => c.status === 'answered').length;
    const missedCalls = totalCalls - answeredCalls;

    const positiveCalls = calls.filter((c) => c.sentiment === 'positive').length;
    const neutralCalls = calls.filter((c) => c.sentiment === 'neutral').length;
    const negativeCalls = calls.filter((c) => c.sentiment === 'negative').length;

    const positivePct = totalCalls ? Math.round((positiveCalls / totalCalls) * 100) : 0;
    const neutralPct = totalCalls ? Math.round((neutralCalls / totalCalls) * 100) : 0;
    const negativePct = totalCalls ? Math.max(0, 100 - positivePct - neutralPct) : 0;

    const totalSeconds = calls.reduce((acc, c) => acc + c.durationSeconds, 0);
    const totalMinutes = Math.round(totalSeconds / 60);

    // Front-desk labor equivalent savings: $22/hour
    const estimatedSavings = Math.round((totalMinutes / 60) * 22);
    const resolutionRate = totalCalls ? ((answeredCalls / totalCalls) * 100).toFixed(1) : '0.0';

    return {
      totalCalls,
      answeredCalls,
      missedCalls,
      positiveCalls,
      neutralCalls,
      negativeCalls,
      positivePct,
      neutralPct,
      negativePct,
      totalMinutes,
      estimatedSavings,
      resolutionRate,
    };
  }, [calls]);

  // Hourly call traffic distribution
  const hourlyData = [
    { hour: '8 AM', intensity: 25 },
    { hour: '9 AM', intensity: 70 },
    { hour: '10 AM', intensity: 95 },
    { hour: '11 AM', intensity: 100 },
    { hour: '12 PM', intensity: 80 },
    { hour: '1 PM', intensity: 45 },
    { hour: '2 PM', intensity: 65 },
    { hour: '3 PM', intensity: 85 },
    { hour: '4 PM', intensity: 90 },
    { hour: '5 PM', intensity: 60 },
    { hour: '6 PM', intensity: 35 },
    { hour: '7 PM', intensity: 15 },
  ];

  const handleExportCSV = () => {
    const headers = ['Call_ID', 'Timestamp', 'Caller_Number', 'Agent_Name', 'Duration_Seconds', 'Status', 'Sentiment', 'Intent'];
    const rows = calls.map((c) => [
      c.id,
      `"${c.timestamp}"`,
      `"${c.callerNumber}"`,
      `"${c.agentName}"`,
      c.durationSeconds,
      c.status,
      c.sentiment,
      `"${c.extractedEntities?.intent || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auris-analytics-export-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. TITLE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-950 dark:text-white tracking-tight">
            Analytics & Intelligence
          </h1>
          <p className="text-xs text-slate-600 dark:text-[#7DA0CA] mt-0.5">
            Real-time sentiment insights, peak inbound hours, and automated ROI operational savings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-[#052659]/60 border border-slate-200 dark:border-[#5483B3]/30 text-slate-900 dark:text-white focus:outline-none focus:border-[#1D64C2]"
          >
            <option value="Last 7 days">Last 7 days</option>
            <option value="Last 30 days">Last 30 days</option>
            <option value="Last 90 days">Last 90 days</option>
          </select>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#052659] via-[#1D64C2] to-[#2563EB] hover:from-[#1D64C2] hover:to-[#3B82F6] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-md shadow-[#1D64C2]/20 animate-shimmer"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </motion.button>
        </div>
      </div>

      {/* 2. ROI & COST SAVED BANNER */}
      <motion.div
        whileHover={{ y: -2, transition: { duration: 0.2 } }}
        className="bg-gradient-to-r from-[#021024] via-[#052659] to-[#1D64C2] rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-[#5483B3]/30"
      >
        <div>
          <span className="text-[11px] font-bold text-[#C1E8FF] uppercase tracking-wider">
            Operational Efficiency Impact
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold mt-1 tracking-tight">
            Est. ${analytics.estimatedSavings.toLocaleString()} Saved This Month
          </h2>
          <p className="text-xs text-[#7DA0CA] mt-1 max-w-xl leading-relaxed">
            Calculated based on {analytics.totalMinutes} handled telephony minutes vs traditional front-desk staffing costs ($22/hr loaded labor rate).
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white/10 dark:bg-[#021024]/60 backdrop-blur-md px-4 py-2.5 rounded-2xl text-center border border-white/15 dark:border-[#5483B3]/30">
            <div className="text-lg font-extrabold text-[#C1E8FF]">{analytics.resolutionRate}%</div>
            <div className="text-[10px] text-white/70">Resolution Rate</div>
          </div>
          <div className="bg-white/10 dark:bg-[#021024]/60 backdrop-blur-md px-4 py-2.5 rounded-2xl text-center border border-white/15 dark:border-[#5483B3]/30">
            <div className="text-lg font-extrabold text-[#C1E8FF]">&lt; 280ms</div>
            <div className="text-[10px] text-white/70">Mean Voice Latency</div>
          </div>
        </div>
      </motion.div>

      {/* 3. SENTIMENT & PEAK HOURS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sentiment Analysis (5 cols) */}
        <motion.div
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="lg:col-span-5 bg-white dark:bg-[#052659]/30 rounded-3xl p-6 border border-slate-200 dark:border-[#5483B3]/25 hover:border-[#1D64C2]/50 shadow-xs hover:shadow-lg hover:shadow-[#1D64C2]/10 space-y-4 transition-all"
        >
          <h3 className="text-sm font-bold text-slate-950 dark:text-white">Caller Sentiment Distribution</h3>
          <p className="text-xs text-slate-500 dark:text-[#7DA0CA]">
            Derived from automated acoustic tone analysis and conversational intent parsing.
          </p>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-[#1D64C2] dark:text-[#C1E8FF] flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1D64C2]" /> Positive ({analytics.positivePct}%)
                </span>
                <span className="text-slate-950 dark:text-white font-bold">{analytics.positiveCalls} calls</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-[#021024] rounded-full h-2 overflow-hidden border border-slate-200/60 dark:border-[#5483B3]/20">
                <div className="bg-gradient-to-r from-[#052659] via-[#1D64C2] to-[#2563EB] h-2 rounded-full transition-all duration-500" style={{ width: `${analytics.positivePct}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-[#5483B3] dark:text-[#7DA0CA] flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#5483B3]" /> Neutral ({analytics.neutralPct}%)
                </span>
                <span className="text-slate-950 dark:text-white font-bold">{analytics.neutralCalls} calls</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-[#021024] rounded-full h-2 overflow-hidden border border-slate-200/60 dark:border-[#5483B3]/20">
                <div className="bg-[#5483B3] h-2 rounded-full transition-all duration-500" style={{ width: `${analytics.neutralPct}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-rose-500 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Negative ({analytics.negativePct}%)
                </span>
                <span className="text-slate-950 dark:text-white font-bold">{analytics.negativeCalls} calls</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-[#021024] rounded-full h-2 overflow-hidden border border-slate-200/60 dark:border-[#5483B3]/20">
                <div className="bg-rose-500 h-2 rounded-full transition-all duration-500" style={{ width: `${analytics.negativePct}%` }} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Peak Calling Hours Heatmap (7 cols) */}
        <motion.div
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="lg:col-span-7 bg-white dark:bg-[#052659]/30 rounded-3xl p-6 border border-slate-200 dark:border-[#5483B3]/25 hover:border-[#1D64C2]/50 shadow-xs hover:shadow-lg hover:shadow-[#1D64C2]/10 space-y-4 transition-all"
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-950 dark:text-white">Peak Inbound Traffic Hours</h3>
              <p className="text-xs text-slate-500 dark:text-[#7DA0CA]">
                Identifies optimal staffing and automated outbound follow-up windows.
              </p>
            </div>
            <span className="text-xs font-bold text-[#1D64C2] dark:text-[#C1E8FF] bg-[#1D64C2]/15 px-2.5 py-1 rounded-lg border border-[#5483B3]/30">
              Peak: 10 AM - 12 PM
            </span>
          </div>

          <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 pt-2">
            {hourlyData.map((d) => (
              <div key={d.hour} className="flex flex-col items-center gap-1">
                <div className="w-full bg-slate-100 dark:bg-[#021024] rounded-lg h-24 flex items-end p-1 border border-slate-200/60 dark:border-[#5483B3]/20">
                  <div
                    className="w-full bg-gradient-to-t from-[#052659] to-[#1D64C2] rounded-md transition-all duration-500 hover:to-[#2563EB]"
                    style={{ height: `${d.intensity}%` }}
                    title={`${d.hour}: ${d.intensity}% capacity`}
                  />
                </div>
                <span className="text-[9px] text-slate-500 dark:text-[#7DA0CA] font-semibold">{d.hour}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
