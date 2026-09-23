import { LanguageCode } from '@/types/rehab';
import { TRANSLATIONS } from '../i18n/translations';

// REHAB-AI: Audio Cues & Text-To-Speech Voice Coach
export class SpeechCoach {
  private isMuted: boolean = false;
  private isSoundEffectsMuted: boolean = false;
  private audioCtx: AudioContext | null = null;
  private lastSpokenText: string = '';
  private lastSpokenTime: number = 0;
  private language: LanguageCode = 'en';

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  public setLanguage(lang: LanguageCode) {
    this.language = lang;
  }

  private initAudioContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  public setSoundEffectsMuted(muted: boolean) {
    this.isSoundEffectsMuted = muted;
  }

  public speak(text: string, force: boolean = false, minIntervalMs: number = 2500) {
    if (this.isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    const now = Date.now();
    if (!force && text === this.lastSpokenText && now - this.lastSpokenTime < minIntervalMs) {
      return;
    }

    window.speechSynthesis.cancel(); // Interrupt previous message for immediate real-time feedback

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05; // Slightly brisk, clear coaching pace
    utterance.pitch = 1.0;
    utterance.volume = 0.9;

    const bcp47 = TRANSLATIONS[this.language]?.bcp47 || 'en-US';
    utterance.lang = bcp47;

    // Pick a voice matching language if available
    const voices = window.speechSynthesis.getVoices();
    const langPrefix = bcp47.split('-')[0];
    const matchingVoice = voices.find(v => v.lang.startsWith(langPrefix) || v.lang.includes(langPrefix));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    this.lastSpokenText = text;
    this.lastSpokenTime = now;

    window.speechSynthesis.speak(utterance);
  }

  // Synthesized Sound Effects via Web Audio API (Zero external audio file dependencies)
  public playRepSuccessTone() {
    if (this.isSoundEffectsMuted) return;
    this.initAudioContext();
    if (!this.audioCtx) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    // Ascending harmonious chord (C5 -> E5 -> G5)
    [523.25, 659.25, 783.99].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.001, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.2, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.4);
    });
  }

  public playHoldTickTone() {
    if (this.isSoundEffectsMuted) return;
    this.initAudioContext();
    if (!this.audioCtx) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, now); // A5 crisp tick

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.07);
  }

  public playAlertTone() {
    if (this.isSoundEffectsMuted) return;
    this.initAudioContext();
    if (!this.audioCtx) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.2);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }
}

export const speechCoach = new SpeechCoach();
