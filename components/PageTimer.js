"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// times how long each page is open and sends it to /api/visits when you leave,
// so the dashboard can show the average time on page
export default function PageTimer() {
  const page = usePathname();

  useEffect(() => {
    const start = Date.now();

    function send() {
      let seconds = Math.round((Date.now() - start) / 1000);
      if (seconds < 1) {
        return;
      }
      // a tab left open for hours would throw the average off, so cap it at 30 minutes
      if (seconds > 1800) {
        seconds = 1800;
      }
      // sendBeacon still gets sent even while the tab is closing
      const data = new Blob([JSON.stringify({ page: page, seconds: seconds })], { type: "application/json" });
      navigator.sendBeacon("/api/visits", data);
    }

    window.addEventListener("pagehide", send);

    // this runs when you go to a different page in the app
    return () => {
      window.removeEventListener("pagehide", send);
      send();
    };
  }, [page]);

  return null;
}
