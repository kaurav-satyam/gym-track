const MUSCLE_TAGS_URL = import.meta.env.BASE_URL + "data/muscleTags.json";

export async function loadDefaultMuscleTags() {
  const response = await fetch(MUSCLE_TAGS_URL);

  if (!response.ok) {
    throw new Error("Default muscle tags could not be loaded.");
  }

  const tags = await response.json();

  if (!Array.isArray(tags)) {
    return [];
  }

  return tags.filter((tag): tag is string => typeof tag === "string");
}
