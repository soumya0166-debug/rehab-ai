// REHAB-AI: Strict TypeScript Domain Models & Interfaces

export type CanonicalRole = 'PATIENT' | 'PHYSIOTHERAPIST' | 'CAREGIVER' | 'ADMIN';
export type UserRole = CanonicalRole | 'patient' | 'physiotherapist' | 'clinician' | 'caregiver' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  language?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface DbProfile {
  id: string;
  full_name: string;
  email: string;
  role: CanonicalRole;
  language: string;
  created_at: string;
  updated_at: string;
}

export interface DbPatient {
  id: string;
  profile_id: string;
  date_of_birth: string | null;
  created_at: string;
}

export interface DbClinicianPatient {
  id: string;
  clinician_id: string;
  patient_id: string;
  created_at: string;
}

export interface DbCaregiverPatient {
  id: string;
  caregiver_id: string;
  patient_id: string;
  access_level: string;
  created_at: string;
}

export interface Patient {
  id: string;
  userId: string;
  fullName: string;
  age: number;
  condition: string;
  affectedSide: 'left' | 'right' | 'bilateral';
  surgeryDate?: string;
  clinicianId: string;
  clinicianName: string;
  adherenceRate: number; // percentage 0 - 100
  streakDays: number;
  currentPainLevel: number; // VAS 0 - 10
  status: 'active' | 'review_needed' | 'discharged';
}

export interface Clinician {
  id: string;
  userId: string;
  fullName: string;
  title: string;
  clinicName: string;
  licenseNumber: string;
  activePatientCount: number;
}

export interface ExerciseTarget {
  startAngle: number;
  targetAngleMin: number;
  targetAngleMax: number;
  holdDurationSeconds: number;
  targetReps: number;
  targetSets: number;
  cadenceSecondsPerRep: number;
}

export interface ExerciseDefinition {
  id: string;
  name: string;
  slug: string;
  category: 'lower_extremity' | 'upper_extremity' | 'spine_core';
  targetJoint: string;
  description: string;
  clinicalPurpose: string;
  defaultTargets: ExerciseTarget;
  instructions: string[];
  contraindications: string[];
}

export interface Prescription {
  id: string;
  patientId: string;
  clinicianId: string;
  exerciseId: string;
  exerciseName: string;
  targets: ExerciseTarget;
  frequencyDaysPerWeek: number;
  clinicalNotes: string;
  isActive: boolean;
  prescribedDate: string;
}

export interface RepetitionTelemetry {
  repNumber: number;
  peakAngle: number;
  targetMin: number;
  holdDurationSec: number;
  durationMs: number;
  passed: boolean;
  score: number; // 0 - 100
  compensations: string[];
  timestamp: string;
}

export interface ExerciseSession {
  id: string;
  patientId: string;
  prescriptionId: string;
  exerciseId: string;
  exerciseName: string;
  startTime: string;
  endTime: string;
  completedReps: number;
  targetReps: number;
  cleanReps: number;
  averageRom: number;
  peakRom: number;
  averageHoldTime: number;
  overallFormScore: number;
  painRating: number; // 0 - 10 VAS
  effortRpe: number; // 1 - 10 Borg
  patientNotes?: string;
  clinicianReviewNotes?: string;
  status: 'completed' | 'abandoned' | 'reviewed';
}
