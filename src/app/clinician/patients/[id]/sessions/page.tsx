'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Activity,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Award,
  ChevronDown,
  ChevronUp,
  FileCheck,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';

export default function ClinicianPatientSessionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const patientId = resolvedParams.id;
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>('sess-01');

  // Comprehensive validated session telemetry records
  const sessionRecords = [
    {
      id: 'sess-01',
      exerciseName: 'Elbow Flexion',
      date: 'Today, 10:15 AM',
      repetitions: 10,
      successfulRepetitions: 10,
      incompleteRepetitions: 0,
      measuredRange: {
        peak: 46,
        min: 42,
        max: 51,
        average: 46.2,
      },
      targetRange: {
        min: 35,
        max: 55,
      },
      durationSeconds: 222,
      averageRepDuration: 4.1,
      trackingQuality: 'high',
      qualityScore: 98,
      patientDiscomfortVAS: 1,
      patientFatigueBorg: 3,
      patientComment: 'Felt very smooth today, arm felt steady throughout.',
      cadenceNotes: 'Uniform 4.1s cadence with controlled eccentric descent.',
      repLog: [
        { rep: 1, peak: 44, status: 'completed', duration: 4.0 },
        { rep: 2, peak: 45, status: 'completed', duration: 4.1 },
        { rep: 3, peak: 46, status: 'completed', duration: 4.2 },
        { rep: 4, peak: 46, status: 'completed', duration: 4.1 },
        { rep: 5, peak: 47, status: 'completed', duration: 4.0 },
        { rep: 6, peak: 46, status: 'completed', duration: 4.2 },
        { rep: 7, peak: 45, status: 'completed', duration: 4.1 },
        { rep: 8, peak: 47, status: 'completed', duration: 4.2 },
        { rep: 9, peak: 46, status: 'completed', duration: 4.1 },
        { rep: 10, peak: 45, status: 'completed', duration: 4.0 },
      ],
    },
    {
      id: 'sess-02',
      exerciseName: 'Shoulder Raise',
      date: 'Yesterday, 4:30 PM',
      repetitions: 10,
      successfulRepetitions: 9,
      incompleteRepetitions: 1,
      measuredRange: {
        peak: 94,
        min: 78,
        max: 96,
        average: 89.5,
      },
      targetRange: {
        min: 85,
        max: 110,
      },
      durationSeconds: 265,
      averageRepDuration: 4.8,
      trackingQuality: 'high',
      qualityScore: 89,
      patientDiscomfortVAS: 2,
      patientFatigueBorg: 5,
      patientComment: 'Rep 7 felt slightly tight in anterior deltoid.',
      cadenceNotes: 'Rep 7 returned early at 78° before full elevation.',
      repLog: [
        { rep: 1, peak: 88, status: 'completed', duration: 4.5 },
        { rep: 2, peak: 90, status: 'completed', duration: 4.7 },
        { rep: 3, peak: 92, status: 'completed', duration: 4.9 },
        { rep: 4, peak: 94, status: 'completed', duration: 4.8 },
        { rep: 5, peak: 91, status: 'completed', duration: 4.6 },
        { rep: 6, peak: 90, status: 'completed', duration: 4.8 },
        { rep: 7, peak: 78, status: 'incomplete', duration: 3.2 },
        { rep: 8, peak: 89, status: 'completed', duration: 5.1 },
        { rep: 9, peak: 91, status: 'completed', duration: 5.0 },
        { rep: 10, peak: 90, status: 'completed', duration: 4.8 },
      ],
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href={`/clinician/patients/${patientId}`}>
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Kinematic Session Review Workspace
              </h1>
              <Badge variant="outline">Patient: {patientId}</Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Verified computer vision repetitions, angle ranges, cadence, and patient-reported discomfort.
            </p>
          </div>
        </div>
      </div>

      {/* Mandatory Non-Diagnostic Clinical Boundary Watermark */}
      <Alert variant="info" title="System-Generated Measurements Disclosure">
        All telemetry values below are <strong>system-generated kinematic measurements</strong> calculated from browser-side computer vision keypoints. They are provided as assistive data for clinical review and do <strong>not</strong> constitute an automated medical diagnosis.
      </Alert>

      {/* Sessions List */}
      <div className="space-y-6">
        {sessionRecords.map((sess) => {
          const isExpanded = expandedSessionId === sess.id;
          const durationMin = Math.floor(sess.durationSeconds / 60);
          const durationSec = sess.durationSeconds % 60;

          return (
            <Card
              key={sess.id}
              className="border-slate-800 bg-slate-900/60 backdrop-blur-md overflow-hidden"
            >
              <CardHeader className="pb-3 border-b border-slate-800/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg text-white">{sess.exerciseName}</CardTitle>
                      <Badge variant="outline" className="text-[10px]">{sess.date}</Badge>
                      <Badge
                        variant={sess.trackingQuality === 'high' ? 'success' : 'neutral'}
                        className="text-[10px]"
                      >
                        {sess.trackingQuality.toUpperCase()} Tracking Quality
                      </Badge>
                    </div>
                    <CardDescription className="text-xs mt-1">
                      {sess.repetitions} Repetitions Tracked · Duration: {durationMin}m {durationSec}s · Form Quality Score: {sess.qualityScore}%
                    </CardDescription>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedSessionId(isExpanded ? null : sess.id)}
                    className="text-xs gap-1.5 self-end sm:self-center"
                  >
                    <span>{isExpanded ? 'Collapse Analysis' : 'Expand Analysis'}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="pt-4 space-y-6">
                {/* Core 8 Review Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  {/* Metric 1 & 2: Repetitions Breakdown */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Successful Repetitions</span>
                    <span className="text-xl font-bold text-emerald-400 font-mono mt-0.5 block">
                      {sess.successfulRepetitions} / {sess.repetitions}
                    </span>
                    <span className="text-[10px] text-slate-500">Fulfilled target angle</span>
                  </div>

                  {/* Metric 3: Incomplete Repetitions */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Incomplete Repetitions</span>
                    <span className="text-xl font-bold text-amber-400 font-mono mt-0.5 block">
                      {sess.incompleteRepetitions}
                    </span>
                    <span className="text-[10px] text-slate-500">Returned early</span>
                  </div>

                  {/* Metric 4 & 5: Measured Range vs Target Range */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Measured Range (Avg)</span>
                    <span className="text-xl font-bold text-cyan-400 font-mono mt-0.5 block">
                      {sess.measuredRange.average}°
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Target: {sess.targetRange.min}° – {sess.targetRange.max}°
                    </span>
                  </div>

                  {/* Metric 6, 7 & 8: Duration, Tracking Quality, Discomfort */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Reported Discomfort</span>
                    <span className="text-xl font-bold text-rose-400 font-mono mt-0.5 block">
                      {sess.patientDiscomfortVAS} / 10 VAS
                    </span>
                    <span className="text-[10px] text-slate-500">Fatigue Borg: {sess.patientFatigueBorg}/10</span>
                  </div>
                </div>

                {/* Additional Clinical Telemetry Details */}
                {isExpanded && (
                  <div className="space-y-4 pt-2 border-t border-slate-800">
                    {/* Patient Comments & Cadence Notes */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
                        <span className="text-slate-400 block font-semibold mb-1">Patient Feedback Comment:</span>
                        <p className="text-slate-300 italic">&ldquo;{sess.patientComment}&rdquo;</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
                        <span className="text-slate-400 block font-semibold mb-1">Biomechanical Cadence Notes:</span>
                        <p className="text-slate-300">{sess.cadenceNotes}</p>
                      </div>
                    </div>

                    {/* Per-Repetition Telemetry Table */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                        Per-Repetition Kinematic Telemetry Log
                      </h4>
                      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                        <table className="w-full text-left text-xs">
                          <thead className="border-b border-slate-800 bg-slate-900/60 text-[10px] text-slate-400 uppercase">
                            <tr>
                              <th className="px-4 py-2.5">Rep #</th>
                              <th className="px-4 py-2.5">Measured Peak Angle</th>
                              <th className="px-4 py-2.5">Status</th>
                              <th className="px-4 py-2.5">Rep Duration</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60 text-slate-300">
                            {sess.repLog.map((r) => (
                              <tr key={r.rep}>
                                <td className="px-4 py-2 font-mono">Repetition {r.rep}</td>
                                <td className="px-4 py-2 font-mono text-cyan-400">{r.peak}°</td>
                                <td className="px-4 py-2">
                                  <Badge
                                    variant={r.status === 'completed' ? 'success' : 'destructive'}
                                    className="text-[10px]"
                                  >
                                    {r.status}
                                  </Badge>
                                </td>
                                <td className="px-4 py-2 font-mono text-slate-400">{r.duration}s</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
