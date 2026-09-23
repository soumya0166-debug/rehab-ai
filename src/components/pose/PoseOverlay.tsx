'use client';

import React, { useState } from 'react';
import {
  Activity,
  Terminal,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Pause,
  Play,
  RotateCcw,
} from 'lucide-react';
import { RepetitionPhase } from '@/types/exercises';
import { DeveloperDebugInfo } from '@/types/pose';
import { Button } from '@/components/ui/button';

interface PoseOverlayProps {
  exerciseName: string;
  targetJointName: string;
  currentAngle: number;
  targetRange: { min: number; max: number };
  currentReps: number;
  targetReps: number;
  currentPhase: RepetitionPhase;
  feedbackBanner: string;
  debugInfo?: DeveloperDebugInfo;
  isPaused: boolean;
  onTogglePause: () => void;
  onReportPain: () => void;
}

export function PoseOverlay({
  exerciseName,
  targetJointName,
  currentAngle,
  targetRange,
  currentReps,
  targetReps,
  currentPhase,
  feedbackBanner,
  debugInfo,
  isPaused,
  onTogglePause,
  onReportPain,
}: PoseOverlayProps) {
  const [showDebug, setShowDebug] = useState(false);

  // Compute percentage progress of angle within target range
  const angleNormalized = Math.min(
    100,
    Math.max(0, ((currentAngle - 0) / (targetRange.max || 180)) * 100)
  );

  const phaseColors: Record<RepetitionPhase, string> = {
    REST: 'bg-slate-700/80 text-slate-200 border-slate-600',
    MOVING: 'bg-blue-600/80 text-blue-100 border-blue-500 animate-pulse',
    TARGET_REACHED: 'bg-emerald-600/90 text-emerald-100 border-emerald-400 font-bold',
    RETURNING: 'bg-amber-600/80 text-amber-100 border-amber-500',
    COMPLETED_REP: 'bg-emerald-500 text-white border-emerald-300 font-bold',
    INCOMPLETE_REP: 'bg-rose-600/80 text-rose-100 border-rose-500',
  };

  return (
    <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none select-none">
      {/* Top Banner: Exercise Title + Reps Progress */}
      <div className="flex items-center justify-between pointer-events-auto">
        <div className="bg-slate-900/85 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-800 shadow-md">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {exerciseName}
          </div>
          <div className="text-sm font-medium text-slate-200 flex items-center gap-2 mt-0.5">
            <span>Joint: {targetJointName}</span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
              Target: {targetRange.min}° – {targetRange.max}°
            </span>
          </div>
        </div>

        {/* Repetition Count Pill */}
        <div className="bg-primary/95 text-primary-foreground backdrop-blur-md px-5 py-2 rounded-xl shadow-lg border border-primary/40 flex items-baseline gap-1.5">
          <span className="text-2xl font-black">{currentReps}</span>
          <span className="text-xs font-medium text-primary-foreground/80">/ {targetReps} Reps</span>
        </div>
      </div>

      {/* Middle Feedback Coaching Banner */}
      <div className="flex flex-col items-center justify-center my-auto">
        {feedbackBanner && (
          <div className="bg-slate-950/90 backdrop-blur-lg px-6 py-3 rounded-2xl border border-slate-700/80 shadow-2xl max-w-md text-center pointer-events-auto transition-all animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-widest ${
                  phaseColors[currentPhase] || 'bg-slate-800'
                }`}
              >
                {currentPhase.replace('_', ' ')}
              </span>
            </div>
            <div className="text-base font-semibold text-white tracking-tight">
              {feedbackBanner}
            </div>
          </div>
        )}
      </div>

      {/* Bottom HUD: Live Angle Gauge + Actions */}
      <div className="flex flex-col gap-3 pointer-events-auto">
        <div className="bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-slate-800/90 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Angle Gauge */}
          <div className="flex-1 w-full space-y-1.5">
            <div className="flex justify-between items-center text-xs font-medium text-slate-300">
              <div className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-primary" />
                <span>Detected Angle: <strong className="text-white text-sm">{Math.round(currentAngle)}°</strong></span>
              </div>
              <span className="text-slate-400">Target Range: {targetRange.min}° – {targetRange.max}°</span>
            </div>

            {/* Visual progress track */}
            <div className="relative w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              {/* Target zone highlighted in emerald */}
              <div
                className="absolute top-0 bottom-0 bg-emerald-500/25 border-x border-emerald-400/50"
                style={{
                  left: `${(targetRange.min / 180) * 100}%`,
                  width: `${((targetRange.max - targetRange.min) / 180) * 100}%`,
                }}
              />
              {/* Dynamic indicator needle/fill */}
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-75"
                style={{ width: `${angleNormalized}%` }}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={onTogglePause}
              className="h-9 px-3 gap-1.5 bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white"
            >
              {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-amber-400" />}
              <span>{isPaused ? 'Resume' : 'Pause'}</span>
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={onReportPain}
              className="h-9 px-3 gap-1.5 bg-rose-600/90 hover:bg-rose-600 text-white border-0 shadow-md"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Report Discomfort</span>
            </Button>

            {debugInfo && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDebug((prev) => !prev)}
                className="h-9 px-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                title="Toggle Developer Debug Mode"
              >
                <Terminal className="w-4 h-4" />
                {showDebug ? <ChevronDown className="w-3 h-3 ml-0.5" /> : <ChevronUp className="w-3 h-3 ml-0.5" />}
              </Button>
            )}
          </div>
        </div>

        {/* Developer / Clinician Debug Drawer */}
        {showDebug && debugInfo && (
          <div className="p-3 bg-slate-950/95 border border-slate-800 rounded-xl text-[11px] font-mono text-slate-400 space-y-1.5 shadow-2xl">
            <div className="flex items-center justify-between text-slate-200 font-bold border-b border-slate-800 pb-1">
              <span>Biomechanical Telemetry Debugger (Local)</span>
              <span>{debugInfo.fps} FPS · {debugInfo.latencyMs} ms latency</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <div>Phase: <span className="text-white font-semibold">{debugInfo.activePhase}</span></div>
              <div>Body Coverage: <span className="text-white">{debugInfo.boundingCoverage}%</span></div>
              <div>Angle: <span className="text-emerald-400">{Math.round(currentAngle)}°</span></div>
              <div>Target: <span className="text-blue-400">{targetRange.min}° – {targetRange.max}°</span></div>
            </div>
            {Object.keys(debugInfo.landmarkConfidences).length > 0 && (
              <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-900 truncate">
                Confidences:{' '}
                {Object.entries(debugInfo.landmarkConfidences)
                  .map(([name, conf]) => `${name}: ${(conf * 100).toFixed(0)}%`)
                  .join(' | ')}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
