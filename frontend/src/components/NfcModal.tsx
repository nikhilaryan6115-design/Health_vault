import React, { useState } from 'react';
import {
  Radio,
  X,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  RotateCcw,
  Pill,
  Sparkles
} from 'lucide-react';
import { Medication, DoseEvent } from '../types';
import { isWebNfcSupported } from '../utils/nfc';
import { NfcRadarGraphic } from './NfcRadarGraphic';
import { fireDoseConfetti } from '../utils/confetti';

interface NfcModalProps {
  isOpen: boolean;
  onClose: () => void;
  medications: Medication[];
  onConfirmDose: (medicationId: string, method: 'nfc' | 'manual', scheduledTime?: string) => Promise<DoseEvent>;
  onCorrectDose?: (doseEventId: string) => Promise<void>;
}

export const NfcModal: React.FC<NfcModalProps> = ({
  isOpen,
  onClose,
  medications,
  onConfirmDose,
  onCorrectDose,
}) => {
  const [selectedMedId, setSelectedMedId] = useState<string>(medications[0]?.id || '');
  const [activeStep, setActiveStep] = useState<'scan' | 'confirm' | 'success'>('scan');
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState('');
  const [loggedEvent, setLoggedEvent] = useState<DoseEvent | null>(null);
  const [undoSuccess, setUndoSuccess] = useState(false);

  if (!isOpen) return null;

  const selectedMed = medications.find(m => m.id === selectedMedId) || medications[0];
  const hasHardwareNfc = isWebNfcSupported();

  const handleSimulatedTap = () => {
    if (!selectedMed) return;
    setActiveStep('confirm');
  };

  const handleNativeWebNfcScan = async () => {
    if (!hasHardwareNfc) return;
    setIsScanning(true);
    setScanMessage('Ready. Hold your compatible NFC tag or Android device near the sensor...');

    try {
      const ndef = new (window as any).NDEFReader();
      await ndef.scan();

      ndef.onreading = (event: any) => {
        setIsScanning(false);
        const decoder = new TextDecoder();
        for (const record of event.message.records) {
          const payloadText = decoder.decode(record.data);
          const match = payloadText.match(/urn:healthvault:tag:([a-f0-9-]+)/i);
          if (match && match[1]) {
            const scannedUuid = match[1];
            const matchedMed = medications.find(m => m.nfcTagId === scannedUuid);
            if (matchedMed) {
              setSelectedMedId(matchedMed.id);
              setActiveStep('confirm');
              return;
            } else {
              setScanMessage(`Scanned tag UUID (${scannedUuid.slice(0, 8)}...) is not bound to any local medication.`);
              return;
            }
          }
        }
        setScanMessage('Tag read, but no HealthVault payload found.');
      };

      ndef.onreadingerror = () => {
        setIsScanning(false);
        setScanMessage('Error reading NFC tag. Please try tapping again.');
      };
    } catch (err: any) {
      setIsScanning(false);
      setScanMessage(`Web NFC Scan error: ${err.message || 'Permission denied or NFC unavailable'}`);
    }
  };

  const handleConfirmDose = async () => {
    if (!selectedMed) return;
    const nowIso = new Date().toISOString();
    const event = await onConfirmDose(selectedMed.id, 'nfc', nowIso);
    setLoggedEvent(event);
    setUndoSuccess(false);
    setActiveStep('success');
    fireDoseConfetti();
  };

  const handleUndo = async () => {
    if (loggedEvent && onCorrectDose) {
      await onCorrectDose(loggedEvent.id);
      setUndoSuccess(true);
    }
  };

  const handleResetModal = () => {
    setActiveStep('scan');
    setLoggedEvent(null);
    setUndoSuccess(false);
    setScanMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-md animate-fade-up">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-charcoal-100/80 overflow-hidden flex flex-col animate-scale-pop">
        {/* Header */}
        <div className="px-6 py-4 border-b border-charcoal-100 flex items-center justify-between bg-surface/90">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shadow-xs">
              <Radio className="w-4 h-4 text-emerald-700 animate-pulse-glow" />
            </div>
            <div>
              <span className="text-sm font-bold text-charcoal-900 tracking-tight">NFC Dose Reader & Sensor</span>
              <p className="text-[11px] text-charcoal-500">Module 1: Privacy-first dose confirmation</p>
            </div>
          </div>
          <button
            onClick={() => {
              handleResetModal();
              onClose();
            }}
            className="p-1.5 rounded-xl text-charcoal-400 hover:text-charcoal-700 hover:bg-charcoal-50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {/* STEP 1: SCAN OR SELECT */}
          {activeStep === 'scan' && (
            <div className="space-y-5 animate-fade-up">
              {/* Animated Radar Graphic */}
              <div className="p-2 rounded-2xl bg-gradient-to-b from-emerald-50/50 to-transparent border border-emerald-100/60">
                <NfcRadarGraphic
                  isScanning={isScanning}
                  statusText={isScanning ? 'Listening for NFC Signal...' : 'Ready for Contactless Tap'}
                  onTap={handleSimulatedTap}
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-xs text-emerald-900 flex items-start space-x-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Zero PHI On Hardware Tag:</strong> Tags store only opaque non-sensitive UUIDs. No medication names or personal data ever exist on the physical tag.
                </p>
              </div>

              {/* Native Hardware NFC Option */}
              {hasHardwareNfc && (
                <div className="p-4 rounded-2xl border border-charcoal-200 bg-charcoal-50/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-charcoal-900">Web NFC Hardware Active</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold">Android Chrome</span>
                  </div>
                  <p className="text-[11px] text-charcoal-600">
                    Your device supports physical NFC reading through the Web NFC standard.
                  </p>
                  <button
                    onClick={handleNativeWebNfcScan}
                    disabled={isScanning}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-800 text-white text-xs font-semibold hover:bg-emerald-900 flex items-center justify-center space-x-2 shadow-xs transition-all active:scale-[0.99]"
                  >
                    <Radio className="w-4 h-4 text-emerald-200" />
                    <span>{isScanning ? 'Listening for NFC Tap...' : 'Scan Physical NFC Tag'}</span>
                  </button>
                  {scanMessage && (
                    <p className="text-[11px] text-charcoal-700 bg-white p-2 rounded-lg border border-charcoal-200 animate-fade-up">
                      {scanMessage}
                    </p>
                  )}
                </div>
              )}

              {/* Virtual Hardware Simulator (Judges Testing Sandbox) */}
              <div className="p-4 rounded-2xl border-2 border-dashed border-charcoal-200 space-y-3 bg-surface hover:border-emerald-300 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-charcoal-900 flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Simulate NFC Tap on Registered Bottle</span>
                  </span>
                  <span className="text-[10px] text-charcoal-500 font-medium">Demo Testing</span>
                </div>
                <p className="text-[11px] text-charcoal-600">
                  Select a medication bottle below to simulate tapping its NFC sticker tag:
                </p>

                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {medications.map((med) => (
                    <label
                      key={med.id}
                      onClick={() => setSelectedMedId(med.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-all duration-200 ${
                        selectedMedId === med.id
                          ? 'border-emerald-700 bg-emerald-50/80 text-emerald-950 font-semibold shadow-xs'
                          : 'border-charcoal-200 hover:bg-charcoal-50 text-charcoal-700 hover:border-charcoal-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <Pill className={`w-4 h-4 ${selectedMedId === med.id ? 'text-emerald-700' : 'text-charcoal-400'}`} />
                        <div>
                          <span>{med.name}</span>
                          <span className="block text-[10px] text-charcoal-500 font-normal">
                            UUID: {med.nfcTagId ? `${med.nfcTagId.slice(0, 13)}...` : 'Unassigned'}
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] text-charcoal-500">{med.dosageStrength}</span>
                    </label>
                  ))}
                </div>

                <button
                  onClick={handleSimulatedTap}
                  className="w-full py-2.5 px-4 rounded-xl bg-charcoal-900 text-white text-xs font-semibold hover:bg-charcoal-800 flex items-center justify-center space-x-2 shadow-xs transition-all active:scale-[0.99]"
                >
                  <Radio className="w-4 h-4 text-emerald-400" />
                  <span>Simulate Contactless NFC Tap</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: MEDICATION CONFIRMATION SCREEN */}
          {activeStep === 'confirm' && selectedMed && (
            <div className="space-y-5 animate-fade-up">
              <div className="text-center py-2">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center mx-auto mb-3 shadow-xs animate-float-gentle">
                  <Pill className="w-8 h-8" />
                </div>
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-widest">
                  NFC Tag Resolved
                </span>
                <h3 className="text-xl font-bold text-charcoal-900 mt-0.5">
                  {selectedMed.name}
                </h3>
                <p className="text-xs font-medium text-charcoal-600">
                  Strength: {selectedMed.dosageStrength}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-charcoal-50/80 border border-charcoal-100 space-y-2 text-xs">
                <div className="flex justify-between text-charcoal-700">
                  <span className="text-charcoal-500">Instructions:</span>
                  <span className="font-semibold text-right max-w-[220px]">{selectedMed.dosageInstructions}</span>
                </div>
                <div className="flex justify-between text-charcoal-700">
                  <span className="text-charcoal-500">Current Stock:</span>
                  <span className="font-semibold">{selectedMed.currentStock} units</span>
                </div>
                <div className="flex justify-between text-charcoal-700">
                  <span className="text-charcoal-500">Resolved UUID:</span>
                  <span className="font-mono text-[10px] text-charcoal-500">{selectedMed.nfcTagId}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p>
                  <strong>Clinical Notice:</strong> Confirming this dose records your interaction timestamp and decrements stock. HealthVault does not assume or verify physiological ingestion.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setActiveStep('scan')}
                  className="py-2.5 px-4 rounded-xl border border-charcoal-200 text-xs font-semibold text-charcoal-700 hover:bg-charcoal-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDose}
                  className="py-2.5 px-4 rounded-xl bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-900 flex items-center justify-center space-x-1.5 shadow-sm transition-all active:scale-[0.98]"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Dose</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS */}
          {activeStep === 'success' && selectedMed && (
            <div className="space-y-5 text-center py-4 animate-scale-pop">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center mx-auto shadow-xs animate-pulse-glow">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-charcoal-900">Dose logged successfully.</h3>
                <p className="text-xs text-charcoal-500 mt-1">
                  Interaction recorded for {selectedMed.name} at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-charcoal-50 border border-charcoal-100 text-left text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Method:</span>
                  <span className="font-semibold text-emerald-800">NFC Tap Confirmation</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Updated Remaining Stock:</span>
                  <span className="font-semibold text-charcoal-900">{selectedMed.currentStock} units</span>
                </div>
              </div>

              {undoSuccess ? (
                <div className="p-3 rounded-xl bg-amber-50 text-amber-900 text-xs font-medium animate-fade-up">
                  Accidental dose log corrected. Inventory reverted.
                </div>
              ) : (
                <div className="pt-2">
                  <button
                    onClick={handleUndo}
                    className="inline-flex items-center space-x-1.5 text-xs text-rose-700 hover:text-rose-900 hover:underline font-semibold transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Did you log by mistake? Correct accidental log</span>
                  </button>
                </div>
              )}

              <div className="pt-3">
                <button
                  onClick={() => {
                    handleResetModal();
                    onClose();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-charcoal-900 text-white text-xs font-semibold hover:bg-charcoal-800 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
