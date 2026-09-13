"use client";

import Link from "next/link";
import { useState } from "react";

export default function Nav() {
  // Whether the small screen menu is open.
  const [open, setOpen] = useState(false);

  return (
    <div className="nav">
      <div className="navlinks">
        <Link href="/">Home</Link>
        <Link href="/lists">Word Lists</Link>
        <Link href="/wordle">Wordle</Link>
        <Link href="/word-search">Word Search</Link>
        <Link href="/activities">Activities</Link>
        <Link href="/about">About</Link>
        <Link href="/settings">Settings</Link>
      </div>

      {/* this button is hidden on desktop by the media query in globals.css */}
      <button className="menubtn" onClick={() => setOpen(!open)}>
        Menu
      </button>

      {open && (
        <div className="menulist">
          <Link href="/" onClick={() => setOpen(false)}>
            Home
          </Link>
          <Link href="/lists" onClick={() => setOpen(false)}>
            Word Lists
          </Link>
          <Link href="/wordle" onClick={() => setOpen(false)}>
            Wordle
          </Link>
          <Link href="/word-search" onClick={() => setOpen(false)}>
            Word Search
          </Link>
          <Link href="/activities" onClick={() => setOpen(false)}>
            Activities
          </Link>
          <Link href="/about" onClick={() => setOpen(false)}>
            About
          </Link>
          <Link href="/settings" onClick={() => setOpen(false)}>
            Settings
          </Link>
        </div>
      )}
    </div>
  );
}
