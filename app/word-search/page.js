"use client";

import { useEffect, useState } from "react";
import { makeGrid, getPath } from "@/lib/wordsearch";
import { hintFor } from "@/lib/hint";

// The word search is now built from a list stored in the database.
export default function WordSearchPage() {
  const [phonemes, setPhonemes] = useState([]);
  const [lists, setLists] = useState([]);
  const [words, setWords] = useState([]);

  const [listId, setListId] = useState(null);
  const [size, setSize] = useState(10);
  const [showEnglish, setShowEnglish] = useState(true);
  const [activityName, setActivityName] = useState("My word search");

  const [puzzle, setPuzzle] = useState(null);
  const [found, setFound] = useState([]);
  const [start, setStart] = useState(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    async function load() {
      const phonemesRes = await fetch("/api/phonemes");
      const listsRes = await fetch("/api/lists");
      const loadedLists = await listsRes.json();

      setPhonemes(await phonemesRes.json());
      setLists(loadedLists);

      if (loadedLists.length > 0) {
        setListId(loadedLists[0].id);
      }
    }
    load();
  }, []);

  // Load the list's words, then build a grid from them.
  // Math.random only runs here, after the page has loaded, so the server and
  // the browser never disagree about what the grid looks like.
  useEffect(() => {
    if (listId === null) {
      return;
    }
    async function load() {
      const res = await fetch("/api/words?listId=" + listId);
      const loaded = await res.json();
      const forGrid = loaded.map((w) => ({ word: w.english, phonemes: w.phonemes }));

      setWords(loaded);
      setPuzzle(forGrid.length > 0 ? makeGrid(forGrid, size) : null);
      setFound([]);
      setStart(null);
      setMsg("");
    }
    load();
  }, [listId, size]);

  function newGrid() {
    const forGrid = words.map((w) => ({ word: w.english, phonemes: w.phonemes }));
    setPuzzle(makeGrid(forGrid, size));
    setFound([]);
    setStart(null);
    setMsg("New grid made.");
  }

  function clickCell(r, c) {
    // First click sets the start of the word.
    if (start === null) {
      setStart([r, c]);
      setMsg("Now click the last sound.");
      return;
    }

    const path = getPath(start[0], start[1], r, c);
    setStart(null);

    if (path === null) {
      setMsg("Words go straight across, down or diagonally.");
      return;
    }

    // Read the squares forwards and backwards, so either direction counts.
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

  async function generate() {
    const res = await fetch("/api/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: activityName,
        type: "wordsearch",
        listId: listId,
        gridSize: size,
        showEnglish: showEnglish,
      }),
    });
    const activity = await res.json();

    if (!res.ok) {
      setMsg(activity.error);
      return;
    }

    // Clicking a link downloads the file without leaving this page.
    const link = document.createElement("a");
    link.href = "/api/activities/" + activity.id + "/download";
    link.click();
    setMsg("Saved as \"" + activity.name + "\" and generated.");
  }

  if (lists.length === 0) {
    return (
      <div>
        <h2>Word Search Builder</h2>
        <div className="msg">
          There are no word lists yet. Make one on the Word Lists page first.
        </div>
      </div>
    );
  }

  // Work out which squares belong to words already found.
  const foundCells = [];
  if (puzzle) {
    for (const p of puzzle.placed) {
      if (found.includes(p.phonemes.join(""))) {
        for (const cell of p.cells) {
          foundCells.push(cell);
        }
      }
    }
  }

  const cells = [];
  if (puzzle) {
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
  }

  return (
    <div>
      <h2>Word Search Builder</h2>

      <div className="box">
        <h3>Settings</h3>

        <label htmlFor="list">Word list</label>
        <select
          id="list"
          value={listId ?? ""}
          onChange={(event) => setListId(Number(event.target.value))}
        >
          {lists.map((list) => (
            <option key={list.id} value={list.id}>
              {list.name} ({list._count.words} words)
            </option>
          ))}
        </select>

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

        <label htmlFor="actname">Save this activity as</label>
        <input
          id="actname"
          type="text"
          value={activityName}
          onChange={(event) => setActivityName(event.target.value)}
        />

        <button onClick={newGrid}>New grid</button>
        <button onClick={generate}>Save and generate</button>
      </div>

      <div className="box">
        <h3>Preview</h3>

        {!puzzle && <p>This list has no words in it yet.</p>}

        {puzzle && (
          <>
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
                  {p.phonemes.map((symbol, i) => (
                    <span
                      key={i}
                      className="chip"
                      title={hintFor(phonemes.find((sound) => sound.symbol === symbol))}
                    >
                      {symbol}
                    </span>
                  ))}
                  /{showEnglish && " - " + p.word}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
