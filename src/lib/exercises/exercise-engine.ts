// REHAB-AI Master Exercise Analysis Engine
// Connects normalized PoseFrame telemetry to deterministic angle calculation,
// finite-state repetition tracking, and real-time coaching feedback.

import {
  ExerciseDefinition,
  RepetitionPhase,
  RepetitionResult,
} from '@/types/exercises';
import { PoseFrame } from '@/types/pose';
import { calculateExerciseAngles, CalculatedExerciseMetrics } from './angle-calculator';
import { RepetitionDetector } from './repetition-detector';
import { generateMovementFeedback } from './feedback-engine';
import { areLandmarksConfident } from '@/lib/pose/confidence';

export interface ExerciseEngineUpdate {
  currentAngle: number;
  currentPhase: RepetitionPhase;
  feedbackBanner: string;
  completedReps: number;
  incompleteReps: number;
  newRepResult: RepetitionResult | null;
  metrics: CalculatedExerciseMetrics | null;
  isTrackingValid: boolean;
  trackingMessage?: string;
}

export interface SessionSummaryMetrics {
  totalReps: number;
  successfulReps: number;
  incompleteReps: number;
  averageAngle: number;
  minimumAngle: number;
  maximumAngle: number;
  averageRepDuration: number;
  qualityScore: number;
  repetitionHistory: RepetitionResult[];
}

export class ExerciseEngine {
  private exercise: ExerciseDefinition;
  private repetitionDetector: RepetitionDetector;
  private repetitionHistory: RepetitionResult[] = [];

  // Telemetry accumulation
  private angleSamples: number[] = [];
  private currentAngle: number = 0;
  private currentPhase: RepetitionPhase = 'REST';
  private latestFeedback: string = '';

  constructor(exercise: ExerciseDefinition) {
    this.exercise = exercise;
    this.repetitionDetector = new RepetitionDetector(exercise);
    this.currentAngle = exercise.repetitionLogic.startAngle;
  }

  public reset() {
    this.repetitionDetector.reset();
    this.repetitionHistory = [];
    this.angleSamples = [];
    this.currentAngle = this.exercise.repetitionLogic.startAngle;
    this.currentPhase = 'REST';
    this.latestFeedback = '';
  }

  /**
   * Processes a single PoseFrame deterministically.
   */
  public processFrame(frame: PoseFrame): ExerciseEngineUpdate {
    // 1. Safety Check: Verify required landmarks are visible with sufficient confidence
    const hasRequired = areLandmarksConfident(
      frame.landmarks,
      this.exercise.requiredLandmarks,
      0.4
    );

    if (!hasRequired) {
      return {
        currentAngle: this.currentAngle,
        currentPhase: this.currentPhase,
        feedbackBanner: 'Tracking paused — please ensure your exercise limb is clearly visible.',
        completedReps: this.repetitionDetector.getSnapshot().totalCompletedReps,
        incompleteReps: this.repetitionDetector.getSnapshot().totalIncompleteReps,
        newRepResult: null,
        metrics: null,
        isTrackingValid: false,
        trackingMessage: 'Required joint landmarks are not clearly visible.',
      };
    }

    // 2. Compute Biomechanical Angles
    const metrics = calculateExerciseAngles(this.exercise, frame.landmarks);
    if (!metrics) {
      return {
        currentAngle: this.currentAngle,
        currentPhase: this.currentPhase,
        feedbackBanner: 'Adjust posture in front of the camera.',
        completedReps: this.repetitionDetector.getSnapshot().totalCompletedReps,
        incompleteReps: this.repetitionDetector.getSnapshot().totalIncompleteReps,
        newRepResult: null,
        metrics: null,
        isTrackingValid: false,
      };
    }

    this.currentAngle = metrics.primaryJointAngle;
    this.angleSamples.push(this.currentAngle);

    // 3. Update Repetition State Machine
    const repResult = this.repetitionDetector.update(this.currentAngle, frame.timestamp);
    if (repResult) {
      this.repetitionHistory.push(repResult);
    }

    const snapshot = this.repetitionDetector.getSnapshot();
    this.currentPhase = snapshot.phase;

    // 4. Generate Deterministic Movement Feedback
    const repDuration = snapshot.repStartTime
      ? (frame.timestamp - snapshot.repStartTime) / 1000
      : undefined;

    this.latestFeedback = generateMovementFeedback(
      this.exercise,
      metrics,
      this.currentPhase,
      repDuration
    );

    return {
      currentAngle: this.currentAngle,
      currentPhase: this.currentPhase,
      feedbackBanner: this.latestFeedback,
      completedReps: snapshot.totalCompletedReps,
      incompleteReps: snapshot.totalIncompleteReps,
      newRepResult: repResult,
      metrics,
      isTrackingValid: true,
    };
  }

  /**
   * Compiles final structured session metrics for database persistence.
   */
  public compileSessionSummary(): SessionSummaryMetrics {
    const totalCompleted = this.repetitionDetector.getSnapshot().totalCompletedReps;
    const totalIncomplete = this.repetitionDetector.getSnapshot().totalIncompleteReps;
    const totalReps = totalCompleted + totalIncomplete;

    let averageAngle = 0;
    let minAngle = 0;
    let maxAngle = 0;

    if (this.angleSamples.length > 0) {
      const sum = this.angleSamples.reduce((acc, v) => acc + v, 0);
      averageAngle = Math.round((sum / this.angleSamples.length) * 10) / 10;
      minAngle = Math.round(Math.min(...this.angleSamples) * 10) / 10;
      maxAngle = Math.round(Math.max(...this.angleSamples) * 10) / 10;
    }

    let averageRepDuration = 0;
    if (this.repetitionHistory.length > 0) {
      const durationSum = this.repetitionHistory.reduce((acc, r) => acc + r.duration, 0);
      averageRepDuration = Math.round((durationSum / this.repetitionHistory.length) * 10) / 10;
    }

    // Quality Score Calculation (0 - 100):
    // 60% completion ratio + 40% range adherence
    let qualityScore = 0;
    if (totalReps > 0) {
      const completionRatio = totalCompleted / totalReps;
      qualityScore = Math.round(completionRatio * 80 + 20);
    } else {
      qualityScore = 100;
    }

    return {
      totalReps,
      successfulReps: totalCompleted,
      incompleteReps: totalIncomplete,
      averageAngle,
      minimumAngle: minAngle,
      maximumAngle: maxAngle,
      averageRepDuration,
      qualityScore: Math.min(100, Math.max(0, qualityScore)),
      repetitionHistory: [...this.repetitionHistory],
    };
  }
}
