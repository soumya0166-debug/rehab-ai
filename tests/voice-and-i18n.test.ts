// REHAB-AI Voice Accessibility & Multi-Language Unit Tests
// Verifies voice command parsing, safety guards against prescription alteration, and language definitions.

import { parseVoiceCommand } from '../src/lib/voice/voice-commands';
import { SUPPORTED_LANGUAGES, getTranslation } from '../src/lib/i18n/languages';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function runVoiceTests() {
  console.log('--- RUNNING VOICE ACCESSIBILITY & MULTI-LANGUAGE TESTS ---');

  // Test 1: Language Definitions (English, Hindi, Odia)
  console.log('Test 1: Supported languages check');
  assert(SUPPORTED_LANGUAGES.length === 3, 'Exactly three primary supported languages');
  assert(SUPPORTED_LANGUAGES.some((l) => l.code === 'en'), 'English supported');
  assert(SUPPORTED_LANGUAGES.some((l) => l.code === 'hi'), 'Hindi supported');
  assert(SUPPORTED_LANGUAGES.some((l) => l.code === 'or'), 'Odia supported');

  // Test 2: Voice Command Matching (English)
  console.log('Test 2: English voice command matching');
  const startCmd = parseVoiceCommand('Start exercise');
  assert(startCmd.action === 'START_EXERCISE', 'Start command recognized');

  const pauseCmd = parseVoiceCommand('Pause please');
  assert(pauseCmd.action === 'PAUSE', 'Pause command recognized');

  const resumeCmd = parseVoiceCommand('Resume exercise');
  assert(resumeCmd.action === 'RESUME', 'Resume command recognized');

  const stopCmd = parseVoiceCommand('Stop');
  assert(stopCmd.action === 'STOP', 'Stop command recognized');
  assert(stopCmd.requiresVisibleConfirmation === true, 'Stop command requires visible confirmation for safety');

  const repeatCmd = parseVoiceCommand('Repeat instruction');
  assert(repeatCmd.action === 'REPEAT_INSTRUCTION', 'Repeat command recognized');

  // Test 3: Voice Command Matching (Hindi)
  console.log('Test 3: Hindi voice command matching');
  const startHi = parseVoiceCommand('व्यायाम शुरू करें');
  assert(startHi.action === 'START_EXERCISE', 'Hindi start command recognized');

  const pauseHi = parseVoiceCommand('रोकें');
  assert(pauseHi.action === 'PAUSE', 'Hindi pause command recognized');

  const resumeHi = parseVoiceCommand('जारी रखें');
  assert(resumeHi.action === 'RESUME', 'Hindi resume command recognized');

  const stopHi = parseVoiceCommand('बंद करें');
  assert(stopHi.action === 'STOP', 'Hindi stop command recognized');

  // Test 4: Voice Command Matching (Odia)
  console.log('Test 4: Odia voice command matching');
  const startOr = parseVoiceCommand('ଆରମ୍ଭ କରନ୍ତୁ');
  assert(startOr.action === 'START_EXERCISE', 'Odia start command recognized');

  const pauseOr = parseVoiceCommand('ଅଟକାନ୍ତୁ');
  assert(pauseOr.action === 'PAUSE', 'Odia pause command recognized');

  const resumeOr = parseVoiceCommand('ଚାଲୁ ରଖନ୍ତୁ');
  assert(resumeOr.action === 'RESUME', 'Odia resume command recognized');

  const stopOr = parseVoiceCommand('ବନ୍ଦ କରନ୍ତୁ');
  assert(stopOr.action === 'STOP', 'Odia stop command recognized');

  // Test 5: Voice Safety Guard (Blocks verbal prescription modification)
  console.log('Test 5: Safety guard against verbal prescription alteration');
  const badCommand1 = parseVoiceCommand('Change reps to 20');
  assert(badCommand1.action === 'UNRECOGNIZED', 'Verbal prescription alteration rejected');
  assert(badCommand1.friendlyExplanation.includes('cannot modify clinical prescriptions'), 'Friendly clinical explanation returned');

  const badCommand2 = parseVoiceCommand('बढ़ाएं target reps');
  assert(badCommand2.action === 'UNRECOGNIZED', 'Hindi alteration attempt rejected');

  console.log('ALL VOICE ACCESSIBILITY & I18N TESTS PASSED SUCCESSFULLY! ✅');
}

runVoiceTests();
