"use client";

import Link from "next/link";
import { useState } from "react";

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="nav">
      <div className="navlinks">
        <Link href="/">Home</Link>
        <Link href="/wordle">Wordle</Link>
      </div>

      <button className="menubtn" onClick={() => setOpen(!open)}>
        Menu
      </button>

      {open && (
        <div className="menulist">
          <Link href="/" onClick={() => setOpen(false)}>
            Home
          </Link>
          <Link href="/wordle" onClick={() => setOpen(false)}>
            Wordle
          </Link>
        </div>
      )}
    </div>
  );
}