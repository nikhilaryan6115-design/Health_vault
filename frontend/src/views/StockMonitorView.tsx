import React, { useState } from 'react';
import {
  Package,
  AlertTriangle,
  Plus,
  ArrowUpRight,
  TrendingDown,
  Calendar,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Edit3,
  X
} from 'lucide-react';
import { Medication, StockAdjustment } from '../types';
import { computeStockAnalysis, MedicationStockInsight } from '../utils/stockEngine';

interface StockMonitorViewProps {
  medications: Medication[];
  onUpdateStock: (medicationId: string, newStock: number, reason: StockAdjustment['reason']) => Promise<void>;
}

export const StockMonitorView: React.FC<StockMonitorViewProps> = ({
  medications,
  onUpdateStock,
}) => {
  const [selectedMed, setSelectedMed] = useState<Medication | null>(null);
  const [refillQuantity, setRefillQuantity] = useState<number>(30);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const analyses = medications.map(m => ({
    med: m,
    analysis: computeStockAnalysis(m)
  }));

  const lowStockList = analyses.filter(a => a.analysis.status === 'low' || a.analysis.status === 'depleted');
  const refillSoonList = analyses.filter(a => a.analysis.status === 'refill_soon');
  const healthyList = analyses.filter(a => a.analysis.status === 'healthy' && !a.analysis.isPRN);
  const prnList = analyses.filter(a => a.analysis.isPRN);

  const openRefillModal = (med: Medication) => {
    setSelectedMed(med);
    setRefillQuantity(30);
    setIsModalOpen(true);
  };

  const handleRefillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMed) return;
    const newTotal = selectedMed.currentStock + Number(refillQuantity);
    await onUpdateStock(selectedMed.id, newTotal, 'manual_refill');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-charcoal-900 tracking-tight">
            Stock Monitor & Predictive Depletion
          </h1>
          <p className="text-xs text-charcoal-500">
            Module 2: Real-time inventory forecasting with automated refill thresholds and PRN uncertainty management.
          </p>
        </div>
      </div>

      {/* High-level status cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-surface border border-charcoal-100 shadow-xs">
          <span className="text-[11px] font-semibold text-charcoal-500 uppercase tracking-wider block">
            Healthy Stock
          </span>
          <div className="text-2xl font-extrabold text-emerald-800 mt-1">
            {healthyList.length}
          </div>
          <p className="text-[11px] text-charcoal-500 mt-0.5">&gt; 7 days supply</p>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-amber-200/60 shadow-xs">
          <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block">
            Refill Soon
          </span>
          <div className="text-2xl font-extrabold text-amber-800 mt-1">
            {refillSoonList.length}
          </div>
          <p className="text-[11px] text-amber-700 mt-0.5">4 – 7 days remaining</p>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-rose-200/60 shadow-xs">
          <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider block">
            Critical Low Stock
          </span>
          <div className="text-2xl font-extrabold text-rose-800 mt-1">
            {lowStockList.length}
          </div>
          <p className="text-[11px] text-rose-700 mt-0.5">&le; 3 days warning</p>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-charcoal-100 shadow-xs">
          <span className="text-[11px] font-semibold text-charcoal-500 uppercase tracking-wider block">
            PRN / As-Needed
          </span>
          <div className="text-2xl font-extrabold text-charcoal-800 mt-1">
            {prnList.length}
          </div>
          <p className="text-[11px] text-charcoal-500 mt-0.5">Irregular consumption</p>
        </div>
      </div>

      {/* Critical Refill Warning Banner if any */}
      {lowStockList.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start space-x-3 text-rose-900">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider">Refill Warning Triggered (&le; 3 Days Remaining)</h3>
            <p className="text-xs text-rose-800 leading-normal">
              The following medications have 3 or fewer days of supply remaining: {lowStockList.map(l => `${l.med.name} (${l.analysis.daysRemaining ?? 0} days)`).join(', ')}. Please refill or schedule a prescription renewal.
            </p>
          </div>
        </div>
      )}

      {/* Medication Stock Table / List */}
      <div className="bg-surface rounded-2xl border border-charcoal-100 overflow-hidden shadow-xs">
        <div className="p-4 bg-background/50 border-b border-charcoal-100 flex items-center justify-between">
          <span className="text-xs font-bold text-charcoal-900 uppercase tracking-wider flex items-center space-x-1.5">
            <Package className="w-4 h-4 text-emerald-800" />
            <span>Medication Stock Forecast Matrix</span>
          </span>
          <span className="text-xs text-charcoal-500">
            Formula: Days = Current Stock ÷ Daily Consumption
          </span>
        </div>

        <div className="divide-y divide-charcoal-100">
          {analyses.map(({ med, analysis }) => {
            const isPRN = analysis.isPRN;
            const stockPct = isPRN
              ? Math.min(100, (med.currentStock / 30) * 100)
              : Math.min(100, ((analysis.daysRemaining || 0) / 30) * 100);

            return (
              <div
                key={med.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-charcoal-50/40 transition-colors"
              >
                {/* Left: Med Details */}
                <div className="space-y-1.5 max-w-sm">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-bold text-charcoal-900">{med.name}</h3>
                    <span className="text-xs text-charcoal-500 font-medium">({med.dosageStrength})</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${analysis.badgeColorClass}`}>
                      {analysis.badgeLabel}
                    </span>
                  </div>

                  <p className="text-xs text-charcoal-600">{med.dosageInstructions}</p>

                  {/* PRN Uncertainty Notice */}
                  {isPRN ? (
                    <div className="p-2.5 rounded-xl bg-charcoal-50 border border-charcoal-200 text-[11px] text-charcoal-700 flex items-start space-x-1.5 mt-2">
                      <HelpCircle className="w-3.5 h-3.5 text-charcoal-500 shrink-0 mt-0.5" />
                      <p>
                        <strong>PRN Uncertainty Notice:</strong> This medicine is taken as-needed. Consumption is irregular, so fixed depletion dates are not deterministically projected.
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-charcoal-500 flex items-center space-x-1 pt-1">
                      <Calendar className="w-3.5 h-3.5 text-charcoal-400" />
                      <span>
                        Projected depletion date: <strong className="text-charcoal-800">{analysis.depletionDate}</strong>
                      </span>
                    </p>
                  )}
                </div>

                {/* Middle: Visual Bar & Metrics */}
                <div className="flex-1 max-w-xs space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-charcoal-500">Current Inventory:</span>
                    <span className="font-bold text-charcoal-900">{med.currentStock} units</span>
                  </div>

                  <div className="w-full bg-charcoal-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        analysis.status === 'low' || analysis.status === 'depleted'
                          ? 'bg-rose-600'
                          : analysis.status === 'refill_soon'
                          ? 'bg-amber-500'
                          : 'bg-emerald-600'
                      }`}
                      style={{ width: `${Math.max(5, stockPct)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-charcoal-500">
                    <span>
                      {isPRN ? 'Variable rate' : `${med.expectedDailyConsumption} units/day`}
                    </span>
                    <span className="font-semibold text-charcoal-700">
                      {analysis.daysRemaining !== null ? `${analysis.daysRemaining} days supply` : 'As-needed supply'}
                    </span>
                  </div>
                </div>

                {/* Right: Refill action */}
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => openRefillModal(med)}
                    className="px-3 py-2 rounded-xl border border-charcoal-200 text-xs font-semibold text-charcoal-700 hover:bg-charcoal-50 flex items-center space-x-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Log Refill</span>
                  </button>
                  <button
                    onClick={() => onUpdateStock(med.id, med.currentStock + 10, 'manual_refill')}
                    className="px-3 py-2 rounded-xl bg-emerald-800 text-white text-xs font-semibold hover:bg-emerald-900"
                    title="Quick add 10 tablets"
                  >
                    +10
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Refill Dialog Modal */}
      {isModalOpen && selectedMed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-charcoal-100 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-charcoal-100 pb-3">
              <h3 className="text-sm font-bold text-charcoal-900">
                Log Stock Refill for {selectedMed.name}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-charcoal-400 hover:text-charcoal-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRefillSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Quantity Added (units)
                </label>
                <input
                  type="number"
                  min={1}
                  value={refillQuantity}
                  onChange={(e) => setRefillQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-charcoal-200 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <div className="p-3 rounded-xl bg-charcoal-50 text-xs space-y-1">
                <div className="flex justify-between text-charcoal-600">
                  <span>Current Stock:</span>
                  <span className="font-semibold">{selectedMed.currentStock} units</span>
                </div>
                <div className="flex justify-between text-emerald-800 font-bold">
                  <span>New Total:</span>
                  <span>{selectedMed.currentStock + Number(refillQuantity)} units</span>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-charcoal-200 text-xs font-semibold text-charcoal-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-900"
                >
                  Confirm Refill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
