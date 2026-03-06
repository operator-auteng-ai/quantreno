import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { TrendingUp, Activity, BarChart3 } from "lucide-react";

export default function CardDemo() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Standard Card</CardTitle>
          <CardDescription>A basic card component with header, content, and footer.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Card content goes here. Uses bg-card and card-foreground tokens.</p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" size="sm">Action</Button>
        </CardFooter>
      </Card>
      <Card className="border-signal-profit/20">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">KXBTC-26MAR07</CardTitle>
            <Badge className="bg-signal-profit/15 text-signal-profit border-signal-profit/30">
              <TrendingUp className="size-3 mr-1" /> +12.4%
            </Badge>
          </div>
          <CardDescription>Bitcoin &gt; $100.5K on Mar 7</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase">Entry</p>
              <p className="font-mono text-sm font-medium">52&cent;</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase">Current</p>
              <p className="font-mono text-sm font-medium text-signal-profit">58&cent;</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase">Contracts</p>
              <p className="font-mono text-sm">15</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase">P&amp;L</p>
              <p className="font-mono text-sm font-medium text-signal-profit">+$0.90</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Fed Rate Cut March</CardTitle>
            <Badge variant="outline" className="text-[10px]">
              <Activity className="size-3 mr-1" /> Active
            </Badge>
          </div>
          <CardDescription>Will the Fed cut rates in March 2026?</CardDescription>
        </CardHeader>
        <CardContent>
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
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Vol: 12,847</span>
            <span>Exp: Mar 7</span>
          </div>
        </CardContent>
        <CardFooter>
          <Button size="sm" className="w-full bg-brand text-brand-foreground hover:bg-brand-hover">
            <BarChart3 className="size-3.5 mr-2" /> Analyze
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
