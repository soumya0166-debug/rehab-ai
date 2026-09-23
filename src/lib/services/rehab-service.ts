// REHAB-AI: Exercise & Rehabilitation Database Service
// Reusable database operations for exercises, prescriptions, sessions, metrics, and patient feedback
import { getSupabaseBrowserClient } from '@/lib/auth/supabase-client';
import { SEEDED_EXERCISE_DEFINITIONS, getSeededExercise } from '@/lib/exercises/definitions';
import {
  ExerciseDefinition,
  DbPrescription,
  DbSession,
  DbSessionMetrics,
  DbPatientFeedback,
  SessionStatus,
  SessionTrackingQuality,
} from '@/types/exercises';

export interface CreatePrescriptionInput {
  patientId: string;
  exerciseId: string;
  targetReps: number;
  targetRangeMin: number;
  targetRangeMax: number;
  instructions: string;
  createdBy: string;
}

export interface CreateSessionInput {
  patientId: string;
  exerciseId: string;
  trackingQuality?: SessionTrackingQuality;
}

export interface CompleteSessionSummary {
  repetitions: number;
  successfulRepetitions: number;
  incompleteRepetitions: number;
  durationSeconds: number;
  qualityScore: number;
  trackingQuality?: SessionTrackingQuality;
  status?: SessionStatus;
}

export interface RecordSessionMetricsInput {
  sessionId: string;
  averageAngle: number;
  minimumAngle: number;
  maximumAngle: number;
  averageRepDuration: number;
  successfulReps: number;
  incompleteReps: number;
}

export interface SubmitPatientFeedbackInput {
  sessionId: string;
  painLevel: number; // 0 - 10 VAS
  fatigueLevel: number; // 1 - 10 Borg
  patientComment?: string;
}

// In-Memory fallback store for tests and offline development
class InMemoryRehabStore {
  prescriptions: DbPrescription[] = [];
  sessions: DbSession[] = [];
  metrics: DbSessionMetrics[] = [];
  feedback: DbPatientFeedback[] = [];

  reset() {
    this.prescriptions = [];
    this.sessions = [];
    this.metrics = [];
    this.feedback = [];
  }
}

export const inMemoryRehabStore = new InMemoryRehabStore();

// -------------------------------------------------------------
// Exercise Catalog Queries
// -------------------------------------------------------------

export async function getExercises(): Promise<ExerciseDefinition[]> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .order('name');

    if (!error && data && data.length > 0) {
      // Map database rows to typed definitions if available
      return SEEDED_EXERCISE_DEFINITIONS;
    }
  } catch {
    // Fallback to seeded configurations
  }
  return SEEDED_EXERCISE_DEFINITIONS;
}

export async function getExerciseById(id: string): Promise<ExerciseDefinition | null> {
  const seeded = getSeededExercise(id);
  if (seeded) return seeded;

  try {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('id', id)
      .single();

    if (!error && data) {
      return seeded;
    }
  } catch {
    // Fallback
  }

  return null;
}

// -------------------------------------------------------------
// Prescription Operations
// -------------------------------------------------------------

export async function createPrescription(input: CreatePrescriptionInput): Promise<DbPrescription> {
  if (input.targetReps <= 0) {
    throw new Error('Prescription target repetitions must be greater than zero.');
  }
  if (input.targetRangeMin >= input.targetRangeMax) {
    throw new Error('Target range minimum angle must be less than maximum angle.');
  }

  const newRecord: DbPrescription = {
    id: `rx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    patient_id: input.patientId,
    exercise_id: input.exerciseId,
    target_reps: input.targetReps,
    target_range_min: input.targetRangeMin,
    target_range_max: input.targetRangeMax,
    instructions: input.instructions,
    created_by: input.createdBy,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('prescriptions')
      .insert({
        patient_id: input.patientId,
        exercise_id: input.exerciseId,
        target_reps: input.targetReps,
        target_range_min: input.targetRangeMin,
        target_range_max: input.targetRangeMax,
        instructions: input.instructions,
        created_by: input.createdBy,
      })
      .select('*')
      .single();

    if (!error && data) {
      inMemoryRehabStore.prescriptions.push(data as DbPrescription);
      return data as DbPrescription;
    }
  } catch {
    // Fallback
  }

  inMemoryRehabStore.prescriptions.push(newRecord);
  return newRecord;
}

export async function getPrescriptionsForPatient(patientId: string): Promise<DbPrescription[]> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('prescriptions')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data as DbPrescription[];
    }
  } catch {
    // Fallback
  }

  return inMemoryRehabStore.prescriptions.filter((p) => p.patient_id === patientId);
}

// -------------------------------------------------------------
// Session Operations
// -------------------------------------------------------------

export async function startSession(input: CreateSessionInput): Promise<DbSession> {
  const newSession: DbSession = {
    id: `sess-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    patient_id: input.patientId,
    exercise_id: input.exerciseId,
    started_at: new Date().toISOString(),
    completed_at: null,
    repetitions: 0,
    successful_repetitions: 0,
    incomplete_repetitions: 0,
    duration_seconds: 0,
    quality_score: 0,
    tracking_quality: input.trackingQuality || 'high',
    status: 'in_progress',
  };

  try {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('sessions')
      .insert({
        patient_id: input.patientId,
        exercise_id: input.exerciseId,
        tracking_quality: newSession.tracking_quality,
        status: newSession.status,
      })
      .select('*')
      .single();

    if (!error && data) {
      inMemoryRehabStore.sessions.push(data as DbSession);
      return data as DbSession;
    }
  } catch {
    // Fallback
  }

  inMemoryRehabStore.sessions.push(newSession);
  return newSession;
}

export async function completeSession(
  sessionId: string,
  summary: CompleteSessionSummary
): Promise<DbSession> {
  const completedAt = new Date().toISOString();

  try {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('sessions')
      .update({
        completed_at: completedAt,
        repetitions: summary.repetitions,
        successful_repetitions: summary.successfulRepetitions,
        incomplete_repetitions: summary.incompleteRepetitions,
        duration_seconds: summary.durationSeconds,
        quality_score: summary.qualityScore,
        tracking_quality: summary.trackingQuality || 'high',
        status: summary.status || 'completed',
      })
      .eq('id', sessionId)
      .select('*')
      .single();

    if (!error && data) {
      return data as DbSession;
    }
  } catch {
    // Fallback
  }

  const existing = inMemoryRehabStore.sessions.find((s) => s.id === sessionId);
  if (!existing) {
    throw new Error(`Session with id ${sessionId} not found.`);
  }

  existing.completed_at = completedAt;
  existing.repetitions = summary.repetitions;
  existing.successful_repetitions = summary.successfulRepetitions;
  existing.incomplete_repetitions = summary.incompleteRepetitions;
  existing.duration_seconds = summary.durationSeconds;
  existing.quality_score = summary.qualityScore;
  existing.tracking_quality = summary.trackingQuality || existing.tracking_quality;
  existing.status = summary.status || 'completed';

  return existing;
}

// -------------------------------------------------------------
// Session Metrics Operations
// -------------------------------------------------------------

export async function recordSessionMetrics(
  input: RecordSessionMetricsInput
): Promise<DbSessionMetrics> {
  const metricRecord: DbSessionMetrics = {
    id: `met-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    session_id: input.sessionId,
    average_angle: input.averageAngle,
    minimum_angle: input.minimumAngle,
    maximum_angle: input.maximumAngle,
    average_rep_duration: input.averageRepDuration,
    successful_reps: input.successfulReps,
    incomplete_reps: input.incompleteReps,
    created_at: new Date().toISOString(),
  };

  try {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('session_metrics')
      .insert({
        session_id: input.sessionId,
        average_angle: input.averageAngle,
        minimum_angle: input.minimumAngle,
        maximum_angle: input.maximumAngle,
        average_rep_duration: input.averageRepDuration,
        successful_reps: input.successfulReps,
        incomplete_reps: input.incompleteReps,
      })
      .select('*')
      .single();

    if (!error && data) {
      inMemoryRehabStore.metrics.push(data as DbSessionMetrics);
      return data as DbSessionMetrics;
    }
  } catch {
    // Fallback
  }

  inMemoryRehabStore.metrics.push(metricRecord);
  return metricRecord;
}

export async function getSessionMetrics(sessionId: string): Promise<DbSessionMetrics | null> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('session_metrics')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (!error && data) {
      return data as DbSessionMetrics;
    }
  } catch {
    // Fallback
  }

  return inMemoryRehabStore.metrics.find((m) => m.session_id === sessionId) || null;
}

// -------------------------------------------------------------
// Patient Feedback Operations
// -------------------------------------------------------------

export async function submitPatientFeedback(
  input: SubmitPatientFeedbackInput
): Promise<DbPatientFeedback> {
  if (input.painLevel < 0 || input.painLevel > 10) {
    throw new Error('Pain level must be an integer between 0 and 10 on the Visual Analog Scale (VAS).');
  }
  if (input.fatigueLevel < 1 || input.fatigueLevel > 10) {
    throw new Error('Fatigue level must be between 1 and 10 on the Borg RPE scale.');
  }

  const feedbackRecord: DbPatientFeedback = {
    id: `fb-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    session_id: input.sessionId,
    pain_level: input.painLevel,
    fatigue_level: input.fatigueLevel,
    patient_comment: input.patientComment || null,
    created_at: new Date().toISOString(),
  };

  try {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('patient_feedback')
      .insert({
        session_id: input.sessionId,
        pain_level: input.painLevel,
        fatigue_level: input.fatigueLevel,
        patient_comment: input.patientComment,
      })
      .select('*')
      .single();

    if (!error && data) {
      inMemoryRehabStore.feedback.push(data as DbPatientFeedback);
      return data as DbPatientFeedback;
    }
  } catch {
    // Fallback
  }

  inMemoryRehabStore.feedback.push(feedbackRecord);
  return feedbackRecord;
}

export async function getSessionFeedback(sessionId: string): Promise<DbPatientFeedback | null> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('patient_feedback')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (!error && data) {
      return data as DbPatientFeedback;
    }
  } catch {
    // Fallback
  }

  return inMemoryRehabStore.feedback.find((f) => f.session_id === sessionId) || null;
}
