'use client';

import React, { useEffect, useRef, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Camera, 
  CameraOff, 
  Volume2, 
  VolumeX, 
  Pause, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  ArrowLeft, 
  Sparkles, 
  Sliders, 
  Activity, 
  Save,
  Check,
  Globe,
  Mic,
  MicOff
} from 'lucide-react';
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

  useEffect(() => {
    if (['elbow-flexion', 'shoulder-raise', 'sit-to-stand'].includes(resolvedParams.exerciseId)) {
      router.replace(`/patient/exercise/${resolvedParams.exerciseId}`);
    }
  }, [resolvedParams.exerciseId, router]);

  const exercise = getExerciseById(resolvedParams.exerciseId);

  // Video & Canvas references
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // State Machine reference
  const stateMachineRef = useRef<ExerciseStateMachine | null>(null);

  // Studio UI states
  const [repCount, setRepCount] = useState(0);
  const [currentAngle, setCurrentAngle] = useState(exercise.startAngle);
  const [peakAngleInRep, setPeakAngleInRep] = useState(exercise.startAngle);
  const [repState, setRepState] = useState<RepState>('CALIBRATING');
  const [holdRemainingSeconds, setHoldRemainingSeconds] = useState(exercise.holdDurationSeconds);
  const [holdProgressRatio, setHoldProgressRatio] = useState(0);
  const [completedRepsTelemetry, setCompletedRepsTelemetry] = useState<RepTelemetry[]>([]);

  // Multi-Language & Voice states
  const [currentLang, setCurrentLang] = useState<LanguageCode>('en');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState(true);
  const [voiceCommandsActive, setVoiceCommandsActive] = useState(false);
  const [lastVoiceCommand, setLastVoiceCommand] = useState<string | null>(null);

  // Studio modes
  const [activeAlert, setActiveAlert] = useState<{ message: string; severity: string } | null>(null);
  const [isSyntheticMode, setIsSyntheticMode] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

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
        } else if (newState === 'RETURNING') {
          speechCoach.speak(t.cues.returnDescend);
        } else if (newState === 'START_POSITION') {
          setActiveAlert(null);
        }
      },
      onRepCompleted: (telemetry) => {
        setCompletedRepsTelemetry((prev) => [...prev, telemetry]);
        speechCoach.playRepSuccessTone();
        speechCoach.speak(`${t.cues.repDone} (${telemetry.repNumber})`);

        if (telemetry.repNumber >= exercise.recommendedReps) {
          triggerSessionCompletion();
        }
      },
      onCompensationAlert: (warning, voiceCue, severity) => {
        setActiveAlert({ message: warning, severity });
        speechCoach.playAlertTone();
        speechCoach.speak(voiceCue);
      },
      onAngleTick: (data) => {
        setCurrentAngle(data.currentAngle);
        setPeakAngleInRep(data.peakAngle);
        setHoldRemainingSeconds(data.holdRemainingSeconds);
        setHoldProgressRatio(data.holdProgressRatio);
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
  }, [exercise, currentLang]);

  // Sync voice settings & language
  useEffect(() => {
    speechCoach.setMuted(!voiceEnabled);
    speechCoach.setLanguage(currentLang);
  }, [voiceEnabled, currentLang]);

  useEffect(() => {
    speechCoach.setSoundEffectsMuted(!soundEffectsEnabled);
  }, [soundEffectsEnabled]);

  // Handle Hands-Free Voice Commands
  const toggleVoiceCommands = () => {
    if (voiceCommandsActive) {
      voiceRecognition.stopListening();
      setVoiceCommandsActive(false);
      setLastVoiceCommand(null);
    } else {
      voiceRecognition.setLanguage(currentLang);
      voiceRecognition.startListening((command) => {
        setLastVoiceCommand(command);
        if (command === 'pause') {
          setIsPaused(true);
          speechCoach.speak('Workout paused');
        } else if (command === 'resume') {
          setIsPaused(false);
          speechCoach.speak('Resuming workout');
        } else if (command === 'finish') {
          triggerSessionCompletion();
        } else if (command === 'status') {
          speechCoach.speak(`You have completed ${repCount} of ${exercise.recommendedReps} repetitions.`);
        }
      });
      setVoiceCommandsActive(true);
    }
  };

  const startCameraOrSynthetic = async (forceSynthetic: boolean) => {
    if (!canvasRef.current) return;

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
    voiceRecognition.stopListening();
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
  };

  const handleSaveSession = () => {
    setIsSaving(true);
    const patients = getPatients();
    const primaryPatient = patients[0] || { id: 'pt-001', name: 'Sarah Connor' };

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
      : 90;

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
      router.push('/patient');
    }, 600);
  };

  // State display helper
  const getStateBadge = () => {
    const text = t.states[repState] || repState;
    switch (repState) {
      case 'CALIBRATING':
        return { label: text, color: 'bg-slate-800 text-slate-300 border-slate-700' };
      case 'START_POSITION':
        return { label: text, color: 'bg-cyan-950/80 text-cyan-300 border-cyan-800' };
      case 'IN_MOTION':
        return { label: text, color: 'bg-blue-950/80 text-blue-300 border-blue-800' };
      case 'HOLDING_PEAK':
        return { label: `${text} (${holdRemainingSeconds.toFixed(1)}s)`, color: 'bg-emerald-950/90 text-emerald-300 border-emerald-700 animate-pulse' };
      case 'RETURNING':
        return { label: text, color: 'bg-indigo-950/80 text-indigo-300 border-indigo-800' };
      default:
        return { label: text, color: 'bg-slate-800 text-slate-400 border-slate-700' };
    }
  };

  const badge = getStateBadge();

  return (
    <div className="relative min-h-[calc(100vh-61px)] bg-[#070b12] text-slate-100 flex flex-col">
      
      {/* Top Session Control Bar */}
      <div className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <Link
            href="/patient"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              {exercise.name}
              <span className="text-[11px] font-mono text-cyan-400 font-normal">
                ({exercise.targetAngleMin}° target)
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">
              Prescription: {exercise.recommendedReps} Reps · {exercise.holdDurationSeconds}s Peak Hold
            </p>
          </div>
        </div>

        {/* HUD Controls */}
        <div className="flex items-center gap-2">
          
          {/* Language Selector */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs">
            <Globe className="h-3.5 w-3.5 text-cyan-400" />
            <select
              value={currentLang}
              onChange={(e) => setCurrentLang(e.target.value as LanguageCode)}
              className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
            >
              <option value="en" className="bg-slate-900">English</option>
              <option value="es" className="bg-slate-900">Español</option>
              <option value="fr" className="bg-slate-900">Français</option>
              <option value="de" className="bg-slate-900">Deutsch</option>
              <option value="hi" className="bg-slate-900">हिन्दी</option>
            </select>
          </div>

          {/* Hands-Free Voice Commands Mic Toggle */}
          <button
            onClick={toggleVoiceCommands}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium border transition-colors ${
              voiceCommandsActive
                ? 'border-emerald-500/60 bg-emerald-950/50 text-emerald-300'
                : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
            title="Hands-free voice recognition: Say 'Pause', 'Resume', 'Finish', 'Status'"
          >
            {voiceCommandsActive ? <Mic className="h-3.5 w-3.5 text-emerald-400 animate-pulse" /> : <MicOff className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{voiceCommandsActive ? 'Voice Cues Active' : 'Hands-Free'}</span>
          </button>

          {/* Synthetic Simulator Toggle */}
          <button
            onClick={toggleSynthetic}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium border transition-colors ${
              isSyntheticMode
                ? 'border-amber-500/50 bg-amber-950/40 text-amber-300'
                : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle between Live Camera and Synthetic Biomechanical Simulator"
          >
            {isSyntheticMode ? <Sliders className="h-3.5 w-3.5 text-amber-400" /> : <Camera className="h-3.5 w-3.5 text-cyan-400" />}
            <span>{isSyntheticMode ? 'Simulation' : 'Camera'}</span>
          </button>

          {/* Voice Coach Sound Toggle */}
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
              voiceEnabled
                ? 'border-cyan-800/80 bg-cyan-950/40 text-cyan-400'
                : 'border-slate-800 bg-slate-900 text-slate-500'
            }`}
            title="Toggle Spoken Coaching"
          >
            {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>

          {/* Finish Early Button */}
          <button
            onClick={triggerSessionCompletion}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t.ui.finishSession}</span>
          </button>
        </div>
      </div>

      {/* Hands-free Voice Command Banner */}
      {voiceCommandsActive && (
        <div className="bg-emerald-950/60 border-b border-emerald-900/40 px-4 py-1.5 text-center text-xs text-emerald-300 flex items-center justify-center gap-2">
          <Mic className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
          <span>Hands-free voice recognition active. Say: <strong>"Pause"</strong>, <strong>"Resume"</strong>, <strong>"Status"</strong>, or <strong>"Finish"</strong></span>
          {lastVoiceCommand && (
            <span className="bg-emerald-900/80 text-white font-mono px-2 py-0.5 rounded text-[11px] font-bold">
              Detected: "{lastVoiceCommand}"
            </span>
          )}
        </div>
      )}

      {/* Main Studio Viewport */}
      <div className="flex-1 relative flex flex-col items-center justify-center p-3 sm:p-6 overflow-hidden">
        
        {/* Active Alert Banner Overlay */}
        {activeAlert && (
          <div className="absolute top-6 z-30 flex items-center gap-2.5 rounded-xl border border-rose-500/50 bg-rose-950/90 px-4 py-2.5 text-xs font-semibold text-rose-200 shadow-xl backdrop-blur-md animate-bounce">
            <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
            <span>{activeAlert.message}</span>
          </div>
        )}

        {/* Video Canvas Container */}
        <div className="relative w-full max-w-4xl aspect-[4/3] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl flex items-center justify-center">
          
          {/* Hidden/Muted Video Feed */}
          <video
            ref={videoRef}
            playsInline
            muted
            className={`absolute inset-0 w-full h-full object-cover -scale-x-100 ${
              isSyntheticMode ? 'opacity-0 pointer-events-none' : 'opacity-85'
            }`}
          />

          {/* Synthetic Mode Dark Background with Motion Grid */}
          {isSyntheticMode && (
            <div className="absolute inset-0 bg-[#090e17] flex items-center justify-center">
              <div 
                className="absolute inset-0 opacity-15"
                style={{
                  backgroundImage: 'radial-gradient(#06b6d4 1px, transparent 1px)',
                  backgroundSize: '24px 24px'
                }}
              />
              <div className="absolute top-4 left-4 flex items-center gap-1.5 rounded-md bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 text-[11px] text-amber-300 font-mono">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                Synthetic Biomechanical Stream Active
              </div>
            </div>
          )}

          {/* High-Contrast Clinical Skeleton HUD Canvas */}
          <canvas
            ref={canvasRef}
            width={640}
            height={480}
            className="absolute inset-0 w-full h-full object-cover z-10 pointer-events-none"
          />

          {/* Bottom Video HUD Overlay */}
          <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-end justify-between gap-3 pointer-events-auto">
            
            {/* Rep Counter Card */}
            <div className="rounded-xl border border-slate-800/80 bg-slate-900/90 backdrop-blur-md p-3 shadow-lg min-w-[130px]">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{t.ui.repCount}</div>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-3xl font-extrabold text-white font-mono">{repCount}</span>
                <span className="text-xs text-slate-400 font-mono">/ {exercise.recommendedReps}</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div 
                  className="bg-cyan-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (repCount / exercise.recommendedReps) * 100)}%` }}
                />
              </div>
            </div>

            {/* Rep State Badge */}
            <div className={`rounded-xl border px-4 py-2 text-xs font-semibold shadow-lg backdrop-blur-md ${badge.color}`}>
              {badge.label}
            </div>

            {/* Angle Gauge Card */}
            <div className="rounded-xl border border-slate-800/80 bg-slate-900/90 backdrop-blur-md p-3 shadow-lg min-w-[140px] text-right">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{t.ui.jointAngle}</div>
              <div className="flex items-baseline justify-end gap-1 mt-0.5">
                <span className={`text-3xl font-extrabold font-mono ${
                  repState === 'HOLDING_PEAK' ? 'text-emerald-400' : 'text-cyan-400'
                }`}>
                  {currentAngle}°
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {t.ui.target}: <span className="text-slate-200 font-medium">{exercise.targetAngleMin}°</span>
              </div>
            </div>

          </div>

          {/* Peak Hold Timer Bar */}
          {repState === 'HOLDING_PEAK' && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 w-64 rounded-xl border border-emerald-500/40 bg-slate-950/90 backdrop-blur-md p-2.5 shadow-xl">
              <div className="flex justify-between items-center text-xs mb-1 font-semibold">
                <span className="text-emerald-400">{t.ui.holdPeak}</span>
                <span className="text-white font-mono">{holdRemainingSeconds.toFixed(1)}s</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-400 h-full rounded-full transition-all duration-100"
                  style={{ width: `${Math.min(100, holdProgressRatio * 100)}%` }}
                />
              </div>
            </div>
          )}

        </div>

        {/* Setup Instructions Strip */}
        <div className="w-full max-w-4xl mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          {exercise.setupInstructions.map((step, idx) => (
            <div key={idx} className="flex items-start gap-2 rounded-lg border border-slate-800/70 bg-slate-900/40 p-2.5 text-slate-300">
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-cyan-400">
                {idx + 1}
              </span>
              <p className="leading-snug">{step}</p>
            </div>
          ))}
        </div>

      </div>

      {/* Post-Workout Completion Modal */}
      {sessionCompleted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-6">
            
            <div className="text-center space-y-2">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-lg shadow-emerald-900/50">
                <Check className="h-8 w-8 stroke-[3]" />
              </div>
              <h2 className="text-2xl font-bold text-white">{t.states.REP_COMPLETED}</h2>
              <p className="text-xs text-slate-400">
                Telemetry recorded with {completedRepsTelemetry.length} total reps for {exercise.name}.
              </p>
            </div>

            {/* Performance Metrics Summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-center">
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{t.ui.formScore}</div>
                <div className="text-2xl font-bold text-cyan-400 mt-0.5">
                  {completedRepsTelemetry.length > 0
                    ? Math.round(completedRepsTelemetry.reduce((acc, r) => acc + r.score, 0) / completedRepsTelemetry.length)
                    : 92}
                  <span className="text-xs text-slate-400 font-normal">/100</span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-center">
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Peak ROM</div>
                <div className="text-2xl font-bold text-emerald-400 mt-0.5 font-mono">
                  {completedRepsTelemetry.length > 0
                    ? Math.max(...completedRepsTelemetry.map((r) => r.peakAngle))
                    : exercise.targetAngleMin}°
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-center">
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Clean Reps</div>
                <div className="text-2xl font-bold text-white mt-0.5 font-mono">
                  {completedRepsTelemetry.filter((r) => r.passed && r.compensationsDetected.length === 0).length}
                  <span className="text-xs text-slate-400 font-normal">/{completedRepsTelemetry.length || exercise.recommendedReps}</span>
                </div>
              </div>
            </div>

            {/* Post-Session Clinical Questionnaire */}
            <div className="space-y-4 pt-2 border-t border-slate-800 text-xs">
              
              {/* Pain Scale Slider (VAS 0-10) */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-semibold text-slate-200">{t.ui.painRating}:</span>
                  <span className={`font-bold font-mono px-2 py-0.5 rounded ${
                    painRating <= 3 ? 'bg-emerald-950 text-emerald-300' : painRating <= 6 ? 'bg-amber-950 text-amber-300' : 'bg-rose-950 text-rose-300'
                  }`}>
                    {painRating} - {painRating <= 3 ? 'Mild' : painRating <= 6 ? 'Moderate' : 'Severe'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={painRating}
                  onChange={(e) => setPainRating(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>

              {/* RPE Effort (Borg Scale 1-10) */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-semibold text-slate-200">{t.ui.effortRating}:</span>
                  <span className="font-bold font-mono text-cyan-300">{effortRpe} / 10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={effortRpe}
                  onChange={(e) => setEffortRpe(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>

              {/* Feedback text */}
              <div>
                <label className="block font-semibold text-slate-200 mb-1">
                  Notes for Physiotherapist & Caregiver:
                </label>
                <textarea
                  value={patientFeedback}
                  onChange={(e) => setPatientFeedback(e.target.value)}
                  placeholder="e.g. Felt steady during extension, no pain on hold."
                  rows={2}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setSessionCompleted(false)}
                className="flex-1 rounded-xl border border-slate-700 bg-slate-800 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition-colors"
              >
                {t.ui.resume}
              </button>
              <button
                onClick={handleSaveSession}
                disabled={isSaving}
                className="flex-[2] flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-2.5 text-xs font-semibold text-white shadow-lg shadow-cyan-900/40 hover:from-cyan-400 hover:to-blue-500 transition-all disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Syncing Telemetry...' : t.ui.saveSession}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
