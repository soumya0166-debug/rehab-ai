'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  TrendingUp, 
  Activity, 
  Calendar, 
  Printer, 
  FileText, 
  Award, 
  Flame, 
  ShieldCheck, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  BarChart,
  Bar,
  AreaChart,
  Area
} from 'recharts';
import { getPatients } from '@/lib/data/store';
import { PatientProfile } from '@/types/rehab';

export default function PatientAnalyticsPage() {
  const [patient, setPatient] = useState<PatientProfile | null>(null);

  useEffect(() => {
    const list = getPatients();
    if (list.length > 0) setPatient(list[0]);
  }, []);

  if (!patient) {
    return (
      <div className="flex h-96 items-center justify-center text-slate-400">
        Loading rehabilitation analytics...
      </div>
    );
  }

  // Multi-week longitudinal recovery data
  const recoveryTrendData = [
    { week: 'Week 1', rom: 145, target: 160, pain: 6, formScore: 82 },
    { week: 'Week 2', rom: 156, target: 165, pain: 5, formScore: 86 },
    { week: 'Week 3', rom: 168, target: 170, pain: 3, formScore: 91 },
    { week: 'Week 4', rom: 174, target: 172, pain: 2, formScore: 94 },
    { week: 'Week 5 (Current)', rom: 180, target: 172, pain: 1, formScore: 98 },
  ];

  // Adherence calendar 4-week matrix
  const adherenceWeeks = [
    { weekNum: 1, days: [true, true, true, false, true, true, false] },
    { weekNum: 2, days: [true, true, false, true, true, true, false] },
    { weekNum: 3, days: [true, true, true, true, true, false, true] },
    { weekNum: 4, days: [true, true, true, true, true, true, false] },
  ];

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8 print:p-0 print:m-0">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <Link
            href="/patient"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              Recovery Analytics & Biomechanical Trends
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Longitudinal tracking for {patient.name} · Protocol: {patient.condition}
            </p>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
        >
          <Printer className="h-4 w-4" />
          Export / Print Clinical Report
        </button>
      </div>

      {/* Printable Clinical Header (Only visible on print) */}
      <div className="hidden print:block border-b border-slate-700 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-900">REHAB-AI: Tele-Rehabilitation Progress Report</h1>
        <p className="text-sm text-slate-600">Patient: {patient.name} | Condition: {patient.condition} | Clinician: {patient.assignedClinician}</p>
        <p className="text-xs text-slate-500">Generated on {new Date().toLocaleDateString()} via Computer Vision Telemetry</p>
      </div>

      {/* High-Level Recovery Milestone KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 print:border-slate-300 print:bg-slate-50">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Total Net ROM Gain</span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-cyan-400 font-mono print:text-cyan-700">+35°</span>
            <span className="text-xs text-emerald-400">↑ 24% Gain</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">From 145° (Week 1) to 180° full extension</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 print:border-slate-300 print:bg-slate-50">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Pain Reduction</span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-emerald-400 font-mono print:text-emerald-700">-83%</span>
            <span className="text-xs text-slate-400">VAS Scale</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Decreased from 6/10 to 1/10 (Mild)</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 print:border-slate-300 print:bg-slate-50">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Form Quality Consistency</span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-purple-400 font-mono print:text-purple-700">98%</span>
            <span className="text-xs text-slate-400">Score</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Optimal quadriceps firing without lean</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 print:border-slate-300 print:bg-slate-50">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Cumulative Adherence</span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-amber-400 font-mono print:text-amber-700">92%</span>
            <span className="text-xs text-emerald-400">Target Met</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">26 completed of 28 prescribed sessions</p>
        </div>

      </div>

      {/* Chart 1: Longitudinal Recovery Curve */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-white text-base">Longitudinal Range of Motion (ROM) Trajectory</h3>
            <p className="text-xs text-slate-400">Comparing 5-week measured extension angle vs clinical target</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="text-cyan-400 flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" /> Measured ROM (°)
            </span>
            <span className="text-emerald-400 flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /> Protocol Target (°)
            </span>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={recoveryTrendData}>
              <defs>
                <linearGradient id="romGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="week" stroke="#64748b" fontSize={11} />
              <YAxis domain={[135, 190]} stroke="#64748b" fontSize={11} unit="°" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
              <ReferenceLine y={172} stroke="#10b981" strokeDasharray="4 4" label={{ value: 'Target Goal: 172°', fill: '#10b981', fontSize: 11 }} />
              <Area type="monotone" dataKey="rom" stroke="#06b6d4" strokeWidth={3} fill="url(#romGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Pain Reduction vs ROM Correlation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div>
            <h3 className="font-bold text-white text-base">Pain Level (VAS 0-10) Trend Over Time</h3>
            <p className="text-xs text-slate-400">Self-reported pain rating tracking during terminal extension</p>
          </div>

          <div className="h-60 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recoveryTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="week" stroke="#64748b" fontSize={11} />
                <YAxis domain={[0, 10]} stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="pain" fill="#f43f5e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Adherence Consistency Heatmap */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div>
            <h3 className="font-bold text-white text-base">Rehabilitation Adherence Heatmap</h3>
            <p className="text-xs text-slate-400">Completed daily home sessions over the past 4 weeks</p>
          </div>

          <div className="space-y-3 pt-2">
            {adherenceWeeks.map((w) => (
              <div key={w.weekNum} className="flex items-center gap-3">
                <span className="text-xs text-slate-400 w-16 font-mono">Week {w.weekNum}</span>
                <div className="flex-1 grid grid-cols-7 gap-2">
                  {w.days.map((done, dIdx) => (
                    <div
                      key={dIdx}
                      title={`Day ${dIdx + 1}: ${done ? 'Completed' : 'Rest'}`}
                      className={`h-8 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                        done
                          ? 'bg-gradient-to-tr from-cyan-600 to-emerald-500 text-white shadow-sm'
                          : 'bg-slate-800/60 text-slate-600'
                      }`}
                    >
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'][dIdx]}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-4 text-xs text-slate-400 pt-2">
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-slate-800" /> Rest Day
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-emerald-500" /> Session Completed
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
