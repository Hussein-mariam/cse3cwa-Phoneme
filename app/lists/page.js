"use client";

import { useEffect, useState } from "react";
import AddWord from "@/components/AddWord";
import { hintFor, findPhoneme } from "@/lib/hint";

// Manage the word lists stored in the database: create, read, update, delete.
export default function ListsPage() {
  const [lists, setLists] = useState([]);
  const [phonemes, setPhonemes] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [words, setWords] = useState([]);
  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  // Load the lists and the sound inventory once, when the page opens.
  useEffect(() => {
    async function load() {
      const listsRes = await fetch("/api/lists");
      const phonemesRes = await fetch("/api/phonemes");
      setLists(await listsRes.json());
      setPhonemes(await phonemesRes.json());
    }
    load();
  }, []);

  async function refreshLists() {
    const res = await fetch("/api/lists");
    setLists(await res.json());
  }

  async function openList(id) {
    setOpenId(id);
    setEditing(null);
    const res = await fetch("/api/words?listId=" + id);
    setWords(await res.json());
  }

  async function createList() {
    if (newName.trim() === "") {
      setMsg("Give the list a name first.");
      return;
    }

    setBusy(true);
    const res = await fetch("/api/lists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    });
    const data = await res.json();
    setBusy(false);

    if (!res.ok) {
      setMsg(data.error);
      return;
    }

    setNewName("");
    setMsg("Created " + data.name + ".");
    await refreshLists();
  }

  async function renameList(list) {
    const name = window.prompt("New name for this list:", list.name);
    if (name === null) {
      return;
    }

    const res = await fetch("/api/lists/" + list.id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name }),
    });
    const data = await res.json();

    setMsg(res.ok ? "Renamed to " + data.name + "." : data.error);
    await refreshLists();
  }

  async function deleteList(list) {
    if (!window.confirm("Delete " + list.name + " and all its words?")) {
      return;
    }

    const res = await fetch("/api/lists/" + list.id, { method: "DELETE" });
    const data = await res.json();

    setMsg(res.ok ? "Deleted " + list.name + "." : data.error);

    if (openId === list.id) {
      setOpenId(null);
      setWords([]);
    }
    await refreshLists();
  }

  // Returns an error message, or nothing if it saved. AddWord shows it.
  async function addWord(word) {
    setBusy(true);
    const res = await fetch("/api/words", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        english: word.english,
        phonemes: word.phonemes,
        listId: openId,
      }),
    });
    const data = await res.json();
    setBusy(false);

    if (!res.ok) {
      return data.error;
    }

    await openList(openId);
    await refreshLists();
  }

  async function saveEdit() {
    const res = await fetch("/api/words/" + editing.id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        english: editing.english,
        phonemes: editing.phonemes,
      }),
    });
    const data = await res.json();

    if (!res.ok) {
      setMsg(data.error);
      return;
    }

    setMsg("Saved " + data.english + ".");
    setEditing(null);
    await openList(openId);
  }

  async function deleteWord(word) {
    if (!window.confirm("Delete " + word.english + "?")) {
      return;
    }

    const res = await fetch("/api/words/" + word.id, { method: "DELETE" });
    const data = await res.json();

    setMsg(res.ok ? "Deleted " + word.english + "." : data.error);
    await openList(openId);
    await refreshLists();
  }

  const current = lists.find((l) => l.id === openId);

  return (
    <div>
      <h2>Word Lists</h2>
      <p>Everything on this page is stored in the database.</p>

      {msg && <div className="msg">{msg}</div>}

      <div className="box">
        <h3>Your lists</h3>

        {lists.length === 0 && <p>No lists yet.</p>}

        <ul className="wordlist">
          {lists.map((list) => (
            <li key={list.id}>
              <strong>{list.name}</strong> - {list._count.words} words
              <button onClick={() => openList(list.id)}>Open</button>
              <button onClick={() => renameList(list)}>Rename</button>
              <button onClick={() => deleteList(list)}>Delete</button>
            </li>
          ))}
        </ul>

        <label htmlFor="newlist">New list name</label>
        <input
          id="newlist"
          type="text"
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          placeholder="for example: Week 4 sh sounds"
        />
        <button onClick={createList} disabled={busy}>
          Create list
        </button>
      </div>

      {openId !== null && (
        <div className="box">
          <h3>Words in {current ? current.name : "this list"}</h3>

          {words.length === 0 && <p>This list has no words yet.</p>}

          <ul className="wordlist">
            {words.map((word) => (
              <li key={word.id}>
                <strong>{word.english}</strong> - /
                {word.phonemes.map((symbol, i) => (
                  <span
                    key={i}
                    className="chip"
                    title={hintFor(findPhoneme(phonemes, symbol))}
                  >
                    {symbol}
                  </span>
                ))}
                /
                <button onClick={() => setEditing({ ...word })}>Edit</button>
                <button onClick={() => deleteWord(word)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {editing && (
        <div className="box">
          <h3>Editing {editing.english}</h3>

          <label htmlFor="spellingEdit">English spelling</label>
          <input
            id="spellingEdit"
            type="text"
            value={editing.english}
            onChange={(event) =>
              setEditing({ ...editing, english: event.target.value })
            }
          />

          <label>Sounds</label>
          <div className="parts">/{editing.phonemes.join(" ")}/</div>

          <div className="keypad">
            {phonemes.map((p) => (
              <button
                key={p.symbol}
                className="key"
                onClick={() =>
                  setEditing({
                    ...editing,
                    phonemes: [...editing.phonemes, p.symbol],
                  })
                }
              >
                {p.symbol}
                <span className="small">{p.letters}</span>
                <span className="tip">{hintFor(p)}</span>
              </button>
            ))}
          </div>

          <button onClick={saveEdit}>Save changes</button>
          <button
            onClick={() =>
              setEditing({
                ...editing,
                phonemes: editing.phonemes.slice(0, -1),
              })
            }
          >
            Delete sound
          </button>
          <button onClick={() => setEditing(null)}>Cancel</button>
        </div>
      )}

      {openId !== null && (
        <AddWord phonemes={phonemes} onAdd={addWord} busy={busy} />
      )}
    </div>
  );
}
