"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTheme } from "next-themes";
import {
  Sun,
  Moon,
  AlertCircle,
  CheckCircle2,
  Info,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  BarChart3,
  Search,
  Settings,
  Bell,
  ChevronRight,
  Zap,
  Shield,
  Target,
  Palette,
  Type,
  MousePointerClick,
  Tag,
  RectangleHorizontal,
  CreditCard,
  Layers,
  Navigation,
  LineChart,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

/* ─────────────────────────────────────────────────────────
   DESIGN SYSTEM SHOWCASE — Quantreno

   Four-tier token architecture:
     L1 — Raw Values:     #3B7BA8
     L2 — Primitives:     --teal-500: #3B7BA8
     L3 — Semantic:       --brand: var(--teal-500)
     L4 — Component:      bg-brand, text-brand
   ───────────────────────────────────────────────────────── */

// ── Section config ──
const SECTIONS = [
  { id: "tokens", label: "Tokens", icon: Sparkles, count: 6 },
  { id: "colors", label: "Colors", icon: Palette, count: 5 },
  { id: "typography", label: "Typography", icon: Type, count: 2 },
  { id: "buttons", label: "Buttons", icon: MousePointerClick, count: 4 },
  { id: "badges", label: "Badges", icon: Tag, count: 4 },
  { id: "inputs", label: "Inputs", icon: RectangleHorizontal, count: 3 },
  { id: "cards", label: "Cards", icon: CreditCard, count: 3 },
  { id: "alerts", label: "Alerts", icon: AlertCircle, count: 3 },
  { id: "trading", label: "Trading", icon: LineChart, count: 4 },
  { id: "navigation", label: "Navigation", icon: Navigation, count: 3 },
  { id: "progress", label: "Progress", icon: Layers, count: 2 },
] as const;

// ── Theme Toggle ──
function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
    >
      {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}

// ── Sidebar ──
function Sidebar({
  activeSection,
  onSectionClick,
}: {
  activeSection: string;
  onSectionClick: (id: string) => void;
}) {
  return (
    <aside className="hidden lg:block w-60 shrink-0">
      <div className="sticky top-14 py-6 pr-4 max-h-[calc(100vh-3.5rem)] overflow-y-auto">
        <div className="flex items-center gap-2 mb-4 px-3">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Sections
          </span>
          <span className="text-[10px] font-mono bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
            {SECTIONS.length}
          </span>
        </div>
        <nav className="space-y-0.5">
          {SECTIONS.map((section) => {
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
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  isActive ? "bg-brand/20 text-brand" : "bg-muted text-muted-foreground"
                }`}>
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

// ── Section wrapper with sticky header ──
function SectionBlock({
  id,
  title,
  description,
  count,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20">
      <div className="sticky top-14 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b -mx-1 px-1 py-3 mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          {count !== undefined && (
            <span className="text-[10px] font-mono bg-brand/10 text-brand px-1.5 py-0.5 rounded">
              {count}
            </span>
          )}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <div className="space-y-8">{children}</div>
    </section>
  );
}

// ── Subsection label ──
function SubLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
      {children}
    </h3>
  );
}

// ── Color swatch ──
function Swatch({
  name,
  token,
  className,
}: {
  name: string;
  token: string;
  className: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className={`h-12 rounded-md border ${className}`} />
      <p className="text-xs font-medium truncate">{name}</p>
      <p className="text-[10px] text-muted-foreground font-mono truncate">{token}</p>
    </div>
  );
}

// ── Scale row (for L2 primitives) ──
function ScaleRow({
  name,
  prefix,
  steps,
}: {
  name: string;
  prefix: string;
  steps: number[];
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium">{name}</p>
      <div className="flex gap-0 rounded-lg overflow-hidden border">
        {steps.map((step) => (
          <div
            key={step}
            className="flex-1 h-10 relative group"
            style={{ backgroundColor: `var(--${prefix}-${step})` }}
          >
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-[9px] font-mono bg-black/60 text-white px-1 rounded">
                {step}
              </span>
            </div>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground font-mono">
        --{prefix}-&#123;50-950&#125;
      </p>
    </div>
  );
}

/* ── Main Page ── */
export default function DesignSystemPage() {
  const [inputValue, setInputValue] = useState("");
  const [textareaValue, setTextareaValue] = useState("");
  const [activeSection, setActiveSection] = useState("tokens");
  const isScrollingRef = useRef(false);

  // Scroll tracking
  useEffect(() => {
    const handleScroll = () => {
      if (isScrollingRef.current) return;
      const offset = 120;
      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const el = document.getElementById(SECTIONS[i].id);
        if (el && el.getBoundingClientRect().top < offset) {
          setActiveSection(SECTIONS[i].id);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    isScrollingRef.current = true;
    setActiveSection(id);
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => { isScrollingRef.current = false; }, 800);
  }, []);

  const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-gradient-to-br from-brand-gradient-start to-brand-gradient-end" />
            <div>
              <h1 className="text-sm font-semibold tracking-tight">Quantreno Design System</h1>
              <p className="text-[10px] text-muted-foreground font-mono">v0.2 — 4-Level Tokens</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex px-6">
        {/* ── Sidebar ── */}
        <Sidebar activeSection={activeSection} onSectionClick={scrollToSection} />

        {/* ── Main Content ── */}
        <main className="flex-1 min-w-0 py-8 lg:pl-6 space-y-16">

          {/* ════════════════ TOKENS ════════════════ */}
          <SectionBlock
            id="tokens"
            title="Design Tokens"
            description="4-level architecture: Raw → Primitive (L2) → Semantic (L3) → Component (L4)"
            count={6}
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

            {/* Shadows */}
            <div>
              <SubLabel>Shadows</SubLabel>
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

            {/* Motion */}
            <div>
              <SubLabel>Motion &amp; Transitions</SubLabel>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { name: "Fast", token: "--duration-fast", value: "120ms" },
                  { name: "Normal", token: "--duration-normal", value: "200ms" },
                  { name: "Slow", token: "--duration-slow", value: "350ms" },
                ].map((item) => (
                  <div key={item.name} className="rounded-lg border p-3 flex items-center gap-3">
                    <div className="h-8 flex-1 rounded bg-brand/20 overflow-hidden">
                      <div
                        className="h-full bg-brand rounded"
                        style={{
                          width: "60%",
                          transition: `width var(${item.token}) var(--ease-default)`,
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

            {/* Z-Index */}
            <div>
              <SubLabel>Z-Index Scale</SubLabel>
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

            {/* Animations */}
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
                  <p className="text-[10px] text-muted-foreground font-mono">start → end</p>
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
              <SubLabel>Geist Sans — Interface</SubLabel>
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
              <SubLabel>Geist Mono — Data</SubLabel>
              <div className="space-y-3 rounded-lg border p-4 font-mono">
                {[
                  { size: "text-2xl", label: "2xl", example: "$142.50" },
                  { size: "text-xl", label: "xl", example: "+$1,824.30" },
                  { size: "text-lg", label: "lg", example: "KXBTC-26MAR07" },
                  { size: "text-base", label: "base", example: "58¢ Yes / 42¢ No" },
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

          {/* ════════════════ BUTTONS ════════════════ */}
          <SectionBlock id="buttons" title="Buttons" count={4}>
            <div>
              <SubLabel>Variants</SubLabel>
              <div className="flex flex-wrap gap-3">
                <Button>Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="link">Link</Button>
              </div>
            </div>

            <div>
              <SubLabel>Brand CTA</SubLabel>
              <div className="flex flex-wrap gap-3">
                <Button className="bg-brand text-brand-foreground hover:bg-brand-hover">
                  <Zap className="size-4 mr-2" />
                  Analyze Market
                </Button>
                <Button className="bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end text-white hover:opacity-90">
                  <Target className="size-4 mr-2" />
                  Start Scanning
                </Button>
              </div>
            </div>

            <div>
              <SubLabel>Sizes</SubLabel>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small</Button>
                <Button>Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon"><Settings className="size-4" /></Button>
                <Button size="icon-sm"><Bell className="size-3.5" /></Button>
              </div>
            </div>

            <div>
              <SubLabel>States</SubLabel>
              <div className="flex flex-wrap gap-3">
                <Button>Default</Button>
                <Button disabled>Disabled</Button>
                <Button disabled>
                  <span className="size-4 border-2 border-current border-t-transparent rounded-full mr-2" style={{ animation: "ds-spin 1s linear infinite" }} />
                  Loading
                </Button>
              </div>
            </div>
          </SectionBlock>

          {/* ════════════════ BADGES ════════════════ */}
          <SectionBlock id="badges" title="Badges" count={4}>
            <div>
              <SubLabel>Variants</SubLabel>
              <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
              </div>
            </div>

            <div>
              <SubLabel>Trading Signals</SubLabel>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-signal-profit/15 text-signal-profit border-signal-profit/30">
                  <TrendingUp className="size-3 mr-1" /> Profit
                </Badge>
                <Badge className="bg-signal-loss/15 text-signal-loss border-signal-loss/30">
                  <TrendingDown className="size-3 mr-1" /> Loss
                </Badge>
                <Badge className="bg-signal-neutral/15 text-signal-neutral border-signal-neutral/30">
                  <Activity className="size-3 mr-1" /> Neutral
                </Badge>
                <Badge className="bg-signal-info/15 text-signal-info border-signal-info/30">
                  <Info className="size-3 mr-1" /> Info
                </Badge>
              </div>
            </div>

            <div>
              <SubLabel>Confidence Levels</SubLabel>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-confidence-high/15 text-confidence-high border-confidence-high/30">High Confidence</Badge>
                <Badge className="bg-confidence-medium/15 text-confidence-medium border-confidence-medium/30">Medium</Badge>
                <Badge className="bg-confidence-low/15 text-confidence-low border-confidence-low/30">Low</Badge>
              </div>
            </div>

            <div>
              <SubLabel>Strategy Tags</SubLabel>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="border-teal-400/50 text-teal-500">Oil Macro</Badge>
                <Badge variant="outline" className="border-mint-400/50 text-mint-500">Fat Tails</Badge>
                <Badge variant="outline" className="border-chart-4/50 text-chart-4">Vol Swing</Badge>
                <Badge variant="outline" className="border-chart-5/50 text-chart-5">Spread Arb</Badge>
              </div>
            </div>
          </SectionBlock>

          {/* ════════════════ INPUTS ════════════════ */}
          <SectionBlock id="inputs" title="Form Inputs" count={3}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <SubLabel>Text Inputs</SubLabel>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="default-input">Market Ticker</Label>
                    <Input id="default-input" placeholder="e.g., KXBTC-26MAR07" value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="disabled-input">Disabled</Label>
                    <Input id="disabled-input" disabled placeholder="Not available" />
                  </div>
                  <div>
                    <Label htmlFor="error-input" className="text-signal-loss">Position Size (error)</Label>
                    <Input id="error-input" className="border-signal-loss focus-visible:ring-signal-loss" defaultValue="15" />
                    <p className="text-xs text-signal-loss mt-1">Exceeds $10 max per trade</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <SubLabel>Textarea &amp; Select</SubLabel>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="textarea">Trade Notes</Label>
                    <Textarea id="textarea" placeholder="Reasoning for this trade..." value={textareaValue} onChange={(e) => setTextareaValue(e.target.value)} />
                  </div>
                  <div>
                    <Label>Strategy</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select strategy" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="oil">Oil Macro</SelectItem>
                        <SelectItem value="fat-tails">Fat Tails</SelectItem>
                        <SelectItem value="vol">Vol Swing</SelectItem>
                        <SelectItem value="spread">Spread Arb</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </SectionBlock>

          {/* ════════════════ CARDS ════════════════ */}
          <SectionBlock id="cards" title="Cards" count={3}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Standard Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Standard Card</CardTitle>
                  <CardDescription>A basic card component with header, content, and footer.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Card content goes here. Uses bg-card and card-foreground tokens.</p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm">Action</Button>
                </CardFooter>
              </Card>

              {/* Position Card */}
              <Card className="border-signal-profit/20">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">KXBTC-26MAR07</CardTitle>
                    <Badge className="bg-signal-profit/15 text-signal-profit border-signal-profit/30">
                      <TrendingUp className="size-3 mr-1" /> +12.4%
                    </Badge>
                  </div>
                  <CardDescription>Bitcoin &gt; $100.5K on Mar 7</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Entry</p>
                      <p className="font-mono text-sm font-medium">52¢</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Current</p>
                      <p className="font-mono text-sm font-medium text-signal-profit">58¢</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Contracts</p>
                      <p className="font-mono text-sm">15</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">P&amp;L</p>
                      <p className="font-mono text-sm font-medium text-signal-profit">+$0.90</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Market Card */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Fed Rate Cut March</CardTitle>
                    <Badge variant="outline" className="text-[10px]">
                      <Activity className="size-3 mr-1" /> Active
                    </Badge>
                  </div>
                  <CardDescription>Will the Fed cut rates in March 2026?</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 mb-3">
                    <div className="flex-1 rounded-md bg-signal-profit/10 p-2 text-center">
                      <p className="text-[10px] text-muted-foreground">Yes</p>
                      <p className="font-mono text-sm font-medium text-signal-profit">58¢</p>
                    </div>
                    <div className="flex-1 rounded-md bg-signal-loss/10 p-2 text-center">
                      <p className="text-[10px] text-muted-foreground">No</p>
                      <p className="font-mono text-sm font-medium text-signal-loss">42¢</p>
                    </div>
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Vol: 12,847</span>
                    <span>Exp: Mar 7</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button size="sm" className="w-full bg-brand text-brand-foreground hover:bg-brand-hover">
                    <BarChart3 className="size-3.5 mr-2" /> Analyze
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </SectionBlock>

          {/* ════════════════ ALERTS ════════════════ */}
          <SectionBlock id="alerts" title="Alerts" count={3}>
            <div className="space-y-3">
              <Alert>
                <Info className="size-4" />
                <AlertTitle>Default Alert</AlertTitle>
                <AlertDescription>Market scan complete. 3 opportunities match your criteria.</AlertDescription>
              </Alert>
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertTitle>Destructive</AlertTitle>
                <AlertDescription>Position exceeds $10 risk limit. Reduce size before placing order.</AlertDescription>
              </Alert>
              <Alert className="border-signal-profit/30 bg-signal-profit/5 text-signal-profit [&>svg]:text-signal-profit">
                <CheckCircle2 className="size-4" />
                <AlertTitle>Trade Executed</AlertTitle>
                <AlertDescription className="text-signal-profit/80">Bought 15 contracts KXBTC-26MAR07 Yes @ 52¢. Total cost: $7.80.</AlertDescription>
              </Alert>
              <Alert className="border-signal-info/30 bg-signal-info/5 text-signal-info [&>svg]:text-signal-info">
                <Info className="size-4" />
                <AlertTitle>Market Update</AlertTitle>
                <AlertDescription className="text-signal-info/80">BTC crossed $100K. Your position in KXBTC-26MAR07 is now in profit.</AlertDescription>
              </Alert>
              <Alert className="border-confidence-medium/30 bg-confidence-medium/5 text-confidence-medium [&>svg]:text-confidence-medium">
                <AlertTriangle className="size-4" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription className="text-confidence-medium/80">Market liquidity below threshold. Spread may be wider than expected.</AlertDescription>
              </Alert>
            </div>
          </SectionBlock>

          {/* ════════════════ TRADING ════════════════ */}
          <SectionBlock id="trading" title="Trading Components" count={4}>
            {/* P&L Display */}
            <div>
              <SubLabel>P&amp;L Display</SubLabel>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-3xl font-mono font-bold text-signal-profit">+$181.24</span>
                    <Badge className="bg-signal-profit/15 text-signal-profit border-signal-profit/30">
                      <ArrowUpRight className="size-3 mr-1" /> +22.2%
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {[
                      { ticker: "KXBTC-26MAR07", pnl: "+$45.30", cls: "text-signal-profit" },
                      { ticker: "KXCPI-26MAR12", pnl: "+$22.80", cls: "text-signal-profit" },
                      { ticker: "KXFED-26MAR19", pnl: "-$8.50", cls: "text-signal-loss" },
                    ].map((pos) => (
                      <div key={pos.ticker} className="flex items-center justify-between text-sm">
                        <span className="font-mono text-muted-foreground">{pos.ticker}</span>
                        <span className={`font-mono font-medium ${pos.cls}`}>{pos.pnl}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Price Pills */}
            <div>
              <SubLabel>Price Pills</SubLabel>
              <div className="flex flex-wrap gap-3">
                {[
                  { price: "58¢", label: "Yes", cls: "bg-signal-profit/15 text-signal-profit border-signal-profit/30" },
                  { price: "42¢", label: "No", cls: "bg-signal-loss/15 text-signal-loss border-signal-loss/30" },
                  { price: "50¢", label: "Even", cls: "bg-signal-neutral/15 text-signal-neutral border-signal-neutral/30" },
                ].map((pill) => (
                  <div key={pill.label} className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border font-mono text-sm ${pill.cls}`}>
                    <span className="font-bold">{pill.price}</span>
                    <span className="text-xs opacity-70">{pill.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Edge Meter */}
            <div>
              <SubLabel>Edge Meter</SubLabel>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "Strong Edge", value: 82, textCls: "text-confidence-high", bgCls: "bg-confidence-high" },
                  { label: "Moderate Edge", value: 55, textCls: "text-confidence-medium", bgCls: "bg-confidence-medium" },
                  { label: "Weak Edge", value: 25, textCls: "text-confidence-low", bgCls: "bg-confidence-low" },
                ].map((edge) => (
                  <Card key={edge.label}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{edge.label}</span>
                        <span className={`font-mono font-medium ${edge.textCls}`}>{edge.value}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${edge.bgCls}`} style={{ width: `${edge.value}%` }} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Order Confirmation */}
            <div>
              <SubLabel>Order Confirmation</SubLabel>
              <Card className="max-w-md">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="size-4 text-brand" /> Confirm Trade
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { label: "Market", value: "KXBTC-26MAR07" },
                      { label: "Side", value: "Yes" },
                      { label: "Price", value: "52¢" },
                      { label: "Contracts", value: "15" },
                      { label: "Total Cost", value: "$7.80" },
                      { label: "Max Loss", value: "$7.80" },
                      { label: "Max Profit", value: "$7.20" },
                      { label: "Strategy", value: "Fat Tails" },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{row.label}</span>
                        <span className="font-mono font-medium">{row.value}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between text-sm pt-2 border-t">
                      <span className="text-muted-foreground">Edge Score</span>
                      <Badge className="bg-confidence-high/15 text-confidence-high border-confidence-high/30">82% — Strong</Badge>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button variant="outline" className="flex-1">Cancel</Button>
                  <Button className="flex-1 bg-brand text-brand-foreground hover:bg-brand-hover">Place Order</Button>
                </CardFooter>
              </Card>
            </div>
          </SectionBlock>

          {/* ════════════════ NAVIGATION ════════════════ */}
          <SectionBlock id="navigation" title="Navigation" count={3}>
            {/* Sidebar Nav */}
            <div>
              <SubLabel>Sidebar Items</SubLabel>
              <div className="w-64 space-y-0.5 rounded-lg border p-2">
                {[
                  { icon: BarChart3, label: "Dashboard", active: true },
                  { icon: Activity, label: "Positions", badge: "6" },
                  { icon: Search, label: "Scanner" },
                  { icon: LineChart, label: "Analysis" },
                  { icon: Settings, label: "Settings" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                        item.active
                          ? "bg-brand/10 text-brand font-medium"
                          : "text-muted-foreground hover:bg-accent"
                      }`}
                    >
                      <Icon className="size-4" />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="text-[10px] font-mono bg-brand/20 text-brand px-1.5 py-0.5 rounded">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Breadcrumbs */}
            <div>
              <SubLabel>Breadcrumbs</SubLabel>
              <div className="flex items-center gap-1.5 text-sm">
                <span className="text-muted-foreground hover:text-foreground cursor-pointer">Dashboard</span>
                <ChevronRight className="size-3.5 text-muted-foreground" />
                <span className="text-muted-foreground hover:text-foreground cursor-pointer">Positions</span>
                <ChevronRight className="size-3.5 text-muted-foreground" />
                <span className="font-medium">KXBTC-26MAR07</span>
              </div>
            </div>

            {/* Tabs */}
            <div>
              <SubLabel>Tabs</SubLabel>
              <div className="flex border-b">
                {["Overview", "Trades", "Analysis", "Settings"].map((tab, i) => (
                  <button
                    key={tab}
                    className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                      i === 0
                        ? "border-brand text-brand"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </SectionBlock>

          {/* ════════════════ PROGRESS ════════════════ */}
          <SectionBlock id="progress" title="Progress & Loading" count={2}>
            <div>
              <SubLabel>Progress Bars</SubLabel>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Default</span>
                    <span className="font-mono">65%</span>
                  </div>
                  <Progress value={65} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Edge Meter</span>
                    <span className="font-mono text-confidence-high">82%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-confidence-high" style={{ width: "82%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Brand Gradient</span>
                    <span className="font-mono">73%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end" style={{ width: "73%" }} />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <SubLabel>Skeletons</SubLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6 space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex gap-2 mt-4">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-20" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 space-y-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="size-8 rounded-full" />
                      <div className="space-y-1.5 flex-1">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
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
    </div>
  );
}
