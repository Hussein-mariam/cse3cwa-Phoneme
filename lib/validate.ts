// Checks user input before anything is written to the database.
// The forms also check things, but a form can be bypassed - anyone can send a
// request straight to the API - so the server checks everything again.

export type Check = { ok: true } | { ok: false; error: string };

const OK: Check = { ok: true };
const fail = (error: string): Check => ({ ok: false, error });

export const GUESS_OPTIONS = [4, 6, 8];
export const GRID_OPTIONS = [8, 10, 12];
export const ACTIVITY_TYPES = ["wordle", "wordsearch"];
export const DIFFICULTIES = ["easy", "standard", "hard"];

export function validateListName(name: unknown): Check {
  if (typeof name !== "string" || name.trim() === "") {
    return fail("A list needs a name.");
  }
  if (name.trim().length > 60) {
    return fail("List names must be 60 characters or fewer.");
  }
  return OK;
}

// `known` is every phoneme symbol in the database. A word can only use those.
export function validateWord(
  english: unknown,
  phonemes: unknown,
  known: string[]
): Check {
  if (typeof english !== "string" || english.trim() === "") {
    return fail("A word needs its English spelling.");
  }
  if (!/^[a-zA-Z '-]+$/.test(english.trim())) {
    return fail("The spelling can only contain letters, spaces, apostrophes and hyphens.");
  }
  if (english.trim().length > 30) {
    return fail("The spelling must be 30 characters or fewer.");
  }

  if (!Array.isArray(phonemes)) {
    return fail("The sounds must be sent as a list.");
  }
  if (phonemes.length < 1) {
    return fail("A word needs at least one sound.");
  }
  if (phonemes.length > 8) {
    return fail("A word can have at most eight sounds.");
  }

  for (const symbol of phonemes) {
    if (typeof symbol !== "string" || symbol.trim() === "") {
      return fail("One of the sounds is empty.");
    }
    if (!known.includes(symbol)) {
      return fail(`"${symbol}" is not a phoneme this app knows about.`);
    }
  }

  return OK;
}

export function validateActivity(body: Record<string, unknown>): Check {
  if (typeof body.name !== "string" || body.name.trim() === "") {
    return fail("An activity needs a name.");
  }
  if (!ACTIVITY_TYPES.includes(String(body.type))) {
    return fail('Type must be "wordle" or "wordsearch".');
  }
  if (body.difficulty !== undefined && !DIFFICULTIES.includes(String(body.difficulty))) {
    return fail('Difficulty must be "easy", "standard" or "hard".');
  }
  if (body.maxGuesses !== undefined && !GUESS_OPTIONS.includes(Number(body.maxGuesses))) {
    return fail("Guesses must be 4, 6 or 8.");
  }
  if (body.gridSize !== undefined && !GRID_OPTIONS.includes(Number(body.gridSize))) {
    return fail("Grid size must be 8, 10 or 12.");
  }
  if (!Number.isInteger(Number(body.listId))) {
    return fail("An activity needs a word list.");
  }
  return OK;
}

// Turns "abc" or a missing value into null instead of NaN.
export function parseId(value: string | undefined): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}
