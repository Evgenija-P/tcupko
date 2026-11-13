"use client";

import { useSyncExternalStore } from "react";

/**
 * A tiny JSON value persisted in localStorage, shared by every component that reads it and
 * synced across tabs. Server render and first client render use `fallback` (no hydration
 * mismatch); the stored value appears right after hydration.
 */
export function createLocalStore<T>(key: string, fallback: T) {
  const listeners = new Set<() => void>();
  let cachedRaw: string | null = null;
  let cachedValue: T = fallback;

  function read(): T {
    let raw: string | null = null;
    try {
      raw = localStorage.getItem(key);
    } catch {
      return fallback;
    }
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      try {
        cachedValue = raw === null ? fallback : (JSON.parse(raw) as T);
      } catch {
        cachedValue = fallback;
      }
    }
    return cachedValue;
  }

  function write(next: T) {
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // storage full or blocked — keep working in memory for this tab
      cachedRaw = null;
      cachedValue = next;
    }
    listeners.forEach((l) => l());
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) listener();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  }

  function useValue(): T {
    return useSyncExternalStore(subscribe, read, () => fallback);
  }

  return { read, write, useValue };
}
