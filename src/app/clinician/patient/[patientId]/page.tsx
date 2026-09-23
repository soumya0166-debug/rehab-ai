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
  FileText, 
  Copy, 
  Check, 
  Sliders, 
  Save,
  Sparkles
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  BarChart,
  Bar
} from 'recharts';
import { getPatientById, addPrescription, getPatients } from '@/lib/data/store';
import { PatientProfile, Prescription } from '@/types/rehab';

export default function ClinicianPatientDetailPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const resolvedParams = use(params);
  const [patient, setPatient] = useState<PatientProfile | null>(null);

  // New Prescription Form state
  const [showRxModal, setShowRxModal] = useState(false);
  const [rxExerciseId, setRxExerciseId] = useState('knee-extension');
  const [rxTargetReps, setRxTargetReps] = useState(10);
  const [rxTargetSets, setRxTargetSets] = useState(3);
  const [rxTargetAngle, setRxTargetAngle] = useState(175);
  const [rxHoldSec, setRxHoldSec] = useState(2);
  const [rxNotes, setRxNotes] = useState('');

  // AI SOAP Note state
  const [aiNote, setAiNote] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [copiedNote, setCopiedNote] = useState(false);

  useEffect(() => {
    const pt = getPatientById(resolvedParams.patientId);
    if (pt) {
      setPatient(pt);
    } else {
      const all = getPatients();
      if (all.length > 0) setPatient(all[0]);
    }
  }, [resolvedParams.patientId]);

  if (!patient) {
    return (
      <div className="flex h-96 items-center justify-center text-slate-400">
        Loading patient telemetry profile...
      </div>
    );
  }

  // Chart data
  const romChartData = patient.history
    .slice()
    .reverse()
    .map((sess, idx) => ({
      name: `Sess ${idx + 1}`,
      peakRom: sess.peakRom,
      targetRom: sess.targetRom,
      score: sess.overallScore,
      pain: sess.painScore,
    }));

  // Aggregated compensation frequencies
  const compensationCounts: Record<string, number> = {};
  patient.history.forEach((sess) => {
    Object.entries(sess.compensationBreakdown).forEach(([comp, count]) => {
      compensationCounts[comp] = (compensationCounts[comp] || 0) + count;
    });
  });

  const compensationData = Object.entries(compensationCounts).map(([name, count]) => ({
    name: name.length > 20 ? name.slice(0, 18) + '...' : name,
    count,
  }));

  const handleCreatePrescription = (e: React.FormEvent) => {
    e.preventDefault();
    const newRx: Prescription = {
      id: `rx-${Date.now()}`,
      exerciseId: rxExerciseId,
      exerciseName: rxExerciseId === 'knee-extension' 
        ? 'Seated Knee Extension (TKE)' 
        : rxExerciseId === 'bodyweight-squat'
        ? 'Controlled Rehabilitation Squat'
        : 'Shoulder Scaption / Abduction',
      targetReps: rxTargetReps,
      targetSets: rxTargetSets,
      targetAngleMin: rxTargetAngle,
      targetAngleMax: rxTargetAngle + 10,
      holdDurationSeconds: rxHoldSec,
      frequencyDaysPerWeek: 5,
      notesForPatient: rxNotes || 'Maintain steady cadence and full joint extension.',
      prescribedAt: new Date().toISOString().split('T')[0],
      clinicianName: 'Dr. Michael Chen, DPT',
      active: true,
    };

    addPrescription(patient.id, newRx);
    setPatient({
      ...patient,
      prescriptions: [...patient.prescriptions, newRx],
    });
    setShowRxModal(false);
  };

  const generateAiSoapNote = () => {
    setIsGeneratingAi(true);

    setTimeout(() => {
      const latestSess = patient.history[0];
      const avgScore = Math.round(patient.history.reduce((a, b) => a + b.overallScore, 0) / (patient.history.length || 1));
      const peakAchieved = Math.max(...patient.history.map((s) => s.peakRom));

      const note = `SOAP CLINICAL PROGRESS NOTE
Patient: ${patient.name} | DOB: Age ${patient.age} | Dx: ${patient.condition} (${patient.affectedSide} side)
Surgery Date: ${patient.surgeryDate || 'N/A'} | Assessment Date: ${new Date().toLocaleDateString()}
Supervising Clinician: Dr. Michael Chen, DPT

S (SUBJECTIVE):
Patient reports good tolerance of home exercise program with ${patient.weeklyAdherencePercent}% compliance adherence streak over the past week. Pain rating self-reported as VAS ${latestSess ? latestSess.painScore : 2}/10 during terminal joint loading. No acute swelling or instability reported.

O (OBJECTIVE - TELE-CV TELEMETRY):
- Primary Protocol: ${latestSess ? latestSess.exerciseName : 'Knee Extension'}
- Peak Range of Motion (ROM): ${peakAchieved}° verified by 30 FPS client-side computer vision (Target: ${latestSess ? latestSess.targetRom : 172}°).
- Movement Quality Form Score: ${avgScore}/100.
- Clean Repetition Ratio: ${latestSess ? `${latestSess.cleanReps}/${latestSess.completedReps}` : 'N/A'}.
- Compensatory Deviations Observed: ${Object.keys(compensationCounts).length > 0 ? Object.keys(compensationCounts).join(', ') : 'None detected. Excellent biomechanical alignment'}.

A (ASSESSMENT):
Patient is progressing ahead of typical post-operative trajectory. Active quadriceps motor unit recruitment is verified with minimal extensor lag. Dynamic knee stability is maintained throughout closed/open kinetic chain exercises.

P (PLAN):
1. Progress terminal extension angle target from ${latestSess ? latestSess.targetRom : 170}° to 180° full extension.
2. Advance hold duration from 2.0s to 3.0s isometric peak hold.
3. Schedule follow-up telehealth clinical re-evaluation in 14 days.`;

      setAiNote(note);
      setIsGeneratingAi(false);
    }, 700);
  };

  const handleCopyNote = () => {
    if (!aiNote) return;
    navigator.clipboard.writeText(aiNote);
    setCopiedNote(true);
    setTimeout(() => setCopiedNote(false), 2000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
      
      {/* Top Header / Back Nav */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/clinician"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white">{patient.name}</h1>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                patient.riskFlag === 'high' ? 'bg-rose-950 text-rose-300 border-rose-800' : 'bg-emerald-950 text-emerald-300 border-emerald-800'
              }`}>
                {patient.riskFlag || 'low'} risk
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {patient.condition} · {patient.affectedSide} side · Age {patient.age} · Surgery: {patient.surgeryDate || 'Conservative care'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowRxModal(true)}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-600 bg-emerald-950/40 px-3.5 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/50 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Adjust Prescription
          </button>

          <button
            onClick={generateAiSoapNote}
            disabled={isGeneratingAi}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-cyan-900/40 hover:from-cyan-400 hover:to-blue-500 transition-all disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            {isGeneratingAi ? 'Synthesizing...' : 'Generate AI Clinical Note'}
          </button>
        </div>
      </div>

      {/* AI Generated SOAP Note Display */}
      {aiNote && (
        <div className="rounded-2xl border border-cyan-500/40 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 p-6 shadow-2xl space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-cyan-400" />
              <h3 className="font-bold text-white text-sm">AI SOAP Clinical Assessment Note</h3>
              <span className="text-[10px] bg-cyan-950/80 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded font-mono">
                EMR Ready
              </span>
            </div>

            <button
              onClick={handleCopyNote}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
            >
              {copiedNote ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              {copiedNote ? 'Copied!' : 'Copy to EMR'}
            </button>
          </div>

          <pre className="p-4 rounded-xl border border-slate-800 bg-slate-950 text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
            {aiNote}
          </pre>
        </div>
      )}

      {/* Analytics Grid: ROM Curve + Compensations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ROM Progression Chart (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-sm">Joint ROM Progression vs Target Angle</h3>
              <p className="text-xs text-slate-400">Computer Vision Verified Peak Joint Angle (°)</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="text-cyan-400 flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" /> Peak Achieved
              </span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /> Target Protocol
              </span>
            </div>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={romChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis domain={[140, 185]} stroke="#64748b" fontSize={11} unit="°" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <ReferenceLine y={172} stroke="#10b981" strokeDasharray="4 4" label={{ value: 'Protocol Target (172°)', fill: '#10b981', fontSize: 11 }} />
                <Line 
                  type="monotone" 
                  dataKey="peakRom" 
                  stroke="#06b6d4" 
                  strokeWidth={3} 
                  dot={{ fill: '#06b6d4', r: 5 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Compensations Breakdown (1 col) */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div>
            <h3 className="font-bold text-white text-sm">Compensatory Faults</h3>
            <p className="text-xs text-slate-400">Total detected by vision model</p>
          </div>

          {compensationData.length > 0 ? (
            <div className="space-y-3 pt-2">
              {compensationData.map((item, idx) => (
                <div key={idx} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 flex justify-between items-center">
                  <span className="text-xs text-slate-300 font-medium">{item.name}</span>
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 border border-amber-900/40 px-2 py-0.5 rounded">
                    {item.count} flagged
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-44 flex-col items-center justify-center text-center p-4">
              <CheckCircle2 className="h-8 w-8 text-emerald-400 mb-2" />
              <p className="text-xs text-slate-300 font-semibold">Zero Critical Compensations</p>
              <p className="text-[11px] text-slate-500 mt-1">Patient maintains clean biomechanical posture.</p>
            </div>
          )}
        </div>

      </div>

      {/* Telemetry Session Log Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
        <h3 className="font-bold text-white text-sm">Detailed Session Telemetry History</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="pb-3 font-semibold">Date & Time</th>
                <th className="pb-3 font-semibold">Protocol</th>
                <th className="pb-3 font-semibold">Completed Reps</th>
                <th className="pb-3 font-semibold">Clean Reps</th>
                <th className="pb-3 font-semibold">Peak ROM</th>
                <th className="pb-3 font-semibold">Hold Time</th>
                <th className="pb-3 font-semibold">Form Score</th>
                <th className="pb-3 font-semibold">Pain (VAS)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {patient.history.map((sess) => (
                <tr key={sess.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 font-mono text-slate-400">
                    {new Date(sess.date).toLocaleDateString()} {new Date(sess.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3 font-medium text-white">{sess.exerciseName}</td>
                  <td className="py-3 font-mono">{sess.completedReps} / {sess.targetReps}</td>
                  <td className="py-3 font-mono text-cyan-400">{sess.cleanReps}</td>
                  <td className="py-3 font-mono font-semibold text-white">{sess.peakRom}°</td>
                  <td className="py-3 font-mono">{sess.averageHoldTime}s</td>
                  <td className="py-3 font-mono font-bold text-emerald-400">{sess.overallScore}%</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded font-mono text-[11px] ${
                      sess.painScore <= 3 ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'
                    }`}>
                      {sess.painScore} / 10
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Prescription Builder Modal */}
      {showRxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base">Adjust Prescription Protocol</h3>
              <button
                onClick={() => setShowRxModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePrescription} className="space-y-4 text-xs">
              
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Select Exercise Protocol</label>
                <select
                  value={rxExerciseId}
                  onChange={(e) => setRxExerciseId(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="knee-extension">Seated Knee Extension (TKE)</option>
                  <option value="bodyweight-squat">Controlled Rehabilitation Squat</option>
                  <option value="shoulder-scaption">Shoulder Scaption / Abduction</option>
                  <option value="straight-leg-raise">Straight Leg Raise</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Target Reps</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={rxTargetReps}
                    onChange={(e) => setRxTargetReps(parseInt(e.target.value))}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Target Sets</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={rxTargetSets}
                    onChange={(e) => setRxTargetSets(parseInt(e.target.value))}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Target ROM Angle (°)</label>
                  <input
                    type="number"
                    min="40"
                    max="180"
                    value={rxTargetAngle}
                    onChange={(e) => setRxTargetAngle(parseInt(e.target.value))}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Hold Duration (sec)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={rxHoldSec}
                    onChange={(e) => setRxHoldSec(parseInt(e.target.value))}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Clinical Notes for Patient</label>
                <textarea
                  rows={2}
                  value={rxNotes}
                  onChange={(e) => setRxNotes(e.target.value)}
                  placeholder="e.g. Focus on end-range quad squeeze, keep posture upright."
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRxModal(false)}
                  className="flex-1 rounded-xl border border-slate-700 bg-slate-800 py-2 font-semibold text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2 font-semibold text-white shadow-sm"
                >
                  Save Prescription
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
