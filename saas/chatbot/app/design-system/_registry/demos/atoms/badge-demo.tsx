"use client";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Activity, Info } from "lucide-react";

export default function BadgeDemo() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">Variants</p>
        <div className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </div>
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">Trading Signals</p>
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-signal-profit/15 text-signal-profit border-signal-profit/30"><TrendingUp className="size-3 mr-1" /> Profit</Badge>
          <Badge className="bg-signal-loss/15 text-signal-loss border-signal-loss/30"><TrendingDown className="size-3 mr-1" /> Loss</Badge>
          <Badge className="bg-signal-neutral/15 text-signal-neutral border-signal-neutral/30"><Activity className="size-3 mr-1" /> Neutral</Badge>
          <Badge className="bg-signal-info/15 text-signal-info border-signal-info/30"><Info className="size-3 mr-1" /> Info</Badge>
        </div>
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">Confidence &amp; Strategy</p>
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
    </div>
  );
}
