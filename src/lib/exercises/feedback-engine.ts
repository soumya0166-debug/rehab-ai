// REHAB-AI Biomechanical Movement Feedback Engine
// Strictly generates deterministic, non-diagnostic movement cues based on kinematic deviations

import { ExerciseDefinition, RepetitionPhase } from '@/types/exercises';
import { CalculatedExerciseMetrics } from './angle-calculator';

export interface MovementFeedback {
  currentCue: string;
  historicalFlags: string[];
}

/**
 * Evaluates current frame metrics against exercise rules to provide real-time coaching.
 */
export function generateMovementFeedback(
  exercise: ExerciseDefinition,
  metrics: CalculatedExerciseMetrics | null,
  currentPhase: RepetitionPhase,
  repDurationSeconds?: number
): string {
  if (!metrics) {
    return 'Adjust position so your joints are visible.';
  }

  const { primaryJointAngle, postureDeviations } = metrics;
  const logic = exercise.repetitionLogic;

  // Check posture deviations first
  if (postureDeviations.trunkLeanAngle && postureDeviations.trunkLeanAngle > 20) {
    return 'Keep your torso upright and avoid leaning.';
  }

  if (postureDeviations.lateralTiltAngle && postureDeviations.lateralTiltAngle > 15) {
    return 'Engage your core to keep your shoulders level.';
  }

  // Phase-specific coaching
  switch (currentPhase) {
    case 'REST': {
      const isAngleDecreasing = logic.peakFlexionMinAngle < logic.startAngle;
      const atStart = isAngleDecreasing
        ? primaryJointAngle >= logic.startAngle - 15
        : primaryJointAngle <= logic.startAngle + 15;

      if (!atStart) {
        return `Start in resting position (${Math.round(logic.startAngle)}°).`;
      }
      return 'Ready. Begin your movement smoothly.';
    }

    case 'MOVING': {
      const isAngleDecreasing = logic.peakFlexionMinAngle < logic.startAngle;
      if (isAngleDecreasing) {
        if (primaryJointAngle > logic.peakFlexionMaxAngle + 20) {
          return 'Keep flexing toward your target angle.';
        }
      } else {
        if (primaryJointAngle < logic.peakFlexionMinAngle - 20) {
          return 'Continue extending upward toward the target zone.';
        }
      }
      return 'Moving toward target...';
    }

    case 'TARGET_REACHED': {
      return 'Target angle reached! Hold steady, then return slowly.';
    }

    case 'RETURNING': {
      if (repDurationSeconds && repDurationSeconds < 1.2) {
        return 'Control your return speed — avoid dropping suddenly.';
      }
      return 'Lower smoothly back to starting posture.';
    }

    case 'COMPLETED_REP': {
      return 'Good repetition! Reset for the next one.';
    }

    case 'INCOMPLETE_REP': {
      return 'Did not reach target range. Try to complete full range next time.';
    }

    default:
      return 'Maintain steady, controlled pacing.';
  }
}
