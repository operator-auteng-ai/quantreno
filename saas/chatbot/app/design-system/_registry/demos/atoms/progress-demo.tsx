import { Progress } from "@/components/ui/progress";

export default function ProgressDemo() {
  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-muted-foreground">Default</span>
          <span className="font-mono">65%</span>
        </div>
        <Progress value={65} />
      </div>
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-muted-foreground">Edge Meter</span>
          <span className="font-mono text-confidence-high">82%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-confidence-high" style={{ width: "82%" }} />
        </div>
      </div>
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-muted-foreground">Brand Gradient</span>
          <span className="font-mono">73%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end" style={{ width: "73%" }} />
        </div>
      </div>
    </div>
  );
}
