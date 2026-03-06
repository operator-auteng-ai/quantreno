import { BarChart3, Activity, Search, LineChart, Settings } from "lucide-react";

export default function NavSidebarDemo() {
  return (
    <div className="w-64 space-y-0.5 rounded-lg border p-2">
      {[
        { icon: BarChart3, label: "Dashboard", active: true },
        { icon: Activity, label: "Positions", badge: "6" },
        { icon: Search, label: "Scanner" },
        { icon: LineChart, label: "Analysis" },
        { icon: Settings, label: "Settings" },
      ].map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.label} className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${item.active ? "bg-brand/10 text-brand font-medium" : "text-muted-foreground hover:bg-accent"}`}>
            <Icon className="size-4" />
            <span className="flex-1">{item.label}</span>
            {item.badge && <span className="text-[10px] font-mono bg-brand/20 text-brand px-1.5 py-0.5 rounded">{item.badge}</span>}
          </div>
        );
      })}
    </div>
  );
}
