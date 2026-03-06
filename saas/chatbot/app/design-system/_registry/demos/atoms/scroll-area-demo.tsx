import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const MARKETS = [
  "KXBTC-26MAR07", "KXETH-26MAR07", "KXCPI-26MAR12",
  "KXFED-26MAR19", "KXGDP-26MAR28", "KXINF-26APR02",
  "KXOIL-26APR09", "KXSPX-26APR16", "KXVIX-26APR23",
  "KXGLD-26APR30", "KXTSLA-26MAY07", "KXNVDA-26MAY14",
];

export default function ScrollAreaDemo() {
  return (
    <ScrollArea className="h-48 w-64 rounded-md border">
      <div className="p-4">
        <h4 className="mb-3 text-sm font-medium">Active Markets</h4>
        {MARKETS.map((market, i) => (
          <div key={market}>
            <div className="text-sm font-mono py-1.5">{market}</div>
            {i < MARKETS.length - 1 && <Separator />}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
