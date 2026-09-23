// REHAB-AI: Foundation Unit Tests for Safety Boundaries & Deterministic Logic
import { validateAiSafetyBoundary, evaluateClinicalEscalation } from '../src/lib/safety/boundaries';
import { calculateAdherenceRate, calculateCleanRepRatio } from '../src/lib/analytics/metrics';
import { validatePrescriptionInput, validatePainReport } from '../src/lib/validation/schemas';

// Self-contained test runner primitives (zero external dependency, strict TypeScript compatible)
function describe(suiteName: string, fn: () => void) {
  fn();
}

function it(testName: string, fn: () => void) {
  try {
    fn();
  } catch (error) {
    console.error(`FAIL: ${testName}`, error);
    throw error;
  }
}

function expect<T>(actual: T) {
  return {
    toBe(expected: T) {
      if (actual !== expected) {
        throw new Error(`Expected ${String(expected)}, but got ${String(actual)}`);
      }
    },
    toBeDefined() {
      if (actual === undefined || actual === null) {
        throw new Error(`Expected value to be defined, but got ${String(actual)}`);
      }
    },
  };
}

describe('Safety Boundaries & Guardrails', () => {
  it('blocks diagnostic claims in AI generated content', () => {
    const violation = validateAiSafetyBoundary('I diagnose you with patellofemoral pain syndrome.');
    expect(violation.isCompliant).toBe(false);
  });

  it('allows valid descriptive and educational summaries', () => {
    const validSummary = validateAiSafetyBoundary('You achieved 175 degrees of extension with steady quadriceps control.');
    expect(validSummary.isCompliant).toBe(true);
  });

  it('escalates acute symptoms and high pain scores (>=7)', () => {
    const normal = evaluateClinicalEscalation(2, false);
    expect(normal.requiresEscalation).toBe(false);

    const highPain = evaluateClinicalEscalation(8, false);
    expect(highPain.requiresEscalation).toBe(true);
    expect(highPain.alertLevel).toBe('escalate_to_clinician');

    const emergency = evaluateClinicalEscalation(4, true);
    expect(emergency.requiresEscalation).toBe(true);
    expect(emergency.alertLevel).toBe('seek_emergency_care');
  });
});

describe('Deterministic Analytics', () => {
  it('calculates adherence percentages accurately', () => {
    expect(calculateAdherenceRate(5, 5)).toBe(100);
    expect(calculateAdherenceRate(4, 5)).toBe(80);
    expect(calculateAdherenceRate(0, 5)).toBe(0);
  });

  it('calculates clean repetition ratios', () => {
    expect(calculateCleanRepRatio(9, 10)).toBe(90);
    expect(calculateCleanRepRatio(10, 10)).toBe(100);
  });
});

describe('Input Validation', () => {
  it('validates prescription target angle limits', () => {
    const valid = validatePrescriptionInput({
      patientId: 'pt-001',
      exerciseId: 'knee-extension',
      targetAngleMin: 170,
      targetReps: 10,
      targetSets: 3,
    });
    expect(valid.isValid).toBe(true);

    const invalid = validatePrescriptionInput({
      patientId: '',
      exerciseId: 'knee-extension',
      targetAngleMin: 220,
    });
    expect(invalid.isValid).toBe(false);
    expect(invalid.errors.patientId).toBeDefined();
    expect(invalid.errors.targetAngleMin).toBeDefined();
  });

  it('validates VAS pain score range (0-10)', () => {
    expect(validatePainReport(0)).toBe(true);
    expect(validatePainReport(10)).toBe(true);
    expect(validatePainReport(-1)).toBe(false);
    expect(validatePainReport(11)).toBe(false);
  });
});
