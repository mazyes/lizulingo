# LIZULINGO — Appwrite Prompt: accounts + cloud save

Connect the existing app to **Appwrite Cloud** (https://appwrite.io) so progress is saved online and syncs between
devices. Do not rebuild the app. Keep it **offline-first**: `localStorage` stays the main copy, so the app works
without internet and without an account. Appwrite is a sync layer on top.

## 0. Secrets: read this first

- The browser app needs **only** the endpoint and the project ID. These are public; put them in `.env.local` as
  `VITE_APPWRITE_ENDPOINT` and `VITE_APPWRITE_PROJECT_ID` and add a `.env.example` with empty values.
- The **API key is a server secret.** Anything with the `VITE_` prefix ends up in the public JS bundle, so the key
  must **never** have that prefix, never be imported in `src/`, never be committed, never be printed in logs.
  Use it only in the setup script (section 2) as `APPWRITE_API_KEY` in `.env.local`.
- Check that `.env.local` is in `.gitignore` before writing anything.
- After the setup script has run, the app works without the key. Tell me which scopes the key needs
  (databases/tables read+write) so I can give it the smallest scopes.

## 1. SDK

- Browser: `appwrite` (Web SDK). Setup script: `node-appwrite`. Install the current versions.
- Newer Appwrite versions use the **TablesDB** API (databases → tables → columns → rows). The older
  Databases/collections/documents API is deprecated. Check what the installed SDK exports and use `TablesDB`
  if it exists; otherwise use `Databases`. Use one wrapper file, `src/lib/appwrite.ts`, so the rest of the
  app never calls the SDK directly.
- In the Appwrite console, a **Web platform** must exist for `localhost` and for the deployed domain, or the
  browser gets CORS errors. Tell me which hostnames to add (I add them myself).

## 2. Setup script (creates the database once)

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

## 3. Accounts

- **Guest first:** on first launch, nothing changes. The app works locally. A "☁️ შეინახე ონლაინ" (save online)
  card on Home and in Settings explains the benefit in Georgian.
- **Sign up / log in** with email + password (Appwrite Account). Optional: Google OAuth if I enable it in the
  console. All screens in Georgian: "რეგისტრაცია", "შესვლა", "პაროლის აღდგენა" (password recovery via
  Appwrite's recovery email), "გასვლა".
- Show clear Georgian errors (wrong password, email taken, no internet, too many attempts).
- The session stays after reload (Appwrite handles cookies/local session). Logout keeps a local copy of the progress.
- Settings: "ანგარიშის წაშლა" (delete account data): deletes the user's `progress` and `profiles` rows after a
  confirm dialog.

## 4. Sync rules

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

## 5. Leaderboard (makes it more fun)

- A "🏆 ლიგა" tab: top 20 users by `weeklyXp` this week, the learner's own rank, and their friends' names
  (display name only).
- On sign-up, the learner picks a display name (validated: 3–20 chars, no email-like text) and a mascot color.
- `weeklyXp` resets when `weekStart` is older than this Monday (handled by the client on its own row).
- Note: the client writes its own XP, so the leaderboard can be cheated. That is acceptable for this app;
  add a `ponytail:` comment saying an Appwrite Function should compute XP server-side if that ever matters.

## 6. Tests and done

- Unit tests for the merge function (cloud newer, local newer, empty cloud, empty local) and for the sync queue
  (offline → online). Mock the Appwrite wrapper; tests never call the real server.
- `npm run build` passes, and `grep` on `dist/` finds **no** API key (add this check as a script: `npm run check:secrets`).
- Manual check: play on phone as guest → sign up → progress uploaded → log in on desktop → same progress.
  Turn off Wi-Fi, play a lesson, turn it on → syncs.
- Without `VITE_APPWRITE_*` env vars, the app still runs fully local and hides all cloud UI.
