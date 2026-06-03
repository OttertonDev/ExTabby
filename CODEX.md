# Agent Handoff: ExTabby

## Project Snapshot

ExTabby is the Extended Companion version of the Tabby Android app, an academic planning app located locally at `E:\GitHub\Tabby-Schedule`. It is a React + TypeScript + Vite single-page app backed by Firebase Auth and Firestore, with PWA support via `vite-plugin-pwa`.

The current web app is mostly a read-only synced view of Android app data:
- Google sign-in gates the app.
- Timetable, assignments, subjects, and profile/preferences are read from per-user Firestore paths.
- TCAS is currently a mock/sample-data page.
- Settings shows account details and Android sync status.

Treat the Android app as the canonical product and data producer. ExTabby should extend and mirror Tabby rather than inventing incompatible schemas, terminology, or behavior.

This directory is not currently a Git repository. `node_modules/` and `dist/` are present locally.

## Related Android Project

Canonical app location:

```text
E:\GitHub\Tabby-Schedule
```

Important Android files for cross-project work:

- `app/src/main/java/com/ottertondev/tabby/data/online/FirestoreSyncService.kt`: writes the Firestore documents consumed by ExTabby.
- `app/src/main/java/com/ottertondev/tabby/data/online/FirebaseGoogleAuthClient.kt`: Android Google/Firebase sign-in for web sync.
- `app/src/main/java/com/ottertondev/tabby/data/model/SchoolClass.kt`: Room entity for timetable classes.
- `app/src/main/java/com/ottertondev/tabby/data/model/StudentTask.kt`: Room entity for tasks.
- `app/src/main/java/com/ottertondev/tabby/data/model/Subject.kt`: Room entity for subjects.
- `app/src/main/java/com/ottertondev/tabby/data/preferences/UserPreferences.kt`: DataStore preferences, including Web Tabby sync flags.
- `app/src/main/java/com/ottertondev/tabby/feature/road/*`: real Road to University / TCAS models, parser, public-data client, and route.

Android project shape:

- Kotlin Android app using Jetpack Compose, Material 3 Expressive, Room, DataStore, WorkManager, Firebase Auth, and Firestore.
- Package/application ID: `com.ottertondev.tabby`.
- Local DB: Room database named `student_planner.db`.
- Android sync is opt-in via `webTabbySyncEnabled` in `UserPreferences`.
- Android tracks local sync time separately as `webTabbySyncLastSyncedAt`; Firestore receives `lastSyncedAt` in `profile/preferences`.

## Common Commands

```bash
npm run dev
npm run build
npm run preview
npm run lint
firebase deploy
```

Use Node 18+ per README. The app needs a valid `.env` based on `.env.example` for Firebase.

After making code or asset changes, build and push the result to Firebase Hosting when feasible. Current Firebase project config points at `web-tabby`. If deploy fails with expired Firebase CLI credentials, ask the user to run `firebase login --reauth`, then retry `firebase deploy`.

## Tech Stack

- React 19, React DOM 19
- TypeScript 6
- Vite 8
- React Router 7
- Firebase 12: Auth, Firestore, Analytics
- Tailwind CSS 4 with a custom Material 3-ish theme
- Framer Motion
- Material Symbols Rounded icons, using Android symbol ligature names as the source of truth
- shadcn-style local UI primitives under `src/components/ui`

Path alias:

```ts
@/* -> src/*
```

## App Entry Points

- `src/main.tsx`: creates the React root and renders `App`.
- `src/App.tsx`: auth gate, router, login page, animated routes.
- `src/components/layout/AppLayout.tsx`: persistent header and app shell.
- `src/components/layout/NavigationRail.tsx`: desktop side rail and mobile bottom nav.

Routes:

- `/` redirects to `/timetable`
- `/timetable` -> `TimetablePage`
- `/assignments` -> `AssignmentsPage`
- `/tcas` -> `TCASPage`
- `/settings` -> `SettingsPage`

Unauthenticated users always see the login page.

## Firebase And Data Shape

Firebase initialization lives in `src/config/firebase.ts`.

Required env vars include:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- optional/currently used: `VITE_FIREBASE_DATABASE_URL`, `VITE_FIREBASE_MEASUREMENT_ID`

Auth helpers:

- `src/lib/auth.ts`: Google popup sign-in and sign-out.
- `src/hooks/useAuth.ts`: wraps `onAuthStateChanged`.

Current live sync hooks:

- `src/hooks/useFirestoreSync.ts`
- Types for these hooks are in `src/types/firestore.ts`.

Important Firestore paths used by current UI:

- `users/{uid}/profile/preferences`
- `users/{uid}/subjects`
- `users/{uid}/classes`
- `users/{uid}/tasks`

These are written by Android `FirestoreSyncService.syncAllData()` as:

- `users/{uid}/profile/preferences` document with profile, academic, UI, reminder, and sync metadata.
- `users/{uid}/classes/class_{localId}` documents.
- `users/{uid}/tasks/task_{localId}` documents.
- `users/{uid}/subjects/subject_{localId}` documents.

Android field details to preserve:

- `localId` is the Android Room primary key copied into Firestore. Firestore document IDs also include it with prefixes.
- Class and subject `color` values are Android `Long` color values, not web hex strings.
- Task `priority` is an integer: `0 = low`, `1 = medium`, `2 = high`.
- Task `type` is a string, currently `homework` or `exam`.
- Days use `1 = Monday` through `7 = Sunday`.
- Times are stored as minutes from midnight; task due dates also carry `dueAtMillis`.

There is also a service layer in `src/lib/firestore.ts` using `src/types/models.ts`, but it does not match the currently rendered Android-compatible shapes in all details. For example:

- `useFirestoreSync.ts` expects Android-style numeric colors and local numeric IDs.
- `src/lib/firestore.ts` expects web-style hex colors for some models and uses `users/{uid}/preferences` instead of `users/{uid}/profile/preferences`.

Before adding write behavior, decide which schema is canonical and reconcile this mismatch.

If ExTabby starts writing back to Firestore, it must either write Android-compatible documents or coordinate a matching Android migration. Otherwise the Android app may silently overwrite or ignore web changes during the next sync.

## Page Notes

`TimetablePage`

- Reads classes via `useClasses`.
- Sorts classes in the hook by `dayOfWeek`, then `startMinutes`.
- Filters out `isBreak` entries in the page.
- Converts Android long color values to hex with `colorToHex`.

`AssignmentsPage`

- Reads tasks via `useTasks`.
- Splits pending/completed by `isComplete`.
- Priority is numeric: `0 = low`, `1 = medium`, `2 = high`.
- Uses Framer Motion heavily.
- Currently cards look clickable but do not mutate or navigate.

`TCASPage`

- Entirely mock data. Do not assume it reflects real Firestore data.
- The Android app has the real Road to University implementation under `feature/road`.
- Android TCAS source is the public myTCAS S3 dataset at `https://my-tcas.s3.ap-southeast-1.amazonaws.com/mytcas`.
- Android parses universities, courses/programs, round projects, seats, GPAX, scores, conditions, and links in `TcasDataParser.kt`.
- If replacing the mock web TCAS page, use the Android model/parser behavior as the reference.

`SettingsPage`

- Reads preferences, tasks, classes, and subjects.
- Uses `preferences.lastSyncedAt` as the sync-connected signal.
- Contains user-facing Android connection instructions.

## Styling Conventions

- Global theme is in `src/index.css`.
- Tailwind config is in `tailwind.config.js`.
- Uses CSS custom properties such as `--background`, `--primary`, `--card`, and matching Tailwind color tokens.
- Typography tokens like `text-headline-large`, `text-title-medium`, and `font-display` are defined in Tailwind config.
- UI primitives live in `src/components/ui`; prefer these over ad hoc controls.
- Tabby-specific primitives live in `src/components/tabby/TabbyPrimitives.tsx`; keep using these for page headers, section shells, empty states, and Material Symbols.
- Icons are Material Symbols Rounded ligatures, not lucide. Keep Android symbol names such as `calendar_clock`, `assignment`, `school`, `settings`, and `logout` in React. If a symbol does not render, treat it as a ligature-name mismatch and swap to the official Material Symbols name rather than changing icon families.
- The local Android Material Symbols TTF is copied to `public/tabby-assets/fonts/material-symbols-rounded.ttf`, but it is about 15 MB and causes slow first icon paint if loaded directly. `index.html` requests the Google Fonts Material Symbols subset with `icon_names=...` and `display=block`; `src/index.css` keeps the local file only as `"Material Symbols Rounded Local"` fallback.
- When adding new Material Symbols, add the ligature name to the Google Fonts `icon_names` list in `index.html`; otherwise the icon may fall through to the slow local fallback or render as blank/text while the font resolves.
- For icon font rendering, preserve `.material-symbol` in `src/index.css`: `font-family: "Material Symbols Rounded", "Material Symbols Rounded Local"`, `font-feature-settings: "liga" 1`, `font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24`, `line-height: 1`, and inline-flex centering.

## Known Sharp Edges

- README and `CLAUDE.md` contain some stale wording, including older React version references and mojibake in tree diagrams.
- PWA manifest references PNG icons (`pwa-192x192.png`, `pwa-512x512.png`) that are not visible in `public/`; current `public/` only has `favicon.svg` and `icons.svg`.
- `enableIndexedDbPersistence(db)` can warn/fail in multiple tabs; this is handled with console warnings only.
- Firebase Analytics is initialized when `window` exists, but missing/invalid config will still make Firebase initialization fail at runtime.
- No formal test suite is configured beyond lint/build scripts.
- `dist/` is checked into the local directory but should be treated as build output unless the user says otherwise.
- Android README/INDEX files have mojibake in some emoji/tree output; prefer source files over prose when exact details matter.
- The Android app's `google-services.json` is optional at build time, but Firebase/Auth/Firestore sync needs proper Firebase configuration to work.

## Working Guidance For Future Agents

- Read the current file before editing; this project is small and conventions are mostly implicit.
- Prefer `src/hooks/useFirestoreSync.ts` and `src/types/firestore.ts` for the current displayed Android sync data unless intentionally refactoring the data layer.
- When behavior should match Tabby Android, inspect `E:\GitHub\Tabby-Schedule` first. The Android app is the source of truth for planner semantics, sync payloads, and TCAS behavior.
- Keep changes scoped. Avoid broad schema rewrites without first checking Android sync compatibility.
- Use `@/` imports where nearby files already do; some older files still use relative imports.
- For UI, preserve the quiet app-shell style: navigation rail/bottom nav, cards for repeated items, restrained Material-inspired spacing and type.
- Run `npm run build` after TypeScript or route/data changes when feasible. Run `npm run lint` after broader edits.
- Talk to users like a friends, with slangs and profanity bits preferred.