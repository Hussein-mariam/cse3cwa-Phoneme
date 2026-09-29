// easy, normal or hard, worked out from the settings the teacher picked
// wordle: 8 guesses is easy, 6 is normal, 4 is hard
// word search: 8x8 grid is easy, 10x10 is normal, 12x12 is hard
export function difficultyFor(type: string, maxGuesses: number, gridSize: number) {
  if (type === "wordle") {
    if (maxGuesses === 8) {
      return "easy";
    }
    if (maxGuesses === 4) {
      return "hard";
    }
    return "normal";
  }

  if (gridSize === 8) {
    return "easy";
  }
  if (gridSize === 12) {
    return "hard";
  }
  return "normal";
}
