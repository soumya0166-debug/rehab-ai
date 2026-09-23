// REHAB-AI Voice Command Parser & Safety Guard
// Recognizes the 5 supported hands-free commands across English, Hindi, and Odia.
// Strictly blocks any verbal attempts to alter prescriptions or clinical data.

export type RecognizedVoiceAction =
  | 'START_EXERCISE'
  | 'PAUSE'
  | 'RESUME'
  | 'STOP'
  | 'REPEAT_INSTRUCTION'
  | 'UNRECOGNIZED';

export interface CommandParseResult {
  action: RecognizedVoiceAction;
  rawTranscript: string;
  requiresVisibleConfirmation: boolean;
  friendlyExplanation: string;
}

/**
 * Matches vocal transcripts against permitted accessibility commands.
 */
export function parseVoiceCommand(transcript: string): CommandParseResult {
  const normalized = transcript.trim().toLowerCase();

  // Safety Filter: Explicitly block any command that attempts to modify prescriptions
  const prescriptionModTerms = [
    'change reps',
    'increase target',
    'decrease angle',
    'modify prescription',
    'बदलें',
    'बढ़ाएं',
    'କମାନ୍ତୁ',
    'ବଦଳାନ୍ତୁ',
  ];

  if (prescriptionModTerms.some((term) => normalized.includes(term))) {
    return {
      action: 'UNRECOGNIZED',
      rawTranscript: transcript,
      requiresVisibleConfirmation: false,
      friendlyExplanation:
        'Voice commands cannot modify clinical prescriptions. Changes must be made by your physiotherapist.',
    };
  }

  // 1. START EXERCISE
  if (
    normalized.includes('start exercise') ||
    normalized.includes('start') ||
    normalized.includes('begin') ||
    normalized.includes('शुरू करें') ||
    normalized.includes('व्यायाम शुरू') ||
    normalized.includes('ଆରମ୍ଭ କରନ୍ତୁ')
  ) {
    return {
      action: 'START_EXERCISE',
      rawTranscript: transcript,
      requiresVisibleConfirmation: false,
      friendlyExplanation: 'Starting exercise session.',
    };
  }

  // 2. PAUSE
  if (
    normalized.includes('pause') ||
    normalized.includes('hold on') ||
    normalized.includes('रोकें') ||
    normalized.includes('विराम') ||
    normalized.includes('ଅଟକାନ୍ତୁ')
  ) {
    return {
      action: 'PAUSE',
      rawTranscript: transcript,
      requiresVisibleConfirmation: false,
      friendlyExplanation: 'Session paused.',
    };
  }

  // 3. RESUME
  if (
    normalized.includes('resume') ||
    normalized.includes('continue') ||
    normalized.includes('जारी रखें') ||
    normalized.includes('ଚାଲୁ ରଖନ୍ତୁ')
  ) {
    return {
      action: 'RESUME',
      rawTranscript: transcript,
      requiresVisibleConfirmation: false,
      friendlyExplanation: 'Resuming session.',
    };
  }

  // 4. STOP (Requires confirmation for safety)
  if (
    normalized.includes('stop') ||
    normalized.includes('finish') ||
    normalized.includes('end session') ||
    normalized.includes('बंद करें') ||
    normalized.includes('समाप्त') ||
    normalized.includes('ବନ୍ଦ କରନ୍ତୁ')
  ) {
    return {
      action: 'STOP',
      rawTranscript: transcript,
      requiresVisibleConfirmation: true,
      friendlyExplanation: 'Ending session and compiling summary.',
    };
  }

  // 5. REPEAT INSTRUCTION
  if (
    normalized.includes('repeat instruction') ||
    normalized.includes('repeat') ||
    normalized.includes('say again') ||
    normalized.includes('निर्देश दोहराएं') ||
    normalized.includes('फिर से बोलें') ||
    normalized.includes('ନିର୍ଦ୍ଦେଶ ଦୋହରାନ୍ତୁ')
  ) {
    return {
      action: 'REPEAT_INSTRUCTION',
      rawTranscript: transcript,
      requiresVisibleConfirmation: false,
      friendlyExplanation: 'Repeating coaching instruction.',
    };
  }

  return {
    action: 'UNRECOGNIZED',
    rawTranscript: transcript,
    requiresVisibleConfirmation: false,
    friendlyExplanation: `Unrecognized command: "${transcript}". Speak "Start exercise", "Pause", "Resume", "Stop", or "Repeat instruction".`,
  };
}
