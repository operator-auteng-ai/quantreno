import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, TrendingUp, Activity } from "lucide-react";

export default function StatCardDemo() {
  return (
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
  );
}
