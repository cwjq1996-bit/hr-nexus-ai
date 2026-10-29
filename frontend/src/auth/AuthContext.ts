import { createContext } from "react";

import type { CurrentUser } from "../types/auth";

export type AuthContextValue = {
  user: CurrentUser | null;
  // True when the last session ended because the token ran out or was refused.
  sessionExpired: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
