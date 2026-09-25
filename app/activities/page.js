"use client";

import { useEffect, useState } from "react";

// Every saved builder configuration. Each one can be generated again at any
// time, because the settings and the words are both in the database.
export default function ActivitiesPage() {
  const [activities, setActivities] = useState([]);
  const [lists, setLists] = useState([]);
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    async function load() {
      const actRes = await fetch("/api/activities");
      const listRes = await fetch("/api/lists");
      setActivities(await actRes.json());
      setLists(await listRes.json());
    }
    load();
  }, []);

  async function refresh() {
    const res = await fetch("/api/activities");
    setActivities(await res.json());
  }

  async function saveEdit() {
    const res = await fetch("/api/activities/" + editing.id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editing.name,
        type: editing.type,
        listId: editing.listId,
        maxGuesses: editing.maxGuesses,
        gridSize: editing.gridSize,
        difficulty: editing.difficulty,
        showHints: editing.showHints,
        showLetters: editing.showLetters,
        showEnglish: editing.showEnglish,
        targetWordId: editing.targetWordId,
      }),
    });
    const data = await res.json();

    if (!res.ok) {
      setMsg(data.error);
      return;
    }

    setMsg("Saved " + data.name + ".");
    setEditing(null);
    await refresh();
  }

  async function remove(activity) {
    if (!window.confirm("Delete " + activity.name + "?")) {
      return;
    }

    const res = await fetch("/api/activities/" + activity.id, { method: "DELETE" });
    const data = await res.json();

    setMsg(res.ok ? "Deleted " + activity.name + "." : data.error);
    await refresh();
  }

  return (
    <div>
      <h2>Saved Activities</h2>
      <p>
        These are the configurations stored in the database. Generating one
        rebuilds the HTML file from the words as they are right now.
      </p>

      {msg && <div className="msg">{msg}</div>}

      {activities.length === 0 && (
        <div className="box">
          <p>
            Nothing saved yet. Build one on the Wordle or Word Search page and
            press Save and generate.
          </p>
        </div>
      )}

      {activities.map((activity) => (
        <div className="box" key={activity.id}>
          <h3>{activity.name}</h3>

          <p>
            {activity.type === "wordle" ? "Wordle" : "Word search"} using{" "}
            <strong>{activity.list.name}</strong> ({activity.list._count.words} words)
            {activity.type === "wordle"
              ? " - " + activity.maxGuesses + " guesses"
              : " - " + activity.gridSize + " x " + activity.gridSize + " grid"}
            {activity.targetWord ? " - answer: " + activity.targetWord.english : ""}
          </p>

          <a className="btnlink" href={"/api/activities/" + activity.id + "/download"}>
            Generate
          </a>
          <button onClick={() => setEditing({ ...activity })}>Edit</button>
          <button onClick={() => remove(activity)}>Delete</button>
        </div>
      ))}

      {editing && (
        <div className="box">
          <h3>Editing {editing.name}</h3>

          <label htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            value={editing.name}
            onChange={(event) => setEditing({ ...editing, name: event.target.value })}
          />

          <label htmlFor="elist">Word list</label>
          <select
            id="elist"
            value={editing.listId}
            onChange={(event) =>
              setEditing({ ...editing, listId: Number(event.target.value) })
            }
          >
            {lists.map((list) => (
              <option key={list.id} value={list.id}>
                {list.name}
              </option>
            ))}
          </select>

          {editing.type === "wordle" ? (
            <>
              <label htmlFor="eguesses">Number of guesses</label>
              <select
                id="eguesses"
                value={editing.maxGuesses}
                onChange={(event) =>
                  setEditing({ ...editing, maxGuesses: Number(event.target.value) })
                }
              >
                <option value={4}>4 (hard)</option>
                <option value={6}>6 (normal)</option>
                <option value={8}>8 (easy)</option>
              </select>
            </>
          ) : (
            <>
              <label htmlFor="esize">Grid size</label>
              <select
                id="esize"
                value={editing.gridSize}
                onChange={(event) =>
                  setEditing({ ...editing, gridSize: Number(event.target.value) })
                }
              >
                <option value={8}>8 x 8</option>
                <option value={10}>10 x 10</option>
                <option value={12}>12 x 12</option>
              </select>
            </>
          )}

          <button onClick={saveEdit}>Save changes</button>
          <button onClick={() => setEditing(null)}>Cancel</button>
        </div>
      )}
    </div>
  );
}
