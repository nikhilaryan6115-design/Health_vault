import React, { useState } from 'react';
import {
  ShieldCheck,
  User,
  HeartHandshake,
  Database,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Lock
} from 'lucide-react';
import { UserProfile, CaregiverConfig } from '../types';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (user: UserProfile, caregiver: CaregiverConfig) => Promise<void>;
  onLoadDemo: () => Promise<void>;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete,
  onLoadDemo,
}) => {
  const [step, setStep] = useState<number>(1);

  // Form states
  const [fullName, setFullName] = useState('Ananya Sharma');
  const [age, setAge] = useState<number>(32);
  const [emergencyContact, setEmergencyContact] = useState('Rohan Sharma (+1 555-234-5678)');
  const [profilePhoto, setProfilePhoto] = useState('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80');

  // Caregiver states
  const [caregiverName, setCaregiverName] = useState('Rohan Sharma');
  const [caregiverPhone, setCaregiverPhone] = useState('+1 (555) 234-5678');
  // NOTE: Requirement: "Caregiver escalation must be disabled until the user explicitly enables consent."
  const [escalationConsent, setEscalationConsent] = useState(false);
  const [quietStart, setQuietStart] = useState('22:00');
  const [quietEnd, setQuietEnd] = useState('07:00');

  if (!isOpen) return null;

  const handleFinish = async () => {
    const user: UserProfile = {
      id: `user-${Date.now()}`,
      fullName,
      age: Number(age) || 30,
      emergencyContact,
      profilePhoto,
      createdAt: new Date().toISOString(),
      onboarded: true,
    };

    const caregiver: CaregiverConfig = {
      id: `caregiver-${Date.now()}`,
      name: caregiverName,
      phone: caregiverPhone,
      escalationEnabled: escalationConsent,
      quietStart,
      quietEnd,
      consentGrantedAt: escalationConsent ? new Date().toISOString() : undefined,
    };

    await onComplete(user, caregiver);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-charcoal-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Step Indicator Header */}
        <div className="px-8 pt-8 pb-4 border-b border-charcoal-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-800 text-emerald-200 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-charcoal-900">HealthVault Setup</span>
              <p className="text-[11px] text-charcoal-500">Step {step} of 5</p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step
                    ? 'w-6 bg-emerald-700'
                    : i < step
                    ? 'w-3 bg-emerald-300'
                    : 'w-2 bg-charcoal-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step Body */}
        <div className="p-8 overflow-y-auto flex-1">
          {/* STEP 1: WELCOME */}
          {step === 1 && (
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-800 shadow-sm">
                <ShieldCheck className="w-9 h-9" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-charcoal-900">Welcome to HealthVault</h2>
                <p className="text-sm font-medium text-emerald-800 mt-1">
                  Know your patterns. Understand your routines. Take control of your health.
                </p>
              </div>
              <p className="text-xs text-charcoal-600 leading-relaxed max-w-md mx-auto">
                Unlike ordinary reminder apps, HealthVault pairs NFC dose confirmation, deterministic stock prediction, explainable health routine intelligence, and consent-based caregiver coordination with 100% local-first data ownership.
              </p>

              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 text-left flex items-start space-x-3">
                <Sparkles className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-emerald-900">wHACKiest 2026 Hackathon Demo Mode</p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    For a complete walkthrough with pre-filled medications, stock alerts, and 7-day adherence history, you can load the sample profile with one click.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PERSONAL PROFILE */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-charcoal-900 flex items-center space-x-2">
                  <User className="w-5 h-5 text-emerald-700" />
                  <span>Personal Profile</span>
                </h3>
                <p className="text-xs text-charcoal-500 mt-0.5">
                  Your baseline identity for local medication management.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                    placeholder="e.g. Ananya Sharma"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                      Age
                    </label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                      placeholder="32"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                      Emergency Contact
                    </label>
                    <input
                      type="text"
                      value={emergencyContact}
                      onChange={(e) => setEmergencyContact(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                      placeholder="e.g. Rohan (+1 555-234-5678)"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Profile Photo URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={profilePhoto}
                    onChange={(e) => setProfilePhoto(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 text-xs text-charcoal-600 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: HEALTH VAULT SETUP */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-charcoal-900 flex items-center space-x-2">
                  <Database className="w-5 h-5 text-emerald-700" />
                  <span>Local-First Health Vault Architecture</span>
                </h3>
                <p className="text-xs text-charcoal-500 mt-0.5">
                  How your health data is stored, protected, and controlled.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-charcoal-50 border border-charcoal-100 flex items-start space-x-3">
                  <Lock className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-charcoal-900">Zero Cloud Ingestion by Default</p>
                    <p className="text-[11px] text-charcoal-600 mt-0.5 leading-normal">
                      Your medication logs, schedule, and stock records reside inside your browser's IndexedDB via Dexie.js. No private health logs are uploaded without your explicit command.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-charcoal-50 border border-charcoal-100 flex items-start space-x-3">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-charcoal-900">AES-GCM Web Crypto Encryption</p>
                    <p className="text-[11px] text-charcoal-600 mt-0.5 leading-normal">
                      Encrypted vault export files use 256-bit AES-GCM with PBKDF2 key derivation (100,000 iterations). Only your password can decrypt your backups.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-start space-x-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-emerald-900">Privacy Safeguards</p>
                    <p className="text-[11px] text-emerald-800 mt-0.5 leading-normal">
                      NFC tags contain only opaque non-sensitive UUIDs. No medication names or diagnoses are ever written to NFC hardware.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: CAREGIVER PREFERENCES */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-charcoal-900 flex items-center space-x-2">
                  <HeartHandshake className="w-5 h-5 text-emerald-700" />
                  <span>Caregiver Coordination</span>
                </h3>
                <p className="text-xs text-charcoal-500 mt-0.5">
                  Configure escalation protocols for unconfirmed medication doses.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Caregiver Name
                  </label>
                  <input
                    type="text"
                    value={caregiverName}
                    onChange={(e) => setCaregiverName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                    placeholder="e.g. Rohan Sharma"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Caregiver Contact Phone
                  </label>
                  <input
                    type="text"
                    value={caregiverPhone}
                    onChange={(e) => setCaregiverPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                    placeholder="+1 (555) 234-5678"
                  />
                </div>

                {/* Consent switch */}
                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start justify-between space-x-3">
                  <div>
                    <p className="text-xs font-bold text-amber-900">Enable Caregiver Escalation</p>
                    <p className="text-[11px] text-amber-800 mt-0.5 leading-normal">
                      Disabled by default. If enabled, alerts will be created when a scheduled dose is unconfirmed past the 30-minute grace period outside quiet hours.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={escalationConsent}
                    onChange={(e) => setEscalationConsent(e.target.checked)}
                    className="w-5 h-5 rounded-md text-emerald-700 focus:ring-emerald-600 mt-1 cursor-pointer accent-emerald-700"
                  />
                </div>

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
              </div>
            </div>
          )}

          {/* STEP 5: READY */}
          {step === 5 && (
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-700 text-white flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-charcoal-900">HealthVault is Ready</h3>
                <p className="text-xs text-charcoal-500 mt-1">
                  Your encrypted local-first profile is prepared.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto pt-2">
                <button
                  type="button"
                  onClick={async () => {
                    await onLoadDemo();
                  }}
                  className="p-4 rounded-2xl border-2 border-emerald-600 bg-emerald-50 hover:bg-emerald-100/80 text-left transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-emerald-900">Recommended Demo</span>
                    <Sparkles className="w-4 h-4 text-emerald-700 group-hover:scale-110 transition-transform" />
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    Load Ananya’s profile with 3 sample medications, stock alerts & 7 days of adherence data.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={handleFinish}
                  className="p-4 rounded-2xl border border-charcoal-200 hover:bg-charcoal-50 text-left transition-all"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-charcoal-900">Custom Profile</span>
                    <ArrowRight className="w-4 h-4 text-charcoal-500" />
                  </div>
                  <p className="text-[11px] text-charcoal-500">
                    Proceed with your entered profile and add medications manually from scratch.
                  </p>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-8 py-4 bg-charcoal-50 border-t border-charcoal-100 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-charcoal-600 hover:bg-charcoal-200/50"
            >
              Back
            </button>
          ) : (
            <button
              onClick={async () => {
                await onLoadDemo();
              }}
              className="text-xs font-semibold text-emerald-800 hover:underline flex items-center space-x-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Skip directly to Ananya Demo</span>
            </button>
          )}

          {step < 5 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-xs"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};
