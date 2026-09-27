export function score(guess, target) {
  const result = [];

  const remaining = [];

  for (let i = 0; i < target.length; i++) {
    remaining.push(target[i]);
  }

  // first, right sound in the right place
  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === target[i]) {
      result[i] = "correct";
      remaining[i] = null;
    } else {
      result[i] = "absent";
    }
  }

  // then, right sound but in the wrong place
  for (let i = 0; i < guess.length; i++) {
    if (result[i] === "absent") {
      const position = remaining.indexOf(guess[i]);

      if (position !== -1) {
        result[i] = "present";
        remaining[position] = null;
      }
    }
  }

  return result;
}