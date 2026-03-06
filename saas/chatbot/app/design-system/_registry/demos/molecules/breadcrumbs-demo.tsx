import { ChevronRight } from "lucide-react";

export default function BreadcrumbsDemo() {
  return (
    <div className="flex items-center gap-1.5 text-sm">
      <span className="text-muted-foreground hover:text-foreground cursor-pointer">Dashboard</span>
      <ChevronRight className="size-3.5 text-muted-foreground" />
      <span className="text-muted-foreground hover:text-foreground cursor-pointer">Positions</span>
      <ChevronRight className="size-3.5 text-muted-foreground" />
      <span className="font-medium">KXBTC-26MAR07</span>
    </div>
  );
}
