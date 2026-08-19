const directions = [
  { down: 0, across: 1 }, // left to right
  { down: 1, across: 0 }, // top to bottom
  { down: 1, across: 1 }, // diagonal
];

// Builds the word search grid from a list of words.
export function makeGrid(list, size) {
  // starting with an empty grid.
  const grid = [];
  for (let r = 0; r < size; r++) {
    grid.push(new Array(size).fill(""));
  }

  const placed = [];

  for (const item of list) {
    let done = false;
    let tries = 0;

    // Keep trying random spots until it fits, or give up after 300 goes.
    while (!done && tries < 300) {
      tries++;

      const dir = directions[Math.floor(Math.random() * directions.length)];
      const row = Math.floor(Math.random() * size);
      const col = Math.floor(Math.random() * size);

      if (canPlace(grid, item.phonemes, row, col, dir, size)) {
        const cells = [];

        for (let i = 0; i < item.phonemes.length; i++) {
          const r = row + dir.down * i;
          const c = col + dir.across * i;
          grid[r][c] = item.phonemes[i];
          cells.push(r + "," + c);
        }

        placed.push({ word: item.word, phonemes: item.phonemes, cells: cells });
        done = true;
      }
    }
  }

  
  const pool = [];
  for (const item of list) {
    for (const p of item.phonemes) {
      if (!pool.includes(p)) {
        pool.push(p);
      }
    }
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === "") {
        grid[r][c] = pool[Math.floor(Math.random() * pool.length)];
      }
    }
  }

  return { grid: grid, placed: placed, size: size };
}

// checks a word fits on the grid without clashing with one already there.
function canPlace(grid, phonemes, row, col, dir, size) {
  const lastRow = row + dir.down * (phonemes.length - 1);
  const lastCol = col + dir.across * (phonemes.length - 1);

  // Would it run off the edge?
  if (lastRow >= size || lastCol >= size) {
    return false;
  }

  for (let i = 0; i < phonemes.length; i++) {
    const cell = grid[row + dir.down * i][col + dir.across * i];
    // An occupied square is fine if it already holds the same sound.
    if (cell !== "" && cell !== phonemes[i]) {
      return false;
    }
  }

  return true;
}


export function getPath(row1, col1, row2, col2) {
  const downBy = row2 - row1;
  const acrossBy = col2 - col1;

  // not a straight line, so not a valid selection.
  if (downBy !== 0 && acrossBy !== 0 && Math.abs(downBy) !== Math.abs(acrossBy)) {
    return null;
  }

  const steps = Math.max(Math.abs(downBy), Math.abs(acrossBy));

  // which way to move each step: -1, 0 or 1.
  const stepDown = steps === 0 ? 0 : downBy / steps;
  const stepAcross = steps === 0 ? 0 : acrossBy / steps;

  const path = [];
  for (let i = 0; i <= steps; i++) {
    path.push([row1 + stepDown * i, col1 + stepAcross * i]);
  }

  return path;
}