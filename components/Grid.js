// the grid has one row for each guess the student is allowed

export default function Grid({ rows, cols, guesses, current }) {
  const board = [];

  for (let r = 0; r < rows; r++) {
    const tiles = [];

    for (let c = 0; c < cols; c++) {
      let text = "";
      let className = "tile";

      if (r < guesses.length) {
        // a guess that has already been checked, so show it with its colour
        text = guesses[r].symbols[c];
        className = "tile " + guesses[r].result[c];
      } else if (r === guesses.length) {
        text = current[c] || "";
      }

      tiles.push(
        <div key={c} className={className}>
          {text}
        </div>
      );
    }

    board.push(
      <div key={r} className="row">
        {tiles}
      </div>
    );
  }

  return <div className="board">{board}</div>;
}