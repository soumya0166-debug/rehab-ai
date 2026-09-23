'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Stethoscope, 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { getPatients } from '@/lib/data/store';
import { PatientProfile } from '@/types/rehab';

export default function ClinicianDashboardPage() {
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  useEffect(() => {
    setPatients(getPatients());
  }, []);

  const filteredPatients = patients.filter((pt) => {
    const matchesSearch = pt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pt.condition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = riskFilter === 'all' || pt.riskFlag === riskFilter;
    return matchesSearch && matchesRisk;
  });

  const totalPatients = patients.length;
  const avgCompliance = patients.length > 0 
    ? Math.round(patients.reduce((acc, p) => acc + p.weeklyAdherencePercent, 0) / patients.length) 
    : 0;
  const flaggedCases = patients.filter((p) => p.riskFlag === 'high' || p.riskFlag === 'medium').length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
      
      {/* Clinician Command Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            <Stethoscope className="h-4 w-4" />
            Physiotherapy Command Center
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Patient Monitoring & Telemetry Roster</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time computer vision kinematics and adherence analytics across your patient caseload.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full border border-emerald-900/60 bg-emerald-950/40 px-3 py-1 text-xs text-emerald-300 font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            AI Telemetry Stream Live
          </span>
        </div>
      </div>

      {/* Cohort KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Cohort</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white font-mono">{totalPatients}</span>
            <span className="text-xs text-slate-400">Under Care</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Caseload Compliance</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-400 font-mono">{avgCompliance}%</span>
            <span className="text-xs text-slate-400">Weekly Target Met</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Kinematic Alerts</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-rose-400 font-mono">{flaggedCases}</span>
            <span className="text-xs text-slate-400">Requiring Review</span>
          </div>
        </div>

      </div>

      {/* Roster Controls: Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search patient name, condition..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-900/80 pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <span className="text-xs text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Filter className="h-3 w-3" /> Risk:
          </span>
          {(['all', 'high', 'medium', 'low'] as const).map((level) => (
            <button
              key={level}
              onClick={() => setRiskFilter(level)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                riskFilter === level
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Patient Cohort Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPatients.map((patient) => {
          const lastSession = patient.history[0];
          const hasRisk = patient.riskFlag === 'high' || patient.riskFlag === 'medium';

          return (
            <Link
              key={patient.id}
              href={`/clinician/patient/${patient.id}`}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 hover:border-emerald-500/50 hover:bg-slate-900/90 transition-all flex flex-col justify-between group shadow-lg"
            >
              <div>
                
                {/* Header: Name & Risk Flag */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-white group-hover:text-emerald-300 transition-colors">
                      {patient.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">{patient.condition}</p>
                  </div>

                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                    patient.riskFlag === 'high' 
                      ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                      : patient.riskFlag === 'medium'
                      ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                      : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                  }`}>
                    {patient.riskFlag || 'low'} risk
                  </span>
                </div>

                {/* Risk Callout if present */}
                {patient.riskReason && (
                  <div className="mt-3 rounded-lg border border-amber-900/50 bg-amber-950/30 p-2.5 text-[11px] text-amber-300 flex items-start gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-400 mt-0.5" />
                    <span>{patient.riskReason}</span>
                  </div>
                )}

                {/* Patient Biometrics & Adherence */}
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-800/80">
                  <div className="rounded-lg bg-slate-950/60 p-2 border border-slate-800/60">
                    <span className="text-[10px] text-slate-500 uppercase block">Weekly Adherence</span>
                    <span className="font-bold text-white font-mono text-sm">{patient.weeklyAdherencePercent}%</span>
                  </div>

                  <div className="rounded-lg bg-slate-950/60 p-2 border border-slate-800/60">
                    <span className="text-[10px] text-slate-500 uppercase block">Streak</span>
                    <span className="font-bold text-cyan-400 font-mono text-sm">{patient.complianceStreak} days</span>
                  </div>
                </div>

                {/* Last Session summary */}
                <div className="mt-3 text-xs text-slate-400">
                  {lastSession ? (
                    <div className="flex justify-between items-center">
                      <span>Last: <strong className="text-slate-300">{lastSession.exerciseName.split(' ')[0]}</strong></span>
                      <span className="font-mono text-emerald-400 font-semibold">{lastSession.overallScore}% score</span>
                    </div>
                  ) : (
                    <span>No sessions recorded yet</span>
                  )}
                </div>

              </div>

              {/* Action link */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-emerald-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                <span>Inspect Telemetry & Plan</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </Link>
          );
        })}
      </div>

    </div>
  );
}
