// Biomechanical Geometry & Mathematical Vector Engine
import { Landmark3D } from '@/types/rehab';

/**
 * Calculates the internal angle (in degrees) between three 3D points where point B is the joint vertex.
 * Angle formed by rays BA and BC.
 */
export function calculateJointAngle(
  a: Landmark3D,
  b: Landmark3D,
  c: Landmark3D
): number {
  if (!a || !b || !c) return 0;

  // Vectors from joint vertex B to proximal A and distal C
  const v1 = {
    x: a.x - b.x,
    y: a.y - b.y,
    z: (a.z ?? 0) - (b.z ?? 0),
  };

  const v2 = {
    x: c.x - b.x,
    y: c.y - b.y,
    z: (c.z ?? 0) - (b.z ?? 0),
  };

  // Dot product
  const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;

  // Magnitudes
  const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y + v1.z * v1.z);
  const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y + v2.z * v2.z);

  if (mag1 < 1e-6 || mag2 < 1e-6) return 0;

  // Clamp cosine for numerical stability
  const cosAngle = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
  const angleRad = Math.acos(cosAngle);

  return Math.round((angleRad * 180) / Math.PI);
}

/**
 * Calculates 2D planar angle on screen projection (useful when depth z is noisy)
 */
export function calculate2DAngle(
  a: { x: number; y: number },
  b: { x: number; y: number },
  c: { x: number; y: number }
): number {
  if (!a || !b || !c) return 0;

  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);

  if (angle > 180.0) {
    angle = 360 - angle;
  }

  return Math.round(angle);
}

/**
 * Calculates trunk inclination relative to vertical gravity axis (in degrees).
 * 0° = perfectly upright vertical torso.
 */
export function calculateTrunkLean(
  leftShoulder: Landmark3D,
  rightShoulder: Landmark3D,
  leftHip: Landmark3D,
  rightHip: Landmark3D
): number {
  if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) return 0;

  // Midpoints
  const shoulderMid = {
    x: (leftShoulder.x + rightShoulder.x) / 2,
    y: (leftShoulder.y + rightShoulder.y) / 2,
  };
  const hipMid = {
    x: (leftHip.x + rightHip.x) / 2,
    y: (leftHip.y + rightHip.y) / 2,
  };

  // Vector from hip to shoulder
  const spineDx = shoulderMid.x - hipMid.x;
  const spineDy = shoulderMid.y - hipMid.y; // note y points downward in camera coords

  // Angle with true vertical (spineDy is negative when upright)
  const angleRad = Math.atan2(Math.abs(spineDx), Math.abs(spineDy));
  return Math.round((angleRad * 180) / Math.PI);
}

/**
 * Calculates lateral trunk bend (leaning to the left or right)
 */
export function calculateLateralLean(
  leftShoulder: Landmark3D,
  rightShoulder: Landmark3D
): number {
  if (!leftShoulder || !rightShoulder) return 0;
  const dy = rightShoulder.y - leftShoulder.y;
  const dx = rightShoulder.x - leftShoulder.x;
  const angleRad = Math.atan2(dy, dx);
  const degrees = (angleRad * 180) / Math.PI;
  return Math.round(Math.abs(degrees)); // 0° is horizontal shoulders
}

/**
 * Calculates Knee Valgus (Q-angle proxy / dynamic knee collapse)
 * Compares knee medial displacement relative to the hip-to-ankle mechanical axis.
 */
export function calculateKneeValgusDeviation(
  hip: Landmark3D,
  knee: Landmark3D,
  ankle: Landmark3D,
  isLeft: boolean
): number {
  if (!hip || !knee || !ankle) return 0;

  // Projected line from hip to ankle: find expected x at knee.y
  const t = (knee.y - hip.y) / (ankle.y - hip.y || 1);
  const expectedKneeX = hip.x + t * (ankle.x - hip.x);

  // For left knee, moving towards right (in camera view x increases towards right)
  const medialShift = isLeft 
    ? (knee.x - expectedKneeX) // Left knee collapsing inwards towards center
    : (expectedKneeX - knee.x); // Right knee collapsing inwards towards center

  return medialShift; // Normalized screen coordinate shift
}

/**
 * Calculates shoulder elevation / shrug relative to neck/ear
 * A decreasing ratio indicates the patient is hiking their shoulder.
 */
export function calculateShoulderEarRatio(
  shoulder: Landmark3D,
  ear: Landmark3D,
  shoulderBaselineDist: number
): number {
  if (!shoulder || !ear || shoulderBaselineDist <= 0) return 1.0;
  const currentDist = Math.hypot(shoulder.x - ear.x, shoulder.y - ear.y);
  return currentDist / shoulderBaselineDist;
}

/**
 * Exponential Moving Average (EMA) smoother for real-time stream stability
 */
export class AngleSmoother {
  private alpha: number;
  private currentSmoothed: number | null = null;

  constructor(alpha: number = 0.35) {
    this.alpha = alpha;
  }

  update(rawAngle: number): number {
    if (this.currentSmoothed === null || isNaN(this.currentSmoothed)) {
      this.currentSmoothed = rawAngle;
    } else {
      this.currentSmoothed = this.alpha * rawAngle + (1 - this.alpha) * this.currentSmoothed;
    }
    return Math.round(this.currentSmoothed);
  }

  reset() {
    this.currentSmoothed = null;
  }
}
