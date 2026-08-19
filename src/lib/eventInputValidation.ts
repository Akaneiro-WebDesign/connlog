export const EVENT_TAG_MAX_LENGTH = 50;
export const EVENT_TAG_MAX_COUNT = 10;
export const EVENT_NOTE_MAX_LENGTH = 2000;

type ValidationSuccess<T> = {
  ok: true;
  value: T;
};

type ValidationFailure = {
  ok: false;
  error: string;
};

export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

export type ValidatedTagsAndNote = {
  tags: string[];
  note: string;
};

export function validatePositiveIntegerId(
  value: unknown,
  fieldName: string,
): ValidationResult<number> {
  let parsedValue: number;

  if (typeof value === "number") {
    parsedValue = value;
  } else if (typeof value === "string" && /^[1-9]\d*$/.test(value.trim())) {
    parsedValue = Number(value.trim());
  } else {
    return {
      ok: false,
      error: `${fieldName}は正の整数で指定してください`,
    };
  }

  if (!Number.isSafeInteger(parsedValue) || parsedValue <= 0) {
    return {
      ok: false,
      error: `${fieldName}は正の整数で指定してください`,
    };
  }

  return { ok: true, value: parsedValue };
}

export function validateTagsAndNote(
  tagsValue: unknown,
  noteValue: unknown,
): ValidationResult<ValidatedTagsAndNote> {
  if (!Array.isArray(tagsValue)) {
    return { ok: false, error: "tagsは配列で指定してください" };
  }
  if (tagsValue.length > EVENT_TAG_MAX_COUNT) {
    return {
      ok: false,
      error: `タグは${EVENT_TAG_MAX_COUNT}件以内で指定してください`,
    };
  }

  const normalizedTags: string[] = [];

  for (const tagValue of tagsValue) {
    if (typeof tagValue !== "string") {
      return { ok: false, error: "タグは文字列で指定してください" };
    }

    const normalizedTag = tagValue.trim();

    if (!normalizedTag) {
      continue;
    }

    if (normalizedTag.length > EVENT_TAG_MAX_LENGTH) {
      return {
        ok: false,
        error: `タグは1件あたり${EVENT_TAG_MAX_LENGTH}文字以内で指定してください`,
      };
    }

    if (!normalizedTags.includes(normalizedTag)) {
      normalizedTags.push(normalizedTag);
    }
  }

  if (typeof noteValue !== "string") {
    return { ok: false, error: "noteは文字列で指定してください" };
  }

  const normalizedNote = noteValue.trim();

  if (normalizedNote.length > EVENT_NOTE_MAX_LENGTH) {
    return {
      ok: false,
      error: `メモは${EVENT_NOTE_MAX_LENGTH}文字以内で指定してください`,
    };
  }

  return {
    ok: true,
    value: {
      tags: normalizedTags,
      note: normalizedNote,
    },
  };
}
