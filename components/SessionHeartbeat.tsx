"use client";
import { useEffect } from "react";

export default function SessionHeartbeat({ intervalMs = 15000 }: { intervalMs?: number }) {
  useEffect(() => {
    let active = true;
    const tick = () => {
      fetch("/api/session-lock", { method: "POST" }).catch(() => {});
    };
    // initial ping
    tick();
    const id = setInterval(tick, intervalMs);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [intervalMs]);
  return null;
}
