import React, { useState } from 'react';
import {
  Pill,
  Plus,
  Search,
  Edit2,
  Trash2,
  Radio,
  Clock,
  AlertCircle,
  Copy,
  Check,
  X
} from 'lucide-react';
import { Medication, ScheduleType } from '../types';
import { generateNfcTagUuid, writeNfcTagUuid } from '../utils/nfc';
import { computeStockAnalysis } from '../utils/stockEngine';

interface MedicationsViewProps {
  medications: Medication[];
  onAddMedication: (med: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdateMedication: (med: Medication) => Promise<void>;
  onDeleteMedication: (id: string) => Promise<void>;
  onOpenNfcModal: () => void;
  isAddModalOpen?: boolean;
  onCloseAddModal?: () => void;
}

export const MedicationsView: React.FC<MedicationsViewProps> = ({
  medications,
  onAddMedication,
  onUpdateMedication,
  onDeleteMedication,
  onOpenNfcModal,
  isAddModalOpen = false,
  onCloseAddModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'scheduled' | 'prn'>('all');
  const [modalOpen, setModalOpen] = useState(isAddModalOpen);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [dosageStrength, setDosageStrength] = useState('');
  const [dosageInstructions, setDosageInstructions] = useState('');
  const [scheduleType, setScheduleType] = useState<ScheduleType>('daily');
  const [timeSlots, setTimeSlots] = useState<string>('09:00');
  const [currentStock, setCurrentStock] = useState<number>(30);
  const [expectedDailyConsumption, setExpectedDailyConsumption] = useState<number>(1);
  const [notes, setNotes] = useState('');
  const [nfcTagId, setNfcTagId] = useState('');
  const [isPRN, setIsPRN] = useState(false);
  const [formError, setFormError] = useState('');
  const [copiedUuid, setCopiedUuid] = useState(false);
  const [nfcWriteStatus, setNfcWriteStatus] = useState<string | null>(null);

  const filteredMeds = medications.filter(med => {
    const matchesSearch = med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.dosageStrength.toLowerCase().includes(searchTerm.toLowerCase());
    if (activeFilter === 'scheduled') return matchesSearch && !med.isPRN;
    if (activeFilter === 'prn') return matchesSearch && !!med.isPRN;
    return matchesSearch;
  });

  const openAddModal = () => {
    setEditingMed(null);
    setName('');
    setDosageStrength('');
    setDosageInstructions('');
    setScheduleType('daily');
    setTimeSlots('09:00');
    setCurrentStock(30);
    setExpectedDailyConsumption(1);
    setNotes('');
    setNfcTagId(generateNfcTagUuid());
    setIsPRN(false);
    setFormError('');
    setNfcWriteStatus(null);
    setModalOpen(true);
  };

  const openEditModal = (med: Medication) => {
    setEditingMed(med);
    setName(med.name);
    setDosageStrength(med.dosageStrength);
    setDosageInstructions(med.dosageInstructions);
    setScheduleType(med.scheduleType);
    setTimeSlots(med.timeSlots.join(', '));
    setCurrentStock(med.currentStock);
    setExpectedDailyConsumption(med.expectedDailyConsumption);
    setNotes(med.notes || '');
    setNfcTagId(med.nfcTagId || generateNfcTagUuid());
    setIsPRN(!!med.isPRN);
    setFormError('');
    setNfcWriteStatus(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingMed(null);
    if (onCloseAddModal) onCloseAddModal();
  };

  const handleGenerateNewUuid = () => {
    setNfcTagId(generateNfcTagUuid());
  };

  const handleCopyUuid = () => {
    navigator.clipboard.writeText(nfcTagId);
    setCopiedUuid(true);
    setTimeout(() => setCopiedUuid(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Medication name is required.');
      return;
    }
    if (!dosageStrength.trim()) {
      setFormError('Dosage strength is required.');
      return;
    }

    const slots = isPRN
      ? []
      : timeSlots.split(',').map(s => s.trim()).filter(Boolean);

    if (!isPRN && slots.length === 0) {
      setFormError('Please enter at least one scheduled time slot (e.g. 09:00).');
      return;
    }

    if (editingMed) {
      await onUpdateMedication({
        ...editingMed,
        name: name.trim(),
        dosageStrength: dosageStrength.trim(),
        dosageInstructions: dosageInstructions.trim(),
        scheduleType: isPRN ? 'as_needed' : scheduleType,
        timeSlots: slots,
        currentStock: Number(currentStock) || 0,
        expectedDailyConsumption: isPRN ? 0 : Number(expectedDailyConsumption) || 1,
        notes: notes.trim(),
        nfcTagId: nfcTagId.trim(),
        isPRN,
        updatedAt: new Date().toISOString()
      });
    } else {
      await onAddMedication({
        name: name.trim(),
        dosageStrength: dosageStrength.trim(),
        dosageInstructions: dosageInstructions.trim(),
        scheduleType: isPRN ? 'as_needed' : scheduleType,
        timeSlots: slots,
        currentStock: Number(currentStock) || 0,
        expectedDailyConsumption: isPRN ? 0 : Number(expectedDailyConsumption) || 1,
        notes: notes.trim(),
        nfcTagId: nfcTagId.trim(),
        isPRN,
      });
    }

    closeModal();
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-charcoal-900 tracking-tight">
            Medications
          </h1>
          <p className="text-xs text-charcoal-500">
            Module 1: Comprehensive medication registry with non-sensitive NFC UUID bindings.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={onOpenNfcModal}
            className="px-3.5 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-900 text-xs font-semibold hover:bg-emerald-100 flex items-center space-x-1.5 transition-all shadow-xs hover:scale-[1.02]"
          >
            <Radio className="w-4 h-4 text-emerald-700 animate-pulse" />
            <span>NFC Tap Reader</span>
          </button>
          <button
            onClick={openAddModal}
            className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center space-x-1.5 transition-all shadow-xs hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Register Medication</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface p-3 rounded-2xl border border-charcoal-100 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by medication name or strength..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 bg-background/50 transition-all"
          />
        </div>

        <div className="flex items-center space-x-1 bg-charcoal-50 p-1 rounded-xl">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeFilter === 'all'
                ? 'bg-white text-charcoal-900 shadow-xs'
                : 'text-charcoal-500 hover:text-charcoal-800'
            }`}
          >
            All ({medications.length})
          </button>
          <button
            onClick={() => setActiveFilter('scheduled')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeFilter === 'scheduled'
                ? 'bg-white text-charcoal-900 shadow-xs'
                : 'text-charcoal-500 hover:text-charcoal-800'
            }`}
          >
            Scheduled ({medications.filter(m => !m.isPRN).length})
          </button>
          <button
            onClick={() => setActiveFilter('prn')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeFilter === 'prn'
                ? 'bg-white text-charcoal-900 shadow-xs'
                : 'text-charcoal-500 hover:text-charcoal-800'
            }`}
          >
            PRN As-Needed ({medications.filter(m => m.isPRN).length})
          </button>
        </div>
      </div>

      {/* Medications Grid with Motion Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMeds.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-surface rounded-2xl border border-charcoal-100">
            <Pill className="w-10 h-10 text-charcoal-300 mx-auto mb-2 animate-float-gentle" />
            <p className="text-sm font-bold text-charcoal-800">No medications found</p>
            <p className="text-xs text-charcoal-500 mt-1 max-w-sm mx-auto">
              {searchTerm ? 'Try a different search term or filter.' : 'Click "Register Medication" to add your first medicine.'}
            </p>
          </div>
        ) : (
          filteredMeds.map((med) => {
            const stock = computeStockAnalysis(med);
            return (
              <div
                key={med.id}
                className="bg-surface rounded-2xl border border-charcoal-100 p-5 shadow-xs flex flex-col justify-between hover:border-emerald-300 hover:-translate-y-1 hover:shadow-md transition-all duration-300 ease-out group"
              >
                <div className="space-y-3">
                  {/* Top row */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Pill className="w-5 h-5 text-emerald-700" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-charcoal-900">{med.name}</h3>
                        <span className="text-xs text-charcoal-500 font-medium">{med.dosageStrength}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => openEditModal(med)}
                        className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-700 hover:bg-charcoal-50 transition-colors"
                        title="Edit medication"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Remove ${med.name} from HealthVault?`)) {
                            onDeleteMedication(med.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-charcoal-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete medication"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Instructions */}
                  <p className="text-xs text-charcoal-600 leading-normal line-clamp-2">
                    {med.dosageInstructions}
                  </p>

                  {/* Schedule badges */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {med.isPRN ? (
                      <span className="px-2 py-0.5 rounded-md bg-charcoal-100 text-charcoal-700 text-[10px] font-semibold">
                        PRN (As Needed)
                      </span>
                    ) : (
                      med.timeSlots.map(time => (
                        <span
                          key={time}
                          className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-100 text-[10px] font-semibold flex items-center space-x-1"
                        >
                          <Clock className="w-2.5 h-2.5 text-emerald-600" />
                          <span>{time}</span>
                        </span>
                      ))
                    )}
                  </div>

                  {/* Stock pill & NFC status */}
                  <div className="pt-2 border-t border-charcoal-100 flex items-center justify-between text-xs">
                    <span className="text-charcoal-500">Stock:</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${stock.badgeColorClass}`}>
                      {stock.badgeLabel}
                    </span>
                  </div>

                  {/* Non-sensitive NFC Tag ID display */}
                  <div className="p-2 rounded-xl bg-background border border-charcoal-100 flex items-center justify-between text-[10px] text-charcoal-500 font-mono">
                    <span className="flex items-center space-x-1">
                      <Radio className="w-3 h-3 text-emerald-700" />
                      <span>Tag: {med.nfcTagId ? `${med.nfcTagId.slice(0, 12)}...` : 'Not linked'}</span>
                    </span>
                    <span className="text-[9px] text-emerald-700 font-sans font-medium">Non-Sensitive UUID</span>
                  </div>
                </div>

                {/* Card footer actions */}
                <div className="mt-4 pt-3 border-t border-charcoal-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-charcoal-500">
                    {med.isPRN ? 'PRN dosing' : `${med.expectedDailyConsumption} unit(s)/day`}
                  </span>

                  <button
                    onClick={() => {
                      onUpdateMedication({
                        ...med,
                        currentStock: med.currentStock + 10,
                        updatedAt: new Date().toISOString()
                      });
                    }}
                    className="text-[11px] font-semibold text-emerald-800 hover:underline transition-colors"
                  >
                    +10 Refill
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Medication Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-sm animate-fade-up">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-charcoal-100 overflow-hidden flex flex-col max-h-[90vh] animate-scale-pop">
            <div className="px-6 py-4 border-b border-charcoal-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                  <Pill className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-charcoal-900">
                  {editingMed ? 'Edit Medication' : 'Register New Medication'}
                </h3>
              </div>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-600 hover:bg-charcoal-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center space-x-2 animate-scale-pop">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Medication Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Vitamin D3, Metformin"
                  className="w-full px-3 py-2 rounded-xl border border-charcoal-200 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Dosage Strength *
                  </label>
                  <input
                    type="text"
                    required
                    value={dosageStrength}
                    onChange={(e) => setDosageStrength(e.target.value)}
                    placeholder="e.g. 500 mg, 2000 IU"
                    className="w-full px-3 py-2 rounded-xl border border-charcoal-200 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Schedule Type
                  </label>
                  <select
                    value={isPRN ? 'as_needed' : scheduleType}
                    onChange={(e) => {
                      if (e.target.value === 'as_needed') {
                        setIsPRN(true);
                        setScheduleType('as_needed');
                      } else {
                        setIsPRN(false);
                        setScheduleType(e.target.value as ScheduleType);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-charcoal-200 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  >
                    <option value="daily">Daily Schedule</option>
                    <option value="twice_daily">Twice Daily</option>
                    <option value="thrice_daily">Thrice Daily</option>
                    <option value="as_needed">PRN / As Needed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Dosage Instructions
                </label>
                <textarea
                  rows={2}
                  value={dosageInstructions}
                  onChange={(e) => setDosageInstructions(e.target.value)}
                  placeholder="e.g. Take 1 tablet with lunch and water."
                  className="w-full px-3 py-2 rounded-xl border border-charcoal-200 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              {!isPRN && (
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Scheduled Time Slots (comma-separated HH:mm)
                  </label>
                  <input
                    type="text"
                    value={timeSlots}
                    onChange={(e) => setTimeSlots(e.target.value)}
                    placeholder="e.g. 09:00, 20:00"
                    className="w-full px-3 py-2 rounded-xl border border-charcoal-200 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-mono"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Current Stock (units) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={currentStock}
                    onChange={(e) => setCurrentStock(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-charcoal-200 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Daily Consumption {isPRN && '(N/A for PRN)'}
                  </label>
                  <input
                    type="number"
                    min={0}
                    disabled={isPRN}
                    value={isPRN ? 0 : expectedDailyConsumption}
                    onChange={(e) => setExpectedDailyConsumption(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-charcoal-200 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-hidden disabled:bg-charcoal-100"
                  />
                </div>
              </div>

              {/* NFC Non-Sensitive Tag ID Binding */}
              <div className="p-3.5 rounded-2xl bg-charcoal-50 border border-charcoal-100 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-charcoal-900 flex items-center space-x-1.5">
                    <Radio className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Non-Sensitive NFC Tag UUID</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateNewUuid}
                    className="text-[10px] text-emerald-800 font-semibold hover:underline"
                  >
                    Regenerate UUID
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={nfcTagId}
                    onChange={(e) => setNfcTagId(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-charcoal-200 text-xs font-mono text-charcoal-600 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleCopyUuid}
                    className="p-2 rounded-xl border border-charcoal-200 bg-white hover:bg-charcoal-50 text-charcoal-600 transition-colors"
                    title="Copy UUID"
                  >
                    {copiedUuid ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[10px] text-charcoal-500 leading-normal">
                  Privacy Rule: Only this random UUID is written to physical NFC hardware. Zero medical identifiers are stored on the tag.
                </p>
                {nfcWriteStatus && (
                  <p className="text-[10px] text-emerald-800 bg-emerald-50 p-1.5 rounded-lg border border-emerald-200 animate-fade-up">
                    {nfcWriteStatus}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Optional Notes
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Keep refrigerated, take with full meal"
                  className="w-full px-3 py-2 rounded-xl border border-charcoal-200 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <div className="pt-4 border-t border-charcoal-100 flex items-center justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl border border-charcoal-200 text-xs font-semibold text-charcoal-600 hover:bg-charcoal-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-xs transition-all hover:scale-[1.01]"
                >
                  {editingMed ? 'Save Changes' : 'Register Medication'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
