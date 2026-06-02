# AGENT.md

## Purpose

GymTrack is a workout record-keeping PWA.

- The home screen lists all weekdays from Sunday through Saturday.
- Each weekday stores reusable exercise templates.
- Each exercise template contains multiple planned sets.
- Pressing the check icon on a set creates a dated workout log entry for that specific set.

## Main User Flow

1. Open the home screen and choose a weekday.
2. Add exercises to that weekday.
3. Add one or more sets to each exercise.
4. Use the set inputs as reusable template values the user expects to see next time.
5. On workout day, review or adjust those template values.
6. Tap the check icon to mark each finished set complete for that day.
7. Open exercise history to review logged performance over time.

## Product Rules

- Set inputs on the day screen are reusable template data.
- A set can be completed at most once per calendar day.
- Completing a set should store a snapshot of the current values at that time.
- Old logs must stay unchanged even if the exercise template changes later.
- Home-screen progress should be week-scoped and reset every Sunday.
- Exercise rename, delete, reorder, and set reorder are desired later, but not the current priority.

## Current Routes

- `/` - weekly split home
- `/dayscreen/:day` - weekday template editor and workout screen
- `/logscreen/:excid` - exercise history

## Current Storage Model

IndexedDB is used through Dexie. The database name is `GymTrack`.

### `exercises`

One record per exercise template.

Fields:

- `id`
- `day`
- `title`
- `exerciseType`
- `exerciseUnit`
- `plannedDurationMin`
- `exerciseSets`

### `exerciseSets`

Nested inside an exercise record.

- Each set has a stable `id`.
- Reps-based sets use `weight` and `reps`.
- Timed sets use `time`.
- These values act as the reusable template the user sees on future workouts.

### `workoutLogs`

One record per completed set per day.

- `id`
- `exerciseId`
- `exerciseSetId`
- `completedAt`
- `weight`
- `reps`
- `time`

There is no separate workout-session table right now. Session history is inferred from dated set logs.

## Implementation Map

- Router: `src/app/AppRouter.tsx`
- App shell: `src/app/AppLayout.tsx`
- Home screen: `src/pages/Home/index.tsx`
- Weekday cards and summary UI: `src/components/WeekdayList/*`
- Day screen: `src/pages/DayScreen/index.tsx`
- Add exercise form: `src/components/AddExercise/index.tsx`
- Exercise card and set row: `src/components/ExerciseCard/*`
- Exercise history: `src/pages/LogScreen/index.tsx`
- Dexie setup: `src/app/db/index.ts`
- Table types: `src/app/db/table/*`
- Repository logic: `src/app/db/repositories/*`
- Day-boundary helper: `src/app/db/utils/date.ts`

## How The Current App Works

- Home reads all exercises and logs, then computes weekday summaries.
- A weekday screen shows all exercise templates assigned to that day.
- Creating an exercise starts with an empty `exerciseSets` array.
- Expanding an exercise reveals its planned sets.
- Editing a set updates the template inside `exercises`.
- Pressing complete creates a `workoutLogs` entry if that set has not already been completed today.
- Pressing undo removes that set completion for the current day.
- The history screen groups logs by date and shows the snapshot values stored at completion time.

## Important Technical Notes

- Day-based completion uses local calendar boundaries from `getDayBounds()`, so "once per day" is based on the device/browser local time.
- Logs are already snapshot-based. The current completion code copies the set values into `workoutLogs` when the check action is pressed.
- The app is offline-capable and uses `vite-plugin-pwa`.

## Known Gaps Or Mismatches

- Weekly progress does not yet match the intended product rule.
  - Current code in `src/app/db/repositories/weekday.repository.ts` calculates progress from the latest logged workout date for that weekday.
  - Intended behavior is week-scoped progress that resets every Sunday.
- The root `README.md` is still the default Vite template and does not describe the app.
- Exercise management UI is incomplete.
  - There is no visible UI for renaming, deleting, or reordering exercises.
  - There is no visible UI for reordering sets.
- Repository behavior to note before exposing delete in the UI:
  - Deleting an exercise currently also deletes its logs.
  - Confirm that behavior before adding a user-facing delete action.

## Repo Health Notes

As checked on 2026-06-02:

- `yarn build` passes.
- `yarn lint` fails because generated files under `dev-dist/` are being linted and reference missing ESLint rules. This is not a functional app runtime issue, but it should be cleaned up before relying on lint as a quality gate.

## Guidance For Future Changes

- Keep `workoutLogs` append-only snapshot data.
- Do not retroactively mutate old logs when template values change.
- Any future progress logic should use Sunday-to-Saturday week boundaries.
- If exercise delete is added to the UI, decide explicitly whether logs should also be deleted or preserved.
