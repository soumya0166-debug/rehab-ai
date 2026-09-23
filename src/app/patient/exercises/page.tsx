'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Dumbbell, Target, CheckCircle2, Play, Sparkles, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { SEEDED_EXERCISE_DEFINITIONS } from '@/lib/exercises/definitions';

export default function PatientExercisesPage() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'lower_extremity' | 'upper_extremity'>('all');

  const filteredExercises = SEEDED_EXERCISE_DEFINITIONS.filter((ex) => {
    return selectedCategory === 'all' || ex.bodyPart === selectedCategory;
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Dumbbell className="h-6 w-6 text-primary" />
            Prescribed Rehabilitation Library
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time computer vision assisted rehabilitation protocols. Local browser-side pose analysis.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          {(['all', 'upper_extremity', 'lower_extremity'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-colors cursor-pointer ${
                selectedCategory === cat ? 'bg-primary text-primary-foreground font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat === 'all' ? 'All Protocols' : cat.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Safety Notice */}
      <Alert variant="info" title="Zero Video Upload & Local Telemetry Guarantee">
        Your camera stream is processed strictly in your local browser using mathematical computer vision models. No raw video or images are stored or transmitted.
      </Alert>

      {/* Exercises Detail Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredExercises.map((exercise) => {
          return (
            <Card key={exercise.id} className="flex flex-col justify-between border-slate-800 bg-slate-900/60 backdrop-blur-md">
              <div>
                <CardHeader>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <Badge variant="outline" className="capitalize">
                      {exercise.bodyPart.replace('_', ' ')}
                    </Badge>
                    <Badge variant="success">Prescribed</Badge>
                  </div>
                  <CardTitle className="text-lg text-white">{exercise.name}</CardTitle>
                  <CardDescription className="text-xs line-clamp-2">{exercise.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Target Parameters */}
                  <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3.5 space-y-2 text-xs">
                    <div className="text-[10px] uppercase font-bold text-primary tracking-wider flex items-center gap-1">
                      <Target className="h-3.5 w-3.5" /> Biomechanical Targets
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-slate-300">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Target Range</span>
                        <span className="font-mono font-bold text-white">
                          {exercise.repetitionLogic.peakFlexionMinAngle}° – {exercise.repetitionLogic.peakFlexionMaxAngle}°
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Camera View</span>
                        <span className="font-medium text-white capitalize">
                          {exercise.cameraView.replace('_', ' ')}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Target Reps</span>
                        <span className="font-medium text-white">10 Reps</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Cadence</span>
                        <span className="font-medium text-white">
                          ~{exercise.repetitionLogic.cadenceSecondsPerRep || 4}s / rep
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Positioning Guidance */}
                  <div className="space-y-1 text-xs text-slate-300">
                    <span className="font-semibold text-white block text-[11px]">Positioning Hint:</span>
                    <p className="text-[11px] text-slate-400">
                      {exercise.cameraPositioningGuidance.instructions[0]}
                    </p>
                  </div>
                </CardContent>
              </div>

              <CardFooter className="pt-3 border-t border-slate-800/80 flex flex-col gap-2">
                <Link href={`/patient/exercise/${exercise.id}`} className="w-full">
                  <Button className="w-full gap-2 shadow-md">
                    <Play className="h-4 w-4" />
                    <span>Start Live Session</span>
                  </Button>
                </Link>
                <div className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                  <span>Real-time pose guidance enabled</span>
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
