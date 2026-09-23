'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Play, 
  Calendar, 
  Flame, 
  TrendingUp, 
  Activity, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  ShieldAlert 
} from 'lucide-react';
import { PatientHeader } from '@/components/patient/PatientHeader';
import { ExerciseCard } from '@/components/exercises/ExerciseCard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { getPatientsList, getPrescriptionsForPatient } from '@/lib/db/repository';
import { EXERCISE_REGISTRY } from '@/lib/exercises/registry';

export default function PatientDashboardPage() {
  const patients = getPatientsList();
  const currentPatient = patients[0];
  const prescriptions = getPrescriptionsForPatient(currentPatient.id);

  return (
    <div className="space-y-8">
      
      {/* Patient Profile Header */}
      <PatientHeader
        name={currentPatient.fullName}
        condition={currentPatient.condition}
        clinicianName={currentPatient.clinicianName}
        streakDays={currentPatient.streakDays}
        adherenceRate={currentPatient.adherenceRate}
      />

      {/* Safety & Assistive Medical Boundary Notice */}
      <Alert variant="info" title="Rehabilitation Guidance Notice">
        Exercises should be performed within a comfortable, pain-free range of motion. If you experience sharp pain (VAS &gt; 6), stop immediately and notify {currentPatient.clinicianName}.
      </Alert>

      {/* Prescribed Routine Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Today's Prescribed Regimen</h3>
            <p className="text-xs text-slate-400">Assigned by {currentPatient.clinicianName}</p>
          </div>

          <Link href="/patient/exercises">
            <Button variant="ghost" size="sm">
              <span>View All Prescriptions</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {prescriptions.map((rx) => {
            const exerciseDef = EXERCISE_REGISTRY.find((e) => e.id === rx.exerciseId) || EXERCISE_REGISTRY[0];
            return (
              <ExerciseCard
                key={rx.id}
                id={rx.exerciseId}
                name={rx.exerciseName}
                category={exerciseDef.category}
                targetJoint={exerciseDef.targetJoint}
                targetAngleMin={rx.targets.targetAngleMin}
                recommendedReps={rx.targets.targetReps}
                recommendedSets={rx.targets.targetSets}
                holdSeconds={rx.targets.holdDurationSeconds}
                description={exerciseDef.description}
                isPrescribed={true}
                actionHref={`/patient/exercises`}
              />
            );
          })}
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recovery Adherence Status</CardTitle>
            <CardDescription>Your weekly movement consistency</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Weekly Target Progress</span>
                <span className="font-mono font-bold text-emerald-400">{currentPatient.adherenceRate}% met</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all"
                  style={{ width: `${currentPatient.adherenceRate}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400">
                You have completed 6 consecutive days. Excellent quadriceps endurance observed.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Self-Reported Comfort (VAS)</CardTitle>
            <CardDescription>Current pain level logged at terminal extension</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-3xl font-bold font-mono text-cyan-400">{currentPatient.currentPainLevel}</span>
                <span className="text-xs text-slate-400 font-normal"> / 10 (Mild)</span>
                <p className="text-[11px] text-slate-400 mt-1">Stable. Within safe post-op parameters.</p>
              </div>
              <Link href="/patient/progress">
                <Button variant="secondary" size="sm">
                  View Trends
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

      </div>

    </div>
  );
}
