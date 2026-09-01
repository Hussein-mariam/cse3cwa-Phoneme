"use client";

import Link from "next/link";
import { useState } from "react";

export default function Nav() {
  const [open, setOpen] = useState(false);

  function closeMenu() {
    setOpen(false);
  }

  return (
    <div className="nav">
      <div className="navlinks">
        <Link href="/">Home</Link>
        <Link href="/wordle">Wordle</Link>
        <Link href="/word-search">Word Search</Link>
        <Link href="/about">About</Link>
        <Link href="/settings">Settings</Link>
      </div>

      <button
        className="menubtn"
        onClick={() => setOpen(!open)}
      >
        Menu
      </button>

      {open && (
        <div className="menulist">
          <Link href="/" onClick={closeMenu}>
            Home
          </Link>

          <Link href="/wordle" onClick={closeMenu}>
            Wordle
          </Link>

          <Link href="/word-search" onClick={closeMenu}>
            Word Search
          </Link>

          <Link href="/about" onClick={closeMenu}>
            About
          </Link>

          <Link href="/settings" onClick={closeMenu}>
            Settings
          </Link>
        </div>
      )}
    </div>
  );
}