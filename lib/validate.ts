// Checks user input before anything is written to the database.
// The forms also check things, but a form can be bypassed - anyone can send a
// request straight to the API - so the server checks everything again.
//
// Every function here returns an error message, or null if the input is fine.
// The inputs are typed "unknown" because they come from the user, so we can't
// trust what type they are until we have checked.

export const GUESS_OPTIONS = [4, 6, 8];
export const GRID_OPTIONS = [8, 10, 12];

export function checkListName(name: unknown): string | null {
  if (typeof name !== "string" || name.trim() === "") {
    return "A list needs a name.";
  }
  if (name.trim().length > 60) {
    return "List names must be 60 characters or fewer.";
  }
  return null;
}

// "known" is every phoneme symbol in the database. A word can only use those.
export function checkWord(english: unknown, phonemes: unknown, known: string[]): string | null {
  if (typeof english !== "string" || english.trim() === "") {
    return "A word needs its English spelling.";
  }
  // Letters, spaces, apostrophes and hyphens only.
  if (!/^[a-zA-Z '-]+$/.test(english.trim())) {
    return "The spelling can only contain letters, spaces, apostrophes and hyphens.";
  }
  if (english.trim().length > 30) {
    return "The spelling must be 30 characters or fewer.";
  }

  if (!Array.isArray(phonemes)) {
    return "The sounds must be sent as a list.";
  }
  if (phonemes.length < 1) {
    return "A word needs at least one sound.";
  }
  if (phonemes.length > 8) {
    return "A word can have at most eight sounds.";
  }

  for (const symbol of phonemes) {
    if (!known.includes(symbol)) {
      return '"' + symbol + '" is not a phoneme this app knows about.';
    }
  }

  return null;
}

// "body" is the whole JSON object that was sent.
export function checkActivity(body: Record<string, unknown>): string | null {
  if (typeof body.name !== "string" || body.name.trim() === "") {
    return "An activity needs a name.";
  }
  if (body.type !== "wordle" && body.type !== "wordsearch") {
    return 'Type must be "wordle" or "wordsearch".';
  }
  if (typeof body.listId !== "number") {
    return "An activity needs a word list.";
  }

  // The rest are optional. If they are left out the database default is used.
  if (body.maxGuesses !== undefined) {
    if (typeof body.maxGuesses !== "number" || !GUESS_OPTIONS.includes(body.maxGuesses)) {
      return "Guesses must be 4, 6 or 8.";
    }
  }
  if (body.gridSize !== undefined) {
    if (typeof body.gridSize !== "number" || !GRID_OPTIONS.includes(body.gridSize)) {
      return "Grid size must be 8, 10 or 12.";
    }
  }
  if (body.targetWordId !== undefined && body.targetWordId !== null) {
    if (typeof body.targetWordId !== "number") {
      return "targetWordId must be a word id.";
    }
  }
  if (body.showLetters !== undefined && typeof body.showLetters !== "boolean") {
    return "showLetters must be true or false.";
  }
  if (body.showEnglish !== undefined && typeof body.showEnglish !== "boolean") {
    return "showEnglish must be true or false.";
  }
  return null;
}

// Turns an id from the URL into a number. Gives null for things like "abc".
export function parseId(value: string): number | null {
  const id = Number(value);
  if (Number.isInteger(id) && id > 0) {
    return id;
  }
  return null;
}
