const directions = [
  {
    down: 0,
    across: 1
  },
  {
    down: 1,
    across: 0
  },
  {
    down: 1,
    across: 1
  }
];

export function makeGrid(list, size) {
  const grid = [];

  for (let row = 0; row < size; row++) {
    const newRow = [];

    for (let col = 0; col < size; col++) {
      newRow.push("");
    }

    grid.push(newRow);
  }

  const placed = [];

  for (const item of list) {
    let done = false;
    let tries = 0;

    while (!done && tries < 300) {
      tries++;

      const direction =
        directions[
          Math.floor(
            Math.random() *
            directions.length
          )
        ];

      const row = Math.floor(
        Math.random() * size
      );

      const col = Math.floor(
        Math.random() * size
      );

      if (
        canPlace(
          grid,
          item.phonemes,
          row,
          col,
          direction,
          size
        )
      ) {
        const cells = [];

        for (
          let i = 0;
          i < item.phonemes.length;
          i++
        ) {
          const newRow =
            row + direction.down * i;

          const newCol =
            col + direction.across * i;

          grid[newRow][newCol] =
            item.phonemes[i];

          cells.push(
            newRow + "," + newCol
          );
        }

        placed.push({
          word: item.word,
          phonemes: item.phonemes,
          cells: cells
        });

        done = true;
      }
    }
  }

  const pool = [];

  for (const item of list) {
    for (const phoneme of item.phonemes) {
      if (!pool.includes(phoneme)) {
        pool.push(phoneme);
      }
    }
  }

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (grid[row][col] === "") {
        const randomNumber =
          Math.floor(
            Math.random() * pool.length
          );

        grid[row][col] =
          pool[randomNumber];
      }
    }
  }

  return {
    grid: grid,
    placed: placed,
    size: size
  };
}

function canPlace(
  grid,
  phonemes,
  row,
  col,
  direction,
  size
) {
  const lastRow =
    row +
    direction.down *
      (phonemes.length - 1);

  const lastCol =
    col +
    direction.across *
      (phonemes.length - 1);

  if (
    lastRow >= size ||
    lastCol >= size
  ) {
    return false;
  }

  for (
    let i = 0;
    i < phonemes.length;
    i++
  ) {
    const currentCell =
      grid[
        row + direction.down * i
      ][
        col + direction.across * i
      ];

    if (
      currentCell !== "" &&
      currentCell !== phonemes[i]
    ) {
      return false;
    }
  }

  return true;
}

export function getPath(
  row1,
  col1,
  row2,
  col2
) {
  const downBy = row2 - row1;
  const acrossBy = col2 - col1;

  if (
    downBy !== 0 &&
    acrossBy !== 0 &&
    Math.abs(downBy) !==
      Math.abs(acrossBy)
  ) {
    return null;
  }

  const steps = Math.max(
    Math.abs(downBy),
    Math.abs(acrossBy)
  );

  let stepDown = 0;
  let stepAcross = 0;

  if (steps !== 0) {
    stepDown = downBy / steps;
    stepAcross = acrossBy / steps;
  }

  const path = [];

  for (
    let i = 0;
    i <= steps;
    i++
  ) {
    path.push([
      row1 + stepDown * i,
      col1 + stepAcross * i
    ]);
  }

  return path;
}