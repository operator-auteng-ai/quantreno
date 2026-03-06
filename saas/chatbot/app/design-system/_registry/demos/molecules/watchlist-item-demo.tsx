import { Card, CardContent } from "@/components/ui/card";

export default function WatchlistItemDemo() {
  return (
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
  );
}
