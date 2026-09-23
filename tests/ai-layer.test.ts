// REHAB-AI AI Layer Unit Tests
// Tests Zod schema validation, deterministic summary generation, and translation without hallucination.

import {
  SessionSummaryInputSchema,
  SessionSummaryOutputSchema,
  TranslationInputSchema,
} from '../src/lib/ai/schemas';
import { generateDeterministicSessionSummary } from '../src/lib/ai/session-summary';
import { translateText, REHAB_DICTIONARY } from '../src/lib/ai/translation';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runAiTests() {
  console.log('--- RUNNING AI LAYER & NON-DIAGNOSTIC BOUNDARY TESTS ---');

  // Test 1: SessionSummaryInputSchema validation
  console.log('Test 1: Input schema validation');
  const validPayload = {
    exercise: 'Shoulder Raise',
    repetitions: 10,
    successfulRepetitions: 8,
    incompleteRepetitions: 2,
    averageAngle: 76,
    targetRange: [70, 80],
    duration: 384,
    trackingQuality: 'high',
    painReported: 2,
  };

  const parsed = SessionSummaryInputSchema.parse(validPayload);
  assert(parsed.exercise === 'Shoulder Raise', 'Exercise matches');
  assert(parsed.successfulRepetitions === 8, 'Successful reps matches');

  // Invalid payload (negative reps should fail)
  let failedAsExpected = false;
  try {
    SessionSummaryInputSchema.parse({
      ...validPayload,
      repetitions: -5,
    });
  } catch {
    failedAsExpected = true;
  }
  assert(failedAsExpected, 'Negative repetitions rejected by schema');

  // Test 2: Deterministic Session Summary adheres strictly to telemetry
  console.log('Test 2: Deterministic summary strictly adheres to verified metrics');
  const summary = generateDeterministicSessionSummary(parsed);
  assert(SessionSummaryOutputSchema.parse(summary) !== null, 'Output conforms to Zod output schema');
  assert(summary.summaryText.includes('8 of 10'), 'Summary accurately states 8 of 10 reps');
  assert(summary.summaryText.includes('Shoulder Raise'), 'Summary includes exercise name');
  assert(summary.summaryText.includes('70° to 80°'), 'Summary quotes target range');
  assert(summary.isClinicallySafe === true, 'Explicitly marked clinically safe');
  assert(!summary.summaryText.includes('cured') && !summary.summaryText.includes('diagnosis'), 'Contains zero medical claims');

  // Test 3: Multi-Language Translation
  console.log('Test 3: Multi-language translation dictionary');
  const hiTrans = await translateText({
    text: 'Stand in front of the camera.',
    targetLanguage: 'hi',
  });
  assert(hiTrans.translatedText === 'कैमरे के सामने खड़े हो जाएं।', `Hindi translation matches: ${hiTrans.translatedText}`);

  const orTrans = await translateText({
    text: 'Stand in front of the camera.',
    targetLanguage: 'or',
  });
  assert(orTrans.translatedText === 'କ୍ୟାମେରା ଆଗରେ ଛିଡା ହୁଅନ୍ତୁ।', `Odia translation matches: ${orTrans.translatedText}`);

  // Test 4: Neutral Movement Terminology
  console.log('Test 4: Neutral terminology enforcement');
  const trendEn = 'Movement performance trend';
  assert(REHAB_DICTIONARY[trendEn] !== undefined, 'Movement performance trend translated in dictionary');
  assert(REHAB_DICTIONARY[trendEn].hi === 'गति प्रदर्शन रुझान', 'Hindi translation is neutral');
  assert(REHAB_DICTIONARY[trendEn].or === 'ଗତିଶୀଳତା ପ୍ରଦର୍ଶନ ଧାରା', 'Odia translation is neutral');

  console.log('ALL AI LAYER TESTS PASSED SUCCESSFULLY! ✅');
}

runAiTests();
