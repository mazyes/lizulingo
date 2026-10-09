# LIZULINGO v2 — Continue Build Prompt (Modul 1–6, learn from zero)

LIZULINGO already exists in this repo (Vite + React + TypeScript + Tailwind). It has Modul 2 and Modul 3,
the lesson path, hearts, XP, streak, the Wörterbuch, the settings and 9 question types
(`src/types/lesson.ts`, `src/data/lessons.ts`). Do **not** rebuild the app. Extend it.

## 0. The most important rule: the learner does NOT know the book

The learner is a **Georgian speaker who knows zero German**. They never opened "deutsch Buch 1".
They do not know who Martin, Anna, Anton, Frau Rilke, Katharina or Herr Schmitt are.
The book is only the **source of words, grammar order and example sentences**. The app is the teacher.

Rules that follow from this:

1. **Teach before you test.** Every new word and every grammar rule appears first on a teaching
   screen, then in easy questions, then in harder questions. Never ask about a word the learner has not seen.
2. **Every question is self-contained.** All information needed to answer is on the same screen.
   - Bad: "Ist Martin Lehrer oder Schüler?" with no context. Nobody can know this.
   - Good: show the line *"Martin: Ich bin kein Lehrer, sondern Schüler."* (with audio and a Georgian
     translation toggle), then ask "Martin ist …? → Schüler".
   - Bad: "Wie alt ist Frau Rilke?" — Good: show the dialog lines first, as a `dialog` question.
3. **Questions about book characters are always `dialog` or `truefalse` with `dialogContext`.** Never a bare `choice`.
4. **Georgian on every screen.** Each question has a Georgian instruction line (`georgianHint`), for example
   "აირჩიე სწორი არტიკლი", "ააწყვე წინადადება", "მოუსმინე და აირჩიე". German sentences have a
   "🇬🇪 თარგმანი" tap-to-reveal translation.
5. **Explain every mistake in Georgian.** The red sheet shows the correct answer, the rule in 1–2 short
   Georgian sentences, and one German example with translation.
6. Grammar terms are explained the first time in plain Georgian (for example: "არტიკლი — პატარა
   სიტყვა არსებითი სახელის წინ: der (მამრ.), die (მდედრ.), das (საშ.)").

### 0.1 Fix the existing Modul 2 and Modul 3

Audit every question in `lessons.ts` for Modul 2 and 3 against rules 1–5:
- Bare `choice` questions about Martin (Lesson 2.1: Land, Stadt, Lehrer/Schüler, lernt was, gern) become
  `dialog` questions that show the needed dialog lines.
- Rilke/Anton `truefalse` questions get `dialogContext` (the full dialog lines they depend on).
- Add a Georgian `georgianHint` and `explanation` where missing.
- Add teaching cards (see 2.1) at the start of each Modul 2/3 lesson.
Keep all existing answers accepted.

## 1. Source: the book PDF

File: `F:\Downloads\BUCH\buch 1 (1).pdf` (224 pages, **scanned images, no text layer**, 224 MB).
The Read tool refuses it (>100 MB) and `pdftoppm` is not installed. Render pages with PyMuPDF (installed):

```python
import pymupdf, sys
d = pymupdf.open(r"F:\Downloads\BUCH\buch 1 (1).pdf")
for i in range(START - 1, END):          # 1-based PDF page numbers below
    d[i].get_pixmap(dpi=110).save(rf"<scratchpad>\p{i+1:03}.png")
```

Then read the PNGs. Write rendered images to the scratchpad, not the repo. Use the answer key
(**Schlüssel**, PDF pages 213–218) to verify every answer. Use the alphabetical word list
(PDF pages 219–223) to cross-check the Wörterbuch.

### 1.1 Page map (PDF page numbers, 1-based)

Each Unterricht page has a word column (left), questions with answers in italics (right), a
conjugation table and a "speech bubble" model sentence. The exercise pages (Kommunikation,
Grammatik, "Schon fertig?", Wortschatzarbeit) follow each module.

| Module | Unterricht (lessons) | Exercise pages |
|---|---|---|
| Modul 1 | U1 13–16, U2 17–20, U3 21–25, U4 26–29, U5 30–34 | W-Fragen + Im Unterricht 35, Grammatik 1 36–39, Schon fertig 40, Wortschatzarbeit 41–42 |
| Modul 2 | (already built) U6–U10 | (already built) |
| Modul 3 | (already built) U11–U15 | (already built) |
| Modul 4 | U16 117–121, U17 122–125, U18 126–130, U19 131–135, U20 136–140 | Kommunikation 3 141–142, Grammatik 4 143–144, Schon fertig 145, Wortschatzarbeit 146–147 |
| Modul 5 | U21 149–151, U22 152–155, U23 156–160, U24 161–164, U25 165–168 | Kommunikation 4 169–170, Grammatik 5 171–174, Schon fertig 175, Wortschatzarbeit 176–177 |
| Modul 6 | U26 181–184, U27 185–189, U28 190–193, U29 194–198, U30 199–202 | Kommunikation 5 203–205, Grammatik 6 206–208, Schon fertig 209, Wortschatzarbeit 210–211 |

## 2. Syllabus to build

For each Unterricht: read its pages, take **the word column, the Q&A sentences, the conjugation
table and the model sentence**. For each module: turn every Übung on the exercise pages into
questions (same approach as Modul 2/3: `fill`, `build`, `match`, `odd`, `truefalse`, `dialog`).
Use book sentences, keep them exact. Add Georgian translations yourself. Do not invent grammar
that the book does not teach in that module.

Topics, as a checklist (confirm each against the pages):

**Modul 1 — "პირველი ნაბიჯები"**
- U1 *Ich bin Schüler und lerne Deutsch.* — ja/nein, der Schüler/die Schülerin, der Lehrer/die Lehrerin,
  ich bin / du bist / er-sie ist, auch, nein … nicht/kein … sondern, Fragen: Position 1 / Position 2.
- U2 *Hallo! Wie heißt du?* — lernen, tauchen, heißen (conjugation), wir/ihr/sie, Leute, natürlich,
  und, oder; languages (Polnisch, Englisch, Russisch, Tschechisch, Chinesisch, Portugiesisch, Spanisch);
  greetings (Guten Morgen/Tag/Abend, Hallo); "Konjugiere bitte SEIN!".
- U3 *Entschuldigung, woher kommen Sie?* — kommen aus, Länder (Polen, Deutschland, Portugal, Spanien,
  Russland, Österreich, England, China, Brasilien, Angola), woher/wer, Sie (formal), sprechen, machen,
  hier/dort, warum/denn.
- U4 *Länder, Städte, Dörfer* — der Kontinent, das Land, die Stadt, das Dorf, die Hauptstadt, ein/eine/kein/keine,
  Europa/Asien/Afrika/Südamerika/Australien, wo? (in Europa, in Asien).
- U5 *Was ist das?* — Kleidung (Pulli, Schuh, Hemd, Bluse, Hose, Socke, Rock, Tasche, Kleid), Tisch, Stuhl,
  plurals, "Wie heißt … auf Deutsch?", "Ich weiß nicht", doch.
- Page 35: W-Fragen table (was/wo/woher/wer/warum), der/die/das → ein/eine/kein table, classroom phrases
  ("Wiederhole bitte!", "Übersetze bitte!", "Sagen Sie das bitte noch einmal!") — make these a phrasebook lesson.

**Modul 4 — "დრო, სხეული, ცხოველები"**
- U16 *Heute ist Montag.* — Wochentage, heute/morgen/übermorgen/gestern/vorgestern, am Vormittag/Nachmittag,
  essen, zu Mittag essen, ausgehen (separable), lieber, an der See / im Gebirge, Zeit verbringen.
- U17 *Wo warst du letztes Jahr?* — sein im Präteritum (war, warst …), Woche/Jahr, diese/letzte Woche,
  im Ausland, an der Ostsee / am Mittelmeer, schon mal / noch nie, Familie (Opa, Oma), besuchen, oft/selten.
- U18 *Eure Haare sind hell.* — Körper (Auge, Haar, Bein, Hals, Hand), hell/dunkel, kahl geschoren,
  Possessiv unser/euer/ihr/Ihr (Nominativ table), wessen?, die Vergangenheit.
- U19 *Was ist dein Lieblingstier?* — Possessiv Akkusativ table, Nase, Ohr, Haut, Tiere (Hund, Katze, Vogel,
  Kanarienvogel, Papagei, Fisch, Kaninchen), bunt.
- U20 *Wann hast du Geburtstag?* — Eule, Maus, Lieblingstier, kaufen für + Akkusativ, Monate, kommen vor/nach,
  der Geburtstag (im Mai), Freund/Freundin, das Geschenk, bekommen.
- Kommunikation 3: both dialogs + Übung 1–2 (always shown with the dialog on screen).

**Modul 5 — "დატივი, ოჯახი, სახლი"**
- U21 *Was gibt uns der Weihnachtsmann?* — Dativ pronouns (mir, dir, ihm, ihr, uns, euch, ihnen, Ihnen),
  geben, antworten, Schmuck, Schal, Kuscheltier, Weihnachten.
- U22 *Wie geht es dir?* — gut/schlecht/prima/ganz gut, Auf Wiedersehen, Gute Nacht, Tschüs, sprechen mit + Dativ,
  die Eltern, Vater, Mutter.
- U23 *Ich helfe meinem Opa gern.* — helfen + Dativ, Dativ articles table (dem/der/den + -n), gratulieren,
  zum Geburtstag, Geschwister, Bruder, Schwester.
- U24 *Mit wem wohnst du?* — in/an + Dativ (im Zimmer, am Montag), Supermarkt, Restaurant, wohnen,
  in der … Straße, alle/manche, Großeltern, Teenager, unter einem Dach, allein, zusammen.
- U25 *Magst du italienische Küche?* — haben im Präteritum (hatte), als Kind, mögen, Haus, Wohnung, Küche,
  früh/spät, Frühstück, frühstücken, vegetarische/italienische Küche, gesund.
- Kommunikation 4: dialog Katharina ↔ Martin + Übung 1–2.

**Modul 6 — "საჭმელი, გენიტივი, ტრანსპორტი"**
- U26 *Die Süßigkeiten sind lecker.* — Süßigkeiten, Obst, Gemüse, lecker, jeden Tag, Brot/Brötchen, Quark, Käse,
  trinken, Wasser, Mineralwasser, Tee, Kaffee, Zucker, Salz, mit/ohne, Milch.
- U27 *Ich möchte etwas essen.* — Zitrone, Schokolade, süß/bitter/salzig/sauer, etwas/nichts, möchte (table),
  Tomate, Suppe, Tomatensuppe, Speise, Spaghetti, Fleisch.
- U28 *Das ist das Buch des Schülers.* — Stunde, Minute, dauern, Unterrichtsstunde, Monat, Genitiv
  (des Schülers, der Frau, des Kindes), wessen?
- U29 *Die Kinder meiner Schwester heißen …* — Onkel, Tante, Enkel/Enkelin, Schwiegervater/-mutter/-sohn/-tochter,
  Genitiv with possessives (meines Vaters, meiner Mutter), "Das stimmt / Das stimmt nicht".
- U30 *Womit fährst du zur Arbeit?* — Genitiv negative (keines Mannes), Preis hoch/niedrig, Kurs, Produkt,
  Fuß, zu Fuß gehen, Fahrkarte, Zug, Bus, Straßenbahn, fahren, mit dem Auto/Bus/Zug.
- Kommunikation 5: both dialogs (Martin at lunch; buying train tickets) + Übung 1–2.

Lesson ids: `1.1`–`1.6`, `4.1`–`4.6`, `5.1`–`5.6`, `6.1`–`6.6` (one per Unterricht plus one module-exercise
lesson), then a boss test per module (`1-boss` … `6-boss`). Final path order: Modul 1 → 2 → 3 → 4 → 5 → 6.

## 3. Lesson structure (all modules, including 2 and 3)

Each lesson runs in 3 phases. The progress bar covers all of them.

1. **ისწავლე (Learn)** — 4–8 swipeable teaching cards:
   - **Word card:** big emoji or simple inline SVG picture, German word with article color
     (der = blue, die = red, das = green), plural, Georgian translation, 🔊 button, one example sentence.
   - **Rule card:** the grammar point in Georgian (max 3 short lines), a mini table (for conjugation or
     articles), 2 examples with translation. Lizi (mascot) "says" the rule in a speech bubble.
2. **ივარჯიშე (Practice)** — 6–8 easy questions using only the words just taught: picture → word `choice`,
   `listen` → pick word, `match` German ↔ Georgian.
3. **შეამოწმე (Check)** — 8–10 book-based questions (fill, build, dialog, truefalse, odd …).

Add the type `teach` to the `Question` union (or a separate `cards` array on `Lesson`) for teaching cards.
Teaching cards cost no hearts. Add `translation?: string` to `BaseQuestion` for the 🇬🇪 toggle.

Lesson difficulty ramps up: Modul 1 has more chips, more pictures and more Georgian; Modul 5–6 use more
typed answers and fewer hints.

## 4. Make it more fun

- **Story mode:** Lizi travels through Germany. Each module is a place on the path (Modul 1 Berlin,
  2 Heide, 3 Hamburg, 4 Ostsee, 5 Düsseldorf, 6 München) with a small SVG banner. One-line Georgian story
  intro per lesson ("ლიზი ბერლინში ჩავიდა და პირველ მეგობარს ხვდება…").
- **New question types:**
  - `picture` — 4 emoji/SVG image cards, pick the one matching the German word (main type in Phase 2).
  - `speak` (optional) — Web Speech `SpeechRecognition` with `lang: 'de-DE'`; if unsupported, hide it.
    Accept with the same normalizer as typed answers. Never block progress: "ახლა არ შემიძლია" skips it.
  - `translate` — Georgian sentence → build the German one from chips (and the reverse).
- **Combo:** 5 correct in a row → "🔥 კომბო!" animation and +2 XP.
- **Treasure chest** after each module boss test (random bonus XP, confetti).
- **Achievements** page: first lesson, 7-day streak, 100 words learned, module finished, perfect lesson.
- **Words learned counter** on Home, from the Wörterbuch entries already shown in teach cards.
- **Daily quests** (3 per day): finish 2 lessons, 10 correct in a row, practice mistakes once.
- **Placement option** on first start: "ნულიდან ვიწყებ" (from zero) or "ცოტა ვიცი" (short test, unlocks
  up to the first failed module).

## 5. Data and code

- Split content: `src/data/modules/m1.ts` … `m6.ts` (move existing Modul 2/3 content into `m2.ts`, `m3.ts`),
  `src/data/lessons.ts` re-exports all units. Adding a lesson must still only require editing data files.
- Extend `unitId` to `'modul-1' | … | 'modul-6'`.
- Add every new word to `dictionaryEntries` (article, plural, Georgian, category). Group the Wörterbuch
  by module. Words become "learned" when their teach card is seen.
- Keep the old progress: migrate the `localStorage` format; do not reset users. Modul 2 stays unlocked
  for users who already completed Modul 2 lessons, even if Modul 1 is not done.
- Keep answer checking rules from v1 (spaces, case, final punctuation, ß=ss, ä=ae …).

## 6. Definition of done

- `npm run dev` starts with no console errors; `npm run build` passes; `npx vitest run` passes.
- Modul 1–6 are all playable from start to end, including 6 boss tests.
- No question references a character or fact that is not visible on the same screen
  (add a test: every `choice`/`truefalse` whose text contains a name from the dialogs —
  Martin, Michael, Anton, Rilke, Katharina, Schmitt, Simone, Anna — must have `dialogContext`
  or be a `dialog` subQuestion).
- Every question has a `georgianHint`; every wrong answer shows a Georgian explanation.
- Every lesson starts with teaching cards; every word used in Phase 2 appears in that lesson's cards.
- Every answer matches the book's Schlüssel (PDF pages 213–218).
- Extend `src/data/lessons.test.ts` with the checks above, plus the existing ones (≥1 answer,
  fill gap count = answer count).
- Works at 375 px and on desktop, light and dark mode.
- Old progress survives the update.
