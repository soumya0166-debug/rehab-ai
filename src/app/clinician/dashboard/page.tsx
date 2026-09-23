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
  Stethoscope,
  Clock,
  Activity,
  Calendar,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { getPatientsList } from '@/lib/db/repository';

export default function ClinicianDashboardPage() {
  const patients = getPatientsList();
  const assignedPatientsCount = patients.length;
  const sessionsTodayCount = 14;
  const sessionsRequiringReviewCount = patients.filter(
    (p) => p.status === 'review_needed' || p.currentPainLevel >= 5
  ).length;

  // Recent activity telemetry feed
  const recentActivities = [
    {
      id: 'act-1',
      patientId: 'pt-001',
      patientName: 'Sarah Connor',
      exercise: 'Elbow Flexion',
      time: '15 mins ago',
      metric: 'Peak ROM 46° (Target 35°–55°)',
      quality: 'High Quality',
      discomfort: '1/10 VAS',
      status: 'normal',
    },
    {
      id: 'act-2',
      patientId: 'pt-002',
      patientName: 'Marcus Wright',
      exercise: 'Shoulder Raise',
      time: '1 hour ago',
      metric: 'Peak ROM 78° (Target 85°–110°)',
      quality: 'Medium Quality',
      discomfort: '6/10 VAS (Review Flag)',
      status: 'review_needed',
    },
    {
      id: 'act-3',
      patientId: 'pt-003',
      patientName: 'Kyle Reese',
      exercise: 'Sit-to-Stand',
      time: '2 hours ago',
      metric: 'Peak ROM 178° (Target 170°–180°)',
      quality: 'High Quality',
      discomfort: '0/10 VAS',
      status: 'normal',
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-6 w-6 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Physiotherapist Clinical Dashboard
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Supervising Clinician: <strong className="text-slate-200">Dr. Michael Chen, PT, DPT</strong> · Sports & Orthopedic Rehabilitation
          </p>
        </div>

        <Link href="/clinician/patients">
          <Button className="gap-2 text-xs font-semibold">
            <span>View All Patients ({assignedPatientsCount})</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>

      {/* 4 Core KPIs: Assigned Patients, Sessions Today, Sessions Requiring Review, Recent Activity */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-md">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Assigned Patients
              </span>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-white font-mono">{assignedPatientsCount}</span>
                <span className="text-xs text-slate-400">active</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Users className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-md">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Sessions Today
              </span>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-emerald-400 font-mono">{sessionsTodayCount}</span>
                <span className="text-xs text-slate-400">completed</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-md">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Requiring Review
              </span>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-amber-400 font-mono">{sessionsRequiringReviewCount}</span>
                <span className="text-xs text-amber-500 font-semibold">Triage flags</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-md">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Caseload Adherence
              </span>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-blue-400 font-mono">91%</span>
                <span className="text-xs text-emerald-400 font-semibold">↑ Weekly</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <TrendingUp className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mandatory Non-Diagnostic Clinical Boundary Watermark */}
      <Alert variant="info" title="Clinical Decision Support Notice">
        All telemetry values are <strong>system-generated kinematic measurements</strong> produced by computer vision state machines. They do not constitute an automated medical diagnosis and must be evaluated in conjunction with professional clinical judgment. Only authorized clinicians can modify prescriptions.
      </Alert>

      {/* Recent Activity Telemetry Stream */}
      <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              <CardTitle className="text-base text-white">Recent Patient Activity Stream</CardTitle>
            </div>
            <span className="text-xs text-slate-400">Real-time incoming telemetry</span>
          </div>
          <CardDescription>Verified joint angle recordings submitted from home exercise sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivities.map((act) => {
              const isAlert = act.status === 'review_needed';
              return (
                <div
                  key={act.id}
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors ${
                    isAlert
                      ? 'bg-amber-950/20 border-amber-500/40 text-amber-200'
                      : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/clinician/patients/${act.patientId}`}
                        className="font-bold text-sm text-white hover:text-primary transition-colors"
                      >
                        {act.patientName}
                      </Link>
                      <Badge variant={isAlert ? 'destructive' : 'neutral'} className="text-[10px]">
                        {act.exercise}
                      </Badge>
                      <span className="text-[11px] text-slate-400">{act.time}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-slate-400 text-[11px]">
                      <span>Telemetry: <strong className="text-white">{act.metric}</strong></span>
                      <span>·</span>
                      <span>Tracking: <strong className="text-white">{act.quality}</strong></span>
                      <span>·</span>
                      <span>Discomfort: <strong className={isAlert ? 'text-rose-400 font-bold' : 'text-slate-300'}>{act.discomfort}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Link href={`/clinician/patients/${act.patientId}/sessions`}>
                      <Button variant="secondary" size="sm" className="text-xs">
                        Review Session
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
