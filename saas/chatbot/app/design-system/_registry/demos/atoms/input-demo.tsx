"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function InputDemo() {
  const [value, setValue] = useState("");
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div className="space-y-3">
        <div>
          <Label htmlFor="ds-default-input">Market Ticker</Label>
          <Input id="ds-default-input" placeholder="e.g., KXBTC-26MAR07" value={value} onChange={(e) => setValue(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="ds-disabled-input">Disabled</Label>
          <Input id="ds-disabled-input" disabled placeholder="Not available" />
        </div>
        <div>
          <Label htmlFor="ds-error-input" className="text-signal-loss">Position Size (error)</Label>
          <Input id="ds-error-input" className="border-signal-loss focus-visible:ring-signal-loss" defaultValue="15" />
          <p className="text-xs text-signal-loss mt-1">Exceeds $10 max per trade</p>
        </div>
      </div>
    </div>
  );
}
