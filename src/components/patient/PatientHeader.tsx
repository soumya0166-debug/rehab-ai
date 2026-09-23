import React from 'react';
import { User, Stethoscope, Flame, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface PatientHeaderProps {
  name: string;
  condition: string;
  clinicianName: string;
  streakDays: number;
  adherenceRate: number;
}

export function PatientHeader({
  name,
  condition,
  clinicianName,
  streakDays,
  adherenceRate,
}: PatientHeaderProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
            <User className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">{name}</h2>
              <Badge variant="default">{condition}</Badge>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <Stethoscope className="h-3.5 w-3.5 text-emerald-400" />
              Supervising Clinician: <span className="text-slate-200 font-medium">{clinicianName}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 px-3.5 py-2 text-center">
            <span className="text-[10px] uppercase font-semibold text-slate-500 block flex items-center justify-center gap-1">
              <Flame className="h-3 w-3 text-amber-400 fill-amber-400" /> Streak
            </span>
            <span className="text-base font-bold text-white font-mono">{streakDays} Days</span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/70 px-3.5 py-2 text-center">
            <span className="text-[10px] uppercase font-semibold text-slate-500 block">Adherence</span>
            <span className="text-base font-bold text-emerald-400 font-mono">{adherenceRate}%</span>
          </div>
        </div>

      </div>
    </div>
  );
}
