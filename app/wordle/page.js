"use client";

import { useEffect, useState } from "react";
import { score } from "@/lib/score";
import Grid from "@/components/Grid";
import Keypad from "@/components/Keypad";

// The builder now loads its words from the database instead of a file, and
// saves the settings as a named activity that can be generated later.
export default function WordlePage() {
  // Loaded from the API.
  const [phonemes, setPhonemes] = useState([]);
  const [lists, setLists] = useState([]);
  const [words, setWords] = useState([]);

  // Settings the teacher controls.
  const [listId, setListId] = useState(null);
  const [chosen, setChosen] = useState(null);
  const [maxGuesses, setMaxGuesses] = useState(6);
  const [showLetters, setShowLetters] = useState(true);
  const [activityName, setActivityName] = useState("My wordle");

  // State for the preview game.
  const [current, setCurrent] = useState([]);
  const [guesses, setGuesses] = useState([]);
  const [keyStates, setKeyStates] = useState({});
  const [msg, setMsg] = useState("");
  const [over, setOver] = useState(false);

  // Load the sounds and the lists once.
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

  // Whenever the chosen list changes, fetch its words.
  useEffect(() => {
    if (listId === null) {
      return;
    }
    async function load() {
      const res = await fetch("/api/words?listId=" + listId);
      const loaded = await res.json();
      setWords(loaded);
      setChosen(loaded.length > 0 ? loaded[0].id : null);
      reset();
    }
    load();
  }, [listId]);

  const word = words.find((w) => w.id === chosen) || words[0];

  function reset() {
    setCurrent([]);
    setGuesses([]);
    setKeyStates({});
    setMsg("");
    setOver(false);
  }

  function pick(symbol) {
    if (over || !word || current.length >= word.phonemes.length) {
      return;
    }
    // The arrow function makes sure fast clicks do not lose a phoneme.
    setCurrent((row) => [...row, symbol]);
    setMsg("");
  }

  function back() {
    if (over) {
      return;
    }
    setCurrent((row) => row.slice(0, -1));
  }

  function check() {
    if (over || !word) {
      return;
    }

    if (current.length < word.phonemes.length) {
      const left = word.phonemes.length - current.length;
      setMsg("Pick " + left + " more sound(s).");
      return;
    }

    const result = score(current, word.phonemes);
    const played = [...guesses, { symbols: current, result: result }];

    // Colour the keypad, but never downgrade a key that is already green.
    const states = { ...keyStates };
    for (let i = 0; i < current.length; i++) {
      if (states[current[i]] !== "correct") {
        states[current[i]] = result[i];
      }
    }

    setGuesses(played);
    setKeyStates(states);
    setCurrent([]);

    // Won only if every single tile came back correct.
    let win = true;
    for (let i = 0; i < result.length; i++) {
      if (result[i] !== "correct") {
        win = false;
      }
    }

    if (win) {
      setOver(true);
      setMsg("Correct!");
    } else if (played.length >= maxGuesses) {
      setOver(true);
      setMsg("Out of guesses.");
    } else {
      setMsg("Try again.");
    }
  }

  // Saves the settings, then asks the server to build the file from them.
  async function generate() {
    if (!word) {
      setMsg("Pick a word first.");
      return;
    }

    const res = await fetch("/api/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: activityName,
        type: "wordle",
        listId: listId,
        targetWordId: word.id,
        maxGuesses: maxGuesses,
        showLetters: showLetters,
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
        <h2>Wordle Builder</h2>
        <div className="msg">
          There are no word lists yet. Make one on the Word Lists page first.
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2>Wordle Builder</h2>

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

        <label htmlFor="word">Target word</label>
        <select
          id="word"
          value={chosen ?? ""}
          onChange={(event) => {
            setChosen(Number(event.target.value));
            reset();
          }}
        >
          {words.map((w) => (
            <option key={w.id} value={w.id}>
              {w.english} - /{w.phonemes.join(" ")}/
            </option>
          ))}
        </select>

        <label htmlFor="guesses">Number of guesses</label>
        <select
          id="guesses"
          value={maxGuesses}
          onChange={(event) => {
            // A select always gives back text, so this turns "6" into 6.
            setMaxGuesses(Number(event.target.value));
            reset();
          }}
        >
          <option value={4}>4 (hard)</option>
          <option value={6}>6 (normal)</option>
          <option value={8}>8 (easy)</option>
        </select>

        <label htmlFor="letters">
          <input
            id="letters"
            type="checkbox"
            checked={showLetters}
            onChange={(event) => setShowLetters(event.target.checked)}
          />
          Show English letters on the keys
        </label>

        <label htmlFor="actname">Save this activity as</label>
        <input
          id="actname"
          type="text"
          value={activityName}
          onChange={(event) => setActivityName(event.target.value)}
        />

        <button onClick={generate}>Save and generate</button>
      </div>

      <div className="box">
        <h3>Preview</h3>

        {!word && <p>This list has no words in it yet.</p>}

        {word && (
          <>
            {/* the board size comes from the word stored in the database */}
            <Grid
              rows={maxGuesses}
              cols={word.phonemes.length}
              guesses={guesses}
              current={current}
            />

            {msg && <div className="msg">{msg}</div>}

            {over && (
              <div className="answer">
                /{word.phonemes.join(" ")}/ = <b>{word.english}</b>
              </div>
            )}

            <Keypad
              phonemes={phonemes}
              onPick={pick}
              keyStates={keyStates}
              showLetters={showLetters}
            />

            <button onClick={check}>Check</button>
            <button onClick={back}>Delete</button>
            <button onClick={reset}>Restart</button>
          </>
        )}
      </div>
    </div>
  );
}
