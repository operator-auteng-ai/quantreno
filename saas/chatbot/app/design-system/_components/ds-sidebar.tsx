"use client";

import type { Section } from "./sections-config";

export function DSSidebar({
  sections,
  title,
  activeSection,
  onSectionClick,
}: {
  sections: readonly Section[];
  title: string;
  activeSection: string;
  onSectionClick: (id: string) => void;
}) {
  return (
    <aside className="hidden lg:block w-60 shrink-0">
      <div className="sticky top-14 py-6 pr-4 max-h-[calc(100vh-3.5rem)] overflow-y-auto">
        <div className="flex items-center gap-2 mb-4 px-3">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </span>
          <span className="text-[10px] font-mono bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
            {sections.length}
          </span>
        </div>
        <nav className="space-y-0.5">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => onSectionClick(section.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? "bg-brand/10 text-brand font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <Icon className="size-4 shrink-0" />
                <span className="flex-1 text-left">{section.label}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    isActive
                      ? "bg-brand/20 text-brand"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {section.count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
