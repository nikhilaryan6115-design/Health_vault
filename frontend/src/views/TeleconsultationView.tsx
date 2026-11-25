import React, { useState } from 'react';
import {
  Video,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Lock,
  User,
  Star,
  DollarSign,
  AlertCircle,
  Camera,
  Mic,
  PhoneOff,
  Sparkles,
  X
} from 'lucide-react';
import { Clinician, ConsultationBooking, RecordSharingConsent, Medication, DoseEvent, ExplainableInsight } from '../types';

interface TeleconsultationViewProps {
  consultations: ConsultationBooking[];
  medications: Medication[];
  doseEvents: DoseEvent[];
  insights: ExplainableInsight[];
  onBookConsultation: (
    booking: Omit<ConsultationBooking, 'id' | 'bookedAt'>,
    consent: Omit<RecordSharingConsent, 'id' | 'grantedAt'>
  ) => Promise<void>;
}

const DEMO_CLINICIANS: Clinician[] = [
  {
    id: 'doc-01',
    name: 'Dr. Sarah Mitchell, MD',
    specialty: 'Internal Medicine & Preventative Care',
    avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
    experienceYears: 14,
    consultationFee: 75,
    modes: ['video', 'audio'],
    availableSlots: ['09:00 AM', '11:30 AM', '02:00 PM', '04:30 PM'],
    hospitalAffiliation: 'St. Jude Medical Institute',
  },
  {
    id: 'doc-02',
    name: 'Dr. Rajesh Mehta, MD, FACC',
    specialty: 'Cardiology & Chronic Disease Care',
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    experienceYears: 18,
    consultationFee: 110,
    modes: ['video'],
    availableSlots: ['10:00 AM', '01:00 PM', '03:30 PM'],
    hospitalAffiliation: 'Metro Heart & Vascular Center',
  },
  {
    id: 'doc-03',
    name: 'Dr. Elena Rostova, PharmD',
    specialty: 'Clinical Pharmacotherapy & Polypharmacy',
    avatarUrl: 'https://images.unsplash.com/photo-1594824813515-7798365444a1?w=150&auto=format&fit=crop&q=80',
    experienceYears: 11,
    consultationFee: 65,
    modes: ['video', 'audio'],
    availableSlots: ['11:00 AM', '02:30 PM', '05:00 PM'],
    hospitalAffiliation: 'University Health Sciences',
  },
  {
    id: 'doc-04',
    name: 'Dr. Marcus Vance, MD',
    specialty: 'Endocrinology & Metabolic Health',
    avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
    experienceYears: 16,
    consultationFee: 95,
    modes: ['video'],
    availableSlots: ['09:30 AM', '12:00 PM', '03:00 PM'],
    hospitalAffiliation: 'Endocrine & Diabetes Care Center',
  }
];

export const TeleconsultationView: React.FC<TeleconsultationViewProps> = ({
  consultations,
  medications,
  doseEvents,
  insights,
  onBookConsultation,
}) => {
  const [selectedClinician, setSelectedClinician] = useState<Clinician | null>(null);
  const [bookingDate, setBookingDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [bookingTime, setBookingTime] = useState<string>('10:00 AM');
  const [bookingNotes, setBookingNotes] = useState<string>('');

  // Explicit Health Record Sharing Consent state
  const [shareMedications, setShareMedications] = useState<boolean>(true);
  const [shareRecentLogs, setShareRecentLogs] = useState<boolean>(true);
  const [shareHealthInsights, setShareHealthInsights] = useState<boolean>(false);

  // Booking modal step: 'details' -> 'consent' -> 'confirmed'
  const [bookingStep, setBookingStep] = useState<'details' | 'consent' | null>(null);

  // Active simulated consultation room state
  const [activeRoomBooking, setActiveRoomBooking] = useState<ConsultationBooking | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(true);
  const [micActive, setMicActive] = useState<boolean>(true);

  const startBooking = (clinician: Clinician) => {
    setSelectedClinician(clinician);
    setBookingTime(clinician.availableSlots[0] || '10:00 AM');
    setBookingStep('details');
  };

  const proceedToConsent = () => {
    setBookingStep('consent');
  };

  const handleFinalizeBooking = async () => {
    if (!selectedClinician) return;

    await onBookConsultation(
      {
        clinicianId: selectedClinician.id,
        clinicianName: selectedClinician.name,
        specialty: selectedClinician.specialty,
        date: bookingDate,
        time: bookingTime,
        status: 'confirmed',
        sharedConsentId: `consent-${Date.now()}`,
        notes: bookingNotes.trim(),
      },
      {
        recipientType: 'clinician',
        recipientName: selectedClinician.name,
        shareMedications,
        shareRecentLogs,
        shareHealthInsights,
      }
    );

    setBookingStep(null);
    setSelectedClinician(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-charcoal-900 tracking-tight">
            Clinician Teleconsultation
          </h1>
          <p className="text-xs text-charcoal-500">
            Module 5: Consultation coordination with explicit health record sharing consent.
          </p>
        </div>

        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold shadow-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>Explicit Record Sharing Consent Required</span>
        </div>
      </div>

      {/* Transparent Demonstration Banner */}
      <div className="p-3.5 rounded-2xl bg-charcoal-50 border border-charcoal-200 text-xs text-charcoal-700 flex items-start space-x-2.5">
        <AlertCircle className="w-4 h-4 text-charcoal-500 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Demonstration Notice:</strong> Clinician directory profiles and virtual room handoffs are functional prototype demonstrations. They are not connected to a live medical provider. No records are shared without explicit checkbox authorization.
        </p>
      </div>

      {/* Booked Consultations Card if any */}
      {consultations.length > 0 && (
        <div className="bg-surface rounded-2xl border border-charcoal-100 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-charcoal-100 pb-3">
            <h2 className="text-xs font-bold text-charcoal-900 uppercase tracking-wider flex items-center space-x-1.5">
              <Calendar className="w-4 h-4 text-emerald-800" />
              <span>Your Booked Consultations</span>
            </h2>
            <span className="text-xs text-charcoal-500">{consultations.length} scheduled</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {consultations.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-xl border border-emerald-200/80 bg-emerald-50/40 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-charcoal-900">{c.clinicianName}</h3>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase">
                      {c.status}
                    </span>
                  </div>
                  <p className="text-xs text-charcoal-600">{c.specialty}</p>

                  <div className="flex items-center space-x-3 text-xs text-charcoal-700 pt-2 font-medium">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{c.date}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{c.time}</span>
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveRoomBooking(c)}
                  className="w-full py-2 px-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-xs transition-all"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Join Demo Consultation Room</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clinician Directory */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-charcoal-900">
          Available Clinicians (Demonstration Profiles)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {DEMO_CLINICIANS.map((clinician) => (
            <div
              key={clinician.id}
              className="bg-surface rounded-2xl border border-charcoal-100 p-5 shadow-xs flex flex-col justify-between hover:border-emerald-200 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start space-x-3.5">
                  <img
                    src={clinician.avatarUrl}
                    alt={clinician.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-charcoal-200 shadow-xs"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-charcoal-900">{clinician.name}</h3>
                    <p className="text-xs text-emerald-800 font-medium">{clinician.specialty}</p>
                    <p className="text-[11px] text-charcoal-500 mt-0.5">{clinician.hospitalAffiliation}</p>
                    <span className="inline-block text-[10px] text-charcoal-400 font-semibold mt-1">
                      {clinician.experienceYears} years clinical experience
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-charcoal-50 text-xs flex items-center justify-between text-charcoal-700">
                  <span>Consultation Fee:</span>
                  <span className="font-bold text-charcoal-900">${clinician.consultationFee} USD</span>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-charcoal-500 block mb-1.5">
                    Available Today / Tomorrow:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {clinician.availableSlots.map(slot => (
                      <span
                        key={slot}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-100 text-[11px] font-medium"
                      >
                        {slot}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-charcoal-100 flex items-center justify-end">
                <button
                  onClick={() => startBooking(clinician)}
                  className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-all shadow-xs"
                >
                  Book Consultation
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Wizard Modal */}
      {bookingStep && selectedClinician && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-charcoal-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-charcoal-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                  <Video className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-charcoal-900">
                  {bookingStep === 'details' ? 'Schedule Consultation' : 'Explicit Record Sharing Consent'}
                </h3>
              </div>
              <button
                onClick={() => setBookingStep(null)}
                className="p-1 rounded-lg text-charcoal-400 hover:text-charcoal-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              {/* STEP 1: DETAILS */}
              {bookingStep === 'details' && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 rounded-2xl bg-charcoal-50 border border-charcoal-100">
                    <img
                      src={selectedClinician.avatarUrl}
                      alt={selectedClinician.name}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-charcoal-900">{selectedClinician.name}</h4>
                      <p className="text-[11px] text-charcoal-600">{selectedClinician.specialty}</p>
                      <p className="text-[10px] text-charcoal-500 font-semibold">${selectedClinician.consultationFee} USD</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                      Choose Consultation Date
                    </label>
                    <input
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-charcoal-200 text-xs focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                      Select Available Time Slot
                    </label>
                    <select
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-charcoal-200 text-xs focus:ring-2 focus:ring-emerald-600"
                    >
                      {selectedClinician.availableSlots.map(slot => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                      Reason for Consultation / Symptoms
                    </label>
                    <textarea
                      rows={2}
                      value={bookingNotes}
                      onChange={(e) => setBookingNotes(e.target.value)}
                      placeholder="e.g. Discuss evening fatigue and review current vitamin regimen..."
                      className="w-full px-3 py-2 rounded-xl border border-charcoal-200 text-xs focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  <div className="pt-2 flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setBookingStep(null)}
                      className="px-4 py-2 rounded-xl border border-charcoal-200 text-xs font-semibold text-charcoal-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={proceedToConsent}
                      className="px-4 py-2 rounded-xl bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-900"
                    >
                      Proceed to Consent Review &rarr;
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: EXPLICIT RECORD SHARING CONSENT */}
              {bookingStep === 'consent' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 flex items-start space-x-2.5">
                    <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">Privacy-First Record Sharing</strong>
                      <span className="text-[11px] leading-normal">
                        HealthVault will never transmit records to any clinician without your explicit, itemized checkbox permission.
                      </span>
                    </div>
                  </div>

                  <p className="text-xs font-bold text-charcoal-800">
                    Select health data to share with {selectedClinician.name}:
                  </p>

                  <div className="space-y-2.5">
                    <label className="flex items-start space-x-3 p-3 rounded-xl border border-charcoal-200 hover:bg-charcoal-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={shareMedications}
                        onChange={(e) => setShareMedications(e.target.checked)}
                        className="w-4 h-4 mt-0.5 accent-emerald-700"
                      />
                      <div>
                        <span className="text-xs font-bold text-charcoal-900 block">Medication List & Dosages</span>
                        <span className="text-[11px] text-charcoal-500">
                          {medications.length} active registered medications ({medications.map(m => m.name).join(', ')})
                        </span>
                      </div>
                    </label>

                    <label className="flex items-start space-x-3 p-3 rounded-xl border border-charcoal-200 hover:bg-charcoal-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={shareRecentLogs}
                        onChange={(e) => setShareRecentLogs(e.target.checked)}
                        className="w-4 h-4 mt-0.5 accent-emerald-700"
                      />
                      <div>
                        <span className="text-xs font-bold text-charcoal-900 block">Recent 7-Day Adherence Logs</span>
                        <span className="text-[11px] text-charcoal-500">
                          Timestamped dose confirmations ({doseEvents.length} local events)
                        </span>
                      </div>
                    </label>

                    <label className="flex items-start space-x-3 p-3 rounded-xl border border-charcoal-200 hover:bg-charcoal-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={shareHealthInsights}
                        onChange={(e) => setShareHealthInsights(e.target.checked)}
                        className="w-4 h-4 mt-0.5 accent-emerald-700"
                      />
                      <div>
                        <span className="text-xs font-bold text-charcoal-900 block">Routine Intelligence Insights</span>
                        <span className="text-[11px] text-charcoal-500">
                          Generated morning/evening observations ({insights.length} active insights)
                        </span>
                      </div>
                    </label>
                  </div>

                  <div className="pt-3 border-t border-charcoal-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setBookingStep('details')}
                      className="px-4 py-2 rounded-xl border border-charcoal-200 text-xs font-semibold text-charcoal-600"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleFinalizeBooking}
                      className="px-5 py-2.5 rounded-xl bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-900 shadow-xs"
                    >
                      Confirm Booking & Grant Consent
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Interactive Simulated Consultation Room */}
      {activeRoomBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-charcoal-900 text-white w-full max-w-4xl h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-charcoal-800">
            {/* Room Header */}
            <div className="px-6 py-4 bg-charcoal-800/80 border-b border-charcoal-700 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-xs font-bold tracking-tight">
                  HealthVault Secure Consultation Room (Demonstration Screen)
                </span>
              </div>
              <button
                onClick={() => setActiveRoomBooking(null)}
                className="p-1 rounded-lg text-charcoal-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Room Content Grid: Video on Left, Shared Records on Right */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 overflow-hidden">
              {/* Left (2 cols): Video feeds */}
              <div className="md:col-span-2 bg-charcoal-950 p-4 flex flex-col justify-between relative">
                {/* Doctor video feed */}
                <div className="flex-1 rounded-2xl bg-charcoal-900 border border-charcoal-800 flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="text-center space-x-2 space-y-3 z-10">
                    <img
                      src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80"
                      alt="Doctor"
                      className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-emerald-500 shadow-md"
                    />
                    <div>
                      <p className="text-sm font-bold text-white">{activeRoomBooking.clinicianName}</p>
                      <p className="text-xs text-emerald-400">{activeRoomBooking.specialty}</p>
                    </div>
                    <span className="inline-block text-[10px] bg-charcoal-800/80 px-2.5 py-1 rounded-full text-charcoal-300">
                      Simulated Doctor Audio/Video Stream Active
                    </span>
                  </div>

                  {/* Patient self-view PiP */}
                  <div className="absolute bottom-4 right-4 w-32 h-24 rounded-xl bg-charcoal-800 border border-charcoal-700 overflow-hidden flex items-center justify-center shadow-lg">
                    {cameraActive ? (
                      <div className="w-full h-full bg-emerald-950/40 flex flex-col items-center justify-center text-[10px] text-emerald-300">
                        <User className="w-6 h-6 mb-1" />
                        <span>Self View (Active)</span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-charcoal-500">Camera Off</span>
                    )}
                  </div>
                </div>

                {/* Bottom Room Controls */}
                <div className="h-16 flex items-center justify-center space-x-3 pt-3">
                  <button
                    onClick={() => setMicActive(!micActive)}
                    className={`p-3 rounded-full transition-all ${
                      micActive ? 'bg-charcoal-800 text-white' : 'bg-rose-600 text-white'
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCameraActive(!cameraActive)}
                    className={`p-3 rounded-full transition-all ${
                      cameraActive ? 'bg-charcoal-800 text-white' : 'bg-rose-600 text-white'
                    }`}
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveRoomBooking(null)}
                    className="px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm"
                  >
                    <PhoneOff className="w-4 h-4" />
                    <span>Leave Room</span>
                  </button>
                </div>
              </div>

              {/* Right (1 col): Clinician's View of Shared Records */}
              <div className="bg-charcoal-900 border-l border-charcoal-800 p-4 overflow-y-auto space-y-4">
                <div className="border-b border-charcoal-800 pb-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider block">
                    Clinician View: Shared Records
                  </span>
                  <p className="text-[10px] text-charcoal-400">
                    Restricted strictly to user-consented modules.
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-charcoal-800/80 border border-charcoal-700 space-y-1.5">
                    <span className="text-[11px] font-bold text-emerald-400">Consented Medications:</span>
                    {medications.map(m => (
                      <p key={m.id} className="text-[11px] text-charcoal-300">
                        • {m.name} ({m.dosageStrength}) — {m.dosageInstructions}
                      </p>
                    ))}
                  </div>

                  <div className="p-3 rounded-xl bg-charcoal-800/80 border border-charcoal-700 space-y-1">
                    <span className="text-[11px] font-bold text-emerald-400">Recent Adherence:</span>
                    <p className="text-[11px] text-charcoal-300">
                      7-day consistency: <strong className="text-white">88%</strong> ({doseEvents.length} logged dose events).
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-charcoal-800/80 border border-charcoal-700 space-y-1">
                    <span className="text-[11px] font-bold text-emerald-400">Doctor's Clinical Notes:</span>
                    <textarea
                      rows={4}
                      defaultValue="Patient reports consistent morning routine with Vitamin D. Discussed shifting evening medication 30 minutes earlier to reduce delayed confirmation pattern."
                      className="w-full bg-charcoal-950 p-2 rounded-lg border border-charcoal-700 text-[11px] text-charcoal-200 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
