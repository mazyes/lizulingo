# LIZULINGO — Fix + Upgrade Prompt (answers, responsive, saving, sound)

Improve the existing app. Do not rebuild it. Do the parts in this order:
**Part A** (answer checking + responsive) first, then **Part B** (saving + sound + polish).
Run `npm run build` and `npx vitest run` after each part.

---

# PART A — Forgiving answers, "right but marked wrong" bug, responsive layout

Fix the existing app. Do not rebuild it. Read `src/utils/normalize.ts` and `handleCheck` in
`src/components/lesson/LessonScreen.tsx` first, and fix every check in one shared place.

## A1. Bug: a correct answer is shown as wrong

Known causes (verify each, then fix the root cause):

1. **Missing question types in `handleCheck`.** The `switch` handles choice, fill, build, truefalse, odd,
   dialog, listen, match and wordsearch only. `picture`, `translate`, `speak` (and any `teach` card) have
   no `case`, so `isCorrect` stays `false` even when the answer is right. Add a case for every member of the
   `Question` union. Add a `default` branch that uses TypeScript's exhaustive check
   (`const _never: never = currentQ`) so a new type without a check fails the build.
2. **Punctuation inside sentences.** `normalizeGerman` removes only *trailing* punctuation. A built sentence
   such as "Ich brauche keinen Drucker denn ich habe schon einen" fails against
   "Ich brauche keinen Drucker, denn ich habe schon einen." Remove all punctuation everywhere.
3. **Chip text vs target text.** For `build`/`listen`/`translate`, compare normalized word arrays,
   not raw joined strings. Chips that carry punctuation ("Drucker,") must still match.
4. **Fill answers with notes.** Answers like "ledig (also: geschieden, verwitwet)" must be stored as separate
   alternatives `["ledig", "geschieden", "verwitwet"]`, never as one string with brackets. Scan `src/data`
   for answers that contain `(`, `/` or `also` and split them.
5. **Choice/dialog comparisons** must compare by option index or by the exact option string, not by
   normalized text that two options can share.

Write a Vitest test for each case above. In the test, for every question in every lesson, build the
correct user input from the data (the first answer, the target tokens in order, the correct option) and
assert that `checkAnswer(question, input)` returns `correct`. This catches every future "right but marked
wrong" bug.

## A2. Forgive small mistakes

Move all checking into one function: `checkAnswer(question, input) → 'correct' | 'almost' | 'wrong'`
in `src/utils/normalize.ts`. Every question type calls it.

`normalizeGerman(text)` must:
- trim and collapse spaces;
- lowercase;
- remove **all** punctuation and symbols: `. , ! ? : ; - – — " „ " ' ( ) …`;
- map `ß → ss`, then **remove umlauts entirely**: `ä → a`, `ö → o`, `ü → u`, and also accept `ae/oe/ue`
  (normalize `ae → a`, `oe → o`, `ue → u` on both sides; check that this does not merge two
  different answer options in one question; if it does, compare that question strictly);
- treat `Sie`/`sie`, `Die`/`die` as equal (case already ignored).

Typo tolerance (typed answers only, not chips):
- A word of 5+ letters may have **1** wrong, missing, extra or swapped letter (Damerau-Levenshtein ≤ 1).
  Words of 9+ letters may have 2.
- **No typo tolerance on grammar words**, because there the ending *is* the answer: articles and
  pronouns (der, die, das, den, dem, des, ein, eine, einen, einem, einer, kein…, mein…, dein…, sein…,
  ihr…, unser…, euer…, mich, dich, ihn, uns, euch, mir, dir, ihm, ihnen), and verb endings
  (lernst ≠ lernt). Rule: if the typed word equals another chip, another option, or any other form of
  the same word in the data, it is **wrong**, not a typo.
- Result `almost` counts as correct (no heart lost, XP given), but the green sheet says
  "თითქმის სწორია! სწორად იწერება: **Größe**" and highlights the corrected letters.
- Missing umlaut or ß (`schon` for `schön`, `Strase` for `Straße`) is also `almost`: correct, with the
  proper spelling shown.

Add tests: `Grosse`, `grosse`, `Größe.`, `Groesse` → correct/almost for "Größe"; `einen` for "einem" → wrong;
`Lieblingsfarbe` with one typo → almost; a sentence without commas and without final "." → correct.

## A3. Responsive layout

Fix the layout so it works on every screen from 320 px to wide desktop.

- Test widths: 320, 375, 414, 768, 1024, 1440 px, portrait and landscape, light and dark mode.
  Use the browser preview at each width and fix every problem you see.
- No horizontal scroll anywhere (`overflow-x` must never be needed). Long German words
  (Gebrauchsanweisung, Automechanikerinnen) must wrap: `overflow-wrap: anywhere` on chips and sentences,
  and chips shrink their font a step on narrow screens.
- Lesson screen: full viewport height with `100dvh` (not `100vh`, which breaks on mobile browsers).
  Header (close, progress, hearts) fixed at top; the "შემოწმება" button and the green/red sheet fixed at the
  bottom with `padding-bottom: env(safe-area-inset-bottom)`; the question area scrolls between them.
  The bottom sheet must never cover the chips or the input.
- The on-screen keyboard must not hide the typed input: scroll the input into view on focus.
- Chip rows wrap (`flex-wrap`), with gap ≥ 8 px. All tap targets ≥ 44×44 px.
- Match grid: 2 columns on phones, the same 2 columns centered with max width on desktop.
- Word search grid: square cells sized with `min(…vw, …px)`, so 8×8 fits at 320 px.
- Analog clock and mascot scale with the container (`width: 100%; max-width: …`), not fixed pixels.
- Desktop: content column centered, `max-width` about 640 px for lessons; the home path stays centered;
  the bottom nav becomes a side nav at ≥ 1024 px or stays centered with max width.
- Dialog bubbles: max width 85 % on phones, never wider than the column.
- Respect `prefers-reduced-motion` for confetti and shake animations.

---

# PART B — Never lose progress, better sound effects, polish

Current state: progress is saved under the `localStorage` key `lizulingo_user_progress_v1` (`src/context/GameContext.tsx`). A running lesson lives only in React state (`LessonScreen.tsx`), so a reload or closed tab loses it. Sounds are simple Web Audio beeps (`src/utils/sound.ts`).

## B1. Saving: never lose what the learner did

### B1.1 Keep all existing progress
- The first run after this update must read `lizulingo_user_progress_v1` and migrate it into the new
  format (`lizulingo_progress_v2`). Keep XP, streak, hearts, completed lessons, stars, mistakes and settings.
  Keep the old key until the migration succeeds; then delete it.
- The saved object has a `version` number. Write one `migrate(data)` function that upgrades any older
  version step by step. Add a Vitest test that migrates a v1 sample without losing anything.
- If saved data is broken (invalid JSON or wrong shape), do not wipe it. Copy it to
  `lizulingo_progress_corrupt_<date>`, start fresh, and show a Georgian message.

### B1.2 Save more, and save at once
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

### B1.3 Several tabs
Use the `storage` event (or `BroadcastChannel`) so two open tabs do not overwrite each other: when another tab
saves, reload the state in this tab.

### B1.4 Backup and moving to another device (no backend)
In Settings, add a section "პროგრესის შენახვა" (save progress):
- **ჩამოტვირთე ფაილი** (download file): export all progress as `lizulingo-progress-<date>.json`.
- **ატვირთე ფაილი** (upload file): import a file. Validate it, show what it contains (XP, lessons, streak), and ask
  before replacing. Offer "გაერთიანება" (merge: keep the higher XP, the union of completed lessons and words,
  the longer streak) or "ჩანაცვლება" (replace).
- **კოდით გადატანა** (transfer by code): show the progress as a compressed text code (and a QR code,
  generated locally) to copy to another device, plus a field to paste a code.
- Every Sunday, show a small reminder to download a backup (can be turned off).

### B1.5 Show progress
- A **profile page**: total XP, streak with a month calendar (days with practice highlighted), lessons and modules
  finished, words learned, accuracy, total time learned.
- On the Home path: stars per lesson (1–3) and a progress ring per module.
- Lesson results: XP, accuracy, time, new words, and "new record" when it beats the best result for that lesson.
- Completed lessons can be replayed for practice (XP still counts toward the daily goal).
- **Smart review**: "გამეორება" mode picks words and questions the learner got wrong most often or did not see
  for the longest time (a simple spaced-repetition rule: after a correct answer, wait 1, 3, 7, 14 days).

## B2. Better sound effects

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

## B3. Polish that makes it feel much better

- Animations: chips fly into the answer line; a correct answer makes the progress bar glow; Lizi reacts
  (happy / sad / celebrating) next to the bottom sheet; the hearts shake when one is lost. Respect
  `prefers-reduced-motion`.
- Keyboard on desktop: `1`–`4` choose options, `Enter` checks / continues, `Backspace` removes the last chip,
  `Esc` asks to quit the lesson.
- Loading: the app opens instantly (lazy-load lesson screens and audio). Add a PWA manifest and a service
  worker so the app installs on a phone home screen and works offline (cache the app, `public/audio`, `public/sfx`).
- Error safety: a React error boundary shows "რაღაც შეცდომა მოხდა" with a "თავიდან ჩატვირთვა" button, and
  the progress is never touched by a crash.
---

# Definition of done (both parts)

- `npm run build` and `npx vitest run` pass, including the "every correct answer is accepted" test and the
  v1 → v2 progress migration test. No console errors.
- I can play every lesson with the correct answers and never see a red sheet.
- Typing without umlauts, without ß, without commas, without a final period, or with one small typo in a
  long word is accepted, and the correct spelling is shown. Wrong grammar (einen/einem, lernst/lernt) is still wrong.
- No horizontal scroll and nothing hidden at 320 px; it looks good on desktop, light and dark.
- Existing progress from v1 survives the update.
- Reload in the middle of a lesson → "continue lesson" brings back the same question, hearts and mistakes.
- Export → clear site data → import restores everything. Code transfer works between two browsers.
- Every tap makes a sound; every event in the sound table plays its sound; volume and toggles work;
  nothing plays before the first tap.
- Works offline after the first visit and installs as a PWA.
