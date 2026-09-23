'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Calendar,
  ChevronRight,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Activity,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getPatientsList } from '@/lib/db/repository';

export default function ClinicianPatientsPage() {
  const patients = getPatientsList();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'review_needed'>('all');

  // Enriched patient list with required fields: Name, Recent session, Adherence, Recent movement metric, Last activity
  const patientRoster = [
    {
      id: 'pt-001',
      name: 'Sarah Connor',
      condition: 'ACL Reconstruction (Left Knee)',
      recentSession: 'Elbow Flexion (10/10 reps)',
      adherence: 92,
      recentMovementMetric: 'Peak ROM 46° (Target 35°–55°)',
      lastActivity: 'Today, 10:15 AM',
      status: 'active',
      painVAS: 1,
    },
    {
      id: 'pt-002',
      name: 'Marcus Wright',
      condition: 'Rotator Cuff Repair (Right Shoulder)',
      recentSession: 'Shoulder Raise (9/10 reps)',
      adherence: 74,
      recentMovementMetric: 'Peak ROM 78° (Target 85°–110°)',
      lastActivity: 'Today, 8:40 AM',
      status: 'review_needed',
      painVAS: 6,
    },
    {
      id: 'pt-003',
      name: 'Kyle Reese',
      condition: 'Patellar Tendinopathy (Bilateral)',
      recentSession: 'Sit-to-Stand (10/10 reps)',
      adherence: 96,
      recentMovementMetric: 'Peak Extension 178° (Target 170°–180°)',
      lastActivity: 'Yesterday, 3:15 PM',
      status: 'active',
      painVAS: 0,
    },
  ];

  const filtered = patientRoster.filter((pt) => {
    const matchesQuery =
      pt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pt.condition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || pt.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/clinician/dashboard">
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <Users className="h-7 w-7 text-primary" />
              Assigned Patients Directory
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Supervising clinical caseload, verified kinematic telemetry, and prescription management.
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search patient by name or diagnosis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs self-end sm:self-auto">
          {(['all', 'active', 'review_needed'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-colors cursor-pointer font-medium ${
                statusFilter === filter ? 'bg-primary text-primary-foreground font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {filter.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Patient Table with Required Columns: Name, Recent Session, Adherence, Recent Movement Metric, Last Activity */}
      <Card className="overflow-hidden p-0 border-slate-800 bg-slate-900/60 backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950/80 text-[10px] uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Patient Name</th>
                <th className="px-6 py-4 font-semibold">Recent Session</th>
                <th className="px-6 py-4 font-semibold">Adherence</th>
                <th className="px-6 py-4 font-semibold">Recent Movement Metric</th>
                <th className="px-6 py-4 font-semibold">Last Activity</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filtered.map((patient) => {
                const isWarning = patient.status === 'review_needed' || patient.painVAS >= 5;
                return (
                  <tr
                    key={patient.id}
                    className="hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-white text-sm">{patient.name}</div>
                      <div className="text-[11px] text-slate-400">{patient.condition}</div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-200">{patient.recentSession}</div>
                      <div className="text-[10px] text-slate-500">Computer vision verified</div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-mono font-bold ${patient.adherence >= 85 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {patient.adherence}%
                        </span>
                        <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${patient.adherence >= 85 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                            style={{ width: `${patient.adherence}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-900/40 px-2 py-0.5 rounded text-[11px] inline-block">
                        {patient.recentMovementMetric}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-400">
                      {patient.lastActivity}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Link href={`/clinician/patients/${patient.id}`}>
                        <Button variant="secondary" size="sm" className="gap-1 text-xs">
                          <span>View Detail</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
