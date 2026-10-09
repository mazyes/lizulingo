# LIZULINGO — Build Prompt

Build **LIZULINGO**, a fun, Duolingo-style German learning web app. It is based on exercises from the textbook "deutsch Buch 1" (Direct Method), **Modul 2 and Modul 3**. All learning content is listed below. Use it exactly; do not invent new grammar topics.

The learner is a Georgian speaker at A1 level. The UI language is **Georgian** (ქართული). Exercise content stays **German**. Short Georgian hints and translations appear where they help.

---

## 1. Tech and scope

- Single-page web app: **Vite + React + TypeScript + Tailwind CSS**.
- No backend and no login. Save progress (XP, streak, hearts, completed lessons, mistakes) in `localStorage`. Wrap every storage read and write in try/catch so the app still works when storage is blocked.
- Keep all exercise content in one data file, `src/data/lessons.ts`, typed with a shared `Question` union type. Adding a lesson must only require editing that file.
- Mobile-first layout (360px width and up), also good on desktop. No horizontal scroll.
- Use the browser **Web Speech API** (`speechSynthesis`, voice `de-DE`) for German audio. If no German voice exists, hide the audio button.
- Use your own original design and mascot. Do **not** copy Duolingo's logo, owl, name, or assets. Duolingo is only the reference for the game feel.

## 2. Look and feel

- Brand name **LIZULINGO** in a bold, rounded, playful font (for example "Nunito" or "Baloo 2" from Google Fonts). Use a Georgian-capable font for Georgian text ("Noto Sans Georgian").
- Mascot: an original cute character (for example a small fox or a hedgehog named "ლიზი"). Draw it as inline SVG. Give it 3 moods: happy (correct answer), sad (wrong answer), and celebrating (lesson complete).
- Bright, friendly palette. Large rounded buttons with a 3D bottom border that compresses on press. Smooth micro-animations.
- Sounds for correct, wrong, and lesson complete. Generate them with the Web Audio API, so no audio files are needed. Add a mute toggle.
- Confetti on lesson complete.
- Light and dark mode.

## 3. Game mechanics

- **Home path:** a winding vertical path of lesson circles, grouped in 2 units: "მოდული 2" and "მოდული 3". Each unit has a colored header banner. A lesson unlocks when the previous lesson is complete. Completed lessons show a crown or star.
- **Lesson:** 10–12 questions, randomly picked and shuffled from that lesson's pool. A progress bar runs at the top.
- **Hearts:** 5 hearts. Each wrong answer costs 1 heart. At 0 hearts, the lesson ends with a "სცადე თავიდან" (try again) screen. Hearts refill fully after 30 minutes, or immediately after the user completes one "practice" (review) session.
- **XP:** +10 per lesson, +5 bonus for a lesson with no mistakes.
- **Streak:** count of consecutive days with at least 1 completed lesson. Show a flame icon in the top bar.
- **Daily goal:** 30 XP, shown as a ring.
- **Wrong answers:** the bottom sheet turns red. It shows the correct answer and a short Georgian explanation. The question comes back again at the end of the same lesson.
- **Correct answers:** the bottom sheet turns green with a random praise word: "Super!", "Toll!", "Prima!", or "ყოჩაღ!".
- **"შეცდომების გამეორება" (practice mistakes):** a mode that only uses the questions the user got wrong before.
- **Results screen:** XP earned, accuracy %, and time taken.
- **Answer checking:** ignore extra spaces. For typed answers, ignore case and the final punctuation. Treat `ß` = `ss` and `ä/ö/ü` = `ae/oe/ue` as correct, but show the proper spelling in the green sheet. Accept every alternative listed in `answers` (arrays below).

## 4. Question types

Implement these types. Each content item below names its type.

1. `choice` — a prompt with 2–4 option buttons.
2. `fill` — a sentence with a gap `___`. The user picks from word chips (default) or types the answer (harder mode, when `typed: true`). A sentence with 2 gaps uses 2 answer slots.
3. `build` — sentence building. Show shuffled word chips. The user taps chips in order. Add 1–2 distractor chips.
4. `truefalse` — a statement and the buttons "Richtig" / "Falsch".
5. `odd` — "რომელი არ ერგება?" (which one does not fit?). Show 4 options and the reason after answering.
6. `match` — tap pairs: 5 pairs per screen (opposites, singular↔plural, masculine↔feminine profession, digits↔number words).
7. `listen` — play German audio of a sentence. The user builds it with chips.
8. `dialog` — show 3–6 lines of a dialog. Then ask a `choice` or `truefalse` question about it.
9. `wordsearch` (bonus, only in lesson 2.5) — an 8×8 letter grid. The user drags across letters to find the colors.

---

## 5. Content — Modul 2

### Lesson 2.1 — Dialog "Der Schüler aus Deutschland" (Kommunikation 1)

Dialog (use it for `dialog` and `listen` questions):

```
Michael: Hallo, ich heiße Michael. Wie heißt du?
Martin: Hallo, ich heiße Martin.
Michael: Martin, woher kommst du?
Martin: Ich komme aus Deutschland.
Michael: Kommst du aus Berlin?
Martin: Nein, ich komme nicht aus Berlin, sondern aus Heide. Heide ist eine Stadt in Deutschland.
Michael: Ist die Stadt groß oder klein?
Martin: Sie ist klein.
Michael: Bist du Lehrer?
Martin: Nein, ich bin kein Lehrer, sondern Schüler.
Michael: Ist das dein Buch?
Martin: Ja, das ist mein Buch. Und das ist meine CD. Die CD ist sehr nützlich beim Lernen.
Michael: Was lernst du? Englisch oder Russisch?
Martin: Ich lerne weder Englisch noch Russisch, sondern ich lerne Spanisch.
Michael: Lernst du Spanisch gern?
Martin: Ja, ich lerne Spanisch sehr gern. Und meine Mitschüler lernen immer auch sehr gern.
Michael: Ich lerne Englisch, aber ich lerne nie gern. Ich spreche nur ein bisschen Englisch. Ich finde Englischlernen zeitraubend und sehr langweilig.
Martin: Bis bald, Michael.
Michael: Bis bald.
```

Questions about Martin (`choice`): Land → Deutschland; Stadt oder Dorf → eine Stadt (Heide, klein); Lehrer oder Schüler → Schüler; lernt was → Spanisch; gern oder nicht gern → sehr gern.

W-Fragen (`fill`, chips: Was, Wer, Wo, Woher, Wie, Warum, Wie viele):

| Sentence | Answer |
|---|---|
| ___ lernt ihr? Wir lernen Deutsch. | Was |
| ___ lernen die Schüler Deutsch? Die Schüler lernen Deutsch, denn Deutsch ist einfach. | Warum |
| ___ ist der Rock? Der Rock ist weiß. | Wie |
| ___ bist du? Ich bin im Klassenzimmer. | Wo |
| ___ Schüler sind im Klassenzimmer? Im Klassenzimmer sind 5 Schüler. | Wie viele |
| ___ kommt er? Aus Österreich. | Woher |
| ___ ist das? Das ist Martin. | Wer |
| ___ findest du Deutschlernen? Deutschlernen finde ich langweilig. | Wie |

### Lesson 2.2 — sondern / aber, Artikel (Grammatik 2)

sondern oder aber? (`fill`, chips: sondern, aber). Georgian hint: *sondern* comes after a negation ("not X but Y"); *aber* means "but / however".

| Sentence | Answer |
|---|---|
| Das ist keine Frau, ___ ein Mann. | sondern |
| Ich komme nicht aus Deutschland, ___ aus Spanien. | sondern |
| Ich lerne Deutsch, ___ meine Kinder lernen Englisch und Chinesisch. | aber |
| Anna spricht Deutsch, ___ sie spricht kein Russisch. | aber |
| Mein Mitschüler liest nicht langsam, ___ sehr schnell. | sondern |
| Schwarz ist seine Lieblingsfarbe, ___ ihre Lieblingsfarbe ist Grün. | aber |
| Wir finden Lesen weder zeitraubend noch langweilig, ___ sehr interessant. | sondern |
| Er heißt Schmitt, ___ sie heißt nicht Schmitt, ___ Schulz. | aber / sondern |

Artikel (`fill`, 3 gaps, chips: ein, eine, der, die, das, er, sie, es, — ). The pattern is: "Europa ist **ein** Kontinent. **Der** Kontinent ist groß. **Er** ist groß." "—" means no article (plural).

| Sentence | Answers |
|---|---|
| Berlin ist ___ Stadt. ___ Stadt ist groß. ___ ist groß. | eine / Die / Sie |
| Martin ist ___ Mann. ___ Mann ist sehr intelligent. ___ ist sehr intelligent. | ein / Der / Er |
| Das ist ___ Computer. ___ Computer ist immer sehr nützlich beim Lernen. ___ ist immer sehr nützlich. | ein / Der / Er |
| Die Gebrauchsanweisung und die Lieblingsfarbe sind ___ Wörter. ___ Wörter sind sehr lang. ___ sind sehr lang. | — / Die / Sie |
| Unter den Linden ist ___ Straße in Berlin. ___ Straße ist lang. ___ ist lang. | eine / Die / Sie |
| Das ist ___ Wörterbuch. ___ Wörterbuch ist dick. ___ ist dick. | ein / Das / Es |
| Grün und Rot sind ___ Farben. ___ Farben sind sehr hübsch. ___ sind sehr hübsch. | — / Die / Sie |
| Das ist ___ Zimmer. ___ Zimmer ist sehr klein. ___ ist sehr klein. | ein / Das / Es |
| Das ist ___ Tisch. ___ Tisch ist schwarz. ___ ist schwarz. | ein / Der / Er |
| Und das sind ___ Stühle. ___ Stühle sind grau. ___ sind grau. | — / Die / Sie |

### Lesson 2.3 — Verben, Zahlen, Possessivpronomen

Verb conjugation (`fill`, typed: true, show the infinitive in brackets):

| Sentence | Answer |
|---|---|
| ___ du viel Zeit im Freien? (verbringen) | Verbringst |
| Viele Leute ___ Sport nicht gern. (treiben) | treiben |
| ___ du oder ___ du? (stehen, sitzen) | Stehst / sitzt |
| ___ ihr Lesen langweilig? (finden) | Findet |
| Das Kind ___ sehr langsam. (lesen) | liest |
| Meine Mitschülerin ___ Filme nicht gern (sehen), aber ihre Kinder ___ Filme sehr gern. (sehen) | sieht / sehen |
| Entschuldigung, ___ Sie schnell am Computer? (schreiben) | schreiben |
| Du ___ nie (tauchen), denn du ___ Tauchen sehr gefährlich. (finden) | tauchst / findest |

Zahlen (`fill`):

| Sentence | Answer |
|---|---|
| Im Klassenzimmer sind ___ (9) Schüler. | neun |
| Hier stehen ___ (12) Stühle und ___ (2) Tische. | zwölf / zwei |
| Das sind ___ (4) CDs. | vier |
| Im Zimmer sitzt nur ___ (1) Mann, nur ___ (1) Frau und nur ___ (1) Kind. | ein / eine / ein |
| In der Schule sind ___ (6) Zimmer. | sechs |
| Das sind ___ (2) Hände. | zwei |

Possessivpronomen (`fill`, chips: mein, dein, ihr, meine, deine, seine, ihre, seiner, ihrer, sein, dein):

| Sentence | Answer |
|---|---|
| Das ist ___ Mitschüler Martin. (ich) | mein |
| ___ Mitschülerinnen heißen Helena und Katharina. (ich) | Meine |
| ___ Hobby ist Musik. (sie) | Ihr |
| Emil ist ein Kind. ___ Hände sind kurz. (es) | Seine |
| Er wohnt in Hamburg. ___ Stadt ist sehr groß. (er) | Seine |
| Wie ist ___ Telefonnummer? (du) | deine |
| Meiner Meinung nach ist ___ Hose sehr hübsch. (sie) | ihre |
| ___ Laptop ist immer sehr nützlich. (du) | Dein |
| ___ Meinung nach ist sie dick. (er) | Seiner |
| ___ Meinung nach sind die Übungen sehr einfach. (sie) | Ihrer |

### Lesson 2.4 — Sätze bilden ("Schon fertig?")

Gap sentences (`fill`):

| Sentence | Answer |
|---|---|
| Berlin ist ___ ein Kontinent ___ ein Land, sondern Berlin ist eine Stadt. | weder / noch |
| ___ ist deine Telefonnummer? | Wie |
| Auf der Straße stehen nicht viele, sondern wenige ___. | Leute |
| ___ Anna und Katharina deine Mitschülerinnen? Ja, sie ___ ___ Mitschülerinnen. | Sind / sind / meine |
| Ich ___ Deutschlernen nicht interessant. Ich lerne nicht ___. | finde / gern |
| Ist Grün seine ___? Nein, seine ___ ist nicht Grün, sondern Rot. | Lieblingsfarbe / Lieblingsfarbe |
| Seid ihr Schüler? Ich bin Schüler, ___ er ist Lehrer. | aber |
| Ist die Frau dick ___ dünn? Meiner Meinung nach ___ die Frau dünn. | oder / ist |

Sentence building (`build` and `listen`):

- Das ist mein Mitschüler Martin.
- Meine Mitschüler sind jetzt in der Schule.
- Sitzt der Lehrer immer?
- Er spricht sehr langsam Deutsch.
- Ihrer Meinung nach sind Röcke nie nützlich beim Lernen.
- Bist du ein Mann oder eine Frau?
- Berlin ist weder ein Kontinent noch ein Land, sondern eine Stadt.
- Wir hören gern Musik.

### Lesson 2.5 — Wortschatz (Wortschatzarbeit)

Artikel + Plural (`choice` for the article, then `fill` for the plural; also use as `match`):

| Singular | Plural |
|---|---|
| die Schule | die Schulen |
| die Straße | die Straßen |
| das Zimmer | die Zimmer |
| der Mann | die Männer |
| die Frau | die Frauen |
| das Hobby | die Hobbys |
| das Kind | die Kinder |
| die Gebrauchsanweisung | die Gebrauchsanweisungen |
| die CD | die CDs |
| der Computer | die Computer |

Gegenteile (`match`): klein–groß, stehen–sitzen, viel–wenig, viele Leute–wenige Leute, kurz–lang, interessant–langweilig, dick–dünn, nie–immer, hässlich–hübsch, schnell–langsam, ungefährlich–gefährlich, schwierig–einfach, nützlich–unnützlich.

Was passt nicht? (`odd`; the odd one is in bold):

1. JETZT – IMMER – **GERN** – NIE (not a time word)
2. DIE MÄNNER – DIE LEHRERINNEN – DIE KINDER – **DIE HEFTE** (not people)
3. ZWEI – **WEIß** – ZEHN – NEUN (a color, not a number)
4. IN DER SCHULE – AUF DER STRAßE – **DAS KLASSENZIMMER** – IM FREIEN (no preposition)
5. GELB – GRAU – **SEIN** – BLAU (a verb, not a color)
6. **ABER** – WIE – WIE VIELE – WER (not a question word)
7. DIE HÄNDE – DIE PILZE – **DIE MITSCHÜLERIN** – DIE FRAUEN (singular)
8. **DIE LIEBLINGSFARBE** – INTELLIGENT – EINFACH – ZEITRAUBEND (a noun, not an adjective)

Farben word search (`wordsearch`). Use this exact grid; rows from top to bottom:

```
B Z G Ü G E L B
R L R O P G J M
A T A R L N R A
U Ü U U W A Ä S
N C A ß A R Z V
U T G I R O S A
P O E E Z S C H
Z R A W H C S A
```

Words to find (8): BLAU (diagonal from the top-left corner), GELB, BRAUN, GRAU, ROSA, WEIß, ORANGE, ROT. Some words run upward. Show Georgian translations after each find: ლურჯი, ყვითელი, ყავისფერი, ნაცრისფერი, ვარდისფერი, თეთრი, ნარინჯისფერი, წითელი.

---

## 6. Content — Modul 3

### Lesson 3.1 — Dialoge (Kommunikation 2)

Dialog 1:

```
– Hallo Anton! Hast du eine Uhr?
Anton: Ja, ich habe eine Uhr.
– Wie spät ist es jetzt?
Anton: Jetzt ist es zwanzig vor neun.
– Gehst du heute nicht zur Arbeit?
Anton: Doch, ich gehe zur Arbeit um 19 Uhr. Ich habe noch Zeit.
– Was machst du jetzt?
Anton: Jetzt kaufe ich einen Drucker.
– Hast du keinen Drucker zu Hause?
Anton: Nein, ich habe keinen Drucker zu Hause, aber ich brauche einen.
– Wie viel kostet ein Drucker?
Anton: Ein Drucker kostet circa 100 Euro. Ich finde Drucker nicht billig.
```

Dialog 2:

```
– Guten Tag! Wie heißen Sie?
Frau Rilke: Guten Tag! Ich heiße Elfriede Rilke.
– Frau Rilke, wie alt sind Sie?
Frau Rilke: Ich bin 52 Jahre alt.
– Was sind Sie von Beruf?
Frau Rilke: Ich bin Ärztin von Beruf.
– Sind Sie verheiratet?
Frau Rilke: Ja, ich habe einen Mann.
– Was ist er von Beruf?
Frau Rilke: Er ist Informatiker von Beruf.
– Und wie alt ist er?
Frau Rilke: Er ist auch 52 Jahre alt.
– Haben Sie Kinder?
Frau Rilke: Ich habe einen Sohn und eine Tochter.
– Wie alt sind sie?
Frau Rilke: Mein Sohn ist 15 Jahre alt und meine Tochter ist 26 Jahre alt. Mein Sohn ist noch Schüler. Meine Tochter ist keine Schülerin mehr. Sie arbeitet schon. Sie arbeitet in der Schule und sie ist Lehrerin.
```

Richtig oder falsch (`truefalse`, after showing the dialog):

| Statement | Answer |
|---|---|
| Es ist acht Uhr vierzig. | Richtig |
| Anton geht heute zur Schule. | Falsch |
| Anton kauft einen Drucker um 19 Uhr. | Falsch |
| Anton findet Drucker teuer. | Richtig |
| Frau Rilke ist geschieden. | Falsch |
| Frau Rilke und ihr Mann sind Ärzte von Beruf. | Falsch |
| Der Sohn von Frau Rilke ist jünger als ihre Tochter. | Richtig |
| Herr und Frau Rilke sind Gleichaltrige. | Richtig |
| Die Tochter von Frau Rilke lernt noch. Sie ist Schülerin. | Falsch |

Ask the question for the underlined part (`choice`, 3 options each):

| Statement | Correct question |
|---|---|
| Ich bin **Kellner** von Beruf. | Was bist du von Beruf? |
| Wir gehen **am Abend** aus. | Wann geht ihr aus? |
| Sie sind **18 Jahre alt**. | Wie alt sind sie? |
| Sie spricht **über die Bilder**. | Worüber spricht sie? |
| Es ist **fünf nach fünf**. | Wie spät ist es? |
| Der Drucker kostet **circa 100 Euro**. | Wie viel kostet der Drucker? |
| Ich finde das Klassenzimmer **klein**. | Wie findest du das Klassenzimmer? |
| **Martin und Anna** gehen aus. | Wer geht aus? |
| Wir sprechen **über den Lehrer**. | Über wen sprecht ihr? |
| Herr und Frau Rilke haben **zwei Kinder**. | Wie viele Kinder haben Herr und Frau Rilke? |

### Lesson 3.2 — Uhrzeit und Zahlen (Grammatik 3)

Wie spät ist es? (`choice` with a drawn analog clock, plus `match` digital↔words). Accept both the formal and the informal form:

| Time | Formal | Informal |
|---|---|---|
| 2.05 | Es ist zwei Uhr fünf. | Es ist fünf nach zwei. |
| 13.15 | Es ist dreizehn Uhr fünfzehn. | Es ist Viertel nach eins. |
| 4.55 | Es ist vier Uhr fünfundfünfzig. | Es ist fünf vor fünf. |
| 3.35 | Es ist drei Uhr fünfunddreißig. | Es ist fünf nach halb vier. |
| 1.00 | Es ist ein Uhr. | Es ist eins. |
| 21.30 | Es ist einundzwanzig Uhr dreißig. | Es ist halb zehn. |
| 10.40 | Es ist zehn Uhr vierzig. | Es ist zwanzig vor elf. |
| 12.20 | Es ist zwölf Uhr zwanzig. | Es ist zwanzig nach zwölf. |
| 17.30 (example) | Es ist siebzehn Uhr dreißig. | Es ist halb sechs. |

Rechnen (`choice` with number words):

| Task | Answer |
|---|---|
| 38 + 40 | achtundsiebzig (78) |
| 90 − 72 | achtzehn (18) |
| 2350 + 15 | zweitausenddreihundertfünfundsechzig (2365) |
| 25 − 18 = 100 − ? | dreiundneunzig (93) |
| 500 + 502 | (ein)tausendzwei (1002) |
| 850 − 70 | siebenhundertachtzig (780) |
| 99 − 62 | siebenunddreißig (37) |
| 56 + ? − 14 = 110 | achtundsechzig (68) |
| 115 + 115 (example) | zweihundertdreißig (230) |

### Lesson 3.3 — Lückentext und Wortschatz

Lückentext (`fill`, word chips: Ärztin, Geld, heute, kein, Bild, kostet, alt, findet, teuer, circa, Kugelschreiber, hat, arbeitet). One word does not fit (it is "alt").

> Simone ist **Ärztin** von Beruf. Sie **arbeitet** sehr viel und hat viel **Geld**. Sie kauft **heute** einen **Kugelschreiber** und ein **Bild**, denn sie **hat** keinen Kugelschreiber und **kein** Bild. Der Kugelschreiber **kostet** nur 1 Euro und Simone **findet** ihn sehr billig. Aber das Bild ist sehr **teuer** – es kostet **circa** 5000 Euro.

Split it into 3–4 `fill` screens of 3–4 gaps each.

Fehlende Wörter (`fill`):

| Sentence | Answer |
|---|---|
| Ich bin 49 Jahre alt. Mein Sohn ist 20 Jahre alt. Mein Sohn ist ___ als ich. | jünger |
| Amanda ist 20 Jahre alt. Sie ist sehr ___. Albert ist 100 Jahre alt – er ist sehr ___. | jung / alt |
| Frau Schmitt hat keinen Mann. Sie ist ___. Herr Wolf hat eine Frau. Er ist ___. | ledig (also: geschieden, verwitwet) / verheiratet |
| Ich finde die Streichhölzer billig. Ich spreche jetzt ___ die Streichhölzer. | über |
| ___ stehst du auf? Um 7 Uhr. | Wann |
| Meine Frau ist Ärztin von ___. | Beruf |
| Entschuldigung, ich habe keine ___. Wie spät ist es? | Uhr |
| ___ siehst du? Ich sehe den Mann. | Wen |
| Ich bin 26 Jahre alt. Du bist auch 26 Jahre alt. Wir sind ___. | Gleichaltrige |
| Sie ist Lehrerin. Sie ___ in der Schule. | arbeitet |

### Lesson 3.4 — Akkusativ (mich, dich, ihn…)

Personalpronomen im Akkusativ (`fill`, chips: mich, dich, ihn, sie, es, uns, euch):

| Sentence | Answer |
|---|---|
| Du bist Schüler. Der Lehrer fragt ___. | dich |
| In der Schule sehe ich viele Schüler und Schülerinnen. Ich sehe ___. | sie |
| Ich finde den Drucker teuer. Ich finde ___ teuer. | ihn |
| Meiner Meinung nach ist die Uhr hässlich. Wie findest du ___? | sie |
| Wir sind hier. Die Lehrerin sieht ___. | uns |
| Ich kaufe das Bild nicht, denn ich finde ___ teuer. | es |
| Wo ist das Kind? Ich sehe ___ nicht. | es |
| Ihr seid Schüler. Der Lehrer fragt ___. | euch |
| Der Mann spricht über seine Kinder. Er spricht über ___. | sie |
| Ihr kommt aus Deutschland und seid Informatiker von Beruf. Wir sprechen jetzt über ___. | euch |

Artikel im Akkusativ (`fill`, chips: einen, eine, ein, keinen, keine, kein, den, die, das, meinen, mein):

| Sentence | Answer |
|---|---|
| Ich habe ___ Sohn und ___ Tochter. | einen / eine |
| Sven kauft ___ Rock, sondern eine Hose. | keinen |
| Der Schüler braucht ___ Buch. | ein |
| Mein Mitschüler ist sehr intelligent. Ich spreche jetzt über ___ Mitschüler. | meinen |
| Anna und Martin brauchen ___ Bücher, sondern Hefte. | keine |
| Ich brauche ___ Drucker, ___ Waschmaschine und ___ Auto. | einen / eine / ein |
| Meiner Meinung nach ist die Frau jung. Ich finde ___ Frau jung. | die |
| Der Computer ist nützlich beim Lernen. Ich finde ___ Computer nützlich beim Lernen. | den |
| Meiner Meinung nach ist das Auto schnell. Wie findest du ___ Auto? | das |
| Das sind zwei Bilder. Die Bilder sind teuer. Wir sprechen jetzt über ___ Bilder. | die |
| Ich frage weder ___ Informatiker noch ___ Automechaniker, sondern ich frage ___ Schüler. | den / den / den |
| Sie sprechen über ___ Mann, sondern über ___ Frau. | keinen / die (also accept: den / die) |

### Lesson 3.5 — Verben und Fragen

Verbs, including separable verbs (`fill`, typed: true):

| Sentence | Answer |
|---|---|
| Um 6 Uhr ___ wir gewöhnlich ___. (aufstehen) | stehen / auf |
| Um 7 Uhr ___ wir gewöhnlich zur Arbeit. (gehen) | gehen |
| Um 22 Uhr ___ wir gewöhnlich schon ___. (schlafen gehen) | gehen / schlafen |
| Er ___ zwei Töchter. (haben) | hat |
| Die Lehrer ___ in der Schule. (arbeiten) | arbeiten |
| ___ du immer schon um 6 Uhr ___? (aufstehen) | Stehst / auf |
| Du ___ keinen Kugelschreiber. (haben) Du ___ einen Kugelschreiber. (brauchen) | hast / brauchst |
| Die Kinder ___ nie um 24 Uhr ___. (schlafen gehen) | gehen / schlafen |
| Ihr ___ die Uhr nicht (kaufen), denn ihr ___ wenig Geld. (haben) | kauft / habt |
| Das Auto ___ viel Geld. (kosten) | kostet |

Make a question for the bold part (`build`, chips include distractor question words):

| Statement | Question |
|---|---|
| Mein Mann ist **33 Jahre alt**. | Wie alt ist dein Mann? |
| Es ist **fünf vor vier**. | Wie spät ist es? |
| Die Lehrerin spricht **über ihren Schüler**. | Über wen spricht die Lehrerin? |
| **Simone** ist Kellnerin von Beruf. | Wer ist Kellnerin von Beruf? |
| Jetzt sprechen wir **über die Autos**. | Worüber sprechen wir jetzt? |
| Die Waschmaschine kostet **1000 Euro**. | Wie viel kostet die Waschmaschine? |
| Ich stehe gewöhnlich **um 6 Uhr** auf. | Wann stehst du gewöhnlich auf? |
| Ich frage **den Lehrer**. | Wen fragst du? |
| Ich finde ihn **sehr jung**. | Wie findest du ihn? |
| Ich lerne Deutsch immer **am Abend**. | Wann lernst du Deutsch? |

Georgian hint to show: **Über wen?** is for people; **Worüber?** is for things.

### Lesson 3.6 — "Schon fertig?" and Wortschatz

Pick the right part (`choice`):

| Sentence | Options | Answer |
|---|---|---|
| Er hat eine Frau. Das ist ___ Frau. | seine / ihre | seine |
| ___ sprecht ihr? Wir sprechen über den Mann. | Über wen / Worüber | Über wen |
| Ich kaufe heute ___ Kugelschreiber. | ein / eine / einen | einen |
| Ich kaufe heute ___ Buch. | ein / eine / einen | ein |
| Ich kaufe heute ___ Drucker. | ein / eine / einen | einen |
| Ich kaufe heute ___ Uhr. | ein / eine / einen | eine |
| Er ist älter ___ ___ Sohn. | als/um + sein/seinen | als sein |
| Die Lehrer ___ ___ Schule. | arbeiten/lernen + zur/in der | arbeiten in der |
| ___ Streichhölzer sind billig. | Der / Die | Die |
| ___ sprecht ihr jetzt? Wir sprechen jetzt über Streichhölzer. | Über wen / Worüber | Worüber |
| Ich bin geschieden. Ich habe ___. | eine Frau / keine Frau mehr | keine Frau mehr |
| Sie hat zwei ___ und zwei ___. | Sohnen/Söhne + Tochter/Töchter | Söhne, Töchter |
| Dreiundzwanzig minus elf ist ___. | zehn / zwölf | zwölf |

Sentence building (`build` and `listen`):

- Meine Tochter ist Ärztin von Beruf.
- Wie spät ist es jetzt?
- Findest du das Auto billig oder teuer?
- Entschuldigung, hast du eine Uhr?
- Mein Mitschüler spricht gern über Autos.
- Ich brauche keinen Drucker, denn ich habe schon einen.
- Warum kauft ihr heute eine Waschmaschine?
- Er hört mich nicht.

Gegenteile (`match`): am Abend–am Morgen, ledig–verheiratet, noch–nicht mehr, jung–alt, teuer–billig, älter–jünger, die Tochter–der Sohn, schlafen gehen–aufstehen, Ich habe noch Geld.–Ich habe kein Geld mehr., langsam–schnell, wenig Geld–viel Geld, hier–dort, dick–dünn, der Mann–die Frau.

Was passt nicht? (`odd`; the odd one is in bold):

1. GESCHIEDEN – VERHEIRATET – **ALT** – VERWITWET (not a marital status)
2. DER KELLNER – DIE ÄRZTIN – **DIE KELLNERINNEN** – DIE INFORMATIKERIN (plural)
3. **BILLIG** – BRAUCHEN – KAUFEN – HABEN (not a verb)
4. WANN – ÜBER WEN – **HEUTE** – WORÜBER (not a question word)
5. AM ABEND – HEUTE – AM MORGEN – **ZURÜCK** (not a time expression)
6. JUNG – **TEUER** – 18 JAHRE ALT – ÄLTER (not about age)
7. ES IST HALB ZWEI – ES IST DREIZEHN UHR DREIßIG – **ES IST DREIZEHN NACH ZWEI** (a different time)
8. SECHZEHN UHR VIERZIG – **SECHZEHN NACH VIER** – ZWANZIG VOR FÜNF (a different time)

Berufe (`match` masculine↔feminine, and `fill` for the plural):

| Mann | Plural | Frau | Plural |
|---|---|---|---|
| der Lehrer | die Lehrer | die Lehrerin | die Lehrerinnen |
| der Schüler | die Schüler | die Schülerin | die Schülerinnen |
| der Informatiker | die Informatiker | die Informatikerin | die Informatikerinnen |
| der Kellner | die Kellner | die Kellnerin | die Kellnerinnen |
| der Automechaniker | die Automechaniker | die Automechanikerin | die Automechanikerinnen |
| der Arzt | die Ärzte | die Ärztin | die Ärztinnen |

---

## 7. Extras

- **Unit test ("მოდულის ტესტი"):** after each module, a 20-question boss lesson mixed from all lessons of that module, with 3 hearts only.
- **Wörterbuch screen:** all words from the content above with article, plural, and Georgian translation. Each word has a speaker button.
- **Settings:** sound on/off, typing mode on/off (typed answers vs. chips), reset progress (with a confirm dialog).

## 8. Definition of done

- `npm run dev` starts the app with no console errors.
- Every lesson listed above is playable from start to end, and every answer listed above is accepted.
- Progress survives a page reload.
- Works on a 375px phone screen and on desktop.
- Add a small self-check, `src/data/lessons.test.ts` (Vitest), that verifies every question has at least one answer and that every `fill` answer count matches its gap count.
