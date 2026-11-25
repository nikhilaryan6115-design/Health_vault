import { db } from './index';
import { Medication, UserProfile, CaregiverConfig, DoseEvent, ConsultationBooking, RecordSharingConsent } from '../types';

export const SAMPLE_USER: UserProfile = {
  id: 'user-ananya-01',
  fullName: 'Ananya Sharma',
  age: 32,
  emergencyContact: 'Rohan Sharma (+1 555-234-5678)',
  profilePhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  onboarded: true,
};

export const SAMPLE_CAREGIVER: CaregiverConfig = {
  id: 'caregiver-rohan-01',
  name: 'Rohan Sharma',
  phone: '+1 (555) 234-5678',
  escalationEnabled: true,
  quietStart: '22:00',
  quietEnd: '07:00',
  consentGrantedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
};

export const SAMPLE_MEDICATIONS: Medication[] = [
  {
    id: 'med-vit-d',
    name: 'Vitamin D3',
    dosageStrength: '2000 IU',
    dosageInstructions: 'Take 1 capsule in the morning with water after breakfast',
    scheduleType: 'daily',
    timeSlots: ['09:00'],
    currentStock: 20,
    expectedDailyConsumption: 1,
    notes: 'Prescribed for seasonal vitamin deficiency. Keep in cool dry place.',
    nfcTagId: '7f9c2d18-3e4a-4b91-9c60-a1b2c3d4e5f1',
    isPRN: false,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'med-b',
    name: 'Medicine B (Metformin)',
    dosageStrength: '500 mg',
    dosageInstructions: 'Take 1 tablet at 2:00 PM with lunch meal',
    scheduleType: 'daily',
    timeSlots: ['14:00'],
    currentStock: 12,
    expectedDailyConsumption: 2,
    notes: 'Blood sugar regulation. Swallow whole, do not crush.',
    nfcTagId: '8a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d',
    isPRN: false,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'med-c',
    name: 'Medicine C (Magnesium)',
    dosageStrength: '200 mg',
    dosageInstructions: 'Take 1 tablet at 8:00 PM with dinner or before bed',
    scheduleType: 'daily',
    timeSlots: ['20:00'],
    currentStock: 30,
    expectedDailyConsumption: 1,
    notes: 'Supports sleep routine and muscle relaxation.',
    nfcTagId: '9b2c3d4e-5f6a-7b8c-9d0e-1f2a3b4c5d6e',
    isPRN: false,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'med-prn-headache',
    name: 'Paracetamol (PRN)',
    dosageStrength: '500 mg',
    dosageInstructions: 'Take 1-2 tablets as needed for acute tension headaches',
    scheduleType: 'as_needed',
    timeSlots: [],
    currentStock: 14,
    expectedDailyConsumption: 0,
    notes: 'As-needed medication. Max 4g (8 tablets) in 24 hours.',
    nfcTagId: 'a3b4c5d6-e7f8-9a0b-1c2d-3e4f5a6b7c8d',
    isPRN: true,
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

// Generate 7 days of realistic dose logs
export function generatePastDoseEvents(): DoseEvent[] {
  const events: DoseEvent[] = [];
  const now = new Date();

  for (let i = 6; i >= 1; i--) {
    const dayDate = new Date(now.getTime() - i * 86400000);
    const dateStr = dayDate.toISOString().split('T')[0];

    // Vitamin D (09:00 morning) - High consistency (logged accurately on time)
    const vitDScheduled = `${dateStr}T09:00:00`;
    const vitDLogged = `${dateStr}T09:0${Math.floor(Math.random() * 8) + 2}:00`;
    events.push({
      id: `dose-vitd-day-${i}`,
      medicationId: 'med-vit-d',
      medicationName: 'Vitamin D3',
      scheduledTime: vitDScheduled,
      loggedAt: vitDLogged,
      doseStatus: 'confirmed',
      method: i % 2 === 0 ? 'nfc' : 'manual',
      notes: 'Morning dose confirmed with breakfast.',
    });

    // Medicine B (14:00 afternoon) - Good consistency, 1 unconfirmed day
    const medBScheduled = `${dateStr}T14:00:00`;
    if (i === 3) {
      // Day 3 was unconfirmed
      events.push({
        id: `dose-medb-day-${i}`,
        medicationId: 'med-b',
        medicationName: 'Medicine B (Metformin)',
        scheduledTime: medBScheduled,
        loggedAt: medBScheduled,
        doseStatus: 'unconfirmed',
        method: 'manual',
        notes: 'Unconfirmed dose at scheduled slot.',
      });
    } else {
      const medBLogged = `${dateStr}T14:${Math.floor(Math.random() * 20) + 5}:00`;
      events.push({
        id: `dose-medb-day-${i}`,
        medicationId: 'med-b',
        medicationName: 'Medicine B (Metformin)',
        scheduledTime: medBScheduled,
        loggedAt: medBLogged,
        doseStatus: 'confirmed',
        method: 'manual',
        notes: 'Afternoon dose confirmed.',
      });
    }

    // Medicine C (20:00 evening) - Frequently delayed confirmations!
    const medCScheduled = `${dateStr}T20:00:00`;
    if (i === 2) {
      events.push({
        id: `dose-medc-day-${i}`,
        medicationId: 'med-c',
        medicationName: 'Medicine C (Magnesium)',
        scheduledTime: medCScheduled,
        loggedAt: medCScheduled,
        doseStatus: 'unconfirmed',
        method: 'manual',
        notes: 'Unconfirmed evening dose.',
      });
    } else {
      // Delayed by 1.5 to 2.5 hours (21:30 - 22:30)
      const delayMinutes = 90 + Math.floor(Math.random() * 50);
      const delayHours = Math.floor(delayMinutes / 60);
      const delayRemMin = delayMinutes % 60;
      const delayedHourStr = (20 + delayHours).toString().padStart(2, '0');
      const delayedMinStr = delayRemMin.toString().padStart(2, '0');
      events.push({
        id: `dose-medc-day-${i}`,
        medicationId: 'med-c',
        medicationName: 'Medicine C (Magnesium)',
        scheduledTime: medCScheduled,
        loggedAt: `${dateStr}T${delayedHourStr}:${delayedMinStr}:00`,
        doseStatus: 'confirmed',
        method: 'manual',
        notes: 'Evening dose confirmed after routine reminder delay.',
      });
    }
  }

  return events;
}

export const SAMPLE_CONSULTATIONS: ConsultationBooking[] = [
  {
    id: 'consult-01',
    clinicianId: 'doc-01',
    clinicianName: 'Dr. Sarah Mitchell, MD',
    specialty: 'Internal Medicine & Preventative Health',
    date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    time: '10:00 AM',
    status: 'confirmed',
    sharedConsentId: 'consent-share-01',
    notes: 'Follow-up regarding vitamin D levels and evening sleep routine.',
    bookedAt: new Date(Date.now() - 86400000).toISOString(),
  }
];

export const SAMPLE_CONSENT: RecordSharingConsent = {
  id: 'consent-share-01',
  consultationId: 'consult-01',
  recipientType: 'clinician',
  recipientName: 'Dr. Sarah Mitchell, MD',
  shareMedications: true,
  shareRecentLogs: true,
  shareHealthInsights: true,
  grantedAt: new Date(Date.now() - 86400000).toISOString(),
};

export async function seedDemoData(force = false) {
  const existingUser = await db.userProfile.get('user-ananya-01');
  if (existingUser && !force) {
    return;
  }

  // Clear existing tables
  await db.transaction('rw', [
    db.userProfile,
    db.medications,
    db.doseEvents,
    db.caregiver,
    db.escalationEvents,
    db.consultations,
    db.recordSharingConsents,
    db.stockAdjustments
  ], async () => {
    await db.userProfile.clear();
    await db.medications.clear();
    await db.doseEvents.clear();
    await db.caregiver.clear();
    await db.escalationEvents.clear();
    await db.consultations.clear();
    await db.recordSharingConsents.clear();
    await db.stockAdjustments.clear();

    await db.userProfile.put(SAMPLE_USER);
    await db.caregiver.put(SAMPLE_CAREGIVER);
    await db.medications.bulkPut(SAMPLE_MEDICATIONS);
    await db.doseEvents.bulkPut(generatePastDoseEvents());
    await db.consultations.bulkPut(SAMPLE_CONSULTATIONS);
    await db.recordSharingConsents.put(SAMPLE_CONSENT);
  });
}

export async function resetDatabase() {
  await db.transaction('rw', [
    db.userProfile,
    db.medications,
    db.doseEvents,
    db.caregiver,
    db.escalationEvents,
    db.consultations,
    db.recordSharingConsents,
    db.stockAdjustments
  ], async () => {
    await db.userProfile.clear();
    await db.medications.clear();
    await db.doseEvents.clear();
    await db.caregiver.clear();
    await db.escalationEvents.clear();
    await db.consultations.clear();
    await db.recordSharingConsents.clear();
    await db.stockAdjustments.clear();
  });
}
