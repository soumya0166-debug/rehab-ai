// REHAB-AI AI Multi-Language Translation Service
// Translates exercise guidance, coaching cues, and clinical summaries into Hindi and Odia.

import { TranslationInput, TranslationOutput, TranslationInputSchema } from './schemas';

// Core dictionary of clinically verified rehabilitation terms in English, Hindi, and Odia
export const REHAB_DICTIONARY: Record<
  string,
  { hi: string; or: string }
> = {
  // Common instructions
  'Stand in front of the camera.': {
    hi: 'कैमरे के सामने खड़े हो जाएं।',
    or: 'କ୍ୟାମେରା ଆଗରେ ଛିଡା ହୁଅନ୍ତୁ।',
  },
  'Move slightly farther from the camera.': {
    hi: 'कैमरे से थोड़ा पीछे हटें।',
    or: 'କ୍ୟାମେରାରୁ ଟିକେ ପଛକୁ ଯାଆନ୍ତୁ।',
  },
  'Raise your arm slowly.': {
    hi: 'अपनी बांह को धीरे-धीरे उठाएं।',
    or: 'ଆପଣଙ୍କ ହାତକୁ ଧୀରେ ଧୀରେ ଉପରକୁ ଉଠାନ୍ତୁ।',
  },
  'Good. Return to the starting position.': {
    hi: 'बहुत अच्छा। शुरुआती स्थिति में वापस आएं।',
    or: 'ବହୁତ ଭଲ। ପ୍ରାରମ୍ଭିକ ସ୍ଥିତିକୁ ଫେରି ଆସନ୍ତୁ।',
  },
  'Tracking is ready.': {
    hi: 'ट्रैकिंग तैयार है।',
    or: 'ଟ୍ରାକିଂ ପ୍ରସ୍ତୁତ ଅଛି।',
  },
  'Tracking paused — please ensure your exercise limb is clearly visible.': {
    hi: 'ट्रैकिंग रुकी हुई है — कृपया सुनिश्चित करें कि आपका व्यायाम अंग स्पष्ट रूप से दिखाई दे रहा है।',
    or: 'ଟ୍ରାକିଂ ଅଟକି ରହିଛି — ଦୟାକରି ନିଶ୍ଚିତ କରନ୍ତୁ ଯେ ଆପଣଙ୍କ ଅଙ୍ଗ ସ୍ପଷ୍ଟ ଭାବରେ ଦେଖାଯାଉଛି।',
  },
  'Keep your torso upright and avoid leaning.': {
    hi: 'अपने धड़ को सीधा रखें और झुकने से बचें।',
    or: 'ଆପଣଙ୍କ ଶରୀରକୁ ସିଧା ରଖନ୍ତୁ ଏବଂ ଝୁଙ୍କିବାରୁ ଦୂରେଇ ରୁହନ୍ତୁ।',
  },
  'Start exercise': {
    hi: 'व्यायाम शुरू करें',
    or: 'ବ୍ୟାୟାମ ଆରମ୍ଭ କରନ୍ତୁ',
  },
  'Pause': {
    hi: 'रोकें',
    or: 'ଅଟକାନ୍ତୁ',
  },
  'Resume': {
    hi: 'जारी रखें',
    or: 'ଚାଲୁ ରଖନ୍ତୁ',
  },
  'Stop': {
    hi: 'बंद करें',
    or: 'ବନ୍ଦ କରନ୍ତୁ',
  },
  'Repeat instruction': {
    hi: 'निर्देश दोहराएं',
    or: 'ନିର୍ଦ୍ଦେଶ ଦୋହରାନ୍ତୁ',
  },
  'Movement performance trend': {
    hi: 'गति प्रदर्शन रुझान',
    or: 'ଗତିଶୀଳତା ପ୍ରଦର୍ଶନ ଧାରା',
  },
};

/**
 * Translates text into target language using verified dictionary with fallback.
 */
export async function translateText(rawInput: unknown): Promise<TranslationOutput> {
  const input = TranslationInputSchema.parse(rawInput);
  const { text, targetLanguage } = input;

  if (targetLanguage === 'en') {
    return { translatedText: text, targetLanguage: 'en' };
  }

  // Check dictionary first for verified medical phrasing
  const entry = REHAB_DICTIONARY[text.trim()];
  if (entry && entry[targetLanguage]) {
    return {
      translatedText: entry[targetLanguage],
      targetLanguage,
    };
  }

  // Common substring replacements for Hindi
  if (targetLanguage === 'hi') {
    let t = text;
    for (const [en, trans] of Object.entries(REHAB_DICTIONARY)) {
      t = t.replace(en, trans.hi);
    }
    return { translatedText: t, targetLanguage: 'hi' };
  }

  // Common substring replacements for Odia
  if (targetLanguage === 'or') {
    let t = text;
    for (const [en, trans] of Object.entries(REHAB_DICTIONARY)) {
      t = t.replace(en, trans.or);
    }
    return { translatedText: t, targetLanguage: 'or' };
  }

  return { translatedText: text, targetLanguage };
}
