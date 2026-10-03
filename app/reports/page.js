"use client";

import { useEffect, useState } from "react";

export default function ReportsPage() {
  const [report, setReport] = useState(null);
  const [msg, setMsg] = useState("");
  // pressing Refresh adds one to this, which makes the useEffect below load again
  const [refreshes, setRefreshes] = useState(0);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/reports");
      if (res.ok) {
        setReport(await res.json());
        setMsg("");
      } else {
        setMsg("Could not load the reports. The database may be down.");
      }
    }
    load();
  }, [refreshes]);

  if (!report) {
    return (
      <div>
        <h2>Reports</h2>
        {msg ? <p className="msg">{msg}</p> : <p>Loading...</p>}
      </div>
    );
  }

  // totals for the 14 days, for the bottom row of the first table
  let worked = 0;
  let failed = 0;
  let wordles = 0;
  let wordSearches = 0;
  for (const row of report.days) {
    worked += row.worked;
    failed += row.failed;
    wordles += row.wordles;
    wordSearches += row.wordSearches;
  }

  const d = report.difficulty;
  const s = report.settings;

  return (
    <div>
      <h2>Reports</h2>
      <p>
        How the builder has been used over time. Everything comes from the database.{" "}
        <button onClick={() => setRefreshes(refreshes + 1)}>Refresh</button>
      </p>
      {msg && <p className="msg">{msg}</p>}

      <div className="box">
        <h3>The last 14 days</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Day</th>
              <th>Generated</th>
              <th>Failed</th>
              <th>Wordles created</th>
              <th>Word searches created</th>
            </tr>
          </thead>
          <tbody>
            {report.days.map((row) => (
              <tr key={row.day}>
                <td>{row.day}</td>
                <td>{row.worked}</td>
                <td className={row.failed > 0 ? "bad" : ""}>{row.failed}</td>
                <td>{row.wordles}</td>
                <td>{row.wordSearches}</td>
              </tr>
            ))}
            <tr>
              <th>Total</th>
              <th>{worked}</th>
              <th>{failed}</th>
              <th>{wordles}</th>
              <th>{wordSearches}</th>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="box">
        <h3>Word list usage</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Word list</th>
              <th>Words</th>
              <th>Activities</th>
              <th>Times generated</th>
            </tr>
          </thead>
          <tbody>
            {report.listUsage.map((list) => (
              <tr key={list.name}>
                <td>{list.name}</td>
                <td className={list.words === 0 ? "bad" : ""}>{list.words}</td>
                <td>{list.activities}</td>
                <td>{list.generated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="box">
        <h3>Difficulty by type</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Easy</th>
              <th>Normal</th>
              <th>Hard</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Wordle</td>
              <td>{d.wordle.easy}</td>
              <td>{d.wordle.normal}</td>
              <td>{d.wordle.hard}</td>
            </tr>
            <tr>
              <td>Word Search</td>
              <td>{d.wordsearch.easy}</td>
              <td>{d.wordsearch.normal}</td>
              <td>{d.wordsearch.hard}</td>
            </tr>
          </tbody>
        </table>
        <p>Easy, normal and hard come from 8, 6 or 4 guesses, or an 8, 10 or 12 grid.</p>
      </div>

      <div className="box">
        <h3>Output settings</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Setting</th>
              <th>On</th>
              <th>Off</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Wordle - English letters on the keys</td>
              <td>{s.lettersOn}</td>
              <td>{s.lettersOff}</td>
            </tr>
            <tr>
              <td>Word Search - English spelling in the word list</td>
              <td>{s.englishOn}</td>
              <td>{s.englishOff}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="box">
        <h3>Recent failures</h3>
        {report.recentFailures.length === 0 && <p>No generations have failed.</p>}
        {report.recentFailures.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th>When</th>
                <th>Activity</th>
                <th>Type</th>
                <th>Word list</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {report.recentFailures.map((f) => (
                <tr key={f.id}>
                  <td>{new Date(f.when).toLocaleString()}</td>
                  <td>{f.name}</td>
                  <td>{f.type === "wordle" ? "Wordle" : "Word Search"}</td>
                  <td>{f.list}</td>
                  <td className="bad">{f.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
