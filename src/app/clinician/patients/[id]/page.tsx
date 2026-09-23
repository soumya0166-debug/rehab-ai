'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Activity,
  Stethoscope,
  Calendar,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  Plus,
  Sliders,
  Save,
  Check,
  ShieldCheck,
  Clock,
  ChevronRight,
  HeartPulse,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import { SEEDED_EXERCISE_DEFINITIONS } from '@/lib/exercises/definitions';
import { createPrescription } from '@/lib/services/rehab-service';

export default function ClinicianPatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const patientId = resolvedParams.id;

  // Mock patient profile
  const patientProfile = {
    id: patientId,
    name: 'Sarah Connor',
    dob: '1965-04-12 (Age 61)',
    condition: 'Anterior Cruciate Ligament (ACL) Reconstruction',
    affectedSide: 'Left Knee',
    surgeryDate: 'August 15, 2026',
    supervisingClinician: 'Dr. Michael Chen, PT, DPT',
    adherenceRate: 92,
    currentStreak: 6,
  };

  // Prescription Form State
  const [showRxModal, setShowRxModal] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState('elbow-flexion');
  const [targetReps, setTargetReps] = useState(10);
  const [targetRangeMin, setTargetRangeMin] = useState(35);
  const [targetRangeMax, setTargetRangeMax] = useState(55);
  const [customInstructions, setCustomInstructions] = useState('Maintain upright posture and avoid compensatory torso lean.');
  const [isSavingRx, setIsSavingRx] = useState(false);
  const [rxSaveSuccess, setRxSaveSuccess] = useState(false);

  // Active Prescriptions List
  const [prescriptions, setPrescriptions] = useState([
    {
      id: 'rx-01',
      exerciseId: 'elbow-flexion',
      exerciseName: 'Elbow Flexion',
      targetReps: 10,
      targetRangeMin: 35,
      targetRangeMax: 55,
      instructions: 'Smooth isolated curl with steady 4s cadence. Avoid shoulder hiking.',
      prescribedAt: 'Sep 10, 2026',
    },
    {
      id: 'rx-02',
      exerciseId: 'shoulder-raise',
      exerciseName: 'Shoulder Raise',
      targetReps: 8,
      targetRangeMin: 85,
      targetRangeMax: 110,
      instructions: 'Scapular plane scaption elevation. Keep core engaged without trunk tilt.',
      prescribedAt: 'Sep 15, 2026',
    },
  ]);

  // Handle exercise selection in modal to auto-populate default biomechanics
  const handleExerciseChange = (id: string) => {
    setSelectedExerciseId(id);
    const def = SEEDED_EXERCISE_DEFINITIONS.find((e) => e.id === id);
    if (def) {
      setTargetRangeMin(def.repetitionLogic.peakFlexionMinAngle);
      setTargetRangeMax(def.repetitionLogic.peakFlexionMaxAngle);
      setCustomInstructions(def.feedbackRules[0]?.verbalCue || 'Maintain controlled cadence.');
    }
  };

  const handleSavePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingRx(true);

    try {
      const def = SEEDED_EXERCISE_DEFINITIONS.find((e) => e.id === selectedExerciseId);
      const newRx = await createPrescription({
        patientId,
        exerciseId: selectedExerciseId,
        targetReps,
        targetRangeMin,
        targetRangeMax,
        instructions: customInstructions,
        createdBy: 'Dr. Michael Chen, DPT',
      });

      setPrescriptions((prev) => [
        {
          id: newRx.id,
          exerciseId: newRx.exercise_id,
          exerciseName: def?.name || 'Custom Exercise',
          targetReps: newRx.target_reps,
          targetRangeMin: newRx.target_range_min,
          targetRangeMax: newRx.target_range_max,
          instructions: newRx.instructions,
          prescribedAt: 'Just now',
        },
        ...prev,
      ]);

      setRxSaveSuccess(true);
      setTimeout(() => {
        setRxSaveSuccess(false);
        setShowRxModal(false);
      }, 1500);
    } catch {
      // Graceful fallback
      setShowRxModal(false);
    } finally {
      setIsSavingRx(false);
    }
  };

  // Recent Sessions Telemetry
  const recentSessions = [
    {
      id: 'sess-01',
      exerciseName: 'Elbow Flexion',
      date: 'Today, 10:15 AM',
      reps: '10 / 10 reps',
      range: 'Peak 46° (Target 35°–55°)',
      duration: '3m 42s',
      quality: 'High Quality',
      painVAS: 1,
    },
    {
      id: 'sess-02',
      exerciseName: 'Shoulder Raise',
      date: 'Yesterday, 4:30 PM',
      reps: '9 / 10 reps (1 Incomplete)',
      range: 'Peak 94° (Target 85°–110°)',
      duration: '4m 25s',
      quality: 'High Quality',
      painVAS: 2,
    },
    {
      id: 'sess-03',
      exerciseName: 'Sit-to-Stand',
      date: 'Sep 21, 2026, 11:00 AM',
      reps: '10 / 10 reps',
      range: 'Peak 178° (Target 170°–180°)',
      duration: '4m 00s',
      quality: 'High Quality',
      painVAS: 0,
    },
  ];

  // ROM Trajectory Chart Data
  const chartData = [
    { session: 'S1', angle: 142, pain: 2 },
    { session: 'S2', angle: 148, pain: 2 },
    { session: 'S3', angle: 151, pain: 1 },
    { session: 'S4', angle: 154, pain: 1 },
    { session: 'S5', angle: 157, pain: 2 },
    { session: 'S6', angle: 159, pain: 1 },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/clinician/patients">
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {patientProfile.name}
              </h1>
              <Badge variant="success">Active Cohort</Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Diagnosis: <strong className="text-slate-200">{patientProfile.condition}</strong> ({patientProfile.affectedSide})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/clinician/patients/${patientId}/sessions`}>
            <Button variant="outline" size="sm" className="text-xs gap-1.5">
              <Activity className="w-4 h-4 text-primary" />
              <span>Full Session Review</span>
            </Button>
          </Link>

          <Button
            onClick={() => setShowRxModal(true)}
            size="sm"
            className="text-xs gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Prescribe Exercise</span>
          </Button>
        </div>
      </div>

      {/* Mandatory Non-Diagnostic Clinical Boundary Watermark */}
      <Alert variant="info" title="Clinical Governance & Prescription Security">
        <strong>Important:</strong> Only licensed clinicians can modify exercise prescriptions. The generative AI layer is strictly prohibited from altering target angles, repetitions, or clinical precautions. All telemetry values represent objective system-generated measurements, not automated medical diagnoses.
      </Alert>

      {/* Patient Demographic & Adherence Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60">
          <span className="text-[11px] text-slate-400 block font-medium">Weekly Adherence</span>
          <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">
            {patientProfile.adherenceRate}%
          </span>
          <span className="text-[11px] text-slate-500">{patientProfile.currentStreak} day consecutive streak</span>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60">
          <span className="text-[11px] text-slate-400 block font-medium">Surgery / Start Date</span>
          <span className="text-base font-bold text-white mt-1 block">
            {patientProfile.surgeryDate}
          </span>
          <span className="text-[11px] text-slate-500">6 weeks post-operative</span>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60">
          <span className="text-[11px] text-slate-400 block font-medium">Patient Discomfort (VAS)</span>
          <span className="text-2xl font-black text-cyan-400 font-mono mt-1 block">
            1.5 / 10
          </span>
          <span className="text-[11px] text-slate-500">Mild, stable across all sessions</span>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60">
          <span className="text-[11px] text-slate-400 block font-medium">Active Prescriptions</span>
          <span className="text-2xl font-black text-purple-400 font-mono mt-1 block">
            {prescriptions.length}
          </span>
          <span className="text-[11px] text-slate-500">Supervised protocols</span>
        </div>
      </div>

      {/* Prescribed Exercises Section (Clinician Configurable) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Active Clinical Prescriptions</h3>
            <p className="text-xs text-slate-400">Configured target repetitions, range boundaries, and instructions</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRxModal(true)}
            className="text-xs gap-1.5"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Configure Targets</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {prescriptions.map((rx) => (
            <Card key={rx.id} className="border-slate-800 bg-slate-900/60 backdrop-blur-md">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base text-white">{rx.exerciseName}</CardTitle>
                  <Badge variant="outline" className="text-[10px]">{rx.prescribedAt}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Target Repetitions</span>
                    <span className="font-bold text-white text-sm">{rx.targetReps} Reps</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Target Angle Range</span>
                    <span className="font-bold text-emerald-400 text-sm">
                      {rx.targetRangeMin}° – {rx.targetRangeMax}°
                    </span>
                  </div>
                </div>
                <div className="text-slate-300">
                  <span className="font-semibold text-slate-400 block text-[11px]">Instructions for Patient:</span>
                  <p className="text-[11px] text-slate-300 leading-snug mt-0.5">{rx.instructions}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Progress Charts & Telemetry Trajectory */}
      <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base text-white">Movement Performance Trajectory</CardTitle>
              <CardDescription>Joint range of motion progression across recent home sessions</CardDescription>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-cyan-400 flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Measured ROM (°)
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="session" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[130, 170]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                />
                <ReferenceLine y={160} stroke="#10b981" strokeDasharray="4 4" label={{ value: 'Target Max', fill: '#10b981', fontSize: 10 }} />
                <ReferenceLine y={140} stroke="#38bdf8" strokeDasharray="4 4" label={{ value: 'Target Min', fill: '#38bdf8', fontSize: 10 }} />
                <Line
                  type="monotone"
                  dataKey="angle"
                  name="Detected Angle (°)"
                  stroke="#38bdf8"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#0284c7', stroke: '#fff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Sessions Table */}
      <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base text-white">Recent Sessions & Patient Discomfort</CardTitle>
              <CardDescription>Verified kinematic sessions with patient self-reported comfort ratings</CardDescription>
            </div>
            <Link href={`/clinician/patients/${patientId}/sessions`}>
              <Button variant="ghost" size="sm" className="text-xs gap-1">
                <span>View All ({recentSessions.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-slate-800/80 text-xs">
            {recentSessions.map((sess) => (
              <div key={sess.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{sess.exerciseName}</span>
                    <Badge variant="outline" className="text-[10px]">{sess.date}</Badge>
                    <Badge variant="success" className="text-[10px]">{sess.quality}</Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-slate-400 mt-1">
                    <span>{sess.reps}</span>
                    <span>·</span>
                    <span>Range: <strong className="text-white">{sess.range}</strong></span>
                    <span>·</span>
                    <span>Duration: {sess.duration}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Reported Discomfort</span>
                    <span className="font-bold text-cyan-400 text-sm">{sess.painVAS} / 10 VAS</span>
                  </div>
                  <Link href={`/clinician/patients/${patientId}/sessions`}>
                    <Button variant="secondary" size="sm" className="text-xs">
                      Inspect Telemetry
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Clinician Prescription Modal */}
      {showRxModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">Prescribe Exercise Protocol</h3>
                <p className="text-xs text-slate-400">Configure target biomechanical parameters</p>
              </div>
              <button
                onClick={() => setShowRxModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePrescription} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Select Exercise Protocol:</label>
                <select
                  value={selectedExerciseId}
                  onChange={(e) => handleExerciseChange(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {SEEDED_EXERCISE_DEFINITIONS.map((def) => (
                    <option key={def.id} value={def.id}>
                      {def.name} ({def.bodyPart.replace('_', ' ')})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Target Reps:</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={targetReps}
                    onChange={(e) => setTargetReps(parseInt(e.target.value) || 10)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Target Min Angle (°):</label>
                  <input
                    type="number"
                    value={targetRangeMin}
                    onChange={(e) => setTargetRangeMin(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Target Max Angle (°):</label>
                  <input
                    type="number"
                    value={targetRangeMax}
                    onChange={(e) => setTargetRangeMax(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Clinical Instructions for Patient:</label>
                <textarea
                  rows={3}
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Specify cadence, form cues, or precautions..."
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
                Security affirmation: You are authenticating as supervising clinician. These values will strictly configure the patient&apos;s computer vision state machine.
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowRxModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSavingRx || rxSaveSuccess} className="gap-2 px-6">
                  {rxSaveSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Prescription Saved!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{isSavingRx ? 'Saving...' : 'Authorize Prescription'}</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
