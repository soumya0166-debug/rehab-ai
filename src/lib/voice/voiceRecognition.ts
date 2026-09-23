// REHAB-AI: Hands-Free Voice Command Recognition Listener
import { LanguageCode } from '@/types/rehab';
import { TRANSLATIONS } from '../i18n/translations';

export type VoiceCommandHandler = (command: 'start' | 'pause' | 'resume' | 'finish' | 'status') => void;

interface IWindowWithSpeech extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export class VoiceCommandListener {
  private recognition: any = null;
  private isListening: boolean = false;
  private onCommandCallback: VoiceCommandHandler | null = null;
  private language: LanguageCode = 'en';

  constructor(onCommand?: VoiceCommandHandler) {
    if (onCommand) this.onCommandCallback = onCommand;
  }

  public isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    const win = window as IWindowWithSpeech;
    return !!(win.SpeechRecognition || win.webkitSpeechRecognition);
  }

  public setLanguage(lang: LanguageCode) {
    this.language = lang;
    if (this.recognition) {
      this.recognition.lang = TRANSLATIONS[lang]?.bcp47 || 'en-US';
    }
  }

  public startListening(onCommand: VoiceCommandHandler) {
    if (!this.isSupported() || typeof window === 'undefined') return;

    this.onCommandCallback = onCommand;
    const win = window as IWindowWithSpeech;
    const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;

    try {
      this.recognition = new SpeechRecognitionClass();
      this.recognition.continuous = true;
      this.recognition.interimResults = false;
      this.recognition.lang = TRANSLATIONS[this.language]?.bcp47 || 'en-US';

      this.recognition.onresult = (event: any) => {
        const lastResultIndex = event.results.length - 1;
        const transcript = event.results[lastResultIndex][0].transcript.trim().toLowerCase();
        this.parseCommand(transcript);
      };

      this.recognition.onerror = (event: any) => {
        // Silently restart on no-speech errors to maintain continuous hands-free monitoring
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          console.warn('Speech recognition warning:', event.error);
        }
      };

      this.recognition.onend = () => {
        if (this.isListening) {
          try {
            this.recognition.start();
          } catch {
            // ignore
          }
        }
      };

      this.recognition.start();
      this.isListening = true;
    } catch (err) {
      console.warn('Voice command recognition could not start:', err);
    }
  }

  public stopListening() {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
      this.recognition = null;
    }
  }

  private parseCommand(text: string) {
    if (!this.onCommandCallback) return;

    // English, Spanish, French, German keywords
    if (
      text.includes('pause') || 
      text.includes('stop') || 
      text.includes('pausa') || 
      text.includes('halte') || 
      text.includes('रुको') ||
      text.includes('रोको')
    ) {
      this.onCommandCallback('pause');
    } else if (
      text.includes('resume') || 
      text.includes('continue') || 
      text.includes('reanudar') || 
      text.includes('reprendre') || 
      text.includes('weiter') ||
      text.includes('शुरू')
    ) {
      this.onCommandCallback('resume');
    } else if (
      text.includes('finish') || 
      text.includes('done') || 
      text.includes('terminar') || 
      text.includes('terminé') || 
      text.includes('beenden') ||
      text.includes('खत्म')
    ) {
      this.onCommandCallback('finish');
    } else if (
      text.includes('start') || 
      text.includes('begin') || 
      text.includes('iniciar') || 
      text.includes('démarrer')
    ) {
      this.onCommandCallback('start');
    } else if (
      text.includes('status') || 
      text.includes('score') || 
      text.includes('estado') || 
      text.includes('स्कोर')
    ) {
      this.onCommandCallback('status');
    }
  }

  public getIsListening(): boolean {
    return this.isListening;
  }
}

export const voiceRecognition = new VoiceCommandListener();
