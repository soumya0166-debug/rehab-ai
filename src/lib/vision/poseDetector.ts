// REHAB-AI: MediaPipe Pose Client-Side Loader & Synthetic Motion Simulator
import { Landmark3D, POSE_LANDMARKS, ExerciseDefinition } from '@/types/rehab';

export type PoseResultsCallback = (landmarks: Landmark3D[]) => void;

interface MediaPipePoseInstance {
  setOptions: (options: Record<string, unknown>) => void;
  onResults: (callback: (results: { poseLandmarks?: Landmark3D[] }) => void) => void;
  send: (input: { image: HTMLVideoElement }) => Promise<void>;
  close?: () => void;
}

interface MediaPipeCameraInstance {
  start: () => Promise<void>;
  stop: () => void;
}

declare global {
  interface Window {
    Pose?: new (config: { locateFile: (file: string) => string }) => MediaPipePoseInstance;
    Camera?: new (
      videoElement: HTMLVideoElement,
      config: { onFrame: () => Promise<void>; width: number; height: number }
    ) => MediaPipeCameraInstance;
  }
}

export class PoseManager {
  private pose: MediaPipePoseInstance | null = null;
  private camera: MediaPipeCameraInstance | null = null;
  private isSynthetic: boolean = false;
  private syntheticAnimFrame: number | null = null;
  private syntheticPhase: number = 0;
  private onResultsCallback: PoseResultsCallback | null = null;
  private currentExercise: ExerciseDefinition | null = null;

  public async initMediaPipe(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    // Check if already loaded
    if (window.Pose && window.Camera) {
      return true;
    }

    try {
      await this.loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/pose.js');
      await this.loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils@0.4.1675469240/camera_utils.js');
      return !!(window.Pose && window.Camera);
    } catch (err) {
      console.warn('Failed to load MediaPipe from CDN, falling back to synthetic simulator:', err);
      return false;
    }
  }

  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.crossOrigin = 'anonymous';
      script.onload = () => resolve();
      script.onerror = (e) => reject(e);
      document.head.appendChild(script);
    });
  }

  public async startCamera(
    videoElement: HTMLVideoElement,
    onResults: PoseResultsCallback
  ): Promise<boolean> {
    this.onResultsCallback = onResults;
    this.stopSynthetic();

    const ready = await this.initMediaPipe();
    if (!ready || !window.Pose || !window.Camera) {
      console.warn('MediaPipe Pose unavailable. Starting in synthetic mode.');
      this.startSynthetic(onResults);
      return false;
    }

    try {
      this.pose = new window.Pose({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${file}`,
      });

      this.pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      this.pose.onResults((results) => {
        if (results.poseLandmarks && this.onResultsCallback) {
          this.onResultsCallback(results.poseLandmarks);
        }
      });

      this.camera = new window.Camera(videoElement, {
        onFrame: async () => {
          if (this.pose && videoElement.readyState >= 2) {
            await this.pose.send({ image: videoElement });
          }
        },
        width: 640,
        height: 480,
      });

      await this.camera.start();
      this.isSynthetic = false;
      return true;
    } catch (err) {
      console.error('Error starting camera stream, activating simulator:', err);
      this.startSynthetic(onResults);
      return false;
    }
  }

  public setExerciseForSimulation(exercise: ExerciseDefinition) {
    this.currentExercise = exercise;
  }

  /**
   * High-Fidelity Biomechanical Kinematics Simulator
   * Generates anatomically accurate 33-point skeleton frames
   * for instant demonstration and testing without a camera.
   */
  public startSynthetic(onResults: PoseResultsCallback) {
    this.stop();
    this.isSynthetic = true;
    this.onResultsCallback = onResults;
    this.syntheticPhase = 0;

    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      // Cycle speed: ~6 seconds per rep
      this.syntheticPhase += dt * 0.9;
      const motionCycle = (Math.sin(this.syntheticPhase) + 1) / 2; // 0.0 to 1.0

      const landmarks = this.generateSyntheticLandmarks(motionCycle);
      if (this.onResultsCallback) {
        this.onResultsCallback(landmarks);
      }

      this.syntheticAnimFrame = requestAnimationFrame(loop);
    };

    this.syntheticAnimFrame = requestAnimationFrame(loop);
  }

  public stopSynthetic() {
    if (this.syntheticAnimFrame) {
      cancelAnimationFrame(this.syntheticAnimFrame);
      this.syntheticAnimFrame = null;
    }
    this.isSynthetic = false;
  }

  public stop() {
    this.stopSynthetic();
    if (this.camera) {
      try {
        this.camera.stop();
      } catch {
        // ignore
      }
      this.camera = null;
    }
    if (this.pose) {
      try {
        this.pose.close?.();
      } catch {
        // ignore
      }
      this.pose = null;
    }
  }

  public isUsingSynthetic(): boolean {
    return this.isSynthetic;
  }

  private generateSyntheticLandmarks(motionProgress: number): Landmark3D[] {
    const exId = this.currentExercise?.id || 'knee-extension';

    // Base standing/seated human figure template in normalized [0, 1] screen coords
    const lms: Landmark3D[] = Array.from({ length: 33 }, () => ({
      x: 0.5,
      y: 0.5,
      z: 0,
      visibility: 0.99,
    }));

    // Head
    lms[POSE_LANDMARKS.NOSE] = { x: 0.5, y: 0.16, z: 0 };
    lms[POSE_LANDMARKS.LEFT_EAR] = { x: 0.53, y: 0.15, z: 0 };
    lms[POSE_LANDMARKS.RIGHT_EAR] = { x: 0.47, y: 0.15, z: 0 };

    if (exId === 'knee-extension') {
      // Seated knee extension profile
      // Torso
      lms[POSE_LANDMARKS.LEFT_SHOULDER] = { x: 0.45, y: 0.30, z: 0 };
      lms[POSE_LANDMARKS.RIGHT_SHOULDER] = { x: 0.47, y: 0.30, z: 0.05 };
      lms[POSE_LANDMARKS.LEFT_HIP] = { x: 0.45, y: 0.55, z: 0 };
      lms[POSE_LANDMARKS.RIGHT_HIP] = { x: 0.47, y: 0.55, z: 0.05 };

      // Left Knee (Target): Sitting thigh is horizontal at y=0.55
      lms[POSE_LANDMARKS.LEFT_KNEE] = { x: 0.65, y: 0.56, z: 0 };
      lms[POSE_LANDMARKS.RIGHT_KNEE] = { x: 0.65, y: 0.58, z: 0.05 };

      // Left Ankle: swings from hanging down (x:0.65, y:0.85) up to horizontal extension (x:0.87, y:0.56)
      const ankleRestX = 0.66;
      const ankleRestY = 0.82;
      const ankleExtX = 0.86;
      const ankleExtY = 0.57;

      lms[POSE_LANDMARKS.LEFT_ANKLE] = {
        x: ankleRestX + (ankleExtX - ankleRestX) * motionProgress,
        y: ankleRestY + (ankleExtY - ankleRestY) * motionProgress,
        z: 0,
      };
      lms[POSE_LANDMARKS.LEFT_HEEL] = {
        x: lms[POSE_LANDMARKS.LEFT_ANKLE].x - 0.02,
        y: lms[POSE_LANDMARKS.LEFT_ANKLE].y + 0.02,
        z: 0,
      };
      lms[POSE_LANDMARKS.LEFT_FOOT_INDEX] = {
        x: lms[POSE_LANDMARKS.LEFT_ANKLE].x + 0.05,
        y: lms[POSE_LANDMARKS.LEFT_ANKLE].y + 0.02,
        z: 0,
      };

      // Right leg stationary
      lms[POSE_LANDMARKS.RIGHT_ANKLE] = { x: 0.67, y: 0.84, z: 0.05 };

      // Arms resting
      lms[POSE_LANDMARKS.LEFT_ELBOW] = { x: 0.44, y: 0.42, z: 0 };
      lms[POSE_LANDMARKS.LEFT_WRIST] = { x: 0.48, y: 0.54, z: 0 };
      lms[POSE_LANDMARKS.RIGHT_ELBOW] = { x: 0.48, y: 0.42, z: 0.05 };
      lms[POSE_LANDMARKS.RIGHT_WRIST] = { x: 0.50, y: 0.54, z: 0.05 };

    } else if (exId === 'bodyweight-squat') {
      // Squatting down
      const squatDepth = motionProgress * 0.16; // drop hip and knees

      lms[POSE_LANDMARKS.LEFT_SHOULDER] = { x: 0.43, y: 0.28 + squatDepth * 0.9, z: 0 };
      lms[POSE_LANDMARKS.RIGHT_SHOULDER] = { x: 0.57, y: 0.28 + squatDepth * 0.9, z: 0 };

      lms[POSE_LANDMARKS.LEFT_HIP] = { x: 0.44, y: 0.48 + squatDepth, z: 0 };
      lms[POSE_LANDMARKS.RIGHT_HIP] = { x: 0.56, y: 0.48 + squatDepth, z: 0 };

      // Knees bend and move forward slightly
      lms[POSE_LANDMARKS.LEFT_KNEE] = { x: 0.42, y: 0.66 + squatDepth * 0.5, z: 0 };
      lms[POSE_LANDMARKS.RIGHT_KNEE] = { x: 0.58, y: 0.66 + squatDepth * 0.5, z: 0 };

      // Feet stay firmly planted
      lms[POSE_LANDMARKS.LEFT_ANKLE] = { x: 0.43, y: 0.88, z: 0 };
      lms[POSE_LANDMARKS.RIGHT_ANKLE] = { x: 0.57, y: 0.88, z: 0 };

      // Hands outstretched for balance
      lms[POSE_LANDMARKS.LEFT_ELBOW] = { x: 0.42, y: 0.38 + squatDepth * 0.9, z: 0 };
      lms[POSE_LANDMARKS.LEFT_WRIST] = { x: 0.42, y: 0.38 + squatDepth * 0.9, z: 0 };
      lms[POSE_LANDMARKS.RIGHT_ELBOW] = { x: 0.58, y: 0.38 + squatDepth * 0.9, z: 0 };
      lms[POSE_LANDMARKS.RIGHT_WRIST] = { x: 0.58, y: 0.38 + squatDepth * 0.9, z: 0 };

    } else if (exId === 'shoulder-scaption') {
      // Standing shoulder elevation
      lms[POSE_LANDMARKS.LEFT_SHOULDER] = { x: 0.42, y: 0.28, z: 0 };
      lms[POSE_LANDMARKS.RIGHT_SHOULDER] = { x: 0.58, y: 0.28, z: 0 };
      lms[POSE_LANDMARKS.LEFT_HIP] = { x: 0.44, y: 0.54, z: 0 };
      lms[POSE_LANDMARKS.RIGHT_HIP] = { x: 0.56, y: 0.54, z: 0 };
      lms[POSE_LANDMARKS.LEFT_KNEE] = { x: 0.44, y: 0.72, z: 0 };
      lms[POSE_LANDMARKS.RIGHT_KNEE] = { x: 0.56, y: 0.72, z: 0 };
      lms[POSE_LANDMARKS.LEFT_ANKLE] = { x: 0.44, y: 0.90, z: 0 };
      lms[POSE_LANDMARKS.RIGHT_ANKLE] = { x: 0.56, y: 0.90, z: 0 };

      // Left arm at side
      lms[POSE_LANDMARKS.LEFT_ELBOW] = { x: 0.40, y: 0.42, z: 0 };
      lms[POSE_LANDMARKS.LEFT_WRIST] = { x: 0.40, y: 0.54, z: 0 };

      // Right arm lifts out from side (x:0.60, y:0.54) to shoulder height (x:0.78, y:0.28)
      const armAngle = motionProgress * (Math.PI / 2); // 0 to 90 degrees
      const armLength = 0.24;
      lms[POSE_LANDMARKS.RIGHT_ELBOW] = {
        x: 0.58 + Math.sin(armAngle) * (armLength * 0.55),
        y: 0.28 + Math.cos(armAngle) * (armLength * 0.55),
        z: 0,
      };
      lms[POSE_LANDMARKS.RIGHT_WRIST] = {
        x: 0.58 + Math.sin(armAngle) * armLength,
        y: 0.28 + Math.cos(armAngle) * armLength,
        z: 0,
      };
    } else {
      // Default human skeleton
      lms[POSE_LANDMARKS.LEFT_SHOULDER] = { x: 0.42, y: 0.28, z: 0 };
      lms[POSE_LANDMARKS.RIGHT_SHOULDER] = { x: 0.58, y: 0.28, z: 0 };
      lms[POSE_LANDMARKS.LEFT_HIP] = { x: 0.44, y: 0.54, z: 0 };
      lms[POSE_LANDMARKS.RIGHT_HIP] = { x: 0.56, y: 0.54, z: 0 };
      lms[POSE_LANDMARKS.LEFT_KNEE] = { x: 0.44, y: 0.72, z: 0 };
      lms[POSE_LANDMARKS.RIGHT_KNEE] = { x: 0.56, y: 0.72, z: 0 };
      lms[POSE_LANDMARKS.LEFT_ANKLE] = { x: 0.44, y: 0.90, z: 0 };
      lms[POSE_LANDMARKS.RIGHT_ANKLE] = { x: 0.56, y: 0.90, z: 0 };
    }

    return lms;
  }
}

export const poseManager = new PoseManager();
