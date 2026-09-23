'use client';

import React, { useState, useEffect } from 'react';
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
  ShieldCheck,
  Award,
  Sparkles,
  ChevronRight,
  Volume2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { useAuth } from '@/lib/auth/auth-context';
import { SEEDED_EXERCISE_DEFINITIONS } from '@/lib/exercises/definitions';
import { speechEngine } from '@/lib/voice/speech-engine';

export default function PatientDashboardPage() {
  const { user } = useAuth();
  const patientName = user?.fullName || 'Sarah';

  // Greeting based on time of day
  const [greeting, setGreeting] = useState('Good morning');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  // Today's prescribed exercises
  const prescribedExercises = SEEDED_EXERCISE_DEFINITIONS;
  const totalEstimatedMinutes = prescribedExercises.length * 5; // ~5 mins per protocol

  // Recent session sample
  const recentSession = {
    exerciseName: 'Elbow Flexion',
    date: 'Today, 10:15 AM',
    reps: '10 / 10 reps completed',
    movementMetric: 'Peak angle 46° (Target 35°–55°)',
    duration: '3m 42s',
    qualityScore: 98,
  };

  const handleReadAloud = () => {
    speechEngine.speak(
      `${greeting}, ${patientName}. Today you have ${prescribedExercises.length} prescribed exercises, estimated at ${totalEstimatedMinutes} minutes. Click Start Session to begin.`
    );
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-2">
      {/* 1. Welcoming Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {greeting}, {patientName}
            </h1>
            <button
              onClick={handleReadAloud}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Read guidance aloud"
              aria-label="Read guidance aloud"
            >
              <Volume2 className="w-4 h-4 text-primary" />
            </button>
          </div>
          <p className="text-sm text-slate-400">
            Welcome to your daily computer vision rehabilitation session.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>Local Camera Processing Active</span>
          </div>
        </div>
      </div>

      {/* 2. Today's Rehabilitation Routine Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/15 via-slate-900 to-slate-950 border border-primary/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/40 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Today&apos;s Rehabilitation</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {prescribedExercises.length} Prescribed Exercises Ready
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-primary" />
                <span>Estimated Duration: <strong>~{totalEstimatedMinutes} minutes</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Target: 10 repetitions per exercise</span>
              </div>
            </div>
          </div>

          <Link href={`/patient/exercise/${prescribedExercises[0].id}`}>
            <Button
              size="lg"
              className="w-full sm:w-auto px-8 py-4 gap-2.5 text-base font-bold shadow-lg shadow-primary/20"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Start Session</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 3. Progress KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-md">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">Completed Sessions</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-black text-white font-mono">18</span>
                <span className="text-xs text-slate-400">sessions total</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-md">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">Adherence Rate</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-black text-emerald-400 font-mono">92%</span>
                <span className="text-xs text-emerald-500 font-semibold">↑ High</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-md">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">Recent Activity</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-black text-amber-400 font-mono">6</span>
                <span className="text-xs text-slate-400">Day Streak</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. Prescribed Exercises Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Prescribed Exercises</h3>
            <p className="text-xs text-slate-400">Supervised protocols assigned for your recovery</p>
          </div>
          <Link href="/patient/exercises">
            <Button variant="ghost" size="sm" className="text-xs gap-1">
              <span>View Library</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {prescribedExercises.map((ex) => (
            <Card key={ex.id} className="border-slate-800 bg-slate-900/70 backdrop-blur-md flex flex-col justify-between hover:border-slate-700 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <Badge variant="outline" className="capitalize text-[10px]">
                    {ex.bodyPart.replace('_', ' ')}
                  </Badge>
                  <Badge variant="neutral" className="capitalize text-[10px]">
                    {ex.difficulty}
                  </Badge>
                </div>
                <CardTitle className="text-base text-white">{ex.name}</CardTitle>
                <CardDescription className="text-xs line-clamp-2">{ex.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-3 pb-3">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-slate-400">Repetitions:</span>
                    <span className="font-bold text-white">10 Reps</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-slate-400">Target Range:</span>
                    <span className="font-bold text-emerald-400">
                      {ex.repetitionLogic.peakFlexionMinAngle}° – {ex.repetitionLogic.peakFlexionMaxAngle}°
                    </span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-2 border-t border-slate-800/80">
                <Link href={`/patient/exercise/${ex.id}`} className="w-full">
                  <Button className="w-full gap-2 text-xs font-semibold shadow-sm">
                    <Play className="w-3.5 h-3.5" />
                    <span>Start {ex.name}</span>
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* 5. Recent Session Summary Card */}
      <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              <CardTitle className="text-base">Recent Session Overview</CardTitle>
            </div>
            <Link href="/patient/history">
              <Button variant="ghost" size="sm" className="text-xs gap-1">
                <span>All History</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
          <CardDescription>Verified kinematic telemetry from your latest exercise completion</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <div>
              <span className="text-slate-500 block">Exercise Protocol</span>
              <span className="font-bold text-white text-sm">{recentSession.exerciseName}</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">{recentSession.date}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Repetitions</span>
              <span className="font-bold text-emerald-400 text-sm">{recentSession.reps}</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">100% completion</span>
            </div>
            <div>
              <span className="text-slate-500 block">Movement Metric</span>
              <span className="font-bold text-white text-sm">{recentSession.movementMetric}</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">Clean form recorded</span>
            </div>
            <div>
              <span className="text-slate-500 block">Duration & Score</span>
              <span className="font-bold text-blue-400 text-sm">{recentSession.duration}</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">Quality score: {recentSession.qualityScore}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
