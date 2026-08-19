"use client";

import { useState } from "react";
import Keypad from "@/components/Keypad";

export default function AddWord({ onAdd, existing }) {
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

  function add() {
    const name = spelling.trim().toLowerCase();

    if (name === "") {
      setMsg("Type the English spelling first.");
      return;
    }

    if (parts.length < 2) {
      setMsg("Pick at least two phonemes.");
      return;
    }

    if (existing.some((w) => w.word === name)) {
      setMsg(name + " is already in the list.");
      return;
    }

    onAdd({ word: name, phonemes: parts });
    setSpelling("");
    setParts([]);
    setMsg("Added " + name + ".");
  }

  return (
    <div className="box">
      <h3>Add your own word</h3>

      <label htmlFor="spelling">English spelling</label>
      <input
        id="spelling"
        type="text"
        value={spelling}
        onChange={(event) => setSpelling(event.target.value)}
        placeholder="for example: shop"
      />

      <label>Phonemes</label>
      <div className="parts">
        {parts.length === 0 ? "Use the buttons below" : "/" + parts.join(" ") + "/"}
      </div>

      <Keypad onPick={pick} keyStates={{}} showLetters={true} />

      {msg && <div className="msg">{msg}</div>}

      <button onClick={add}>Add word</button>
      <button onClick={back}>Delete phoneme</button>
    </div>
  );
}