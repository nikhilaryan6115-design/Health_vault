import React, { useState } from 'react';
import {
  ShieldCheck,
  Database,
  Download,
  Lock,
  FileText,
  Key,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Upload,
  User,
  HeartHandshake,
  Video,
  Eye,
  Info
} from 'lucide-react';
import {
  UserProfile,
  Medication,
  DoseEvent,
  CaregiverConfig,
  ConsultationBooking,
  RecordSharingConsent
} from '../types';
import {
  isWebCryptoAvailable,
  encryptVaultData,
  decryptVaultData,
  EncryptedVaultPayload
} from '../utils/crypto';

interface DataOwnershipViewProps {
  user: UserProfile | null;
  medications: Medication[];
  doseEvents: DoseEvent[];
  caregiver: CaregiverConfig | null;
  consultations: ConsultationBooking[];
  sharingConsents: RecordSharingConsent[];
  onRevokeConsent: (consentId: string) => Promise<void>;
  onRestoreVaultData: (vaultData: any) => Promise<void>;
}

export const DataOwnershipView: React.FC<DataOwnershipViewProps> = ({
  user,
  medications,
  doseEvents,
  caregiver,
  consultations,
  sharingConsents,
  onRevokeConsent,
  onRestoreVaultData,
}) => {
  const [activeTab, setActiveTab] = useState<'my_data' | 'consent' | 'export' | 'security'>('my_data');

  // Encryption states
  const [passphrase, setPassphrase] = useState('');
  const [encryptStatus, setEncryptStatus] = useState<string | null>(null);
  const [decryptStatus, setDecryptStatus] = useState<string | null>(null);
  const [decryptPassword, setDecryptPassword] = useState('');
  const [uploadedEncryptedFile, setUploadedEncryptedFile] = useState<EncryptedVaultPayload | null>(null);

  const hasCrypto = isWebCryptoAvailable();

  // Export JSON
  const handleExportJson = () => {
    const fullVault = {
      exportedAt: new Date().toISOString(),
      user,
      medications,
      doseEvents,
      caregiver,
      consultations,
      sharingConsents,
    };
    const blob = new Blob([JSON.stringify(fullVault, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HealthVault-Export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export CSV
  const handleExportCsv = () => {
    let csv = 'Type,ID,Name,DosageOrTime,Status,Timestamp\n';
    medications.forEach(m => {
      csv += `Medication,"${m.id}","${m.name}","${m.dosageStrength}",Active,"${m.createdAt}"\n`;
    });
    doseEvents.forEach(d => {
      csv += `DoseEvent,"${d.id}","${d.medicationName}","${d.scheduledTime}","${d.doseStatus}","${d.loggedAt}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HealthVault-Records-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Generate Clean Health Summary Download
  const handleDownloadHealthSummary = () => {
    const summaryHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>HealthVault Personal Health Summary</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #181A1B; }
    h1 { color: #064E3B; border-bottom: 2px solid #064E3B; padding-bottom: 8px; }
    h2 { color: #047857; margin-top: 24px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th, td { border: 1px solid #DEE2E6; padding: 8px 12px; text-align: left; font-size: 13px; }
    th { background: #F8F9FA; font-weight: 600; }
    .badge { padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; background: #D1FAE5; color: #065F46; }
    .footer { margin-top: 40px; font-size: 11px; color: #6C757D; border-top: 1px solid #DEE2E6; padding-top: 12px; }
  </style>
</head>
<body>
  <h1>HealthVault Personal Health Summary</h1>
  <p><strong>Patient Name:</strong> ${user?.fullName || 'Ananya Sharma'} (Age: ${user?.age || 32})</p>
  <p><strong>Emergency Contact:</strong> ${user?.emergencyContact || 'None'}</p>
  <p><strong>Designated Caregiver:</strong> ${caregiver?.name || 'Rohan Sharma'} (${caregiver?.phone || 'N/A'})</p>
  <p><strong>Generated On:</strong> ${new Date().toLocaleString()}</p>

  <h2>Current Medication Regimen</h2>
  <table>
    <thead>
      <tr><th>Medication</th><th>Dosage</th><th>Schedule</th><th>Current Stock</th><th>Instructions</th></tr>
    </thead>
    <tbody>
      ${medications.map(m => `
        <tr>
          <td><strong>${m.name}</strong></td>
          <td>${m.dosageStrength}</td>
          <td>${m.isPRN ? 'PRN / As-Needed' : m.timeSlots.join(', ')}</td>
          <td>${m.currentStock} units</td>
          <td>${m.dosageInstructions}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <h2>Recent Medication Adherence Logs (7-Day Sample)</h2>
  <table>
    <thead>
      <tr><th>Medication</th><th>Scheduled Time</th><th>Logged Timestamp</th><th>Status</th><th>Method</th></tr>
    </thead>
    <tbody>
      ${doseEvents.slice(-10).map(d => `
        <tr>
          <td>${d.medicationName}</td>
          <td>${d.scheduledTime}</td>
          <td>${d.loggedAt}</td>
          <td><span class="badge">${d.doseStatus}</span></td>
          <td>${d.method}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="footer">
    HealthVault • Privacy-First Personal Health Intelligence • wHACKiest 2026 Hackathon Prototype.
    Personal routine insights — not an autonomous medical diagnosis.
  </div>
</body>
</html>
    `;

    const blob = new Blob([summaryHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HealthVault-Summary-${user?.fullName?.replace(/\s+/g, '_') || 'Patient'}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Encrypted Vault Backup (.vault)
  const handleExportEncryptedVault = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passphrase || passphrase.length < 6) {
      setEncryptStatus('Passphrase must be at least 6 characters.');
      return;
    }

    try {
      setEncryptStatus('Deriving PBKDF2 key and executing AES-GCM 256-bit encryption...');
      const fullVault = {
        exportedAt: new Date().toISOString(),
        user,
        medications,
        doseEvents,
        caregiver,
        consultations,
        sharingConsents,
      };

      const encrypted = await encryptVaultData(fullVault, passphrase, user?.fullName || 'User');
      const blob = new Blob([JSON.stringify(encrypted, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `HealthVault-AES256-${new Date().toISOString().split('T')[0]}.vault`;
      a.click();
      URL.revokeObjectURL(url);

      setEncryptStatus('Encrypted .vault file exported successfully. Keep your passphrase safe!');
      setPassphrase('');
    } catch (err: any) {
      setEncryptStatus(`Encryption error: ${err.message}`);
    }
  };

  // Handle Restore file selection
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.format === 'HealthVault-Encrypted-Vault') {
          setUploadedEncryptedFile(parsed);
          setDecryptStatus('Encrypted vault loaded. Enter password below to decrypt and restore.');
        } else {
          setDecryptStatus('Invalid vault file format.');
        }
      } catch (err) {
        setDecryptStatus('Failed to read file as JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleDecryptAndRestore = async () => {
    if (!uploadedEncryptedFile || !decryptPassword) return;

    try {
      setDecryptStatus('Decrypting with Web Crypto AES-GCM...');
      const decrypted = await decryptVaultData(uploadedEncryptedFile, decryptPassword);
      await onRestoreVaultData(decrypted);
      setDecryptStatus('Vault decrypted and restored into Dexie.js successfully!');
      setUploadedEncryptedFile(null);
      setDecryptPassword('');
    } catch (err: any) {
      setDecryptStatus(`Decryption failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-charcoal-900 tracking-tight">
            Personal Data Ownership Centre
          </h1>
          <p className="text-xs text-charcoal-500">
            Module 6: Verify, audit, export, and cryptographically protect your health records.
          </p>
        </div>

        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold shadow-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>Local Dexie.js IndexedDB Active</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 bg-surface p-1.5 rounded-2xl border border-charcoal-100 shadow-xs max-w-xl">
        <button
          onClick={() => setActiveTab('my_data')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'my_data'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-charcoal-600 hover:text-charcoal-900'
          }`}
        >
          My Health Data
        </button>
        <button
          onClick={() => setActiveTab('consent')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'consent'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-charcoal-600 hover:text-charcoal-900'
          }`}
        >
          Consent Management
        </button>
        <button
          onClick={() => setActiveTab('export')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'export'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-charcoal-600 hover:text-charcoal-900'
          }`}
        >
          Export Centre
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'security'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-charcoal-600 hover:text-charcoal-900'
          }`}
        >
          Privacy & Crypto
        </button>
      </div>

      {/* TAB 1: MY HEALTH DATA */}
      {activeTab === 'my_data' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-surface border border-charcoal-100 space-y-3">
            <h3 className="text-sm font-bold text-charcoal-900 flex items-center space-x-2">
              <User className="w-4 h-4 text-emerald-700" />
              <span>User Profile Records</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-charcoal-50">
                <span className="text-charcoal-500 block text-[10px] uppercase">Full Name</span>
                <span className="font-bold text-charcoal-900">{user?.fullName || 'Ananya Sharma'}</span>
              </div>
              <div className="p-3 rounded-xl bg-charcoal-50">
                <span className="text-charcoal-500 block text-[10px] uppercase">Age</span>
                <span className="font-bold text-charcoal-900">{user?.age || 32}</span>
              </div>
              <div className="p-3 rounded-xl bg-charcoal-50">
                <span className="text-charcoal-500 block text-[10px] uppercase">Emergency Contact</span>
                <span className="font-bold text-charcoal-900">{user?.emergencyContact || 'None'}</span>
              </div>
              <div className="p-3 rounded-xl bg-charcoal-50">
                <span className="text-charcoal-500 block text-[10px] uppercase">Vault Created</span>
                <span className="font-bold text-charcoal-900">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active'}
                </span>
              </div>
            </div>
          </div>

          {/* Raw Medication Records Table */}
          <div className="bg-surface rounded-2xl border border-charcoal-100 overflow-hidden shadow-xs">
            <div className="p-4 bg-background/50 border-b border-charcoal-100 flex items-center justify-between">
              <span className="text-xs font-bold text-charcoal-900 uppercase tracking-wider">
                Raw Medication Records ({medications.length})
              </span>
              <span className="text-[11px] text-charcoal-500">Stored in IndexedDB "medications" table</span>
            </div>

            <div className="divide-y divide-charcoal-100">
              {medications.map((m) => (
                <div key={m.id} className="p-4 flex items-center justify-between text-xs hover:bg-charcoal-50/50">
                  <div>
                    <span className="font-bold text-charcoal-900">{m.name}</span>
                    <span className="text-charcoal-500 ml-2 font-mono">[{m.dosageStrength}]</span>
                    <p className="text-[11px] text-charcoal-500 mt-0.5">
                      NFC UUID: <code className="font-mono text-emerald-800">{m.nfcTagId}</code>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-charcoal-900">{m.currentStock} units</span>
                    <span className="block text-[11px] text-charcoal-500">
                      {m.isPRN ? 'PRN dosing' : `${m.expectedDailyConsumption}/day`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Dose Events Table */}
          <div className="bg-surface rounded-2xl border border-charcoal-100 overflow-hidden shadow-xs">
            <div className="p-4 bg-background/50 border-b border-charcoal-100 flex items-center justify-between">
              <span className="text-xs font-bold text-charcoal-900 uppercase tracking-wider">
                Recent Dose Events ({doseEvents.length})
              </span>
              <span className="text-[11px] text-charcoal-500">Stored in IndexedDB "doseEvents" table</span>
            </div>

            <div className="max-h-60 overflow-y-auto divide-y divide-charcoal-100">
              {doseEvents.slice(-10).map((d) => (
                <div key={d.id} className="p-3 flex items-center justify-between text-xs hover:bg-charcoal-50/50">
                  <div>
                    <span className="font-bold text-charcoal-900">{d.medicationName}</span>
                    <span className="text-[11px] text-charcoal-500 ml-2">Scheduled: {d.scheduledTime}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-emerald-800">{d.doseStatus}</span>
                    <span className="block text-[10px] text-charcoal-400">via {d.method}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CONSENT MANAGEMENT */}
      {activeTab === 'consent' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-surface border border-charcoal-100 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-charcoal-100 pb-3">
              <h3 className="text-sm font-bold text-charcoal-900 flex items-center space-x-2">
                <HeartHandshake className="w-4 h-4 text-emerald-700" />
                <span>Caregiver Escalation Permission</span>
              </h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                caregiver?.escalationEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-charcoal-200 text-charcoal-700'
              }`}>
                {caregiver?.escalationEnabled ? 'Active' : 'Disabled'}
              </span>
            </div>
            <p className="text-xs text-charcoal-600">
              Current Designated Caregiver: <strong>{caregiver?.name}</strong> ({caregiver?.phone}).
              Quiet hours: {caregiver?.quietStart} to {caregiver?.quietEnd}.
            </p>
          </div>

          <div className="bg-surface rounded-2xl border border-charcoal-100 overflow-hidden shadow-xs">
            <div className="p-4 bg-background/50 border-b border-charcoal-100 flex items-center justify-between">
              <span className="text-xs font-bold text-charcoal-900 uppercase tracking-wider">
                Clinician Record-Sharing Consents Audit Log
              </span>
              <span className="text-[11px] text-charcoal-500">Granular permissions</span>
            </div>

            <div className="divide-y divide-charcoal-100">
              {sharingConsents.length === 0 ? (
                <div className="p-8 text-center text-xs text-charcoal-500">
                  No active external consents granted. Teleconsultation record shares will appear here.
                </div>
              ) : (
                sharingConsents.map((cs) => (
                  <div key={cs.id} className="p-4 flex items-center justify-between text-xs hover:bg-charcoal-50/50">
                    <div className="space-y-1">
                      <span className="font-bold text-charcoal-900">{cs.recipientName}</span>
                      <span className="text-charcoal-500 block text-[11px]">
                        Granted: {new Date(cs.grantedAt).toLocaleDateString()}
                      </span>
                      <div className="flex items-center space-x-2 text-[10px] text-emerald-800 font-semibold pt-1">
                        {cs.shareMedications && <span>• Medications</span>}
                        {cs.shareRecentLogs && <span>• Adherence Logs</span>}
                        {cs.shareHealthInsights && <span>• Routine Insights</span>}
                      </div>
                    </div>

                    <button
                      onClick={() => onRevokeConsent(cs.id)}
                      className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold"
                    >
                      Revoke Consent
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: EXPORT CENTRE */}
      {activeTab === 'export' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Export JSON */}
          <div className="p-5 rounded-2xl bg-surface border border-charcoal-100 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-charcoal-900">JSON Vault Export</h3>
              <p className="text-xs text-charcoal-600 leading-normal">
                Export your full local database including medications, dose logs, caregiver preferences, and consent history as clean, portable JSON.
              </p>
            </div>
            <button
              onClick={handleExportJson}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Download Full JSON</span>
            </button>
          </div>

          {/* Export CSV */}
          <div className="p-5 rounded-2xl bg-surface border border-charcoal-100 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-charcoal-900">CSV Spreadsheet Export</h3>
              <p className="text-xs text-charcoal-600 leading-normal">
                Export medications and chronological dose timestamps formatted for spreadsheets (Excel, Google Sheets, LibreOffice).
              </p>
            </div>
            <button
              onClick={handleExportCsv}
              className="w-full py-2.5 px-4 rounded-xl border border-charcoal-300 hover:bg-charcoal-50 text-charcoal-800 text-xs font-bold flex items-center justify-center space-x-1.5 shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Download CSV</span>
            </button>
          </div>

          {/* Download Printable HTML Summary */}
          <div className="p-5 rounded-2xl bg-surface border border-charcoal-100 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-charcoal-900">Printable Health Summary</h3>
              <p className="text-xs text-charcoal-600 leading-normal">
                Generate a formatted, printable HTML summary document containing your active regimen, stock status, and emergency contacts.
              </p>
            </div>
            <button
              onClick={handleDownloadHealthSummary}
              className="w-full py-2.5 px-4 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Download Health Summary</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: PRIVACY & CRYPTOGRAPHY */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Web Crypto Status Banner */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start space-x-3">
            <Lock className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">
                Client-Side Web Crypto API Status: {hasCrypto ? 'Active & Supported' : 'Unavailable in this browser'}
              </p>
              <p className="leading-relaxed text-emerald-800">
                HealthVault uses the native browser Web Crypto standard (<code className="font-mono">window.crypto.subtle</code>) with 256-bit AES-GCM encryption and PBKDF2 (100,000 SHA-256 iterations) key derivation to encrypt backups before export.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Encrypt & Export .vault */}
            <div className="p-5 rounded-2xl bg-surface border border-charcoal-100 shadow-xs space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-charcoal-900 flex items-center space-x-2">
                  <Key className="w-4 h-4 text-emerald-700" />
                  <span>Export Encrypted Vault Backup (.vault)</span>
                </h3>
                <p className="text-xs text-charcoal-500">
                  Protects your health database with a user-chosen passphrase using AES-GCM-256.
                </p>
              </div>

              <form onSubmit={handleExportEncryptedVault} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Enter Strong Passphrase
                  </label>
                  <input
                    type="password"
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value)}
                    placeholder="Min 6 characters..."
                    className="w-full px-3 py-2 rounded-xl border border-charcoal-200 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-xs"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Encrypt & Download (.vault)</span>
                </button>

                {encryptStatus && (
                  <p className="text-xs p-2 rounded-xl bg-charcoal-50 border border-charcoal-200 text-charcoal-700">
                    {encryptStatus}
                  </p>
                )}
              </form>
            </div>

            {/* Decrypt & Restore .vault */}
            <div className="p-5 rounded-2xl bg-surface border border-charcoal-100 shadow-xs space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-charcoal-900 flex items-center space-x-2">
                  <Upload className="w-4 h-4 text-emerald-700" />
                  <span>Restore Encrypted Vault</span>
                </h3>
                <p className="text-xs text-charcoal-500">
                  Upload a previously exported <code className="font-mono">.vault</code> file to decrypt and restore.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Upload .vault file
                  </label>
                  <input
                    type="file"
                    accept=".vault,.json"
                    onChange={handleFileUpload}
                    className="w-full text-xs text-charcoal-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-800 hover:file:bg-emerald-100"
                  />
                </div>

                {uploadedEncryptedFile && (
                  <div className="space-y-2 pt-2">
                    <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                      Decryption Passphrase
                    </label>
                    <input
                      type="password"
                      value={decryptPassword}
                      onChange={(e) => setDecryptPassword(e.target.value)}
                      placeholder="Enter the password used during export"
                      className="w-full px-3 py-2 rounded-xl border border-charcoal-200 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                    />

                    <button
                      onClick={handleDecryptAndRestore}
                      className="w-full py-2.5 px-4 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-xs"
                    >
                      <Key className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Decrypt & Restore Into Dexie</span>
                    </button>
                  </div>
                )}

                {decryptStatus && (
                  <p className="text-xs p-2 rounded-xl bg-charcoal-50 border border-charcoal-200 text-charcoal-700">
                    {decryptStatus}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Architecture Transparency Table */}
          <div className="bg-surface rounded-2xl border border-charcoal-100 p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-charcoal-900 uppercase tracking-wider">
              Transparency Matrix: Local Dexie vs. Backend Sync
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-charcoal-100 text-charcoal-500">
                    <th className="py-2 pr-4 font-semibold">Data Category</th>
                    <th className="py-2 pr-4 font-semibold">Stored Locally (IndexedDB)</th>
                    <th className="py-2 pr-4 font-semibold">Sent to Backend (FastAPI)</th>
                    <th className="py-2 font-semibold">Privacy Safeguard</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal-100 text-charcoal-700">
                  <tr>
                    <td className="py-2.5 font-bold">Medication Regimen</td>
                    <td>Yes (Dexie Table)</td>
                    <td>No (0 records uploaded)</td>
                    <td>Never sent to server without consent</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold">Dose Confirmation Logs</td>
                    <td>Yes (Dexie Table)</td>
                    <td>No</td>
                    <td>Kept on-device for routine insights</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold">NFC Hardware Tag ID</td>
                    <td>Yes (UUID mapping)</td>
                    <td>No</td>
                    <td>Non-sensitive UUID only</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold">Caregiver Escalation</td>
                    <td>Yes (Local config)</td>
                    <td>Simulated dispatch webhook</td>
                    <td>Suppressed by quiet hours & consent</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold">Teleconsultation Booking</td>
                    <td>Yes</td>
                    <td>Syncs slot & clinician only</td>
                    <td>Explicit itemized checkbox consent</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
