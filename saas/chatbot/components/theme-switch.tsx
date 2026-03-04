"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeSwitch() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="inline-flex items-center gap-1.5 text-muted-foreground text-sm hover:text-foreground transition-colors"
    >
      {theme === "dark" ? (
        <>
          <Sun className="size-3.5" />
          <span>Light mode</span>
        </>
      ) : (
        <>
          <Moon className="size-3.5" />
          <span>Dark mode</span>
        </>
      )}
    </button>
  );
}
