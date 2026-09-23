// REHAB-AI: Strongly Typed Exercise and Rehabilitation Domain Models
// Strictly models biomechanical parameters, computer vision tracking rules, and database schema

export type ExerciseDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type CameraViewAngle = 'frontal' | 'sagittal_left' | 'sagittal_right' | 'oblique_45' | 'custom';
export type SessionTrackingQuality = 'high' | 'medium' | 'low' | 'uncalibrated';
export type SessionStatus = 'in_progress' | 'completed' | 'abandoned';

/**
 * Standard MediaPipe / REHAB-AI Landmark Identifiers
 */
export type LandmarkName =
  | 'NOSE'
  | 'LEFT_EYE'
  | 'RIGHT_EYE'
  | 'LEFT_SHOULDER'
  | 'RIGHT_SHOULDER'
  | 'LEFT_ELBOW'
  | 'RIGHT_ELBOW'
  | 'LEFT_WRIST'
  | 'RIGHT_WRIST'
  | 'LEFT_HIP'
  | 'RIGHT_HIP'
  | 'LEFT_KNEE'
  | 'RIGHT_KNEE'
  | 'LEFT_ANKLE'
  | 'RIGHT_ANKLE'
  | 'LEFT_HEEL'
  | 'RIGHT_HEEL'
  | 'LEFT_FOOT_INDEX'
  | 'RIGHT_FOOT_INDEX';

export interface StartingCondition {
  postureDescription: string;
  startAngleDegrees: number;
  maxAngleDeviation: number;
  settleTimeMs: number;
}

export interface RepetitionLogic {
  targetJointName: string;
  startAngle: number;
  peakFlexionMinAngle: number;
  peakFlexionMaxAngle: number;
  returnExtensionThreshold: number;
  minimumHoldSeconds: number;
  cadenceSecondsPerRep?: number;
}

export interface TargetMeasurement {
  metricName: string;
  unit: string;
  defaultMinAngle: number;
  defaultMaxAngle: number;
  description: string;
}

export interface FeedbackRule {
  id: string;
  conditionDescription: string;
  verbalCue: string;
  severity: 'minor' | 'moderate' | 'critical';
}

export interface CameraPositioningGuidance {
  distanceMeters: number;
  recommendedAngle: string;
  cameraHeight: string;
  instructions: string[];
}

/**
 * Strongly Typed Exercise Definition
 * Incorporates all required telemetry, biomechanical phases, repetition logic, and camera guidance.
 */
export interface ExerciseDefinition {
  id: string;
  name: string;
  description: string;
  bodyPart: 'upper_extremity' | 'lower_extremity' | 'spine_core' | 'full_body';
  difficulty: ExerciseDifficulty;
  cameraView: CameraViewAngle;
  requiredLandmarks: LandmarkName[];
  startingCondition: StartingCondition;
  movementPhases: string[];
  repetitionLogic: RepetitionLogic;
  targetMeasurement: TargetMeasurement;
  feedbackRules: FeedbackRule[];
  cameraPositioningGuidance: CameraPositioningGuidance;
  safetyNotes: string;
  isPrototype: boolean;
  prototypeDisclaimer: string;
}

// -------------------------------------------------------------
// Database Entity Interfaces (PostgreSQL / Supabase)
// -------------------------------------------------------------

export interface DbExercise {
  id: string;
  name: string;
  description: string;
  body_part: string;
  difficulty: ExerciseDifficulty;
  camera_view: CameraViewAngle;
  required_landmarks: LandmarkName[];
  configuration: Record<string, unknown>;
  safety_notes: string;
  created_at: string;
}

export interface DbPrescription {
  id: string;
  patient_id: string;
  exercise_id: string;
  target_reps: number;
  target_range_min: number;
  target_range_max: number;
  instructions: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface DbSession {
  id: string;
  patient_id: string;
  exercise_id: string;
  started_at: string;
  completed_at: string | null;
  repetitions: number;
  successful_repetitions: number;
  incomplete_repetitions: number;
  duration_seconds: number;
  quality_score: number;
  tracking_quality: SessionTrackingQuality;
  status: SessionStatus;
}

export interface DbSessionMetrics {
  id: string;
  session_id: string;
  average_angle: number;
  minimum_angle: number;
  maximum_angle: number;
  average_rep_duration: number;
  successful_reps: number;
  incomplete_reps: number;
  created_at: string;
}

export interface DbPatientFeedback {
  id: string;
  session_id: string;
  pain_level: number; // 0 - 10 VAS
  fatigue_level: number; // 1 - 10 Borg
  patient_comment?: string | null;
  created_at: string;
}

// -------------------------------------------------------------
// Live Session & Real-Time Analysis Types
// -------------------------------------------------------------

export type RepetitionPhase =
  | 'REST'
  | 'MOVING'
  | 'TARGET_REACHED'
  | 'RETURNING'
  | 'COMPLETED_REP'
  | 'INCOMPLETE_REP';

export interface RepetitionResult {
  repetitionNumber: number;
  status: 'completed' | 'incomplete';
  measuredRange: number;
  targetRange: {
    min: number;
    max: number;
  };
  duration: number; // in seconds
  feedback: string[];
  timestamp: number;
}

/**
 * 10 Canonical Clinical States for Patient Live Session
 */
export type LiveSessionState =
  | 'preparation'           // 1. Instructions and requirements review
  | 'camera_setup'          // 2. Camera feed check, positioning & lighting
  | 'ready'                 // 3. Landmarks recognized, stability verified
  | 'countdown'             // 4. 3-2-1 acoustic/visual start countdown
  | 'active_session'        // 5. In-flight biomechanical tracking & repetition counting
  | 'paused'                // 6. User or clinician paused session
  | 'tracking_unavailable'  // 7. Poor lighting, occlusion, patient stepped out of frame
  | 'pain_reported'         // 8. Patient flagged discomfort or pain threshold reached
  | 'session_completed'     // 9. Prescribed repetitions fulfilled or completed normally
  | 'technical_failure';    // 10. WebGL, camera hardware disconnect, or browser crash
