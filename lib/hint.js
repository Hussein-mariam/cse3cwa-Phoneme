export function hintFor(phoneme) {
  if (!phoneme) {
    return "";
  }
  return "/" + phoneme.symbol + "/ - " + phoneme.letters + " as in " + phoneme.example;
}
