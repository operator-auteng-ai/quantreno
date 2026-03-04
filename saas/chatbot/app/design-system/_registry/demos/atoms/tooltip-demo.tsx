import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

export default function TooltipDemo() {
  return (
    <TooltipProvider>
      <div className="flex flex-wrap gap-3">
        <Tooltip>
          <TooltipTrigger asChild><Button variant="outline" size="sm">Hover me</Button></TooltipTrigger>
          <TooltipContent><p>Tooltip content</p></TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild><Button variant="outline" size="icon-sm"><Info className="size-3.5" /></Button></TooltipTrigger>
          <TooltipContent><p>Market closes at 11:59 PM ET</p></TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild><Badge className="bg-confidence-high/15 text-confidence-high border-confidence-high/30 cursor-help">82%</Badge></TooltipTrigger>
          <TooltipContent><p>Strong edge &mdash; high confidence signal</p></TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
