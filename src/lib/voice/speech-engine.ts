// REHAB-AI Speech Engine (Text-to-Speech & Speech-to-Text)
// Tuned for elderly accessibility with calm cadence, clear pronunciation, and offline resilience.

import { SupportedLanguage, SUPPORTED_LANGUAGES } from '@/lib/i18n/languages';

class SpeechEngine {
  private isTtsSupported: boolean = false;
  private isSttSupported: boolean = false;
  private recognitionInstance: any = null;
  private currentLanguage: SupportedLanguage = 'en';

  constructor() {
    if (typeof window !== 'undefined') {
      this.isTtsSupported = 'speechSynthesis' in window;
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.isSttSupported = !!SpeechRecognition;
    }
  }

  public setLanguage(lang: SupportedLanguage) {
    this.currentLanguage = lang;
  }

  /**
   * Speaks concise text aloud with deliberate pacing and volume for elderly accessibility.
   */
  public speak(text: string, lang: SupportedLanguage = this.currentLanguage) {
    if (!this.isTtsSupported || typeof window === 'undefined') return;

    try {
      window.speechSynthesis.cancel(); // Cancel any ongoing speech queue

      const utterance = new SpeechSynthesisUtterance(text);
      const langDef = SUPPORTED_LANGUAGES.find((l) => l.code === lang);
      utterance.lang = langDef?.speechLocale || 'en-US';

      // Gentle, clear cadence for elderly comprehension
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Attempt to pick a natural regional voice if available
      const voices = window.speechSynthesis.getVoices();
      const matchingVoice = voices.find((v) => v.lang.startsWith(langDef?.speechLocale.split('-')[0] || 'en'));
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      // Fallback silently if audio context is blocked
    }
  }

  public stopSpeaking() {
    if (this.isTtsSupported && typeof window !== 'undefined') {
      window.speechSynthesis.cancel();
    }
  }

  /**
   * Starts listening for voice commands.
   * If speech recognition is unsupported, calls onError callback gracefully.
   */
  public startListening(
    onCommandRecognized: (transcript: string) => void,
    onError?: (error: string) => void,
    lang: SupportedLanguage = this.currentLanguage
  ): boolean {
    if (!this.isSttSupported || typeof window === 'undefined') {
      if (onError) onError('Speech recognition is not supported in this browser.');
      return false;
    }

    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) return false;

      if (this.recognitionInstance) {
        try {
          this.recognitionInstance.abort();
        } catch {}
      }

      const recognition = new SpeechRecognition();
      const langDef = SUPPORTED_LANGUAGES.find((l) => l.code === lang);
      recognition.lang = langDef?.speechLocale || 'en-US';
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        const lastResult = event.results[event.results.length - 1];
        if (lastResult && lastResult[0]) {
          const transcript = lastResult[0].transcript.trim().toLowerCase();
          onCommandRecognized(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error !== 'no-speech' && onError) {
          onError(`Speech recognition error: ${event.error}`);
        }
      };

      recognition.start();
      this.recognitionInstance = recognition;
      return true;
    } catch (err: any) {
      if (onError) onError(err.message || 'Unable to start speech recognition.');
      return false;
    }
  }

  public stopListening() {
    if (this.recognitionInstance) {
      try {
        this.recognitionInstance.stop();
      } catch {}
      this.recognitionInstance = null;
    }
  }

  public getCapabilities() {
    return {
      tts: this.isTtsSupported,
      stt: this.isSttSupported,
    };
  }
}

export const speechEngine = new SpeechEngine();
