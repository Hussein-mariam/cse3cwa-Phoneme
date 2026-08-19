export function score(guess, target) {
  const result = [];
  const remaining = [...target];

  // first  right sound in the right place.
  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === target[i]) {
      result[i] = "correct";
      remaining[i] = null;
    } else {
      result[i] = "absent";
    }
  }
  
  // second right sound but in the wrong place.
  for (let i = 0; i < guess.length; i++) {
    if (result[i] === "absent") {
      const found = remaining.indexOf(guess[i]);
      if (found !== -1) {
        result[i] = "present";
        remaining[found] = null;
      }
    }
  }

  return result;
}