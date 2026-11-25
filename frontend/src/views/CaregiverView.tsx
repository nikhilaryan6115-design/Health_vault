import React, { useState, useEffect } from 'react';
import {
  HeartHandshake,
  ShieldCheck,
  ShieldAlert,
  Bell,
  Clock,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Phone,
  Radio,
  Send,
  XCircle,
  HelpCircle,
  Activity
} from 'lucide-react';
import { CaregiverConfig, EscalationEvent, Medication } from '../types';
import { fireDoseConfetti } from '../utils/confetti';

interface CaregiverViewProps {
  caregiver: CaregiverConfig | null;
  medications: Medication[];
  escalationEvents: EscalationEvent[];
  onUpdateCaregiver: (cfg: CaregiverConfig) => Promise<void>;
  onTriggerEscalationEvent: (event: Omit<EscalationEvent, 'id' | 'triggeredAt'>) => Promise<void>;
  onCancelEscalationEvent: (id: string) => Promise<void>;
}

export const CaregiverView: React.FC<CaregiverViewProps> = ({
  caregiver,
  medications,
  escalationEvents,
  onUpdateCaregiver,
  onTriggerEscalationEvent,
}) => {
  // Config form state
  const [name, setName] = useState(caregiver?.name || 'Rohan Sharma');
  const [phone, setPhone] = useState(caregiver?.phone || '+1 (555) 234-5678');
  const [escalationEnabled, setEscalationEnabled] = useState(caregiver?.escalationEnabled || false);
  const [quietStart, setQuietStart] = useState(caregiver?.quietStart || '22:00');
  const [quietEnd, setQuietEnd] = useState(caregiver?.quietEnd || '07:00');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Simulation controls state
  const [selectedMedId, setSelectedMedId] = useState(medications[0]?.id || '');
  const [timerDuration, setTimerDuration] = useState<number>(15); // accelerated 15s demo timer
  const [timerRemaining, setTimerRemaining] = useState<number | null>(null);
  const [simulationStatusLog, setSimulationStatusLog] = useState<string | null>(null);

  useEffect(() => {
    let interval: any = null;
    if (timerRemaining !== null && timerRemaining > 0) {
      interval = setInterval(() => {
        setTimerRemaining(prev => (prev !== null && prev > 1 ? prev - 1 : 0));
      }, 1000);
    } else if (timerRemaining === 0) {
      // Timer finished -> evaluate escalation!
      handleEvaluateEscalation();
      setTimerRemaining(null);
    }
    return () => clearInterval(interval);
  }, [timerRemaining]);

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated: CaregiverConfig = {
      id: caregiver?.id || 'caregiver-01',
      name: name.trim(),
      phone: phone.trim(),
      escalationEnabled,
      quietStart,
      quietEnd,
      consentGrantedAt: escalationEnabled ? (caregiver?.consentGrantedAt || new Date().toISOString()) : undefined,
      consentRevokedAt: !escalationEnabled ? new Date().toISOString() : undefined,
    };
    await onUpdateCaregiver(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleRevokeConsent = async () => {
    if (confirm('Revoke caregiver escalation consent immediately? No alerts will be dispatched.')) {
      setEscalationEnabled(false);
      const updated: CaregiverConfig = {
        id: caregiver?.id || 'caregiver-01',
        name: name.trim(),
        phone: phone.trim(),
        escalationEnabled: false,
        quietStart,
        quietEnd,
        consentRevokedAt: new Date().toISOString(),
      };
      await onUpdateCaregiver(updated);
      setSimulationStatusLog('Consent revoked. Escalation disabled.');
    }
  };

  const isCurrentTimeInQuietHours = (): boolean => {
    const now = new Date();
    const curTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    if (quietStart > quietEnd) {
      // Overnight (e.g., 22:00 to 07:00)
      return curTime >= quietStart || curTime < quietEnd;
    }
    return curTime >= quietStart && curTime <= quietEnd;
  };

  const handleStartGracePeriodSimulation = () => {
    const targetMed = medications.find(m => m.id === selectedMedId) || medications[0];
    if (!targetMed) return;

    setTimerRemaining(timerDuration);
    setSimulationStatusLog(`Reminder triggered for ${targetMed.name}. Grace period countdown started (${timerDuration}s demo). Confirm dose to cancel escalation.`);
  };

  const handleConfirmToCancel = async () => {
    if (timerRemaining !== null) {
      setTimerRemaining(null);
      setSimulationStatusLog('User confirmed medication dose! Caregiver escalation successfully CANCELLED within grace period.');
      fireDoseConfetti();
    }
  };

  const handleEvaluateEscalation = async () => {
    const targetMed = medications.find(m => m.id === selectedMedId) || medications[0];
    if (!targetMed) return;

    const inQuietHours = isCurrentTimeInQuietHours();

    if (!escalationEnabled) {
      await onTriggerEscalationEvent({
        medicationId: targetMed.id,
        medicationName: targetMed.name,
        scheduledTime: new Date().toISOString(),
        gracePeriodMinutes: 30,
        status: 'pending',
        reason: 'Unconfirmed dose — but Caregiver Escalation blocked due to lack of explicit user consent.',
        deliveryLog: 'Consent inactive. Zero data dispatched.',
      });
      setSimulationStatusLog(`Escalation BLOCKED: User has not enabled explicit consent for caregiver alerts.`);
      return;
    }

    if (inQuietHours) {
      await onTriggerEscalationEvent({
        medicationId: targetMed.id,
        medicationName: targetMed.name,
        scheduledTime: new Date().toISOString(),
        gracePeriodMinutes: 30,
        status: 'quiet_hours_blocked',
        reason: `Unconfirmed dose — suppressed by configured quiet hours (${quietStart} - ${quietEnd}).`,
        deliveryLog: `Suppressed per quiet-hour protocol. Caregiver ${name} was not disturbed.`,
      });
      setSimulationStatusLog(`Quiet Hours Protection: Escalation suppressed (${quietStart} – ${quietEnd}).`);
      return;
    }

    // Permitted -> dispatch simulated SMS
    const mockLog = `[SIMULATION] Simulated SMS dispatched to ${phone}: "HealthVault Alert: ${targetMed.name} dose unconfirmed past grace period."`;
    await onTriggerEscalationEvent({
      medicationId: targetMed.id,
      medicationName: targetMed.name,
      scheduledTime: new Date().toISOString(),
      gracePeriodMinutes: 30,
      status: 'simulated_sms_sent',
      reason: 'Grace period expired without user confirmation. Consent active and outside quiet hours.',
      deliveryLog: mockLog,
    });
    setSimulationStatusLog(`Escalation Dispatched! ${mockLog}`);
  };

  const handleInstantEscalationTest = () => {
    handleEvaluateEscalation();
  };

  // Compute countdown progress percentage
  const timerPct = timerRemaining !== null ? (timerRemaining / timerDuration) * 100 : 0;

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-charcoal-900 tracking-tight">
            Consent-Based Caregiver Coordination
          </h1>
          <p className="text-xs text-charcoal-500">
            Module 3: Privacy-first escalation protocols with grace periods, quiet hour restrictions, and revocable consent.
          </p>
        </div>

        <div className={`inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-2xl text-xs font-semibold border transition-all ${
          escalationEnabled
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-amber-50 text-amber-800 border-amber-200'
        }`}>
          {escalationEnabled ? <ShieldCheck className="w-4 h-4 text-emerald-700 animate-pulse" /> : <ShieldAlert className="w-4 h-4 text-amber-700" />}
          <span>{escalationEnabled ? 'Consent Active' : 'Escalation Consent Inactive'}</span>
        </div>
      </div>

      {/* Grid: Preferences Form on Left, Interactive Simulation on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Caregiver Preferences & Consent */}
        <div className="bg-surface rounded-2xl border border-charcoal-100 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-charcoal-100 pb-3">
            <h2 className="text-sm font-bold text-charcoal-900 flex items-center space-x-2">
              <HeartHandshake className="w-4 h-4 text-emerald-700" />
              <span>Caregiver Contact & Consent Configuration</span>
            </h2>
          </div>

          <form onSubmit={handleSavePreferences} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Caregiver Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rohan Sharma"
                className="w-full px-3 py-2 rounded-xl border border-charcoal-200 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Caregiver Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 234-5678"
                className="w-full px-3 py-2 rounded-xl border border-charcoal-200 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>

            {/* Explicit Consent Toggle */}
            <div className="p-4 rounded-2xl bg-charcoal-50 border border-charcoal-200 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xs font-bold text-charcoal-900">
                    Explicit Escalation Consent
                  </h3>
                  <p className="text-[11px] text-charcoal-600 mt-0.5 leading-normal">
                    Requires opt-in. When enabled, HealthVault can dispatch simulated alerts if a scheduled dose is unconfirmed past the grace period.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={escalationEnabled}
                  onChange={(e) => setEscalationEnabled(e.target.checked)}
                  className="w-5 h-5 rounded-md accent-emerald-700 cursor-pointer mt-1"
                />
              </div>

              {escalationEnabled && (
                <div className="pt-2 text-[10px] text-emerald-800 flex items-center justify-between border-t border-charcoal-200">
                  <span>Consent active: {caregiver?.consentGrantedAt ? new Date(caregiver.consentGrantedAt).toLocaleDateString() : 'Active'}</span>
                  <button
                    type="button"
                    onClick={handleRevokeConsent}
                    className="text-rose-700 hover:underline font-semibold"
                  >
                    Revoke Consent
                  </button>
                </div>
              )}
            </div>

            {/* Quiet Hours */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Quiet Hours Start
                </label>
                <input
                  type="time"
                  value={quietStart}
                  onChange={(e) => setQuietStart(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-charcoal-200 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Quiet Hours End
                </label>
                <input
                  type="time"
                  value={quietEnd}
                  onChange={(e) => setQuietEnd(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-charcoal-200 text-xs"
                />
              </div>
            </div>

            <p className="text-[10px] text-charcoal-500 italic">
              * Outside quiet hours, a 30-minute grace period elapses before any escalation event is dispatched.
            </p>

            <div className="pt-2 flex items-center justify-between">
              {saveSuccess ? (
                <span className="text-xs text-emerald-700 font-bold flex items-center space-x-1 animate-fade-up">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Preferences saved locally.</span>
                </span>
              ) : <div />}

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-xs transition-all hover:scale-[1.01]"
              >
                Save Preferences
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Controllable Escalation Simulator with Motion Countdown */}
        <div className="bg-surface rounded-2xl border border-charcoal-100 p-6 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-1 border-b border-charcoal-100 pb-3">
            <h2 className="text-sm font-bold text-charcoal-900 flex items-center space-x-2">
              <Play className="w-4 h-4 text-emerald-700" />
              <span>Controllable Escalation Simulator</span>
            </h2>
            <p className="text-[11px] text-charcoal-500">
              Live interactive testing sandbox for wHACKiest 2026 judges.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Target Medication for Simulation
              </label>
              <select
                value={selectedMedId}
                onChange={(e) => setSelectedMedId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-charcoal-200 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              >
                {medications.map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.dosageStrength})</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-3">
              <label className="text-xs font-semibold text-charcoal-700">Grace Timer Mode:</label>
              <div className="flex items-center space-x-1.5">
                {[10, 15, 30].map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setTimerDuration(s)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                      timerDuration === s
                        ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                        : 'bg-charcoal-50 text-charcoal-700 border-charcoal-200 hover:bg-charcoal-100'
                    }`}
                  >
                    {s}s (Demo)
                  </button>
                ))}
              </div>
            </div>

            {/* Countdown / Simulation Display Box with Animated Circular Ring */}
            <div className="p-5 rounded-2xl bg-charcoal-50 border border-charcoal-200 text-center space-y-3 relative overflow-hidden">
              {timerRemaining !== null ? (
                <div className="space-y-3 animate-scale-pop">
                  <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                    {/* SVG Countdown Ring */}
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="56"
                        cy="56"
                        r="48"
                        stroke="#E5E7EB"
                        strokeWidth="6"
                        fill="transparent"
                      />
                      <circle
                        cx="56"
                        cy="56"
                        r="48"
                        stroke="#059669"
                        strokeWidth="6"
                        fill="transparent"
                        strokeDasharray={301.59}
                        strokeDashoffset={301.59 - (301.59 * timerPct) / 100}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-linear"
                      />
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-black text-charcoal-900 font-mono">
                        {timerRemaining}s
                      </span>
                      <span className="text-[9px] uppercase font-bold text-emerald-800">Grace</span>
                    </div>
                  </div>

                  <span className="inline-block text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full uppercase tracking-wider animate-pulse">
                    Grace Period Active — Unconfirmed Dose
                  </span>

                  <p className="text-xs text-charcoal-600">
                    If unconfirmed when timer expires, quiet hours and consent will be evaluated.
                  </p>

                  <button
                    onClick={handleConfirmToCancel}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-800 text-white text-xs font-bold shadow-xs hover:bg-emerald-900 transition-all hover:scale-[1.01]"
                  >
                    Confirm Dose Now (Cancel Escalation)
                  </button>
                </div>
              ) : (
                <div className="space-y-2 py-3">
                  <Clock className="w-8 h-8 text-charcoal-400 mx-auto animate-float-gentle" />
                  <p className="text-xs font-bold text-charcoal-800">Simulator Idle</p>
                  <p className="text-[11px] text-charcoal-500 max-w-xs mx-auto">
                    Click "Simulate Unconfirmed Dose" to start the grace period countdown.
                  </p>
                </div>
              )}
            </div>

            {/* Trigger buttons */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={handleStartGracePeriodSimulation}
                disabled={timerRemaining !== null}
                className="py-2.5 px-3 rounded-xl border border-charcoal-300 bg-white hover:bg-charcoal-50 text-charcoal-800 text-xs font-bold transition-all shadow-xs disabled:opacity-50 hover:scale-[1.01]"
              >
                Simulate Unconfirmed Dose
              </button>
              <button
                type="button"
                onClick={handleInstantEscalationTest}
                className="py-2.5 px-3 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center space-x-1.5 hover:scale-[1.01]"
              >
                <Send className="w-3.5 h-3.5 text-emerald-400" />
                <span>Instant Escalation Check</span>
              </button>
            </div>

            {simulationStatusLog && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 leading-normal animate-fade-up">
                <strong>Log:</strong> {simulationStatusLog}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-charcoal-100 text-[10px] text-charcoal-500">
            <strong>Simulation Note:</strong> External Twilio SMS dispatch is simulated for hackathon safety. No live SMS charges occur.
          </div>
        </div>
      </div>

      {/* Escalation History Table */}
      <div className="bg-surface rounded-2xl border border-charcoal-100 overflow-hidden shadow-xs">
        <div className="p-4 bg-background/50 border-b border-charcoal-100 flex items-center justify-between">
          <span className="text-xs font-bold text-charcoal-900 uppercase tracking-wider flex items-center space-x-1.5">
            <Bell className="w-4 h-4 text-emerald-800" />
            <span>Escalation History & Simulated Alert Audit Log</span>
          </span>
          <span className="text-xs text-charcoal-500">
            {escalationEvents.length} recorded events
          </span>
        </div>

        <div className="divide-y divide-charcoal-100">
          {escalationEvents.length === 0 ? (
            <div className="p-8 text-center text-xs text-charcoal-500">
              No escalation events logged yet. Use the simulator above to test grace periods and quiet-hour blocks.
            </div>
          ) : (
            escalationEvents.map((evt) => {
              const isBlocked = evt.status === 'quiet_hours_blocked';
              const isSimulated = evt.status === 'simulated_sms_sent';

              return (
                <div
                  key={evt.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-charcoal-50/40 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-charcoal-900">{evt.medicationName}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isSimulated
                          ? 'bg-rose-100 text-rose-800'
                          : isBlocked
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-charcoal-100 text-charcoal-700'
                      }`}>
                        {isSimulated ? '[SIMULATED] Alert Dispatched' : isBlocked ? 'Quiet Hours Suppressed' : 'Blocked (No Consent)'}
                      </span>
                    </div>
                    <p className="text-xs text-charcoal-600">{evt.reason}</p>
                    {evt.deliveryLog && (
                      <p className="text-[11px] font-mono text-charcoal-500 bg-background p-1.5 rounded-lg border border-charcoal-100">
                        {evt.deliveryLog}
                      </p>
                    )}
                  </div>

                  <span className="text-[11px] text-charcoal-400 shrink-0">
                    {new Date(evt.triggeredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
