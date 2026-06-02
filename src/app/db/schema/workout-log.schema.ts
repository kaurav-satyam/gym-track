export const WORKOUT_SET_LOG_SCHEMA = [
  "++id,exerciseId,exerciseSetId,completedAt",
  "[exerciseId+completedAt]",
  "[exerciseSetId+completedAt]",
].join(",");
