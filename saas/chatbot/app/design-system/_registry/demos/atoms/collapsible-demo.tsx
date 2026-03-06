"use client";
import { useState } from "react";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

export default function CollapsibleDemo() {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="w-80 space-y-2">
      <div className="flex items-center justify-between rounded-md border px-4 py-2">
        <span className="text-sm font-medium">Open Positions (3)</span>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="icon-sm">
            <ChevronDown className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} />
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="space-y-1.5">
        {[
          { ticker: "KXBTC-26MAR07", pnl: "+$0.90" },
          { ticker: "KXCPI-26MAR12", pnl: "+$0.60" },
          { ticker: "KXFED-26MAR19", pnl: "-$0.45" },
        ].map((pos) => (
          <div key={pos.ticker} className="flex items-center justify-between rounded-md border px-4 py-2 text-sm">
            <span className="font-mono">{pos.ticker}</span>
            <span className={`font-mono font-medium ${pos.pnl.startsWith("+") ? "text-signal-profit" : "text-signal-loss"}`}>{pos.pnl}</span>
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}
