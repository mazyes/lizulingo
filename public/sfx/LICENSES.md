# Sound System & Audio License Information

## Lizulingo Audio Engine (Web Audio API Synthesizer)
All sound effects in Lizulingo are programmatically designed and generated using the modern HTML5 Web Audio API in `src/utils/sound.ts`.

- **Source / License**: Custom procedural audio synthesis (MIT / CC0 equivalent).
- **Sound Design Architecture**:
  - `playTap`: Micro-filtered high-pass impulse (<15ms, low latency on pointerdown).
  - `playPop`: Exponential pitch-bend bubble oscillator (450Hz -> 820Hz) with rapid decay.
  - `playCorrect`: Harmonious multi-note chord progression (C5 - E5 - G5 - C6) with combo streak transposition.
  - `playAlmost`: Soft, gentle major third chime with muted resonance.
  - `playWrong`: Low frequency dual damped saw/triangle tone (160Hz -> 110Hz).
  - `playWordFound` / `playMatchFound`: Bright arpeggiated sparkle chords (E5, B5, E6, G#6).
  - `playHeartLost`: Damped downward resonant whoosh.
  - `playComplete`: 4-chord fanfare (C4 -> F4 -> G4 -> C5) with confetti accompaniment.
  - `playBigFanfare`: Grand arpeggiated celebration chime with resonant overtones.
  - `playFlame`: Warm flame whoosh filtered envelope.
  - `playSwoosh`: Filtered white noise breath for smooth sheet transitions.

All audio functions run entirely client-side without external network latency, duck German speech audio automatically, and support tactile pitch jitter (±3%).
