// REHAB-AI: Multi-Language Clinical Coaching & UI Translation Dictionary
import { LanguageCode, RepState } from '@/types/rehab';

export interface TranslationDictionary {
  languageName: string;
  bcp47: string;
  ui: {
    startWorkout: string;
    finishSession: string;
    pause: string;
    resume: string;
    repCount: string;
    jointAngle: string;
    target: string;
    holdPeak: string;
    formScore: string;
    painRating: string;
    effortRating: string;
    saveSession: string;
    voiceCoach: string;
    voiceCommandsOn: string;
    voiceCommandsOff: string;
    listening: string;
  };
  states: Record<RepState, string>;
  cues: {
    ready: string;
    approaching: string;
    holding: string;
    returnDescend: string;
    repDone: string;
    sitTall: string;
    lockKnee: string;
    pushKneesOut: string;
    chestUp: string;
    keepShoulderDown: string;
  };
}

export const TRANSLATIONS: Record<LanguageCode, TranslationDictionary> = {
  en: {
    languageName: 'English',
    bcp47: 'en-US',
    ui: {
      startWorkout: "Start Today's Workout",
      finishSession: 'Finish Session',
      pause: 'Pause',
      resume: 'Resume',
      repCount: 'Rep Count',
      jointAngle: 'Joint Angle',
      target: 'Target',
      holdPeak: 'HOLD PEAK',
      formScore: 'Form Score',
      painRating: 'Pain Level (VAS 0-10)',
      effortRating: 'Perceived Exertion (RPE 1-10)',
      saveSession: 'Save & Sync with Clinician',
      voiceCoach: 'Voice Coach',
      voiceCommandsOn: 'Voice Commands Active',
      voiceCommandsOff: 'Voice Commands Disabled',
      listening: 'Listening for voice commands...',
    },
    states: {
      CALIBRATING: 'Aligning Body in Frame...',
      START_POSITION: 'Ready: Initiate Movement',
      IN_MOTION: 'Moving Toward Target Zone',
      HOLDING_PEAK: 'Holding Peak Range of Motion',
      RETURNING: 'Controlled Descent / Return',
      REP_COMPLETED: 'Repetition Complete!',
      FAULT_DETECTED: 'Form Fault Detected',
    },
    cues: {
      ready: 'Ready. Begin moving smoothly.',
      approaching: 'Approaching target range, squeeze.',
      holding: 'Hold full extension steady.',
      returnDescend: 'Good hold! Lower slowly with control.',
      repDone: 'Rep completed! Smooth movement.',
      sitTall: 'Sit tall, do not lean back.',
      lockKnee: 'Lock that knee straight.',
      pushKneesOut: 'Push your knees out.',
      chestUp: 'Chest up, do not pitch forward.',
      keepShoulderDown: 'Keep shoulder down, do not shrug.',
    },
  },
  es: {
    languageName: 'Español',
    bcp47: 'es-ES',
    ui: {
      startWorkout: 'Iniciar Entrenamiento',
      finishSession: 'Terminar Sesión',
      pause: 'Pausar',
      resume: 'Reanudar',
      repCount: 'Repeticiones',
      jointAngle: 'Ángulo Articular',
      target: 'Objetivo',
      holdPeak: 'MANTENER',
      formScore: 'Puntaje de Forma',
      painRating: 'Nivel de Dolor (EVA 0-10)',
      effortRating: 'Esfuerzo Percibido (RPE 1-10)',
      saveSession: 'Guardar y Sincronizar',
      voiceCoach: 'Entrenador de Voz',
      voiceCommandsOn: 'Comandos de Voz Activos',
      voiceCommandsOff: 'Comandos Desactivados',
      listening: 'Escuchando comandos de voz...',
    },
    states: {
      CALIBRATING: 'Alineando cuerpo en pantalla...',
      START_POSITION: 'Listo: Inicie el movimiento',
      IN_MOTION: 'Moviendo hacia el rango objetivo',
      HOLDING_PEAK: 'Manteniendo extensión máxima',
      RETURNING: 'Descenso controlado',
      REP_COMPLETED: '¡Repetición completada!',
      FAULT_DETECTED: 'Falla de postura detectada',
    },
    cues: {
      ready: 'Listo. Inicie suavemente.',
      approaching: 'Acercándose al objetivo, apriete.',
      holding: 'Mantenga la posición firme.',
      returnDescend: '¡Buen aguante! Baje con control.',
      repDone: '¡Repetición lograda! Excelente control.',
      sitTall: 'Siéntese derecho, no se incline atrás.',
      lockKnee: 'Bloquee la rodilla recta.',
      pushKneesOut: 'Empuje las rodillas hacia afuera.',
      chestUp: 'Pecho erguido, no se incline adelante.',
      keepShoulderDown: 'Hombros abajo, no encoja el cuello.',
    },
  },
  fr: {
    languageName: 'Français',
    bcp47: 'fr-FR',
    ui: {
      startWorkout: "Démarrer l'entraînement",
      finishSession: 'Terminer la séance',
      pause: 'Pause',
      resume: 'Reprendre',
      repCount: 'Répétitions',
      jointAngle: 'Angle Articulaire',
      target: 'Cible',
      holdPeak: 'MAINTENIR',
      formScore: 'Score de Posture',
      painRating: 'Niveau de Douleur (EVA 0-10)',
      effortRating: 'Effort Perçu (RPE 1-10)',
      saveSession: 'Enregistrer et Synchroniser',
      voiceCoach: 'Coach Vocal',
      voiceCommandsOn: 'Commandes Vocales Actives',
      voiceCommandsOff: 'Commandes Désactivées',
      listening: 'À l’écoute des commandes vocales...',
    },
    states: {
      CALIBRATING: 'Alignement du corps dans le cadre...',
      START_POSITION: 'Prêt: Démarrez le mouvement',
      IN_MOTION: 'Progression vers la zone cible',
      HOLDING_PEAK: 'Maintien de l’extension maximale',
      RETURNING: 'Descente contrôlée',
      REP_COMPLETED: 'Répétition terminée !',
      FAULT_DETECTED: 'Défaut de posture détecté',
    },
    cues: {
      ready: 'Prêt. Commencez doucement.',
      approaching: 'Approche de la cible, contractez.',
      holding: 'Maintenez l’extension fermement.',
      returnDescend: 'Très bien ! Descendez avec contrôle.',
      repDone: 'Répétition validée ! Beau contrôle.',
      sitTall: 'Tenez-vous droit, ne penchez pas en arrière.',
      lockKnee: 'Verrouillez le genou bien droit.',
      pushKneesOut: 'Poussez les genoux vers l’extérieur.',
      chestUp: 'Buste droit, ne plongez pas en avant.',
      keepShoulderDown: 'Baissez les épaules, ne haussez pas le cou.',
    },
  },
  de: {
    languageName: 'Deutsch',
    bcp47: 'de-DE',
    ui: {
      startWorkout: 'Training Starten',
      finishSession: 'Sitzung Beenden',
      pause: 'Pause',
      resume: 'Fortsetzen',
      repCount: 'Wiederholungen',
      jointAngle: 'Gelenkwinkel',
      target: 'Ziel',
      holdPeak: 'HALTEN',
      formScore: 'Haltungs-Score',
      painRating: 'Schmerzniveau (VAS 0-10)',
      effortRating: 'Anstrengung (RPE 1-10)',
      saveSession: 'Speichern & Synchronisieren',
      voiceCoach: 'Sprach-Coach',
      voiceCommandsOn: 'Sprachbefehle Aktiv',
      voiceCommandsOff: 'Sprachbefehle Aus',
      listening: 'Warte auf Sprachbefehle...',
    },
    states: {
      CALIBRATING: 'Körper wird kalibriert...',
      START_POSITION: 'Bereit: Bewegung starten',
      IN_MOTION: 'In Bewegung zum Zielbereich',
      HOLDING_PEAK: 'Haltung in Spitzenposition',
      RETURNING: 'Kontrollierte Rückkehr',
      REP_COMPLETED: 'Wiederholung abgeschlossen!',
      FAULT_DETECTED: 'Kompensation erkannt',
    },
    cues: {
      ready: 'Bereit. Langsam beginnen.',
      approaching: 'Zielbereich nähert sich, anspannen.',
      holding: 'Position stabil halten.',
      returnDescend: 'Sehr gut! Kontrolliert senken.',
      repDone: 'Wiederholung geschafft! Saubere Form.',
      sitTall: 'Aufrecht sitzen, nicht nach hinten lehnen.',
      lockKnee: 'Knie ganz durchstrecken.',
      pushKneesOut: 'Knie nach außen drücken.',
      chestUp: 'Brust aufrecht halten.',
      keepShoulderDown: 'Schultern tief lassen, nicht hochziehen.',
    },
  },
  hi: {
    languageName: 'हिन्दी',
    bcp47: 'hi-IN',
    ui: {
      startWorkout: 'कसरत शुरू करें',
      finishSession: 'सत्र समाप्त करें',
      pause: 'रोकें',
      resume: 'फिर से शुरू करें',
      repCount: 'दोहराव (Reps)',
      jointAngle: 'जोड़ का कोण',
      target: 'लक्ष्य',
      holdPeak: 'रोक कर रखें',
      formScore: 'मुद्रा स्कोर',
      painRating: 'दर्द का स्तर (VAS 0-10)',
      effortRating: 'मेहनत का स्तर (RPE 1-10)',
      saveSession: 'सहेजें और डॉक्टर को भेजें',
      voiceCoach: 'वॉयस कोच',
      voiceCommandsOn: 'आवाज आदेश सक्रिय',
      voiceCommandsOff: 'आवाज आदेश बंद',
      listening: 'आवाज आदेश सुन रहे हैं...',
    },
    states: {
      CALIBRATING: 'शरीर को कैमरे में सीधा लाएं...',
      START_POSITION: 'तैयार: व्यायाम शुरू करें',
      IN_MOTION: 'लक्ष्य की ओर बढ़ रहे हैं',
      HOLDING_PEAK: 'अधिकतम कोण पर रोकें',
      RETURNING: 'नियंत्रण के साथ वापस लाएं',
      REP_COMPLETED: 'एक दोहराव पूरा हुआ!',
      FAULT_DETECTED: 'गलत मुद्रा पहचानी गई',
    },
    cues: {
      ready: 'तैयार। धीरे-धीरे शुरू करें।',
      approaching: 'लक्ष्य के पास हैं, मांसपेशियों को खींचें।',
      holding: 'मजबूती से रोक कर रखें।',
      returnDescend: 'बहुत अच्छा! धीरे-धीरे नीचे लाएं।',
      repDone: 'दोहराव पूरा! बेहतरीन नियंत्रण।',
      sitTall: 'सीधे बैठें, पीछे न झुकें।',
      lockKnee: 'घुटने को बिल्कुल सीधा रखें।',
      pushKneesOut: 'घुटनों को बाहर की तरफ रखें।',
      chestUp: 'छाती सीधी रखें, आगे न झुकें।',
      keepShoulderDown: 'कंधों को ढीला और नीचे रखें।',
    },
  },
};
