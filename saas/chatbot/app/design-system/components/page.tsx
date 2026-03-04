"use client";

import { useState } from "react";
import {
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
  LineChart,
  Sparkles,
  Paperclip,
  Send,
  Command,
  Clock,
  Eye,
  User,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

import { DSSidebar } from "../_components/ds-sidebar";
import { SectionBlock } from "../_components/section-block";
import { SubLabel } from "../_components/sub-label";
import { COMPONENT_SECTIONS } from "../_components/sections-config";
import { useScrollTracking } from "../_components/use-scroll-tracking";

/* ─────────────────────────────────────────────────────────
   COMPONENTS — Quantreno Design System

   Atomic design hierarchy:
     Atoms     — primitive UI elements (buttons, badges, inputs)
     Molecules — composed from atoms (alerts, cards, price pills)
     Components — full feature blocks (P&L display, portfolio summary)
   ───────────────────────────────────────────────────────── */

export default function ComponentsPage() {
  const { activeSection, scrollToSection } = useScrollTracking(COMPONENT_SECTIONS);
  const [inputValue, setInputValue] = useState("");
  const [textareaValue, setTextareaValue] = useState("");

  return (
    <div className="flex">
      <DSSidebar
        sections={COMPONENT_SECTIONS}
        title="Components"
        activeSection={activeSection}
        onSectionClick={scrollToSection}
      />

      <main className="flex-1 px-6 py-8 space-y-12 min-w-0">
        {/* ════════════════════════════════════════════════════
            ATOMS — primitive UI elements
            ════════════════════════════════════════════════════ */}
        <SectionBlock
          id="atoms"
          title="Atoms"
          description="Primitive UI elements — the building blocks"
          count={12}
        >
          {/* ── Buttons ── */}
          <div>
            <SubLabel>Buttons &mdash; Variants</SubLabel>
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
            <SubLabel>Buttons &mdash; Brand CTA</SubLabel>
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
            <SubLabel>Buttons &mdash; Sizes</SubLabel>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Small</Button>
              <Button>Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon"><Settings className="size-4" /></Button>
              <Button size="icon-sm"><Bell className="size-3.5" /></Button>
            </div>
          </div>

          <div>
            <SubLabel>Buttons &mdash; States</SubLabel>
            <div className="flex flex-wrap gap-3">
              <Button>Default</Button>
              <Button disabled>Disabled</Button>
              <Button disabled>
                <span className="size-4 border-2 border-current border-t-transparent rounded-full mr-2" style={{ animation: "ds-spin 1s linear infinite" }} />
                Loading
              </Button>
            </div>
          </div>

          {/* ── Badges ── */}
          <div>
            <SubLabel>Badges &mdash; Variants</SubLabel>
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </div>
          </div>

          <div>
            <SubLabel>Badges &mdash; Trading Signals</SubLabel>
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
            <SubLabel>Badges &mdash; Confidence &amp; Strategy</SubLabel>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-confidence-high/15 text-confidence-high border-confidence-high/30">High Confidence</Badge>
              <Badge className="bg-confidence-medium/15 text-confidence-medium border-confidence-medium/30">Medium</Badge>
              <Badge className="bg-confidence-low/15 text-confidence-low border-confidence-low/30">Low</Badge>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="outline" className="border-teal-400/50 text-teal-500">Oil Macro</Badge>
              <Badge variant="outline" className="border-mint-400/50 text-mint-500">Fat Tails</Badge>
              <Badge variant="outline" className="border-chart-4/50 text-chart-4">Vol Swing</Badge>
              <Badge variant="outline" className="border-chart-5/50 text-chart-5">Spread Arb</Badge>
            </div>
          </div>

          {/* ── Form Controls ── */}
          <div>
            <SubLabel>Form Controls &mdash; Inputs</SubLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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

          {/* ── Feedback ── */}
          <div>
            <SubLabel>Feedback &mdash; Progress</SubLabel>
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
            <SubLabel>Feedback &mdash; Skeletons</SubLabel>
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

          {/* ── Display ── */}
          <div>
            <SubLabel>Display &mdash; Avatar</SubLabel>
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarFallback className="bg-brand/20 text-brand text-sm font-medium">PK</AvatarFallback>
              </Avatar>
              <Avatar className="size-8">
                <AvatarFallback className="bg-signal-profit/20 text-signal-profit text-xs font-medium">AI</AvatarFallback>
              </Avatar>
              <Avatar className="size-12">
                <AvatarFallback className="bg-muted text-muted-foreground text-base font-medium">QT</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback className="bg-chart-3/20 text-chart-3 text-sm font-medium">
                  <User className="size-4" />
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          <div>
            <SubLabel>Display &mdash; Tooltip</SubLabel>
            <TooltipProvider>
              <div className="flex flex-wrap gap-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm">Hover me</Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Tooltip content</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon-sm">
                      <Info className="size-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Market closes at 11:59 PM ET</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge className="bg-confidence-high/15 text-confidence-high border-confidence-high/30 cursor-help">82%</Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Strong edge &mdash; high confidence signal</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>

          <div>
            <SubLabel>Display &mdash; Separator</SubLabel>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Horizontal</p>
                <Separator />
              </div>
              <div className="flex h-8 items-center gap-4">
                <span className="text-sm">Overview</span>
                <Separator orientation="vertical" />
                <span className="text-sm">Trades</span>
                <Separator orientation="vertical" />
                <span className="text-sm">Analysis</span>
              </div>
            </div>
          </div>
        </SectionBlock>

        {/* ════════════════════════════════════════════════════
            MOLECULES — composed from atoms
            ════════════════════════════════════════════════════ */}
        <SectionBlock
          id="molecules"
          title="Molecules"
          description="Composed from atoms — cards, alerts, and trading indicators"
          count={12}
        >
          {/* ── Alerts ── */}
          <div>
            <SubLabel>Alerts &mdash; 5 Variants</SubLabel>
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
                <AlertDescription className="text-signal-profit/80">Bought 15 contracts KXBTC-26MAR07 Yes @ 52&cent;. Total cost: $7.80.</AlertDescription>
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
          </div>

          {/* ── Cards ── */}
          <div>
            <SubLabel>Cards &mdash; Standard, Position, Market</SubLabel>
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
                      <p className="font-mono text-sm font-medium">52&cent;</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Current</p>
                      <p className="font-mono text-sm font-medium text-signal-profit">58&cent;</p>
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
                      <p className="font-mono text-sm font-medium text-signal-profit">58&cent;</p>
                    </div>
                    <div className="flex-1 rounded-md bg-signal-loss/10 p-2 text-center">
                      <p className="text-[10px] text-muted-foreground">No</p>
                      <p className="font-mono text-sm font-medium text-signal-loss">42&cent;</p>
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
          </div>

          {/* ── Trading ── */}
          <div>
            <SubLabel>Trading &mdash; Price Pills</SubLabel>
            <div className="flex flex-wrap gap-3">
              {[
                { price: "58\u00A2", label: "Yes", cls: "bg-signal-profit/15 text-signal-profit border-signal-profit/30" },
                { price: "42\u00A2", label: "No", cls: "bg-signal-loss/15 text-signal-loss border-signal-loss/30" },
                { price: "50\u00A2", label: "Even", cls: "bg-signal-neutral/15 text-signal-neutral border-signal-neutral/30" },
              ].map((pill) => (
                <div key={pill.label} className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border font-mono text-sm ${pill.cls}`}>
                  <span className="font-bold">{pill.price}</span>
                  <span className="text-xs opacity-70">{pill.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <SubLabel>Trading &mdash; Edge Meter</SubLabel>
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

          {/* ── Navigation ── */}
          <div>
            <SubLabel>Navigation &mdash; Sidebar Items</SubLabel>
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

          <div>
            <SubLabel>Navigation &mdash; Breadcrumbs</SubLabel>
            <div className="flex items-center gap-1.5 text-sm">
              <span className="text-muted-foreground hover:text-foreground cursor-pointer">Dashboard</span>
              <ChevronRight className="size-3.5 text-muted-foreground" />
              <span className="text-muted-foreground hover:text-foreground cursor-pointer">Positions</span>
              <ChevronRight className="size-3.5 text-muted-foreground" />
              <span className="font-medium">KXBTC-26MAR07</span>
            </div>
          </div>

          <div>
            <SubLabel>Navigation &mdash; Tab Bar</SubLabel>
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

          {/* ── Dashboard Molecules (NEW) ── */}
          <div>
            <SubLabel>Dashboard &mdash; Stat Card</SubLabel>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Portfolio Value</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-mono font-bold">$817.42</span>
                    <Badge className="bg-signal-profit/15 text-signal-profit border-signal-profit/30 text-[10px]">
                      <ArrowUpRight className="size-3 mr-0.5" /> 3.2%
                    </Badge>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-3">
                    <div className="h-full rounded-full bg-brand" style={{ width: "82%" }} />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5">6 open positions</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Today&apos;s P&amp;L</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-mono font-bold text-signal-profit">+$24.80</span>
                    <Badge className="bg-signal-profit/15 text-signal-profit border-signal-profit/30 text-[10px]">
                      <TrendingUp className="size-3 mr-0.5" /> 3.1%
                    </Badge>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-3">
                    <div className="h-full rounded-full bg-signal-profit" style={{ width: "65%" }} />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5">4 winning, 2 losing</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Win Rate</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-mono font-bold">68%</span>
                    <Badge className="bg-signal-neutral/15 text-signal-neutral border-signal-neutral/30 text-[10px]">
                      <Activity className="size-3 mr-0.5" /> 28 trades
                    </Badge>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-3">
                    <div className="h-full rounded-full bg-confidence-high" style={{ width: "68%" }} />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5">19 wins / 9 losses</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div>
            <SubLabel>Dashboard &mdash; Chat Message</SubLabel>
            <div className="max-w-lg space-y-3">
              {/* User message */}
              <div className="flex justify-end">
                <div className="bg-brand/10 rounded-2xl rounded-br-md px-4 py-2.5 max-w-[80%]">
                  <p className="text-sm">Analyze KXBTC market for fat-tail opportunities</p>
                  <p className="text-[10px] text-muted-foreground mt-1 text-right">2:34 PM</p>
                </div>
              </div>
              {/* AI message */}
              <div className="flex gap-2.5">
                <Avatar className="size-7 mt-0.5 shrink-0">
                  <AvatarFallback className="bg-brand/20 text-brand text-[10px]">
                    <Sparkles className="size-3.5" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-2.5 max-w-[80%]">
                  <p className="text-sm">
                    Found 3 fat-tail opportunities in KXBTC. The March 7 expiry shows a{" "}
                    <span className="font-mono text-signal-profit">58&cent;</span> Yes price with{" "}
                    <span className="font-medium text-confidence-high">82% edge confidence</span>.
                    Volume is strong at 12.8K contracts.
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">2:34 PM</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <SubLabel>Dashboard &mdash; Activity Feed Item</SubLabel>
            <div className="max-w-md space-y-1">
              {[
                { icon: TrendingUp, text: "Bought 15 KXBTC-26MAR07 @ 52\u00A2", time: "2m ago", color: "text-signal-profit", dot: "bg-signal-profit" },
                { icon: Search, text: "Market scan: 3 opportunities found", time: "15m ago", color: "text-signal-info", dot: "bg-signal-info" },
                { icon: CheckCircle2, text: "Position closed: +$4.20 profit", time: "1h ago", color: "text-signal-profit", dot: "bg-signal-profit" },
                { icon: AlertTriangle, text: "Low liquidity warning: KXFED-26MAR19", time: "3h ago", color: "text-confidence-medium", dot: "bg-confidence-medium" },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent/50 transition-colors">
                    <div className={`size-2 rounded-full shrink-0 ${item.dot}`} />
                    <Icon className={`size-3.5 shrink-0 ${item.color}`} />
                    <span className="text-sm flex-1 truncate">{item.text}</span>
                    <span className="text-[10px] text-muted-foreground shrink-0 font-mono">{item.time}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <SubLabel>Dashboard &mdash; Watchlist Item</SubLabel>
            <div className="max-w-sm space-y-2">
              {[
                { ticker: "KXBTC-26MAR07", title: "Bitcoin > $100.5K", price: "58\u00A2", side: "Yes", change: "+6\u00A2", vol: "12.8K", changeColor: "text-signal-profit" },
                { ticker: "KXCPI-26MAR12", title: "CPI > 3.0%", price: "34\u00A2", side: "Yes", change: "-2\u00A2", vol: "8.4K", changeColor: "text-signal-loss" },
                { ticker: "KXFED-26MAR19", title: "Fed Rate Cut", price: "72\u00A2", side: "Yes", change: "+1\u00A2", vol: "15.2K", changeColor: "text-signal-profit" },
              ].map((item) => (
                <Card key={item.ticker} className="hover:border-brand/30 transition-colors cursor-pointer">
                  <CardContent className="py-3 px-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-mono font-medium">{item.ticker}</p>
                        <p className="text-[10px] text-muted-foreground">{item.title}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-sm font-medium">{item.price}</span>
                          <span className="text-[10px] text-muted-foreground">{item.side}</span>
                        </div>
                        <div className="flex items-center gap-1 justify-end">
                          <span className={`text-[10px] font-mono ${item.changeColor}`}>{item.change}</span>
                          <span className="text-[10px] text-muted-foreground">Vol: {item.vol}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <SubLabel>Dashboard &mdash; Data Table Row</SubLabel>
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Ticker</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Side</th>
                    <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground">Entry</th>
                    <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground">Current</th>
                    <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground">P&amp;L</th>
                    <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { ticker: "KXBTC-26MAR07", side: "Yes", entry: "52\u00A2", current: "58\u00A2", pnl: "+$0.90", pnlColor: "text-signal-profit", status: "Open" },
                    { ticker: "KXCPI-26MAR12", side: "No", entry: "66\u00A2", current: "62\u00A2", pnl: "+$0.60", pnlColor: "text-signal-profit", status: "Open" },
                    { ticker: "KXFED-26MAR19", side: "Yes", entry: "75\u00A2", current: "72\u00A2", pnl: "-$0.45", pnlColor: "text-signal-loss", status: "Open" },
                  ].map((row) => (
                    <tr key={row.ticker} className="border-b last:border-0 hover:bg-accent/50 transition-colors">
                      <td className="px-4 py-2.5 font-mono font-medium">{row.ticker}</td>
                      <td className="px-4 py-2.5">
                        <Badge variant="outline" className="text-[10px]">{row.side}</Badge>
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono">{row.entry}</td>
                      <td className="px-4 py-2.5 text-right font-mono">{row.current}</td>
                      <td className={`px-4 py-2.5 text-right font-mono font-medium ${row.pnlColor}`}>{row.pnl}</td>
                      <td className="px-4 py-2.5 text-right">
                        <Badge variant="outline" className="text-[10px] border-signal-info/30 text-signal-info">{row.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </SectionBlock>

        {/* ════════════════════════════════════════════════════
            COMPONENTS — full feature blocks
            ════════════════════════════════════════════════════ */}
        <SectionBlock
          id="components"
          title="Components"
          description="Full feature blocks — composed from atoms and molecules"
          count={6}
        >
          {/* ── Trading ── */}
          <div>
            <SubLabel>Trading &mdash; P&amp;L Display</SubLabel>
            <Card className="max-w-md">
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

          <div>
            <SubLabel>Trading &mdash; Order Confirmation</SubLabel>
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
                    { label: "Price", value: "52\u00A2" },
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
                    <Badge className="bg-confidence-high/15 text-confidence-high border-confidence-high/30">82% &mdash; Strong</Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button variant="outline" className="flex-1">Cancel</Button>
                <Button className="flex-1 bg-brand text-brand-foreground hover:bg-brand-hover">Place Order</Button>
              </CardFooter>
            </Card>
          </div>

          {/* ── Dashboard (NEW) ── */}
          <div>
            <SubLabel>Dashboard &mdash; Portfolio Summary</SubLabel>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="border-brand/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Balance</p>
                    <BarChart3 className="size-4 text-brand" />
                  </div>
                  <p className="text-2xl font-mono font-bold">$817.42</p>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUpRight className="size-3 text-signal-profit" />
                    <span className="text-xs font-mono text-signal-profit">+$24.80 today</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Positions</p>
                    <Activity className="size-4 text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-mono font-bold">6</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-mono text-signal-profit">4 profit</span>
                    <span className="text-xs text-muted-foreground">&middot;</span>
                    <span className="text-xs font-mono text-signal-loss">2 loss</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Win Rate</p>
                    <Target className="size-4 text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-mono font-bold text-confidence-high">68%</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs text-muted-foreground">19W / 9L from 28 trades</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div>
            <SubLabel>Dashboard &mdash; Market Overview</SubLabel>
            <Card className="max-w-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">KXBTC-26MAR07</CardTitle>
                    <CardDescription>Bitcoin &gt; $100.5K on Mar 7</CardDescription>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    <Activity className="size-3 mr-1" /> Live
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {/* Chart placeholder */}
                <div className="h-32 rounded-lg bg-muted/50 border border-dashed border-muted-foreground/20 flex items-center justify-center mb-4">
                  <div className="text-center">
                    <LineChart className="size-8 text-muted-foreground/30 mx-auto" />
                    <p className="text-[10px] text-muted-foreground/50 mt-1">Price chart area</p>
                  </div>
                </div>
                <div className="flex gap-2 mb-3">
                  <div className="flex-1 rounded-md bg-signal-profit/10 p-2 text-center">
                    <p className="text-[10px] text-muted-foreground">Yes</p>
                    <p className="font-mono text-sm font-medium text-signal-profit">58&cent;</p>
                  </div>
                  <div className="flex-1 rounded-md bg-signal-loss/10 p-2 text-center">
                    <p className="text-[10px] text-muted-foreground">No</p>
                    <p className="font-mono text-sm font-medium text-signal-loss">42&cent;</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[10px] text-muted-foreground">
                  <div><span className="block">Volume</span><span className="font-mono font-medium text-foreground">12,847</span></div>
                  <div><span className="block">Liquidity</span><span className="font-mono font-medium text-foreground">$8.2K</span></div>
                  <div><span className="block">Expires</span><span className="font-mono font-medium text-foreground">Mar 7</span></div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-brand text-brand-foreground hover:bg-brand-hover">
                  <Zap className="size-3.5 mr-2" /> Analyze with AI
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* ── AI Chat (NEW) ── */}
          <div>
            <SubLabel>AI Chat &mdash; Chat Input</SubLabel>
            <div className="max-w-lg">
              <div className="rounded-xl border bg-card p-2">
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 px-2">
                      <Select>
                        <SelectTrigger className="h-6 w-auto gap-1 border-0 bg-muted px-2 text-[10px] font-mono">
                          <SelectValue placeholder="claude-4-sonnet" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sonnet">claude-4-sonnet</SelectItem>
                          <SelectItem value="opus">claude-4-opus</SelectItem>
                          <SelectItem value="haiku">claude-4-haiku</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="px-2 pb-1">
                      <p className="text-sm text-muted-foreground">Ask about markets, positions, or strategies...</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 pb-1 pr-1">
                    <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                      <Paperclip className="size-4" />
                    </Button>
                    <Button size="icon-sm" className="bg-brand text-brand-foreground hover:bg-brand-hover">
                      <Send className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <SubLabel>AI Chat &mdash; Command Palette</SubLabel>
            <div className="max-w-md">
              <Card>
                <CardContent className="pt-4 pb-2">
                  <div className="flex items-center gap-2 px-2 mb-3">
                    <Search className="size-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground flex-1">Type a command or search...</span>
                    <kbd className="text-[10px] font-mono bg-muted text-muted-foreground px-1.5 py-0.5 rounded border">
                      &amp;#8984;K
                    </kbd>
                  </div>
                  <Separator />
                  <div className="py-2 space-y-0.5">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider px-2 py-1">Quick Actions</p>
                    {[
                      { icon: Search, label: "Scan markets", shortcut: "\u2318S" },
                      { icon: BarChart3, label: "View portfolio", shortcut: "\u2318P" },
                      { icon: Zap, label: "AI analysis", shortcut: "\u2318A" },
                      { icon: Eye, label: "Watchlist", shortcut: "\u2318W" },
                    ].map((cmd) => {
                      const Icon = cmd.icon;
                      return (
                        <div key={cmd.label} className="flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-accent transition-colors cursor-pointer">
                          <Icon className="size-4 text-muted-foreground" />
                          <span className="text-sm flex-1">{cmd.label}</span>
                          <kbd className="text-[10px] font-mono text-muted-foreground">{cmd.shortcut}</kbd>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </SectionBlock>

        {/* ── Footer ── */}
        <div className="border-t pt-8 pb-12 text-center text-sm text-muted-foreground">
          <p>Quantreno Design System v0.2</p>
          <p className="text-xs mt-1">Atomic Design &middot; Tailwind CSS v4 &middot; shadcn/ui</p>
        </div>
      </main>
    </div>
  );
}
