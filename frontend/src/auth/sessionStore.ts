import type { CurrentUser } from "../types/auth";

export type Session = {
  token: string;
  user: CurrentUser;
  expiresAt: number; // ms since the epoch
};

// Why the last session ended, so the login page can explain it.
export type EndReason = "expired" | null;

export type SessionState = {
  session: Session | null;
  endedBy: EndReason;
};

// The access token lives only in this module variable. It is never written to
// localStorage, sessionStorage or a cookie, so a script that reads storage
// cannot find it. The trade-off: reloading the page signs the user out.
let state: SessionState = { session: null, endedBy: null };

const listeners = new Set<() => void>();

function publish(next: SessionState): void {
  state = next;
  listeners.forEach((listener) => listener());
}

// Stable between changes, as useSyncExternalStore requires.
export function getState(): SessionState {
  return state;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setSession(session: Session): void {
  publish({ session, endedBy: null });
}

export function clearSession(reason: EndReason = null): void {
  if (state.session === null && state.endedBy === reason) return;
  publish({ session: null, endedBy: reason });
}
