import os
import sqlite3
import json
from datetime import datetime
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(
    title="HealthVault Prototype Backend API",
    description="Privacy-First Personal Health Intelligence Backend (wHACKiest 2026)",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = os.path.join(os.path.dirname(__file__), "healthvault.db")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Clinicians table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS clinicians (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        specialty TEXT NOT NULL,
        avatar_url TEXT NOT NULL,
        experience_years INTEGER NOT NULL,
        consultation_fee REAL NOT NULL,
        modes TEXT NOT NULL,
        available_slots TEXT NOT NULL,
        hospital_affiliation TEXT NOT NULL
    )
    """)

    # Teleconsultations table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS consultations (
        id TEXT PRIMARY KEY,
        clinician_id TEXT NOT NULL,
        clinician_name TEXT NOT NULL,
        specialty TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        status TEXT NOT NULL,
        shared_consent_id TEXT,
        notes TEXT,
        booked_at TEXT NOT NULL
    )
    """)

    # Caregiver Escalation Logs table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS escalation_logs (
        id TEXT PRIMARY KEY,
        medication_id TEXT NOT NULL,
        medication_name TEXT NOT NULL,
        scheduled_time TEXT NOT NULL,
        caregiver_name TEXT NOT NULL,
        caregiver_phone TEXT NOT NULL,
        status TEXT NOT NULL,
        delivery_mode TEXT NOT NULL,
        payload TEXT,
        timestamp TEXT NOT NULL
    )
    """)

    # Encrypted Vault Backups (Zero-knowledge: backend stores only ciphertext)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS encrypted_vaults (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        encrypted_payload TEXT NOT NULL,
        version TEXT NOT NULL,
        uploaded_at TEXT NOT NULL
    )
    """)

    # Seed demo clinicians if empty
    cursor.execute("SELECT COUNT(*) FROM clinicians")
    if cursor.fetchone()[0] == 0:
        demo_clinicians = [
            (
                "doc-01",
                "Dr. Sarah Mitchell, MD",
                "Internal Medicine & Preventative Health",
                "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80",
                14,
                75.0,
                json.dumps(["video", "audio"]),
                json.dumps(["09:00 AM", "11:30 AM", "02:00 PM", "04:30 PM"]),
                "St. Jude Medical Institute"
            ),
            (
                "doc-02",
                "Dr. Rajesh Mehta, MD, FACC",
                "Cardiology & Chronic Disease Management",
                "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
                18,
                110.0,
                json.dumps(["video"]),
                json.dumps(["10:00 AM", "01:00 PM", "03:30 PM"]),
                "Metro Heart & Vascular Center"
            ),
            (
                "doc-03",
                "Dr. Elena Rostova, PharmD",
                "Clinical Pharmacotherapy & Polypharmacy",
                "https://images.unsplash.com/photo-1594824813515-7798365444a1?w=150&auto=format&fit=crop&q=80",
                11,
                65.0,
                json.dumps(["video", "audio"]),
                json.dumps(["11:00 AM", "02:30 PM", "05:00 PM"]),
                "University Health Sciences"
            ),
            (
                "doc-04",
                "Dr. Marcus Vance, MD",
                "Endocrinology & Metabolic Health",
                "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80",
                16,
                95.0,
                json.dumps(["video"]),
                json.dumps(["09:30 AM", "12:00 PM", "03:00 PM"]),
                "Endocrine & Diabetes Care Center"
            )
        ]
        cursor.executemany("""
        INSERT INTO clinicians VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, demo_clinicians)

    conn.commit()
    conn.close()

init_db()

# Models
class ClinicianOut(BaseModel):
    id: str
    name: str
    specialty: str
    avatarUrl: str
    experienceYears: int
    consultationFee: float
    modes: List[str]
    availableSlots: List[str]
    hospitalAffiliation: str

class BookingIn(BaseModel):
    id: str
    clinicianId: str
    clinicianName: string = ""
    specialty: str = ""
    date: str
    time: str
    status: str
    sharedConsentId: Optional[str] = None
    notes: Optional[str] = None
    bookedAt: str

class EscalationSimulateIn(BaseModel):
    medicationId: str
    medicationName: str
    scheduledTime: str
    caregiverName: str
    caregiverPhone: str
    reason: str
    isQuietHours: bool
    consentGranted: bool

class EncryptedVaultIn(BaseModel):
    userId: str
    payload: dict

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "HealthVault Backend",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/api/clinicians", response_model=List[ClinicianOut])
def get_clinicians():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, specialty, avatar_url, experience_years, consultation_fee, modes, available_slots, hospital_affiliation FROM clinicians")
    rows = cursor.fetchall()
    conn.close()
    
    result = []
    for r in rows:
        result.append(ClinicianOut(
            id=r[0],
            name=r[1],
            specialty=r[2],
            avatarUrl=r[3],
            experienceYears=r[4],
            consultationFee=r[5],
            modes=json.loads(r[6]),
            availableSlots=json.loads(r[7]),
            hospitalAffiliation=r[8]
        ))
    return result

@app.post("/api/consultations/book")
def book_consultation(booking: BookingIn):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
    INSERT OR REPLACE INTO consultations VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        booking.id,
        booking.clinicianId,
        booking.clinicianName,
        booking.specialty,
        booking.date,
        booking.time,
        booking.status,
        booking.sharedConsentId,
        booking.notes,
        booking.bookedAt
    ))
    conn.commit()
    conn.close()
    return {"success": True, "bookingId": booking.id}

@app.post("/api/caregiver/escalate-simulate")
def simulate_escalation(payload: EscalationSimulateIn):
    """
    Simulates caregiver escalation. If Twilio credentials were live, it would send an SMS.
    Here it logs transparently and returns simulated delivery status.
    """
    event_id = f"esc-{int(datetime.utcnow().timestamp())}"
    now_str = datetime.utcnow().isoformat()

    if not payload.consentGranted:
        return {
            "success": False,
            "status": "blocked_no_consent",
            "message": "Caregiver escalation is disabled. Explicit user consent was not granted."
        }

    if payload.isQuietHours:
        status = "quiet_hours_blocked"
        delivery_mode = "BLOCKED_BY_QUIET_HOURS"
        msg = f"Escalation suppressed: Current time falls within configured quiet hours ({payload.caregiverName} was not notified)."
    else:
        status = "simulated_sms_sent"
        delivery_mode = "SIMULATED_TWILIO_DISPATCH"
        msg = f"[SIMULATION] Twilio dispatch mocked to {payload.caregiverPhone}: 'HealthVault Alert: {payload.medicationName} scheduled for {payload.scheduledTime} remains unconfirmed. Grace period expired.'"

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO escalation_logs VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        event_id,
        payload.medicationId,
        payload.medicationName,
        payload.scheduledTime,
        payload.caregiverName,
        payload.caregiverPhone,
        status,
        delivery_mode,
        json.dumps(payload.dict()),
        now_str
    ))
    conn.commit()
    conn.close()

    return {
        "success": True,
        "eventId": event_id,
        "status": status,
        "deliveryMode": delivery_mode,
        "message": msg,
        "simulated": True,
        "twilioConfigured": False
    }

@app.post("/api/vault/backup")
def backup_vault(data: EncryptedVaultIn):
    vault_id = f"vault-{int(datetime.utcnow().timestamp())}"
    now_str = datetime.utcnow().isoformat()

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO encrypted_vaults VALUES (?, ?, ?, ?, ?)
    """, (
        vault_id,
        data.userId,
        json.dumps(data.payload),
        data.payload.get("version", "1.0"),
        now_str
    ))
    conn.commit()
    conn.close()

    return {
        "success": True,
        "vaultId": vault_id,
        "message": "Zero-knowledge encrypted vault backup stored on server."
    }
