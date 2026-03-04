import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut } from "@/components/ui/dropdown-menu";
import { Settings, User, Activity, LineChart, LogOut } from "lucide-react";

export default function DropdownMenuDemo() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Account</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem><User className="size-4" /> Profile <DropdownMenuShortcut>&#8984;P</DropdownMenuShortcut></DropdownMenuItem>
        <DropdownMenuItem><Settings className="size-4" /> Settings <DropdownMenuShortcut>&#8984;,</DropdownMenuShortcut></DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem><Activity className="size-4" /> View Positions</DropdownMenuItem>
        <DropdownMenuItem><LineChart className="size-4" /> Trade History</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-signal-loss focus:text-signal-loss"><LogOut className="size-4" /> Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
