# AGENT.md

## Purpose

GymTrack is a workout-tracking PWA for planning recurring gym days and logging completed sets.

- The home screen shows Sunday through Saturday.
- Each weekday stores reusable exercise templates.
- Each exercise template contains planned sets.
- Completing a set writes a dated snapshot log for that set.

## Main User Flow

1. Open the home screen and choose a weekday.
2. Add one or more exercises to that day.
3. Add planned sets to each exercise.
4. Reuse the set values on future workouts as the starting template.
5. On workout day, adjust values if needed.
6. Mark sets complete to save snapshot logs for that day.
7. Open exercise history to review past performance.

## Product Rules

- Set inputs on the day screen are reusable template data.
- A set can be completed at most once per local calendar day.
- Completing a set stores a snapshot of the current values at that moment.
- Old logs must not change when template values change later.
- Home-screen progress is intended to be week-scoped and reset every Sunday.
- Exercise order is day-scoped and persisted.
- Set reorder does not exist yet.

## Current Routes

- `/` - weekly home screen
- `/days/:day` - workout-day planner and template editor
- `/exercises/:exerciseId/history` - exercise history

## Current Storage Model

IndexedDB is used through Dexie. The database name is `GymTrack`.

### `exercises`

One record per exercise template.

Fields:

- `id`
- `day`
- `sortOrder`
- `title`
- `exerciseType`
- `exerciseUnit`
- `plannedDurationMin`
- `exerciseSets`

### `exerciseSets`

Nested inside an exercise template.

- Each set has a stable `id`.
- Reps exercises use `weight` and `reps`.
- Timed exercises use `time`.
- These values are the reusable template shown on future workouts.

### `workoutLogs`

One record per completed set per day.

- `id`
- `exerciseId`
- `exerciseSetId`
- `completedAt`
- `weight`
- `reps`
- `time`

There is no separate workout-session table. Session history is inferred from dated set logs.

## Current Database Notes

- Dexie setup lives in `src/app/db/db.client.ts`.
- `exercises` schema is versioned and now includes persisted `sortOrder`.
- The database upgrade backfills `sortOrder` for older local data.
- Day-based completion uses local calendar boundaries from `getDayBounds()`.

## Current App Structure

### App shell

- Router: `src/app/AppRouter.tsx`
- App layout: `src/app/AppLayout.tsx`

### Shared layer

- Shared UI primitives: `src/shared/ui/*`
- Shared constants: `src/shared/constants/weekdays.ts`

### Features

- Week plan: `src/features/week-plan/*`
- Exercises: `src/features/exercises/*`
- Exercise history: `src/features/exercise-history/*`
- PWA helpers: `src/features/pwa/*`

### Data layer

- Models: `src/app/db/models/*`
- Schemas: `src/app/db/schema/*`
- Repositories: `src/app/db/repositories/*`
- Utilities: `src/app/db/utils/*`

## Important Screen And Component Map

- Week home screen: `src/features/week-plan/screens/WeekPlanScreen.tsx`
- Weekday summary list/card: `src/features/week-plan/components/*`
- Workout day screen: `src/features/exercises/screens/WorkoutDayScreen.tsx`
- Add exercise form: `src/features/exercises/components/AddExerciseForm.tsx`
- Exercise card stack: `src/features/exercises/components/ExerciseCard/*`
- Exercise history screen: `src/features/exercise-history/screens/ExerciseHistoryScreen.tsx`
- iOS install helper: `src/features/pwa/components/IosInstallPrompt.tsx`

## Current Exercise UI

### Exercise card header

The exercise header uses a two-column mobile-first layout.

- Left column: a vertical exercise-type tile with a larger icon above `REPS` or `TIME`.
- Right column row 1: exercise title.
- Right column row 2: metadata line with unit and planned set count.
- Right column row 3: compact icon-only actions.

Current header actions:

- View history
- Move exercise up
- Move exercise down
- Expand or collapse

### Set layout

The old HTML table was removed.

Sets now render as stacked mobile cards instead of table rows.

Each set card uses two levels:

- Top row: `Set N`, compact previous-performance text, delete button.
- Bottom row: editable value inputs and a large `Complete` or `Undo` button.

Rep-based sets show:

- weight input with unit suffix
- reps input with `reps` suffix
- previous performance formatted like `15kgx10`

Time-based sets show:

- time input with unit suffix
- previous performance formatted like `30sec`

Completed sets have a clear tinted success state.

## Current Repository API

### Exercise repository

File: `src/app/db/repositories/exercise.repository.ts`

Key functions:

- `createExerciseTemplate()`
- `getExerciseById()`
- `listExerciseTemplates()`
- `listExercisesForDay()`
- `updateExerciseTemplate()`
- `removeExerciseTemplate()`
- `addExerciseTemplateSet()`
- `updateExerciseTemplateSet()`
- `removeExerciseSet()`
- `moveExerciseTemplate()`

### Workout log repository

File: `src/app/db/repositories/workout-log.repository.ts`

Key functions:

- `listExerciseHistory()`
- `listCompletedSetIdsForExerciseDay()`
- `logExerciseSetCompletion()`
- `removeExerciseSetCompletion()`
- `deleteLogsByExercise()`
- `deleteLogsByExerciseSet()`

### Week plan repository

File: `src/app/db/repositories/week-plan.repository.ts`

Key function:

- `listWeekPlanSummaries()`

## How The Current App Works

- The home screen reads exercise templates and logs, then builds weekday summaries.
- A workout-day screen shows all templates for that day ordered by `sortOrder`.
- New exercises are appended to the end of that day.
- Move up/down updates persisted `sortOrder` within the same day.
- Expanding an exercise reveals its set cards.
- Editing a set updates template data in `exercises`.
- Completing a set writes a snapshot log to `workoutLogs` if that set has not already been completed today.
- Undo removes that set completion for the current day.
- Exercise history groups logs by date and shows the stored snapshot values.
- `Previous` performance in the set UI is derived from the latest saved log for that specific set.

## PWA Notes

- The app uses `vite-plugin-pwa` and registers a service worker in `src/main.tsx`.
- Netlify config for the manifest and service worker lives in `netlify.toml`.
- Android browsers may show a native install prompt.
- iOS does not provide the same automatic install prompt flow.
- iOS installation is manual through the browser share sheet and `Add to Home Screen`.
- The app now includes a global iOS-only helper banner in `IosInstallPrompt.tsx`.
- That helper only shows when the app is running on iOS and is not already in standalone mode.
- The helper is dismissible and mounted from `AppLayout.tsx`.
- If users do not see `Add to Home Screen`, the intended guidance is to open the app in Safari.

## Important Technical Notes

- `workoutLogs` is append-only snapshot data.
- Old logs should never be retroactively mutated.
- Deleting an exercise currently also deletes its logs.
- Deleting a set currently also deletes logs for that set.
- The current Apple touch icon asset exists, but it is `192x192`; if polishing iOS install assets later, consider shipping a dedicated `180x180` touch icon.

## Known Gaps Or Mismatches

- Weekly progress on the home screen still does not match the intended Sunday-to-Saturday reset rule.
  - Current code in `src/app/db/repositories/week-plan.repository.ts` derives progress from the latest logged workout date for that weekday.
  - Intended behavior is week-scoped progress that resets every Sunday.
- There is still no UI for renaming exercises.
- There is still no UI for reordering sets.
- There are no automated tests configured in the repo right now.

## Repo Health Notes

As checked on 2026-06-02:

- `yarn build` passes.
- The app has been refactored away from the old `src/pages/*` and `src/components/*` feature files into the current `src/features/*` and `src/shared/*` structure.

## Guidance For Future Changes

- Keep `workoutLogs` append-only snapshot data.
- Do not mutate old logs when template values change.
- Preserve day-scoped exercise ordering through `sortOrder`.
- Any future progress logic should use Sunday-to-Saturday week boundaries.
- If exercise delete behavior changes, decide explicitly whether history should be preserved or deleted.
- If iOS install UX is changed, keep the distinction clear between Android automatic prompts and iOS manual share-sheet installation.
