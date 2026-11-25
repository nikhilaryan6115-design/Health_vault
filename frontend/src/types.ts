export type RoutinePeriod = 'morning' | 'afternoon' | 'evening' | 'night';

export type ScheduleType = 'daily' | 'twice_daily' | 'thrice_daily' | 'as_needed' | 'custom';

export type StockStatus = 'healthy' | 'refill_soon' | 'low' | 'depleted';

export type DoseStatus = 'confirmed' | 'unconfirmed' | 'cancelled';

export interface UserProfile {
  id: string;
  fullName: string;
  age: number;
  emergencyContact: string;
  profilePhoto?: string;
  createdAt: string;
  onboarded: boolean;
}

export interface Medication {
  id: string;
  name: string;
  dosageStrength: string;
  dosageInstructions: string;
  scheduleType: ScheduleType;
  timeSlots: string[]; // e.g., ["09:00", "20:00"]
  currentStock: number;
  expectedDailyConsumption: number;
  notes?: string;
  nfcTagId?: string; // non-sensitive UUID
  isPRN?: boolean; // as-needed
  createdAt: string;
  updatedAt: string;
}

export interface DoseEvent {
  id: string;
  medicationId: string;
  medicationName: string;
  scheduledTime: string; // ISO string or "YYYY-MM-DDTHH:mm"
  loggedAt: string; // ISO string
  doseStatus: DoseStatus;
  method: 'nfc' | 'manual' | 'simulated';
  notes?: string;
  isCorrected?: boolean;
}

export interface CaregiverConfig {
  id: string;
  name: string;
  phone: string;
  escalationEnabled: boolean;
  quietStart: string; // "22:00"
  quietEnd: string;   // "07:00"
  consentGrantedAt?: string;
  consentRevokedAt?: string;
}

export interface EscalationEvent {
  id: string;
  medicationId: string;
  medicationName: string;
  scheduledTime: string;
  triggeredAt: string;
  gracePeriodMinutes: number;
  status: 'pending' | 'cancelled' | 'escalated' | 'simulated_sms_sent' | 'quiet_hours_blocked';
  reason: string;
  deliveryLog?: string;
}

export interface Clinician {
  id: string;
  name: string;
  specialty: string;
  avatarUrl: string;
  experienceYears: number;
  consultationFee: number;
  modes: ('video' | 'audio')[];
  availableSlots: string[]; // ["10:00 AM", "02:30 PM", "04:00 PM"]
  hospitalAffiliation: string;
}

export interface RecordSharingConsent {
  id: string;
  consultationId?: string;
  recipientType: 'clinician' | 'caregiver' | 'external';
  recipientName: string;
  shareMedications: boolean;
  shareRecentLogs: boolean;
  shareHealthInsights: boolean;
  grantedAt: string;
  revokedAt?: string;
}

export interface ConsultationBooking {
  id: string;
  clinicianId: string;
  clinicianName: string;
  specialty: string;
  date: string;
  time: string;
  status: 'confirmed' | 'completed' | 'cancelled';
  sharedConsentId: string;
  notes?: string;
  bookedAt: string;
}

export interface StockAdjustment {
  id: string;
  medicationId: string;
  medicationName: string;
  delta: number;
  previousStock: number;
  newStock: number;
  reason: 'dose_logged' | 'manual_refill' | 'correction' | 'manual_edit';
  timestamp: string;
}

export interface ExplainableInsight {
  id: string;
  title: string;
  observation: string;
  explanation: string;
  category: 'routine' | 'stock' | 'adherence';
  severity: 'info' | 'warning' | 'success';
  evidenceData: Record<string, any>;
  generatedAt: string;
}
