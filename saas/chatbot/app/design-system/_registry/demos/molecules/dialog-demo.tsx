"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function DialogDemo() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Trade</DialogTitle>
          <DialogDescription>Enter the details for your new position.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="ds-dialog-ticker">Market Ticker</Label>
            <Input id="ds-dialog-ticker" placeholder="KXBTC-26MAR07" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ds-dialog-contracts">Contracts</Label>
            <Input id="ds-dialog-contracts" type="number" placeholder="15" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button className="bg-brand text-brand-foreground hover:bg-brand-hover" onClick={() => setOpen(false)}>Place Order</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
