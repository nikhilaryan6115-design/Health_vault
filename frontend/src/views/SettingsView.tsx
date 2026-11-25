import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  Server,
  Radio,
  Lock,
  Database
} from 'lucide-react';
import { UserProfile } from '../types';
import { isWebCryptoAvailable } from '../utils/crypto';
import { isWebNfcSupported } from '../utils/nfc';

interface SettingsViewProps {
  user: UserProfile | null;
  onUpdateProfile: (user: UserProfile) => Promise<void>;
  onLoadDemoData: () => Promise<void>;
  onResetData: () => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  onUpdateProfile,
  onLoadDemoData,
  onResetData,
}) => {
  const [fullName, setFullName] = useState(user?.fullName || 'Ananya Sharma');
  const [age, setAge] = useState(user?.age || 32);
  const [emergencyContact, setEmergencyContact] = useState(user?.emergencyContact || 'Rohan (+1 555-234-5678)');
  const [profilePhoto, setProfilePhoto] = useState(
    user?.profilePhoto || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  );
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [backendStatus, setBackendStatus] = useState<string>('Testing...');

  React.useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        setBackendStatus(data.status === 'healthy' ? 'Online (FastAPI :8000)' : 'Error');
      })
      .catch(() => {
        setBackendStatus('Local Offline Fallback (FastAPI optional)');
      });
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    await onUpdateProfile({
      ...user,
      fullName: fullName.trim(),
      age: Number(age) || 30,
      emergencyContact: emergencyContact.trim(),
      profilePhoto: profilePhoto.trim(),
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-charcoal-900 tracking-tight">
          Settings & System Diagnostics
        </h1>
        <p className="text-xs text-charcoal-500">
          Manage your personal profile, review system capabilities, and trigger demo states.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Settings Form */}
        <div className="p-6 rounded-2xl bg-surface border border-charcoal-100 shadow-xs space-y-5">
          <div className="flex items-center space-x-2 border-b border-charcoal-100 pb-3">
            <User className="w-4 h-4 text-emerald-700" />
            <h2 className="text-sm font-bold text-charcoal-900">Personal Health Profile</h2>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-charcoal-200 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
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
                  className="w-full px-3 py-2 rounded-xl border border-charcoal-200 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
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
                  className="w-full px-3 py-2 rounded-xl border border-charcoal-200 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Avatar Photo URL
              </label>
              <input
                type="text"
                value={profilePhoto}
                onChange={(e) => setProfilePhoto(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-charcoal-200 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              {saveSuccess ? (
                <span className="text-xs text-emerald-800 font-bold flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Profile updated locally.</span>
                </span>
              ) : <div />}

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-xs"
              >
                Save Profile
              </button>
            </div>
          </form>
        </div>

        {/* Demo Controls & Diagnostics */}
        <div className="space-y-6">
          {/* Demo Controls Box */}
          <div className="p-6 rounded-2xl bg-surface border border-charcoal-100 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-charcoal-100 pb-3">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <h2 className="text-sm font-bold text-charcoal-900">wHACKiest 2026 Demo Data Controls</h2>
            </div>
            <p className="text-xs text-charcoal-600 leading-normal">
              Effortlessly switch between the judge walkthrough sample (Ananya) or reset database for a clean start.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={onLoadDemoData}
                className="p-3.5 rounded-xl border-2 border-emerald-600 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold flex flex-col items-center justify-center space-y-1 transition-all"
              >
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <span>Load Ananya Profile</span>
                <span className="text-[10px] text-emerald-700 font-normal">3 meds + 7-day adherence</span>
              </button>

              <button
                onClick={() => {
                  if (confirm('Clear local database and reset?')) {
                    onResetData();
                  }
                }}
                className="p-3.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold flex flex-col items-center justify-center space-y-1 transition-all"
              >
                <RotateCcw className="w-4 h-4 text-rose-600" />
                <span>Reset Database</span>
                <span className="text-[10px] text-rose-600 font-normal">Clear all records</span>
              </button>
            </div>
          </div>

          {/* System Diagnostics */}
          <div className="p-6 rounded-2xl bg-surface border border-charcoal-100 shadow-xs space-y-3">
            <h2 className="text-xs font-bold text-charcoal-900 uppercase tracking-wider">
              System Architecture & Diagnostic Checks
            </h2>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-charcoal-50">
                <span className="flex items-center space-x-2 text-charcoal-700">
                  <Database className="w-3.5 h-3.5 text-emerald-700" />
                  <span>IndexedDB (Dexie.js)</span>
                </span>
                <span className="text-emerald-800 font-bold">Operational (Local)</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-charcoal-50">
                <span className="flex items-center space-x-2 text-charcoal-700">
                  <Lock className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Web Crypto API (AES-GCM-256)</span>
                </span>
                <span className="text-emerald-800 font-bold">
                  {isWebCryptoAvailable() ? 'Supported' : 'Unavailable'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-charcoal-50">
                <span className="flex items-center space-x-2 text-charcoal-700">
                  <Radio className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Web NFC Standard</span>
                </span>
                <span className="text-charcoal-700 font-medium">
                  {isWebNfcSupported() ? 'Hardware Supported' : 'Simulated Sandbox Mode'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-charcoal-50">
                <span className="flex items-center space-x-2 text-charcoal-700">
                  <Server className="w-3.5 h-3.5 text-emerald-700" />
                  <span>FastAPI Backend API</span>
                </span>
                <span className="text-charcoal-700 font-medium">{backendStatus}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
