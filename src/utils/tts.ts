/**
 * German Audio Engine:
 * - Plays high-quality ElevenLabs MP3 from /audio/<hash>.mp3 if available.
 * - Supports slow mode (playbackRate = 0.75).
 * - Falls back seamlessly to Web Speech API (speechSynthesis de-DE).
 */

import { computeAudioHash } from './audioHash';

class TTSEngine {
  private germanVoice: SpeechSynthesisVoice | null = null;
  private currentAudio: HTMLAudioElement | null = null;

  constructor() {
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

  public async speak(
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

    // 1. Try playing cached / pre-generated ElevenLabs audio file
    try {
      const hash = await computeAudioHash(text, voice);
      const audioUrl = `/audio/${hash}.mp3`;

      const audio = new Audio(audioUrl);
      audio.playbackRate = rate <= 0.8 ? 0.75 : 1.0;
      if (onEndCallback) {
        audio.onended = onEndCallback;
      }
      this.currentAudio = audio;

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        await playPromise;
        return; // Successfully played ElevenLabs audio!
      }
    } catch {
      // If MP3 does not exist (HTTP 404) or network fails, fall through to browser SpeechSynthesis
    }

    // 2. Web Speech API Fallback
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
