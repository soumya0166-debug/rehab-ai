// REHAB-AI Pose Confidence and Quality Assessment
// Ensures deterministic filtering of unstable or occluded frames

import { PoseLandmark, TrackingQualityLevel } from '@/types/pose';
import { LandmarkName } from '@/types/exercises';

export const MIN_LANDMARK_CONFIDENCE = 0.5;
export const CRITICAL_OCCLUSION_CONFIDENCE = 0.35;

/**
 * Checks whether all required landmarks are present and meet the minimum confidence threshold.
 */
export function areLandmarksConfident(
  landmarks: Record<string, PoseLandmark>,
  requiredLandmarks: LandmarkName[],
  minConfidence: number = MIN_LANDMARK_CONFIDENCE
): boolean {
  if (!landmarks || requiredLandmarks.length === 0) return false;

  for (const name of requiredLandmarks) {
    const lm = landmarks[name];
    if (!lm || lm.confidence < minConfidence) {
      return false;
    }
  }

  return true;
}

/**
 * Returns average confidence across the specified landmark names.
 */
export function calculateAverageConfidence(
  landmarks: Record<string, PoseLandmark>,
  landmarkNames: LandmarkName[]
): number {
  if (!landmarks || landmarkNames.length === 0) return 0;

  let total = 0;
  let count = 0;

  for (const name of landmarkNames) {
    const lm = landmarks[name];
    if (lm) {
      total += lm.confidence;
      count++;
    }
  }

  return count > 0 ? Math.round((total / count) * 100) / 100 : 0;
}

/**
 * Evaluates the overall session tracking quality based on visibility and keypoint stability.
 */
export function evaluateTrackingQuality(
  landmarks: Record<string, PoseLandmark>,
  requiredLandmarks: LandmarkName[]
): TrackingQualityLevel {
  if (!landmarks || Object.keys(landmarks).length === 0) {
    return 'uncalibrated';
  }

  const avgConf = calculateAverageConfidence(landmarks, requiredLandmarks);

  if (avgConf >= 0.75) {
    return 'high';
  } else if (avgConf >= 0.5) {
    return 'medium';
  } else {
    return 'low';
  }
}
