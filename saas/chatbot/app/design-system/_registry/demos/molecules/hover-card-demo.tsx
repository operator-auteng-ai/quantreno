import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";

export default function HoverCardDemo() {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <span className="font-mono text-sm font-medium text-brand underline underline-offset-4 cursor-pointer">KXBTC-26MAR07</span>
      </HoverCardTrigger>
      <HoverCardContent className="w-72">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Bitcoin &gt; $100.5K</p>
            <Badge variant="outline" className="text-[10px]"><Activity className="size-3 mr-1" /> Active</Badge>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div><span className="text-muted-foreground">Yes:</span> <span className="font-mono text-signal-profit">58&cent;</span></div>
            <div><span className="text-muted-foreground">No:</span> <span className="font-mono text-signal-loss">42&cent;</span></div>
            <div><span className="text-muted-foreground">Volume:</span> <span className="font-mono">12,847</span></div>
            <div><span className="text-muted-foreground">Expires:</span> <span className="font-mono">Mar 7</span></div>
          </div>
          <p className="text-[10px] text-muted-foreground">Hover over any ticker to see market details.</p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
