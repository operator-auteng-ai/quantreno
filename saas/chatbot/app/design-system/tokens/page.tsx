"use client";

import { DSSidebar } from "../_components/ds-sidebar";
import { SectionBlock } from "../_components/section-block";
import { SubLabel } from "../_components/sub-label";
import { Swatch } from "../_components/swatch";
import { ScaleRow } from "../_components/scale-row";
import { TOKEN_SECTIONS } from "../_components/sections-config";
import { useScrollTracking } from "../_components/use-scroll-tracking";

/* ─────────────────────────────────────────────────────────
   DESIGN TOKENS — Quantreno Design System

   Four-tier token architecture:
     L1 — Raw Values:     #6376E6
     L2 — Primitives:     --indigo-500: #6376E6
     L3 — Semantic:       --brand: var(--indigo-500)
     L4 — Component:      bg-brand, text-brand
   ───────────────────────────────────────────────────────── */

const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

export default function TokensPage() {
  const { activeSection, scrollToSection } = useScrollTracking(TOKEN_SECTIONS);

  return (
    <div className="flex">
      <DSSidebar
        sections={TOKEN_SECTIONS}
        title="Design Tokens"
        activeSection={activeSection}
        onSectionClick={scrollToSection}
      />

      <main className="flex-1 px-6 py-8 space-y-12 min-w-0">
        {/* ════════════════ PRIMITIVES ════════════════ */}
        <SectionBlock
          id="primitives"
          title="Primitives"
          description="L2 color scales — 11 stops from 50 to 950"
          count={4}
        >
          {/* L2 Primitive Scales */}
          <div>
            <SubLabel>L2 Primitive Color Scales</SubLabel>
            <div className="space-y-5">
              <ScaleRow name="Indigo (Brand Primary)" prefix="indigo" steps={STEPS} />
              <ScaleRow name="Mint (Brand Secondary)" prefix="mint" steps={STEPS} />
              <ScaleRow name="Teal (Accent)" prefix="teal" steps={STEPS} />
              <ScaleRow name="Neutral (Surfaces)" prefix="neutral" steps={STEPS} />
            </div>
          </div>

          {/* Token Architecture Diagram */}
          <div>
            <SubLabel>Token Flow</SubLabel>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {[
                { level: "L1", label: "Raw", example: "#6376E6", bg: "bg-muted" },
                { level: "L2", label: "Primitive", example: "--indigo-500", bg: "bg-muted" },
                { level: "L3", label: "Semantic", example: "--brand", bg: "bg-brand/10" },
                { level: "L4", label: "Component", example: "bg-brand", bg: "bg-brand/10" },
              ].map((item) => (
                <div key={item.level} className={`rounded-lg p-3 ${item.bg} border`}>
                  <span className="text-[10px] font-mono text-muted-foreground">{item.level}</span>
                  <p className="text-sm font-medium mt-0.5">{item.label}</p>
                  <p className="text-xs font-mono text-muted-foreground mt-1">{item.example}</p>
                </div>
              ))}
            </div>
          </div>
        </SectionBlock>

        {/* ════════════════ COLORS ════════════════ */}
        <SectionBlock id="colors" title="Colors" count={5}>
          {/* Core */}
          <div>
            <SubLabel>Core Palette</SubLabel>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              <Swatch name="Background" token="--background" className="bg-background" />
              <Swatch name="Foreground" token="--foreground" className="bg-foreground" />
              <Swatch name="Card" token="--card" className="bg-card" />
              <Swatch name="Primary" token="--primary" className="bg-primary" />
              <Swatch name="Secondary" token="--secondary" className="bg-secondary" />
              <Swatch name="Muted" token="--muted" className="bg-muted" />
              <Swatch name="Accent" token="--accent" className="bg-accent" />
              <Swatch name="Destructive" token="--destructive" className="bg-destructive" />
              <Swatch name="Border" token="--border" className="bg-border" />
              <Swatch name="Input" token="--input" className="bg-input" />
              <Swatch name="Ring" token="--ring" className="bg-ring" />
              <Swatch name="Popover" token="--popover" className="bg-popover" />
            </div>
          </div>

          {/* Brand */}
          <div>
            <SubLabel>Brand</SubLabel>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              <Swatch name="Brand" token="--brand" className="bg-brand" />
              <Swatch name="Brand Fg" token="--brand-foreground" className="bg-brand-foreground" />
              <Swatch name="Brand Muted" token="--brand-muted" className="bg-brand-muted" />
              <Swatch name="Brand Hover" token="--brand-hover" className="bg-brand-hover" />
              <Swatch name="Brand Light" token="--brand-light" className="bg-brand-light" />
              <div className="space-y-1.5">
                <div className="h-12 rounded-md border bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end" />
                <p className="text-xs font-medium">Brand Gradient</p>
                <p className="text-[10px] text-muted-foreground font-mono">start &rarr; end</p>
              </div>
            </div>
          </div>

          {/* Signal */}
          <div>
            <SubLabel>Signal Colors</SubLabel>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Swatch name="Profit" token="--signal-profit" className="bg-signal-profit" />
              <Swatch name="Loss" token="--signal-loss" className="bg-signal-loss" />
              <Swatch name="Neutral" token="--signal-neutral" className="bg-signal-neutral" />
              <Swatch name="Info" token="--signal-info" className="bg-signal-info" />
            </div>
          </div>

          {/* Confidence */}
          <div>
            <SubLabel>Confidence Levels</SubLabel>
            <div className="grid grid-cols-3 gap-3">
              <Swatch name="High" token="--confidence-high" className="bg-confidence-high" />
              <Swatch name="Medium" token="--confidence-medium" className="bg-confidence-medium" />
              <Swatch name="Low" token="--confidence-low" className="bg-confidence-low" />
            </div>
          </div>

          {/* Chart */}
          <div>
            <SubLabel>Chart Colors</SubLabel>
            <div className="grid grid-cols-5 gap-3">
              {[1, 2, 3, 4, 5].map((n) => (
                <Swatch key={n} name={`Chart ${n}`} token={`--chart-${n}`} className={`bg-chart-${n}`} />
              ))}
            </div>
          </div>
        </SectionBlock>

        {/* ════════════════ TYPOGRAPHY ════════════════ */}
        <SectionBlock id="typography" title="Typography" count={2}>
          <div>
            <SubLabel>Geist Sans &mdash; Interface</SubLabel>
            <div className="space-y-3 rounded-lg border p-4">
              {[
                { size: "text-4xl", label: "4xl — 36px" },
                { size: "text-3xl", label: "3xl — 30px" },
                { size: "text-2xl", label: "2xl — 24px" },
                { size: "text-xl", label: "xl — 20px" },
                { size: "text-lg", label: "lg — 18px" },
                { size: "text-base", label: "base — 16px" },
                { size: "text-sm", label: "sm — 14px" },
                { size: "text-xs", label: "xs — 12px" },
              ].map((t) => (
                <div key={t.size} className="flex items-baseline gap-4">
                  <span className="w-28 shrink-0 text-[10px] font-mono text-muted-foreground">{t.label}</span>
                  <span className={`${t.size} font-medium truncate`}>The quick brown fox</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <SubLabel>Geist Mono &mdash; Data</SubLabel>
            <div className="space-y-3 rounded-lg border p-4 font-mono">
              {[
                { size: "text-2xl", label: "2xl", example: "$142.50" },
                { size: "text-xl", label: "xl", example: "+$1,824.30" },
                { size: "text-lg", label: "lg", example: "KXBTC-26MAR07" },
                { size: "text-base", label: "base", example: "58\u00A2 Yes / 42\u00A2 No" },
                { size: "text-sm", label: "sm", example: "Vol: 12,847 | Exp: Mar 7" },
                { size: "text-xs", label: "xs", example: "Last trade: 2m ago" },
              ].map((t) => (
                <div key={t.size} className="flex items-baseline gap-4">
                  <span className="w-16 shrink-0 text-[10px] text-muted-foreground">{t.label}</span>
                  <span className={t.size}>{t.example}</span>
                </div>
              ))}
            </div>
          </div>
        </SectionBlock>

        {/* ════════════════ SHADOWS ════════════════ */}
        <SectionBlock id="shadows" title="Shadows" count={6}>
          <div>
            <SubLabel>Elevation Scale</SubLabel>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {(["xs", "sm", "md", "lg", "xl", "accent"] as const).map((size) => (
                <div key={size} className="space-y-2">
                  <div
                    className="h-16 rounded-lg bg-card border"
                    style={{ boxShadow: `var(--shadow-${size})` }}
                  />
                  <p className="text-xs font-mono text-muted-foreground">--shadow-{size}</p>
                </div>
              ))}
            </div>
          </div>
        </SectionBlock>

        {/* ════════════════ MOTION ════════════════ */}
        <SectionBlock id="motion" title="Motion" description="Duration tokens and easing curves — hover to preview" count={3}>
          <div>
            <SubLabel>Durations &amp; Easing (hover to preview)</SubLabel>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { name: "Fast", token: "--duration-fast", value: "120ms", ms: "120ms" },
                { name: "Normal", token: "--duration-normal", value: "200ms", ms: "200ms" },
                { name: "Slow", token: "--duration-slow", value: "350ms", ms: "350ms" },
              ].map((item) => (
                <div key={item.name} className="group rounded-lg border p-3 flex items-center gap-3 cursor-pointer">
                  <div className="h-8 flex-1 rounded bg-brand/20 overflow-hidden">
                    <div
                      className="h-full bg-brand rounded w-[15%] group-hover:w-[85%]"
                      style={{
                        transition: `width ${item.ms} var(--ease-default, cubic-bezier(0.4, 0, 0.2, 1))`,
                      }}
                    />
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs font-medium">{item.name}</p>
                    <p className="text-[10px] font-mono text-muted-foreground">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SectionBlock>

        {/* ════════════════ Z-INDEX ════════════════ */}
        <SectionBlock id="zindex" title="Z-Index" description="Layering scale for stacking contexts" count={5}>
          <div>
            <SubLabel>Stacking Order</SubLabel>
            <div className="flex flex-wrap gap-3">
              {[
                { name: "Base", value: 0 },
                { name: "Dropdown", value: 100 },
                { name: "Sticky", value: 200 },
                { name: "Modal", value: 300 },
                { name: "Tooltip", value: 400 },
              ].map((z) => (
                <div key={z.name} className="rounded-lg border px-3 py-2 bg-muted/50">
                  <p className="text-xs font-medium">{z.name}</p>
                  <p className="text-[10px] font-mono text-muted-foreground">z-{z.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Visual stacking demo */}
          <div>
            <SubLabel>Visual Stacking</SubLabel>
            <div className="relative h-40 rounded-lg border bg-muted/30 overflow-hidden">
              <div className="absolute bottom-4 left-4 w-32 h-20 rounded-lg bg-card border shadow-sm flex items-center justify-center text-xs font-mono text-muted-foreground">z-0 Base</div>
              <div className="absolute bottom-6 left-12 w-32 h-20 rounded-lg bg-card border shadow-md flex items-center justify-center text-xs font-mono text-muted-foreground">z-100 Dropdown</div>
              <div className="absolute bottom-8 left-20 w-32 h-20 rounded-lg bg-card border shadow-lg flex items-center justify-center text-xs font-mono text-muted-foreground">z-200 Sticky</div>
              <div className="absolute bottom-10 left-28 w-32 h-20 rounded-lg bg-card border shadow-xl flex items-center justify-center text-xs font-mono text-brand">z-300 Modal</div>
            </div>
          </div>
        </SectionBlock>

        {/* ════════════════ ANIMATIONS ════════════════ */}
        <SectionBlock id="animations" title="Animations" description="Keyframe animations for loading states and transitions" count={5}>
          <div>
            <SubLabel>Keyframe Animations</SubLabel>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <div className="rounded-lg border p-4 flex flex-col items-center gap-2">
                <div className="size-6 border-2 border-brand border-t-transparent rounded-full" style={{ animation: "ds-spin 1s linear infinite" }} />
                <p className="text-[10px] font-mono text-muted-foreground">ds-spin</p>
              </div>
              <div className="rounded-lg border p-4 flex flex-col items-center gap-2">
                <div className="h-3 w-16 bg-brand rounded" style={{ animation: "ds-shimmer 1.5s ease-in-out infinite" }} />
                <p className="text-[10px] font-mono text-muted-foreground">ds-shimmer</p>
              </div>
              <div className="rounded-lg border p-4 flex flex-col items-center gap-2">
                <div className="size-6 bg-brand rounded-full" style={{ animation: "ds-pulse 2s ease-in-out infinite" }} />
                <p className="text-[10px] font-mono text-muted-foreground">ds-pulse</p>
              </div>
              <div className="rounded-lg border p-4 flex flex-col items-center gap-2">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="size-2 bg-brand rounded-full" style={{ animation: `ds-bounce 1.4s ease-in-out ${i * 0.16}s infinite` }} />
                  ))}
                </div>
                <p className="text-[10px] font-mono text-muted-foreground">ds-bounce</p>
              </div>
              <div className="rounded-lg border p-4 flex flex-col items-center gap-2">
                <div className="h-4 w-12 bg-brand rounded" style={{ animation: "ds-slide-up 1.5s ease-out infinite" }} />
                <p className="text-[10px] font-mono text-muted-foreground">ds-slide-up</p>
              </div>
            </div>
          </div>
        </SectionBlock>

        {/* ── Footer ── */}
        <div className="border-t pt-8 pb-12 text-center text-sm text-muted-foreground">
          <p>Quantreno Design System v0.2</p>
          <p className="text-xs mt-1">4-Level Token Architecture &middot; Tailwind CSS v4 &middot; shadcn/ui</p>
        </div>
      </main>
    </div>
  );
}
