"use client";

import { useState } from "react";
import { words } from "@/lib/words";
import Grid from "@/components/Grid";
import Keypad from "@/components/Keypad";
import { score } from "@/lib/score";

export default function WordlePage() {
  const [chosen, setChosen] = useState("thin");
  const [current, setCurrent] = useState([]);

  const word = words.find((w) => w.word === chosen);

  function pick(symbol) {
    if (current.length >= word.phonemes.length) {
      return;
    }
    setCurrent((row) => [...row, symbol]);
  }

  function back() {
    setCurrent((row) => row.slice(0, -1));
  }

  return (
    <div>
      <h2>Wordle Builder</h2>

      <div className="box">
        <h3>Settings</h3>

        <label htmlFor="word">Target word</label>
        <select
          id="word"
          value={chosen}
          onChange={(event) => {
            setChosen(event.target.value);
            setCurrent([]);
          }}
        >
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
          guesses={[]}
          current={current}
        />

        <Keypad onPick={pick} keyStates={{}} showLetters={true} />

        <button onClick={back}>Delete</button>
      </div>
    </div>
  );
}