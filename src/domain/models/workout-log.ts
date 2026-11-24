export interface WorkoutSetLog {
  id?: number;
  exerciseId: number;
  exerciseSetId: string;
  completedAt: Date;
  weight?: number;
  reps?: number;
  time?: number;
}
