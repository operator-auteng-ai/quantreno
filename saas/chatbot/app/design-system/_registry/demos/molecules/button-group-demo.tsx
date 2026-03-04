import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { BarChart3, Activity, LineChart } from "lucide-react";

export default function ButtonGroupDemo() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">Horizontal</p>
        <ButtonGroup>
          <Button variant="outline" size="sm"><BarChart3 className="size-3.5 mr-1.5" /> Dashboard</Button>
          <Button variant="outline" size="sm"><Activity className="size-3.5 mr-1.5" /> Positions</Button>
          <Button variant="outline" size="sm"><LineChart className="size-3.5 mr-1.5" /> Analysis</Button>
        </ButtonGroup>
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">Vertical</p>
        <ButtonGroup orientation="vertical">
          <Button variant="outline" size="sm">Buy</Button>
          <Button variant="outline" size="sm">Sell</Button>
          <Button variant="outline" size="sm">Hold</Button>
        </ButtonGroup>
      </div>
    </div>
  );
}
