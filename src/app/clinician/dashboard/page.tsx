'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck,
  Stethoscope 
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { PatientCard } from '@/components/clinician/PatientCard';
import { getPatientsList } from '@/lib/db/repository';

export default function ClinicianDashboardPage() {
  const patients = getPatientsList();
  const activeCount = patients.length;
  const reviewNeededCount = patients.filter((p) => p.status === 'review_needed' || p.currentPainLevel >= 5).length;
  const averageCompliance = Math.round(patients.reduce((acc, p) => acc + p.adherenceRate, 0) / patients.length);

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Stethoscope className="h-6 w-6 text-teal-400" />
            Physiotherapy Caseload Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Supervising Clinician: <strong className="text-slate-200">Dr. Michael Chen, DPT</strong> · Sports & Orthopedic Rehabilitation
          </p>
        </div>

        <Link href="/clinician/patients">
          <Button variant="primary" size="sm">
            <span>Open Full Directory ({activeCount})</span>
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </Link>
      </div>

      {/* Caseload Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Cohort</span>
            <Users className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white font-mono">{activeCount}</span>
            <span className="text-xs text-slate-400">Patients Under Care</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Caseload Adherence</span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-400 font-mono">{averageCompliance}%</span>
            <span className="text-xs text-slate-400">Weekly Target Met</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Triage Alerts</span>
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-amber-400 font-mono">{reviewNeededCount}</span>
            <span className="text-xs text-slate-400">Cases For Review</span>
          </div>
        </div>

      </div>

      {/* Triage Priority Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Priority Patient Roster</h3>
            <p className="text-xs text-slate-400">Deterministic movement metrics flagged from home sessions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {patients.map((patient) => (
            <PatientCard
              key={patient.id}
              id={patient.id}
              name={patient.fullName}
              condition={patient.condition}
              affectedSide={patient.affectedSide}
              adherenceRate={patient.adherenceRate}
              streakDays={patient.streakDays}
              painLevel={patient.currentPainLevel}
              status={patient.status}
            />
          ))}
        </div>
      </div>

      {/* Safety & Protocol Boundary */}
      <Alert variant="info" title="Clinician Authority Reminder">
        REHAB-AI does not alter target ranges or prescribe new exercises autonomously. You have exclusive authority to adjust repetition targets, sets, and hold thresholds.
      </Alert>

    </div>
  );
}
