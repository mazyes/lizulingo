# LIZULINGO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build LIZULINGO, a high-taste Duolingo-style German learning web app for Georgian speakers (A1 level, textbook "deutsch Buch 1" Modul 2 & 3) using Vite, React, TypeScript, Tailwind CSS, Web Speech API, and Web Audio API.

**Architecture:** Single-page application with modular state (`useGameState`), local storage persistence with error handling, Web Audio sound engine, Web Speech TTS integration, custom SVG mascot "Lizi" with 3 emotion states, responsive Duolingo-like winding lesson path, interactive lesson runner supporting 9 question types (choice, fill, build, truefalse, odd, match, listen, dialog, wordsearch), dictionary (Wörterbuch), mistake review, and Vitest content validation.

**Tech Stack:** React 19 / 18, Vite, TypeScript, Tailwind CSS, Lucide React, Canvas Confetti, Vitest.

**Spec:** `f:\Projects\lizulingo\LIZULINGO_prompt.md`

## Global Constraints
- Single-page web app with Vite + React + TypeScript + Tailwind CSS.
- No backend and no login. All progress stored in `localStorage` wrapped in try/catch.
- All exercise content in `src/data/lessons.ts` typed with shared `Question` union type.
- Mobile-first layout (360px+), responsive desktop, no horizontal scroll.
- Browser Web Speech API (`speechSynthesis`, voice `de-DE`) with fallback.
- Original SVG mascot "ლიზი" (fox) with happy, sad, celebrating moods.
- Duolingo-feel 3D buttons, Web Audio API sound effects, confetti, light/dark mode.
- 9 question types strictly implemented with flexible answer normalization.
- Vitest test suite `src/data/lessons.test.ts` validating question schemas and gap matches.

---

### Task 1: Project Scaffolding & Tooling
- Initialize Vite React TypeScript project.
- Install Tailwind CSS, lucide-react, canvas-confetti (@types/canvas-confetti), vitest.
- Configure tailwind.config.js, index.html with Google Fonts (Nunito, Noto Sans Georgian).

### Task 2: Audio Synthesis & Sound Effects Engine
- Implement Web Audio API synthesizer (`src/utils/sound.ts`) for chime (correct), buzz/bonk (wrong), fanfare (complete).
- Implement Web Speech TTS utility (`src/utils/tts.ts`) with German voice detection and fallbacks.

### Task 3: Content Model & Complete Dataset
- Define TypeScript types (`src/types/lesson.ts`) for all 9 question types, modules, lessons, and progress.
- Build `src/data/lessons.ts` containing the full curriculum from Modul 2 (2.1-2.5 + Boss Test) and Modul 3 (3.1-3.6 + Boss Test) and vocabulary dictionary.
- Create Vitest test file `src/data/lessons.test.ts` to verify data integrity. Run and pass tests.

### Task 4: State Management & Persistence
- Implement `src/context/GameContext.tsx` or custom hook managing XP, streak, hearts (with 30m recovery), daily goal (30 XP), completed lessons, crowns, mistakes pool, audio settings, dark mode.
- Safely persist and restore from `localStorage` with try/catch.

### Task 5: Design System, Mascot & Layout Components
- Build inline SVG Mascot `Lizi` (`src/components/mascot/LiziMascot.tsx`) with happy, sad, and celebrating states.
- Build TopBar (Streak flame, Hearts count with timer, XP progress ring, Daily Goal, Theme toggle, Settings button).
- Build Bottom Navigation (Learn/Path, Review Mistakes, Wörterbuch, Settings).

### Task 6: Question Runners for All 9 Types
- `ChoiceQuestion.tsx` (Single choice with 3D option buttons)
- `FillQuestion.tsx` (Sentence with gaps, word chips or typed input, multiple gaps support)
- `BuildQuestion.tsx` (Sentence builder with tapped chips in order + distractors)
- `TrueFalseQuestion.tsx` (Richtig / Falsch)
- `OddQuestion.tsx` (Was passt nicht? with explanation)
- `MatchQuestion.tsx` (5 pairs matching with interactive selection)
- `ListenQuestion.tsx` (TTS replay + chip sentence builder)
- `DialogQuestion.tsx` (Dialog bubble view + follow-up question)
- `WordSearchQuestion.tsx` (Interactive 8x8 letter grid for Lesson 2.5 colors)

### Task 7: Lesson Runner & Interactive Feedback
- `LessonScreen.tsx`: progress bar, hearts decrement, feedback bottom sheet (green praise / red correction with Georgian explanation), repeat missed questions at end of lesson, exit confirmation.
- Results screen: Mascot celebrating, XP earned, accuracy percentage, time taken, confetti.

### Task 8: Home Path, Modules & Screens
- Home Path (`HomeScreen.tsx`): winding vertical path, Module 2 and Module 3 banners, locked/unlocked states, crowns, boss module tests.
- Mistakes Review Screen ("შეცდომების გამეორება"): review wrong answers to regain hearts.
- Wörterbuch Screen: search, filter by module, Georgian translations, TTS audio buttons.
- Settings Screen: audio toggle, typing mode toggle, theme switch, reset progress confirmation modal.

### Task 9: Verification, Polish & Launch Checks
- Run Vitest tests to ensure all content passes schema and gap checks.
- Build test (`npm run build`).
- Verify responsiveness (375px mobile and desktop) and dark mode styling.
