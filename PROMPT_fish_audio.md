# LIZULINGO — Prompt: generate missing German voices with Fish Audio

```
FISH_API_KEY = PASTE_YOUR_KEY_HERE
```

## 0. Handle the key first

1. Take the key from the line above and write it into `.env.local` as `FISH_API_KEY=<key>` (create the line if it
   is missing; keep the other lines). Check that `.env.local` is in `.gitignore`.
2. Never commit the key, never print it in logs or in your reply, never put it in `src/` or in a `VITE_` variable.
   Do not copy this prompt file into the repo with the key inside (if this file is in the repo, replace the key
   with `PASTE_YOUR_KEY_HERE` before you commit).

## 1. Task

Every German text the app can speak must have an MP3. Generate **only the ones that do not have a file yet**,
using the Fish Audio text-to-speech API. Do not rebuild anything; extend `scripts/generate-audio.ts`.

How it works today (keep all of this):
- `scripts/generate-audio.ts` walks `lessons` and `dictionaryEntries`, collects every spoken text, skips Georgian,
  and picks the voice per text: `speakerVoice(speaker)` for dialog lines, `sentenceVoice(text)` for everything
  else (`src/utils/speakerVoice.ts`). Voices are `'default'` (male) and `'female'`.
- File name = `computeAudioHash(text, voice)` (`src/utils/audioHash.ts`) → `public/audio/<hash>.mp3`.
  The app (`src/utils/tts.ts`) uses the same hash, so **do not change the hash, the voice keys, or the text
  normalization** — existing files must keep working.
- After a run it writes `public/audio/manifest.json` (list of hashes). The app plays an MP3 only if its hash is
  in the manifest; otherwise it uses the browser voice.
- `--dry` counts texts and characters without calling any API. `--limit N` generates at most N files.

## 2. What to build

1. **Provider switch.** Add Fish Audio as a provider next to ElevenLabs:
   `npm run audio` uses Fish Audio when `FISH_API_KEY` is set, otherwise ElevenLabs. A flag `--provider fish|eleven`
   overrides it.
2. **Fish Audio call.** Check the current API in the official docs (https://docs.fish.audio) before coding; do not
   guess. Expected shape: `POST https://api.fish.audio/v1/tts`, header `Authorization: Bearer <key>`, JSON body with
   `text`, `reference_id` (the voice model id), `format: "mp3"`; the response body is the audio. Save it as the MP3.
3. **German voices.** Put the voice ids in `scripts/voices.json` under a `fish` key:
   `{ "fish": { "default": "<male id>", "female": "<female id>" }, "eleven": { ...existing... } }`.
   Find two **native German** voices in Fish Audio's voice library (one clear adult male, one clear adult female,
   neutral standard German, good for language learners; no celebrity or cloned-real-person voices). Tell me which
   two you picked, with their names and links, before the big run.
4. **Test first.** Run `npm run audio -- --dry`, then generate 3 files with `--limit 3` (one male sentence, one
   female dialog line, one single word). Check that each file is a valid MP3 and longer than 0.3 s. Stop and tell me
   if the API returns an auth, quota or payment error; do not retry in a loop.
5. **Generate everything that is missing.** Then run `npm run audio`. Rules:
   - Skip texts whose file already exists (no credits spent twice).
   - Throttle and retry: max 2 requests at a time, retry a failed request up to 3 times with backoff on 429/5xx,
     stop the whole run on 401/402/403.
   - A failed text never writes an empty or partial file (write to a temp name, rename when complete).
   - Print a summary at the end: generated, skipped, failed (with the failed texts), characters used.
6. **Coverage check.** Add `npm run audio:check` (no API calls): lists every spoken text that has no MP3 and exits
   with code 1 if any is missing. Run it at the end; it must report 0 missing.
7. **Make the collector complete.** Compare what the script collects with every `tts.speak(...)` call in `src/`
   (dictionary words with article, teach card words and examples, choice prompts, fill sentences with `___` → `...`,
   build/listen/translate/speak targets, statements, dialog lines, picture words, word-search words, and any new
   question types or generated questions from `src/data/expand.ts` if it exists). If the app can speak a text the
   script does not collect, fix the collector. Add a test that fails when a lesson contains a spoken text that the
   collector misses.
8. **Optional, ask me first:** `--all` regenerates every file with Fish Audio so all voices sound the same
   (the 426 existing files are ElevenLabs voices with an American accent). Tell me the character count from
   `--dry` before running it; do not run it without my yes.

## 3. After generation

- Commit `public/audio/*.mp3` and `public/audio/manifest.json` (Vercel deploys from Git) together with the script
  changes. Do not commit `.env.local`.
- Push to `master`, wait for the deploy, then check on the live site that `/audio/manifest.json` has the new count
  and one new MP3 URL returns `200 audio/mpeg`.
- Whenever lessons change later, `npm run audio` must be the only step needed to fill the gaps. Add this to the
  README in one short section.

## 4. Done when

- `npm run audio:check` reports 0 missing.
- Female speakers and female first-person sentences use the female voice; everything else the male voice.
- No key in the repo, the bundle, or the logs (`grep -r` the key prefix over `dist/` and the repo returns nothing).
- `npm run build` and `npx vitest run` pass; the live site plays the new voices on iPhone Safari.
