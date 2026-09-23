import React from 'react';
import Link from 'next/link';
import { User, ChevronRight, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface PatientCardProps {
  id: string;
  name: string;
  condition: string;
  affectedSide: string;
  adherenceRate: number;
  streakDays: number;
  painLevel: number;
  status: 'active' | 'review_needed' | 'discharged';
}

export function PatientCard({
  id,
  name,
  condition,
  affectedSide,
  adherenceRate,
  streakDays,
  painLevel,
  status,
}: PatientCardProps) {
  const isReviewNeeded = status === 'review_needed' || painLevel >= 6;

  return (
    <Card className="hover:border-slate-700 transition-colors">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">{name}</CardTitle>
            <CardDescription>{condition} ({affectedSide})</CardDescription>
          </div>
          <Badge variant={isReviewNeeded ? 'warning' : 'success'}>
            {isReviewNeeded ? 'Review Needed' : 'Active'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-lg bg-slate-950 p-2 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block">Adherence</span>
            <span className="font-bold text-white font-mono">{adherenceRate}%</span>
          </div>
          <div className="rounded-lg bg-slate-950 p-2 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block">Streak</span>
            <span className="font-bold text-cyan-400 font-mono">{streakDays}d</span>
          </div>
          <div className="rounded-lg bg-slate-950 p-2 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block">Pain (VAS)</span>
            <span className={`font-bold font-mono ${painLevel >= 6 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {painLevel}/10
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Link href={`/clinician/patients`} className="w-full">
          <Button variant="outline" size="sm" className="w-full justify-between">
            <span>Clinical Records</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
