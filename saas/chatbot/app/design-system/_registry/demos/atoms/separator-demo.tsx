import { Separator } from "@/components/ui/separator";

export default function SeparatorDemo() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground mb-2">Horizontal</p>
        <Separator />
      </div>
      <div className="flex h-8 items-center gap-4">
        <span className="text-sm">Overview</span>
        <Separator orientation="vertical" />
        <span className="text-sm">Trades</span>
        <Separator orientation="vertical" />
        <span className="text-sm">Analysis</span>
      </div>
    </div>
  );
}
