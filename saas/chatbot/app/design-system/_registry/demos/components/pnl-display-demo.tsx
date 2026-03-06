import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight } from "lucide-react";

export default function PnlDisplayDemo() {
  return (
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
  );
}
