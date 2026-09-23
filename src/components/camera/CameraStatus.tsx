'use client';

import React from 'react';
import { Camera, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { CameraReadinessState } from '@/types/pose';

interface CameraStatusProps {
  readiness: CameraReadinessState;
  className?: string;
}

export function CameraStatus({ readiness, className = '' }: CameraStatusProps) {
  let badgeColor = 'bg-amber-500/10 text-amber-600 border-amber-500/30';
  let Icon = AlertTriangle;

  if (readiness.isReadyToAnalyze) {
    badgeColor = 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30';
    Icon = CheckCircle2;
  } else if (!readiness.isCameraConnected) {
    badgeColor = 'bg-rose-500/10 text-rose-600 border-rose-500/30';
    Icon = XCircle;
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium backdrop-blur-md transition-colors ${badgeColor} ${className}`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{readiness.friendlyMessage}</span>
    </div>
  );
}
