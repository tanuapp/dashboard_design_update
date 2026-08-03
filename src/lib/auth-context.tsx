import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { BusinessRole } from "@/lib/mock-data";
import type { GovernmentPermissionPreset } from "@/lib/government/types";
import type { OrganizationType } from "@/lib/organization";

export interface AuthSession {
  role: BusinessRole;
  name: string;
  email: string;
  org: string;
  organizationType?: OrganizationType;
  permissionPreset?: GovernmentPermissionPreset;
}

interface AuthState {
  session: AuthSession | null;
  ready: boolean;
  login: (session: AuthSession, remember: boolean) => void;
  logout: () => void;
}

const STORAGE_KEY = "tanu-auth-session";
const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(STORAGE_KEY);
      if (raw) setSession(JSON.parse(raw));
    } catch {
      // ignore malformed/unavailable storage
    }
    setReady(true);
  }, []);

  const login = (next: AuthSession, remember: boolean) => {
    setSession(next);
    try {
      const raw = JSON.stringify(next);
      if (remember) {
        localStorage.setItem(STORAGE_KEY, raw);
        sessionStorage.removeItem(STORAGE_KEY);
      } else {
        sessionStorage.setItem(STORAGE_KEY, raw);
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore storage failures — session still works in-memory
    }
  };

  const logout = () => {
    setSession(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  return <Ctx.Provider value={{ session, ready, login, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
