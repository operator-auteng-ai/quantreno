import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Search, BarChart3, Zap, Eye } from "lucide-react";

export default function CommandPaletteDemo() {
  return (
    <div className="max-w-md">
      <Card>
        <CardContent className="pt-4 pb-2">
          <div className="flex items-center gap-2 px-2 mb-3">
            <Search className="size-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground flex-1">Type a command or search...</span>
            <kbd className="text-[10px] font-mono bg-muted text-muted-foreground px-1.5 py-0.5 rounded border">
              &#8984;K
            </kbd>
          </div>
          <Separator />
          <div className="py-2 space-y-0.5">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider px-2 py-1">Quick Actions</p>
            {[
              { icon: Search, label: "Scan markets", shortcut: "\u2318S" },
              { icon: BarChart3, label: "View portfolio", shortcut: "\u2318P" },
              { icon: Zap, label: "AI analysis", shortcut: "\u2318A" },
              { icon: Eye, label: "Watchlist", shortcut: "\u2318W" },
            ].map((cmd) => {
              const Icon = cmd.icon;
              return (
                <div key={cmd.label} className="flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-accent transition-colors cursor-pointer">
                  <Icon className="size-4 text-muted-foreground" />
                  <span className="text-sm flex-1">{cmd.label}</span>
                  <kbd className="text-[10px] font-mono text-muted-foreground">{cmd.shortcut}</kbd>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
