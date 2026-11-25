import { DoseEvent, Medication, ExplainableInsight } from '../types';
import { computeStockAnalysis } from './stockEngine';

export interface RoutinePeriodStats {
  period: 'morning' | 'afternoon' | 'evening';
  label: string;
  totalScheduled: number;
  confirmed: number;
  unconfirmed: number;
  delayed: number;
  consistencyPercentage: number;
}

export interface AdherenceMetrics {
  totalScheduled: number;
  totalConfirmed: number;
  totalUnconfirmed: number;
  totalDelayed: number;
  overallConsistencyPercentage: number;
  morning: RoutinePeriodStats;
  afternoon: RoutinePeriodStats;
  evening: RoutinePeriodStats;
  weeklyTrend: { day: string; scheduled: number; confirmed: number }[];
  insights: ExplainableInsight[];
}

function getPeriod(hour: number): 'morning' | 'afternoon' | 'evening' {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  return 'evening';
}

export function computeAdherenceAndInsights(
  events: DoseEvent[],
  medications: Medication[]
): AdherenceMetrics {
  // Filter events from the last 7 days
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);

  const recentEvents = events.filter(e => {
    const d = new Date(e.scheduledTime || e.loggedAt);
    return d >= sevenDaysAgo && d <= now;
  });

  const periodCounts = {
    morning: { total: 0, confirmed: 0, unconfirmed: 0, delayed: 0 },
    afternoon: { total: 0, confirmed: 0, unconfirmed: 0, delayed: 0 },
    evening: { total: 0, confirmed: 0, unconfirmed: 0, delayed: 0 }
  };

  // 7-day trend bucket
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const trendMap: Record<string, { day: string; scheduled: number; confirmed: number }> = {};

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    const key = d.toISOString().split('T')[0];
    trendMap[key] = {
      day: dayNames[d.getDay()],
      scheduled: 0,
      confirmed: 0
    };
  }

  let totalConfirmed = 0;
  let totalUnconfirmed = 0;
  let totalDelayed = 0;

  recentEvents.forEach(evt => {
    const schedDate = new Date(evt.scheduledTime);
    const dateKey = evt.scheduledTime.split('T')[0];
    const hour = schedDate.getHours();
    const period = getPeriod(hour);

    if (trendMap[dateKey]) {
      trendMap[dateKey].scheduled += 1;
    }
    periodCounts[period].total += 1;

    if (evt.doseStatus === 'confirmed') {
      totalConfirmed += 1;
      periodCounts[period].confirmed += 1;
      if (trendMap[dateKey]) {
        trendMap[dateKey].confirmed += 1;
      }

      // Check delay (> 45 minutes between scheduled and logged)
      const loggedDate = new Date(evt.loggedAt);
      const diffMinutes = (loggedDate.getTime() - schedDate.getTime()) / (1000 * 60);
      if (diffMinutes > 45) {
        totalDelayed += 1;
        periodCounts[period].delayed += 1;
      }
    } else if (evt.doseStatus === 'unconfirmed') {
      totalUnconfirmed += 1;
      periodCounts[period].unconfirmed += 1;
    }
  });

  const totalScheduled = recentEvents.length;
  const overallConsistencyPercentage = totalScheduled > 0
    ? Math.round((totalConfirmed / totalScheduled) * 100)
    : 0;

  const morningStats: RoutinePeriodStats = {
    period: 'morning',
    label: 'Morning (05:00 - 11:59)',
    totalScheduled: periodCounts.morning.total,
    confirmed: periodCounts.morning.confirmed,
    unconfirmed: periodCounts.morning.unconfirmed,
    delayed: periodCounts.morning.delayed,
    consistencyPercentage: periodCounts.morning.total > 0
      ? Math.round((periodCounts.morning.confirmed / periodCounts.morning.total) * 100)
      : 0
  };

  const afternoonStats: RoutinePeriodStats = {
    period: 'afternoon',
    label: 'Afternoon (12:00 - 16:59)',
    totalScheduled: periodCounts.afternoon.total,
    confirmed: periodCounts.afternoon.confirmed,
    unconfirmed: periodCounts.afternoon.unconfirmed,
    delayed: periodCounts.afternoon.delayed,
    consistencyPercentage: periodCounts.afternoon.total > 0
      ? Math.round((periodCounts.afternoon.confirmed / periodCounts.afternoon.total) * 100)
      : 0
  };

  const eveningStats: RoutinePeriodStats = {
    period: 'evening',
    label: 'Evening (17:00 - 23:59)',
    totalScheduled: periodCounts.evening.total,
    confirmed: periodCounts.evening.confirmed,
    unconfirmed: periodCounts.evening.unconfirmed,
    delayed: periodCounts.evening.delayed,
    consistencyPercentage: periodCounts.evening.total > 0
      ? Math.round((periodCounts.evening.confirmed / periodCounts.evening.total) * 100)
      : 0
  };

  // Generate Deterministic Explainable Insights
  const insights: ExplainableInsight[] = [];

  // Insight 1: Period comparison (Morning vs Evening)
  if (morningStats.totalScheduled >= 2 && eveningStats.totalScheduled >= 2) {
    if (morningStats.consistencyPercentage > eveningStats.consistencyPercentage + 15) {
      insights.push({
        id: 'insight-routine-period-comparison',
        title: 'Morning vs. Evening Routine Consistency',
        observation: `Your morning medication confirmations (${morningStats.consistencyPercentage}%) were noticeably more consistent than your evening confirmations (${eveningStats.consistencyPercentage}%) over the past 7 days.`,
        explanation: `Derived from ${morningStats.confirmed}/${morningStats.totalScheduled} confirmed morning slots versus ${eveningStats.confirmed}/${eveningStats.totalScheduled} confirmed evening slots in your Dexie local logs.`,
        category: 'routine',
        severity: 'info',
        evidenceData: { morningConsistency: morningStats.consistencyPercentage, eveningConsistency: eveningStats.consistencyPercentage },
        generatedAt: new Date().toISOString()
      });
    }
  }

  // Insight 2: Delayed confirmations observation
  if (eveningStats.delayed >= 2) {
    insights.push({
      id: 'insight-evening-delays',
      title: 'Frequent Evening Confirmation Delays',
      observation: `Your evening medication doses were logged with a delay exceeding 45 minutes across ${eveningStats.delayed} occasions this week.`,
      explanation: `Calculated by comparing the scheduled slot timestamps against actual local user confirmation timestamps for evening medications. Consider adjusting the scheduled reminder 30 minutes earlier to align with your natural dinner routine.`,
      category: 'routine',
      severity: 'warning',
      evidenceData: { delayedEveningCount: eveningStats.delayed },
      generatedAt: new Date().toISOString()
    });
  }

  // Insight 3: Stock warnings from stockEngine
  medications.forEach(med => {
    const analysis = computeStockAnalysis(med);
    if (analysis.status === 'low') {
      insights.push({
        id: `insight-stock-low-${med.id}`,
        title: `Low Stock Alert: ${med.name}`,
        observation: `${med.name} supply is projected to deplete in approximately ${analysis.daysRemaining} days (estimated ${analysis.depletionDate}).`,
        explanation: `Deterministic formula: Current stock (${med.currentStock} units) / Daily consumption (${med.expectedDailyConsumption} units/day) = ${analysis.daysRemaining} days remaining. Refill threshold is 3 days.`,
        category: 'stock',
        severity: 'warning',
        evidenceData: { currentStock: med.currentStock, daysRemaining: analysis.daysRemaining },
        generatedAt: new Date().toISOString()
      });
    } else if (analysis.status === 'refill_soon') {
      insights.push({
        id: `insight-stock-refill-${med.id}`,
        title: `Upcoming Refill Required: ${med.name}`,
        observation: `${med.name} has ${analysis.daysRemaining} days of supply remaining at current consumption rate.`,
        explanation: `Based on your daily schedule of ${med.expectedDailyConsumption} unit(s)/day and current inventory of ${med.currentStock} units.`,
        category: 'stock',
        severity: 'info',
        evidenceData: { currentStock: med.currentStock, daysRemaining: analysis.daysRemaining },
        generatedAt: new Date().toISOString()
      });
    }
  });

  // Insight 4: High overall adherence affirmation
  if (overallConsistencyPercentage >= 85 && totalScheduled >= 5) {
    insights.push({
      id: 'insight-high-adherence',
      title: 'Strong Overall Routine Consistency',
      observation: `You achieved an overall confirmation consistency of ${overallConsistencyPercentage}% across all scheduled slots this week.`,
      explanation: `Calculated from ${totalConfirmed} confirmed events out of ${totalScheduled} total scheduled events in local storage.`,
      category: 'adherence',
      severity: 'success',
      evidenceData: { overallConsistencyPercentage, totalConfirmed, totalScheduled },
      generatedAt: new Date().toISOString()
    });
  }

  return {
    totalScheduled,
    totalConfirmed,
    totalUnconfirmed,
    totalDelayed,
    overallConsistencyPercentage,
    morning: morningStats,
    afternoon: afternoonStats,
    evening: eveningStats,
    weeklyTrend: Object.values(trendMap),
    insights
  };
}
