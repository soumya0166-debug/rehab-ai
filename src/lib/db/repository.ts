// REHAB-AI: Typed Database Repository & Storage Interface
import { Patient, Clinician, Prescription, ExerciseSession } from '@/types';

export const INITIAL_PATIENT_RECORDS: Patient[] = [
  {
    id: 'pt-001',
    userId: 'usr-patient-1',
    fullName: 'Sarah Connor',
    age: 29,
    condition: 'ACL Reconstruction (Left Knee)',
    affectedSide: 'left',
    surgeryDate: '2026-08-15',
    clinicianId: 'cl-001',
    clinicianName: 'Dr. Michael Chen, DPT',
    adherenceRate: 92,
    streakDays: 6,
    currentPainLevel: 2,
    status: 'active',
  },
  {
    id: 'pt-002',
    userId: 'usr-patient-2',
    fullName: 'Marcus Vance',
    age: 44,
    condition: 'Rotator Cuff Supraspinatus Repair',
    affectedSide: 'right',
    surgeryDate: '2026-07-28',
    clinicianId: 'cl-001',
    clinicianName: 'Dr. Michael Chen, DPT',
    adherenceRate: 78,
    streakDays: 3,
    currentPainLevel: 4,
    status: 'review_needed',
  },
  {
    id: 'pt-003',
    userId: 'usr-patient-3',
    fullName: 'Elena Rostova',
    age: 62,
    condition: 'Total Knee Arthroplasty (TKA)',
    affectedSide: 'left',
    surgeryDate: '2026-09-02',
    clinicianId: 'cl-001',
    clinicianName: 'Dr. Michael Chen, DPT',
    adherenceRate: 95,
    streakDays: 8,
    currentPainLevel: 2,
    status: 'active',
  },
];

export const INITIAL_PRESCRIPTIONS: Prescription[] = [
  {
    id: 'rx-101',
    patientId: 'pt-001',
    clinicianId: 'cl-001',
    exerciseId: 'knee-extension',
    exerciseName: 'Seated Knee Extension (TKE)',
    targets: {
      startAngle: 95,
      targetAngleMin: 172,
      targetAngleMax: 180,
      holdDurationSeconds: 2,
      targetReps: 10,
      targetSets: 3,
      cadenceSecondsPerRep: 4,
    },
    frequencyDaysPerWeek: 5,
    clinicalNotes: 'Focus on full terminal lockout without trunk lean.',
    isActive: true,
    prescribedDate: '2026-09-10',
  },
  {
    id: 'rx-102',
    patientId: 'pt-001',
    clinicianId: 'cl-001',
    exerciseId: 'bodyweight-squat',
    exerciseName: 'Controlled Rehabilitation Squat',
    targets: {
      startAngle: 172,
      targetAngleMin: 90,
      targetAngleMax: 105,
      holdDurationSeconds: 1.5,
      targetReps: 8,
      targetSets: 3,
      cadenceSecondsPerRep: 4,
    },
    frequencyDaysPerWeek: 4,
    clinicalNotes: 'Keep knees aligned over toes; prevent knee valgus.',
    isActive: true,
    prescribedDate: '2026-09-14',
  },
];

const DB_PATIENTS_KEY = 'rehab_ai_db_patients_v1';
const DB_RX_KEY = 'rehab_ai_db_prescriptions_v1';

export function getPatientsList(): Patient[] {
  if (typeof window === 'undefined') return INITIAL_PATIENT_RECORDS;
  try {
    const raw = localStorage.getItem(DB_PATIENTS_KEY);
    if (!raw) {
      localStorage.setItem(DB_PATIENTS_KEY, JSON.stringify(INITIAL_PATIENT_RECORDS));
      return INITIAL_PATIENT_RECORDS;
    }
    return JSON.parse(raw);
  } catch (err) {
    return INITIAL_PATIENT_RECORDS;
  }
}

export function getPrescriptionsForPatient(patientId: string): Prescription[] {
  if (typeof window === 'undefined') {
    return INITIAL_PRESCRIPTIONS.filter((p) => p.patientId === patientId);
  }
  try {
    const raw = localStorage.getItem(DB_RX_KEY);
    const list: Prescription[] = raw ? JSON.parse(raw) : INITIAL_PRESCRIPTIONS;
    return list.filter((p) => p.patientId === patientId && p.isActive);
  } catch (err) {
    return INITIAL_PRESCRIPTIONS.filter((p) => p.patientId === patientId);
  }
}
