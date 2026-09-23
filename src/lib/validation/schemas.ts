// REHAB-AI: Validation Schemas for Prescriptions, Sessions & User Input

export interface PrescriptionInput {
  patientId: string;
  exerciseId: string;
  targetAngleMin: number;
  targetAngleMax: number;
  targetReps: number;
  targetSets: number;
  holdSeconds: number;
  frequencyDaysPerWeek: number;
}

export function validatePrescriptionInput(input: Partial<PrescriptionInput>): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!input.patientId) errors.patientId = 'Patient selection is required.';
  if (!input.exerciseId) errors.exerciseId = 'Exercise protocol is required.';

  if (input.targetAngleMin !== undefined) {
    if (input.targetAngleMin < 0 || input.targetAngleMin > 180) {
      errors.targetAngleMin = 'Target angle must be between 0° and 180°.';
    }
  }

  if (input.targetReps !== undefined) {
    if (input.targetReps < 1 || input.targetReps > 50) {
      errors.targetReps = 'Target repetitions must be between 1 and 50.';
    }
  }

  if (input.targetSets !== undefined) {
    if (input.targetSets < 1 || input.targetSets > 10) {
      errors.targetSets = 'Target sets must be between 1 and 10.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validatePainReport(painScore: number): boolean {
  return Number.isInteger(painScore) && painScore >= 0 && painScore <= 10;
}
