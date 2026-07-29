import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type AppMode = "user" | "business";
export type Theme = "light" | "dark";

interface AppState {
  mode: AppMode;
  theme: Theme;
  setMode: (m: AppMode) => void;
  toggleMode: () => void;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<AppMode>("user");
  const [theme, setThemeState] = useState<Theme>("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const storedTheme = (typeof localStorage !== "undefined" && localStorage.getItem("tanu-theme")) as Theme | null;
    const storedMode = (typeof localStorage !== "undefined" && localStorage.getItem("tanu-mode")) as AppMode | null;
    if (storedTheme === "light" || storedTheme === "dark") setThemeState(storedTheme);
    else if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) setThemeState("dark");
    if (storedMode === "user" || storedMode === "business") setModeState(storedMode);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const root = document.documentElement;
    root.dataset.mode = mode;
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem("tanu-theme", theme);
    localStorage.setItem("tanu-mode", mode);
  }, [mode, theme, ready]);

  const setMode = (m: AppMode) => setModeState(m);
  const setTheme = (t: Theme) => setThemeState(t);
  const toggleMode = () => setModeState((m) => (m === "user" ? "business" : "user"));
  const toggleTheme = () => setThemeState((t) => (t === "light" ? "dark" : "light"));

  return (
    <Ctx.Provider value={{ mode, theme, setMode, toggleMode, setTheme, toggleTheme }}>
      {children}
    </Ctx.Provider>
  );
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
