import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandSeparator, CommandShortcut } from "@/components/ui/command";
import { Search, BarChart3, Zap, Eye, Settings } from "lucide-react";

export default function CommandDemo() {
  return (
    <Command className="rounded-lg border shadow-md max-w-md">
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Quick Actions">
          <CommandItem><Search className="size-4" /> Scan markets <CommandShortcut>&#8984;S</CommandShortcut></CommandItem>
          <CommandItem><BarChart3 className="size-4" /> View portfolio <CommandShortcut>&#8984;P</CommandShortcut></CommandItem>
          <CommandItem><Zap className="size-4" /> AI analysis <CommandShortcut>&#8984;A</CommandShortcut></CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Navigation">
          <CommandItem><Eye className="size-4" /> Watchlist</CommandItem>
          <CommandItem><Settings className="size-4" /> Settings</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
