import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Activity, Target, ArrowUpRight } from "lucide-react";

export default function PortfolioSummaryDemo() {
  return (
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
  );
}
