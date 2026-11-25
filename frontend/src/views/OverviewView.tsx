import React from 'react';
import {
  CalendarClock,
  CheckCircle2,
  Package,
  LineChart,
  AlertTriangle,
  Radio,
  Plus,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react';
import { Medication, DoseEvent, UserProfile, CaregiverConfig } from '../types';
import { computeStockAnalysis } from '../utils/stockEngine';
import { computeAdherenceAndInsights } from '../utils/insightsEngine';
import { NavItemKey } from '../components/Sidebar';
import { VitalityGraphic } from '../components/VitalityGraphic';
import { fireDoseConfetti } from '../utils/confetti';

interface OverviewViewProps {
  user: UserProfile | null;
  medications: Medication[];
  doseEvents: DoseEvent[];
  caregiver: CaregiverConfig | null;
  onNavigate: (tab: NavItemKey) => void;
  onOpenNfcModal: () => void;
  onConfirmManualDose: (medicationId: string, scheduledTime: string) => Promise<void>;
  onOpenAddMedication: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  user,
  medications,
  doseEvents,
  caregiver,
  onNavigate,
  onOpenNfcModal,
  onConfirmManualDose,
  onOpenAddMedication
}) => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const userName = user?.fullName?.split(' ')[0] || 'there';

  // Compute live analytics from records
  const adherence = computeAdherenceAndInsights(doseEvents, medications);
  const stockAnalyses = medications.map(m => computeStockAnalysis(m));
  const lowStockCount = stockAnalyses.filter(s => s.needsRefillWarning).length;

  // Build today's schedule items
  const todayStr = new Date().toISOString().split('T')[0];
  const scheduledSlots: {
    medication: Medication;
    time: string;
    isoTime: string;
    isConfirmed: boolean;
    isPast: boolean;
  }[] = [];

  medications.forEach(med => {
    if (!med.isPRN && med.timeSlots && med.timeSlots.length > 0) {
      med.timeSlots.forEach(timeSlot => {
        const isoTime = `${todayStr}T${timeSlot}:00`;
        const slotDate = new Date(isoTime);
        const isPast = slotDate.getTime() < Date.now();

        const isConfirmed = doseEvents.some(d => {
          return (
            d.medicationId === med.id &&
            d.doseStatus === 'confirmed' &&
            d.scheduledTime.startsWith(todayStr)
          );
        });

        scheduledSlots.push({
          medication: med,
          time: timeSlot,
          isoTime,
          isConfirmed,
          isPast
        });
      });
    }
  });

  // Sort chronologically
  scheduledSlots.sort((a, b) => a.time.localeCompare(b.time));

  const todayConfirmedCount = scheduledSlots.filter(s => s.isConfirmed).length;
  const todayTotalCount = scheduledSlots.length;

  // Top 2 Explainable Insights
  const featuredInsights = adherence.insights.slice(0, 2);

  const handleManualDoseClick = async (medId: string, isoTime: string) => {
    await onConfirmManualDose(medId, isoTime);
    fireDoseConfetti();
  };

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Welcome Banner with Integrated Motion Vitality Graphic */}
      <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden border border-emerald-800/40">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-800/60 text-emerald-200 text-xs font-semibold border border-emerald-700/50 backdrop-blur-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-glow" />
              <span>Track T-3: Know Thyself</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {greeting}, {userName}
            </h1>
            <p className="text-emerald-100/90 text-xs sm:text-sm font-normal leading-relaxed max-w-xl">
              Your personal medication routine and inventory forecast are synchronized in local storage.
            </p>

            {/* Quick Banner Action buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={onOpenNfcModal}
                className="px-4 py-2.5 rounded-xl bg-white text-emerald-950 hover:bg-emerald-50 text-xs font-bold flex items-center space-x-2 transition-all duration-200 shadow-sm hover:scale-[1.02]"
              >
                <Radio className="w-4 h-4 text-emerald-700 animate-pulse" />
                <span>NFC Dose Reader</span>
              </button>
              <button
                onClick={() => onNavigate('insights')}
                className="px-4 py-2.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center space-x-1.5 transition-all duration-200 border border-emerald-600/60"
              >
                <span>View Routine Analytics</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right: ECG Vitality Motion Graphic */}
          <div className="lg:col-span-5">
            <VitalityGraphic consistency={adherence.overallConsistencyPercentage} />
          </div>
        </div>

        {/* Ambient background illumination */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-radial from-emerald-500/10 to-transparent pointer-events-none" />
      </div>

      {/* 4 Summary Cards with Staggered Hover Lifts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Scheduled Events */}
        <div
          onClick={() => onNavigate('schedule')}
          className="p-5 rounded-2xl bg-surface border border-charcoal-100/90 shadow-xs hover:border-emerald-300 hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-pointer group"
        >
          <div className="flex items-center justify-between text-charcoal-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Today's Schedule</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <CalendarClock className="w-5 h-5 text-emerald-700" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-charcoal-900">
            {todayConfirmedCount} / {todayTotalCount}
          </div>
          <p className="text-xs text-charcoal-500 mt-1">
            {todayConfirmedCount === todayTotalCount && todayTotalCount > 0
              ? 'All scheduled slots confirmed'
              : `${todayTotalCount - todayConfirmedCount} slots remaining today`}
          </p>
        </div>

        {/* Card 2: Confirmed Medication Logs */}
        <div
          onClick={() => onNavigate('medications')}
          className="p-5 rounded-2xl bg-surface border border-charcoal-100/90 shadow-xs hover:border-emerald-300 hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-pointer group"
        >
          <div className="flex items-center justify-between text-charcoal-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Confirmed Logs</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-charcoal-900">
            {adherence.totalConfirmed}
          </div>
          <p className="text-xs text-charcoal-500 mt-1">
            Across 7-day rolling window
          </p>
        </div>

        {/* Card 3: Estimated Stock Status */}
        <div
          onClick={() => onNavigate('stock')}
          className="p-5 rounded-2xl bg-surface border border-charcoal-100/90 shadow-xs hover:border-amber-300 hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-pointer group"
        >
          <div className="flex items-center justify-between text-charcoal-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Inventory Health</span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${
              lowStockCount > 0 ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-800'
            }`}>
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-charcoal-900 flex items-center space-x-2">
            <span>{medications.length}</span>
            <span className="text-xs font-normal text-charcoal-500">meds tracked</span>
          </div>
          <p className={`text-xs mt-1 font-medium ${lowStockCount > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
            {lowStockCount > 0
              ? `${lowStockCount} medication requires refill soon`
              : 'All supplies within safe thresholds'}
          </p>
        </div>

        {/* Card 4: Weekly Consistency */}
        <div
          onClick={() => onNavigate('insights')}
          className="p-5 rounded-2xl bg-surface border border-charcoal-100/90 shadow-xs hover:border-emerald-300 hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-pointer group"
        >
          <div className="flex items-center justify-between text-charcoal-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Routine Consistency</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <LineChart className="w-5 h-5 text-emerald-700" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-800">
            {adherence.overallConsistencyPercentage}%
          </div>
          <div className="w-full bg-charcoal-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-emerald-700 h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${adherence.overallConsistencyPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Schedule on Left, Alerts & Insights on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 spans): Today's Schedule Timeline */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-charcoal-900">Today’s Medication Schedule</h2>
              <p className="text-xs text-charcoal-500">Chronological slots with manual and NFC verification</p>
            </div>
            <button
              onClick={() => onNavigate('schedule')}
              className="text-xs font-semibold text-emerald-800 hover:text-emerald-900 flex items-center space-x-1 group"
            >
              <span>View full schedule</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="bg-surface rounded-2xl border border-charcoal-100 divide-y divide-charcoal-100 overflow-hidden shadow-xs">
            {scheduledSlots.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <CalendarClock className="w-8 h-8 text-charcoal-400 mx-auto" />
                <p className="text-sm font-semibold text-charcoal-800">No scheduled medications for today</p>
                <p className="text-xs text-charcoal-500 max-w-sm mx-auto">
                  Add your daily medications to start tracking routines and predictive depletion.
                </p>
                <button
                  onClick={onOpenAddMedication}
                  className="px-4 py-2 rounded-xl bg-emerald-800 text-white text-xs font-semibold hover:bg-emerald-900 transition-colors"
                >
                  Add Medication
                </button>
              </div>
            ) : (
              scheduledSlots.map((slot, idx) => (
                <div
                  key={`${slot.medication.id}-${slot.time}-${idx}`}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-charcoal-50/50 transition-colors duration-150"
                >
                  <div className="flex items-start space-x-3.5">
                    <div className="w-12 text-center shrink-0">
                      <span className="text-xs font-bold text-charcoal-900 block">{slot.time}</span>
                      <span className="text-[10px] text-charcoal-500 uppercase font-medium">Slot</span>
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-charcoal-900">{slot.medication.name}</span>
                        <span className="text-xs text-charcoal-500 font-medium">({slot.medication.dosageStrength})</span>
                      </div>
                      <p className="text-xs text-charcoal-600">{slot.medication.dosageInstructions}</p>
                      <p className="text-[11px] text-charcoal-400">
                        Current stock: <strong className="text-charcoal-700">{slot.medication.currentStock} units</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2.5 sm:self-center shrink-0">
                    {slot.isConfirmed ? (
                      <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold animate-scale-pop">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        <span>Confirmed</span>
                      </span>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleManualDoseClick(slot.medication.id, slot.isoTime)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold transition-all duration-150 shadow-xs hover:scale-[1.02]"
                        >
                          Confirm Dose
                        </button>
                        <button
                          onClick={onOpenNfcModal}
                          className="p-1.5 rounded-xl border border-charcoal-200 text-charcoal-600 hover:bg-charcoal-100 hover:border-emerald-300 transition-colors"
                          title="Confirm via NFC"
                        >
                          <Radio className="w-4 h-4 text-emerald-700 animate-pulse" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick Actions Bar */}
          <div className="p-4 rounded-2xl bg-surface border border-charcoal-100 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <span className="text-xs font-bold text-charcoal-700">Quick Actions:</span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={onOpenAddMedication}
                className="px-3 py-1.5 rounded-xl bg-charcoal-100 hover:bg-charcoal-200 text-charcoal-800 text-xs font-semibold flex items-center space-x-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Medication</span>
              </button>
              <button
                onClick={onOpenNfcModal}
                className="px-3 py-1.5 rounded-xl bg-charcoal-100 hover:bg-charcoal-200 text-charcoal-800 text-xs font-semibold flex items-center space-x-1 transition-colors"
              >
                <Radio className="w-3.5 h-3.5 text-emerald-700" />
                <span>Log NFC</span>
              </button>
              <button
                onClick={() => onNavigate('stock')}
                className="px-3 py-1.5 rounded-xl bg-charcoal-100 hover:bg-charcoal-200 text-charcoal-800 text-xs font-semibold flex items-center space-x-1 transition-colors"
              >
                <Package className="w-3.5 h-3.5" />
                <span>Check Stock</span>
              </button>
              <button
                onClick={() => onNavigate('teleconsultation')}
                className="px-3 py-1.5 rounded-xl bg-charcoal-100 hover:bg-charcoal-200 text-charcoal-800 text-xs font-semibold flex items-center space-x-1 transition-colors"
              >
                <span>Book Doctor</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (1 span): Alerts & Explainable Routine Insights */}
        <div className="space-y-6">
          {/* Active Alerts Box */}
          <div className="bg-surface rounded-2xl border border-charcoal-100 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-charcoal-100 pb-3">
              <span className="text-xs font-bold text-charcoal-900 uppercase tracking-wider flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Active Vault Alerts</span>
              </span>
              <span className="text-[11px] font-semibold text-charcoal-500">
                {lowStockCount + (caregiver?.escalationEnabled ? 0 : 1)} notices
              </span>
            </div>

            <div className="space-y-2.5">
              {lowStockCount > 0 ? (
                stockAnalyses
                  .filter(s => s.needsRefillWarning)
                  .map(s => (
                    <div
                      key={s.medicationId}
                      onClick={() => onNavigate('stock')}
                      className="p-3 rounded-xl bg-rose-50 border border-rose-200/80 cursor-pointer hover:bg-rose-100/70 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-rose-900">{s.medicationName}</span>
                        <span className="text-[10px] font-bold text-rose-700 uppercase">Low Stock</span>
                      </div>
                      <p className="text-[11px] text-rose-800 mt-0.5">
                        {s.daysRemaining} days left at {s.expectedDailyConsumption} units/day. Depletes on {s.depletionDate}.
                      </p>
                    </div>
                  ))
              ) : (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>All medication supplies are above the 3-day refill threshold.</span>
                </div>
              )}

              {/* Caregiver consent status alert */}
              <div
                onClick={() => onNavigate('caregiver')}
                className="p-3 rounded-xl bg-charcoal-50 border border-charcoal-200 cursor-pointer hover:bg-charcoal-100 transition-colors text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-charcoal-900">Caregiver Escalation</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    caregiver?.escalationEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-charcoal-200 text-charcoal-700'
                  }`}>
                    {caregiver?.escalationEnabled ? 'Consent Active' : 'Consent Inactive'}
                  </span>
                </div>
                <p className="text-[11px] text-charcoal-600 mt-1">
                  {caregiver?.escalationEnabled
                    ? `Quiet hours: ${caregiver.quietStart} - ${caregiver.quietEnd}. Designated caregiver: ${caregiver.name}.`
                    : 'Caregiver escalation is paused until explicit user consent is granted.'}
                </p>
              </div>
            </div>
          </div>

          {/* Explainable Insights Preview */}
          <div className="bg-surface rounded-2xl border border-charcoal-100 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-charcoal-100 pb-3">
              <span className="text-xs font-bold text-charcoal-900 uppercase tracking-wider flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <span>Explainable Routine Insights</span>
              </span>
              <button
                onClick={() => onNavigate('insights')}
                className="text-[11px] font-semibold text-emerald-800 hover:underline"
              >
                View all
              </button>
            </div>

            <div className="space-y-3">
              {featuredInsights.length === 0 ? (
                <p className="text-xs text-charcoal-500 py-3 text-center">
                  More medication confirmation logs are required to generate deterministic routine observations.
                </p>
              ) : (
                featuredInsights.map(insight => (
                  <div
                    key={insight.id}
                    className="p-3.5 rounded-xl bg-background border border-charcoal-100 space-y-1.5 hover:border-emerald-200 transition-colors"
                  >
                    <p className="text-xs font-bold text-charcoal-900">{insight.title}</p>
                    <p className="text-xs text-charcoal-700 leading-normal">{insight.observation}</p>
                    <div className="pt-1 text-[10px] text-charcoal-500 font-medium border-t border-charcoal-100 flex items-start space-x-1">
                      <Info className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                      <span>{insight.explanation}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <p className="text-[10px] text-charcoal-400 italic text-center pt-1">
              Personal routine insights — not a medical diagnosis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
