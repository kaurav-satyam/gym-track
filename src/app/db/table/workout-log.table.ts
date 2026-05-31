export interface IWorkoutSetLog {
  id?: number;

  exerciseId: number;

  exerciseSetId: string;

  completedAt: Date;

  weight?: number;
  reps?: number;
  time?: number;
}

export const WorkoutSetLogSchema = "++id,exerciseId,exerciseSetId,completedAt";
