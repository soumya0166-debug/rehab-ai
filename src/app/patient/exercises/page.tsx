'use client';

import React, { useState } from 'react';
import { Dumbbell, Info, Target, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { EXERCISE_REGISTRY } from '@/lib/exercises/registry';
import { getPrescriptionsForPatient } from '@/lib/db/repository';

export default function PatientExercisesPage() {
  const prescriptions = getPrescriptionsForPatient('pt-001');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'lower_extremity' | 'upper_extremity'>('all');

  const filteredExercises = EXERCISE_REGISTRY.filter((ex) => {
    return selectedCategory === 'all' || ex.category === selectedCategory;
  });

  return (
    <div className="space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Dumbbell className="h-6 w-6 text-cyan-400" />
            Prescribed Rehabilitation Library
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Clinical protocols configured by Dr. Michael Chen, DPT for your knee recovery.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          {(['all', 'lower_extremity', 'upper_extremity'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-colors cursor-pointer ${
                selectedCategory === cat ? 'bg-cyan-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat === 'all' ? 'All Protocols' : cat.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Safety Notice */}
      <Alert variant="info" title="Form Integrity Reminder">
        Always complete repetitions at a slow, controlled cadence. Computer vision will flag compensatory movements such as trunk lean or knee valgus.
      </Alert>

      {/* Exercises Detail Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredExercises.map((exercise) => {
          const rx = prescriptions.find((p) => p.exerciseId === exercise.id);
          const isPrescribed = !!rx;

          return (
            <Card key={exercise.id} className="flex flex-col justify-between">
              <div>
                <CardHeader>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <Badge variant="outline" className="capitalize">
                      {exercise.category.replace('_', ' ')}
                    </Badge>
                    {isPrescribed ? (
                      <Badge variant="success">Prescribed for You</Badge>
                    ) : (
                      <Badge variant="neutral">Reference Protocol</Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg">{exercise.name}</CardTitle>
                  <CardDescription>{exercise.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Target Parameters */}
                  <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 space-y-2 text-xs">
                    <div className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider flex items-center gap-1">
                      <Target className="h-3.5 w-3.5" /> Biomechanical Targets
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-slate-300">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Target Range</span>
                        <span className="font-mono font-bold text-white">
                          {rx ? rx.targets.targetAngleMin : exercise.defaultTargets.targetAngleMin}° minimum
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Hold Duration</span>
                        <span className="font-mono font-bold text-white">
                          {rx ? rx.targets.holdDurationSeconds : exercise.defaultTargets.holdDurationSeconds}s isometric hold
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Prescribed Dosage</span>
                        <span className="font-medium text-white">
                          {rx ? rx.targets.targetSets : exercise.defaultTargets.targetSets} sets × {rx ? rx.targets.targetReps : exercise.defaultTargets.targetReps} reps
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Target Joint</span>
                        <span className="font-medium text-white">{exercise.targetJoint}</span>
                      </div>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="space-y-1.5 text-xs text-slate-300">
                    <span className="font-semibold text-white block text-[11px]">Execution Steps:</span>
                    <ul className="space-y-1 text-[11px] text-slate-400 list-disc list-inside">
                      {exercise.instructions.map((step, idx) => (
                        <li key={idx} className="leading-snug">{step}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </div>

              <CardFooter>
                <div className="w-full flex items-center justify-between text-xs text-slate-400">
                  <span>Frequency: <strong>5 days / week</strong></span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Ready for Camera Session
                  </span>
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>

    </div>
  );
}
