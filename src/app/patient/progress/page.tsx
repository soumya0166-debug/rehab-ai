'use client';

import React from 'react';
import {
  TrendingUp,
  Activity,
  CheckCircle2,
  Calendar,
  Clock,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Target,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';

export default function PatientProgressPage() {
  // 1. Movement Performance Trend Data (Strictly non-diagnostic neutral wording)
  const movementTrendData = [
    { session: 'S1 (Mon)', angle: 142, targetMin: 140, targetMax: 160 },
    { session: 'S2 (Tue)', angle: 148, targetMin: 140, targetMax: 160 },
    { session: 'S3 (Wed)', angle: 151, targetMin: 140, targetMax: 160 },
    { session: 'S4 (Thu)', angle: 154, targetMin: 140, targetMax: 160 },
    { session: 'S5 (Fri)', angle: 157, targetMin: 140, targetMax: 160 },
    { session: 'S6 (Sat)', angle: 159, targetMin: 140, targetMax: 160 },
  ];

  // 2. Repetition Completion Data (Successful vs Incomplete)
  const repetitionData = [
    { day: 'Mon', successful: 10, incomplete: 2 },
    { day: 'Tue', successful: 10, incomplete: 1 },
    { day: 'Wed', successful: 10, incomplete: 0 },
    { day: 'Thu', successful: 9, incomplete: 1 },
    { day: 'Fri', successful: 10, incomplete: 0 },
    { day: 'Sat', successful: 10, incomplete: 0 },
    { day: 'Sun', successful: 10, incomplete: 0 },
  ];

  // 3. Sessions Over Time (Minutes spent per day)
  const sessionsOverTimeData = [
    { week: 'Week 1', sessions: 5, totalMinutes: 65 },
    { week: 'Week 2', sessions: 6, totalMinutes: 80 },
    { week: 'Week 3', sessions: 6, totalMinutes: 85 },
    { week: 'Week 4', sessions: 7, totalMinutes: 95 },
  ];

  // 4. Adherence Rate Data (%)
  const adherenceData = [
    { period: 'Week 1', adherence: 82 },
    { period: 'Week 2', adherence: 88 },
    { period: 'Week 3', adherence: 90 },
    { period: 'Week 4', adherence: 96 },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <TrendingUp className="h-7 w-7 text-primary" />
            Movement Performance Trends
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Objective kinematic telemetry measured locally across your exercise sessions.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Clinician-Verified Telemetry</span>
        </div>
      </div>

      {/* Mandatory Non-Diagnostic Clinical Boundary Notice */}
      <Alert variant="info" title="Clinical Measurement Notice">
        Statistical trends represent objective joint angle and repetition tracking detected by computer vision. They are provided as a neutral <strong>Movement performance trend</strong> and do not constitute an automated medical diagnosis or clinical discharge clearance.
      </Alert>

      {/* KPI Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60">
          <span className="text-xs text-slate-400 block font-medium">Weekly Adherence</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-black text-emerald-400 font-mono">92%</span>
            <span className="text-xs text-emerald-500 font-semibold">↑ High</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">6 of 7 scheduled sessions</span>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60">
          <span className="text-xs text-slate-400 block font-medium">Clean Rep Ratio</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-black text-blue-400 font-mono">96%</span>
            <span className="text-xs text-slate-400">of reps</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Reached full target range</span>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60">
          <span className="text-xs text-slate-400 block font-medium">Average Cadence</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-black text-purple-400 font-mono">4.2s</span>
            <span className="text-xs text-slate-400">/ rep</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Smooth controlled speed</span>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60">
          <span className="text-xs text-slate-400 block font-medium">Average Discomfort (VAS)</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-black text-amber-400 font-mono">1.8</span>
            <span className="text-xs text-slate-400">/ 10</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Within safe threshold (&lt;5)</span>
        </div>
      </div>

      {/* Chart 1: Movement Performance Trend */}
      <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-md">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                Movement Performance Trend
              </CardTitle>
              <CardDescription>
                Primary joint angle trajectory across completed sessions compared with target range envelope.
              </CardDescription>
            </div>
            <Badge variant="success">Within Configured Target Range</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 sm:h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={movementTrendData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="session" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[130, 170]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                <ReferenceLine y={160} stroke="#10b981" strokeDasharray="4 4" label={{ value: 'Target Max', fill: '#10b981', fontSize: 10 }} />
                <ReferenceLine y={140} stroke="#38bdf8" strokeDasharray="4 4" label={{ value: 'Target Min', fill: '#38bdf8', fontSize: 10 }} />
                <Line
                  type="monotone"
                  dataKey="angle"
                  name="Detected Joint Angle (°)"
                  stroke="#38bdf8"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#0284c7', stroke: '#fff', strokeWidth: 2 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Grid: Chart 2 (Repetition Completion) & Chart 3 (Sessions Over Time) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chart 2: Repetition Completion */}
        <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Repetition Completion
            </CardTitle>
            <CardDescription>
              Successful full-range repetitions vs incomplete movements by day.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-60 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={repetitionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                  <Bar dataKey="successful" name="Successful Reps" fill="#10b981" radius={[4, 4, 0, 0]} stackId="a" />
                  <Bar dataKey="incomplete" name="Incomplete Reps" fill="#f59e0b" radius={[4, 4, 0, 0]} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Chart 3: Sessions Over Time */}
        <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              Sessions Over Time
            </CardTitle>
            <CardDescription>
              Weekly completed session frequency and active rehabilitation minutes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-60 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sessionsOverTimeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis dataKey="week" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                  <Bar dataKey="sessions" name="Sessions Done" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="totalMinutes" name="Active Minutes" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart 4: Adherence Trend */}
      <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-400" />
            Adherence & Protocol Compliance
          </CardTitle>
          <CardDescription>
            Percentage of prescribed rehabilitation sessions completed on schedule.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={adherenceData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="period" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[70, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="adherence"
                  name="Adherence Rate (%)"
                  stroke="#a855f7"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#9333ea', stroke: '#fff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
