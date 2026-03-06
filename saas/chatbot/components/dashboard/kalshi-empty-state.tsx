"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function KalshiEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-muted-foreground/25 p-8 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-warning/10">
        <AlertTriangle className="size-6 text-warning" />
      </div>
      <div>
        <h3 className="font-medium text-sm">Kalshi Not Connected</h3>
        <p className="mt-1 text-muted-foreground text-xs max-w-xs">
          Connect your Kalshi account to see live balance, positions, and
          execute trades through the AI assistant.
        </p>
      </div>
      <Button asChild variant="outline" size="sm">
        <Link href="/settings">Connect Kalshi Account</Link>
      </Button>
    </div>
  );
}

export function KalshiErrorBanner({ error }: { error: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/5 px-3 py-2 text-xs text-warning">
      <AlertTriangle className="size-3.5 shrink-0" />
      <span>Kalshi API error: {error}. Some data may be unavailable.</span>
    </div>
  );
}
