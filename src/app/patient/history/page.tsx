'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  History,
  Calendar,
  Clock,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Play,
  Search,
  Filter,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ProductDisclaimer } from '@/components/common/ProductDisclaimer';

interface HistoricalSessionItem {
  id: string;
  exerciseName: string;
  date: string;
  completedReps: number;
  totalReps: number;
  incompleteReps: number;
  durationSeconds: number;
  averageAngle: number;
  peakAngle: number;
  targetRange: string;
  trackingQuality: 'high' | 'medium' | 'low';
  painScore: number;
  aiSummary: string;
}

export default function PatientHistoryPage() {
  const [expandedId, setExpandedId] = useState<string | null>('sess-001');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'elbow-flexion' | 'shoulder-raise' | 'sit-to-stand'>('all');

  const historyItems: HistoricalSessionItem[] = [
    {
      id: 'sess-001',
      exerciseName: 'Elbow Flexion',
      date: 'Today, 10:15 AM',
      completedReps: 10,
      totalReps: 10,
      incompleteReps: 0,
      durationSeconds: 222,
      averageAngle: 46,
      peakAngle: 44,
      targetRange: '35° – 55°',
      trackingQuality: 'high',
      painScore: 1,
      aiSummary: 'You completed 10 repetitions. Most detected movements were within your configured target range of 35° to 55° with smooth cadence.',
    },
    {
      id: 'sess-002',
      exerciseName: 'Shoulder Raise',
      date: 'Yesterday, 4:30 PM',
      completedReps: 9,
      totalReps: 10,
      incompleteReps: 1,
      durationSeconds: 265,
      averageAngle: 88,
      peakAngle: 94,
      targetRange: '85° – 110°',
      trackingQuality: 'high',
      painScore: 2,
      aiSummary: 'You completed 9 full repetitions. One repetition returned early before reaching full elevation. Stable torso posture throughout.',
    },
    {
      id: 'sess-003',
      exerciseName: 'Sit-to-Stand',
      date: 'Sep 21, 2026, 11:00 AM',
      completedReps: 10,
      totalReps: 10,
      incompleteReps: 0,
      durationSeconds: 240,
      averageAngle: 174,
      peakAngle: 178,
      targetRange: '170° – 180°',
      trackingQuality: 'high',
      painScore: 0,
      aiSummary: 'You completed all 10 repetitions with complete upright hip and knee extension. Excellent bilateral symmetry recorded.',
    },
    {
      id: 'sess-004',
      exerciseName: 'Elbow Flexion',
      date: 'Sep 20, 2026, 9:45 AM',
      completedReps: 8,
      totalReps: 10,
      incompleteReps: 2,
      durationSeconds: 195,
      averageAngle: 58,
      peakAngle: 52,
      targetRange: '35° – 55°',
      trackingQuality: 'medium',
      painScore: 3,
      aiSummary: 'You completed 8 repetitions. 2 repetitions paused at 58°. Mild discomfort was noted and logged for your physical therapist.',
    },
  ];

  const filteredItems = historyItems.filter((item) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'elbow-flexion') return item.exerciseName === 'Elbow Flexion';
    if (selectedFilter === 'shoulder-raise') return item.exerciseName === 'Shoulder Raise';
    if (selectedFilter === 'sit-to-stand') return item.exerciseName === 'Sit-to-Stand';
    return true;
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <History className="h-7 w-7 text-primary" />
            Session History Log
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Chronological archive of your completed rehabilitation sessions and telemetry.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          {[
            { id: 'all', label: 'All Sessions' },
            { id: 'elbow-flexion', label: 'Elbow' },
            { id: 'shoulder-raise', label: 'Shoulder' },
            { id: 'sit-to-stand', label: 'Sit-to-Stand' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer font-medium ${
                selectedFilter === tab.id
                  ? 'bg-primary text-primary-foreground font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* History List */}
      <div className="space-y-4">
        {filteredItems.map((item) => {
          const isExpanded = expandedId === item.id;
          const durationMin = Math.floor(item.durationSeconds / 60);
          const durationSec = item.durationSeconds % 60;

          return (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md overflow-hidden transition-all hover:border-slate-700"
            >
              {/* Row Header (Clickable for Elderly Accessibility) */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
                className="w-full p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left cursor-pointer"
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 mt-0.5 sm:mt-0">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{item.exerciseName}</h3>
                      <Badge variant="outline" className="text-[10px]">
                        {item.date}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                      <span>Reps: <strong className="text-white">{item.completedReps} / {item.totalReps}</strong></span>
                      <span>·</span>
                      <span>Duration: <strong className="text-white">{durationMin}m {durationSec}s</strong></span>
                      <span>·</span>
                      <span>Discomfort: <strong className={item.painScore > 3 ? 'text-amber-400' : 'text-emerald-400'}>{item.painScore}/10</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                    {item.trackingQuality.toUpperCase()} Quality
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Expanded Detail Panel */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-slate-800/80 bg-slate-950/50 space-y-4">
                  {/* AI Summary Banner */}
                  <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 text-xs text-slate-200 flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-white block mb-0.5">Session Summary Note:</span>
                      <p className="leading-relaxed text-slate-300">{item.aiSummary}</p>
                    </div>
                  </div>

                  {/* Telemetry Breakdown */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block text-[11px]">Peak Angle Achieved</span>
                      <span className="text-base font-bold text-white font-mono mt-0.5 block">{item.peakAngle}°</span>
                      <span className="text-[10px] text-slate-500">Target: {item.targetRange}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block text-[11px]">Average Angle</span>
                      <span className="text-base font-bold text-emerald-400 font-mono mt-0.5 block">{item.averageAngle}°</span>
                      <span className="text-[10px] text-slate-500">Across full set</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block text-[11px]">Incomplete Reps</span>
                      <span className="text-base font-bold text-amber-400 font-mono mt-0.5 block">{item.incompleteReps}</span>
                      <span className="text-[10px] text-slate-500">Returned before target</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block text-[11px]">Clinician Notified</span>
                      <span className="text-base font-bold text-blue-400 mt-0.5 block">Synced</span>
                      <span className="text-[10px] text-slate-500">Stored in health record</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <EmptyState
            icon={History}
            title="No sessions found"
            description="You do not have any recorded sessions matching this exercise filter."
            actionLabel="Reset Filter"
            onAction={() => setSelectedFilter('all')}
          />
        )}
      </div>

      <ProductDisclaimer variant="compact" className="mt-8" />
    </div>
  );
}
