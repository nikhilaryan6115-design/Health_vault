import React, { useState, useEffect } from 'react';
import { db } from './db';
import { seedDemoData, resetDatabase, SAMPLE_USER, SAMPLE_CAREGIVER } from './db/demoData';
import {
  UserProfile,
  Medication,
  DoseEvent,
  CaregiverConfig,
  EscalationEvent,
  ConsultationBooking,
  RecordSharingConsent,
  StockAdjustment
} from './types';
import { Sidebar, NavItemKey } from './components/Sidebar';
import { Header } from './components/Header';
import { OnboardingModal } from './components/OnboardingModal';
import { NfcModal } from './components/NfcModal';

// Views
import { OverviewView } from './views/OverviewView';
import { MedicationsView } from './views/MedicationsView';
import { ScheduleView } from './views/ScheduleView';
import { StockMonitorView } from './views/StockMonitorView';
import { HealthInsightsView } from './views/HealthInsightsView';
import { CaregiverView } from './views/CaregiverView';
import { TeleconsultationView } from './views/TeleconsultationView';
import { DataOwnershipView } from './views/DataOwnershipView';
import { SettingsView } from './views/SettingsView';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavItemKey>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [nfcModalOpen, setNfcModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [addMedModalOpen, setAddMedModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Database states
  const [user, setUser] = useState<UserProfile | null>(null);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [doseEvents, setDoseEvents] = useState<DoseEvent[]>([]);
  const [caregiver, setCaregiver] = useState<CaregiverConfig | null>(null);
  const [escalationEvents, setEscalationEvents] = useState<EscalationEvent[]>([]);
  const [consultations, setConsultations] = useState<ConsultationBooking[]>([]);
  const [sharingConsents, setSharingConsents] = useState<RecordSharingConsent[]>([]);

  // Load state from Dexie.js
  const refreshLocalState = async () => {
    try {
      const users = await db.userProfile.toArray();
      const meds = await db.medications.toArray();
      const doses = await db.doseEvents.toArray();
      const caregivers = await db.caregiver.toArray();
      const escalations = await db.escalationEvents.toArray();
      const consults = await db.consultations.toArray();
      const consents = await db.recordSharingConsents.toArray();

      if (users.length > 0) {
        setUser(users[0]);
        setIsOnboardingOpen(false);
      } else {
        setUser(null);
        setIsOnboardingOpen(true);
      }

      setMedications(meds);
      setDoseEvents(doses);
      setCaregiver(caregivers[0] || null);
      setEscalationEvents(escalations.sort((a, b) => b.triggeredAt.localeCompare(a.triggeredAt)));
      setConsultations(consults);
      setSharingConsents(consents);
    } catch (err) {
      console.error('Failed to load state from Dexie:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshLocalState();
  }, []);

  // Demo seed handler
  const handleLoadDemoData = async () => {
    await seedDemoData(true);
    await refreshLocalState();
    setIsOnboardingOpen(false);
  };

  // Reset database handler
  const handleResetData = async () => {
    await resetDatabase();
    await refreshLocalState();
  };

  // Onboarding completion handler
  const handleCompleteOnboarding = async (newUser: UserProfile, newCaregiver: CaregiverConfig) => {
    await db.userProfile.put(newUser);
    await db.caregiver.put(newCaregiver);
    await refreshLocalState();
    setIsOnboardingOpen(false);
  };

  // Medication handlers
  const handleAddMedication = async (medData: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newMed: Medication = {
      ...medData,
      id: `med-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.medications.put(newMed);
    await refreshLocalState();
  };

  const handleUpdateMedication = async (med: Medication) => {
    await db.medications.put({
      ...med,
      updatedAt: new Date().toISOString()
    });
    await refreshLocalState();
  };

  const handleDeleteMedication = async (id: string) => {
    await db.medications.delete(id);
    await refreshLocalState();
  };

  // Dose Confirmation Handler (Decrements stock & logs event)
  const handleConfirmDose = async (medicationId: string, method: 'nfc' | 'manual', scheduledTime?: string): Promise<DoseEvent> => {
    const med = medications.find(m => m.id === medicationId);
    const nowIso = new Date().toISOString();
    const sched = scheduledTime || nowIso;

    const newEvent: DoseEvent = {
      id: `dose-${Date.now()}`,
      medicationId,
      medicationName: med?.name || 'Medication',
      scheduledTime: sched,
      loggedAt: nowIso,
      doseStatus: 'confirmed',
      method,
      notes: `${method === 'nfc' ? 'NFC Hardware verification' : 'Manual verification'} confirmed by user.`,
    };

    // Save event
    await db.doseEvents.put(newEvent);

    // Decrement stock
    if (med && med.currentStock > 0) {
      const updatedStock = med.currentStock - 1;
      await db.medications.update(med.id, {
        currentStock: updatedStock,
        updatedAt: nowIso
      });

      // Audit adjustment
      const adj: StockAdjustment = {
        id: `adj-${Date.now()}`,
        medicationId: med.id,
        medicationName: med.name,
        delta: -1,
        previousStock: med.currentStock,
        newStock: updatedStock,
        reason: 'dose_logged',
        timestamp: nowIso
      };
      await db.stockAdjustments.put(adj);
    }

    await refreshLocalState();
    return newEvent;
  };

  // Correct Accidental Log Handler
  const handleCorrectDose = async (doseEventId: string) => {
    const event = await db.doseEvents.get(doseEventId);
    if (!event) return;

    // Delete or cancel event
    await db.doseEvents.delete(doseEventId);

    // Restore stock
    const med = await db.medications.get(event.medicationId);
    if (med) {
      const restored = med.currentStock + 1;
      await db.medications.update(med.id, {
        currentStock: restored,
        updatedAt: new Date().toISOString()
      });

      const adj: StockAdjustment = {
        id: `adj-${Date.now()}`,
        medicationId: med.id,
        medicationName: med.name,
        delta: 1,
        previousStock: med.currentStock,
        newStock: restored,
        reason: 'correction',
        timestamp: new Date().toISOString()
      };
      await db.stockAdjustments.put(adj);
    }

    await refreshLocalState();
  };

  // Manual Stock Update Handler
  const handleUpdateStock = async (medicationId: string, newStock: number, reason: StockAdjustment['reason']) => {
    const med = medications.find(m => m.id === medicationId);
    if (!med) return;

    const delta = newStock - med.currentStock;
    await db.medications.update(medicationId, {
      currentStock: newStock,
      updatedAt: new Date().toISOString()
    });

    const adj: StockAdjustment = {
      id: `adj-${Date.now()}`,
      medicationId,
      medicationName: med.name,
      delta,
      previousStock: med.currentStock,
      newStock,
      reason,
      timestamp: new Date().toISOString()
    };
    await db.stockAdjustments.put(adj);
    await refreshLocalState();
  };

  // Caregiver update
  const handleUpdateCaregiver = async (cfg: CaregiverConfig) => {
    await db.caregiver.put(cfg);
    await refreshLocalState();
  };

  // Caregiver escalation event trigger
  const handleTriggerEscalationEvent = async (eventData: Omit<EscalationEvent, 'id' | 'triggeredAt'>) => {
    const newEvent: EscalationEvent = {
      ...eventData,
      id: `esc-${Date.now()}`,
      triggeredAt: new Date().toISOString(),
    };
    await db.escalationEvents.put(newEvent);

    // Optional backend sync
    try {
      await fetch('/api/caregiver/escalate-simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicationId: eventData.medicationId,
          medicationName: eventData.medicationName,
          scheduledTime: eventData.scheduledTime,
          caregiverName: caregiver?.name || 'Caregiver',
          caregiverPhone: caregiver?.phone || '',
          reason: eventData.reason,
          isQuietHours: eventData.status === 'quiet_hours_blocked',
          consentGranted: !!caregiver?.escalationEnabled,
        })
      });
    } catch (e) {
      // Offline safe fallback
    }

    await refreshLocalState();
  };

  // Cancel escalation event
  const handleCancelEscalationEvent = async (id: string) => {
    await db.escalationEvents.update(id, { status: 'cancelled' });
    await refreshLocalState();
  };

  // Teleconsultation booking
  const handleBookConsultation = async (
    bookingData: Omit<ConsultationBooking, 'id' | 'bookedAt'>,
    consentData: Omit<RecordSharingConsent, 'id' | 'grantedAt'>
  ) => {
    const bookingId = `consult-${Date.now()}`;
    const consentId = `consent-${Date.now()}`;
    const nowIso = new Date().toISOString();

    const booking: ConsultationBooking = {
      ...bookingData,
      id: bookingId,
      sharedConsentId: consentId,
      bookedAt: nowIso,
    };

    const consent: RecordSharingConsent = {
      ...consentData,
      id: consentId,
      consultationId: bookingId,
      grantedAt: nowIso,
    };

    await db.consultations.put(booking);
    await db.recordSharingConsents.put(consent);

    // Sync with FastAPI backend
    try {
      await fetch('/api/consultations/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(booking)
      });
    } catch (e) {
      // Offline safe fallback
    }

    await refreshLocalState();
  };

  // Revoke sharing consent
  const handleRevokeConsent = async (consentId: string) => {
    await db.recordSharingConsents.delete(consentId);
    await refreshLocalState();
  };

  // Restore Decrypted Vault
  const handleRestoreVaultData = async (vault: any) => {
    if (!vault) return;
    await db.transaction('rw', [
      db.userProfile,
      db.medications,
      db.doseEvents,
      db.caregiver,
      db.escalationEvents,
      db.consultations,
      db.recordSharingConsents,
    ], async () => {
      if (vault.user) await db.userProfile.put(vault.user);
      if (vault.caregiver) await db.caregiver.put(vault.caregiver);
      if (vault.medications?.length) await db.medications.bulkPut(vault.medications);
      if (vault.doseEvents?.length) await db.doseEvents.bulkPut(vault.doseEvents);
      if (vault.consultations?.length) await db.consultations.bulkPut(vault.consultations);
      if (vault.sharingConsents?.length) await db.recordSharingConsents.bulkPut(vault.sharingConsents);
    });
    await refreshLocalState();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-800 text-white flex items-center justify-center mx-auto animate-pulse">
            <span className="font-bold text-lg">HV</span>
          </div>
          <p className="text-xs font-semibold text-charcoal-700">Loading HealthVault Local Database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col antialiased">
      {/* Persistent Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top Header */}
        <Header
          user={user}
          medications={medications}
          doseEvents={doseEvents}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenNfcModal={() => setNfcModalOpen(true)}
          onLoadDemoData={handleLoadDemoData}
          onResetData={handleResetData}
          onNavigate={setActiveTab}
        />

        {/* View Router */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'overview' && (
            <OverviewView
              user={user}
              medications={medications}
              doseEvents={doseEvents}
              caregiver={caregiver}
              onNavigate={setActiveTab}
              onOpenNfcModal={() => setNfcModalOpen(true)}
              onConfirmManualDose={(medId, schedTime) => handleConfirmDose(medId, 'manual', schedTime).then(() => {})}
              onOpenAddMedication={() => {
                setActiveTab('medications');
                setAddMedModalOpen(true);
              }}
            />
          )}

          {activeTab === 'medications' && (
            <MedicationsView
              medications={medications}
              onAddMedication={handleAddMedication}
              onUpdateMedication={handleUpdateMedication}
              onDeleteMedication={handleDeleteMedication}
              onOpenNfcModal={() => setNfcModalOpen(true)}
              isAddModalOpen={addMedModalOpen}
              onCloseAddModal={() => setAddMedModalOpen(false)}
            />
          )}

          {activeTab === 'schedule' && (
            <ScheduleView
              medications={medications}
              doseEvents={doseEvents}
              onConfirmDose={(medId, schedTime) => handleConfirmDose(medId, 'manual', schedTime).then(() => {})}
              onCorrectDose={handleCorrectDose}
              onOpenNfcModal={() => setNfcModalOpen(true)}
            />
          )}

          {activeTab === 'stock' && (
            <StockMonitorView
              medications={medications}
              onUpdateStock={handleUpdateStock}
            />
          )}

          {activeTab === 'insights' && (
            <HealthInsightsView
              medications={medications}
              doseEvents={doseEvents}
              onSeedDemoData={handleLoadDemoData}
            />
          )}

          {activeTab === 'caregiver' && (
            <CaregiverView
              caregiver={caregiver}
              medications={medications}
              escalationEvents={escalationEvents}
              onUpdateCaregiver={handleUpdateCaregiver}
              onTriggerEscalationEvent={handleTriggerEscalationEvent}
              onCancelEscalationEvent={handleCancelEscalationEvent}
            />
          )}

          {activeTab === 'teleconsultation' && (
            <TeleconsultationView
              consultations={consultations}
              medications={medications}
              doseEvents={doseEvents}
              insights={[]}
              onBookConsultation={handleBookConsultation}
            />
          )}

          {activeTab === 'data_ownership' && (
            <DataOwnershipView
              user={user}
              medications={medications}
              doseEvents={doseEvents}
              caregiver={caregiver}
              consultations={consultations}
              sharingConsents={sharingConsents}
              onRevokeConsent={handleRevokeConsent}
              onRestoreVaultData={handleRestoreVaultData}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              user={user}
              onUpdateProfile={async (u) => {
                await db.userProfile.put(u);
                await refreshLocalState();
              }}
              onLoadDemoData={handleLoadDemoData}
              onResetData={handleResetData}
            />
          )}
        </main>
      </div>

      {/* NFC Modal */}
      <NfcModal
        isOpen={nfcModalOpen}
        onClose={() => setNfcModalOpen(false)}
        medications={medications}
        onConfirmDose={handleConfirmDose}
        onCorrectDose={handleCorrectDose}
      />

      {/* First-time Onboarding Wizard */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={handleCompleteOnboarding}
        onLoadDemo={handleLoadDemoData}
      />
    </div>
  );
};

export default App;
