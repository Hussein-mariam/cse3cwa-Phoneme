// Builds the hover text for a phoneme, e.g. "/θ/ - TH as in thin".
// Used by the builder pages, where the phonemes come from the database.
export function hintFor(phoneme) {
  if (!phoneme) {
    return "";
  }
  return "/" + phoneme.symbol + "/ - " + phoneme.letters + " as in " + phoneme.example;
}
