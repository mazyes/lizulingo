/**
 * German Audio Engine:
 * - Plays high-quality ElevenLabs MP3 from /audio/<hash>.mp3 if available.
 * - Supports slow mode (playbackRate = 0.75).
 * - Falls back seamlessly to Web Speech API (speechSynthesis de-DE).
 */

import { computeAudioHash } from './audioHash';
import { sentenceVoice } from './speakerVoice';

class TTSEngine {
  private germanVoice: SpeechSynthesisVoice | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  // Hashes of MP3s that exist in /audio (from manifest.json). Lets speak() decide
  // synchronously, so playback starts inside the tap (required by iOS Safari).
  private available = new Set<string>();

  constructor() {
    if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
      fetch('/audio/manifest.json')
        .then(r => (r.ok ? r.json() : []))
        .then((list: string[]) => { this.available = new Set(list); })
        .catch(() => {});
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.initVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        this.initVoices();
      };
    }
  }

  private initVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    this.germanVoice =
      voices.find(v => v.lang === 'de-DE' || v.lang === 'de_DE') ||
      voices.find(v => v.lang.startsWith('de')) ||
      null;
  }

  public hasGermanVoice(): boolean {
    return true; // Always return true because we have ElevenLabs MP3 + Web Speech fallback
  }

  public speak(
    text: string,
    optionsOrRate?: number | { slow?: boolean; voice?: 'male' | 'female' | 'default'; onEnd?: () => void },
    legacyVoice?: 'male' | 'female' | 'default'
  ) {
    if (typeof window === 'undefined' || !text) return;

    this.stop();

    let rate = 1.0;
    let voice: 'male' | 'female' | 'default' = legacyVoice || 'default';
    let onEndCallback: (() => void) | undefined;

    if (typeof optionsOrRate === 'number') {
      rate = optionsOrRate;
    } else if (optionsOrRate && typeof optionsOrRate === 'object') {
      if (optionsOrRate.slow) rate = 0.75;
      if (optionsOrRate.voice) voice = optionsOrRate.voice;
      onEndCallback = optionsOrRate.onEnd;
    }

    // 1. Pre-generated ElevenLabs MP3, only if the manifest says it exists.
    // No await before play(): iOS Safari blocks playback started outside the tap.
    if (voice === 'default') voice = sentenceVoice(text); // "Ich bin Lehrerin" -> female voice
    const hash = computeAudioHash(text, voice);
    if (this.available.has(hash)) {
      const audio = new Audio(`/audio/${hash}.mp3`);
      audio.playbackRate = rate <= 0.8 ? 0.75 : 1.0;
      if (onEndCallback) audio.onended = onEndCallback;
      this.currentAudio = audio;
      audio.play().catch(() => this.speakBrowser(text, rate, onEndCallback));
      return;
    }

    this.speakBrowser(text, rate, onEndCallback);
  }

  // 2. Web Speech API fallback
  private speakBrowser(text: string, rate: number, onEndCallback?: () => void) {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'de-DE';
        utterance.rate = rate <= 0.8 ? 0.75 : 0.92;
        if (onEndCallback) {
          utterance.onend = onEndCallback;
        }

        if (!this.germanVoice) {
          this.initVoices();
        }
        if (this.germanVoice) {
          utterance.voice = this.germanVoice;
        }

        window.speechSynthesis.speak(utterance);
      } catch {
        if (onEndCallback) onEndCallback();
      }
    } else {
      if (onEndCallback) onEndCallback();
    }
  }

  public stop() {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch {}
      this.currentAudio = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const tts = new TTSEngine();
