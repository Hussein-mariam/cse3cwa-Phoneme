"use client";

import { useEffect, useState } from "react";

// Every activity saved from the Wordle and Word Search pages.
export default function ActivitiesPage() {
  const [activities, setActivities] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/activities");
      setActivities(await res.json());
    }
    load();
  }, []);

  async function refresh() {
    const res = await fetch("/api/activities");
    setActivities(await res.json());
  }

  // Saves the activity again with some of its settings changed.
  async function update(activity, changes) {
    const res = await fetch("/api/activities/" + activity.id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...activity, ...changes }),
    });
    const data = await res.json();

    setMsg(res.ok ? "Saved " + data.name + "." : data.error);
    await refresh();
  }

  // Clicking a link downloads the file without leaving this page.
  function generate(activity) {
    const link = document.createElement("a");
    link.href = "/api/activities/" + activity.id + "/download";
    link.click();
  }

  async function rename(activity) {
    const name = window.prompt("New name for this activity:", activity.name);
    if (name === null) {
      return;
    }
    await update(activity, { name: name });
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
        Generate builds the file again from the words in the database, so it
        always uses the list as it is right now.
      </p>

      {msg && <div className="msg">{msg}</div>}

      {activities.length === 0 && (
        <p>Nothing saved yet. Use Save and generate on the Wordle or Word Search page.</p>
      )}

      <ul className="wordlist">
        {activities.map((activity) => (
          <li key={activity.id}>
            <strong>{activity.name}</strong> -{" "}
            {activity.type === "wordle" ? "Wordle" : "Word search"} from{" "}
            {activity.list.name}
            <button onClick={() => generate(activity)}>Generate</button>
            <button onClick={() => rename(activity)}>Rename</button>
            {activity.type === "wordle" ? (
              <button onClick={() => update(activity, { showLetters: !activity.showLetters })}>
                {activity.showLetters ? "Turn letters off" : "Turn letters on"}
              </button>
            ) : (
              <button onClick={() => update(activity, { showEnglish: !activity.showEnglish })}>
                {activity.showEnglish ? "Turn English off" : "Turn English on"}
              </button>
            )}
            <button onClick={() => remove(activity)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
