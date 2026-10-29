import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import type { ReactNode } from "react";

import { loginRequest } from "../api/auth";
import { AuthContext } from "./AuthContext";
import type { AuthContextValue } from "./AuthContext";
import { clearSession, getState, setSession, subscribe } from "./sessionStore";

// Sign out slightly before the server would refuse the token.
const EXPIRY_MARGIN_MS = 5_000;

function AuthProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(subscribe, getState);
  const expiresAt = state.session?.expiresAt;

  // Sign the user out when the token runs out, rather than waiting for the
  // next request to fail.
  useEffect(() => {
    if (expiresAt === undefined) return;
    const timer = setTimeout(
      () => clearSession("expired"),
      Math.max(expiresAt - Date.now(), 0),
    );
    return () => clearTimeout(timer);
  }, [expiresAt]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await loginRequest(email.trim(), password);
    setSession({
      token: response.accessToken,
      user: response.user,
      expiresAt: Date.now() + response.expiresIn * 1000 - EXPIRY_MARGIN_MS,
    });
  }, []);

  const logout = useCallback(() => clearSession(), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: state.session?.user ?? null,
      sessionExpired: state.endedBy === "expired",
      login,
      logout,
    }),
    [state, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
