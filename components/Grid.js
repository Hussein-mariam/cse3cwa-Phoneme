export default function Grid({ rows, cols, guesses, current }) {
  const board = [];

  for (let row = 0; row < rows; row++) {
    const tiles = [];

    for (let col = 0; col < cols; col++) {
      let text = "";
      let className = "tile";

      if (row < guesses.length) {
        text = guesses[row].symbols[col];
        className = "tile " + guesses[row].result[col];
      } else if (row === guesses.length) {
        if (current[col]) {
          text = current[col];
        }
      }

      tiles.push(
        <div
          key={col}
          className={className}
        >
          {text}
        </div>
      );
    }

    board.push(
      <div key={row} className="row">
        {tiles}
      </div>
    );
  }

  return (
    <div className="board">
      {board}
    </div>
  );
}