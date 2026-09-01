"use client";

import { useEffect } from "react";
import { getCookie } from "@/lib/cookies";

export default function Theme() {
  useEffect(() => {
    const theme = getCookie("theme");

    if (theme) {
      document.documentElement.setAttribute(
        "data-theme",
        theme
      );
    }

    const textSize = getCookie("textsize");

    if (textSize) {
      document.documentElement.setAttribute(
        "data-text",
        textSize
      );
    }
  }, []);

  return null;
}