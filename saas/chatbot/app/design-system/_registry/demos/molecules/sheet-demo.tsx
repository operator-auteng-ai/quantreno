import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function SheetDemo() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open Sheet</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Trade Settings</SheetTitle>
          <SheetDescription>Configure your default trading parameters.</SheetDescription>
        </SheetHeader>
        <div className="space-y-4 py-6">
          <div className="space-y-2">
            <Label>Max Position Size</Label>
            <Input defaultValue="$10.00" />
          </div>
          <div className="space-y-2">
            <Label>Default Strategy</Label>
            <Input defaultValue="Fat Tails" />
          </div>
          <div className="space-y-2">
            <Label>Kelly Fraction</Label>
            <Input defaultValue="0.5" />
          </div>
        </div>
        <div className="flex justify-end">
          <Button className="bg-brand text-brand-foreground hover:bg-brand-hover">Save Changes</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
