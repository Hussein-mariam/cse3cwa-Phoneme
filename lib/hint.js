// Builds the hover text for a phoneme, e.g. "/θ/ - TH as in thin".
// The phoneme now comes from the database instead of a file, but the text is
// built the same way it was in Assessment 1.
export function hintFor(phoneme) {
  if (!phoneme) {
    return "";
  }
  return "/" + phoneme.symbol + "/ - " + phoneme.letters + " as in " + phoneme.example;
}

// Looks a symbol up in a list of phonemes loaded from the API.
export function findPhoneme(phonemes, symbol) {
  return phonemes.find((p) => p.symbol === symbol);
}
