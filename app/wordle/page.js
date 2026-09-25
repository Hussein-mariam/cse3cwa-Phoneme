"use client";

import { useEffect, useState } from "react";

import { words } from "@/lib/words";
import { score } from "@/lib/score";
import { exportWordle } from "@/lib/exportWordle";

import Grid from "@/components/Grid";
import Keypad from "@/components/Keypad";
import AddWord from "@/components/AddWord";

export default function WordlePage() {
  const [extra, setExtra] = useState([]);
  const [chosen, setChosen] = useState("thin");

  const [maxGuesses, setMaxGuesses] = useState(6);
  const [showLetters, setShowLetters] = useState(true);

  const [current, setCurrent] = useState([]);
  const [guesses, setGuesses] = useState([]);

  const [keyStates, setKeyStates] = useState({});
  const [msg, setMsg] = useState("");
  const [over, setOver] = useState(false);

  useEffect(() => {
    const savedWords =
      localStorage.getItem("extraWords");

    if (savedWords) {
      setExtra(JSON.parse(savedWords));
    }
  }, []);

  const allWords = [...words, ...extra];

  const word =
    allWords.find(
      (item) => item.word === chosen
    ) || allWords[0];

  function reset() {
    setCurrent([]);
    setGuesses([]);
    setKeyStates({});
    setMsg("");
    setOver(false);
  }

  function addWord(newWord) {
    const newExtraWords = [
      ...extra,
      newWord
    ];

    setExtra(newExtraWords);

    localStorage.setItem(
      "extraWords",
      JSON.stringify(newExtraWords)
    );

    setChosen(newWord.word);

    reset();
  }

  function removeWord(name) {
    const newExtraWords = extra.filter(
      (item) => item.word !== name
    );

    setExtra(newExtraWords);

    localStorage.setItem(
      "extraWords",
      JSON.stringify(newExtraWords)
    );

    if (chosen === name) {
      setChosen(words[0].word);
    }

    reset();
  }

  function changeWord(event) {
    setChosen(event.target.value);
    reset();
  }

  function changeGuesses(event) {
    const number = Number(event.target.value);

    setMaxGuesses(number);

    reset();
  }

  function pick(symbol) {
    if (over) {
      return;
    }

    if (current.length >= word.phonemes.length) {
      return;
    }

    const newCurrent = [
      ...current,
      symbol
    ];

    setCurrent(newCurrent);
    setMsg("");
  }

  function back() {
    if (over) {
      return;
    }

    const newCurrent =
      current.slice(0, -1);

    setCurrent(newCurrent);
  }

  function check() {
    if (over) {
      return;
    }

    if (
      current.length <
      word.phonemes.length
    ) {
      const left =
        word.phonemes.length -
        current.length;

      setMsg(
        "Pick " +
        left +
        " more phoneme(s)."
      );

      return;
    }

    const result = score(
      current,
      word.phonemes
    );

    const newGuess = {
      symbols: current,
      result: result
    };

    const newGuesses = [
      ...guesses,
      newGuess
    ];

    const newKeyStates = {
      ...keyStates
    };

    for (let i = 0; i < current.length; i++) {
      if (
        newKeyStates[current[i]] !==
        "correct"
      ) {
        newKeyStates[current[i]] =
          result[i];
      }
    }

    setGuesses(newGuesses);
    setKeyStates(newKeyStates);
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
    } else if (
      newGuesses.length >= maxGuesses
    ) {
      setOver(true);
      setMsg("Out of guesses.");
    } else {
      setMsg("Try again.");
    }
  }

  function download() {
    const html = exportWordle(
      word,
      maxGuesses,
      showLetters
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
      "phoneme-wordle.html";

    link.click();

    URL.revokeObjectURL(url);

    setMsg(
      "Downloaded phoneme-wordle.html"
    );
  }

  return (
    <div>
      <h2>Wordle Builder</h2>

      <div className="box">
        <h3>Settings</h3>

        <label htmlFor="word">
          Target word
        </label>

        <select
          id="word"
          value={chosen}
          onChange={changeWord}
        >
          {allWords.map((item) => (
            <option
              key={item.word}
              value={item.word}
            >
              {item.word} - /
              {item.phonemes.join(" ")}
              /
            </option>
          ))}
        </select>

        <label htmlFor="guesses">
          Number of guesses
        </label>

        <select
          id="guesses"
          value={maxGuesses}
          onChange={changeGuesses}
        >
          <option value={4}>
            4 (hard)
          </option>

          <option value={6}>
            6 (normal)
          </option>

          <option value={8}>
            8 (easy)
          </option>
        </select>

        <label htmlFor="letters">
          <input
            id="letters"
            type="checkbox"
            checked={showLetters}
            onChange={(event) =>
              setShowLetters(
                event.target.checked
              )
            }
          />

          Show English letters on the keys
        </label>

        <button onClick={download}>
          Generate
        </button>
      </div>

      <AddWord
        onAdd={addWord}
        existing={allWords}
      />

      {extra.length > 0 && (
        <div className="box">
          <h3>Your words</h3>

          <ul className="yourwords">
            {extra.map((item) => (
              <li key={item.word}>
                {item.word} - /
                {item.phonemes.join(" ")}
                /

                <button
                  onClick={() =>
                    removeWord(item.word)
                  }
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="box">
        <h3>Preview</h3>

        <Grid
          rows={maxGuesses}
          cols={word.phonemes.length}
          guesses={guesses}
          current={current}
        />

        {msg && (
          <div className="msg">
            {msg}
          </div>
        )}

        {over && (
          <div className="answer">
            /{word.phonemes.join(" ")}/ ={" "}
            <b>{word.word}</b>
          </div>
        )}

        <Keypad
          onPick={pick}
          keyStates={keyStates}
          showLetters={showLetters}
        />

        <button onClick={check}>
          Check
        </button>

        <button onClick={back}>
          Delete
        </button>

        <button onClick={reset}>
          Restart
        </button>
      </div>
    </div>
  );
}