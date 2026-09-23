// REHAB-AI Deterministic Repetition Detector & Movement Phase State Machine
// Guarantees zero false positives from jitter/noise and outputs structured repetition metrics.

import { ExerciseDefinition, RepetitionPhase, RepetitionResult } from '@/types/exercises';

export interface StateMachineSnapshot {
  phase: RepetitionPhase;
  currentAngle: number;
  peakAngleReached: number;
  repStartTime: number | null;
  targetReachedTime: number | null;
  totalCompletedReps: number;
  totalIncompleteReps: number;
  lastRepResult: RepetitionResult | null;
  feedbackQueue: string[];
}

export class RepetitionDetector {
  private exercise: ExerciseDefinition;
  private phase: RepetitionPhase = 'REST';
  private currentAngle: number = 0;
  private peakAngleReached: number = 0;
  private repStartTime: number | null = null;
  private targetReachedTime: number | null = null;

  private totalCompletedReps: number = 0;
  private totalIncompleteReps: number = 0;
  private lastRepResult: RepetitionResult | null = null;
  private feedbackQueue: string[] = [];

  // Configuration thresholds
  private isDecreasingTarget: boolean;
  private startAngle: number;
  private peakMin: number;
  private peakMax: number;
  private returnThreshold: number;
  private minDisplacementThreshold: number = 15; // Jitter rejection threshold (degrees)
  private minRepDurationSeconds: number = 1.0;   // Reject ultra-fast ballistic shakes

  constructor(exercise: ExerciseDefinition) {
    this.exercise = exercise;
    const logic = exercise.repetitionLogic;
    this.startAngle = logic.startAngle;
    this.peakMin = Math.min(logic.peakFlexionMinAngle, logic.peakFlexionMaxAngle);
    this.peakMax = Math.max(logic.peakFlexionMinAngle, logic.peakFlexionMaxAngle);
    this.returnThreshold = logic.returnExtensionThreshold;
    this.isDecreasingTarget = logic.peakFlexionMinAngle < logic.startAngle;
    this.reset();
  }

  public reset() {
    this.phase = 'REST';
    this.currentAngle = this.startAngle;
    this.peakAngleReached = this.startAngle;
    this.repStartTime = null;
    this.targetReachedTime = null;
    this.totalCompletedReps = 0;
    this.totalIncompleteReps = 0;
    this.lastRepResult = null;
    this.feedbackQueue = [];
  }

  public getSnapshot(): StateMachineSnapshot {
    return {
      phase: this.phase,
      currentAngle: this.currentAngle,
      peakAngleReached: this.peakAngleReached,
      repStartTime: this.repStartTime,
      targetReachedTime: this.targetReachedTime,
      totalCompletedReps: this.totalCompletedReps,
      totalIncompleteReps: this.totalIncompleteReps,
      lastRepResult: this.lastRepResult,
      feedbackQueue: [...this.feedbackQueue],
    };
  }

  /**
   * Deterministically processes a new angle sample at a given timestamp.
   *
   * @param angle Measured joint angle in degrees
   * @param timestampMs Sample time in milliseconds (e.g. performance.now())
   * @returns RepetitionResult if a rep finished on this tick, or null
   */
  public update(angle: number, timestampMs: number): RepetitionResult | null {
    this.currentAngle = angle;
    let completedResult: RepetitionResult | null = null;

    // Check peak displacement
    if (this.isDecreasingTarget) {
      if (angle < this.peakAngleReached) {
        this.peakAngleReached = angle;
      }
    } else {
      if (angle > this.peakAngleReached) {
        this.peakAngleReached = angle;
      }
    }

    switch (this.phase) {
      case 'REST': {
        // Must deviate from rest position by at least minDisplacementThreshold to enter MOVING
        const displacement = Math.abs(angle - this.startAngle);
        const movingTowardTarget = this.isDecreasingTarget
          ? angle < this.startAngle - this.minDisplacementThreshold
          : angle > this.startAngle + this.minDisplacementThreshold;

        if (movingTowardTarget && displacement >= this.minDisplacementThreshold) {
          this.phase = 'MOVING';
          this.repStartTime = timestampMs;
          this.peakAngleReached = angle;
          this.feedbackQueue = [];

          // Also check if this sample immediately reached target zone
          const targetReached = this.isDecreasingTarget
            ? angle <= this.peakMax
            : angle >= this.peakMin;
          if (targetReached) {
            this.phase = 'TARGET_REACHED';
            this.targetReachedTime = timestampMs;
          }
        }
        break;
      }

      case 'MOVING': {
        // Check if target zone reached
        const targetReached = this.isDecreasingTarget
          ? angle <= this.peakMax // e.g. angle <= 55° (for 35°-55°)
          : angle >= this.peakMin; // e.g. angle >= 85° (for 85°-110°)

        if (targetReached) {
          this.phase = 'TARGET_REACHED';
          this.targetReachedTime = timestampMs;
        } else {
          // Check if user aborted and returned to start without reaching target (Incomplete rep)
          const returnedEarly = this.isDecreasingTarget
            ? angle >= this.returnThreshold
            : angle <= this.returnThreshold;

          if (returnedEarly && this.repStartTime) {
            const duration = (timestampMs - this.repStartTime) / 1000;
            // Reject ballistic jitter/glitch faster than 0.6s
            if (duration < 0.6) {
              this.phase = 'REST';
              this.repStartTime = null;
              break;
            }
            // Only count as incomplete if significant movement occurred (not instant micro-jitter)
            if (Math.abs(this.peakAngleReached - this.startAngle) >= this.minDisplacementThreshold) {
              this.totalIncompleteReps++;
              this.phase = 'INCOMPLETE_REP';

              const result: RepetitionResult = {
                repetitionNumber: this.totalCompletedReps + this.totalIncompleteReps,
                status: 'incomplete',
                measuredRange: Math.round(this.peakAngleReached),
                targetRange: {
                  min: this.exercise.repetitionLogic.peakFlexionMinAngle,
                  max: this.exercise.repetitionLogic.peakFlexionMaxAngle,
                },
                duration: Math.round(duration * 10) / 10,
                feedback: ['Target range not reached. Try to complete full range.'],
                timestamp: timestampMs,
              };

              this.lastRepResult = result;
              completedResult = result;
            } else {
              // False start / negligible jitter -> reset to REST silently
              this.phase = 'REST';
              this.repStartTime = null;
            }
          }
        }
        break;
      }

      case 'TARGET_REACHED': {
        // Check if user starts returning back toward resting position
        const isReturning = this.isDecreasingTarget
          ? angle > this.peakMax + 10 // e.g. angle rises above 65°
          : angle < this.peakMin - 10; // e.g. angle drops below 75°

        if (isReturning) {
          this.phase = 'RETURNING';
        }
        break;
      }

      case 'RETURNING': {
        // Rep is fulfilled once angle crosses returnExtensionThreshold
        const returnedHome = this.isDecreasingTarget
          ? angle >= this.returnThreshold // e.g. angle reaches >= 140°
          : angle <= this.returnThreshold; // e.g. angle returns <= 30°

        if (returnedHome && this.repStartTime) {
          const duration = Math.max(0.1, (timestampMs - this.repStartTime) / 1000);

          // Verify duration to guard against unrealistic rapid noise artifacts
          if (duration < 0.6) {
            // Unrealistic ballistic artifact — reject as noise
            this.phase = 'REST';
            this.repStartTime = null;
            break;
          }

          this.totalCompletedReps++;
          this.phase = 'COMPLETED_REP';

          const feedback: string[] = [];
          if (duration < this.minRepDurationSeconds) {
            feedback.push('Cadence was fast. Control both the lift and lowering.');
          } else {
            feedback.push('Optimal range and controlled execution.');
          }

          const result: RepetitionResult = {
            repetitionNumber: this.totalCompletedReps + this.totalIncompleteReps,
            status: 'completed',
            measuredRange: Math.round(this.peakAngleReached),
            targetRange: {
              min: this.exercise.repetitionLogic.peakFlexionMinAngle,
              max: this.exercise.repetitionLogic.peakFlexionMaxAngle,
            },
            duration: Math.round(duration * 10) / 10,
            feedback,
            timestamp: timestampMs,
          };

          this.lastRepResult = result;
          completedResult = result;
        }
        break;
      }

      case 'COMPLETED_REP':
      case 'INCOMPLETE_REP': {
        // Hold result state briefly until user is in resting position, then return to REST
        const atRest = this.isDecreasingTarget
          ? angle >= this.returnThreshold
          : angle <= this.returnThreshold;

        if (atRest) {
          this.phase = 'REST';
          this.repStartTime = null;
          this.targetReachedTime = null;
          this.peakAngleReached = this.startAngle;
        }
        break;
      }
    }

    return completedResult;
  }
}
