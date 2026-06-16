const MUSCLE_TAGS_URL = import.meta.env.BASE_URL + "data/muscleTags.json";

type TMuscleTagPayload = string[] | { muscleTags?: unknown };

export async function loadDefaultMuscleTags() {
  const response = await fetch(MUSCLE_TAGS_URL);

  if (!response.ok) {
    throw new Error("Default muscle tags could not be loaded.");
  }

  const payload = (await response.json()) as TMuscleTagPayload;
  const tags = Array.isArray(payload)
    ? payload
    : Array.isArray(payload.muscleTags)
      ? payload.muscleTags
      : [];

  return tags.filter((tag): tag is string => typeof tag === "string");
}
