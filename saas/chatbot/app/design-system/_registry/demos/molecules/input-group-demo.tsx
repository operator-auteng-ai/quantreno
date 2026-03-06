import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import { Search, DollarSign } from "lucide-react";

export default function InputGroupDemo() {
  return (
    <div className="space-y-4 max-w-sm">
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">With icon addon</p>
        <InputGroup>
          <InputGroupAddon>
            <Search className="size-4" />
          </InputGroupAddon>
          <InputGroupInput placeholder="Search markets..." />
        </InputGroup>
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">With text addon</p>
        <InputGroup>
          <InputGroupAddon>
            <InputGroupText><DollarSign className="size-4" /></InputGroupText>
          </InputGroupAddon>
          <InputGroupInput placeholder="0.00" type="number" />
          <InputGroupAddon align="inline-end">
            <InputGroupButton>Max</InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </div>
    </div>
  );
}
