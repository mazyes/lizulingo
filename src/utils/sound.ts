/**
 * Rich Web Audio Synthesizer & Sound FX Engine for LIZULINGO.
 * Generates soft, rewarding, game-like audio layers with envelopes,
 * filters, master volume gain, audio ducking, and haptic feedback.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private enabled: boolean = true;
  private volume: number = 0.8;
  private isDucked: boolean = false;
  private userInteracted: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      // Visibility handler: stop sounds when tab is hidden
      document.addEventListener('visibilitychange', () => {
        if (document.hidden && this.ctx && this.ctx.state === 'running') {
          this.ctx.suspend().catch(() => {});
        } else if (!document.hidden && this.ctx && this.userInteracted) {
          this.ctx.resume().catch(() => {});
        }
      });

      // Global pointerdown listener for instant tap feedback (<20ms)
      window.addEventListener(
        'pointerdown',
        (e: PointerEvent) => {
          this.unlockAudio();
          const target = (e.target as HTMLElement)?.closest('[data-sfx], button, .chip-3d');
          if (target && !target.hasAttribute('disabled')) {
            const sfxType = target.getAttribute('data-sfx') || (target.classList.contains('chip-3d') ? 'pop' : 'tap');
            if (sfxType === 'pop') {
              this.playPop('up');
            } else if (sfxType === 'nav') {
              this.playSwoosh();
            } else {
              this.playTap();
            }
          }
        },
        { passive: true }
      );
    }
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      const targetGain = this.isDucked ? this.volume * 0.3 : this.volume;
      this.masterGain.gain.setValueAtTime(targetGain, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  /**
   * Ducks sound effects to 30% volume while German speech / TTS plays
   */
  public duck(isDucked: boolean) {
    this.isDucked = isDucked;
    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      const targetGain = isDucked ? this.volume * 0.3 : this.volume;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.linearRampToValueAtTime(targetGain, now + 0.08);
    }
  }

  private unlockAudio(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    this.userInteracted = true;

    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  private getContext(): { ctx: AudioContext; master: GainNode } | null {
    if (!this.enabled || !this.userInteracted) return null;
    const ctx = this.unlockAudio();
    if (!ctx || !this.masterGain) return null;
    return { ctx, master: this.masterGain };
  }

  /**
   * Random subtle pitch variation (±3%) to prevent robotic repetition
   */
  private jitter(freq: number): number {
    const variation = (Math.random() - 0.5) * 0.06;
    return freq * (1 + variation);
  }

  /**
   * Haptic vibration wrapper
   */
  public vibrate(pattern: 'short' | 'double' | 'pattern') {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        if (pattern === 'short') navigator.vibrate(25);
        else if (pattern === 'double') navigator.vibrate([40, 50, 40]);
        else if (pattern === 'pattern') navigator.vibrate([30, 40, 60, 40, 100]);
      } catch {}
    }
  }

  // --- SOUND EFFECTS ---

  /**
   * Very short, soft tactile click for buttons/chips
   */
  public playTap() {
    const audio = this.getContext();
    if (!audio) return;
    const { ctx, master } = audio;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(this.jitter(480), now);
      osc.frequency.exponentialRampToValueAtTime(850, now + 0.025);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

      osc.connect(gain);
      gain.connect(master);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch {}
  }

  public playClick() {
    this.playTap();
  }

  /**
   * Soft pop for chip placed (up) or removed (down)
   */
  public playPop(direction: 'up' | 'down' = 'up') {
    const audio = this.getContext();
    if (!audio) return;
    const { ctx, master } = audio;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const startFreq = direction === 'up' ? 320 : 540;
      const endFreq = direction === 'up' ? 580 : 280;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(this.jitter(startFreq), now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.05);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

      osc.connect(gain);
      gain.connect(master);

      osc.start(now);
      osc.stop(now + 0.07);
    } catch {}
  }

  /**
   * Bright, delightful two-note chime for correct answer.
   * Pitch rises slightly with streak level (3, 5, 10).
   */
  public playCorrect(streakLevel: number = 0) {
    this.vibrate('short');
    const audio = this.getContext();
    if (!audio) return;
    const { ctx, master } = audio;

    try {
      const now = ctx.currentTime;
      const pitchMultiplier = streakLevel >= 10 ? 1.25 : streakLevel >= 5 ? 1.15 : streakLevel >= 3 ? 1.08 : 1.0;

      const notes = [
        { f: 523.25 * pitchMultiplier, t: 0.0 }, // C5
        { f: 659.25 * pitchMultiplier, t: 0.07 }, // E5
        { f: 783.99 * pitchMultiplier, t: 0.14 }, // G5
      ];

      notes.forEach(({ f, t }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + t);

        gain.gain.setValueAtTime(0, now + t);
        gain.gain.linearRampToValueAtTime(0.18, now + t + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.28);

        osc.connect(gain);
        gain.connect(master);

        osc.start(now + t);
        osc.stop(now + t + 0.3);
      });
    } catch {}
  }

  /**
   * Softer chime for almost-correct answers
   */
  public playAlmost() {
    this.vibrate('short');
    const audio = this.getContext();
    if (!audio) return;
    const { ctx, master } = audio;

    try {
      const now = ctx.currentTime;
      const notes = [523.25, 659.25]; // C5, E5

      notes.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + idx * 0.08);

        gain.gain.setValueAtTime(0, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.1, now + idx * 0.08 + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.2);

        osc.connect(gain);
        gain.connect(master);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.22);
      });
    } catch {}
  }

  /**
   * Soft, warm low bonk for wrong answer (never harsh or annoying)
   */
  public playWrong() {
    this.vibrate('double');
    const audio = this.getContext();
    if (!audio) return;
    const { ctx, master } = audio;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, now);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.linearRampToValueAtTime(140, now + 0.25);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(master);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch {}
  }

  /**
   * Matching pair sound
   */
  public playMatchPair(success: boolean) {
    if (success) {
      this.playWordFound();
    } else {
      const audio = this.getContext();
      if (!audio) return;
      const { ctx, master } = audio;

      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.linearRampToValueAtTime(150, now + 0.12);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

        osc.connect(gain);
        gain.connect(master);

        osc.start(now);
        osc.stop(now + 0.15);
      } catch {}
    }
  }

  /**
   * Sparkle sound when finding a word in word search
   */
  public playWordFound() {
    const audio = this.getContext();
    if (!audio) return;
    const { ctx, master } = audio;

    try {
      const now = ctx.currentTime;
      const sparkles = [880, 1108, 1320, 1760]; // A5, C#6, E6, A6

      sparkles.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);

        gain.gain.setValueAtTime(0, now + idx * 0.04);
        gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.04 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.18);

        osc.connect(gain);
        gain.connect(master);

        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.2);
      });
    } catch {}
  }

  /**
   * Heart lost or zero hearts sound
   */
  public playHeartLost(hasHeartsRemaining: boolean) {
    const audio = this.getContext();
    if (!audio) return;
    const { ctx, master } = audio;

    try {
      const now = ctx.currentTime;
      if (hasHeartsRemaining) {
        // Soft whoosh down
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(360, now);
        osc.frequency.exponentialRampToValueAtTime(160, now + 0.22);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(master);

        osc.start(now);
        osc.stop(now + 0.26);
      } else {
        // Sad two notes
        const notes = [220, 174.61]; // A3, F3
        notes.forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, now + idx * 0.18);

          gain.gain.setValueAtTime(0.18, now + idx * 0.18);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.18 + 0.35);

          osc.connect(gain);
          gain.connect(master);

          osc.start(now + idx * 0.18);
          osc.stop(now + idx * 0.18 + 0.38);
        });
      }
    } catch {}
  }

  /**
   * Short fanfare (~1.5s) on lesson completion
   */
  public playComplete() {
    this.vibrate('pattern');
    const audio = this.getContext();
    if (!audio) return;
    const { ctx, master } = audio;

    try {
      const now = ctx.currentTime;
      const melody = [
        { f: 523.25, t: 0.0, d: 0.15 }, // C5
        { f: 523.25, t: 0.15, d: 0.15 }, // C5
        { f: 659.25, t: 0.3, d: 0.18 }, // E5
        { f: 783.99, t: 0.48, d: 0.2 }, // G5
        { f: 1046.5, t: 0.72, d: 0.5 }, // C6
      ];

      melody.forEach(({ f, t, d }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + t);

        gain.gain.setValueAtTime(0, now + t);
        gain.gain.linearRampToValueAtTime(0.22, now + t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + t + d);

        osc.connect(gain);
        gain.connect(master);

        osc.start(now + t);
        osc.stop(now + t + d + 0.05);
      });
    } catch {}
  }

  /**
   * Bigger celebratory fanfare with coin chimes
   */
  public playBigFanfare() {
    this.vibrate('pattern');
    this.playComplete();
    setTimeout(() => {
      this.playWordFound();
    }, 450);
    setTimeout(() => {
      this.playWordFound();
    }, 850);
  }

  /**
   * Warm flame whoosh for streak +1
   */
  public playFlame() {
    const audio = this.getContext();
    if (!audio) return;
    const { ctx, master } = audio;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.12);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.25);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);

      osc.connect(gain);
      gain.connect(master);

      osc.start(now);
      osc.stop(now + 0.28);
    } catch {}
  }

  /**
   * Quiet swoosh for page changes or sheet sliding
   */
  public playSwoosh() {
    const audio = this.getContext();
    if (!audio) return;
    const { ctx, master } = audio;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.1);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

      osc.connect(gain);
      gain.connect(master);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch {}
  }
}

export const sound = new SoundEngine();
