import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Activity, LineChart, Zap } from "lucide-react";

export default function MarketOverviewDemo() {
  return (
    <Card className="max-w-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">KXBTC-26MAR07</CardTitle>
            <CardDescription>Bitcoin &gt; $100.5K on Mar 7</CardDescription>
          </div>
          <Badge variant="outline" className="text-[10px]">
            <Activity className="size-3 mr-1" /> Live
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-32 rounded-lg bg-muted/50 border border-dashed border-muted-foreground/20 flex items-center justify-center mb-4">
          <div className="text-center">
            <LineChart className="size-8 text-muted-foreground/30 mx-auto" />
            <p className="text-[10px] text-muted-foreground/50 mt-1">Price chart area</p>
          </div>
        </div>
        <div className="flex gap-2 mb-3">
          <div className="flex-1 rounded-md bg-signal-profit/10 p-2 text-center">
            <p className="text-[10px] text-muted-foreground">Yes</p>
            <p className="font-mono text-sm font-medium text-signal-profit">58&cent;</p>
          </div>
          <div className="flex-1 rounded-md bg-signal-loss/10 p-2 text-center">
            <p className="text-[10px] text-muted-foreground">No</p>
            <p className="font-mono text-sm font-medium text-signal-loss">42&cent;</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-[10px] text-muted-foreground">
          <div><span className="block">Volume</span><span className="font-mono font-medium text-foreground">12,847</span></div>
          <div><span className="block">Liquidity</span><span className="font-mono font-medium text-foreground">$8.2K</span></div>
          <div><span className="block">Expires</span><span className="font-mono font-medium text-foreground">Mar 7</span></div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full bg-brand text-brand-foreground hover:bg-brand-hover">
          <Zap className="size-3.5 mr-2" /> Analyze with AI
        </Button>
      </CardFooter>
    </Card>
  );
}
