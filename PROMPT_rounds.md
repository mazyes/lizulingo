# LIZULINGO — Prompt: 2–5 rounds per circle, longer lessons, simpler explanations

Improve the existing app. Do not rebuild it. Finish and commit your current work first, then do this.

## The problem

- Lessons end too fast. Most lessons have only 2–10 questions (for example 4.6 has 2, 5.2 has 3, 3.6 has 3),
  and a session takes them all once. One short session completes a whole circle on the path.
- Explanations are too hard for a beginner. The learner is a Georgian speaker who knows zero German.

## 1. Rounds: each circle needs 2–5 sessions

Each lesson circle on the home path is completed only after several **rounds** (sessions), like levels in a
language game.

- Add `rounds: number` (2–5) to `Lesson`, by difficulty:
  - 2 rounds: very easy lessons (greetings, first words; most of Modul 1).
  - 3 rounds: normal vocabulary + one simple rule.
  - 4 rounds: a new grammar rule (Akkusativ, separable verbs, possessives, Präteritum war/hatte).
  - 5 rounds: the hardest topics (Dativ, Genitiv, mixed cases).
  - Boss tests stay 1 round.
  Set the value by hand per lesson in the data files, and say why in a short comment where it is not obvious.
- Save progress per lesson: `lessonRounds: Record<lessonId, number>` (rounds finished). Bump the progress
  version and migrate: a lesson that is already in `completedLessons` gets `lessonRounds = rounds` (stays complete).
  Do not reset anyone's progress.
- A lesson is complete (crown, next lesson unlocks) only when `lessonRounds[id] >= rounds`.
- **Home path UI:** each circle shows round progress as a ring split into segments (for example 2 of 4 filled)
  and a small label "2/4". Tapping a circle opens a small card: lesson title, "რაუნდი 3 / 4", what this round
  trains (see below), and a "დაწყება" button. Completed circles can be replayed ("გამეორება").
- XP: +10 per finished round, +5 for no mistakes; +20 bonus when the last round completes the circle.
- The saved "continue lesson" state must include the round number.

### What each round contains

Rounds get harder. Never repeat the same session twice.

| Round | Name (Georgian) | Content |
|---|---|---|
| 1 | ახალი სიტყვები | Teach cards, then easy recognition: picture → word, German ↔ Georgian match, "what does X mean?" choice. No typing. |
| 2 | მოსმენა და გაგება | Listen and pick, listen and build, true/false with dialog, German → Georgian translation. |
| 3 | წინადადებები | Build sentences, fill gaps with chips, Georgian → German translation, dialogs. |
| 4 | გრამატიკა | The lesson's rule: fill gaps (typed), choose the right form, "which does not fit". |
| 5 | ოსტატი | Mixed, typed answers, no hints, speaking (if supported), mistakes from earlier rounds. |

A lesson with fewer rounds merges the table: 2 rounds = (1) and (3+4 mixed); 3 rounds = (1), (2+3), (4+5 mixed);
4 rounds = (1), (2), (3), (4+5 mixed).
Teach cards show only in round 1; later rounds start with a 1-card reminder of the rule.

## 2. Longer sessions: 12–15 questions per round

Every round must have **12–15 questions** and take about 3–5 minutes. Two sources:

### 2.1 Generate questions from existing data (no hand-writing)

Write `src/data/expand.ts` with pure functions that build extra questions from what a lesson already has.
Generated ids are stable (`<lessonId>-gen-<kind>-<n>`), so mistakes and resume keep working.

From each **word teach card** (german, article, plural, Georgian, example):
- `choice` German → Georgian ("რას ნიშნავს »der Hund«?", 4 Georgian options).
- `choice` Georgian → German (4 German options).
- `choice` article ("___ Hund": der / die / das), when the word has an article.
- `match` German ↔ Georgian (5 pairs per screen).
- `listen` to the word and pick it from 4.
- `fill` typed: Georgian word shown, type the German word (later rounds only).
- `fill` plural (later rounds, when a plural exists).

From each **sentence** (build / listen / fill / translate target, teach card examples, dialog lines with a translation):
- `listen` + build with chips.
- `translate` Georgian → German with chips, and German → Georgian with Georgian chips.
- `build` with 1–2 distractor chips taken from other sentences of the same lesson.
- `fill` with one word removed (remove the verb or the article, because those carry the grammar).
- `speak` (final round only, optional).

Distractors come from the same lesson first, then the same module. Never use a distractor that is also a correct answer.
Every generated question has a Georgian `georgianHint`, a Georgian `translation` of the German sentence, and a
simple Georgian `explanation`.

### 2.2 Add hand-written questions where the lesson is still thin

After generation, any lesson that cannot fill `rounds × 12` different questions needs more real content.
Lessons with 5 or fewer questions today (2.4, 2.6, 3.3–3.6, 4.2, 4.3, 4.5, 4.6, 5.1–5.6, 6.2–6.6) need at least
8 new hand-written questions and 3–5 teach cards each (several have only 1 card). Stay inside the lesson's topic
and the A1 level; do not add new grammar.

### 2.3 Session rules

- Order inside a round: easy → hard. Start with 2–3 recognition questions as a warm-up.
- A wrong answer comes back later in the same round (already implemented; keep it).
- Do not show the same sentence twice in a row in different question types.
- Each round after the first starts with 2–3 review questions from the weakest words of earlier lessons.

## 3. Simpler explanations

Rewrite every Georgian text the learner reads: teach cards, `georgianHint`, `explanation`, rule cards.

Rules for the writing:
- Short sentences, max 12 words. Everyday Georgian. Address the learner as "შენ".
- One idea per card. One rule per card. Max 3 lines of text.
- No grammar terms without a plain explanation. Not "Akkusativ-ში der → den"; write
  "როცა რაღაცას ხედავ, ყიდულობ ან გაქვს, **der** იქცევა **den**-ად: Ich habe **den** Hund."
  Give the term once in brackets after the plain version, so the learner can recognize it later.
- Always show an example with a word-by-word Georgian translation under it, and color the part that changes.
- Compare with Georgian where it helps ("ქართულში არტიკლი არ გვაქვს, გერმანულში ყველა არსებით სახელს აქვს").
- Wrong-answer sheet: (1) the correct answer, (2) why, in one short sentence, (3) one example. No lectures.
- Rule cards use a tiny table only when there are 3+ forms (for example ich bin / du bist / er ist), max 4 rows.
- Lizi speaks in a friendly voice: "ყურადღება!", "ადვილია:", "დაიმახსოვრე:".

Before/after example to follow:
- Before: "sein-ის უღლება პირველ პირში მხოლობით რიცხვში არის bin."
- After: "**ich bin** = მე ვარ. »Ich bin Nino.« — მე ნინო ვარ."

## 4. Do not break

- Pink brand, lavender accent, dark mode only (remove the dead dark-mode switches in Settings and the top bar).
- Correct answers stay green; der / die / das badges stay blue / red / green.
- Every German prompt keeps its always-visible Georgian translation.
- Returning from a lesson keeps the path scroll position.
- ElevenLabs audio: after adding content, new German texts need `npm run audio`. The account is out of credits
  this month, so new texts will use the browser voice until then. Do not change `audioHash.ts` or the manifest logic.
- `public/sw.js` stays network-first for HTML/JSON.

## 5. Done when

- Every regular lesson has `rounds` 2–5, and every round has 12–15 questions with no question repeated inside a round.
- A circle completes only after all its rounds; the ring and "n/N" label show progress; old progress is migrated.
- Tests: generated questions always have the correct answer among the options and no duplicate options;
  `checkAnswer` accepts the correct answer of every generated question; round sizes are 12–15 for every lesson;
  migration keeps completed lessons complete.
- All Georgian explanations follow the rules in section 3.
- `npm run build` and `npx vitest run` pass; no console errors; works at 375 px.
- Commit and push to `master` (Vercel deploys from Git).
