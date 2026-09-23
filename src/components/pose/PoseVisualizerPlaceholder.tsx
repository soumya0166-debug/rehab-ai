'use client';

import React from 'react';
import { Activity } from 'lucide-react';

export interface PoseVisualizerPlaceholderProps {
  jointName?: string;
  currentAngle?: number;
  targetAngle?: number;
}

export function PoseVisualizerPlaceholder({
  jointName = 'Knee Joint',
  currentAngle = 175,
  targetAngle = 172,
}: PoseVisualizerPlaceholderProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-300 flex items-center gap-1.5">
          <Activity className="h-4 w-4 text-cyan-400" />
          {jointName} Telemetry Stub
        </span>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-900/40 px-2 py-0.5 rounded">
          Calibrated
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-center">
        <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800">
          <span className="text-[10px] uppercase font-semibold text-slate-500 block">Current Angle</span>
          <span className="text-xl font-bold font-mono text-cyan-300">{currentAngle}°</span>
        </div>
        <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800">
          <span className="text-[10px] uppercase font-semibold text-slate-500 block">Clinician Target</span>
          <span className="text-xl font-bold font-mono text-white">{targetAngle}°</span>
        </div>
      </div>
    </div>
  );
}
