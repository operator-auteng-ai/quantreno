"use client";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ThemeToggleDemo() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="flex items-center gap-4">
      <Button
        variant="outline"
        size="icon"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </Button>
      <div>
        <p className="text-sm font-medium">Theme Toggle</p>
        <p className="text-xs text-muted-foreground">
          Current: <span className="font-mono">{theme ?? "system"}</span>
        </p>
      </div>
    </div>
  );
}
