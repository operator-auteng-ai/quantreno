import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Info, AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";

export default function AlertDemo() {
  return (
    <div className="space-y-3">
      <Alert>
        <Info className="size-4" />
        <AlertTitle>Default Alert</AlertTitle>
        <AlertDescription>Market scan complete. 3 opportunities match your criteria.</AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <AlertCircle className="size-4" />
        <AlertTitle>Destructive</AlertTitle>
        <AlertDescription>Position exceeds $10 risk limit. Reduce size before placing order.</AlertDescription>
      </Alert>
      <Alert className="border-signal-profit/30 bg-signal-profit/5 text-signal-profit [&>svg]:text-signal-profit">
        <CheckCircle2 className="size-4" />
        <AlertTitle>Trade Executed</AlertTitle>
        <AlertDescription className="text-signal-profit/80">Bought 15 contracts KXBTC-26MAR07 Yes @ 52&cent;. Total cost: $7.80.</AlertDescription>
      </Alert>
      <Alert className="border-signal-info/30 bg-signal-info/5 text-signal-info [&>svg]:text-signal-info">
        <Info className="size-4" />
        <AlertTitle>Market Update</AlertTitle>
        <AlertDescription className="text-signal-info/80">BTC crossed $100K. Your position in KXBTC-26MAR07 is now in profit.</AlertDescription>
      </Alert>
      <Alert className="border-confidence-medium/30 bg-confidence-medium/5 text-confidence-medium [&>svg]:text-confidence-medium">
        <AlertTriangle className="size-4" />
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription className="text-confidence-medium/80">Market liquidity below threshold. Spread may be wider than expected.</AlertDescription>
      </Alert>
    </div>
  );
}
