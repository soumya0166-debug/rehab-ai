// REHAB-AI: AI Summaries & Conversational Assistance Interface
// STRICT BOUNDARY: Generative AI is restricted to explanations, summaries, and translation.
// It is strictly prohibited from diagnosing patients, altering targets, or making emergency decisions.

import { validateAiSafetyBoundary } from '@/lib/safety/boundaries';

export interface ClinicalSummaryRequest {
  patientName: string;
  condition: string;
  adherenceRate: number;
  peakRomAchieved: number;
  targetRom: number;
  cleanRepCount: number;
  totalRepCount: number;
  averagePainRating: number;
  compensationsObserved: string[];
}

export function generateStructuredClinicalSummary(data: ClinicalSummaryRequest): string {
  const summary = `OBJECTIVE TELEMETRY SUMMARY:
Patient: ${data.patientName} | Condition: ${data.condition}
Adherence: ${data.adherenceRate}% weekly target met.
Peak Verified ROM: ${data.peakRomAchieved}° (Target: ${data.targetRom}°).
Repetition Integrity: ${data.cleanRepCount}/${data.totalRepCount} repetitions performed without compensation.
Recorded Compensations: ${data.compensationsObserved.length > 0 ? data.compensationsObserved.join(', ') : 'None detected'}.
Reported Discomfort: VAS ${data.averagePainRating}/10.

NON-DIAGNOSTIC ADVISORY:
Telemetry indicates steady motor unit recruitment. Review recommended for next clinical follow-up.`;

  // Verify compliance against safety boundary
  const safetyCheck = validateAiSafetyBoundary(summary);
  if (!safetyCheck.isCompliant) {
    throw new Error('Safety guardrail violation in AI summary');
  }

  return summary;
}
