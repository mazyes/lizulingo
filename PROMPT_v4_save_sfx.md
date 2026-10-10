# LIZULINGO — Upgrade Prompt: never lose progress, better sound effects, polish

Improve the existing app. Do not rebuild it. Current state: progress is saved under the
`localStorage` key `lizulingo_user_progress_v1` (`src/context/GameContext.tsx`). A running lesson
lives only in React state (`LessonScreen.tsx`), so a reload or closed tab loses it. Sounds are
simple Web Audio beeps (`src/utils/sound.ts`).

## 1. Saving: never lose what the learner did

### 1.1 Keep all existing progress
- The first run after this update must read `lizulingo_user_progress_v1` and migrate it into the new
  format (`lizulingo_progress_v2`). Keep XP, streak, hearts, completed lessons, stars, mistakes and settings.
  Keep the old key until the migration succeeds; then delete it.
- The saved object has a `version` number. Write one `migrate(data)` function that upgrades any older
  version step by step. Add a Vitest test that migrates a v1 sample without losing anything.
- If saved data is broken (invalid JSON or wrong shape), do not wipe it. Copy it to
  `lizulingo_progress_corrupt_<date>`, start fresh, and show a Georgian message.

### 1.2 Save more, and save at once
Save after every change, not only at lesson end:
- every answered question (right or wrong) and every mistake;
- **the running lesson**: lesson id, question queue (ids), current index, chosen answers, mistakes, hearts, elapsed time.
  On reload, Home shows "გააგრძელე გაკვეთილი?" (continue lesson?) with "კი" / "თავიდან" (yes / restart).
- words learned (seen in teach cards), per-word stats (times right / wrong, last seen) for review;
- daily XP history (last 365 days) for the streak calendar;
- settings (sound, volume, typing mode, theme, speech speed).
- Write with a small debounce (300 ms), and also on `visibilitychange` (hidden) and `pagehide`, so closing the
  tab on a phone still saves.
- Wrap every storage read and write in try/catch. When storage is blocked, the app still works and shows a small
  "პროგრესი არ ინახება" (progress is not saved) banner.
- Call `navigator.storage.persist()` once, so the browser does not clear the data when space is low.

### 1.3 Several tabs
Use the `storage` event (or `BroadcastChannel`) so two open tabs do not overwrite each other: when another tab
saves, reload the state in this tab.

### 1.4 Backup and moving to another device (no backend)
In Settings, add a section "პროგრესის შენახვა" (save progress):
- **ჩამოტვირთე ფაილი** (download file): export all progress as `lizulingo-progress-<date>.json`.
- **ატვირთე ფაილი** (upload file): import a file. Validate it, show what it contains (XP, lessons, streak), and ask
  before replacing. Offer "გაერთიანება" (merge: keep the higher XP, the union of completed lessons and words,
  the longer streak) or "ჩანაცვლება" (replace).
- **კოდით გადატანა** (transfer by code): show the progress as a compressed text code (and a QR code,
  generated locally) to copy to another device, plus a field to paste a code.
- Every Sunday, show a small reminder to download a backup (can be turned off).

### 1.5 Show progress
- A **profile page**: total XP, streak with a month calendar (days with practice highlighted), lessons and modules
  finished, words learned, accuracy, total time learned.
- On the Home path: stars per lesson (1–3) and a progress ring per module.
- Lesson results: XP, accuracy, time, new words, and "new record" when it beats the best result for that lesson.
- Completed lessons can be replayed for practice (XP still counts toward the daily goal).
- **Smart review**: "გამეორება" mode picks words and questions the learner got wrong most often or did not see
  for the longest time (a simple spaced-repetition rule: after a correct answer, wait 1, 3, 7, 14 days).

## 2. Better sound effects

Replace the beeps with sounds that feel rewarding and soft, like a polished game.

- Use short audio files: put CC0 / royalty-free sounds in `public/sfx/` (OGG + MP3 fallback, each < 30 KB,
  normalized loudness). Take them only from CC0 sources (for example Kenney.nl "Interface Sounds" / "Digital Audio"
  packs) and note each file's source and license in `public/sfx/LICENSES.md`. If you cannot download files, design
  them with Web Audio (layered oscillators + noise + envelopes + a little reverb) instead; they must still sound
  rich, not like plain beeps.
- Load all of them once with the Web Audio API into `AudioBuffer`s (preload after the first tap; unlock the
  `AudioContext` on that tap for iOS Safari). Play through one master `GainNode`.
- Sounds needed:
  | Event | Sound |
  |---|---|
  | tap chip / button | very short soft click |
  | chip placed / removed | soft "pop" up / down |
  | correct answer | bright two-note chime |
  | correct streak 3 / 5 / 10 | the chime rises one step per level |
  | almost correct | the chime, softer |
  | wrong answer | soft low "bonk", never harsh |
  | match pair found / wrong pair | small sparkle / quick buzz |
  | word found (word search) | sparkle |
  | heart lost / no hearts | soft "whoosh down" / sad two notes |
  | lesson complete | short fanfare (≈1.5 s) with the confetti |
  | perfect lesson, module complete, chest open, achievement | bigger fanfare, coin sounds |
  | streak +1 | warm "flame" whoosh |
  | page change / sheet slide | very quiet swoosh |
- **Tap sounds everywhere:** every tappable element makes a sound: chips, option buttons, Richtig/Falsch,
  the check/continue button, lesson circles on the path, bottom nav tabs, toggles, the 🔊 button, keyboard
  keys in typed answers (a very soft "tick" per key), word search cells while dragging (a rising "tick" per
  letter). Do it once, centrally: one `useTapSound()` hook or a global `pointerdown` listener on elements
  with `data-sfx="tap|pop|toggle|nav"`. Do not add sound calls in every component. Taps play on
  `pointerdown`, not `click`, so they feel instant (< 20 ms latency).
- Small random pitch change (±3 %) on repeated sounds (clicks, pops), so they do not sound robotic.
- Settings: master volume slider, separate toggles for **sound effects** and **German voice**, and a mute button
  in the lesson header. Sound effects duck (lower to 30 %) while German audio plays.
- Respect the system: no sound until the first user tap; stop sounds when the tab is hidden.
- Add light **haptics** (`navigator.vibrate`) on correct (short), wrong (double), complete (pattern), with a setting
  to turn them off. Skip silently where unsupported.

## 3. Polish that makes it feel much better

- Animations: chips fly into the answer line; a correct answer makes the progress bar glow; Lizi reacts
  (happy / sad / celebrating) next to the bottom sheet; the hearts shake when one is lost. Respect
  `prefers-reduced-motion`.
- Keyboard on desktop: `1`–`4` choose options, `Enter` checks / continues, `Backspace` removes the last chip,
  `Esc` asks to quit the lesson.
- Loading: the app opens instantly (lazy-load lesson screens and audio). Add a PWA manifest and a service
  worker so the app installs on a phone home screen and works offline (cache the app, `public/audio`, `public/sfx`).
- Error safety: a React error boundary shows "რაღაც შეცდომა მოხდა" with a "თავიდან ჩატვირთვა" button, and
  the progress is never touched by a crash.

## 4. Definition of done

- Existing progress from v1 survives the update (tested with a sample).
- Reload in the middle of a lesson → "continue lesson" brings back the same question, hearts and mistakes.
- Export → clear site data → import restores everything. Code transfer works between two browsers.
- Every event in the sound table plays its sound; volume and toggles work; nothing plays before the first tap.
- Works offline after the first visit, installs as a PWA, no console errors, `npm run build` and
  `npx vitest run` pass.
