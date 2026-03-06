import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function LabelDemo() {
  return (
    <div className="max-w-sm space-y-2">
      <Label htmlFor="ds-label-demo">Market Search</Label>
      <Input id="ds-label-demo" placeholder="Search markets..." />
    </div>
  );
}
