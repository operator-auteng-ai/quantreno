import { TrendingUp, Search, CheckCircle2, AlertTriangle } from "lucide-react";

export default function ActivityFeedDemo() {
  return (
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
  );
}
