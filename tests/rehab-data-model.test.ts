// REHAB-AI: Exercise & Rehabilitation Data Model Test Suite
// Verifies exercise definitions, prototype disclaimers, prescription logic, sessions, metrics, and patient feedback
import { SEEDED_EXERCISE_DEFINITIONS, getSeededExercise, CLINICAL_PROTOTYPE_DISCLAIMER } from '../src/lib/exercises/definitions';
import {
  createPrescription,
  getPrescriptionsForPatient,
  startSession,
  completeSession,
  recordSessionMetrics,
  getSessionMetrics,
  submitPatientFeedback,
  getSessionFeedback,
  inMemoryRehabStore,
} from '../src/lib/services/rehab-service';
import { ExerciseDefinition } from '../src/types/exercises';

// Self-contained test runner primitives
async function describe(suiteName: string, fn: () => Promise<void> | void) {
  console.log(`\n--- Test Suite: ${suiteName} ---`);
  await fn();
}

async function it(testName: string, fn: () => Promise<void> | void) {
  try {
    await fn();
    console.log(`  [PASS] ${testName}`);
  } catch (error) {
    console.error(`  [FAIL] ${testName}`, error);
    throw error;
  }
}

function expect<T>(actual: T) {
  return {
    toBe(expected: T) {
      if (actual !== expected) {
        throw new Error(`Expected ${String(expected)}, but got ${String(actual)}`);
      }
    },
    toBeDefined() {
      if (actual === undefined || actual === null) {
        throw new Error(`Expected value to be defined, but got ${String(actual)}`);
      }
    },
    toBeGreaterThan(expected: number) {
      if (typeof actual !== 'number' || actual <= expected) {
        throw new Error(`Expected ${String(actual)} to be greater than ${expected}`);
      }
    },
    toBeLessThanOrEqual(expected: number) {
      if (typeof actual !== 'number' || actual > expected) {
        throw new Error(`Expected ${String(actual)} to be less than or equal to ${expected}`);
      }
    },
    toBeTruthy() {
      if (!actual) {
        throw new Error(`Expected truthy, but got ${String(actual)}`);
      }
    },
  };
}

async function runAllTests() {
  inMemoryRehabStore.reset();

  // -------------------------------------------------------------
  // Test Suite 1: Exactly Three Initial Exercises Seeded
  // -------------------------------------------------------------
  await describe('Seed Integrity: Exactly Three Prototype Exercises', async () => {
    await it('seeds exactly three initial exercises', () => {
      expect(SEEDED_EXERCISE_DEFINITIONS.length).toBe(3);
      const ids = SEEDED_EXERCISE_DEFINITIONS.map((e) => e.id);
      expect(ids.includes('elbow-flexion')).toBe(true);
      expect(ids.includes('shoulder-raise')).toBe(true);
      expect(ids.includes('sit-to-stand')).toBe(true);
    });

    await it('each exercise has clear prototype disclaimer', () => {
      for (const ex of SEEDED_EXERCISE_DEFINITIONS) {
        expect(ex.isPrototype).toBe(true);
        expect(ex.prototypeDisclaimer.includes('PROTOTYPE CONFIGURATION')).toBe(true);
        expect(ex.prototypeDisclaimer.includes('physiotherapist')).toBe(true);
        expect(ex.safetyNotes.length).toBeGreaterThan(10);
      }
    });
  });

  // -------------------------------------------------------------
  // Test Suite 2: Strongly Typed ExerciseDefinition Structure
  // -------------------------------------------------------------
  await describe('ExerciseDefinition: Biomechanical & Computer Vision Fields', async () => {
    function validateCompleteExercise(ex: ExerciseDefinition) {
      // 1. Required landmarks
      expect(ex.requiredLandmarks.length).toBeGreaterThan(2);

      // 2. Starting condition
      expect(ex.startingCondition.startAngleDegrees).toBeGreaterThan(0);
      expect(ex.startingCondition.maxAngleDeviation).toBeGreaterThan(0);
      expect(ex.startingCondition.settleTimeMs).toBeGreaterThan(500);

      // 3. Movement phases
      expect(ex.movementPhases.length).toBeGreaterThan(3);

      // 4. Repetition logic
      expect(ex.repetitionLogic.targetJointName.length).toBeGreaterThan(2);
      expect(ex.repetitionLogic.peakFlexionMaxAngle).toBeGreaterThan(ex.repetitionLogic.peakFlexionMinAngle);
      expect(ex.repetitionLogic.minimumHoldSeconds).toBeGreaterThan(0);

      // 5. Target measurement
      expect(ex.targetMeasurement.metricName.length).toBeGreaterThan(2);
      expect(ex.targetMeasurement.unit).toBe('degrees');
      expect(ex.targetMeasurement.defaultMaxAngle).toBeGreaterThan(ex.targetMeasurement.defaultMinAngle);

      // 6. Feedback rules
      expect(ex.feedbackRules.length).toBeGreaterThan(1);
      for (const rule of ex.feedbackRules) {
        expect(rule.id.length).toBeGreaterThan(0);
        expect(rule.verbalCue.length).toBeGreaterThan(5);
      }

      // 7. Camera positioning guidance
      expect(ex.cameraPositioningGuidance.distanceMeters).toBeGreaterThan(1.0);
      expect(ex.cameraPositioningGuidance.distanceMeters).toBeLessThanOrEqual(4.0);
      expect(ex.cameraPositioningGuidance.recommendedAngle.length).toBeGreaterThan(5);
      expect(ex.cameraPositioningGuidance.instructions.length).toBeGreaterThan(1);
    }

    await it('Elbow Flexion defines all biomechanical and camera parameters', () => {
      const ex = getSeededExercise('elbow-flexion');
      expect(ex).toBeDefined();
      validateCompleteExercise(ex!);
      expect(ex!.bodyPart).toBe('upper_extremity');
      expect(ex!.cameraView).toBe('sagittal_left');
    });

    await it('Shoulder Raise defines all biomechanical and camera parameters', () => {
      const ex = getSeededExercise('shoulder-raise');
      expect(ex).toBeDefined();
      validateCompleteExercise(ex!);
      expect(ex!.bodyPart).toBe('upper_extremity');
      expect(ex!.cameraView).toBe('frontal');
    });

    await it('Sit-to-Stand defines all biomechanical and camera parameters', () => {
      const ex = getSeededExercise('sit-to-stand');
      expect(ex).toBeDefined();
      validateCompleteExercise(ex!);
      expect(ex!.bodyPart).toBe('lower_extremity');
      expect(ex!.cameraView).toBe('oblique_45');
    });
  });

  // -------------------------------------------------------------
  // Test Suite 3: Prescriptions Database Operations
  // -------------------------------------------------------------
  await describe('Prescriptions Operations', async () => {
    await it('creates a clinical prescription with targets and instructions', async () => {
      const rx = await createPrescription({
        patientId: 'pt-001',
        exerciseId: 'elbow-flexion',
        targetReps: 12,
        targetRangeMin: 40.0,
        targetRangeMax: 145.0,
        instructions: 'Perform with steady 3-second concentric and 3-second eccentric tempo.',
        createdBy: 'usr-clinician-1',
      });

      expect(rx.patient_id).toBe('pt-001');
      expect(rx.exercise_id).toBe('elbow-flexion');
      expect(rx.target_reps).toBe(12);
      expect(rx.created_by).toBe('usr-clinician-1');
    });

    await it('rejects invalid prescription parameters', async () => {
      let threwReps = false;
      try {
        await createPrescription({
          patientId: 'pt-001',
          exerciseId: 'elbow-flexion',
          targetReps: 0, // Invalid!
          targetRangeMin: 40,
          targetRangeMax: 140,
          instructions: 'Invalid reps',
          createdBy: 'usr-clinician-1',
        });
      } catch (err) {
        threwReps = true;
      }
      expect(threwReps).toBe(true);

      let threwRange = false;
      try {
        await createPrescription({
          patientId: 'pt-001',
          exerciseId: 'elbow-flexion',
          targetReps: 10,
          targetRangeMin: 150, // Invalid: min > max!
          targetRangeMax: 40,
          instructions: 'Invalid range',
          createdBy: 'usr-clinician-1',
        });
      } catch (err) {
        threwRange = true;
      }
      expect(threwRange).toBe(true);
    });

    await it('retrieves all prescriptions for a specific patient', async () => {
      await createPrescription({
        patientId: 'pt-001',
        exerciseId: 'shoulder-raise',
        targetReps: 10,
        targetRangeMin: 85.0,
        targetRangeMax: 110.0,
        instructions: 'Scapular plane elevation.',
        createdBy: 'usr-clinician-1',
      });

      const list = await getPrescriptionsForPatient('pt-001');
      expect(list.length).toBe(2);
    });
  });

  // -------------------------------------------------------------
  // Test Suite 4: Sessions & Telemetry Metrics Operations
  // -------------------------------------------------------------
  await describe('Sessions & Telemetry Metrics Operations', async () => {
    let activeSessionId = '';

    await it('starts an exercise session in progress', async () => {
      const sess = await startSession({
        patientId: 'pt-001',
        exerciseId: 'sit-to-stand',
        trackingQuality: 'high',
      });

      expect(sess.status).toBe('in_progress');
      expect(sess.exercise_id).toBe('sit-to-stand');
      expect(sess.repetitions).toBe(0);
      activeSessionId = sess.id;
    });

    await it('completes session and logs repetition aggregates', async () => {
      const completed = await completeSession(activeSessionId, {
        repetitions: 10,
        successfulRepetitions: 9,
        incompleteRepetitions: 1,
        durationSeconds: 125.5,
        qualityScore: 92.4,
        status: 'completed',
      });

      expect(completed.status).toBe('completed');
      expect(completed.completed_at).toBeDefined();
      expect(completed.repetitions).toBe(10);
      expect(completed.successful_repetitions).toBe(9);
      expect(completed.quality_score).toBe(92.4);
    });

    await it('records comprehensive biomechanical session metrics', async () => {
      const metrics = await recordSessionMetrics({
        sessionId: activeSessionId,
        averageAngle: 172.5,
        minimumAngle: 88.0,
        maximumAngle: 178.0,
        averageRepDuration: 4.2,
        successfulReps: 9,
        incompleteReps: 1,
      });

      expect(metrics.session_id).toBe(activeSessionId);
      expect(metrics.average_angle).toBe(172.5);
      expect(metrics.successful_reps).toBe(9);

      const retrieved = await getSessionMetrics(activeSessionId);
      expect(retrieved).toBeDefined();
      expect(retrieved?.average_angle).toBe(172.5);
    });
  });

  // -------------------------------------------------------------
  // Test Suite 5: Patient Feedback & Clinical Safety Boundaries
  // -------------------------------------------------------------
  await describe('Patient Feedback & Clinical Safety Ratings', async () => {
    await it('submits patient feedback with pain and fatigue scores', async () => {
      const feedback = await submitPatientFeedback({
        sessionId: 'sess-test-01',
        painLevel: 2,
        fatigueLevel: 4,
        patientComment: 'Felt slight quad tightness on the last two repetitions, but no joint pain.',
      });

      expect(feedback.pain_level).toBe(2);
      expect(feedback.fatigue_level).toBe(4);
      expect(feedback.patient_comment?.includes('tightness')).toBe(true);

      const retrieved = await getSessionFeedback('sess-test-01');
      expect(retrieved).toBeDefined();
      expect(retrieved?.pain_level).toBe(2);
    });

    await it('enforces pain score boundaries (0 - 10 VAS)', async () => {
      let threwLow = false;
      try {
        await submitPatientFeedback({
          sessionId: 'sess-test-01',
          painLevel: -1, // Invalid!
          fatigueLevel: 3,
        });
      } catch (err) {
        threwLow = true;
      }
      expect(threwLow).toBe(true);

      let threwHigh = false;
      try {
        await submitPatientFeedback({
          sessionId: 'sess-test-01',
          painLevel: 11, // Invalid!
          fatigueLevel: 3,
        });
      } catch (err) {
        threwHigh = true;
      }
      expect(threwHigh).toBe(true);
    });

    await it('enforces fatigue score boundaries (1 - 10 Borg RPE)', async () => {
      let threwLow = false;
      try {
        await submitPatientFeedback({
          sessionId: 'sess-test-01',
          painLevel: 3,
          fatigueLevel: 0, // Invalid!
        });
      } catch (err) {
        threwLow = true;
      }
      expect(threwLow).toBe(true);

      let threwHigh = false;
      try {
        await submitPatientFeedback({
          sessionId: 'sess-test-01',
          painLevel: 3,
          fatigueLevel: 12, // Invalid!
        });
      } catch (err) {
        threwHigh = true;
      }
      expect(threwHigh).toBe(true);
    });
  });

  console.log('\nAll REHAB-AI Exercise & Rehabilitation Data Model tests completed successfully!\n');
}

runAllTests().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
