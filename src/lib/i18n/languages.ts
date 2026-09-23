// REHAB-AI Multi-Language Localization System
// Comprehensive dictionaries for English, Hindi (हिन्दी), and Odia (ଓଡ଼ିଆ)

export type SupportedLanguage = 'en' | 'hi' | 'or';

export interface LanguageDefinition {
  code: SupportedLanguage;
  label: string;
  nativeLabel: string;
  speechLocale: string;
}

export const SUPPORTED_LANGUAGES: LanguageDefinition[] = [
  {
    code: 'en',
    label: 'English',
    nativeLabel: 'English',
    speechLocale: 'en-US',
  },
  {
    code: 'hi',
    label: 'Hindi',
    nativeLabel: 'हिन्दी',
    speechLocale: 'hi-IN',
  },
  {
    code: 'or',
    label: 'Odia',
    nativeLabel: 'ଓଡ଼ିଆ',
    speechLocale: 'or-IN',
  },
];

export const I18N_STRINGS: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    dashboardGreeting: 'Good morning',
    dashboardSubtitle: 'Your personalized computer vision rehabilitation routine.',
    todaysRehab: "Today's Rehabilitation",
    prescribedCount: 'exercises prescribed',
    estimatedTime: 'Estimated Duration',
    startSession: 'Start Session',
    completedSessions: 'Completed Sessions',
    adherenceRate: 'Adherence Rate',
    currentStreak: 'Day Streak',
    recentActivity: 'Recent Activity',
    prescribedExercises: 'Prescribed Exercises',
    recentSession: 'Recent Session',
    duration: 'Duration',
    metricTrend: 'Movement performance trend',
    allProtocols: 'All Protocols',
    upperExtremity: 'Upper Extremity',
    lowerExtremity: 'Lower Extremity',
    spineCore: 'Spine & Core',
    targetRange: 'Target Range',
    targetReps: 'Target Repetitions',
    cleanReps: 'Clean Repetitions',
    cadence: 'Cadence',
    reps: 'reps',
    minutes: 'minutes',
    seconds: 'seconds',
    // Voice cues
    standInFront: 'Stand in front of the camera.',
    raiseArmSlowly: 'Raise your arm slowly.',
    returnToStart: 'Good. Return to the starting position.',
    trackingReady: 'Tracking is ready.',
    trackingPaused: 'Tracking paused. Please adjust your posture.',
    // Voice command prompts
    cmdStart: 'Start exercise',
    cmdPause: 'Pause',
    cmdResume: 'Resume',
    cmdStop: 'Stop',
    cmdRepeat: 'Repeat instruction',
  },
  hi: {
    dashboardGreeting: 'शुभ प्रभात',
    dashboardSubtitle: 'आपकी व्यक्तिगत कंप्यूटर विजन पुनर्वास दिनचर्या।',
    todaysRehab: 'आज का पुनर्वास',
    prescribedCount: 'निर्धारित व्यायाम',
    estimatedTime: 'अनुमानित समय',
    startSession: 'सत्र शुरू करें',
    completedSessions: 'पूर्ण किए गए सत्र',
    adherenceRate: 'नियमितता दर',
    currentStreak: 'लगातार दिन',
    recentActivity: 'हाल की गतिविधि',
    prescribedExercises: 'निर्धारित व्यायाम',
    recentSession: 'हालिया सत्र',
    duration: 'अवधि',
    metricTrend: 'गति प्रदर्शन रुझान',
    allProtocols: 'सभी प्रोटोकॉल',
    upperExtremity: 'ऊपरी अंग',
    lowerExtremity: 'निचला अंग',
    spineCore: 'रीढ़ और कोर',
    targetRange: 'लक्ष्य कोण',
    targetReps: 'लक्ष्य पुनरावृत्तियां',
    cleanReps: 'सटीक पुनरावृत्तियां',
    cadence: 'गति',
    reps: 'बार',
    minutes: 'मिनट',
    seconds: 'सेकंड',
    // Voice cues
    standInFront: 'कैमरे के सामने खड़े हो जाएं।',
    raiseArmSlowly: 'अपनी बांह को धीरे-धीरे उठाएं।',
    returnToStart: 'बहुत अच्छा। शुरुआती स्थिति में वापस आएं।',
    trackingReady: 'ट्रैकिंग तैयार है।',
    trackingPaused: 'ट्रैकिंग रुकी हुई है। कृपया अपनी मुद्रा ठीक करें।',
    // Voice command prompts
    cmdStart: 'व्यायाम शुरू करें',
    cmdPause: 'रोकें',
    cmdResume: 'जारी रखें',
    cmdStop: 'बंद करें',
    cmdRepeat: 'निर्देश दोहराएं',
  },
  or: {
    dashboardGreeting: 'ଶୁଭ ସକାଳ',
    dashboardSubtitle: 'ଆପଣଙ୍କର ବ୍ୟକ୍ତିଗତ କମ୍ପ୍ୟୁଟର ଭିଜନ ପୁନର୍ବାସ କାର୍ଯ୍ୟସୂଚୀ।',
    todaysRehab: 'ଆଜିର ପୁନର୍ବାସ',
    prescribedCount: 'ନିର୍ଦ୍ଧାରିତ ବ୍ୟାୟାମ',
    estimatedTime: 'ଆନୁମାନିକ ସମୟ',
    startSession: 'ସତ୍ର ଆରମ୍ଭ କରନ୍ତୁ',
    completedSessions: 'ସମାପ୍ତ ସତ୍ର',
    adherenceRate: 'ନିୟମିତତା ହାର',
    currentStreak: 'ଲଗାତାର ଦିନ',
    recentActivity: 'ନିକଟତମ କାର୍ଯ୍ୟକଳାପ',
    prescribedExercises: 'ନିର୍ଦ୍ଧାରିତ ବ୍ୟାୟାମ',
    recentSession: 'ସାମ୍ପ୍ରତିକ ସତ୍ର',
    duration: 'ସମୟାବଧି',
    metricTrend: 'ଗତିଶୀଳତା ପ୍ରଦର୍ଶନ ଧାରା',
    allProtocols: 'ସମସ୍ତ ପ୍ରୋଟୋକଲ୍',
    upperExtremity: 'ଉପର ଅଙ୍ଗ',
    lowerExtremity: 'ତଳ ଅଙ୍ଗ',
    spineCore: 'ମେରୁଦଣ୍ଡ ଏବଂ କୋର୍',
    targetRange: 'ଲକ୍ଷ୍ୟ କୋଣ',
    targetReps: 'ଲକ୍ଷ୍ୟ ଆବୃତ୍ତି',
    cleanReps: 'ସଠିକ୍ ଆବୃତ୍ତି',
    cadence: 'ଗତି',
    reps: 'ଥର',
    minutes: 'ମିନିଟ୍',
    seconds: 'ସେକେଣ୍ଡ',
    // Voice cues
    standInFront: 'କ୍ୟାମେରା ଆଗରେ ଛିଡା ହୁଅନ୍ତୁ।',
    raiseArmSlowly: 'ଆପଣଙ୍କ ହାତକୁ ଧୀରେ ଧୀରେ ଉପରକୁ ଉଠାନ୍ତୁ।',
    returnToStart: 'ବହୁତ ଭଲ। ପ୍ରାରମ୍ଭିକ ସ୍ଥିତିକୁ ଫେରି ଆସନ୍ତୁ।',
    trackingReady: 'ଟ୍ରାକିଂ ପ୍ରସ୍ତୁତ ଅଛି।',
    trackingPaused: 'ଟ୍ରାକିଂ ଅଟକି ରହିଛି। ଦୟାକରି ଆପଣଙ୍କ ସ୍ଥିତି ସଠିକ୍ କରନ୍ତୁ।',
    // Voice command prompts
    cmdStart: 'ବ୍ୟାୟାମ ଆରମ୍ଭ କରନ୍ତୁ',
    cmdPause: 'ଅଟକାନ୍ତୁ',
    cmdResume: 'ଚାଲୁ ରଖନ୍ତୁ',
    cmdStop: 'ବନ୍ଦ କରନ୍ତୁ',
    cmdRepeat: 'ନିର୍ଦ୍ଦେଶ ଦୋହରାନ୍ତୁ',
  },
};

export function getTranslation(key: string, lang: SupportedLanguage = 'en'): string {
  return I18N_STRINGS[lang]?.[key] || I18N_STRINGS.en[key] || key;
}
