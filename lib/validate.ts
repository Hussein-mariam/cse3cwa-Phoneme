// checked on the server too, anyone can call the API without the form

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

export function checkWord(english: unknown, phonemes: unknown, known: string[]): string | null {
  if (typeof english !== "string" || english.trim() === "") {
    return "A word needs its English spelling.";
  }
  // letters, spaces, ' and - only
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

export function parseId(value: string): number | null {
  const id = Number(value);
  if (Number.isInteger(id) && id > 0) {
    return id;
  }
  return null;
}
