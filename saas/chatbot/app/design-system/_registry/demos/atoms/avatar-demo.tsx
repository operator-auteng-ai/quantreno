import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";

export default function AvatarDemo() {
  return (
    <div className="flex items-center gap-4">
      <Avatar>
        <AvatarFallback className="bg-brand/20 text-brand text-sm font-medium">PK</AvatarFallback>
      </Avatar>
      <Avatar className="size-8">
        <AvatarFallback className="bg-signal-profit/20 text-signal-profit text-xs font-medium">AI</AvatarFallback>
      </Avatar>
      <Avatar className="size-12">
        <AvatarFallback className="bg-muted text-muted-foreground text-base font-medium">QT</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback className="bg-chart-3/20 text-chart-3 text-sm font-medium">
          <User className="size-4" />
        </AvatarFallback>
      </Avatar>
    </div>
  );
}
