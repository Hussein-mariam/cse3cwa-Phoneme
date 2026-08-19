// The words a teacher can pick from.
// The phonemes are stored as a list instead of one string, because sounds like
// tʃ and dʒ are written with two characters. If I split a string I would get
// four tiles for "chin" instead of three.

export const words = [
  { word: "thin", phonemes: ["θ", "ɪ", "n"] },
  { word: "chin", phonemes: ["tʃ", "ɪ", "n"] },
  { word: "ship", phonemes: ["ʃ", "ɪ", "p"] },
  { word: "jam", phonemes: ["dʒ", "æ", "m"] },
  { word: "fan", phonemes: ["f", "æ", "n"] },
  { word: "van", phonemes: ["v", "æ", "n"] },
  { word: "sun", phonemes: ["s", "ɐ", "n"] },
  { word: "ring", phonemes: ["ɹ", "ɪ", "ŋ"] },
  { word: "log", phonemes: ["l", "ɔ", "ɡ"] },
  { word: "bed", phonemes: ["b", "e", "d"] },
  { word: "tent", phonemes: ["t", "e", "n", "t"] },
  { word: "milk", phonemes: ["m", "ɪ", "l", "k"] },
  { word: "hand", phonemes: ["h", "æ", "n", "d"] },
  { word: "jump", phonemes: ["dʒ", "ɐ", "m", "p"] },
];
