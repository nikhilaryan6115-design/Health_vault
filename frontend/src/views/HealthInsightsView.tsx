import React from 'react';
import {
  LineChart as LineChartIcon,
  Sparkles,
  Info,
  Clock,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  TrendingUp,
  Sun,
  Sunset,
  Moon,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { Medication, DoseEvent } from '../types';
import { computeAdherenceAndInsights } from '../utils/insightsEngine';

interface HealthInsightsViewProps {
  medications: Medication[];
  doseEvents: DoseEvent[];
  onSeedDemoData: () => Promise<void>;
}

export const HealthInsightsView: React.FC<HealthInsightsViewProps> = ({
  medications,
  doseEvents,
  onSeedDemoData,
}) => {
  const adherence = computeAdherenceAndInsights(doseEvents, medications);

  const routineComparisonData = [
    {
      period: 'Morning',
      timeSlot: '05:00 - 11:59',
      consistency: adherence.morning.consistencyPercentage,
      confirmed: adherence.morning.confirmed,
      total: adherence.morning.totalScheduled,
    },
    {
      period: 'Afternoon',
      timeSlot: '12:00 - 16:59',
      consistency: adherence.afternoon.consistencyPercentage,
      confirmed: adherence.afternoon.confirmed,
      total: adherence.afternoon.totalScheduled,
    },
    {
      period: 'Evening',
      timeSlot: '17:00 - 23:59',
      consistency: adherence.evening.consistencyPercentage,
      confirmed: adherence.evening.confirmed,
      total: adherence.evening.totalScheduled,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header & Mandatory Disclaimer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-charcoal-900 tracking-tight">
            Personal Health Routine Intelligence
          </h1>
          <p className="text-xs text-charcoal-500">
            Module 4: Explainable behavioural observations generated deterministically from your local logs.
          </p>
        </div>

        {/* Clinical Disclaimer Pill */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-2xl bg-amber-50/90 border border-amber-200/80 text-amber-900 text-xs font-semibold shadow-xs">
          <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
          <span>Personal routine insights — not a medical diagnosis.</span>
        </div>
      </div>

      {/* Top 4 Dashboard Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-surface border border-charcoal-100 shadow-xs">
          <span className="text-[11px] font-semibold text-charcoal-500 uppercase tracking-wider block">
            Weekly Consistency
          </span>
          <div className="text-3xl font-extrabold text-emerald-800 mt-1">
            {adherence.overallConsistencyPercentage}%
          </div>
          <p className="text-[11px] text-charcoal-500 mt-0.5">
            Confirmed on-time slots
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-charcoal-100 shadow-xs">
          <span className="text-[11px] font-semibold text-charcoal-500 uppercase tracking-wider block">
            Confirmed Logs
          </span>
          <div className="text-3xl font-extrabold text-charcoal-900 mt-1">
            {adherence.totalConfirmed}
          </div>
          <p className="text-[11px] text-charcoal-500 mt-0.5">
            Out of {adherence.totalScheduled} total scheduled
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-charcoal-100 shadow-xs">
          <span className="text-[11px] font-semibold text-charcoal-500 uppercase tracking-wider block">
            Unconfirmed Events
          </span>
          <div className="text-3xl font-extrabold text-rose-800 mt-1">
            {adherence.totalUnconfirmed}
          </div>
          <p className="text-[11px] text-rose-700 mt-0.5">
            Pending / unrecorded slots
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-charcoal-100 shadow-xs">
          <span className="text-[11px] font-semibold text-charcoal-500 uppercase tracking-wider block">
            Delayed Confirmations
          </span>
          <div className="text-3xl font-extrabold text-amber-700 mt-1">
            {adherence.totalDelayed}
          </div>
          <p className="text-[11px] text-amber-700 mt-0.5">
            &gt; 45 min past scheduled time
          </p>
        </div>
      </div>

      {/* Routine Period Consistency Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Morning */}
        <div className="p-5 rounded-2xl bg-surface border border-charcoal-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-charcoal-700">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5">
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Morning Routine</span>
            </span>
            <span className="text-[10px] text-charcoal-500">05:00 - 11:59</span>
          </div>
          <div className="text-2xl font-black text-charcoal-900">
            {adherence.morning.consistencyPercentage}%
          </div>
          <div className="w-full bg-charcoal-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full"
              style={{ width: `${adherence.morning.consistencyPercentage}%` }}
            />
          </div>
          <p className="text-[11px] text-charcoal-500">
            {adherence.morning.confirmed} of {adherence.morning.totalScheduled} slots confirmed
          </p>
        </div>

        {/* Afternoon */}
        <div className="p-5 rounded-2xl bg-surface border border-charcoal-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-charcoal-700">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5">
              <Sunset className="w-4 h-4 text-amber-600" />
              <span>Afternoon Routine</span>
            </span>
            <span className="text-[10px] text-charcoal-500">12:00 - 16:59</span>
          </div>
          <div className="text-2xl font-black text-charcoal-900">
            {adherence.afternoon.consistencyPercentage}%
          </div>
          <div className="w-full bg-charcoal-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full"
              style={{ width: `${adherence.afternoon.consistencyPercentage}%` }}
            />
          </div>
          <p className="text-[11px] text-charcoal-500">
            {adherence.afternoon.confirmed} of {adherence.afternoon.totalScheduled} slots confirmed
          </p>
        </div>

        {/* Evening */}
        <div className="p-5 rounded-2xl bg-surface border border-charcoal-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-charcoal-700">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5">
              <Moon className="w-4 h-4 text-emerald-800" />
              <span>Evening Routine</span>
            </span>
            <span className="text-[10px] text-charcoal-500">17:00 - 23:59</span>
          </div>
          <div className="text-2xl font-black text-charcoal-900">
            {adherence.evening.consistencyPercentage}%
          </div>
          <div className="w-full bg-charcoal-100 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                adherence.evening.consistencyPercentage < 60 ? 'bg-amber-500' : 'bg-emerald-600'
              }`}
              style={{ width: `${adherence.evening.consistencyPercentage}%` }}
            />
          </div>
          <p className="text-[11px] text-charcoal-500">
            {adherence.evening.confirmed} of {adherence.evening.totalScheduled} slots confirmed ({adherence.evening.delayed} delayed)
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: 7-Day Adherence Trend */}
        <div className="p-5 rounded-2xl bg-surface border border-charcoal-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-charcoal-900">Weekly Confirmation Trend</h3>
              <p className="text-[11px] text-charcoal-500">Scheduled events vs. confirmed logs over the last 7 days</p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={adherence.weeklyTrend}>
                <defs>
                  <linearGradient id="colorConfirmed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#6C757D' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#6C757D' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: 12, border: '1px solid #E5E7EB', fontSize: 12 }}
                />
                <Area type="monotone" dataKey="scheduled" stroke="#CBD5E1" fill="#F1F5F9" name="Scheduled Slots" />
                <Area type="monotone" dataKey="confirmed" stroke="#059669" strokeWidth={2} fillOpacity={1} fill="url(#colorConfirmed)" name="Confirmed Logs" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Routine Period Comparison */}
        <div className="p-5 rounded-2xl bg-surface border border-charcoal-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-charcoal-900">Routine Period Comparison</h3>
              <p className="text-[11px] text-charcoal-500">Adherence percentage across morning, afternoon, and evening</p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <LineChartIcon className="w-4 h-4" />
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={routineComparisonData} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#6C757D' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#6C757D' }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Consistency']}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: 12, border: '1px solid #E5E7EB', fontSize: 12 }}
                />
                <Bar dataKey="consistency" fill="#047857" radius={[8, 8, 0, 0]} name="Adherence %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Explainable Insights Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-charcoal-900 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>Explainable Routine Insights</span>
            </h2>
            <p className="text-xs text-charcoal-500">
              Deterministic observations derived directly from your Dexie.js medication logs.
            </p>
          </div>
        </div>

        {adherence.insights.length === 0 ? (
          <div className="p-10 text-center bg-surface rounded-2xl border border-charcoal-100 space-y-3">
            <HelpCircle className="w-8 h-8 text-charcoal-300 mx-auto" />
            <h3 className="text-sm font-bold text-charcoal-800">Insufficient Data for Pattern Analysis</h3>
            <p className="text-xs text-charcoal-500 max-w-sm mx-auto">
              HealthVault requires at least several days of recorded medication events to generate explainable observations without guessing.
            </p>
            <button
              onClick={onSeedDemoData}
              className="px-4 py-2 rounded-xl bg-emerald-800 text-white text-xs font-semibold shadow-xs hover:bg-emerald-900"
            >
              Populate Demo Adherence History
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {adherence.insights.map((insight) => {
              const isWarning = insight.severity === 'warning';
              const isSuccess = insight.severity === 'success';

              return (
                <div
                  key={insight.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isWarning
                      ? 'bg-amber-50/50 border-amber-200'
                      : isSuccess
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : 'bg-surface border-charcoal-100 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs font-bold text-charcoal-900">{insight.title}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      isWarning
                        ? 'bg-amber-100 text-amber-800'
                        : isSuccess
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-charcoal-100 text-charcoal-700'
                    }`}>
                      {insight.category}
                    </span>
                  </div>

                  <p className="text-xs text-charcoal-800 leading-relaxed font-medium">
                    {insight.observation}
                  </p>

                  <div className="mt-3 pt-3 border-t border-charcoal-100/80 text-[11px] text-charcoal-600 flex items-start space-x-2">
                    <Info className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-charcoal-800">Recorded Evidence:</strong> {insight.explanation}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
