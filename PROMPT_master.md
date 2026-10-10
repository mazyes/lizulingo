# LIZULINGO — Master Prompt (everything requested so far)

LIZULINGO is a Duolingo-style German course for **Georgian speakers who know zero German**
(Vite + React + TypeScript + Tailwind, deployed from GitHub `master` to https://lizulingo.vercel.app).
Do not rebuild the app. Finish and commit your current work first. Then work through the parts in order:
**Part 1** (check what is already done, fix anything that is not true) → **Part 2** (rounds, longer lessons,
simpler explanations) → **Part 3** (visual upgrade) → **Part 4** (Appwrite cloud save).
After each part: `npm run build`, `npx vitest run`, commit, push to `master`.

## Part 0 — Rules that always apply

1. **The learner does not know the textbook.** The book ("deutsch Buch 1", `F:\Downloads\BUCH\buch 1 (1).pdf`,
   scanned, 224 pages; page map in `PROMPT_v2.md`) is only a source of words and grammar order. The learner never
   saw it and does not know Martin, Anna, Anton, Frau Rilke, Katharina or Herr Schmitt.
2. **Teach before you test.** Every word and rule appears on a teaching card before any question uses it.
3. **Every question is self-contained.** Everything needed to answer is on the same screen. A question about a
   character is always a `dialog` (or has `dialogContext`) that shows the lines it depends on. Never ask
   "Ist Martin Lehrer oder Schüler?" without showing Martin's line.
4. **Never German-only.** Every German prompt, sentence and dialog line shows its Georgian translation on screen
   (no tap needed). Translation exercises go **German → Georgian** or **Georgian → German**, never German → German.
5. **Georgian UI.** Instructions, hints and explanations are in simple Georgian (rules in Part 2, section 2.3).
6. **Brand:** dark mode only; soft pink brand color (`lizu-green` token = `#F58CBA`); lavender accent
   (`lizu-blue` token = `#B8A1FF`); no blue as a brand color; mascot **Lizi is a pink fox**.
   Correct answers stay green (`lizu-ok`); wrong stays red; der / die / das badges stay blue / red / green.
7. **Secrets:** never put API keys in chat, in the repo, or in any `VITE_` variable. Keys live in `.env.local`.
8. **Do not break** what Part 1 lists as done.

---

# Part 1 — Already done: verify each, fix what is not true

Check every item in the running app (phone width 375 px and desktop). If one fails, fix it.

**Answer checking**
- Punctuation never matters: "Guten Tag wie geht es dir" = "Guten Tag, wie geht es dir?";
  "Freut mich dich kennenzulernen" = "Freut mich, dich kennenzulernen."
- Small mistakes are forgiven in typed answers: missing umlaut (`o` for `ö`), `ss` for `ß`, `ae/oe/ue`,
  case, extra spaces, one typo in a word of 5+ letters. These count as correct and the sheet shows the proper
  spelling ("თითქმის სწორია!"). Grammar endings are **not** forgiven (einen ≠ einem, lernst ≠ lernt).
- Every question type has a check (picture, translate, speak included). A test plays every question in every
  lesson with its correct answer and fails if any is rejected.
- Fill answers with several correct words are stored as separate alternatives, never as one string with brackets.

**Layout**
- Works from 320 px to desktop; no horizontal scroll; long German words wrap.
- Lesson screen: header (X, progress, hearts) always visible; question area scrolls; check button and result
  sheet at the bottom never cover the answer; `100dvh`; iPhone notch and home bar respected
  (`viewport-fit=cover`, `env(safe-area-inset-*)`).
- **Bottom nav labels are not covered by the iPhone home bar** ("შეცდომები", "ლექსიკონი" were cut off).
- Content is never hidden under the top bar or the bottom nav.
- Settings switches: the knob stays inside the track, on and off, and the off state has a visible track.
  Use one `<Toggle>` component (`role="switch"`) everywhere.
- The top bar fits at 320 px (short logo, numbers never wrap).
- The X button leaves the lesson from every phase (teach cards and questions).
- Returning from a lesson keeps the path scroll position (for example stays at Modul 2).

**Saving**
- Progress survives reloads and updates (versioned, migrated, never wiped; broken data is backed up, not deleted).
- A running lesson can be continued after reload ("გააგრძელე გაკვეთილი?").
- Saves after every answer and on `visibilitychange` / `pagehide`; two tabs do not overwrite each other.
- Settings: download / upload a progress file, transfer by code or QR; profile page with streak calendar.
- The streak grows only when a lesson is completed. XP, lesson count and streak agree everywhere.

**Sound**
- Rich sound effects (not beeps) for: tap on every tappable element (on `pointerdown`), chip pop, correct
  (rising with streak), almost correct, wrong (soft), match, heart lost, lesson complete fanfare, chest, streak.
- Volume slider; separate switches for sound effects and German voice; effects duck while German audio plays; haptics.
- Nothing plays before the first tap.

**German voices (ElevenLabs)**
- `npm run audio` generates MP3s into `public/audio/<hash>.mp3` + `public/audio/manifest.json` for every German
  text in the lesson data; it only generates missing files; `--dry` counts, `--limit N` tests.
- `tts.speak()` is synchronous up to `play()` (iOS Safari needs playback inside the tap): manifest lookup →
  MP3, else browser `speechSynthesis` (de-DE) at once.
- **Female characters use the female voice**: dialog speakers via `speakerVoice()` (Anna, Katharina, Simone, Lizi,
  "Frau …"), and first-person sentences via `sentenceVoice()` ("Ich heiße Anna", "Ich bin Lehrerin").
  Add new female names in `src/utils/speakerVoice.ts`.
- `public/audio/*.mp3` is committed (Vercel deploys from Git). Do not change `audioHash.ts`.
- The ElevenLabs account has 0 credits left this month (free plan, 10,000 characters). New texts use the browser
  voice until credits reset; then run `npm run audio`. The free plan can only use premade voices
  (female = Sarah `EXAVITQu4vr4xnSDxMaL`, male = Adam `pNInz6obpgDQGcFmaJgB`).

**Updates reach phones**
- `public/sw.js` is network-first for HTML and JSON, cache-first only for hashed `/assets/` and `/audio/*.mp3`,
  clears old caches and reloads open tabs once. Never make HTML cache-first again (phones got stuck on an old version).

**Brand** — as in Part 0 rule 6. Still to do here:
- Remove the dead dark-mode switches (Settings and top bar) and the `darkMode` setting; the app is always dark.
- Replace leftover blue tints (`bg-blue-950`, `bg-blue-50`, `border-blue-200`, `text-blue-*`) with lavender/violet
  tints, except the der / die / das badges.
- Check contrast: text on the soft pink buttons must be readable (use a dark text color on pink if white is not).

**Translations**
- 60 formerly German-only questions have a Georgian `translation`, shown above the question without a tap;
  dialog lines show their translation under each line. Every new question must have one too.

---

# Part 2 — Rounds, longer lessons, simpler explanations

## The problem

- Lessons end too fast. Most lessons have only 2–10 questions (for example 4.6 has 2, 5.2 has 3, 3.6 has 3),
  and a session takes them all once. One short session completes a whole circle on the path.
- Explanations are too hard for a beginner. The learner is a Georgian speaker who knows zero German.

## 2.1 Rounds: each circle needs 2–5 sessions

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

## 2.2 Longer sessions: 12–15 questions per round

Every round must have **12–15 questions** and take about 3–5 minutes. Two sources:

### 2.2.1 Generate questions from existing data (no hand-writing)

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

### 2.2.2 Add hand-written questions where the lesson is still thin

After generation, any lesson that cannot fill `rounds × 12` different questions needs more real content.
Lessons with 5 or fewer questions today (2.4, 2.6, 3.3–3.6, 4.2, 4.3, 4.5, 4.6, 5.1–5.6, 6.2–6.6) need at least
8 new hand-written questions and 3–5 teach cards each (several have only 1 card). Stay inside the lesson's topic
and the A1 level; do not add new grammar.

### 2.2.3 Session rules

- Order inside a round: easy → hard. Start with 2–3 recognition questions as a warm-up.
- A wrong answer comes back later in the same round (already implemented; keep it).
- Do not show the same sentence twice in a row in different question types.
- Each round after the first starts with 2–3 review questions from the weakest words of earlier lessons.

## 2.3 Simpler explanations

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

## 2.4 Done when

- Every regular lesson has `rounds` 2–5, and every round has 12–15 questions with no question repeated inside a round.
- A circle completes only after all its rounds; the ring and "n/N" label show progress; old progress is migrated.
- Tests: generated questions always have the correct answer among the options and no duplicate options;
  the answer check accepts the correct answer of every generated question; round sizes are 12–15 for every lesson;
  migration keeps completed lessons complete.
- All Georgian explanations follow the rules in section 2.3.

---

# Part 3 — Visual upgrade (make it look and feel much better)

Use components and ideas from these libraries. Copy the component source into the project
(`src/components/ui/`), adapt it to the brand, and keep only what is used. Do not add heavy dependencies for one effect.

- **React Bits** — https://reactbits.dev/get-started/index (animated text, backgrounds, counters, cards)
- **21st.dev** — https://21st.dev (polished React + Tailwind components; the `21st` MCP server is available)
- **Bencho** — https://bencho.dev (interactive UI blocks and micro-interactions)

Where to use them:
- **Home path:** soft animated background (subtle, dark, pink/lavender glow); lesson circles with a segmented
  progress ring, a gentle bounce on the current lesson, a spring pop when a circle unlocks; module banners with a
  small illustration of the city (Lizi travels through Germany).
- **Top bar:** animated number counters for XP, streak and hearts; the flame flickers; hearts shake when one is lost.
- **Lesson:** chips fly into the answer line with a spring; smooth progress bar with a glow on correct; the result
  sheet slides up with a spring; Lizi reacts (happy / sad / celebrating) next to it.
- **Results screen:** count-up numbers, star reveal one by one, confetti in brand colors, treasure chest opening.
- **Teach cards:** swipeable card stack with a flip to show the Georgian meaning.
- **Buttons, toggles, tabs, modals:** consistent, rounded, with press feedback; bottom nav with a sliding active pill.
- **Text:** one animated headline effect on the welcome and results screens only. Do not animate body text.

Rules:
- Dark only, soft pink + lavender, as in Part 0. Nothing bright that hurts the eyes; glows stay subtle.
- 60 fps on a mid-range phone: animate only `transform` and `opacity`; no heavy canvas/WebGL backgrounds on
  the lesson screen; lazy-load anything large.
- Respect `prefers-reduced-motion` (turn off decorative motion).
- Tap targets ≥ 44 px; keyboard and screen reader still work; contrast AA for text.
- Georgian text uses "Noto Sans Georgian"; check that every new component renders Georgian well and does not clip it.
- Test at 320, 375, 390 px and desktop before committing.

---

# Part 4 — Appwrite: accounts and cloud save

Connect the existing app to **Appwrite Cloud** (https://appwrite.io) so progress is saved online and syncs between
devices. Do not rebuild the app. Keep it **offline-first**: `localStorage` stays the main copy, so the app works
without internet and without an account. Appwrite is a sync layer on top.

## 4.0 Secrets: read this first

- The browser app needs **only** the endpoint and the project ID. These are public; put them in `.env.local` as
  `VITE_APPWRITE_ENDPOINT` and `VITE_APPWRITE_PROJECT_ID` and add a `.env.example` with empty values.
- The **API key is a server secret.** Anything with the `VITE_` prefix ends up in the public JS bundle, so the key
  must **never** have that prefix, never be imported in `src/`, never be committed, never be printed in logs.
  Use it only in the setup script (section 2) as `APPWRITE_API_KEY` in `.env.local`.
- Check that `.env.local` is in `.gitignore` before writing anything.
- After the setup script has run, the app works without the key. Tell me which scopes the key needs
  (databases/tables read+write) so I can give it the smallest scopes.

## 4.1 SDK

- Browser: `appwrite` (Web SDK). Setup script: `node-appwrite`. Install the current versions.
- Newer Appwrite versions use the **TablesDB** API (databases → tables → columns → rows). The older
  Databases/collections/documents API is deprecated. Check what the installed SDK exports and use `TablesDB`
  if it exists; otherwise use `Databases`. Use one wrapper file, `src/lib/appwrite.ts`, so the rest of the
  app never calls the SDK directly.
- In the Appwrite console, a **Web platform** must exist for `localhost` and for the deployed domain, or the
  browser gets CORS errors. Tell me which hostnames to add (I add them myself).

## 4.2 Setup script (creates the database once)

`scripts/appwrite-setup.ts`, run with `npm run appwrite:setup`. It reads `APPWRITE_API_KEY` from `.env.local`
and is safe to run again (it skips what exists). It creates database `lizulingo` with:

**Table `progress`** — one row per user, row id = user id.
| Column | Type |
|---|---|
| `userId` | string (36), required |
| `data` | long text: the whole progress JSON (same format as `lizulingo_progress_v2`) |
| `version` | integer (progress format version) |
| `updatedAt` | datetime |
| `deviceId` | string (36) |
Row security on. The table allows `create` for `users`. Each row gets read/update/delete for `Role.user(userId)` only.

**Table `profiles`** — for the leaderboard (optional, section 5).
| Column | Type |
|---|---|
| `userId` | string (36), required, unique index |
| `displayName` | string (30) |
| `mascotColor` | string (16) |
| `totalXp` | integer |
| `weeklyXp` | integer |
| `weekStart` | string (10, `YYYY-MM-DD`) |
| `streak` | integer |
Index on `weeklyXp` (desc). Read for `users` (any logged-in user); update only for the owner.

No other personal data. Never store email or real names in tables.

## 4.3 Accounts

- **Guest first:** on first launch, nothing changes. The app works locally. A "☁️ შეინახე ონლაინ" (save online)
  card on Home and in Settings explains the benefit in Georgian.
- **Sign up / log in** with email + password (Appwrite Account). Optional: Google OAuth if I enable it in the
  console. All screens in Georgian: "რეგისტრაცია", "შესვლა", "პაროლის აღდგენა" (password recovery via
  Appwrite's recovery email), "გასვლა".
- Show clear Georgian errors (wrong password, email taken, no internet, too many attempts).
- The session stays after reload (Appwrite handles cookies/local session). Logout keeps a local copy of the progress.
- Settings: "ანგარიშის წაშლა" (delete account data): deletes the user's `progress` and `profiles` rows after a
  confirm dialog.

## 4.4 Sync rules

- On login: download the cloud row. If there is no row, upload the local progress. If both exist, **merge** with the
  same merge function as the file import (higher XP, union of completed lessons/words/mistakes, longer streak,
  newer settings) and upload the result. Never let an empty device overwrite real progress.
- While logged in: after each save to `localStorage`, push to Appwrite with a 5 s debounce, and on
  `visibilitychange` → hidden. Only send when the data changed.
- Offline: queue the push; retry with backoff when `online` fires. A small cloud icon in the top bar shows the state:
  synced ✓, syncing ↻, offline ⚠ (with a Georgian tooltip).
- On app start and when the tab becomes visible again, pull the row; if `updatedAt` is newer than the local one
  and from another `deviceId`, merge it in.
- Use Appwrite Realtime on the user's own `progress` row to pick up changes from another device live (optional,
  only if simple).
- Size check: if the JSON gets near the column limit, trim old history (keep the last 365 days) before upload.

## 4.5 Leaderboard (makes it more fun)

- A "🏆 ლიგა" tab: top 20 users by `weeklyXp` this week, the learner's own rank, and their friends' names
  (display name only).
- On sign-up, the learner picks a display name (validated: 3–20 chars, no email-like text) and a mascot color.
- `weeklyXp` resets when `weekStart` is older than this Monday (handled by the client on its own row).
- Note: the client writes its own XP, so the leaderboard can be cheated. That is acceptable for this app;
  add a `ponytail:` comment saying an Appwrite Function should compute XP server-side if that ever matters.

## 4.6 Tests and done

- Unit tests for the merge function (cloud newer, local newer, empty cloud, empty local) and for the sync queue
  (offline → online). Mock the Appwrite wrapper; tests never call the real server.
- `npm run build` passes, and `grep` on `dist/` finds **no** API key (add this check as a script: `npm run check:secrets`).
- Manual check: play on phone as guest → sign up → progress uploaded → log in on desktop → same progress.
  Turn off Wi-Fi, play a lesson, turn it on → syncs.
- Without `VITE_APPWRITE_*` env vars, the app still runs fully local and hides all cloud UI.

Extra for this part:
- An Appwrite MCP server is configured for this project (`claude mcp add appwrite --transport http https://mcp.appwrite.io`).
  If your tool can use it after login, create the database and tables through it instead of the setup script.
- Sync the new `lessonRounds` field from Part 2 too (merge = the higher round count per lesson).

---

# Final definition of done

- All Part 1 checks are true on a real phone (iPhone Safari) and on desktop.
- Parts 2, 3 and 4 meet their own "done" lists.
- No German-only screen anywhere; no question needs knowledge of the book.
- `npm run build` and `npx vitest run` pass; no console errors; the live site updates after each push.
