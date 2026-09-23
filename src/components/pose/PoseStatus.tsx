'use client';

import React from 'react';
import { Activity, CheckCircle2, AlertCircle } from 'lucide-react';
import { TrackingQualityLevel } from '@/types/pose';

interface PoseStatusProps {
  quality: TrackingQualityLevel;
  className?: string;
}

export function PoseStatus({ quality, className = '' }: PoseStatusProps) {
  const configs: Record<TrackingQualityLevel, { color: string; label: string; icon: any }> = {
    high: {
      color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
      label: 'Pose Tracking: Optimal',
      icon: CheckCircle2,
    },
    medium: {
      color: 'bg-sky-500/10 text-sky-600 border-sky-500/30',
      label: 'Pose Tracking: Good',
      icon: Activity,
    },
    low: {
      color: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
      label: 'Pose Tracking: Low Confidence',
      icon: AlertCircle,
    },
    uncalibrated: {
      color: 'bg-muted text-muted-foreground border-border',
      label: 'Pose Tracking: Searching...',
      icon: Activity,
    },
  };

  const config = configs[quality] || configs.uncalibrated;
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium backdrop-blur-md transition-colors ${config.color} ${className}`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{config.label}</span>
    </div>
  );
}
