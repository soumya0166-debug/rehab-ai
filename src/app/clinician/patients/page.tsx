'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Search, 
  Filter, 
  Calendar, 
  ChevronRight, 
  ArrowLeft,
  AlertTriangle,
  CheckCircle2 
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getPatientsList } from '@/lib/db/repository';

export default function ClinicianPatientsPage() {
  const patients = getPatientsList();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'review_needed'>('all');

  const filtered = patients.filter((pt) => {
    const matchesQuery = pt.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pt.condition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || pt.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/clinician/dashboard"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <Users className="h-6 w-6 text-teal-400" />
              Patient Clinical Directory
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Review telemetry, prescribe dosage, and monitor adherence across your active caseload.
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search patient by name, diagnosis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs self-end sm:self-auto">
          {(['all', 'active', 'review_needed'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-colors cursor-pointer ${
                statusFilter === filter ? 'bg-teal-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {filter.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Patients Table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950/80 text-[10px] uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Patient Name</th>
                <th className="px-6 py-4 font-semibold">Diagnosis / Condition</th>
                <th className="px-6 py-4 font-semibold">Limb</th>
                <th className="px-6 py-4 font-semibold">Surgery Date</th>
                <th className="px-6 py-4 font-semibold">Adherence</th>
                <th className="px-6 py-4 font-semibold">Pain (VAS)</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filtered.map((patient) => {
                const isWarning = patient.status === 'review_needed' || patient.currentPainLevel >= 5;

                return (
                  <tr key={patient.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-white">
                      {patient.fullName}
                      <span className="block text-[11px] text-slate-500 font-normal">Age {patient.age}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-300">{patient.condition}</td>
                    <td className="px-6 py-4 capitalize font-mono">{patient.affectedSide}</td>
                    <td className="px-6 py-4 font-mono text-slate-400">
                      {patient.surgeryDate || 'Conservative'}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-emerald-400">
                      {patient.adherenceRate}% ({patient.streakDays}d streak)
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded font-mono text-[11px] ${
                        patient.currentPainLevel >= 5 ? 'bg-amber-950 text-amber-300' : 'bg-emerald-950 text-emerald-300'
                      }`}>
                        {patient.currentPainLevel}/10
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={isWarning ? 'warning' : 'success'}>
                        {isWarning ? 'Review Needed' : 'Normal Trajectory'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/clinician/dashboard`}>
                        <Button variant="ghost" size="sm">
                          <span>Inspect</span>
                          <ChevronRight className="h-3.5 w-3.5 ml-1" />
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
