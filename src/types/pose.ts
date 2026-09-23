// REHAB-AI: Normalized Pose Estimation & Landmark Types
// Client-side local processing types for MediaPipe and custom vision trackers

export interface PoseLandmark {
  name: string;
  x: number; // Normalized coordinate [0, 1] across frame width
  y: number; // Normalized coordinate [0, 1] across frame height
  z: number; // Relative depth coordinate
  confidence: number; // Visibility / presence confidence [0, 1]
}

export interface PoseFrame {
  timestamp: number;
  landmarks: Record<string, PoseLandmark>;
  landmarkList: PoseLandmark[];
  overallConfidence: number;
}

export type TrackingQualityLevel = 'high' | 'medium' | 'low' | 'uncalibrated';

export interface CameraReadinessState {
  isCameraConnected: boolean;
  isLightingSufficient: boolean;
  areRequiredLandmarksVisible: boolean;
  isPoseConfidenceSufficient: boolean;
  isPatientPositionedCorrectly: boolean;
  friendlyMessage: string;
  isReadyToAnalyze: boolean;
}

export interface DeveloperDebugInfo {
  fps: number;
  latencyMs: number;
  trackedJointAngles: Record<string, number>;
  landmarkConfidences: Record<string, number>;
  activePhase: string;
  boundingCoverage: number;
}

// Canonical MediaPipe 33 landmark names
export const STANDARD_LANDMARK_NAMES = [
  'NOSE',
  'LEFT_EYE_INNER',
  'LEFT_EYE',
  'LEFT_EYE_OUTER',
  'RIGHT_EYE_INNER',
  'RIGHT_EYE',
  'RIGHT_EYE_OUTER',
  'LEFT_EAR',
  'RIGHT_EAR',
  'MOUTH_LEFT',
  'MOUTH_RIGHT',
  'LEFT_SHOULDER',
  'RIGHT_SHOULDER',
  'LEFT_ELBOW',
  'RIGHT_ELBOW',
  'LEFT_WRIST',
  'RIGHT_WRIST',
  'LEFT_PINKY',
  'RIGHT_PINKY',
  'LEFT_INDEX',
  'RIGHT_INDEX',
  'LEFT_THUMB',
  'RIGHT_THUMB',
  'LEFT_HIP',
  'RIGHT_HIP',
  'LEFT_KNEE',
  'RIGHT_KNEE',
  'LEFT_ANKLE',
  'RIGHT_ANKLE',
  'LEFT_HEEL',
  'RIGHT_HEEL',
  'LEFT_FOOT_INDEX',
  'RIGHT_FOOT_INDEX',
] as const;
