'use client';

import React, { useEffect, useRef, useState, use, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  Activity,
  ShieldAlert,
  Save,
  Check,
  Award,
  Clock,
  HeartPulse,
} from 'lucide-react';
import confetti from 'canvas-confetti';

import { getSeededExercise } from '@/lib/exercises/definitions';
import { ExerciseEngine, SessionSummaryMetrics } from '@/lib/exercises/exercise-engine';
import { PoseEngine } from '@/lib/pose/pose-engine';
import { CameraView } from '@/components/camera/CameraView';
import { CameraSetup } from '@/components/camera/CameraSetup';
import { PoseCanvas } from '@/components/pose/PoseCanvas';
import { PoseOverlay } from '@/components/pose/PoseOverlay';
import { PoseStatus } from '@/components/pose/PoseStatus';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import {
  startSession,
  completeSession,
  recordSessionMetrics,
  submitPatientFeedback,
} from '@/lib/services/rehab-service';
import { LiveSessionState, RepetitionPhase, RepetitionResult } from '@/types/exercises';
import { CameraReadinessState, DeveloperDebugInfo, PoseFrame, TrackingQualityLevel } from '@/types/pose';
import { useAuth } from '@/lib/auth/auth-context';

export default function LiveExerciseSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user } = useAuth();

  const exercise = getSeededExercise(resolvedParams.id);
  const targetReps = 10; // Prescribed protocol target

  // Clinical State Machine
  const [sessionState, setSessionState] = useState<LiveSessionState>('preparation');
  const [readinessState, setReadinessState] = useState<CameraReadinessState>({
    isCameraConnected: false,
    isLightingSufficient: false,
    areRequiredLandmarksVisible: false,
    isPoseConfidenceSufficient: false,
    isPatientPositionedCorrectly: false,
    friendlyMessage: 'Initializing camera...',
    isReadyToAnalyze: false,
  });

  // Countdown timer
  const [countdown, setCountdown] = useState<number>(3);

  // Active Session Telemetry
  const [currentFrame, setCurrentFrame] = useState<PoseFrame | null>(null);
  const [currentAngle, setCurrentAngle] = useState<number>(exercise?.repetitionLogic.startAngle ?? 0);
  const [currentPhase, setCurrentPhase] = useState<RepetitionPhase>('REST');
  const [completedReps, setCompletedReps] = useState<number>(0);
  const [incompleteReps, setIncompleteReps] = useState<number>(0);
  const [feedbackBanner, setFeedbackBanner] = useState<string>('');
  const [trackingQuality, setTrackingQuality] = useState<TrackingQualityLevel>('uncalibrated');
  const [debugInfo, setDebugInfo] = useState<DeveloperDebugInfo | undefined>(undefined);

  // Database Session ID & Summary
  const [dbSessionId, setDbSessionId] = useState<string | null>(null);
  const [sessionSummary, setSessionSummary] = useState<SessionSummaryMetrics | null>(null);
  const [sessionDurationSeconds, setSessionDurationSeconds] = useState<number>(0);
  const sessionStartTimeRef = useRef<number | null>(null);

  // Patient Post-Session Feedback
  const [painLevel, setPainLevel] = useState<number>(0); // VAS 0-10
  const [fatigueLevel, setFatigueLevel] = useState<number>(3); // Borg 1-10
  const [patientComment, setPatientComment] = useState<string>('');
  const [isSavingRecord, setIsSavingRecord] = useState(false);
  const [isSavedSuccessfully, setIsSavedSuccessfully] = useState(false);

  // Engine references
  const exerciseEngineRef = useRef<ExerciseEngine | null>(null);
  const poseEngineRef = useRef<PoseEngine | null>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);

  // Instantiate Exercise Engine
  useEffect(() => {
    if (exercise) {
      exerciseEngineRef.current = new ExerciseEngine(exercise);
    }
  }, [exercise]);

  // Duration tracker interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (sessionState === 'active_session') {
      interval = setInterval(() => {
        if (sessionStartTimeRef.current) {
          setSessionDurationSeconds(
            Math.round((Date.now() - sessionStartTimeRef.current) / 1000)
          );
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [sessionState]);

  // Countdown handler
  useEffect(() => {
    if (sessionState === 'countdown') {
      if (countdown > 1) {
        const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => {
          sessionStartTimeRef.current = Date.now();
          setSessionState('active_session');
          // Start DB session in background
          if (exercise) {
            startSession({
              patientId: user?.id || 'demo-patient',
              exerciseId: exercise.id,
              trackingQuality: 'high',
            }).then((sess) => setDbSessionId(sess.id)).catch(() => {});
          }
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [sessionState, countdown, exercise, user]);

  // Pose processing loop
  const handlePoseFrame = useCallback(
    (frame: PoseFrame) => {
      setCurrentFrame(frame);

      // Track quality badge
      if (frame.overallConfidence >= 0.75) setTrackingQuality('high');
      else if (frame.overallConfidence >= 0.5) setTrackingQuality('medium');
      else setTrackingQuality('low');

      if (!exerciseEngineRef.current || sessionState !== 'active_session') {
        return;
      }

      const update = exerciseEngineRef.current.processFrame(frame);

      if (!update.isTrackingValid) {
        setSessionState('tracking_unavailable');
        setFeedbackBanner(update.feedbackBanner);
        return;
      }

      setCurrentAngle(update.currentAngle);
      setCurrentPhase(update.currentPhase);
      setFeedbackBanner(update.feedbackBanner);
      setCompletedReps(update.completedReps);
      setIncompleteReps(update.incompleteReps);

      // Update pose engine with tracked joint angle for debug telemetry
      if (poseEngineRef.current) {
        poseEngineRef.current.updateTrackedAngle(
          exercise?.repetitionLogic.targetJointName || 'joint',
          update.currentAngle
        );
        setDebugInfo(poseEngineRef.current.getDebugInfo(update.currentPhase, frame.landmarks));
      }

      // Check if target repetitions completed!
      if (update.completedReps >= targetReps) {
        handleCompleteSession();
      }
    },
    [sessionState, exercise, targetReps]
  );

  // Resume tracking if recovered from tracking_unavailable
  useEffect(() => {
    if (sessionState === 'tracking_unavailable' && readinessState.isReadyToAnalyze) {
      setSessionState('active_session');
    }
  }, [sessionState, readinessState.isReadyToAnalyze]);

  // Video ready callback from CameraView
  const handleVideoReady = useCallback(
    (video: HTMLVideoElement) => {
      videoElementRef.current = video;

      if (!poseEngineRef.current && exercise) {
        const pe = new PoseEngine({
          requiredLandmarks: exercise.requiredLandmarks,
          onFrame: handlePoseFrame,
          onReadinessChange: (st) => setReadinessState(st),
        });

        poseEngineRef.current = pe;
        pe.initializeMediaPipe().then(() => {
          pe.start(video);
        });
      }
    },
    [exercise, handlePoseFrame]
  );

  // Clean up PoseEngine on unmount
  useEffect(() => {
    return () => {
      if (poseEngineRef.current) {
        poseEngineRef.current.stop();
        poseEngineRef.current = null;
      }
    };
  }, []);

  const handleStartCountdown = () => {
    setCountdown(3);
    setSessionState('countdown');
  };

  const handleTogglePause = () => {
    if (sessionState === 'active_session') {
      setSessionState('paused');
    } else if (sessionState === 'paused') {
      setSessionState('active_session');
    }
  };

  const handleReportDiscomfort = () => {
    setSessionState('pain_reported');
  };

  const handleCompleteSession = () => {
    if (exerciseEngineRef.current) {
      const summary = exerciseEngineRef.current.compileSessionSummary();
      setSessionSummary(summary);
    }
    setSessionState('session_completed');
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {}
  };

  const handleSaveAndExit = async () => {
    if (!sessionSummary) return;
    setIsSavingRecord(true);

    try {
      const sid = dbSessionId || `sess-${Date.now()}`;

      await completeSession(sid, {
        repetitions: sessionSummary.totalReps,
        successfulRepetitions: sessionSummary.successfulReps,
        incompleteRepetitions: sessionSummary.incompleteReps,
        durationSeconds: sessionDurationSeconds,
        qualityScore: sessionSummary.qualityScore,
        trackingQuality: trackingQuality,
        status: 'completed',
      });

      await recordSessionMetrics({
        sessionId: sid,
        averageAngle: sessionSummary.averageAngle,
        minimumAngle: sessionSummary.minimumAngle,
        maximumAngle: sessionSummary.maximumAngle,
        averageRepDuration: sessionSummary.averageRepDuration,
        successfulReps: sessionSummary.successfulReps,
        incompleteReps: sessionSummary.incompleteReps,
      });

      await submitPatientFeedback({
        sessionId: sid,
        painLevel: painLevel,
        fatigueLevel: fatigueLevel,
        patientComment: patientComment.trim() || undefined,
      });

      setIsSavedSuccessfully(true);
      setTimeout(() => {
        router.push('/patient/dashboard');
      }, 1500);
    } catch (err) {
      console.error('Failed to save session:', err);
      // Still allow returning to dashboard
      router.push('/patient/dashboard');
    } finally {
      setIsSavingRecord(false);
    }
  };

  if (!exercise) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <Alert variant="destructive" title="Exercise Not Found">
          The requested exercise protocol was not found or is unconfigured.
        </Alert>
        <Link href="/patient/exercises" className="inline-block mt-4">
          <Button>Return to Exercises</Button>
        </Link>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: State 1: Preparation
  // -------------------------------------------------------------
  if (sessionState === 'preparation') {
    return (
      <div className="max-w-3xl mx-auto py-6 space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/patient/exercises">
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="capitalize">
                {exercise.bodyPart.replace('_', ' ')}
              </Badge>
              <Badge variant="neutral" className="capitalize">
                {exercise.difficulty}
              </Badge>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
              {exercise.name}
            </h1>
          </div>
        </div>

        {/* Prototype Disclaimer */}
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
          <div>
            <div className="font-semibold mb-0.5">Prototype Clinical Protocol</div>
            <div>{exercise.prototypeDisclaimer}</div>
          </div>
        </div>

        {/* Exercise Overview Card */}
        <Card>
          <CardHeader>
            <CardTitle>Session Goals & Biomechanical Targets</CardTitle>
            <CardDescription>{exercise.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-xs text-slate-400 block">Target Repetitions</span>
                <span className="text-xl font-bold text-white">{targetReps} reps</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-xs text-slate-400 block">Target Angle Range</span>
                <span className="text-xl font-bold text-emerald-400">
                  {exercise.repetitionLogic.peakFlexionMinAngle}° – {exercise.repetitionLogic.peakFlexionMaxAngle}°
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-xs text-slate-400 block">Target Cadence</span>
                <span className="text-xl font-bold text-blue-400">
                  ~{exercise.repetitionLogic.cadenceSecondsPerRep || 4}s / rep
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800 text-xs text-slate-300">
              <div className="font-semibold text-white">Starting Posture:</div>
              <p className="text-slate-400">{exercise.startingCondition.postureDescription}</p>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="font-semibold text-white">Safety Guidance:</div>
              <p className="text-slate-400">{exercise.safetyNotes}</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Link href="/patient/exercises">
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button onClick={() => setSessionState('camera_setup')} className="gap-2 px-6">
            <span>Proceed to Camera Setup</span>
            <Sparkles className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: State 9: Session Completed
  // -------------------------------------------------------------
  if (sessionState === 'session_completed') {
    return (
      <div className="max-w-2xl mx-auto py-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto ring-8 ring-emerald-500/5">
            <Award className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Session Completed!</h1>
          <p className="text-sm text-slate-400">
            Great job! Your movement metrics were analyzed locally and are ready to save.
          </p>
        </div>

        {/* Metrics Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Biomechanical Performance Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Completed Reps</span>
                <span className="text-2xl font-bold text-emerald-400">
                  {sessionSummary?.successfulReps ?? completedReps}
                </span>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Incomplete Reps</span>
                <span className="text-2xl font-bold text-amber-400">
                  {sessionSummary?.incompleteReps ?? incompleteReps}
                </span>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Avg Duration</span>
                <span className="text-2xl font-bold text-blue-400">
                  {sessionSummary?.averageRepDuration || 0}s
                </span>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Quality Score</span>
                <span className="text-2xl font-bold text-purple-400">
                  {sessionSummary?.qualityScore || 95}%
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs flex justify-between items-center text-slate-300">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span>Total Elapsed Session Time:</span>
              </div>
              <span className="font-mono font-bold text-white">
                {Math.floor(sessionDurationSeconds / 60)}m {sessionDurationSeconds % 60}s
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Patient Feedback & Pain Rating */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-rose-400" />
              Patient Discomfort & Effort Feedback
            </CardTitle>
            <CardDescription>
              Record your physical response to help your physical therapist fine-tune your protocol.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
                <span className="text-slate-300">Pain Level (VAS 0 – 10):</span>
                <span className="text-white font-bold">{painLevel} / 10 {painLevel === 0 ? '(No Pain)' : painLevel > 5 ? '(Moderate/High)' : '(Mild)'}</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={painLevel}
                onChange={(e) => setPainLevel(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>0 (None)</span>
                <span>5 (Moderate)</span>
                <span>10 (Severe)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
                <span className="text-slate-300">Perceived Exertion (Borg 1 – 10):</span>
                <span className="text-white font-bold">{fatigueLevel} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={fatigueLevel}
                onChange={(e) => setFatigueLevel(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1 font-medium">
                Optional Patient Notes / Symptoms:
              </label>
              <textarea
                value={patientComment}
                onChange={(e) => setPatientComment(e.target.value)}
                placeholder="E.g. Slight stiffness at peak extension, felt smooth otherwise."
                rows={2}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <Button
              onClick={handleSaveAndExit}
              disabled={isSavingRecord || isSavedSuccessfully}
              className="w-full gap-2 mt-2"
              size="lg"
            >
              {isSavedSuccessfully ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Saved to Health Record! Redirecting...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isSavingRecord ? 'Saving Session...' : 'Save Session to Clinical Record'}</span>
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: State 8: Pain Reported Modal / Screen
  // -------------------------------------------------------------
  if (sessionState === 'pain_reported') {
    return (
      <div className="max-w-lg mx-auto py-12 px-4 space-y-6">
        <div className="p-6 bg-rose-950/40 border border-rose-800/60 rounded-2xl shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold text-white">Discomfort or Pain Flagged</h2>

          <p className="text-xs text-rose-200/90 leading-relaxed text-left bg-rose-950/60 p-3.5 rounded-xl border border-rose-900/50">
            <strong>Clinical Safety Escalation:</strong> If you experience sharp, catching, radiating,
            or acute pain, do not push through the movement. Rest the joint and notify your
            treating physiotherapist.
          </p>

          <div className="text-left space-y-2">
            <span className="text-xs text-slate-300 font-medium">Rate the pain you experienced (0–10):</span>
            <div className="flex gap-1.5 justify-between">
              {[0, 2, 4, 6, 8, 10].map((level) => (
                <button
                  key={level}
                  onClick={() => setPainLevel(level)}
                  className={`flex-1 py-2 text-xs rounded-lg font-bold border transition-colors ${
                    painLevel === level
                      ? 'bg-rose-600 text-white border-rose-400'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setSessionState('active_session')}
              className="flex-1 text-xs"
            >
              Resume Exercise
            </Button>
            <Button
              variant="destructive"
              onClick={handleCompleteSession}
              className="flex-1 text-xs gap-1.5"
            >
              End Session & Log Report
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: States 2 to 7 (Camera Setup, Ready, Countdown, Active, Paused, Tracking Unavailable)
  // -------------------------------------------------------------
  return (
    <div className="max-w-5xl mx-auto py-4 space-y-4">
      {/* Session Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/patient/exercises">
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">{exercise.name}</h2>
              <PoseStatus quality={trackingQuality} />
            </div>
            <p className="text-xs text-slate-400">
              Camera: {exercise.cameraView.replace('_', ' ')} · Target {targetReps} reps
            </p>
          </div>
        </div>

        {(sessionState === 'active_session' || sessionState === 'paused') && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleCompleteSession}
            className="text-xs"
          >
            Finish Early
          </Button>
        )}
      </div>

      {/* Main Camera + Pose View */}
      <div className="relative w-full aspect-video">
        <CameraView
          readinessState={readinessState}
          onVideoReady={handleVideoReady}
        >
          {/* Pose Skeletal Canvas Overlay */}
          <PoseCanvas
            frame={currentFrame}
            activeJointName={exercise.repetitionLogic.targetJointName}
            currentAngle={currentAngle}
            targetRange={{
              min: exercise.repetitionLogic.peakFlexionMinAngle,
              max: exercise.repetitionLogic.peakFlexionMaxAngle,
            }}
          />

          {/* Active HUD Overlay */}
          {(sessionState === 'active_session' || sessionState === 'paused') && (
            <PoseOverlay
              exerciseName={exercise.name}
              targetJointName={exercise.repetitionLogic.targetJointName}
              currentAngle={currentAngle}
              targetRange={{
                min: exercise.repetitionLogic.peakFlexionMinAngle,
                max: exercise.repetitionLogic.peakFlexionMaxAngle,
              }}
              currentReps={completedReps}
              targetReps={targetReps}
              currentPhase={currentPhase}
              feedbackBanner={feedbackBanner}
              debugInfo={debugInfo}
              isPaused={sessionState === 'paused'}
              onTogglePause={handleTogglePause}
              onReportPain={handleReportDiscomfort}
            />
          )}

          {/* Paused Overlay */}
          {sessionState === 'paused' && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30 pointer-events-auto">
              <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3">
                <Pause className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Session Paused</h3>
              <p className="text-xs text-slate-400 max-w-sm mb-6">
                Take a breath. When you are ready to continue your exercise, click resume.
              </p>
              <div className="flex gap-3">
                <Button onClick={handleTogglePause} className="gap-2 px-6">
                  <Play className="w-4 h-4" />
                  <span>Resume Exercise</span>
                </Button>
                <Button variant="outline" onClick={handleCompleteSession}>
                  End Session
                </Button>
              </div>
            </div>
          )}

          {/* Tracking Unavailable Overlay */}
          {sessionState === 'tracking_unavailable' && (
            <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-30 pointer-events-auto">
              <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3 animate-pulse">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Tracking Paused</h3>
              <p className="text-xs text-slate-300 max-w-sm mb-4">
                {feedbackBanner || 'Your exercising limbs are outside the camera frame or occluded. Please adjust your posture.'}
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-400">
                <Activity className="w-3.5 h-3.5 text-primary animate-spin" />
                <span>Waiting for landmarks to return...</span>
              </div>
            </div>
          )}

          {/* Countdown Overlay */}
          {sessionState === 'countdown' && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center z-30 pointer-events-none">
              <div className="text-7xl font-black text-white tracking-widest animate-in zoom-in-75 duration-300">
                {countdown}
              </div>
              <p className="text-sm font-medium text-slate-300 mt-4">
                Prepare starting posture...
              </p>
            </div>
          )}
        </CameraView>
      </div>

      {/* State 2 & 3: Camera Setup Guidance Checklist */}
      {(sessionState === 'camera_setup' || sessionState === 'ready') && (
        <CameraSetup
          guidance={exercise.cameraPositioningGuidance}
          isReady={readinessState.isReadyToAnalyze}
          onContinue={handleStartCountdown}
        />
      )}
    </div>
  );
}
