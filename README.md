# HealthVault — Personal Health Intelligence & Medication Management Platform

> **wHACKiest 2026 Hackathon Prototype**  
> **Track:** T-3: Know Thyself  
> **Tagline:** *Know your patterns. Understand your routines. Take control of your health.*  
> **Category:** Privacy-First Personal Health Intelligence & Medication Management Platform  

---

## 1. Executive Summary

Unlike conventional medication reminder apps that treat medication intake as a simplistic push-notification checklist, **HealthVault** is an on-device personal health intelligence platform. It fuses **NFC medication interaction logging**, **deterministic predictive stock depletion**, **explainable health routine analytics**, **consent-controlled caregiver escalation**, and **teleconsultation coordination** into a single cohesive experience—all governed by a **strict local-first data ownership model**.

---

## 2. System Architecture & Tech Stack

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENT / BROWSER RUNTIME                        │
│                                                                        │
│   React 18  +  TypeScript  +  Tailwind CSS  +  Recharts  +  Lucide     │
├────────────────────────────────────────────────────────────────────────┤
│                       LOCAL STORAGE & CRYPTO LAYER                     │
│                                                                        │
│   • IndexedDB via Dexie.js (100% on-device local health records)       │
│   • Web Crypto API (AES-GCM-256 with PBKDF2 100k SHA-256 iterations)   │
│   • Web NFC Standard (Hardware NDEFReader + Virtual Hardware Sandbox)   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Optional Sync / Demo Webhooks
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        BACKEND SERVICES (FastAPI)                      │
│                                                                        │
│   • Python 3.14 + FastAPI + SQLite (healthvault.db)                    │
│   • Clinician Directory API                                            │
│   • Simulated Twilio Escalation Webhook                                │
│   • Zero-Knowledge Encrypted Vault Backup Endpoint                     │
└────────────────────────────────────────────────────────────────────────┘
```

### Frontend
- **Framework:** React 18 with TypeScript and Vite
- **Styling:** Tailwind CSS with a healthcare palette (warm off-white background, deep charcoal typography, dark emerald green primary accent, muted mint, amber warnings, and muted red critical alerts)
- **Charts:** Recharts for 7-day adherence trends and routine period radar/bar comparisons
- **Icons:** Lucide React
- **Local Database:** Dexie.js (IndexedDB wrapper) with 8 structured collections

### Backend
- **Framework:** Python FastAPI with Uvicorn
- **Storage:** SQLite (`healthvault.db`)
- **Endpoints:** `/api/health`, `/api/clinicians`, `/api/consultations/book`, `/api/caregiver/escalate-simulate`, `/api/vault/backup`

### Security & Hardware Standards
- **Web NFC API:** Evaluates `window.NDEFReader` on supported Android Chrome devices; integrates an on-screen **Virtual Hardware Simulator** for desktop judging and testing.
- **Web Crypto API:** `window.crypto.subtle` for client-side AES-GCM 256-bit vault backup encryption and decryption with user-chosen passphrases.

---

## 3. Core Modules & Implementation Details

### Module 1 — NFC Medication Logging & Privacy Binding
- **Strict Privacy Rule:** Only random, non-sensitive UUIDs (`urn:healthvault:tag:<uuid>`) are written to NFC tags. Medication names, dosages, conditions, or patient identifiers **never** touch the tag.
- **Dose Confirmation Screen:** Tapping resolves the UUID locally in Dexie.js and presents medication instructions and stock levels for explicit confirmation.
- **Clinical Verification Safeguard:** In strict compliance with healthcare ethics, confirming a dose records user bottle interaction and decrements inventory; it never falsely claims "Medicine ingested" as a verified physiological fact.
- **Accidental Log Correction:** Allows users to undo and revert accidental dose logs with automatic inventory restoration.
- **Manual Fallback:** Every scheduled slot has a manual "Confirm Dose" button for non-NFC workflows.

### Module 2 — Predictive Medication Stock Management
- **Deterministic Formula:**  
  $$\text{Days Remaining} = \left\lfloor \frac{\text{Current Stock}}{\text{Expected Daily Consumption}} \right\rfloor$$
- **Automatic Thresholds:**
  - **Healthy Stock:** $> 7$ days supply
  - **Refill Soon:** $4 - 7$ days remaining
  - **Low Stock (Alert Triggered):** $\le 3$ days remaining (triggers top banner and bell badge)
  - **Stock Depleted:** $0$ units
- **PRN / As-Needed Uncertainty Notice:** Medicines marked as PRN display a clear clinical banner: *"As-needed medication: consumption rate is variable and cannot be deterministically projected."*
- **Dynamic Recalculation:** Stock and projected depletion dates recalculate instantly whenever doses are logged, undone, or refilled (+10 / custom modal).

### Module 3 — Consent-Based Caregiver Escalation
- **Explicit Consent Mandate:** Caregiver escalation is **disabled by default**. It cannot activate without explicit user checkbox consent.
- **Escalation Protocol:**
  1. Scheduled dose slot arrives.
  2. 30-minute grace period initiates.
  3. If user confirms dose: escalation is **cancelled**.
  4. If user does not confirm: system checks explicit consent $\rightarrow$ checks quiet hours $\rightarrow$ creates escalation event.
- **Controllable Hackathon Simulator:**
  - Accelerated grace period timer (10s, 15s, or 30s) with live countdown.
  - "Confirm Dose to Cancel Escalation" button.
  - "Instant Escalation Check" button.
  - Quiet hours evaluation (e.g. 22:00 to 07:00).
  - Clear labeling: `[SIMULATED] Twilio SMS dispatch`.

### Module 4 — Personal Health Routine Intelligence
- **Prominent Clinical Disclaimer:** *"Personal routine insights — not a medical diagnosis."* (Zero autonomous prescriptions or medical advice).
- **Core Metrics Computed from Real Records:**
  - Weekly Confirmation Consistency %
  - Morning Routine Consistency (05:00 - 11:59)
  - Afternoon Routine Consistency (12:00 - 16:59)
  - Evening Routine Consistency (17:00 - 23:59)
  - Delayed Confirmations ($>45$ minutes from slot)
- **Deterministic Explainable Observations:**
  - *Example:* "Your morning confirmations (88%) were more consistent than your evening confirmations (50%) over the past 7 days."
  - *Evidence:* "Derived from 7 confirmed morning slots vs 4 confirmed evening slots in Dexie local logs."
  - *Example:* "Frequent evening delays: 3 evening doses were logged with a delay exceeding 45 minutes."

### Module 5 — Teleconsultation & Consent-Restricted Sharing
- **Clinician Directory:** Sample demonstration clinician profiles (Cardiology, Endocrinology, Internal Medicine, Pharmacotherapy).
- **Booking Flow:** Date/time slot selection, symptoms/notes entry.
- **Explicit Record Sharing Consent:** Itemized checkboxes allowing the user to selectively share:
  1. Medication regimen
  2. 7-day adherence logs
  3. Routine intelligence insights
- **Interactive Consultation Room:** Video feed preview, self-view PiP, clinician notes area, and a **Shared Records Inspector** demonstrating that the clinician sees *only* user-approved data.

### Module 6 — Personal Data Ownership Centre
- **My Health Data:** Full inspectable view of raw Dexie IndexedDB tables (medications, dose events, profile).
- **Consent Management:** Audit log of all active sharing consents with instant "Revoke Permission" controls.
- **Data Export:**
  - Full machine-readable **JSON export**.
  - Formatted tabular **CSV export** for spreadsheets.
  - Formatted printable/downloadable **HTML Health Summary**.
- **Cryptographic Security (Web Crypto API):**
  - **Export Encrypted Vault (`.vault`):** Derives PBKDF2 key from user passphrase and encrypts entire database via AES-GCM-256.
  - **Restore Encrypted Vault:** Uploads `.vault`, decrypts with password, and repopulates Dexie.js.

---

## 4. Demo Profile: Ananya Sharma

To facilitate effortless live judging and demonstration, HealthVault comes equipped with a preconfigured sample profile accessible via the **"Demo Data"** button in the header or onboarding wizard:

- **User:** Ananya Sharma (Age 32, Emergency Contact: Rohan Sharma)
- **Designated Caregiver:** Rohan Sharma (+1 555-234-5678, Escalation Consent Enabled, Quiet Hours 22:00 – 07:00)
- **Medication 1:** Vitamin D3 (9:00 AM, 20 tablets, 1/day, Healthy stock)
- **Medication 2:** Medicine B / Metformin (2:00 PM, 12 tablets, 2/day, **Low Stock / Refill Soon warning at 6 days**)
- **Medication 3:** Medicine C / Magnesium (8:00 PM, 30 tablets, 1/day, Evening delays demonstration)
- **Medication 4:** Paracetamol (PRN, 14 tablets, Irregular consumption notice)
- **History:** 7 days of realistic historical dose confirmations driving the adherence charts and explainable insights.

---

## 5. Honest Status Disclosure

| Capability | Status | Implementation Details |
|---|---|---|
| **IndexedDB Local Storage** | **LIVE / WORKING** | Built with Dexie.js; persists all user records, schedules, and logs across refreshes. |
| **NFC Dose Confirmation** | **LIVE / WORKING** | Web NFC API for compatible Android devices + Built-in Virtual Hardware Simulator for desktop judging. |
| **Predictive Stock Engine** | **LIVE / WORKING** | Mathematical depletion formula, 3-day refill warnings, PRN uncertainty notices, and dynamic updates. |
| **Health Routine Insights** | **LIVE / WORKING** | Deterministic calculations and explainable observations with recorded evidence. Non-medical disclaimer. |
| **Caregiver Escalation Logic** | **LIVE / WORKING** | Grace period countdown, quiet hours check, consent validation, and audit log. |
| **Twilio SMS Gateway** | **SIMULATED** | Simulated webhook and UI status feed (`[SIMULATION]`). No live SMS charges occur during the demo. |
| **Teleconsultation Video Stream** | **SIMULATED** | Simulated doctor consultation room with self-view and consent-gated record viewer. |
| **Web Crypto AES-GCM Export** | **LIVE / WORKING** | Real Web Crypto API AES-GCM-256 PBKDF2 encryption/decryption of `.vault` backups. |
| **Data Export (JSON, CSV, HTML)** | **LIVE / WORKING** | Client-side file generation and instant download. |
| **Production Patient Readiness** | **HACKATHON LIMITATION** | Prototype demonstration for wHACKiest 2026; not HIPAA/GDPR certified for real clinical use. |

---

## 6. How to Run Locally

### Prerequisites
- Node.js (v18+ or v20+)
- Python 3.10+ (Python 3.14 tested)

### One-Click Start
From the project root:
```bash
./start.sh
```
This automatically boots the FastAPI backend on `http://127.0.0.1:8000` and the Vite frontend on `http://localhost:5173`.

### Manual Start (Alternative)

#### 1. Backend (FastAPI)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8000
```

#### 2. Frontend (Vite + React)
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.
Click **"Demo Data"** or complete the 5-step onboarding wizard to begin exploring HealthVault!
