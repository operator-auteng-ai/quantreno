import { Badge } from "@/components/ui/badge";

export default function DataTableRowDemo() {
  return (
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
              <td className="px-4 py-2.5"><Badge variant="outline" className="text-[10px]">{row.side}</Badge></td>
              <td className="px-4 py-2.5 text-right font-mono">{row.entry}</td>
              <td className="px-4 py-2.5 text-right font-mono">{row.current}</td>
              <td className={`px-4 py-2.5 text-right font-mono font-medium ${row.pnlColor}`}>{row.pnl}</td>
              <td className="px-4 py-2.5 text-right"><Badge variant="outline" className="text-[10px] border-signal-info/30 text-signal-info">{row.status}</Badge></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
