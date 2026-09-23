// REHAB-AI: Biomechanical Rep Counter & Quality State Machine
import { 
  ExerciseDefinition, 
  RepState, 
  RepTelemetry, 
  Landmark3D, 
  POSE_LANDMARKS 
} from '@/types/rehab';
import { calculateJointAngle, AngleSmoother } from './geometry';

export interface StateMachineCallbacks {
  onStateChange?: (state: RepState, previousState: RepState) => void;
  onRepCompleted?: (telemetry: RepTelemetry) => void;
  onCompensationAlert?: (warning: string, voiceCue: string, severity: string) => void;
  onAngleTick?: (data: {
    currentAngle: number;
    peakAngle: number;
    repState: RepState;
    holdRemainingSeconds: number;
    holdProgressRatio: number;
  }) => void;
}

export class ExerciseStateMachine {
  private exercise: ExerciseDefinition;
  private callbacks: StateMachineCallbacks;
  private smoother: AngleSmoother;

  private state: RepState = 'CALIBRATING';
  private repCounter: number = 0;
  private currentAngle: number = 0;
  private peakAngleInRep: number = 0;
  private repStartTimeMs: number = 0;
  private holdStartTimeMs: number = 0;
  private holdAchievedSeconds: number = 0;
  private compensationsTriggeredInRep: Set<string> = new Set();
  private lastAlertTimestamp: number = 0;

  // Exercise direction: does target angle increase or decrease?
  // e.g. Knee extension: starts at ~95, targets 175 (increasing)
  // e.g. Squat: starts at ~175, targets 95 (decreasing)
  private isIncreasingTarget: boolean;

  constructor(exercise: ExerciseDefinition, callbacks: StateMachineCallbacks = {}) {
    this.exercise = exercise;
    this.callbacks = callbacks;
    this.smoother = new AngleSmoother(0.3);
    this.isIncreasingTarget = exercise.targetAngleMin > exercise.startAngle;
    this.reset();
  }

  public setExercise(exercise: ExerciseDefinition) {
    this.exercise = exercise;
    this.isIncreasingTarget = exercise.targetAngleMin > exercise.startAngle;
    this.reset();
  }

  public reset() {
    this.state = 'CALIBRATING';
    this.repCounter = 0;
    this.currentAngle = 0;
    this.peakAngleInRep = this.isIncreasingTarget ? 0 : 360;
    this.repStartTimeMs = 0;
    this.holdStartTimeMs = 0;
    this.holdAchievedSeconds = 0;
    this.compensationsTriggeredInRep.clear();
    this.smoother.reset();
  }

  public getRepCount(): number {
    return this.repCounter;
  }

  public getState(): RepState {
    return this.state;
  }

  private transition(newState: RepState) {
    if (this.state !== newState) {
      const prev = this.state;
      this.state = newState;
      this.callbacks.onStateChange?.(newState, prev);
    }
  }

  /**
   * Process incoming frame landmarks
   */
  public processFrame(landmarks: Landmark3D[]): {
    currentAngle: number;
    repState: RepState;
    repCount: number;
    holdRemainingSeconds: number;
  } {
    if (!landmarks || landmarks.length < 33) {
      this.transition('CALIBRATING');
      return {
        currentAngle: 0,
        repState: this.state,
        repCount: this.repCounter,
        holdRemainingSeconds: this.exercise.holdDurationSeconds,
      };
    }

    // 1. Calculate Primary Joint Angle
    const rawAngle = this.extractTargetJointAngle(landmarks);
    this.currentAngle = this.smoother.update(rawAngle);

    // 2. Evaluate Compensations
    this.evaluateCompensations(landmarks);

    const now = Date.now();

    // 3. State Machine Transitions
    const startThreshold = 20; // margin around starting angle
    const isAtStart = Math.abs(this.currentAngle - this.exercise.startAngle) <= startThreshold;

    const isInTargetZone = this.isIncreasingTarget
      ? this.currentAngle >= this.exercise.targetAngleMin
      : this.currentAngle <= this.exercise.targetAngleMin;

    // Track peak angle achieved during this rep
    if (this.state !== 'CALIBRATING' && this.state !== 'START_POSITION') {
      if (this.isIncreasingTarget) {
        if (this.currentAngle > this.peakAngleInRep) this.peakAngleInRep = this.currentAngle;
      } else {
        if (this.currentAngle < this.peakAngleInRep) this.peakAngleInRep = this.currentAngle;
      }
    }

    let holdRemaining = this.exercise.holdDurationSeconds;
    let holdRatio = 0;

    switch (this.state) {
      case 'CALIBRATING':
        if (isAtStart) {
          this.transition('START_POSITION');
        }
        break;

      case 'START_POSITION':
        // If movement starts towards target
        const hasMovedAway = this.isIncreasingTarget
          ? this.currentAngle > this.exercise.startAngle + 12
          : this.currentAngle < this.exercise.startAngle - 12;

        if (hasMovedAway) {
          this.repStartTimeMs = now;
          this.peakAngleInRep = this.currentAngle;
          this.compensationsTriggeredInRep.clear();
          this.holdAchievedSeconds = 0;
          this.transition('IN_MOTION');
        }
        break;

      case 'IN_MOTION':
        if (isInTargetZone) {
          this.holdStartTimeMs = now;
          this.transition('HOLDING_PEAK');
        } else if (isAtStart && (now - this.repStartTimeMs > 800)) {
          // Returned before reaching target without holding
          this.transition('START_POSITION');
        }
        break;

      case 'HOLDING_PEAK':
        if (isInTargetZone) {
          const elapsedSec = (now - this.holdStartTimeMs) / 1000;
          this.holdAchievedSeconds = elapsedSec;
          holdRemaining = Math.max(0, this.exercise.holdDurationSeconds - elapsedSec);
          holdRatio = Math.min(1, elapsedSec / (this.exercise.holdDurationSeconds || 1));

          if (elapsedSec >= this.exercise.holdDurationSeconds) {
            this.transition('RETURNING');
          }
        } else {
          // Slipped out of target zone during hold
          const required = this.exercise.holdDurationSeconds;
          if (this.holdAchievedSeconds < required * 0.7) {
            // Drop back to in_motion
            this.transition('IN_MOTION');
          } else {
            this.transition('RETURNING');
          }
        }
        break;

      case 'RETURNING':
        if (isAtStart) {
          // Rep successfully completed!
          this.repCounter += 1;
          const repDuration = now - this.repStartTimeMs;

          // Compute form score
          let score = 100;
          if (this.compensationsTriggeredInRep.size > 0) {
            score -= this.compensationsTriggeredInRep.size * 15;
          }
          if (this.holdAchievedSeconds < this.exercise.holdDurationSeconds) {
            score -= 10;
          }
          score = Math.max(20, Math.min(100, score));

          const telemetry: RepTelemetry = {
            repNumber: this.repCounter,
            peakAngle: this.peakAngleInRep,
            targetAngleMin: this.exercise.targetAngleMin,
            holdDurationAchieved: parseFloat(this.holdAchievedSeconds.toFixed(1)),
            targetHoldDuration: this.exercise.holdDurationSeconds,
            passed: score >= 65,
            score,
            compensationsDetected: Array.from(this.compensationsTriggeredInRep),
            durationMs: repDuration,
            timestamp: new Date().toISOString(),
          };

          this.callbacks.onRepCompleted?.(telemetry);
          this.transition('START_POSITION');
        }
        break;
    }

    this.callbacks.onAngleTick?.({
      currentAngle: this.currentAngle,
      peakAngle: this.peakAngleInRep,
      repState: this.state,
      holdRemainingSeconds: parseFloat(holdRemaining.toFixed(1)),
      holdProgressRatio: holdRatio,
    });

    return {
      currentAngle: this.currentAngle,
      repState: this.state,
      repCount: this.repCounter,
      holdRemainingSeconds: holdRemaining,
    };
  }

  private extractTargetJointAngle(landmarks: Landmark3D[]): number {
    const side = this.exercise.targetSide;
    const isRight = side === 'right';

    switch (this.exercise.targetJoint) {
      case 'left_knee':
      case 'right_knee': {
        const hip = landmarks[isRight ? POSE_LANDMARKS.RIGHT_HIP : POSE_LANDMARKS.LEFT_HIP];
        const knee = landmarks[isRight ? POSE_LANDMARKS.RIGHT_KNEE : POSE_LANDMARKS.LEFT_KNEE];
        const ankle = landmarks[isRight ? POSE_LANDMARKS.RIGHT_ANKLE : POSE_LANDMARKS.LEFT_ANKLE];
        return calculateJointAngle(hip, knee, ankle);
      }
      case 'left_shoulder':
      case 'right_shoulder': {
        const hip = landmarks[isRight ? POSE_LANDMARKS.RIGHT_HIP : POSE_LANDMARKS.LEFT_HIP];
        const shoulder = landmarks[isRight ? POSE_LANDMARKS.RIGHT_SHOULDER : POSE_LANDMARKS.LEFT_SHOULDER];
        const elbow = landmarks[isRight ? POSE_LANDMARKS.RIGHT_ELBOW : POSE_LANDMARKS.LEFT_ELBOW];
        return calculateJointAngle(hip, shoulder, elbow);
      }
      case 'left_hip':
      case 'right_hip': {
        const shoulder = landmarks[isRight ? POSE_LANDMARKS.RIGHT_SHOULDER : POSE_LANDMARKS.LEFT_SHOULDER];
        const hip = landmarks[isRight ? POSE_LANDMARKS.RIGHT_HIP : POSE_LANDMARKS.LEFT_HIP];
        const knee = landmarks[isRight ? POSE_LANDMARKS.RIGHT_KNEE : POSE_LANDMARKS.LEFT_KNEE];
        return calculateJointAngle(shoulder, hip, knee);
      }
      default:
        return 90;
    }
  }

  private evaluateCompensations(landmarks: Landmark3D[]) {
    if (this.state === 'CALIBRATING' || this.state === 'START_POSITION') return;

    const now = Date.now();
    for (const comp of this.exercise.compensations) {
      const result = comp.evaluate(landmarks, this.exercise.targetSide);
      if (result.isTriggered) {
        this.compensationsTriggeredInRep.add(comp.name);
        
        // Rate limit alerts to once every 3.5 seconds
        if (now - this.lastAlertTimestamp > 3500) {
          this.lastAlertTimestamp = now;
          this.callbacks.onCompensationAlert?.(
            comp.feedbackWarning,
            comp.voiceCue,
            comp.severity
          );
        }
      }
    }
  }
}
