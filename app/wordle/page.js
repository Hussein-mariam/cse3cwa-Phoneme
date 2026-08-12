"use client";

import { useState } from "react";
import { words } from "@/lib/words";
import { score } from "@/lib/score";
import Grid from "@/components/Grid";
import Keypad from "@/components/Keypad";

export default function WordlePage() {
  const [chosen, setChosen] = useState("thin");
  const [current, setCurrent] = useState([]);
  const [guesses, setGuesses] = useState([]);
  const [keyStates, setKeyStates] = useState({});
  const [msg, setMsg] = useState("");
  const [over, setOver] = useState(false);

  const word = words.find((w) => w.word === chosen);

  function reset() {
    setCurrent([]);
    setGuesses([]);
    setKeyStates({});
    setMsg("");
    setOver(false);
  }

  function changeWord(event) {
    setChosen(event.target.value);
    reset();
  }

  function pick(symbol) {
    if (over || current.length >= word.phonemes.length) {
      return;
    }
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
    if (over) {
      return;
    }

    if (current.length < word.phonemes.length) {
      const left = word.phonemes.length - current.length;
      setMsg("Pick " + left + " more phoneme(s).");
      return;
    }

    const result = score(current, word.phonemes);
    const played = [...guesses, { symbols: current, result: result }];

    const states = { ...keyStates };
    for (let i = 0; i < current.length; i++) {
      if (states[current[i]] !== "correct") {
        states[current[i]] = result[i];
      }
    }

    setGuesses(played);
    setKeyStates(states);
    setCurrent([]);

    let win = true;
    for (let i = 0; i < result.length; i++) {
      if (result[i] !== "correct") {
        win = false;
      }
    }

    if (win) {
      setOver(true);
      setMsg("Correct!");
    } else if (played.length >= 6) {
      setOver(true);
      setMsg("Out of guesses.");
    } else {
      setMsg("Try again.");
    }
  }

  return (
    <div>
      <h2>Wordle Builder</h2>

      <div className="box">
        <h3>Settings</h3>

        <label htmlFor="word">Target word</label>
        <select id="word" value={chosen} onChange={changeWord}>
          {words.map((w) => (
            <option key={w.word} value={w.word}>
              {w.word} - /{w.phonemes.join(" ")}/
            </option>
          ))}
        </select>
      </div>

      <div className="box">
        <h3>Preview</h3>

        <Grid
          rows={6}
          cols={word.phonemes.length}
          guesses={guesses}
          current={current}
        />

        {msg && <div className="msg">{msg}</div>}

        {over && (
          <div className="answer">
            /{word.phonemes.join(" ")}/ = <b>{word.word}</b>
          </div>
        )}

        <Keypad onPick={pick} keyStates={keyStates} showLetters={true} />

        <button onClick={check}>Check</button>
        <button onClick={back}>Delete</button>
        <button onClick={reset}>Restart</button>
      </div>
    </div>
  );
}