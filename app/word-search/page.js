"use client";

import { useEffect, useState } from "react";
import { words } from "@/lib/words";
import { makeGrid, getPath } from "@/lib/wordsearch";
import { exportWordSearch } from "@/lib/exportWordSearch";
import { getHint } from "@/lib/phonemes";

// the five words the puzzle starts with.
const START = ["chin", "fan", "van", "ring", "sun"];

export default function WordSearchPage() {
  const [picked, setPicked] = useState(START);
  const [size, setSize] = useState(10);
  const [showEnglish, setShowEnglish] = useState(true);
  const [puzzle, setPuzzle] = useState(null);
  const [found, setFound] = useState([]);
  const [start, setStart] = useState(null);
  const [msg, setMsg] = useState("");

  
  useEffect(() => {
    const list = picked.map((name) => words.find((w) => w.word === name));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPuzzle(makeGrid(list, size));
    setFound([]);
    setStart(null);
  }, [picked, size]);

  function changeWord(index, value) {
    const copy = [...picked];
    copy[index] = value;
    setPicked(copy);
    setMsg("");
  }

  function newGrid() {
    const list = picked.map((name) => words.find((w) => w.word === name));
    setPuzzle(makeGrid(list, size));
    setFound([]);
    setStart(null);
    setMsg("New grid made.");
  }

  function clickCell(r, c) {
    // First click sets the start of the word.
    if (start === null) {
      setStart([r, c]);
      setMsg("Now click the last phoneme.");
      return;
    }

    const path = getPath(start[0], start[1], r, c);
    setStart(null);

    if (path === null) {
      setMsg("Words go straight across, down or diagonally.");
      return;
    }

    // read the squares forwards and backwards so either direction counts
    let text = "";
    let back = "";
    for (let i = 0; i < path.length; i++) {
      text += puzzle.grid[path[i][0]][path[i][1]];
    }
    for (let j = path.length - 1; j >= 0; j--) {
      back += puzzle.grid[path[j][0]][path[j][1]];
    }

    for (const p of puzzle.placed) {
      const key = p.phonemes.join("");
      if (found.includes(key)) {
        continue;
      }
      if (key === text || key === back) {
        setFound([...found, key]);
        setMsg("Found " + p.word + "!");
        return;
      }
    }

    setMsg("Not one of the words.");
  }

  function download() {
    const html = exportWordSearch(puzzle, showEnglish);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "phoneme-word-search.html";
    link.click();
    URL.revokeObjectURL(url);
    setMsg("Downloaded phoneme-word-search.html");
  }

  if (puzzle === null) {
    return <p>Building the grid...</p>;
  }

  // work out which squares belong to words already found.
  const foundCells = [];
  for (const p of puzzle.placed) {
    if (found.includes(p.phonemes.join(""))) {
      for (const cell of p.cells) {
        foundCells.push(cell);
      }
    }
  }

  const cells = [];
  for (let r = 0; r < puzzle.size; r++) {
    for (let c = 0; c < puzzle.size; c++) {
      let className = "cell";
      if (foundCells.includes(r + "," + c)) {
        className = "cell found";
      } else if (start !== null && start[0] === r && start[1] === c) {
        className = "cell picked";
      }
      cells.push(
        <button
          key={r + "," + c}
          className={className}
          onClick={() => clickCell(r, c)}
        >
          {puzzle.grid[r][c]}
        </button>
      );
    }
  }

  return (
    <div>
      <h2>Word Search Builder</h2>

      <div className="box">
        <h3>Settings</h3>

        {picked.map((name, i) => (
          <div key={i}>
            <label htmlFor={"w" + i}>Word {i + 1}</label>
            <select
              id={"w" + i}
              value={name}
              onChange={(event) => changeWord(i, event.target.value)}
            >
              {words.map((w) => (
                <option key={w.word} value={w.word}>
                  {w.word} - /{w.phonemes.join(" ")}/
                </option>
              ))}
            </select>
          </div>
        ))}

        <label htmlFor="size">Grid size</label>
        <select
          id="size"
          value={size}
          onChange={(event) => setSize(Number(event.target.value))}
        >
          <option value={8}>8 x 8</option>
          <option value={10}>10 x 10</option>
          <option value={12}>12 x 12</option>
        </select>

        <label htmlFor="eng">
          <input
            id="eng"
            type="checkbox"
            checked={showEnglish}
            onChange={(event) => setShowEnglish(event.target.checked)}
          />
          Show English spelling in the word list
        </label>

        <button onClick={newGrid}>New grid</button>
        <button onClick={download}>Generate</button>
      </div>

      <div className="box">
        <h3>Preview</h3>

        <p>
          {found.length} of {puzzle.placed.length} found
        </p>

        <div
          className="grid"
          style={{ gridTemplateColumns: "repeat(" + puzzle.size + ", 1fr)" }}
        >
          {cells}
        </div>

        {msg && <div className="msg">{msg}</div>}

        <h3>Find these words</h3>
        <ul className="wordlist">
          {puzzle.placed.map((p) => (
            <li
              key={p.word}
              className={found.includes(p.phonemes.join("")) ? "done" : ""}
            >
              /
              {p.phonemes.map((s, i) => (
                <span key={i} className="chip" title={getHint(s)}>
                  {s}
                </span>
              ))}
              /{showEnglish && " - " + p.word}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}