# LIZULINGO — Fix Prompt: forgiving answers, wrong "incorrect" results, responsive layout

Fix the existing app. Do not rebuild it. Read `src/utils/normalize.ts` and `handleCheck` in
`src/components/lesson/LessonScreen.tsx` first, and fix every check in one shared place.

## 1. Bug: a correct answer is shown as wrong

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

## 2. Forgive small mistakes

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

## 3. Responsive layout

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

## 4. Definition of done

- `npm run build` and `npx vitest run` pass, including the new "every correct answer is accepted" test.
- I can play every lesson with the correct answers and never see a red sheet.
- Typing without umlauts, without ß, without commas, without a final period, or with one small typo in a
  long word is accepted, and the correct spelling is shown.
- Wrong grammar (einen/einem, lernst/lernt) is still marked wrong.
- No horizontal scroll and nothing hidden at 320 px; it looks good on desktop.
