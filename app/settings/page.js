"use client";

import { useState } from "react";
import { getCookie, setCookie } from "@/lib/cookies";

export default function SettingsPage() {
  const [msg, setMsg] = useState("");

  function chooseTheme(theme) {
    setCookie("theme", theme);
    // change the page straight away as well as saving it.
    document.documentElement.setAttribute("data-theme", theme);
    setMsg("Theme set to " + theme + " and saved in a cookie.");
  }

  function chooseText(size) {
    setCookie("textsize", size);
    document.documentElement.setAttribute("data-text", size);
    setMsg("Text size set to " + size + " and saved in a cookie.");
  }

  return (
    <div>
      <h2>Settings</h2>
      <p>These are saved in cookies, so they stay set next time you visit.</p>

      <div className="box">
        <h3>Theme</h3>
        <p>Choose a light or dark colour scheme for the whole site.</p>
        <button onClick={() => chooseTheme("light")}>Light mode</button>
        <button onClick={() => chooseTheme("dark")}>Dark mode</button>
      </div>

      <div className="box">
        <h3>Text size</h3>
        <p>Larger text can help students who find the phoneme symbols small.</p>
        <button onClick={() => chooseText("normal")}>Normal text</button>
        <button onClick={() => chooseText("large")}>Large text</button>
      </div>

      {msg && <div className="msg">{msg}</div>}


    </div>
  );
}