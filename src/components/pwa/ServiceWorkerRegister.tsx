"use client";

import { useEffect } from "react";

/**
 * Registers the service worker that makes NudGoo installable and gives it a
 * basic offline shell. Registration only runs in production builds where the
 * SW file is served from /public; in dev it is intentionally skipped.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Registration failures are non-fatal — the app still works online.
      });
    };

    window.addEventListener("load", register);
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
