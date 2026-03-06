"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "./_components/theme-toggle";

const TABS = [
  { href: "/design-system", label: "Gallery", exact: true },
  { href: "/design-system/components", label: "Components" },
  { href: "/design-system/tokens", label: "Design Tokens" },
] as const;

export default function DesignSystemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* ── Header with tab nav ── */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-between px-6">
          {/* Left: Logo + Title */}
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-gradient-to-br from-brand-gradient-start to-brand-gradient-end" />
            <div>
              <h1 className="text-sm font-semibold tracking-tight">
                Quantreno Design System
              </h1>
              <p className="text-[10px] text-muted-foreground font-mono">
                v0.2 — 4-Level Tokens
              </p>
            </div>
          </div>

          {/* Center: Tab Nav */}
          <nav className="hidden sm:flex items-center gap-1">
            {TABS.map((tab) => {
              const isActive = "exact" in tab && tab.exact
                ? pathname === tab.href
                : pathname.startsWith(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-brand/10 text-brand"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: Theme Toggle */}
          <ThemeToggle />
        </div>
      </header>

      {/* ── Page Content (each page owns its sidebar) ── */}
      <div className="flex-1">{children}</div>
    </div>
  );
}
