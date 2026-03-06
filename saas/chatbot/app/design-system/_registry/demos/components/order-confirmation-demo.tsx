import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default function OrderConfirmationDemo() {
  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Shield className="size-4 text-brand" /> Confirm Trade
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[
            { label: "Market", value: "KXBTC-26MAR07" },
            { label: "Side", value: "Yes" },
            { label: "Price", value: "52\u00A2" },
            { label: "Contracts", value: "15" },
            { label: "Total Cost", value: "$7.80" },
            { label: "Max Loss", value: "$7.80" },
            { label: "Max Profit", value: "$7.20" },
            { label: "Strategy", value: "Fat Tails" },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{row.label}</span>
              <span className="font-mono font-medium">{row.value}</span>
            </div>
          ))}
          <div className="flex items-center justify-between text-sm pt-2 border-t">
            <span className="text-muted-foreground">Edge Score</span>
            <Badge className="bg-confidence-high/15 text-confidence-high border-confidence-high/30">82% &mdash; Strong</Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="outline" className="flex-1">Cancel</Button>
        <Button className="flex-1 bg-brand text-brand-foreground hover:bg-brand-hover">Place Order</Button>
      </CardFooter>
    </Card>
  );
}
