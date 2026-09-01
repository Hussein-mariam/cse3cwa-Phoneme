export const phonemes = [
  { symbol: "p", letters: "P", example: "pin" },
  { symbol: "b", letters: "B", example: "bed" },
  { symbol: "t", letters: "T", example: "top" },
  { symbol: "d", letters: "D", example: "dog" },
  { symbol: "k", letters: "K", example: "cat" },
  { symbol: "ɡ", letters: "G", example: "gum" },
  { symbol: "m", letters: "M", example: "man" },
  { symbol: "n", letters: "N", example: "net" },
  { symbol: "ŋ", letters: "NG", example: "ring" },
  { symbol: "f", letters: "F", example: "fan" },
  { symbol: "v", letters: "V", example: "van" },
  { symbol: "θ", letters: "TH", example: "thin" },
  { symbol: "ð", letters: "TH", example: "then" },
  { symbol: "s", letters: "S", example: "sun" },
  { symbol: "z", letters: "Z", example: "zip" },
  { symbol: "ʃ", letters: "SH", example: "ship" },
  { symbol: "h", letters: "H", example: "hat" },
  { symbol: "tʃ", letters: "CH", example: "chin" },
  { symbol: "dʒ", letters: "J", example: "jam" },
  { symbol: "l", letters: "L", example: "log" },
  { symbol: "ɹ", letters: "R", example: "ring" },
  { symbol: "w", letters: "W", example: "win" },
  { symbol: "j", letters: "Y", example: "yes" },
  { symbol: "iː", letters: "EE", example: "see" },
  { symbol: "ɪ", letters: "I", example: "bid" },
  { symbol: "e", letters: "E", example: "bed" },
  { symbol: "æ", letters: "A", example: "bad" },
  { symbol: "ɐ", letters: "U", example: "bud" },
  { symbol: "ɔ", letters: "O", example: "log" },
  { symbol: "ʉː", letters: "OO", example: "boot" },
  { symbol: "ə", letters: "UH", example: "about" }
];

export function getHint(symbol) {
  const phoneme = phonemes.find(
    (item) => item.symbol === symbol
  );

  if (!phoneme) {
    return symbol;
  }

  return (
    "/" +
    phoneme.symbol +
    "/ - " +
    phoneme.letters +
    " as in " +
    phoneme.example
  );
}