"use client";

import { useState } from "react";
import { words } from "@/lib/words";

export default function WordlePage() {
  const [chosen, setChosen] = useState("thin");

  const word = words.find((w) => w.word === chosen);

  return (
    <div>
      <h2>Wordle Builder</h2>

      <div className="box">
        <h3>Settings</h3>

        <label htmlFor="word">Target word</label>
        <select
          id="word"
          value={chosen}
          onChange={(event) => setChosen(event.target.value)}
        >
          {words.map((w) => (
            <option key={w.word} value={w.word}>
              {w.word} - /{w.phonemes.join(" ")}/
            </option>
          ))}
        </select>

        <p>
          Answer: /{word.phonemes.join(" ")}/ = <b>{word.word}</b>
        </p>
      </div>
    </div>
  );
}