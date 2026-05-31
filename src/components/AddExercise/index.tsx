import { useMemo, useState } from "react";
import {
  ExerciseService,
  type IAddExercisePayload,
} from "../../app/db/service/exercise.service";
import {
  ExerciseTimeUnits,
  ExerciseTypes,
  ExerciseWeightUnits,
  type TDay,
  type TExerciseType,
  type TExerciseUnitType,
} from "../../app/db/table/exercise.table";

interface IAddExerciseProps {
  readonly day: TDay;
  isOpen: boolean;
  setIsOpen: (arg: boolean) => void;
}

export default function AddExercise({
  day,
  isOpen,
  setIsOpen,
}: IAddExerciseProps) {
  const [title, setTitle] = useState("");
  const [exerciseType, setExerciseType] = useState<TExerciseType>("reps");

  const [exerciseUnit, setExerciseUnit] = useState<TExerciseUnitType>("kg");

  const displayUnits = useMemo(
    () => (exerciseType === "reps" ? ExerciseWeightUnits : ExerciseTimeUnits),
    [exerciseType],
  );

  async function addExercise() {
    const data: IAddExercisePayload = {
      title,
      day,
      exerciseType,
      exerciseUnit,
      exerciseSets: [],
    };
    console.log("hitt", data);
    await ExerciseService.addExercise(data);
  }

  return (
    <div className="w-full max-w-md overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 shadow-xl">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-6 text-left transition hover:bg-zinc-900/40"
      >
        <div>
          <p className="text-sm text-zinc-400">Add Exercise For</p>

          <h2 className="text-2xl font-bold text-white">{day}</h2>
        </div>

        {/* Collapse Icon */}
        <div
          className={`
            flex h-10 w-10 items-center justify-center
            rounded-2xl bg-zinc-900 text-white
            transition-transform duration-300
            ${isOpen ? "rotate-180" : ""}
          `}
        >
          ▼
        </div>
      </button>

      {/* Collapsible Content */}
      <div
        className={`
          grid transition-all duration-300 ease-in-out
          ${
            isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }
        `}
      >
        <div className="overflow-hidden">
          <form
            className="space-y-5 px-6 pb-6"
            onSubmit={(e) => {
              console.log("ddd");

              e.preventDefault();
              addExercise();
            }}
          >
            {/* Exercise Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">
                Exercise Name
              </label>

              <input
                type="text"
                placeholder="Bench Press"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="
                  w-full rounded-2xl border border-zinc-800
                  bg-zinc-900 px-4 py-3 text-white
                  outline-none transition
                  focus:border-zinc-600
                "
              />
            </div>

            {/* Exercise Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">
                Exercise Type
              </label>

              <div className="grid grid-cols-2 gap-3">
                {ExerciseTypes.map((value) => {
                  const active = exerciseType === value;

                  return (
                    <label
                      key={value}
                      className={`
                        cursor-pointer rounded-2xl
                        border px-4 py-3 text-center
                        capitalize transition
                        ${
                          active
                            ? "border-white bg-white text-black"
                            : `
                              border-zinc-800
                              bg-zinc-900 text-zinc-300
                              hover:border-zinc-700
                            `
                        }
                      `}
                    >
                      <input
                        type="radio"
                        value={value}
                        name="exercise-type"
                        checked={active}
                        onChange={() => {
                          setExerciseType(value);

                          setExerciseUnit(value === "reps" ? "kg" : "sec");
                        }}
                        className="hidden"
                      />

                      {value}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Unit */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Unit</label>

              <select
                value={exerciseUnit}
                onChange={(e) =>
                  setExerciseUnit(e.target.value as TExerciseUnitType)
                }
                className="
                  w-full rounded-2xl border border-zinc-800
                  bg-zinc-900 px-4 py-3 text-white
                  outline-none transition
                  focus:border-zinc-600
                "
              >
                {displayUnits.map((unit) => (
                  <option key={unit} value={unit} className="bg-zinc-900">
                    {unit}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="
                w-full rounded-2xl bg-white py-3
                font-semibold text-black transition
                hover:opacity-90
              "
            >
              Add Exercise
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
