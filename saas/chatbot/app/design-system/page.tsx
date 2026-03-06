"use client";

import Link from "next/link";
import { GALLERY_CATEGORIES } from "./_components/sections-config";

/* ─────────────────────────────────────────────────────────
   GALLERY — Quantreno Design System

   Overview card grid linking to Components and Tokens pages.
   ───────────────────────────────────────────────────────── */

export default function DesignSystemGallery() {
  const componentCategories = GALLERY_CATEGORIES.filter((c) => c.tab === "components");
  const tokenCategories = GALLERY_CATEGORIES.filter((c) => c.tab === "tokens");

  return (
    <main className="px-6 py-8 max-w-5xl mx-auto">
      {/* Hero */}
      <div className="mb-10">
        <h2 className="text-2xl font-semibold tracking-tight mb-2">Gallery</h2>
        <p className="text-sm text-muted-foreground max-w-xl">
          Overview of all design system elements. Click any card to jump directly to its section
          in the Components or Design Tokens page.
        </p>
      </div>

      {/* Components section */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Components</h3>
          <span className="text-[10px] font-mono bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
            {componentCategories.length}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {componentCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.id}
                href={cat.linkTo}
                className="group rounded-xl border bg-card p-5 hover:border-brand/40 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="size-10 rounded-lg bg-brand/10 flex items-center justify-center shrink-0 group-hover:bg-brand/20 transition-colors">
                    <Icon className="size-5 text-brand" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold">{cat.label}</h4>
                      <span className="text-[10px] font-mono bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                        {cat.count}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{cat.description}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Tokens section */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Design Tokens</h3>
          <span className="text-[10px] font-mono bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
            {tokenCategories.length}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tokenCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.id}
                href={cat.linkTo}
                className="group rounded-xl border bg-card p-5 hover:border-brand/40 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="size-10 rounded-lg bg-brand/10 flex items-center justify-center shrink-0 group-hover:bg-brand/20 transition-colors">
                    <Icon className="size-5 text-brand" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold">{cat.label}</h4>
                      <span className="text-[10px] font-mono bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                        {cat.count}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{cat.description}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t pt-8 pb-12 text-center text-sm text-muted-foreground">
        <p>Quantreno Design System v0.2</p>
        <p className="text-xs mt-1">4-Level Token Architecture &middot; Tailwind CSS v4 &middot; shadcn/ui</p>
      </div>
    </main>
  );
}
