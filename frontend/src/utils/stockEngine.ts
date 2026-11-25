import { Medication, StockStatus } from '../types';

export interface MedicationStockInsight {
  medicationId: string;
  medicationName: string;
  dosageStrength: string;
  currentStock: number;
  expectedDailyConsumption: number;
  daysRemaining: number | null; // null for PRN / irregular
  depletionDate: string | null;
  status: StockStatus;
  isPRN: boolean;
  needsRefillWarning: boolean; // 3 days or fewer
  badgeLabel: string;
  badgeColorClass: string;
}

export function calculateDaysRemaining(currentStock: number, dailyConsumption: number, isPRN: boolean = false): number | null {
  if (isPRN || dailyConsumption <= 0) {
    return null;
  }
  if (currentStock <= 0) return 0;
  return Math.floor(currentStock / dailyConsumption);
}

export function calculateDepletionDate(daysRemaining: number | null): string | null {
  if (daysRemaining === null) return null;
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + daysRemaining);
  return targetDate.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function computeStockAnalysis(med: Medication): MedicationStockInsight {
  const isPRN = !!med.isPRN || med.expectedDailyConsumption <= 0;
  const daysRemaining = calculateDaysRemaining(med.currentStock, med.expectedDailyConsumption, isPRN);
  const depletionDate = calculateDepletionDate(daysRemaining);

  let status: StockStatus = 'healthy';
  let badgeLabel = 'Healthy Stock';
  let badgeColorClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  let needsRefillWarning = false;

  if (med.currentStock === 0) {
    status = 'depleted';
    badgeLabel = 'Stock Depleted';
    badgeColorClass = 'bg-rose-50 text-rose-800 border-rose-200';
    needsRefillWarning = true;
  } else if (isPRN) {
    status = med.currentStock < 5 ? 'refill_soon' : 'healthy';
    badgeLabel = 'PRN / Irregular Consumption';
    badgeColorClass = 'bg-charcoal-50 text-charcoal-700 border-charcoal-200';
  } else if (daysRemaining !== null) {
    if (daysRemaining <= 3) {
      status = 'low';
      badgeLabel = `Low Stock (${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'} left)`;
      badgeColorClass = 'bg-rose-50 text-rose-800 border-rose-200';
      needsRefillWarning = true;
    } else if (daysRemaining <= 7) {
      status = 'refill_soon';
      badgeLabel = `Refill Soon (${daysRemaining} days left)`;
      badgeColorClass = 'bg-amber-50 text-amber-800 border-amber-200';
    } else {
      status = 'healthy';
      badgeLabel = `Adequate (${daysRemaining} days left)`;
      badgeColorClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    }
  }

  return {
    medicationId: med.id,
    medicationName: med.name,
    dosageStrength: med.dosageStrength,
    currentStock: med.currentStock,
    expectedDailyConsumption: med.expectedDailyConsumption,
    daysRemaining,
    depletionDate,
    status,
    isPRN,
    needsRefillWarning,
    badgeLabel,
    badgeColorClass,
  };
}
