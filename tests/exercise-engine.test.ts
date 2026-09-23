// REHAB-AI Exercise Engine & State Machine Edge Case Unit Tests
// Tests correct rep, incomplete rep, random movement jitter, missing landmarks, low confidence, and cadence variations.

import { SEEDED_EXERCISE_DEFINITIONS, getSeededExercise } from '../src/lib/exercises/definitions';
import { ExerciseEngine } from '../src/lib/exercises/exercise-engine';
import { RepetitionDetector } from '../src/lib/exercises/repetition-detector';
import { calculateAngle3Points } from '../src/lib/pose/geometry';
import { calculateExerciseAngles } from '../src/lib/exercises/angle-calculator';
import { areLandmarksConfident } from '../src/lib/pose/confidence';
import { PoseFrame, PoseLandmark } from '../src/types/pose';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function runTests() {
  console.log('--- RUNNING EXERCISE ENGINE & EDGE CASE UNIT TESTS ---');

  const elbowDef = getSeededExercise('elbow-flexion');
  const shoulderDef = getSeededExercise('shoulder-raise');
  const sitToStandDef = getSeededExercise('sit-to-stand');

  assert(elbowDef !== null, 'Elbow flexion definition exists');
  assert(shoulderDef !== null, 'Shoulder raise definition exists');
  assert(sitToStandDef !== null, 'Sit-to-stand definition exists');

  // -------------------------------------------------------------------------
  // TEST 1: 3-Point Geometric Angle Calculation
  // -------------------------------------------------------------------------
  console.log('Test 1: Geometry angle calculations');
  // Right triangle: A=(0, 1), B=(0, 0), C=(1, 0) -> Angle at B should be 90 degrees
  const angle90 = calculateAngle3Points({ x: 0, y: 1 }, { x: 0, y: 0 }, { x: 1, y: 0 });
  assert(Math.abs(angle90 - 90) < 0.1, `Expected 90 degrees, got ${angle90}`);

  // Straight line: A=(0, 1), B=(0, 0), C=(0, -1) -> Angle at B should be 180 degrees
  const angle180 = calculateAngle3Points({ x: 0, y: 1 }, { x: 0, y: 0 }, { x: 0, y: -1 });
  assert(Math.abs(angle180 - 180) < 0.1, `Expected 180 degrees, got ${angle180}`);

  // 45 degrees: A=(1, 1), B=(0, 0), C=(1, 0)
  const angle45 = calculateAngle3Points({ x: 1, y: 1 }, { x: 0, y: 0 }, { x: 1, y: 0 });
  assert(Math.abs(angle45 - 45) < 0.1, `Expected 45 degrees, got ${angle45}`);

  // -------------------------------------------------------------------------
  // TEST 2: Jitter & Random Movement Rejection (Must NOT count as Rep)
  // -------------------------------------------------------------------------
  console.log('Test 2: Random movement and jitter rejection');
  const detector = new RepetitionDetector(elbowDef!);

  let t = 1000;
  // Start angle is 150. Feed jitter between 145 and 155
  for (let i = 0; i < 30; i++) {
    const jitterAngle = 150 + (Math.sin(i) * 5);
    const result = detector.update(jitterAngle, t);
    t += 100;
    assert(result === null, 'Jitter should never complete a repetition');
    assert(detector.getSnapshot().phase === 'REST', 'Jitter within threshold should stay in REST');
  }
  assert(detector.getSnapshot().totalCompletedReps === 0, 'No reps counted during random jitter');
  assert(detector.getSnapshot().totalIncompleteReps === 0, 'No incomplete reps counted during tiny jitter');

  // -------------------------------------------------------------------------
  // TEST 3: Valid Full Repetition (Elbow Flexion)
  // -------------------------------------------------------------------------
  console.log('Test 3: Full valid repetition');
  detector.reset();
  t = 0;

  // 1. Rest posture at 150 deg
  detector.update(150, t);
  t += 200;

  // 2. Start moving (angle decreases toward 45 deg)
  detector.update(130, t); // crosses 15 deg displacement -> enters MOVING
  t += 300;
  assert(detector.getSnapshot().phase === 'MOVING', 'Phase should be MOVING');

  detector.update(90, t);
  t += 300;
  detector.update(60, t);
  t += 300;

  // 3. Reaches target flexion zone (45 deg is in 35-55 deg range)
  detector.update(45, t);
  t += 400;
  assert(detector.getSnapshot().phase === 'TARGET_REACHED', 'Phase should be TARGET_REACHED');

  // 4. Returns back down
  detector.update(80, t); // crosses threshold -> enters RETURNING
  t += 400;
  assert(detector.getSnapshot().phase === 'RETURNING', 'Phase should be RETURNING');

  detector.update(110, t);
  t += 400;

  // 5. Crosses returnExtensionThreshold (140 deg)
  const repResult = detector.update(145, t);
  assert(repResult !== null, 'Repetition result should be emitted on completion');
  assert(repResult?.status === 'completed', 'Rep status should be completed');
  assert(repResult?.measuredRange === 45, `Measured range should be 45, got ${repResult?.measuredRange}`);
  assert(detector.getSnapshot().totalCompletedReps === 1, 'Total completed reps should be 1');

  // -------------------------------------------------------------------------
  // TEST 4: Incomplete Repetition (Aborted before reaching target)
  // -------------------------------------------------------------------------
  console.log('Test 4: Incomplete repetition');
  // Reset back to rest
  detector.update(150, t);
  t += 300;
  assert(detector.getSnapshot().phase === 'REST', 'Should be reset to REST');

  // Patient starts curl: 150 -> 120 -> 90, but stops and returns to 145 without reaching <= 55
  detector.update(120, t);
  t += 400;
  assert(detector.getSnapshot().phase === 'MOVING', 'Should enter MOVING');

  detector.update(90, t); // Only reached 90 deg (target is 35-55)
  t += 400;

  // Reverses back to 142 (crosses return threshold without hitting target)
  const incompleteResult = detector.update(142, t);
  assert(incompleteResult !== null, 'Incomplete repetition result should be emitted');
  assert(incompleteResult?.status === 'incomplete', 'Status should be incomplete');
  assert(detector.getSnapshot().totalIncompleteReps === 1, 'Total incomplete reps should be 1');

  // -------------------------------------------------------------------------
  // TEST 5: Ballistic Artifact Rejection (Too fast to be humanly possible)
  // -------------------------------------------------------------------------
  console.log('Test 5: Ballistic ultra-fast artifact rejection');
  detector.reset();
  t = 0;
  detector.update(150, t);
  t += 50; // 50 ms later
  detector.update(45, t);
  t += 50; // 100 ms total
  const fastResult = detector.update(145, t);
  assert(fastResult === null, 'Artifact faster than 0.6s must be rejected as camera artifact');
  assert(detector.getSnapshot().totalCompletedReps === 0, 'No reps counted for glitch');

  // -------------------------------------------------------------------------
  // TEST 6: Pose Frame Safety & Landmark Confidence Checks
  // -------------------------------------------------------------------------
  console.log('Test 6: Missing landmarks & low confidence safety pause');
  const engine = new ExerciseEngine(elbowDef!);

  // Frame with missing LEFT_ELBOW
  const badFrame1: PoseFrame = {
    timestamp: 1000,
    landmarks: {
      LEFT_SHOULDER: { name: 'LEFT_SHOULDER', x: 0.5, y: 0.2, z: 0, confidence: 0.9 },
      LEFT_WRIST: { name: 'LEFT_WRIST', x: 0.5, y: 0.8, z: 0, confidence: 0.9 },
    },
    landmarkList: [],
    overallConfidence: 0.6,
  };

  const update1 = engine.processFrame(badFrame1);
  assert(!update1.isTrackingValid, 'Tracking should be marked invalid when required landmark is missing');
  assert(update1.feedbackBanner.includes('Tracking paused'), 'Should show tracking paused message');

  // Frame with low confidence (0.2 < threshold 0.4)
  const badFrame2: PoseFrame = {
    timestamp: 2000,
    landmarks: {
      LEFT_SHOULDER: { name: 'LEFT_SHOULDER', x: 0.5, y: 0.2, z: 0, confidence: 0.9 },
      LEFT_ELBOW: { name: 'LEFT_ELBOW', x: 0.5, y: 0.5, z: 0, confidence: 0.2 }, // Low confidence!
      LEFT_WRIST: { name: 'LEFT_WRIST', x: 0.5, y: 0.8, z: 0, confidence: 0.9 },
      LEFT_HIP: { name: 'LEFT_HIP', x: 0.5, y: 0.7, z: 0, confidence: 0.9 },
    },
    landmarkList: [],
    overallConfidence: 0.5,
  };

  const update2 = engine.processFrame(badFrame2);
  assert(!update2.isTrackingValid, 'Tracking should be invalid when confidence is low');

  // -------------------------------------------------------------------------
  // TEST 7: Multi-Exercise Angle Calculations
  // -------------------------------------------------------------------------
  console.log('Test 7: Angle calculations across Shoulder Raise and Sit-to-Stand');
  // Shoulder raise: Hip (0.5, 0.8), Shoulder (0.5, 0.4), Elbow (0.8, 0.4) -> 90 deg elevation
  const shoulderLandmarks: Record<string, PoseLandmark> = {
    LEFT_HIP: { name: 'LEFT_HIP', x: 0.5, y: 0.8, z: 0, confidence: 0.95 },
    LEFT_SHOULDER: { name: 'LEFT_SHOULDER', x: 0.5, y: 0.4, z: 0, confidence: 0.95 },
    LEFT_ELBOW: { name: 'LEFT_ELBOW', x: 0.8, y: 0.4, z: 0, confidence: 0.95 },
  };
  const shoulderAngles = calculateExerciseAngles(shoulderDef!, shoulderLandmarks);
  assert(shoulderAngles !== null, 'Shoulder metrics calculated');
  assert(Math.abs(shoulderAngles!.primaryJointAngle - 90) < 1, `Expected ~90 deg shoulder elevation, got ${shoulderAngles!.primaryJointAngle}`);

  // Sit-to-stand: Hip (0.5, 0.4), Knee (0.5, 0.7), Ankle (0.7, 0.7) -> 90 deg knee bend (seated)
  const sitLandmarks: Record<string, PoseLandmark> = {
    LEFT_HIP: { name: 'LEFT_HIP', x: 0.5, y: 0.4, z: 0, confidence: 0.95 },
    LEFT_KNEE: { name: 'LEFT_KNEE', x: 0.5, y: 0.7, z: 0, confidence: 0.95 },
    LEFT_ANKLE: { name: 'LEFT_ANKLE', x: 0.7, y: 0.7, z: 0, confidence: 0.95 },
  };
  const sitAngles = calculateExerciseAngles(sitToStandDef!, sitLandmarks);
  assert(sitAngles !== null, 'Sit-to-stand metrics calculated');
  assert(Math.abs(sitAngles!.primaryJointAngle - 90) < 1, `Expected ~90 deg seated knee angle, got ${sitAngles!.primaryJointAngle}`);

  // -------------------------------------------------------------------------
  // TEST 8: Session Metrics Aggregation
  // -------------------------------------------------------------------------
  console.log('Test 8: Session summary metrics compilation');
  const summary = engine.compileSessionSummary();
  assert(summary.totalReps >= 0, 'Total reps compiled');
  assert(summary.qualityScore >= 0 && summary.qualityScore <= 100, 'Quality score is bounded 0-100');

  console.log('ALL EXERCISE ENGINE EDGE CASE TESTS PASSED SUCCESSFULLY! ✅');
}

runTests();
