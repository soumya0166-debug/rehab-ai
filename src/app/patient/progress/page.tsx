'use client';

import React from 'react';
import { TrendingUp, Activity, Award, Flame, Calendar, Info } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { ProgressChart } from '@/components/charts/ProgressChart';

export default function PatientProgressPage() {
  const romHistoryData = [
    { label: 'Session 1', value: 148, target: 172 },
    { label: 'Session 2', value: 155, target: 172 },
    { label: 'Session 3', value: 162, target: 172 },
    { label: 'Session 4', value: 169, target: 172 },
    { label: 'Session 5', value: 174, target: 172 },
    { label: 'Session 6', value: 180, target: 172 },
  ];

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <TrendingUp className="h-6 w-6 text-cyan-400" />
          Recovery Progress & Biomechanical Trends
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Objective telemetry recorded by computer vision during home rehabilitation sessions.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-[10px] uppercase font-semibold text-slate-500 block">Peak Extension ROM</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-white font-mono">180°</span>
            <span className="text-xs text-emerald-400 font-medium">Goal Met</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">+32° from baseline</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-[10px] uppercase font-semibold text-slate-500 block">Form Quality Score</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-cyan-400 font-mono">96%</span>
            <span className="text-xs text-slate-400 font-normal">avg</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Minimal compensatory lean</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-[10px] uppercase font-semibold text-slate-500 block">Comfort Status (VAS)</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-emerald-400 font-mono">2 / 10</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Mild, stable post-op</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-[10px] uppercase font-semibold text-slate-500 block">Adherence Streak</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-amber-400 font-mono">6 Days</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">92% weekly compliance</p>
        </div>

      </div>

      {/* Main ROM Progression Chart */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base">Range of Motion (ROM) Trajectory</CardTitle>
              <CardDescription>
                Terminal knee extension angles measured across your recent exercise sessions.
              </CardDescription>
            </div>
            <Badge variant="success">Protocol Goal: 172° Achieved</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ProgressChart
            data={romHistoryData}
            targetValue={172}
            unit="°"
            yMin={140}
            yMax={185}
          />
        </CardContent>
      </Card>

      {/* Clinical Review Note */}
      <Alert variant="info" title="Clinician Progress Assessment">
        Dr. Michael Chen reviewed your session telemetry on Sept 21. Quadriceps motor unit recruitment is ahead of standard post-operative timeline. Continue current exercise routine without adding weight until next clinic check-in.
      </Alert>

    </div>
  );
}
