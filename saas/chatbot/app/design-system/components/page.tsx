"use client";

import { Suspense } from "react";
import { DSSidebar } from "../_components/ds-sidebar";
import { SectionBlock } from "../_components/section-block";
import { SubLabel } from "../_components/sub-label";
import { Skeleton } from "@/components/ui/skeleton";
import { COMPONENT_SECTIONS } from "../_components/sections-config";
import { useScrollTracking } from "../_components/use-scroll-tracking";
import { getGrouped, getCounts } from "../_registry/helpers";
import { DEMO_MAP } from "../_registry/demo-map";
import type { AtomicLevel } from "../_registry/types";

/* ─────────────────────────────────────────────────────────
   COMPONENTS — Quantreno Design System

   Registry-driven renderer. Component metadata lives in
   _registry/entries.ts, demos in _registry/demos/.
   ───────────────────────────────────────────────────────── */

const LEVELS: { level: AtomicLevel; id: string; title: string; description: string }[] = [
  { level: "atom", id: "atoms", title: "Atoms", description: "Primitive UI elements — the building blocks" },
  { level: "molecule", id: "molecules", title: "Molecules", description: "Composed from atoms — cards, alerts, and trading indicators" },
  { level: "component", id: "components", title: "Components", description: "Full feature blocks — composed from atoms and molecules" },
];

function DemoFallback() {
  return (
    <div className="space-y-3 py-2">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}

export default function ComponentsPage() {
  const { activeSection, scrollToSection } = useScrollTracking(COMPONENT_SECTIONS);
  const counts = getCounts();

  return (
    <div className="flex">
      <DSSidebar
        sections={COMPONENT_SECTIONS}
        title="Components"
        activeSection={activeSection}
        onSectionClick={scrollToSection}
      />

      <main className="flex-1 px-6 py-8 space-y-12 min-w-0">
        {LEVELS.map(({ level, id, title, description }) => {
          const groups = getGrouped(level);
          const count = counts[level];

          return (
            <SectionBlock
              key={id}
              id={id}
              title={title}
              description={description}
              count={count}
            >
              {Object.entries(groups).map(([sublabel, entries]) => (
                <div key={sublabel}>
                  <SubLabel>{sublabel}</SubLabel>
                  <div className="space-y-6">
                    {entries.map((entry) => {
                      const Demo = DEMO_MAP[entry.id];
                      if (!Demo) return null;
                      return (
                        <div key={entry.id} id={`demo-${entry.id}`}>
                          <Suspense fallback={<DemoFallback />}>
                            <Demo />
                          </Suspense>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </SectionBlock>
          );
        })}

        {/* ── Footer ── */}
        <div className="border-t pt-8 pb-12 text-center text-sm text-muted-foreground">
          <p>Quantreno Design System v0.2</p>
          <p className="text-xs mt-1">Atomic Design &middot; Tailwind CSS v4 &middot; shadcn/ui</p>
        </div>
      </main>
    </div>
  );
}
