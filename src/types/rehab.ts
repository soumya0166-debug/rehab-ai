// REHAB-AI: Core Types and Data Models

export type UserRole = 'patient' | 'clinician' | 'physiotherapist' | 'caregiver' | 'admin' | 'PATIENT' | 'PHYSIOTHERAPIST' | 'CAREGIVER' | 'ADMIN';

export type LanguageCode = 'en' | 'es' | 'fr' | 'de' | 'hi';

export interface CaregiverInfo {
  id: string;
  name: string;
  relationship: string; // e.g. 'Spouse', 'Guardian', 'Son/Daughter'
  email: string;
  phone: string;
  notifyOnPainAlert: boolean;
  notifyOnMissedSession: boolean;
  weeklyDigest: boolean;
}

export interface Landmark3D {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

// MediaPipe 33 Keypoint standard indices
export const POSE_LANDMARKS = {
  NOSE: 0,
  LEFT_EYE_INNER: 1,
  LEFT_EYE: 2,
  LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4,
  RIGHT_EYE: 5,
  RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  MOUTH_LEFT: 9,
  MOUTH_RIGHT: 10,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_PINKY: 17,
  RIGHT_PINKY: 18,
  LEFT_INDEX: 19,
  RIGHT_INDEX: 20,
  LEFT_THUMB: 21,
  RIGHT_THUMB: 22,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32,
} as const;

export type JointAngleName = 
  | 'left_knee'
  | 'right_knee'
  | 'left_hip'
  | 'right_hip'
  | 'left_shoulder'
  | 'right_shoulder'
  | 'left_elbow'
  | 'right_elbow'
  | 'trunk_lean'
  | 'knee_valgus'
  | 'shoulder_shrug';

export type BodySide = 'left' | 'right' | 'both';

export interface CompensationCheck {
  id: string;
  name: string;
  description: string;
  feedbackWarning: string;
  voiceCue: string;
  threshold: number;
  severity: 'minor' | 'moderate' | 'severe';
  evaluate: (landmarks: Landmark3D[], side: BodySide) => { isTriggered: boolean; value: number };
}

export interface ExerciseDefinition {
  id: string;
  name: string;
  category: 'lower_limb' | 'upper_limb' | 'spine_core';
  targetJoint: JointAngleName;
  description: string;
  clinicalObjective: string;
  targetSide: BodySide;
  setupInstructions: string[];
  recommendedReps: number;
  recommendedSets: number;
  startAngle: number;
  targetAngleMin: number;
  targetAngleMax: number;
  holdDurationSeconds: number;
  voiceCues: {
    start: string;
    approaching: string;
    holding: string;
    returnPrompt: string;
    success: string;
  };
  compensations: CompensationCheck[];
}

export type RepState = 
  | 'CALIBRATING'
  | 'START_POSITION'
  | 'IN_MOTION'
  | 'HOLDING_PEAK'
  | 'RETURNING'
  | 'REP_COMPLETED'
  | 'FAULT_DETECTED';

export interface RepTelemetry {
  repNumber: number;
  peakAngle: number;
  targetAngleMin: number;
  holdDurationAchieved: number;
  targetHoldDuration: number;
  passed: boolean;
  score: number;
  compensationsDetected: string[];
  durationMs: number;
  timestamp: string;
}

export interface SessionRecord {
  id: string;
  patientId: string;
  patientName: string;
  exerciseId: string;
  exerciseName: string;
  date: string;
  targetReps: number;
  completedReps: number;
  cleanReps: number;
  averageRom: number;
  peakRom: number;
  targetRom: number;
  averageHoldTime: number;
  overallScore: number;
  compensationBreakdown: Record<string, number>;
  painScore: number;
  effortRpe: number;
  reps: RepTelemetry[];
  patientFeedback?: string;
  clinicianNotes?: string;
}

export interface Prescription {
  id: string;
  exerciseId: string;
  exerciseName: string;
  targetReps: number;
  targetSets: number;
  targetAngleMin: number;
  targetAngleMax: number;
  holdDurationSeconds: number;
  frequencyDaysPerWeek: number;
  notesForPatient: string;
  prescribedAt: string;
  clinicianName: string;
  active: boolean;
}

export interface PatientProfile {
  id: string;
  name: string;
  avatarUrl?: string;
  age: number;
  condition: string;
  affectedSide: BodySide;
  surgeryDate?: string;
  startDate: string;
  assignedClinician: string;
  caregiver?: CaregiverInfo;
  complianceStreak: number;
  weeklyAdherencePercent: number;
  riskFlag?: 'low' | 'medium' | 'high';
  riskReason?: string;
  prescriptions: Prescription[];
  history: SessionRecord[];
}
