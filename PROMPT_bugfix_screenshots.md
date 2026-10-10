# LIZULINGO — Bug Fix Prompt (from phone screenshots, iPhone Safari, lizulingo.vercel.app)

Fix these bugs in the existing app. Find the root cause of each, fix it in the shared place, and add a test
where the logic allows it. Do not rebuild the app.

## Bug 1 — A correct sentence is marked wrong

**Seen:** `build` question "სასიამოვნოა თქვენი/შენი გაცნობა!". The learner tapped
`Freut` `mich` `dich` `kennenzulernen` in the right order. The red sheet said wrong and showed
"Freut mich, dich kennenzulernen." as the correct answer.

**Cause:** `normalizeGerman` in `src/utils/normalize.ts` removes only *trailing* punctuation. The target has a
comma inside, the chips do not, so "freut mich dich kennenzulernen" ≠ "freut mich, dich kennenzulernen".

**Fix:**
- `normalizeGerman` removes **all** punctuation anywhere in the text (`, . ! ? : ; - – — " „ " ' ( ) …`).
- `build` / `listen` / `translate` compare normalized word arrays (chips vs target words), not raw joined strings.
- Add a test that loops over **every** build/listen/translate question in all lessons, takes the target's words
  in order as the user input, and asserts it is correct. Also loop over every other question type with its
  correct answer. No lesson may contain a question whose correct answer is rejected.
- Also fix the Georgian prompt "თქვენი/შენი": the target uses *dich* (informal), so the prompt should say
  "სასიამოვნოა შენი გაცნობა!". Check all `translate`/`build` prompts for the same du/Sie mismatch.

## Bug 2 — Toggle switches in Settings are broken

**Seen:** in Settings (dark mode), the "on" toggles show the white knob sticking out past the right end of
the track; the "off" toggle (typing mode) shows only a white circle with no visible track.

**Cause:** the toggles use the class `w-13` (`SettingsScreen.tsx` ≈ lines 80, 113, 146). Tailwind has no
`w-13` in the default scale, so the track has no width, shrinks, and the knob's `translate-x-6` pushes it outside.

**Fix:**
- Make one reusable `<Toggle checked onChange label />` component and use it for every switch.
- Fixed size track (`w-12 h-7` or an arbitrary value like `w-[52px]`), `shrink-0`, knob `w-5 h-5`,
  `translate-x-5` when on. The knob must always stay inside the track.
- The off state needs a visible track (gray in light mode, dark gray with a border in dark mode).
- It must be a `<button role="switch" aria-checked>` with the Georgian label, focus ring and ≥ 44 px tap area,
  not a clickable `<div>`.
- Search the whole project for other non-default Tailwind classes that do nothing (`w-13`, `h-13`, `p-4.5` …).
  Run the Tailwind build and check that each class used exists, or use arbitrary values.

## Bug 3 — Content hidden behind the top bar and bottom nav

**Seen:**
- In Settings, the profile card's top edge is cut off under the sticky top bar.
- The "მონაცემების მართვა" (data management) section at the bottom is hidden under the fixed bottom nav, and you
  cannot scroll it fully into view.
- In the lesson screen (build question), the lesson header (close button, progress bar, hearts) is not visible.

**Fix:**
- Every page with the bottom nav gets bottom padding equal to the nav height + `env(safe-area-inset-bottom)`
  (use one CSS variable, for example `--bottom-nav-h`, set in one place).
- Page content starts below the sticky top bar; no negative margins under it.
- The lesson screen layout: `height: 100dvh`, a grid with 3 rows: header (auto, always visible) / question area
  (scrolls) / bottom check button or result sheet (auto). The result sheet must not cover the answer line;
  the question area shrinks instead.
- Add `viewport-fit=cover` to the viewport meta and use `env(safe-area-inset-*)` for the iPhone notch and
  home bar.
- Test in iPhone Safari size (390×844 and 375×667) with the browser toolbars shown.

## Bug 4 — Stats don't add up

**Seen:** the profile shows "🔥 1 დღე" streak, but "0 XP" and "0 გაკვეთილი".

**Check and fix:**
- The streak must increase only when a lesson is **completed** on that day, never on app open.
- If lessons were completed but the profile shows 0, progress is not saved or not read on this device. Check the
  save path on iOS Safari (private mode, storage errors), and show the "პროგრესი არ ინახება" banner when saving fails.
- XP, lesson count and streak on the profile must come from the same saved state as the top bar.

## Bug 5 — Top bar is crowded on phones

The top bar (logo, streak, daily-goal ring, hearts, sound, theme) is full at 390 px and will overflow at 320 px.
- At < 400 px: shorten the logo (mascot icon or "LIZU"), and move the sound and theme buttons into Settings
  (keep a mute button inside the lesson header).
- Numbers never wrap; icons keep a fixed size.

## Done when

- The exact case "Freut / mich / dich / kennenzulernen" is accepted, and the all-lessons test passes.
- All toggles look right in light and dark mode, on and off, and work with keyboard and screen reader.
- Nothing is hidden behind the top bar, the bottom nav, the notch or the home bar at 320, 375 and 390 px.
- Streak, XP and lesson count agree everywhere.
- `npm run build` and `npx vitest run` pass; no console errors.
