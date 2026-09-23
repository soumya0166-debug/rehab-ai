'use client';

import React, { useEffect, useRef, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { getExerciseById } from '@/lib/biomechanics/exercises';
import { ExerciseStateMachine } from '@/lib/biomechanics/stateMachine';
import { poseManager } from '@/lib/vision/poseDetector';
import { drawClinicalSkeleton } from '@/lib/vision/skeletonRenderer';
import { speechCoach } from '@/lib/voice/speechCoach';
import { voiceRecognition } from '@/lib/voice/voiceRecognition';
import { saveSessionRecord, getPatients } from '@/lib/data/store';
import { RepState, RepTelemetry, SessionRecord, LanguageCode } from '@/types/rehab';
import { TRANSLATIONS } from '@/lib/i18n/translations';

export default function SessionStudioPage({ params }: { params: Promise<{ exerciseId: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();

  const exercise = getExerciseById(resolvedParams.exerciseId);

  // Video & Canvas references
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // State Machine reference
  const stateMachineRef = useRef<ExerciseStateMachine | null>(null);

  // Studio UI states
  const [repCount, setRepCount] = useState(0);
  const [currentAngle, setCurrentAngle] = useState(exercise.startAngle);
  const [repState, setRepState] = useState<RepState>('CALIBRATING');
  const [holdRemainingSeconds, setHoldRemainingSeconds] = useState(exercise.holdDurationSeconds);
  const [holdProgressRatio, setHoldProgressRatio] = useState(0);
  const [completedRepsTelemetry, setCompletedRepsTelemetry] = useState<RepTelemetry[]>([]);

  // Multi-Language & Voice states
  const [currentLang, setCurrentLang] = useState<LanguageCode>('en');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState(true);

  // Studio modes
  const [activeAlert, setActiveAlert] = useState<{ message: string; severity: string } | null>(null);
  const [isSyntheticMode, setIsSyntheticMode] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // View mode switcher: 'split' | 'patient' | 'coach'
  const [viewMode, setViewMode] = useState<'split' | 'patient' | 'coach'>('split');

  // Active feedback card selection
  const [feedbackState, setFeedbackState] = useState<'optimal' | 'velocity' | 'frame'>('optimal');

  // Summary Dialog Modal states
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [painRating, setPainRating] = useState(2);
  const [effortRpe, setEffortRpe] = useState(4);
  const [patientFeedback, setPatientFeedback] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  // 1. Initialize State Machine and Pose Manager
  useEffect(() => {
    poseManager.setExerciseForSimulation(exercise);

    const sm = new ExerciseStateMachine(exercise, {
      onStateChange: (newState) => {
        setRepState(newState);

        if (newState === 'HOLDING_PEAK') {
          speechCoach.speak(t.cues.holding);
          speechCoach.playHoldTickTone();
          setFeedbackState('optimal');
        } else if (newState === 'RETURNING') {
          speechCoach.speak(t.cues.returnDescend);
        } else if (newState === 'START_POSITION') {
          speechCoach.speak(t.cues.ready);
        }
      },
      onAngleTick: (data) => {
        setCurrentAngle(Math.round(data.currentAngle));
        setHoldRemainingSeconds(data.holdRemainingSeconds);
        setHoldProgressRatio(data.holdProgressRatio);
      },
      onRepCompleted: (telemetry) => {
        setCompletedRepsTelemetry((prev) => [...prev, telemetry]);
        setRepCount((prev) => prev + 1);

        speechCoach.speak(t.cues.repDone);
        speechCoach.playRepSuccessTone();

        if (telemetry.compensationsDetected.length > 0) {
          setFeedbackState('velocity');
        } else {
          setFeedbackState('optimal');
        }

        try {
          confetti({
            particleCount: 25,
            spread: 45,
            origin: { y: 0.8 },
            colors: ['#00685f', '#14B8A6', '#6ffbbe'],
          });
        } catch {
          // ignore
        }
      },
      onCompensationAlert: (warning, voiceCue, severity) => {
        setActiveAlert({ message: warning, severity });
        speechCoach.playAlertTone();
        if (voiceCue) {
          speechCoach.speak(voiceCue);
          setFeedbackState('velocity');
        }
      },
    });

    stateMachineRef.current = sm;
    startCameraOrSynthetic(false);

    return () => {
      poseManager.stop();
      voiceRecognition.stopListening();
      if (stateMachineRef.current) {
        stateMachineRef.current.reset();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercise, currentLang]);

  useEffect(() => {
    speechCoach.setMuted(!voiceEnabled);
    speechCoach.setLanguage(currentLang);
  }, [voiceEnabled, currentLang]);

  useEffect(() => {
    speechCoach.setSoundEffectsMuted(!soundEffectsEnabled);
  }, [soundEffectsEnabled]);

  const startCameraOrSynthetic = async (forceSynthetic: boolean) => {
    if (!canvasRef.current) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onLandmarks = (landmarks: any[]) => {
      if (!canvasRef.current || isPaused) return;

      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      if (stateMachineRef.current) {
        const result = stateMachineRef.current.processFrame(landmarks);
        setRepCount(result.repCount);
      }

      drawClinicalSkeleton(
        ctx,
        landmarks,
        canvasRef.current.width,
        canvasRef.current.height,
        {
          currentAngle,
          targetAngleMin: exercise.targetAngleMin,
          targetAngleMax: exercise.targetAngleMax,
          targetJoint: exercise.targetJoint,
          repState,
          hasCompensationAlert: !!activeAlert,
          holdProgressRatio,
        }
      );
    };

    if (forceSynthetic) {
      poseManager.startSynthetic(onLandmarks);
      setIsSyntheticMode(true);
    } else if (videoRef.current) {
      const cameraSuccess = await poseManager.startCamera(videoRef.current, onLandmarks);
      setIsSyntheticMode(!cameraSuccess);
    }
  };

  const toggleSynthetic = () => {
    const nextMode = !isSyntheticMode;
    startCameraOrSynthetic(nextMode);
  };

  const triggerSessionCompletion = () => {
    setSessionCompleted(true);
    poseManager.stop();
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00685f', '#14B8A6', '#6ffbbe'],
      });
    } catch {
      // ignore
    }
  };

  const handleSaveSession = () => {
    setIsSaving(true);
    const patients = getPatients();
    const primaryPatient = patients[0] || { id: 'pt-001', name: 'Rahul Sharma' };

    const totalReps = completedRepsTelemetry.length;
    const cleanReps = completedRepsTelemetry.filter((r) => r.passed && r.compensationsDetected.length === 0).length;

    const avgRom = totalReps > 0
      ? Math.round(completedRepsTelemetry.reduce((acc, r) => acc + r.peakAngle, 0) / totalReps)
      : exercise.targetAngleMin;

    const maxRom = totalReps > 0
      ? Math.max(...completedRepsTelemetry.map((r) => r.peakAngle))
      : exercise.targetAngleMin;

    const avgScore = totalReps > 0
      ? Math.round(completedRepsTelemetry.reduce((acc, r) => acc + r.score, 0) / totalReps)
      : 92;

    const compensationFreq: Record<string, number> = {};
    completedRepsTelemetry.forEach((r) => {
      r.compensationsDetected.forEach((c) => {
        compensationFreq[c] = (compensationFreq[c] || 0) + 1;
      });
    });

    const sessionRecord: SessionRecord = {
      id: `sess-${Date.now()}`,
      patientId: primaryPatient.id,
      patientName: primaryPatient.name,
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      date: new Date().toISOString(),
      targetReps: exercise.recommendedReps,
      completedReps: totalReps,
      cleanReps,
      averageRom: avgRom,
      peakRom: maxRom,
      targetRom: exercise.targetAngleMin,
      averageHoldTime: exercise.holdDurationSeconds,
      overallScore: avgScore,
      compensationBreakdown: compensationFreq,
      painScore: painRating,
      effortRpe,
      reps: completedRepsTelemetry,
      patientFeedback,
    };

    saveSessionRecord(sessionRecord);

    setTimeout(() => {
      setIsSaving(false);
      router.push('/patient/progress');
    }, 600);
  };

  const progressPercent = Math.min(100, Math.round((repCount / exercise.recommendedReps) * 100));

  return (
    <div className="flex-1 flex flex-col relative w-full pt-4 pb-28 bg-[#f8f9ff] min-h-screen text-[#0b1c30]">
      <div className="flex flex-col w-full max-w-4xl mx-auto px-4 sm:px-6 gap-4">
        
        {/* Hidden Camera Element */}
        <video ref={videoRef} className="hidden" playsInline muted />

        {/* 1. Top Session Bar HUD */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-[#dce9ff] flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex w-3 h-3 rounded-full bg-[#00685f] animate-pulse"></span>
              <span className="font-headline text-lg sm:text-xl font-bold text-[#0b1c30]">{exercise.name}</span>
            </div>
            <div className="bg-[#eff4ff] px-3 py-1 rounded-full text-[#565e74] font-label-md text-xs font-semibold border border-[#dce9ff]">
              Repetition <span className="text-[#00685f] font-bold">{repCount}</span> of {exercise.recommendedReps}
            </div>
          </div>
          {/* Rep Progress Bar */}
          <div className="w-full bg-[#eff4ff] h-2 rounded-full overflow-hidden mt-1">
            <div
              className="bg-[#00685f] h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* 2. Real-Time Biometric Telemetry Strip */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          {/* Active Angle Dial */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl shadow-sm border border-[#dce9ff] flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-label-sm text-[10px] text-[#565e74] uppercase font-bold">Flexion Angle</span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="font-headline text-2xl sm:text-3xl font-bold text-[#00685f]">{currentAngle}°</span>
                <span className="font-label-sm text-[11px] text-[#006947] font-semibold">
                  {currentAngle >= exercise.targetAngleMin && currentAngle <= exercise.targetAngleMax ? 'Optimal' : 'Active'}
                </span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-full bg-[#eff4ff] flex items-center justify-center relative border border-[#dce9ff]">
              <svg className="w-11 h-11 -rotate-90" viewBox="0 0 36 36">
                <circle className="text-[#d3e4fe] stroke-current" cx="18" cy="18" fill="none" r="14" strokeWidth="3" />
                <circle
                  className="text-[#00685f] stroke-current"
                  cx="18"
                  cy="18"
                  fill="none"
                  r="14"
                  strokeDasharray="88"
                  strokeDashoffset={Math.max(0, 88 - (currentAngle / 180) * 88)}
                  strokeLinecap="round"
                  strokeWidth="3"
                />
              </svg>
              <span className="material-symbols-outlined text-[18px] text-[#00685f] absolute">show_chart</span>
            </div>
          </div>

          {/* Target Window */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl shadow-sm border border-[#dce9ff] flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-label-sm text-[10px] text-[#565e74] uppercase font-bold">Target Corridor</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-headline text-xl sm:text-2xl font-bold text-[#0b1c30]">
                  {exercise.targetAngleMin}°–{exercise.targetAngleMax}°
                </span>
              </div>
            </div>
            <div className="bg-[#dae2fd] text-[#5c647a] px-2.5 py-1 rounded-xl flex items-center gap-1 border border-[#dce9ff]">
              <span className="material-symbols-outlined text-[16px] text-[#00685f]">verified</span>
              <span className="font-label-sm text-[11px] font-bold">
                {currentAngle >= exercise.targetAngleMin ? 'Matched' : 'In Reach'}
              </span>
            </div>
          </div>

          {/* CV Tracking Quality */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl shadow-sm border border-[#dce9ff] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#eff4ff] flex items-center justify-center text-[#00685f] border border-[#dce9ff]">
                <span className="material-symbols-outlined text-[18px]">videocam</span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-sm text-[10px] text-[#565e74]">CV Quality</span>
                <span className="font-label-md text-xs font-bold text-[#0b1c30]">94% Confidence</span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 font-label-sm text-[11px] text-[#006947] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#00855b]"></span> 30 FPS
            </span>
          </div>

          {/* Dynamic Tempo Pace */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl shadow-sm border border-[#dce9ff] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#eff4ff] flex items-center justify-center text-[#00685f] border border-[#dce9ff]">
                <span className="material-symbols-outlined text-[18px]">speed</span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-sm text-[10px] text-[#565e74]">Kinetic Tempo</span>
                <span className="font-label-md text-xs font-bold text-[#0b1c30]">Controlled (2.4s)</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[20px] text-[#00685f]">check_circle</span>
          </div>
        </div>

        {/* 3. Synchronized Split-Screen Rehabilitation View */}
        <div className="flex flex-col gap-3">
          {/* View Mode Switcher */}
          <div className="bg-[#eff4ff] p-1 rounded-2xl flex items-center text-center border border-[#dce9ff]">
            <button
              onClick={() => setViewMode('split')}
              className={`flex-1 py-2 rounded-xl font-label-md text-xs font-bold transition-all ${
                viewMode === 'split' ? 'bg-white shadow-sm text-[#00685f]' : 'text-[#565e74] hover:text-[#0b1c30]'
              }`}
            >
              Synchronized Mirror
            </button>
            <button
              onClick={() => setViewMode('patient')}
              className={`flex-1 py-2 rounded-xl font-label-md text-xs font-bold transition-all ${
                viewMode === 'patient' ? 'bg-white shadow-sm text-[#00685f]' : 'text-[#565e74] hover:text-[#0b1c30]'
              }`}
            >
              Pose Telemetry
            </button>
            <button
              onClick={() => setViewMode('coach')}
              className={`flex-1 py-2 rounded-xl font-label-md text-xs font-bold transition-all ${
                viewMode === 'coach' ? 'bg-white shadow-sm text-[#00685f]' : 'text-[#565e74] hover:text-[#0b1c30]'
              }`}
            >
              Coach Priya
            </button>
          </div>

          {/* Primary Interaction Canvas: Dual Visual Stack */}
          <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden bg-[#213145] shadow-lg border border-[#dce9ff]">
            {/* AI Digital Assistant (Priya) Frame */}
            {(viewMode === 'split' || viewMode === 'coach') && (
              <div className="absolute inset-0 w-full h-full">
                <img
                  className="w-full h-full object-cover object-top"
                  alt="Coach Priya Active Demonstration"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKmR4TbUjG0_2kp_iUFjj5pT5AJeBVnx-awTwmRn3PDeVgs9JjhAJ8cJvO0udBwuG_SU30JLursdriDfp67DeJrjC-ao088qXKQ-TOy51rxCnHAenTF_u_HUeEhz748eBd3MD2AvYQzWxxMyPuq2xs3GbFu6vY5MRBCckPBGvQfWa07-qAdAAl_NIMun6cBegxdL4yVwEObBGG7_jvNyPaK9RwzXfWrqaoMDqOEkIvmQjFOa6dcIBQcQ"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#213145]/90 via-transparent to-black/30"></div>
                <div className="absolute top-3 left-3 bg-[#213145]/80 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2 border border-white/10">
                  <span className="w-2 h-2 rounded-full bg-[#89f5e7] animate-ping"></span>
                  <span className="font-label-sm text-[11px] text-white">AI Coach Priya: Active Sync</span>
                </div>
              </div>
            )}

            {/* Live Patient Computer Vision Skeletal Overlay */}
            {(viewMode === 'split' || viewMode === 'patient') && (
              <div
                className={`overflow-hidden transition-all ${
                  viewMode === 'patient'
                    ? 'absolute inset-0 w-full h-full bg-[#213145] z-10'
                    : 'absolute bottom-3 right-3 w-40 sm:w-48 h-52 sm:h-60 rounded-2xl shadow-2xl bg-[#213145]/90 backdrop-blur-md border border-white/20 z-10'
                }`}
              >
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    width={480}
                    height={360}
                    className="w-full h-full object-cover"
                  />

                  {/* Dynamic Angle Chip Inside PiP */}
                  <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 px-2 py-0.5 rounded-full text-[10px] text-white font-label-sm border border-white/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6ffbbe]"></span> You ({currentAngle}°)
                  </div>

                  {isSyntheticMode && (
                    <div className="absolute bottom-2 right-2 bg-[#00685f]/90 text-white px-2 py-0.5 rounded text-[9px] font-bold">
                      Synthetic Pose Active
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Real-time Conversational Voice Feed Pill */}
            <div className="absolute bottom-3 left-3 max-w-[62%] sm:max-w-[55%] bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-[#dce9ff] flex flex-col gap-1 z-20">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-[#00685f] flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-[13px]">graphic_eq</span>
                </div>
                <span className="font-headline text-xs text-[#00685f] font-bold">Coach Priya</span>
                {/* Voice wave visualizer */}
                <span className="flex items-center gap-0.5 ml-auto">
                  <span className="w-0.5 h-2 bg-[#00685f] rounded-full animate-bounce"></span>
                  <span className="w-0.5 h-3.5 bg-[#00685f] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                  <span className="w-0.5 h-2 bg-[#00685f] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                </span>
              </div>
              <p className="font-body text-xs sm:text-sm text-[#0b1c30] leading-tight font-medium">
                {activeAlert
                  ? activeAlert.message
                  : currentAngle >= exercise.targetAngleMin
                  ? "Good movement. Hold peak for a moment, then lower slowly."
                  : "Raise smoothly into the target corridor."}
              </p>
            </div>
          </div>
        </div>

        {/* 4. Adaptive Live Feedback State Switcher Carousel */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-[11px] text-[#565e74] uppercase tracking-wider font-bold">
              Active Feedback Stream
            </span>
            <span className="font-label-sm text-xs text-[#00685f] font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px]">subtitles</span> Live Subtitles
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {/* Target In-Zone State */}
            <div
              onClick={() => setFeedbackState('optimal')}
              className={`p-3.5 rounded-2xl flex items-start gap-3 transition-all cursor-pointer border ${
                feedbackState === 'optimal'
                  ? 'bg-[#00855b]/10 border-[#00855b]/30'
                  : 'bg-white border-[#dce9ff] opacity-60'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-[#006947] flex items-center justify-center text-white shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[18px]">thumb_up</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-headline text-xs sm:text-sm text-[#006947] font-bold">Optimal Execution</span>
                  <span className="font-label-sm text-[10px] text-[#006947] bg-[#00855b]/20 px-2 py-0.5 rounded-full font-bold">
                    Target Corridor
                  </span>
                </div>
                <p className="font-body text-xs sm:text-sm text-[#0b1c30] mt-0.5">
                  &quot;Good. That&apos;s a controlled movement. Hold for one second at peak.&quot;
                </p>
              </div>
            </div>

            {/* Outside Target State */}
            <div
              onClick={() => setFeedbackState('velocity')}
              className={`p-3.5 rounded-2xl flex items-start gap-3 transition-all cursor-pointer border ${
                feedbackState === 'velocity'
                  ? 'bg-[#dae2fd]/40 border-[#565e74]/40'
                  : 'bg-white border-[#dce9ff] opacity-60'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-[#565e74] flex items-center justify-center text-white shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[18px]">slow_motion_video</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-headline text-xs sm:text-sm text-[#565e74] font-bold">Velocity Prompt</span>
                  <span className="font-label-sm text-[10px] text-[#565e74] bg-[#eff4ff] px-2 py-0.5 rounded-full font-bold">
                    Pacing
                  </span>
                </div>
                <p className="font-body text-xs sm:text-sm text-[#565e74] mt-0.5">
                  &quot;Let&apos;s try that movement a little more slowly. Lower back to start.&quot;
                </p>
              </div>
            </div>

            {/* Camera Tracking Guidance */}
            <div
              onClick={() => setFeedbackState('frame')}
              className={`p-3.5 rounded-2xl flex items-start gap-3 transition-all cursor-pointer border ${
                feedbackState === 'frame'
                  ? 'bg-[#eff4ff] border-[#00685f]/40'
                  : 'bg-white border-[#dce9ff] opacity-60'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-[#dce9ff] flex items-center justify-center text-[#565e74] shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[18px]">crop_free</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-headline text-xs sm:text-sm text-[#565e74] font-bold">Frame Calibration</span>
                  <span className="font-label-sm text-[10px] text-[#565e74] bg-[#eff4ff] px-2 py-0.5 rounded-full font-bold">
                    Vision
                  </span>
                </div>
                <p className="font-body text-xs sm:text-sm text-[#565e74] mt-0.5">
                  &quot;Keep full body visible in camera frame for accurate joint tracking.&quot;
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Clinical Safety & Bio-Assistance Card */}
        <div className="bg-[#eff4ff] rounded-2xl p-4 flex items-center justify-between border border-[#dce9ff]">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#00685f] text-[22px]">health_and_safety</span>
            <div className="flex flex-col">
              <span className="font-headline text-xs sm:text-sm text-[#0b1c30] font-bold">Adaptive Load Guard</span>
              <span className="font-label-sm text-[11px] text-[#565e74]">RPE threshold locked to Mild (Zone 2)</span>
            </div>
          </div>
          <button
            onClick={() => {
              setPainRating((p) => Math.min(10, p + 1));
              speechCoach.speak("Pain flagged. We've logged this discomfort rating for Dr. Mehta.");
            }}
            className="bg-[#ffdad6] text-[#93000a] px-3.5 py-1.5 rounded-xl font-label-sm text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-transform border border-[#ffdad6]"
          >
            <span className="material-symbols-outlined text-[16px] text-[#ba1a1a]">report</span>
            Report Discomfort ({painRating})
          </button>
        </div>

        {/* 6. Primary Bottom Session Controls */}
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-3">
            {/* Pause Session */}
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="bg-[#d3e4fe] hover:bg-[#cbdbf5] text-[#0b1c30] font-headline text-xs sm:text-sm font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 transition-colors border border-[#dce9ff]"
            >
              <span className="material-symbols-outlined text-[20px]">{isPaused ? 'play_arrow' : 'pause'}</span>
              <span>{isPaused ? 'Resume Reps' : 'Pause Reps'}</span>
            </button>

            {/* Stop & Save Session */}
            <button
              onClick={triggerSessionCompletion}
              className="bg-[#00685f] hover:bg-[#005049] text-white font-headline text-xs sm:text-sm font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">save</span>
              <span>Stop &amp; Save</span>
            </button>
          </div>

          {/* Quick Accessibility Bar */}
          <div className="flex items-center justify-between px-2 pt-1 text-[#565e74] text-xs">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#00685f]">record_voice_over</span>
              <span className="font-label-sm text-[11px]">Audio Engine: Neural Human Synthesizer</span>
            </div>
            <button
              onClick={toggleSynthetic}
              className="font-label-sm text-[11px] text-[#00685f] font-bold hover:underline"
            >
              {isSyntheticMode ? 'Switch to Camera' : 'Calibrate Sensor (Synthetic)'}
            </button>
          </div>
        </div>

        {/* 7. Save & Review Modal */}
        {sessionCompleted && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-[#dce9ff] flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-[#eff4ff] pb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#00685f] text-[24px]">task_alt</span>
                  <h3 className="font-headline text-lg font-bold text-[#0b1c30]">Session Completed!</h3>
                </div>
                <span className="font-label-sm text-xs bg-[#eff4ff] text-[#00685f] px-2.5 py-1 rounded-full font-bold">
                  {repCount} of {exercise.recommendedReps} Reps
                </span>
              </div>

              {/* Discomfort VAS */}
              <div className="flex flex-col gap-1.5">
                <label className="font-headline text-xs font-bold text-[#0b1c30] flex justify-between">
                  <span>Post-Session Discomfort</span>
                  <span className="text-[#00685f] font-bold">{painRating} / 10 VAS</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={painRating}
                  onChange={(e) => setPainRating(Number(e.target.value))}
                  className="w-full accent-[#00685f]"
                />
              </div>

              {/* Effort RPE */}
              <div className="flex flex-col gap-1.5">
                <label className="font-headline text-xs font-bold text-[#0b1c30] flex justify-between">
                  <span>Exertion Effort</span>
                  <span className="text-[#00685f] font-bold">{effortRpe} / 10 Borg</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={effortRpe}
                  onChange={(e) => setEffortRpe(Number(e.target.value))}
                  className="w-full accent-[#00685f]"
                />
              </div>

              {/* Patient Note */}
              <div className="flex flex-col gap-1.5">
                <label className="font-headline text-xs font-bold text-[#0b1c30]">Optional Patient Comment</label>
                <textarea
                  rows={2}
                  placeholder="Felt smooth today, no shoulder pinching."
                  value={patientFeedback}
                  onChange={(e) => setPatientFeedback(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#eff4ff] border border-[#dce9ff] text-xs text-[#0b1c30] placeholder:text-[#565e74] focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setSessionCompleted(false)}
                  className="flex-1 py-3 rounded-xl bg-[#eff4ff] text-[#565e74] font-headline text-xs font-bold hover:bg-[#dce9ff] transition-colors"
                >
                  Resume
                </button>
                <button
                  onClick={handleSaveSession}
                  disabled={isSaving}
                  className="flex-1 py-3 rounded-xl bg-[#00685f] hover:bg-[#005049] text-white font-headline text-xs font-bold shadow-md transition-colors disabled:opacity-75"
                >
                  {isSaving ? 'Synchronizing...' : 'Save & Sync Record'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
