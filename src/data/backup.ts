import { db } from "@/data/db";
import type { ExerciseTemplate } from "@/domain/models/exercise";
import type { ExerciseLibraryItem } from "@/domain/models/exercise-library";
import type { WorkoutSetLog } from "@/domain/models/workout-log";

/**
 * Whole-database backup as a single JSON file. Data only lives in this
 * browser, so this is the user's way to move phones or recover from cleared
 * site data.
 */

const FORMAT = "gymtrack-backup";
const VERSION = 1;

export interface Backup {
  format: typeof FORMAT;
  version: number;
  exportedAt: string;
  exercises: ExerciseTemplate[];
  workoutLogs: WorkoutSetLog[];
  exerciseLibrary: ExerciseLibraryItem[];
}

export async function createBackup(): Promise<Backup> {
  const [exercises, workoutLogs, exerciseLibrary] = await Promise.all([
    db.exercises.toArray(),
    db.workoutLogs.toArray(),
    db.exerciseLibrary.toArray(),
  ]);

  return {
    format: FORMAT,
    version: VERSION,
    exportedAt: new Date().toISOString(),
    exercises,
    workoutLogs,
    exerciseLibrary,
  };
}

/** Pretty JSON (Dates become ISO strings). */
export function serializeBackup(backup: Backup) {
  return JSON.stringify(backup, null, 2);
}

/** Parses and validates a backup file. Throws an Error with a user-facing message. */
export function parseBackup(text: string): Backup {
  let data: unknown;

  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("That file isn't a GymTrack backup.");
  }

  const backup = data as Partial<Backup>;

  if (backup?.format !== FORMAT || !Array.isArray(backup.exercises) || !Array.isArray(backup.workoutLogs)) {
    throw new Error("That file isn't a GymTrack backup.");
  }

  if ((backup.version ?? 0) > VERSION) {
    throw new Error("This backup was made by a newer version of GymTrack. Update the app first.");
  }

  return {
    format: FORMAT,
    version: backup.version ?? VERSION,
    exportedAt: backup.exportedAt ?? "",
    exercises: backup.exercises,
    workoutLogs: backup.workoutLogs.map((log) => ({ ...log, completedAt: new Date(log.completedAt) })),
    exerciseLibrary: (backup.exerciseLibrary ?? []).map((item) => ({
      ...item,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
    })),
  };
}

/** Replaces everything on this device with the backup's contents. */
export async function restoreBackup(backup: Backup) {
  await db.transaction("rw", db.exercises, db.workoutLogs, db.exerciseLibrary, async () => {
    await Promise.all([db.exercises.clear(), db.workoutLogs.clear(), db.exerciseLibrary.clear()]);
    await db.exercises.bulkAdd(backup.exercises);
    await db.workoutLogs.bulkAdd(backup.workoutLogs);
    await db.exerciseLibrary.bulkAdd(backup.exerciseLibrary);
  });
}

export function backupFileName(date = new Date()) {
  const pad = (value: number) => String(value).padStart(2, "0");

  return `gymtrack-backup-${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}.json`;
}
