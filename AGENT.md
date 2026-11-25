# AGENT.md

A brief for AI coding assistants working in this repo. The full details are in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## What this is

GymTrack is an offline-first workout tracker PWA: React 19, TypeScript, Vite 8, Dexie (IndexedDB), Tailwind CSS 4 and React Router 7. There's no backend, and all data lives in the browser.

## Commands

```bash
yarn dev        # dev server (service worker disabled)
yarn verify     # tsc + eslint + vitest; must pass before you finish
yarn build      # tsc -b && vite build
```

Use Yarn 1 (`corepack enable`). Don't add a `package-lock.json`.

## Layering (enforced by convention)

```
shared ← domain ← data ← features ← app
```

- `src/domain/` is pure: types and logic only. No React, no Dexie, no side effects. Put new business logic here and unit-test it.
- `src/data/` is the only place that imports `@/data/db`. Screens and components never touch Dexie directly.
- `src/features/<name>/` contains `screens/` (lazy route targets), `components/` and `hooks/`.
  - Reads go through a feature hook that wraps `useLiveQuery`.
  - Writes call repository functions from event handlers.
  - Features don't import each other's internals; use the other feature's `index.ts` (e.g. `@/features/rest-timer`).
  - App-wide UI state (toasts, rest timer) uses `shared/lib/createStore.ts`; call `showToast()` / `startRestTimer()` from anywhere.
- Imports use `@/…` across modules and relative paths within a module or feature.

## Product rules (don't break these)

- `workoutlogs` are immutable snapshots. Completing a set copies its values; template edits never change old logs.
- A set is completed at most once per local calendar day (transactional check in `logExerciseSetCompletion`).
- Deleting a set keeps its logs. Deleting an exercise deletes its logs. Deletes are instant with an Undo toast (no confirm dialogs).
- Weeks run Sunday to Saturday in local time (`startOfWeek`). Day-strip progress resets on Sunday.
- `sortOrder` orders exercises within a day.
- Seeding the library only inserts missing ids and never overwrites user edits.

## Changing stored data

1. Update the type in `src/domain/models/`.
2. If an index is needed, add a schema string in `src/data/schema.ts`.
3. Add a new `this.version(N + 1)` in `src/data/db.ts`, with `.upgrade()` if existing rows need changes. Never edit an existing version.
4. Add a repository test (`fake-indexeddb`; call `resetDatabaseBeforeEach()`).

## UI conventions

- Minimal and mobile-first, with three tabs: Today, Progress and Settings.
- Colours come only from the CSS variables in `src/index.css` (light and dark). No hard-coded colours.
- Shared primitives are in `src/shared/ui`. The muscle-map components are in `src/shared/muscle-map`.
- If a UI change alters what the store screenshots show, regenerate them with `yarn pwa:screenshots`.

## Routes

`/` → `/days/<today>` · `/days/:day` · `/days/:day/add-exercise` · `/exercises/:id` · `/progress` · `/settings`. Any other URL redirects to `/`.
