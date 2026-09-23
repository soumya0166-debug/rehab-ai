// REHAB-AI: Pose Estimation Interfaces & Types
export interface Point3D {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface PoseFrame {
  timestampMs: number;
  landmarks: Point3D[];
  confidence: number;
}

export interface PoseEstimatorConfig {
  modelComplexity: 0 | 1 | 2;
  minDetectionConfidence: number;
  minTrackingConfidence: number;
}

export interface IPoseEstimator {
  initialize: (config?: Partial<PoseEstimatorConfig>) => Promise<boolean>;
  processFrame: (videoElement: HTMLVideoElement) => Promise<PoseFrame | null>;
  dispose: () => void;
}
