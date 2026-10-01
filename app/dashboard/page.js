"use client";

import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [healthy, setHealthy] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [updated, setUpdated] = useState("");

  useEffect(() => {
    async function load() {
      const health = await fetch("/health");
      setHealthy(health.ok);

      const res = await fetch("/api/stats");
      if (res.ok) {
        setStats(await res.json());
      }

      const alertRes = await fetch("/api/alerts");
      if (alertRes.ok) {
        setAlerts(await alertRes.json());
      }
      setUpdated(new Date().toLocaleTimeString());
    }

    load();
    // check again every 10 seconds
    const timer = setInterval(load, 10000);
    return () => clearInterval(timer);
  }, []);

  if (!stats) {
    return (
      <div>
        <h2>Dashboard</h2>
        {healthy === false ? (
          <p className="msg">
            <strong>Problem:</strong> the database is not answering, so nothing can be shown.
          </p>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    );
  }

  const g = stats.generations;

  return (
    <div>
      <h2>Dashboard</h2>
      <p>
        How the builder is being used, from the database. Updates every 10 seconds.
        {stats.simulated > 0 && " Includes " + stats.simulated + " simulated records."}
      </p>

      <div className="box">
        <h3>Alerts</h3>
        {!healthy && (
          <p className="msg">
            <strong>Problem:</strong> the database is not answering. Nothing can be saved or generated.
          </p>
        )}
        {healthy && alerts.length === 0 && <p className="msg">No problems found.</p>}
        {alerts.map((alert, i) => (
          <p key={i} className="msg">
            <strong className={alert.level === "error" ? "bad" : ""}>
              {alert.level === "error" ? "Problem:" : "Warning:"}
            </strong>{" "}
            {alert.text}
          </p>
        ))}
      </div>

      <div className="box">
        <h3>System</h3>
        <ul className="wordlist">
          <li>
            <strong>Health:</strong>{" "}
            {healthy ? (
              <span className="good">OK - the website and database are working</span>
            ) : (
              <span className="bad">Down - the database is not answering</span>
            )}
          </li>
          <li>
            <strong>Last checked:</strong> {updated}
          </li>
        </ul>
      </div>

      <div className="box">
        <h3>Activities</h3>
        <ul className="wordlist">
          <li>
            <strong>Activities created:</strong> {stats.activities.total} ({stats.activities.wordle} Wordle,{" "}
            {stats.activities.wordsearch} Word Search)
          </li>
          <li>
            <strong>Most-used type:</strong> {stats.mostUsed} (generated {g.wordle} Wordle, {g.wordsearch} Word
            Search)
          </li>
          <li>
            <strong>Difficulty:</strong> {stats.difficulty.easy} easy, {stats.difficulty.normal} normal,{" "}
            {stats.difficulty.hard} hard
          </li>
        </ul>
      </div>

      <div className="box">
        <h3>Generating</h3>
        <ul className="wordlist">
          <li>
            <strong>Successful generations:</strong> {g.succeeded}
          </li>
          <li>
            <strong>Failed generations:</strong> <span className={g.failed > 0 ? "bad" : ""}>{g.failed}</span>
          </li>
          <li>
            <strong>Success rate:</strong> {g.successRate}% of {g.total} tries
          </li>
        </ul>
      </div>

      <div className="box">
        <h3>Word lists</h3>
        <p>
          {stats.lists} lists, {stats.words} words and {stats.sounds} sounds stored.
        </p>
      </div>

      <div className="box">
        <h3>Time on page</h3>
        <p>
          <strong>Average:</strong> {stats.averageTime} seconds across all pages
        </p>
        <ul className="wordlist">
          {stats.timeOnPage.map((row) => (
            <li key={row.page}>
              <strong>{row.page}</strong> - {row.visits} visits, {row.average} seconds on average
            </li>
          ))}
        </ul>
      </div>

      <div className="box">
        <h3>Recent generated activities</h3>
        {stats.outputs.length === 0 && <p>Nothing has been generated yet.</p>}
        <ul className="wordlist">
          {stats.outputs.map((out) => (
            <li key={out.id}>
              <strong>{out.name}</strong> - {out.type === "wordle" ? "Wordle" : "Word Search"}
              {out.list && " from " + out.list + " (" + out.difficulty + ")"}, {new Date(out.when).toLocaleString()} -{" "}
              {out.success ? (
                <span className="good">worked</span>
              ) : (
                <span className="bad">failed: {out.message}</span>
              )}
              {out.activityId && (
                <>
                  {" "}
                  <a href={"/api/activities/" + out.activityId + "/download"}>Download</a>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
