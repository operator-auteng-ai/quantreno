"use client";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function TextareaDemo() {
  const [value, setValue] = useState("");
  return (
    <div className="max-w-sm">
      <Label htmlFor="ds-textarea">Trade Notes</Label>
      <Textarea id="ds-textarea" placeholder="Reasoning for this trade..." value={value} onChange={(e) => setValue(e.target.value)} />
    </div>
  );
}
