import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sparkles } from "lucide-react";

export default function ChatMessageDemo() {
  return (
    <div className="max-w-lg space-y-3">
      <div className="flex justify-end">
        <div className="bg-brand/10 rounded-2xl rounded-br-md px-4 py-2.5 max-w-[80%]">
          <p className="text-sm">Analyze KXBTC market for fat-tail opportunities</p>
          <p className="text-[10px] text-muted-foreground mt-1 text-right">2:34 PM</p>
        </div>
      </div>
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
  );
}
