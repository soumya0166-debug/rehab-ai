'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Activity, 
  Flame, 
  Calendar, 
  TrendingUp, 
  Play, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  Award,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { getPatients } from '@/lib/data/store';
import { PatientProfile } from '@/types/rehab';

export default function PatientDashboardPage() {
  const [patient, setPatient] = useState<PatientProfile | null>(null);

  useEffect(() => {
    const list = getPatients();
    if (list.length > 0) {
      setPatient(list[0]); // Sarah Connor as default active patient
    }
  }, []);

  if (!patient) {
    return (
      <div className="flex h-96 items-center justify-center text-slate-400">
        Loading patient profile...
      </div>
    );
  }

  // Generate chart data from patient history
  const chartData = patient.history
    .slice()
    .reverse()
    .map((sess, idx) => ({
      sessionName: `Session ${idx + 1}`,
      rom: sess.peakRom,
      target: sess.targetRom,
      score: sess.overallScore,
      pain: sess.painScore,
    }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
      
      {/* Patient Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-950">
              <Activity className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">{patient.name}</h1>
                <span className="rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-xs font-semibold text-cyan-400 border border-cyan-500/20">
                  {patient.condition}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Supervising Clinician: <span className="text-slate-300 font-medium">{patient.assignedClinician}</span> · Left Knee Recovery Protocol
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/patient/session/knee-extension"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-900/40 hover:from-cyan-400 hover:to-blue-500 transition-all transform hover:-translate-y-0.5"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              Start Today's Workout
            </Link>
          </div>
        </div>

        {/* Recovery KPI Badges */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-800/80">
          
          <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-3">
            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
              <Flame className="h-4 w-4" />
              <span>Adherence Streak</span>
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl font-bold text-white font-mono">{patient.complianceStreak}</span>
              <span className="text-xs text-slate-400">Days</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-3">
            <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-medium">
              <TrendingUp className="h-4 w-4" />
              <span>Weekly Compliance</span>
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl font-bold text-white font-mono">{patient.weeklyAdherencePercent}%</span>
              <span className="text-xs text-emerald-400 font-medium">↑ High</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-3">
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
              <Award className="h-4 w-4" />
              <span>Average Form Score</span>
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl font-bold text-white font-mono">
                {patient.history.length > 0
                  ? Math.round(patient.history.reduce((a, b) => a + b.overallScore, 0) / patient.history.length)
                  : 95}
              </span>
              <span className="text-xs text-slate-400">/100</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-3">
            <div className="flex items-center gap-1.5 text-xs text-purple-400 font-medium">
              <Activity className="h-4 w-4" />
              <span>Peak Extension ROM</span>
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl font-bold text-white font-mono">180°</span>
              <span className="text-xs text-cyan-400 font-medium">Goal Reached</span>
            </div>
          </div>

        </div>
      </div>

      {/* Grid: Prescribed Program + ROM Trajectory Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2 Cols): Active Prescriptions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Prescribed Rehabilitation Program</h2>
              <p className="text-xs text-slate-400">Assigned by {patient.assignedClinician}</p>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
              {patient.prescriptions.length} Active Protocols
            </span>
          </div>

          <div className="space-y-4">
            {patient.prescriptions.map((rx) => (
              <div
                key={rx.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 hover:border-slate-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white">{rx.exerciseName}</h3>
                    <span className="text-xs font-mono font-medium text-cyan-400 bg-cyan-950/60 border border-cyan-900/50 px-2 py-0.5 rounded">
                      {rx.targetAngleMin}° target
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{rx.notesForPatient}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-slate-300 pt-1">
                    <span>
                      Sets & Reps: <strong className="text-white">{rx.targetSets} sets × {rx.targetReps} reps</strong>
                    </span>
                    <span>·</span>
                    <span>
                      Hold: <strong className="text-white">{rx.holdDurationSeconds}s</strong>
                    </span>
                    <span>·</span>
                    <span>
                      Freq: <strong className="text-white">{rx.frequencyDaysPerWeek}d / week</strong>
                    </span>
                  </div>
                </div>

                <Link
                  href={`/patient/session/${rx.exerciseId}`}
                  className="shrink-0 flex items-center gap-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  Launch Session
                </Link>
              </div>
            ))}
          </div>

          {/* ROM Recovery Trajectory Chart */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-sm">Range of Motion (ROM) Trajectory</h3>
                <p className="text-xs text-slate-400">Peak Knee Extension Progression vs Target Angle (172°)</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" /> Peak Angle Achieved
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /> Target Angle
                </span>
              </div>
            </div>

            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="sessionName" stroke="#64748b" fontSize={11} />
                  <YAxis domain={[150, 185]} stroke="#64748b" fontSize={11} unit="°" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <ReferenceLine y={172} stroke="#10b981" strokeDasharray="4 4" label={{ value: 'Target: 172°', fill: '#10b981', fontSize: 11 }} />
                  <Line 
                    type="monotone" 
                    dataKey="rom" 
                    stroke="#06b6d4" 
                    strokeWidth={3} 
                    dot={{ fill: '#06b6d4', r: 5 }} 
                    activeDot={{ r: 7 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Right Column: Session History Feed */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">Recent Session Logs</h2>

          <div className="space-y-3">
            {patient.history.map((sess) => (
              <div
                key={sess.id}
                className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2.5 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">{sess.exerciseName}</span>
                  <span className="text-slate-500 font-mono">
                    {new Date(sess.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs py-1 bg-slate-950/60 rounded-lg border border-slate-800/80">
                  <div>
                    <div className="text-[10px] text-slate-500">Reps</div>
                    <div className="font-bold text-white font-mono">{sess.completedReps}/{sess.targetReps}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">Peak ROM</div>
                    <div className="font-bold text-cyan-400 font-mono">{sess.peakRom}°</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">Form Score</div>
                    <div className="font-bold text-emerald-400 font-mono">{sess.overallScore}%</div>
                  </div>
                </div>

                {sess.clinicianNotes && (
                  <div className="rounded-lg bg-emerald-950/30 border border-emerald-900/40 p-2 text-[11px] text-emerald-300">
                    <span className="font-semibold block text-[10px] text-emerald-400 uppercase tracking-wider mb-0.5">Clinician Feedback</span>
                    {sess.clinicianNotes}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
}
