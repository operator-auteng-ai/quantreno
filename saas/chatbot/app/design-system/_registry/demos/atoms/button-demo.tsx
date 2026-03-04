"use client";
import { Button } from "@/components/ui/button";
import { Zap, Target, Settings, Bell } from "lucide-react";

export default function ButtonDemo() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">Variants</p>
        <div className="flex flex-wrap gap-3">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
        </div>
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">Brand CTA</p>
        <div className="flex flex-wrap gap-3">
          <Button className="bg-brand text-brand-foreground hover:bg-brand-hover">
            <Zap className="size-4 mr-2" />Analyze Market
          </Button>
          <Button className="bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end text-white hover:opacity-90">
            <Target className="size-4 mr-2" />Start Scanning
          </Button>
        </div>
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">Sizes</p>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button>Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon"><Settings className="size-4" /></Button>
          <Button size="icon-sm"><Bell className="size-3.5" /></Button>
        </div>
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">States</p>
        <div className="flex flex-wrap gap-3">
          <Button>Default</Button>
          <Button disabled>Disabled</Button>
          <Button disabled>
            <span className="size-4 border-2 border-current border-t-transparent rounded-full mr-2" style={{ animation: "ds-spin 1s linear infinite" }} />
            Loading
          </Button>
        </div>
      </div>
    </div>
  );
}
