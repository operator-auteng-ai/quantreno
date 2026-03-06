import { Card, CardContent } from "@/components/ui/card";

export default function EdgeMeterDemo() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[
        { label: "Strong Edge", value: 82, textCls: "text-confidence-high", bgCls: "bg-confidence-high" },
        { label: "Moderate Edge", value: 55, textCls: "text-confidence-medium", bgCls: "bg-confidence-medium" },
        { label: "Weak Edge", value: 25, textCls: "text-confidence-low", bgCls: "bg-confidence-low" },
      ].map((edge) => (
        <Card key={edge.label}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{edge.label}</span>
              <span className={`font-mono font-medium ${edge.textCls}`}>{edge.value}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${edge.bgCls}`} style={{ width: `${edge.value}%` }} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
