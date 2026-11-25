import React, { useState } from 'react';
import {
  CalendarClock,
  CheckCircle2,
  AlertCircle,
  Radio,
  Clock,
  RotateCcw,
  Check
} from 'lucide-react';
import { Medication, DoseEvent } from '../types';
import { fireDoseConfetti } from '../utils/confetti';

interface ScheduleViewProps {
  medications: Medication[];
  doseEvents: DoseEvent[];
  onConfirmDose: (medicationId: string, scheduledTime: string) => Promise<void>;
  onCorrectDose: (doseEventId: string) => Promise<void>;
  onOpenNfcModal: () => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  medications,
  doseEvents,
  onConfirmDose,
  onCorrectDose,
  onOpenNfcModal,
}) => {
  const [selectedDayOffset, setSelectedDayOffset] = useState<number>(0); // 0 = today, -1 = yesterday, etc.
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Compute targeted date
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + selectedDayOffset);
  const targetDateStr = targetDate.toISOString().split('T')[0];

  const displayDateTitle = selectedDayOffset === 0
    ? "Today's Schedule"
    : selectedDayOffset === -1
    ? "Yesterday's Schedule"
    : targetDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

  // Generate slots for targeted date
  const scheduleSlots: {
    medication: Medication;
    time: string;
    isoTime: string;
    matchedEvent?: DoseEvent;
    isConfirmed: boolean;
    isPast: boolean;
  }[] = [];

  medications.forEach(med => {
    if (!med.isPRN && med.timeSlots && med.timeSlots.length > 0) {
      med.timeSlots.forEach(slotTime => {
        const isoTime = `${targetDateStr}T${slotTime}:00`;
        const slotDate = new Date(isoTime);
        const isPast = slotDate.getTime() < Date.now();

        // Match against existing doseEvent
        const matched = doseEvents.find(
          d => d.medicationId === med.id && d.scheduledTime.startsWith(targetDateStr) && d.scheduledTime.includes(slotTime)
        );

        scheduleSlots.push({
          medication: med,
          time: slotTime,
          isoTime,
          matchedEvent: matched,
          isConfirmed: matched?.doseStatus === 'confirmed',
          isPast
        });
      });
    }
  });

  scheduleSlots.sort((a, b) => a.time.localeCompare(b.time));

  const handleManualConfirm = async (medId: string, isoTime: string) => {
    await onConfirmDose(medId, isoTime);
    fireDoseConfetti();
    setFeedbackMessage('Dose logged successfully. (Medication interaction recorded locally).');
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleUndo = async (eventId: string) => {
    await onCorrectDose(eventId);
    setFeedbackMessage('Dose confirmation corrected and reverted.');
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-charcoal-900 tracking-tight">
            Medication Schedule
          </h1>
          <p className="text-xs text-charcoal-500">
            Module 1: Chronological dose timeline with manual and contactless NFC verification.
          </p>
        </div>

        {/* Date Selector Pills */}
        <div className="flex items-center space-x-1.5 bg-surface p-1 rounded-2xl border border-charcoal-100 shadow-xs">
          {[-2, -1, 0, 1].map((offset) => {
            const d = new Date();
            d.setDate(d.getDate() + offset);
            const label = offset === 0 ? 'Today' : offset === -1 ? 'Yesterday' : offset === 1 ? 'Tomorrow' : d.toLocaleDateString(undefined, { weekday: 'short' });
            return (
              <button
                key={offset}
                onClick={() => setSelectedDayOffset(offset)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  selectedDayOffset === offset
                    ? 'bg-emerald-800 text-white shadow-xs scale-105'
                    : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-charcoal-50'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Clinical Disclaimer Banner */}
      <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-xs text-emerald-900 flex items-start space-x-2.5 shadow-xs">
        <AlertCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Clinical Verification Protocol:</strong> Logging a dose confirms user interaction and medication bottle retrieval. It does not medically verify physiological ingestion. Accidental logs can be corrected at any time.
        </p>
      </div>

      {feedbackMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-100 border border-emerald-300 text-xs font-bold text-emerald-900 flex items-center space-x-2 animate-scale-pop">
          <Check className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Schedule timeline */}
      <div className="bg-surface rounded-2xl border border-charcoal-100 divide-y divide-charcoal-100 overflow-hidden shadow-xs">
        <div className="p-4 bg-background/50 border-b border-charcoal-100 flex items-center justify-between">
          <span className="text-xs font-bold text-charcoal-800 uppercase tracking-wider flex items-center space-x-1.5">
            <CalendarClock className="w-4 h-4 text-emerald-700" />
            <span>{displayDateTitle}</span>
          </span>
          <span className="text-xs font-semibold text-charcoal-500">
            {scheduleSlots.filter(s => s.isConfirmed).length} / {scheduleSlots.length} Confirmed
          </span>
        </div>

        {scheduleSlots.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Clock className="w-8 h-8 text-charcoal-300 mx-auto animate-float-gentle" />
            <p className="text-sm font-semibold text-charcoal-700">No scheduled medication events for this day</p>
            <p className="text-xs text-charcoal-500">Scheduled time slots appear here automatically.</p>
          </div>
        ) : (
          scheduleSlots.map((slot, idx) => {
            return (
              <div
                key={`${slot.medication.id}-${slot.time}-${idx}`}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-emerald-50/20 transition-all duration-200"
              >
                {/* Left: Time & Details */}
                <div className="flex items-start space-x-4">
                  <div className="w-14 text-center shrink-0 pt-0.5">
                    <span className="text-sm font-extrabold text-charcoal-900 block">{slot.time}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                      slot.isConfirmed
                        ? 'bg-emerald-100 text-emerald-800'
                        : slot.isPast
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-charcoal-100 text-charcoal-600'
                    }`}>
                      {slot.isConfirmed ? 'Done' : slot.isPast ? 'Pending' : 'Upcoming'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-bold text-charcoal-900">{slot.medication.name}</h3>
                      <span className="text-xs text-charcoal-500 font-medium">({slot.medication.dosageStrength})</span>
                    </div>
                    <p className="text-xs text-charcoal-600 leading-normal">{slot.medication.dosageInstructions}</p>

                    {slot.matchedEvent?.loggedAt && (
                      <p className="text-[11px] text-emerald-800 font-medium flex items-center space-x-1 pt-0.5 animate-fade-up">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>
                          Confirmed at {new Date(slot.matchedEvent.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} via{' '}
                          {slot.matchedEvent.method === 'nfc' ? 'NFC Tap' : 'Manual Confirmation'}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center space-x-2.5 sm:self-center shrink-0">
                  {slot.isConfirmed ? (
                    <div className="flex items-center space-x-2 animate-scale-pop">
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center space-x-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Confirmed</span>
                      </span>
                      {slot.matchedEvent && (
                        <button
                          onClick={() => handleUndo(slot.matchedEvent!.id)}
                          className="p-1.5 rounded-xl text-charcoal-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Undo / Correct accidental log"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleManualConfirm(slot.medication.id, slot.isoTime)}
                        className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-all shadow-xs hover:scale-[1.02]"
                      >
                        Confirm Dose
                      </button>
                      <button
                        onClick={onOpenNfcModal}
                        className="p-2 rounded-xl border border-charcoal-200 text-charcoal-600 hover:bg-charcoal-100 hover:text-emerald-800 transition-colors"
                        title="Confirm with NFC"
                      >
                        <Radio className="w-4 h-4 text-emerald-700" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
