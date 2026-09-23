// REHAB-AI: Medical Safety Boundaries & AI Guardrails

export const SYSTEM_SAFETY_BOUNDARIES = {
  IS_MEDICAL_DEVICE: false,
  IS_DIAGNOSTIC_TOOL: false,
  CAN_PRESCRIBE_MEDICATION: false,
  CAN_ALTER_CLINICIAN_TARGETS: false,
  EMERGENCY_SUPPORT_PROVIDED: false,
} as const;

/**
 * Validates that any AI prompt or generated content adheres strictly to product boundaries.
 * Prohibits diagnosis, prescription, emergency triage, or changing clinician-set targets.
 */
export function validateAiSafetyBoundary(text: string): { isCompliant: boolean; flaggedTerms: string[] } {
  const prohibitedIntents = [
    'you are diagnosed with',
    'i diagnose you with',
    'take this medication',
    'prescription for ibuprofen',
    'you should stop seeing your doctor',
    'this is a medical emergency, you have',
    'your target angle has been updated to',
    'you do not need a physiotherapist',
  ];

  const lower = text.toLowerCase();
  const violations = prohibitedIntents.filter((phrase) => lower.includes(phrase));

  return {
    isCompliant: violations.length === 0,
    flaggedTerms: violations,
  };
}

/**
 * Validates whether a pain score or symptom report requires clinician escalation.
 */
export function evaluateClinicalEscalation(painScore: number, acuteSymptom: boolean): {
  requiresEscalation: boolean;
  alertLevel: 'none' | 'advisory' | 'escalate_to_clinician' | 'seek_emergency_care';
  message: string;
} {
  if (acuteSymptom) {
    return {
      requiresEscalation: true,
      alertLevel: 'seek_emergency_care',
      message: 'Please cease exercise immediately. If you experience severe chest pain, shortness of breath, sudden numbness, or dizziness, seek emergency medical care immediately.',
    };
  }

  if (painScore >= 7) {
    return {
      requiresEscalation: true,
      alertLevel: 'escalate_to_clinician',
      message: 'High pain level recorded (7+/10). Exercise session halted. An advisory alert has been placed for your supervising physiotherapist to review before your next session.',
    };
  }

  if (painScore >= 5) {
    return {
      requiresEscalation: false,
      alertLevel: 'advisory',
      message: 'Moderate discomfort reported (5-6/10). Proceed with gentle movement within your comfortable range of motion.',
    };
  }

  return {
    requiresEscalation: false,
    alertLevel: 'none',
    message: 'Comfortable movement reported. Continue with prescribed exercise dosage.',
  };
}
