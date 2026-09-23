// REHAB-AI Landmark Formatting and Positioning Heuristics
// Provides skeletal connections, bounding coverage calculations, and friendly positioning hints

import { PoseLandmark } from '@/types/pose';
import { LandmarkName } from '@/types/exercises';

// Standard MediaPipe landmark indices to LandmarkName mapping
export const MEDIAPIPE_INDEX_MAP: Record<number, string> = {
  0: 'NOSE',
  1: 'LEFT_EYE_INNER',
  2: 'LEFT_EYE',
  3: 'LEFT_EYE_OUTER',
  4: 'RIGHT_EYE_INNER',
  5: 'RIGHT_EYE',
  6: 'RIGHT_EYE_OUTER',
  7: 'LEFT_EAR',
  8: 'RIGHT_EAR',
  9: 'MOUTH_LEFT',
  10: 'MOUTH_RIGHT',
  11: 'LEFT_SHOULDER',
  12: 'RIGHT_SHOULDER',
  13: 'LEFT_ELBOW',
  14: 'RIGHT_ELBOW',
  15: 'LEFT_WRIST',
  16: 'RIGHT_WRIST',
  17: 'LEFT_PINKY',
  18: 'RIGHT_PINKY',
  19: 'LEFT_INDEX',
  20: 'RIGHT_INDEX',
  21: 'LEFT_THUMB',
  22: 'RIGHT_THUMB',
  23: 'LEFT_HIP',
  24: 'RIGHT_HIP',
  25: 'LEFT_KNEE',
  26: 'RIGHT_KNEE',
  27: 'LEFT_ANKLE',
  28: 'RIGHT_ANKLE',
  29: 'LEFT_HEEL',
  30: 'RIGHT_HEEL',
  31: 'LEFT_FOOT_INDEX',
  32: 'RIGHT_FOOT_INDEX',
};

// Skeletal lines to draw between pairs of landmarks
export const SKELETON_CONNECTIONS: [string, string][] = [
  // Upper body
  ['LEFT_SHOULDER', 'RIGHT_SHOULDER'],
  ['LEFT_SHOULDER', 'LEFT_ELBOW'],
  ['LEFT_ELBOW', 'LEFT_WRIST'],
  ['RIGHT_SHOULDER', 'RIGHT_ELBOW'],
  ['RIGHT_ELBOW', 'RIGHT_WRIST'],
  // Torso
  ['LEFT_SHOULDER', 'LEFT_HIP'],
  ['RIGHT_SHOULDER', 'RIGHT_HIP'],
  ['LEFT_HIP', 'RIGHT_HIP'],
  // Lower body
  ['LEFT_HIP', 'LEFT_KNEE'],
  ['LEFT_KNEE', 'LEFT_ANKLE'],
  ['LEFT_ANKLE', 'LEFT_HEEL'],
  ['LEFT_HEEL', 'LEFT_FOOT_INDEX'],
  ['RIGHT_HIP', 'RIGHT_KNEE'],
  ['RIGHT_KNEE', 'RIGHT_ANKLE'],
  ['RIGHT_ANKLE', 'RIGHT_HEEL'],
  ['RIGHT_HEEL', 'RIGHT_FOOT_INDEX'],
];

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

/**
 * Calculates the bounding box of the detected subject.
 */
export function calculateBoundingBox(landmarks: Record<string, PoseLandmark>): BoundingBox | null {
  const points = Object.values(landmarks).filter((l) => l.confidence > 0.3);
  if (points.length < 4) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }

  const width = Math.max(0, maxX - minX);
  const height = Math.max(0, maxY - minY);
  const centerX = minX + width / 2;
  const centerY = minY + height / 2;

  return { minX, minY, maxX, maxY, width, height, centerX, centerY };
}

/**
 * Provides friendly, non-technical guidance to assist the patient in positioning themselves.
 */
export function assessPositioningGuidance(
  landmarks: Record<string, PoseLandmark>,
  requiredLandmarks: LandmarkName[]
): { isPositioned: boolean; message: string } {
  if (!landmarks || Object.keys(landmarks).length === 0) {
    return { isPositioned: false, message: 'Please stand or sit in front of the camera.' };
  }

  // Check required landmarks
  const missing = requiredLandmarks.filter(
    (name) => !landmarks[name] || landmarks[name].confidence < 0.4
  );

  if (missing.length > 0) {
    if (missing.some((m) => m.includes('ANKLE') || m.includes('KNEE') || m.includes('FOOT'))) {
      return { isPositioned: false, message: 'Step slightly back so your full body is visible.' };
    }
    if (missing.some((m) => m.includes('WRIST') || m.includes('ELBOW') || m.includes('SHOULDER'))) {
      return { isPositioned: false, message: 'Ensure your arms are within the camera view.' };
    }
    return { isPositioned: false, message: 'Adjust your position so all exercise joints are visible.' };
  }

  const bbox = calculateBoundingBox(landmarks);
  if (!bbox) {
    return { isPositioned: false, message: 'Detecting posture...' };
  }

  // Check if too close (covering more than 90% vertical frame)
  if (bbox.height > 0.95 || bbox.width > 0.9) {
    return { isPositioned: false, message: 'Move slightly farther from the camera.' };
  }

  // Check if too far (covering less than 20% vertical frame)
  if (bbox.height < 0.25) {
    return { isPositioned: false, message: 'Move a little closer to the camera.' };
  }

  // Check horizontal centering
  if (bbox.centerX < 0.25) {
    return { isPositioned: false, message: 'Move slightly to your left (toward the center).' };
  }
  if (bbox.centerX > 0.75) {
    return { isPositioned: false, message: 'Move slightly to your right (toward the center).' };
  }

  return { isPositioned: true, message: 'Tracking is ready. Hold still to begin.' };
}
