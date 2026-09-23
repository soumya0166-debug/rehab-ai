'use client';

import React from 'react';
import Link from 'next/link';
import {
  Dumbbell,
  Target,
  Camera,
  ShieldAlert,
  Plus,
  ArrowLeft,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { SEEDED_EXERCISE_DEFINITIONS } from '@/lib/exercises/definitions';

export default function ClinicianExercisesPage() {
  const exercises = SEEDED_EXERCISE_DEFINITIONS;

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
              <Dumbbell className="h-7 w-7 text-primary" />
              Clinical Protocol Library
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Validated biomechanical models, landmark configurations, and camera setup requirements.
            </p>
          </div>
        </div>

        <Link href="/clinician/patients">
          <Button className="gap-2 text-xs font-semibold">
            <Users className="w-4 h-4" />
            <span>Assign to Patient</span>
          </Button>
        </Link>
      </div>

      {/* Clinical Disclaimer */}
      <Alert variant="info" title="Computer Vision Biomechanical Protocols">
        These protocols specify mathematical joint angles and landmark tracking rules calculated browser-side. You can customize target repetitions and degree boundaries per individual patient prescription.
      </Alert>

      {/* Exercises Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {exercises.map((ex) => (
          <Card key={ex.id} className="border-slate-800 bg-slate-900/60 backdrop-blur-md flex flex-col justify-between">
            <div>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <Badge variant="outline" className="capitalize text-[10px]">
                    {ex.bodyPart.replace('_', ' ')}
                  </Badge>
                  <Badge variant="neutral" className="capitalize text-[10px]">
                    {ex.difficulty}
                  </Badge>
                </div>
                <CardTitle className="text-lg text-white">{ex.name}</CardTitle>
                <CardDescription className="text-xs line-clamp-3">{ex.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 text-xs">
                {/* Biomechanical Parameters */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-slate-400">Target Joint:</span>
                    <span className="font-mono text-cyan-400 font-bold capitalize">
                      {ex.repetitionLogic.targetJointName.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-slate-400">Target Range:</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {ex.repetitionLogic.peakFlexionMinAngle}° – {ex.repetitionLogic.peakFlexionMaxAngle}°
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-slate-400">Camera View:</span>
                    <span className="text-white capitalize">
                      {ex.cameraView.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-slate-400">Recommended Cadence:</span>
                    <span className="text-white font-mono">
                      ~{ex.repetitionLogic.cadenceSecondsPerRep || 4}s / rep
                    </span>
                  </div>
                </div>

                {/* Required Landmarks */}
                <div>
                  <span className="text-slate-400 block text-[11px] font-semibold mb-1">
                    Tracked Keypoints ({ex.requiredLandmarks.length}):
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {ex.requiredLandmarks.map((lm) => (
                      <span
                        key={lm}
                        className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono"
                      >
                        {lm}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Clinical Safety Notes */}
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400">
                  <strong className="text-slate-300 block mb-0.5">Clinical Precaution:</strong>
                  {ex.safetyNotes}
                </div>
              </CardContent>
            </div>

            <CardFooter className="pt-3 border-t border-slate-800/80">
              <Link href="/clinician/patients" className="w-full">
                <Button variant="secondary" size="sm" className="w-full gap-1.5 text-xs">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Prescribe to Patient</span>
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
