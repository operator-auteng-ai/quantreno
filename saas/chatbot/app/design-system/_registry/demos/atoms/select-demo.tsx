import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export default function SelectDemo() {
  return (
    <div className="max-w-sm">
      <Label>Strategy</Label>
      <Select>
        <SelectTrigger><SelectValue placeholder="Select strategy" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="oil">Oil Macro</SelectItem>
          <SelectItem value="fat-tails">Fat Tails</SelectItem>
          <SelectItem value="vol">Vol Swing</SelectItem>
          <SelectItem value="spread">Spread Arb</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
