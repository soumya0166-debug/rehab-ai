// REHAB-AI Biomechanical Geometry Utilities
// Deterministic 2D/3D kinematic angle calculations and distance metrics

import { PoseLandmark } from '@/types/pose';

export interface Point2D {
  x: number;
  y: number;
}

export interface Point3D {
  x: number;
  y: number;
  z?: number;
}

/**
 * Calculates the interior angle in degrees at vertex Point B formed by ray BA and ray BC.
 * In biomechanics, this corresponds to joint angles (e.g. A=Shoulder, B=Elbow, C=Wrist).
 * Formula: θ = arccos( (BA · BC) / (|BA| * |BC|) ) * (180 / π)
 *
 * @param a First endpoint (e.g., Shoulder)
 * @param b Central vertex joint (e.g., Elbow)
 * @param c Second endpoint (e.g., Wrist)
 * @returns Angle in degrees [0, 180]
 */
export function calculateAngle3Points(
  a: Point2D | Point3D | PoseLandmark,
  b: Point2D | Point3D | PoseLandmark,
  c: Point2D | Point3D | PoseLandmark
): number {
  const vectorBA = {
    x: a.x - b.x,
    y: a.y - b.y,
  };

  const vectorBC = {
    x: c.x - b.x,
    y: c.y - b.y,
  };

  const dotProduct = vectorBA.x * vectorBC.x + vectorBA.y * vectorBC.y;
  const magBA = Math.sqrt(vectorBA.x * vectorBA.x + vectorBA.y * vectorBA.y);
  const magBC = Math.sqrt(vectorBC.x * vectorBC.x + vectorBC.y * vectorBC.y);

  if (magBA === 0 || magBC === 0) {
    return 0;
  }

  // Clamp dotProduct / (magBA * magBC) to [-1, 1] to prevent floating point NaN
  const cosine = Math.max(-1, Math.min(1, dotProduct / (magBA * magBC)));
  const radians = Math.acos(cosine);
  const degrees = (radians * 180) / Math.PI;

  return Math.round(degrees * 10) / 10;
}

/**
 * Calculates the angle of a segment relative to the vertical downward axis (plumb line).
 * Useful for trunk lean or arm elevation relative to gravity/vertical.
 */
export function calculateVerticalAngle(
  proximal: Point2D | PoseLandmark,
  distal: Point2D | PoseLandmark
): number {
  const dx = distal.x - proximal.x;
  const dy = distal.y - proximal.y;
  const radians = Math.atan2(dx, dy);
  let degrees = Math.abs((radians * 180) / Math.PI);
  if (degrees > 180) degrees = 360 - degrees;
  return Math.round(degrees * 10) / 10;
}

/**
 * 2D Euclidean distance between two points in normalized frame space.
 */
export function euclideanDistance2D(
  p1: Point2D | PoseLandmark,
  p2: Point2D | PoseLandmark
): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculates linear velocity in normalized units per second.
 */
export function calculateVelocity(
  current: Point2D | PoseLandmark,
  previous: Point2D | PoseLandmark,
  timeDeltaSeconds: number
): number {
  if (timeDeltaSeconds <= 0) return 0;
  const dist = euclideanDistance2D(current, previous);
  return dist / timeDeltaSeconds;
}
