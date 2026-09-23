// REHAB-AI Exercise Angle Calculator
// Pure mathematical extraction of primary joint angles and postural compensations

import { PoseLandmark } from '@/types/pose';
import { ExerciseDefinition } from '@/types/exercises';
import { calculateAngle3Points, calculateVerticalAngle } from '@/lib/pose/geometry';

export interface CalculatedExerciseMetrics {
  primaryJointAngle: number;
  secondaryAngles: Record<string, number>;
  postureDeviations: {
    trunkLeanAngle?: number;
    shoulderDisplacement?: number;
    lateralTiltAngle?: number;
  };
}

/**
 * Calculates primary joint angle and posture compensations deterministically
 * based on exercise definition and current pose landmarks.
 */
export function calculateExerciseAngles(
  exercise: ExerciseDefinition,
  landmarks: Record<string, PoseLandmark>
): CalculatedExerciseMetrics | null {
  if (!landmarks || Object.keys(landmarks).length === 0) return null;

  switch (exercise.id) {
    case 'elbow-flexion': {
      // Determine best visible arm (left or right)
      const leftConf =
        ((landmarks.LEFT_SHOULDER?.confidence ?? 0) +
          (landmarks.LEFT_ELBOW?.confidence ?? 0) +
          (landmarks.LEFT_WRIST?.confidence ?? 0)) /
        3;

      const rightConf =
        ((landmarks.RIGHT_SHOULDER?.confidence ?? 0) +
          (landmarks.RIGHT_ELBOW?.confidence ?? 0) +
          (landmarks.RIGHT_WRIST?.confidence ?? 0)) /
        3;

      const useLeft = leftConf >= rightConf;
      const shoulder = useLeft ? landmarks.LEFT_SHOULDER : landmarks.RIGHT_SHOULDER;
      const elbow = useLeft ? landmarks.LEFT_ELBOW : landmarks.RIGHT_ELBOW;
      const wrist = useLeft ? landmarks.LEFT_WRIST : landmarks.RIGHT_WRIST;
      const hip = useLeft ? landmarks.LEFT_HIP : landmarks.RIGHT_HIP;

      if (!shoulder || !elbow || !wrist) return null;

      // Primary: Angle at elbow vertex
      const elbowAngle = calculateAngle3Points(shoulder, elbow, wrist);

      // Posture: Trunk lean (Shoulder to Hip relative to vertical)
      let trunkLeanAngle = 0;
      if (shoulder && hip) {
        trunkLeanAngle = calculateVerticalAngle(hip, shoulder);
      }

      return {
        primaryJointAngle: elbowAngle,
        secondaryAngles: {
          elbowAngle,
        },
        postureDeviations: {
          trunkLeanAngle,
        },
      };
    }

    case 'shoulder-raise': {
      // Check arm elevation (Hip -> Shoulder -> Elbow)
      const leftConf =
        ((landmarks.LEFT_HIP?.confidence ?? 0) +
          (landmarks.LEFT_SHOULDER?.confidence ?? 0) +
          (landmarks.LEFT_ELBOW?.confidence ?? 0)) /
        3;

      const rightConf =
        ((landmarks.RIGHT_HIP?.confidence ?? 0) +
          (landmarks.RIGHT_SHOULDER?.confidence ?? 0) +
          (landmarks.RIGHT_ELBOW?.confidence ?? 0)) /
        3;

      const useLeft = leftConf >= rightConf;
      const hip = useLeft ? landmarks.LEFT_HIP : landmarks.RIGHT_HIP;
      const shoulder = useLeft ? landmarks.LEFT_SHOULDER : landmarks.RIGHT_SHOULDER;
      const elbow = useLeft ? landmarks.LEFT_ELBOW : landmarks.RIGHT_ELBOW;

      if (!hip || !shoulder || !elbow) return null;

      const elevationAngle = calculateAngle3Points(hip, shoulder, elbow);

      // Check lateral spine tilt
      let lateralTiltAngle = 0;
      if (landmarks.LEFT_SHOULDER && landmarks.RIGHT_SHOULDER) {
        const dY = Math.abs(landmarks.LEFT_SHOULDER.y - landmarks.RIGHT_SHOULDER.y);
        const dX = Math.abs(landmarks.LEFT_SHOULDER.x - landmarks.RIGHT_SHOULDER.x);
        lateralTiltAngle = (Math.atan2(dY, dX || 1) * 180) / Math.PI;
      }

      return {
        primaryJointAngle: elevationAngle,
        secondaryAngles: {
          elevationAngle,
        },
        postureDeviations: {
          lateralTiltAngle: Math.round(lateralTiltAngle * 10) / 10,
        },
      };
    }

    case 'sit-to-stand': {
      // Lower extremity extension (Hip -> Knee -> Ankle)
      const leftConf =
        ((landmarks.LEFT_HIP?.confidence ?? 0) +
          (landmarks.LEFT_KNEE?.confidence ?? 0) +
          (landmarks.LEFT_ANKLE?.confidence ?? 0)) /
        3;

      const rightConf =
        ((landmarks.RIGHT_HIP?.confidence ?? 0) +
          (landmarks.RIGHT_KNEE?.confidence ?? 0) +
          (landmarks.RIGHT_ANKLE?.confidence ?? 0)) /
        3;

      const useLeft = leftConf >= rightConf;
      const hip = useLeft ? landmarks.LEFT_HIP : landmarks.RIGHT_HIP;
      const knee = useLeft ? landmarks.LEFT_KNEE : landmarks.RIGHT_KNEE;
      const ankle = useLeft ? landmarks.LEFT_ANKLE : landmarks.RIGHT_ANKLE;
      const shoulder = useLeft ? landmarks.LEFT_SHOULDER : landmarks.RIGHT_SHOULDER;

      if (!hip || !knee || !ankle) return null;

      const kneeAngle = calculateAngle3Points(hip, knee, ankle);

      // Trunk pitch forward (Hip to Shoulder angle)
      let trunkLeanAngle = 0;
      if (shoulder && hip) {
        trunkLeanAngle = calculateVerticalAngle(hip, shoulder);
      }

      return {
        primaryJointAngle: kneeAngle,
        secondaryAngles: {
          kneeAngle,
        },
        postureDeviations: {
          trunkLeanAngle,
        },
      };
    }

    default:
      return null;
  }
}
