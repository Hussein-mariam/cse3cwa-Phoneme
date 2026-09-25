"use client";

import { useEffect, useState } from "react";

import { words } from "@/lib/words";
import {
  makeGrid,
  getPath
} from "@/lib/wordsearch";

import { exportWordSearch } from "@/lib/exportWordSearch";
import { getHint } from "@/lib/phonemes";

const START = [
  "chin",
  "fan",
  "van",
  "ring",
  "sun"
];

export default function WordSearchPage() {
  const [picked, setPicked] =
    useState(START);

  const [size, setSize] =
    useState(10);

  const [showEnglish, setShowEnglish] =
    useState(true);

  const [puzzle, setPuzzle] =
    useState(null);

  const [found, setFound] =
    useState([]);

  const [start, setStart] =
    useState(null);

  const [msg, setMsg] =
    useState("");

  useEffect(() => {
    const selectedWords =
      picked.map((name) =>
        words.find(
          (item) => item.word === name
        )
      );

    const newPuzzle =
      makeGrid(
        selectedWords,
        size
      );

    setPuzzle(newPuzzle);
    setFound([]);
    setStart(null);
  }, [picked, size]);

  function changeWord(index, value) {
    const newPicked = [...picked];

    newPicked[index] = value;

    setPicked(newPicked);
    setMsg("");
  }

  function newGrid() {
    const selectedWords =
      picked.map((name) =>
        words.find(
          (item) => item.word === name
        )
      );

    const newPuzzle =
      makeGrid(
        selectedWords,
        size
      );

    setPuzzle(newPuzzle);
    setFound([]);
    setStart(null);
    setMsg("New grid made.");
  }

  function clickCell(row, col) {
    if (start === null) {
      setStart([row, col]);
      setMsg(
        "Now click the last phoneme."
      );

      return;
    }

    const path = getPath(
      start[0],
      start[1],
      row,
      col
    );

    setStart(null);

    if (path === null) {
      setMsg(
        "Words go straight across, down or diagonally."
      );

      return;
    }

    let text = "";
    let backwards = "";

    for (
      let i = 0;
      i < path.length;
      i++
    ) {
      text +=
        puzzle.grid[
          path[i][0]
        ][
          path[i][1]
        ];
    }

    for (
      let i = path.length - 1;
      i >= 0;
      i--
    ) {
      backwards +=
        puzzle.grid[
          path[i][0]
        ][
          path[i][1]
        ];
    }

    for (
      const item of puzzle.placed
    ) {
      const key =
        item.phonemes.join("");

      if (found.includes(key)) {
        continue;
      }

      if (
        key === text ||
        key === backwards
      ) {
        const newFound = [
          ...found,
          key
        ];

        setFound(newFound);

        setMsg(
          "Found " +
          item.word +
          "!"
        );

        return;
      }
    }

    setMsg(
      "Not one of the words."
    );
  }

  function download() {
    const html =
      exportWordSearch(
        puzzle,
        showEnglish
      );

    const blob = new Blob(
      [html],
      { type: "text/html" }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      "phoneme-word-search.html";

    link.click();

    URL.revokeObjectURL(url);

    setMsg(
      "Downloaded phoneme-word-search.html"
    );
  }

  if (puzzle === null) {
    return (
      <p>
        Building the grid...
      </p>
    );
  }

  const foundCells = [];

  for (
    const item of puzzle.placed
  ) {
    const key =
      item.phonemes.join("");

    if (found.includes(key)) {
      for (
        const cell of item.cells
      ) {
        foundCells.push(cell);
      }
    }
  }

  const cells = [];

  for (
    let row = 0;
    row < puzzle.size;
    row++
  ) {
    for (
      let col = 0;
      col < puzzle.size;
      col++
    ) {
      let className = "cell";

      if (
        foundCells.includes(
          row + "," + col
        )
      ) {
        className = "cell found";
      } else if (
        start !== null &&
        start[0] === row &&
        start[1] === col
      ) {
        className = "cell picked";
      }

      cells.push(
        <button
          key={
            row + "," + col
          }
          className={className}
          onClick={() =>
            clickCell(row, col)
          }
        >
          {puzzle.grid[row][col]}
        </button>
      );
    }
  }

  return (
    <div>
      <h2>Word Search Builder</h2>

      <div className="box">
        <h3>Settings</h3>

        {picked.map(
          (name, index) => (
            <div key={index}>
              <label
                htmlFor={"w" + index}
              >
                Word {index + 1}
              </label>

              <select
                id={"w" + index}
                value={name}
                onChange={(event) =>
                  changeWord(
                    index,
                    event.target.value
                  )
                }
              >
                {words.map(
                  (item) => (
                    <option
                      key={item.word}
                      value={item.word}
                    >
                      {item.word} - /
                      {item.phonemes.join(" ")}
                      /
                    </option>
                  )
                )}
              </select>
            </div>
          )
        )}

        <label htmlFor="size">
          Grid size
        </label>

        <select
          id="size"
          value={size}
          onChange={(event) =>
            setSize(
              Number(event.target.value)
            )
          }
        >
          <option value={8}>
            8 x 8
          </option>

          <option value={10}>
            10 x 10
          </option>

          <option value={12}>
            12 x 12
          </option>
        </select>

        <label htmlFor="eng">
          <input
            id="eng"
            type="checkbox"
            checked={showEnglish}
            onChange={(event) =>
              setShowEnglish(
                event.target.checked
              )
            }
          />

          Show English spelling in
          the word list
        </label>

        <button onClick={newGrid}>
          New grid
        </button>

        <button onClick={download}>
          Generate
        </button>
      </div>

      <div className="box">
        <h3>Preview</h3>

        <p>
          {found.length} of{" "}
          {puzzle.placed.length} found
        </p>

        <div
          className="grid"
          style={{
            gridTemplateColumns:
              "repeat(" +
              puzzle.size +
              ", 1fr)"
          }}
        >
          {cells}
        </div>

        {msg && (
          <div className="msg">
            {msg}
          </div>
        )}

        <h3>Find these words</h3>

        <ul className="wordlist">
          {puzzle.placed.map(
            (item) => {
              const key =
                item.phonemes.join("");

              return (
                <li
                  key={item.word}
                  className={
                    found.includes(key)
                      ? "done"
                      : ""
                  }
                >
                  /

                  {item.phonemes.map(
                    (symbol, index) => (
                      <span
                        key={index}
                        className="chip"
                        title={getHint(symbol)}
                      >
                        {symbol}
                      </span>
                    )
                  )}

                  /

                  {showEnglish &&
                    " - " +
                    item.word}
                </li>
              );
            }
          )}
        </ul>
      </div>
    </div>
  );
}