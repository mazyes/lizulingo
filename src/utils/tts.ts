/**
 * Web Speech API text-to-speech for German (de-DE)
 */

class TTSEngine {
  private germanVoice: SpeechSynthesisVoice | null = null;
  private isVoiceChecked: boolean = false;

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
    this.isVoiceChecked = true;
  }

  public hasGermanVoice(): boolean {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
    if (!this.isVoiceChecked) {
      this.initVoices();
    }
    return !!this.germanVoice;
  }

  public speak(text: string, rate: number = 0.9) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel(); // Stop any pending speech

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'de-DE';
      utterance.rate = rate; // slightly slower for language learners

      if (!this.germanVoice) {
        this.initVoices();
      }

      if (this.germanVoice) {
        utterance.voice = this.germanVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      // Graceful fallback
    }
  }

  public stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const tts = new TTSEngine();
