"use client";

import { useEffect } from "react";
import { getCookie } from "@/lib/cookies";

// reads the saved settings when the page loads and puts them on the <html> tag.
export default function Theme() {
  useEffect(() => {
    const theme = getCookie("theme");
    if (theme) {
      document.documentElement.setAttribute("data-theme", theme);
    }

    const text = getCookie("textsize");
    if (text) {
      document.documentElement.setAttribute("data-text", text);
    }
  }, []);

  // This component draws nothing, it just applies the settings.
  return null;
}