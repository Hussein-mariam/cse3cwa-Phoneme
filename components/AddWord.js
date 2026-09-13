"use client";

import { useState } from "react";
import Keypad from "@/components/Keypad";

// Lets a teacher type a spelling and tap the sounds. It does not talk to the
// database itself - it hands the finished word to whichever page is using it,
// and that page saves it. Keeps this component reusable.
export default function AddWord({ phonemes, onAdd, busy }) {
  const [spelling, setSpelling] = useState("");
  const [parts, setParts] = useState([]);
  const [msg, setMsg] = useState("");

  function pick(symbol) {
    setParts((row) => [...row, symbol]);
    setMsg("");
  }

  function back() {
    setParts((row) => row.slice(0, -1));
  }

  async function add() {
    const name = spelling.trim().toLowerCase();

    // The server checks all of this again. These messages are just so the
    // teacher finds out before the request is sent.
    if (name === "") {
      setMsg("Type the English spelling first.");
      return;
    }
    if (parts.length < 1) {
      setMsg("Pick at least one sound.");
      return;
    }

    const error = await onAdd({ english: name, phonemes: parts });

    if (error) {
      setMsg(error);
      return;
    }

    setSpelling("");
    setParts([]);
    setMsg("Added " + name + ".");
  }

  return (
    <div className="box">
      <h3>Add a word</h3>

      <label htmlFor="spelling">English spelling</label>
      <input
        id="spelling"
        type="text"
        value={spelling}
        onChange={(event) => setSpelling(event.target.value)}
        placeholder="for example: shop"
      />

      <label>Sounds</label>
      <div className="parts">
        {parts.length === 0 ? "Use the buttons below" : "/" + parts.join(" ") + "/"}
      </div>

      <Keypad phonemes={phonemes} onPick={pick} keyStates={{}} showLetters={true} />

      {msg && <div className="msg">{msg}</div>}

      <button onClick={add} disabled={busy}>
        {busy ? "Saving..." : "Add word"}
      </button>
      <button onClick={back}>Delete sound</button>
    </div>
  );
}
