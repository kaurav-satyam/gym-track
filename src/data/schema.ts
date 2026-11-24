/**
 * Dexie index definitions ("++" = auto-increment key, "*" = multi-entry,
 * "[a+b]" = compound index). Only indexed fields are listed; other fields are
 * stored but not queryable. Changing these requires a new version in db.ts.
 */

export const WORKOUT_SET_LOG_SCHEMA = [
  "++id,exerciseId,exerciseSetId,completedAt",
  "[exerciseId+completedAt]",
  "[exerciseSetId+completedAt]",
].join(",");

export const LEGACY_EXERCISE_LIBRARY_SCHEMA =
  "id,title,normalizedTitle,exerciseType,category,equipment,isBuiltIn,*muscleTags";

export const EXERCISE_LIBRARY_SCHEMA =
  "id,title,normalizedTitle,exerciseType,category,isBuiltIn,*muscleTags";

export const LEGACY_EXERCISE_SCHEMA = "++id,day,title,exerciseType";
export const EXERCISE_SCHEMA = "++id,day,sortOrder,title,exerciseType";
