import Dexie, { Table } from 'dexie';
import {
  UserProfile,
  Medication,
  DoseEvent,
  CaregiverConfig,
  EscalationEvent,
  ConsultationBooking,
  RecordSharingConsent,
  StockAdjustment
} from '../types';

export class HealthVaultDB extends Dexie {
  userProfile!: Table<UserProfile, string>;
  medications!: Table<Medication, string>;
  doseEvents!: Table<DoseEvent, string>;
  caregiver!: Table<CaregiverConfig, string>;
  escalationEvents!: Table<EscalationEvent, string>;
  consultations!: Table<ConsultationBooking, string>;
  recordSharingConsents!: Table<RecordSharingConsent, string>;
  stockAdjustments!: Table<StockAdjustment, string>;

  constructor() {
    super('HealthVaultDB');
    this.version(1).stores({
      userProfile: 'id',
      medications: 'id, name, nfcTagId, scheduleType',
      doseEvents: 'id, medicationId, scheduledTime, loggedAt, doseStatus',
      caregiver: 'id',
      escalationEvents: 'id, medicationId, status, scheduledTime',
      consultations: 'id, clinicianId, date, status',
      recordSharingConsents: 'id, recipientName, grantedAt',
      stockAdjustments: 'id, medicationId, timestamp'
    });
  }
}

export const db = new HealthVaultDB();
