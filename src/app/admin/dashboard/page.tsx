'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  UserCheck, 
  Database, 
  Key, 
  CheckCircle2, 
  Lock, 
  Activity,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/auth-context';
import { SEED_PROFILES } from '@/lib/auth/auth-service';
import { CanonicalRole } from '@/types';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [filterRole, setFilterRole] = useState<string>('ALL');

  const usersList = [
    SEED_PROFILES.PATIENT,
    SEED_PROFILES.PHYSIOTHERAPIST,
    SEED_PROFILES.CAREGIVER,
    SEED_PROFILES.ADMIN,
  ];

  const filtered = filterRole === 'ALL' 
    ? usersList 
    : usersList.filter(u => u.role === filterRole);

  const rlsTables = [
    { name: 'profiles', rls: 'ACTIVE', rule: 'Users view own; Admins view all; Physiotherapists/Caregivers view assigned' },
    { name: 'patients', rls: 'ACTIVE', rule: 'Patient views own; Physiotherapist views assigned; Caregiver views authorized' },
    { name: 'clinician_patient', rls: 'ACTIVE', rule: 'Clinicians & Admins manage assigned patient roster' },
    { name: 'caregiver_patient', rls: 'ACTIVE', rule: 'Patients & Admins manage caregiver authorizations' },
    { name: 'patient_records', rls: 'ACTIVE', rule: 'Assigned Clinicians modify; Authorized Caregivers read; Patients read' },
    { name: 'prescriptions', rls: 'ACTIVE', rule: 'Assigned Clinicians write/update; Patients read own' },
    { name: 'exercise_sessions', rls: 'ACTIVE', rule: 'Patients insert own; Assigned Clinicians review' },
    { name: 'rep_telemetry', rls: 'ACTIVE', rule: 'Patients insert telemetry; Assigned Clinicians read' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">System Administration & RBAC Console</h1>
            <span className="rounded-full bg-purple-950 px-2.5 py-0.5 text-[11px] font-mono font-semibold text-purple-300 border border-purple-800">
              Admin Access Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Global authority: Monitor PostgreSQL Row Level Security (RLS) enforcement, user profiles, and clinical assignments.
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total Profiles</span>
          <span className="text-2xl font-bold text-white mt-1 block">4 Enrolled</span>
          <span className="text-[10px] text-cyan-400 mt-0.5 block">Synced to auth.users</span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Canonical Roles</span>
          <span className="text-2xl font-bold text-white mt-1 block">4 Configured</span>
          <span className="text-[10px] text-teal-400 mt-0.5 block">PATIENT, PHYSIO, CAREGIVER, ADMIN</span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Database RLS</span>
          <span className="text-2xl font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
            <CheckCircle2 className="h-5 w-5" />
            100% Enforced
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">8 Tables Protected</span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Service Role Shield</span>
          <span className="text-2xl font-bold text-purple-400 mt-1 flex items-center gap-1.5">
            <Lock className="h-5 w-5" />
            Isolated
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Zero browser exposure</span>
        </div>
      </div>

      {/* User Directory & Profiles Table */}
      <Card id="users">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-400" />
              <CardTitle className="text-base">Registered Profiles Table (PostgreSQL)</CardTitle>
            </div>
            <CardDescription>Verified profiles linked to auth.users(id)</CardDescription>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold">
            {['ALL', 'PATIENT', 'PHYSIOTHERAPIST', 'CAREGIVER', 'ADMIN'].map((r) => (
              <button
                key={r}
                onClick={() => setFilterRole(r)}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-[11px] ${
                  filterRole === r ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="pb-3 pl-2">User Identity</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Verified Role</th>
                  <th className="pb-3">Language</th>
                  <th className="pb-3 pr-2 text-right">Access Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 pl-2 flex items-center gap-2.5">
                      <img src={p.avatarUrl} alt="" className="h-7 w-7 rounded-full object-cover border border-slate-700" />
                      <div>
                        <span className="font-semibold text-white block">{p.fullName}</span>
                        <span className="font-mono text-[10px] text-slate-500">{p.id}</span>
                      </div>
                    </td>
                    <td className="py-3 text-slate-300 font-mono text-[11px]">{p.email}</td>
                    <td className="py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold font-mono ${
                        p.role === 'PATIENT' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' :
                        p.role === 'PHYSIOTHERAPIST' ? 'bg-teal-950 text-teal-400 border border-teal-800' :
                        p.role === 'CAREGIVER' ? 'bg-pink-950 text-pink-400 border border-pink-800' :
                        'bg-purple-950 text-purple-400 border border-purple-800'
                      }`}>
                        {p.role}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400 uppercase font-mono">{p.language || 'en'}</td>
                    <td className="py-3 pr-2 text-right">
                      <span className="text-[11px] text-slate-300 font-medium">
                        {p.role === 'ADMIN' ? 'Universal' : 'Role-Restricted'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Database RLS Policy Audit */}
      <Card id="rls">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-emerald-400" />
            <CardTitle className="text-base">Database Row Level Security (RLS) Policy Audit</CardTitle>
          </div>
          <CardDescription>Backend-enforced PostgreSQL security guarantees</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-xs">
            {rlsTables.map((t) => (
              <div key={t.name} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border border-slate-800/80 bg-slate-900/50 gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-cyan-400 font-semibold text-xs">public.{t.name}</span>
                  <span className="rounded bg-emerald-950/80 px-2 py-0.5 text-[10px] font-mono text-emerald-400 border border-emerald-800/60 font-semibold">
                    RLS {t.rls}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 max-w-xl text-left sm:text-right">
                  {t.rule}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
