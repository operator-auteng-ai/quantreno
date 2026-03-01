"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface Props {
  isConnected: boolean;
}

export function KalshiConnectionForm({ isConnected }: Props) {
  const [connected, setConnected] = useState(isConnected);
  const [balance, setBalance] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(!isConnected);
  const [apiKey, setApiKey] = useState("");
  const [privateKeyPem, setPrivateKeyPem] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/kalshi/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey, privateKeyPem }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Failed to connect Kalshi account");
        return;
      }

      setConnected(true);
      setBalance(data.balance ?? null);
      setShowForm(false);
      setApiKey("");
      setPrivateKeyPem("");
      toast.success("Kalshi account connected successfully");
    } catch {
      toast.error("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  async function handleDisconnect() {
    setLoading(true);
    try {
      await fetch("/api/kalshi/credentials", { method: "DELETE" });
      setConnected(false);
      setBalance(null);
      setShowForm(true);
      toast.success("Kalshi account disconnected");
    } catch {
      toast.error("Failed to disconnect");
    } finally {
      setLoading(false);
    }
  }

  if (connected && !showForm) {
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-2 rounded-full bg-green-500" />
          <div>
            <p className="font-medium text-sm">Connected</p>
            {balance !== null && (
              <p className="text-muted-foreground text-xs">
                Balance: ${(balance / 100).toFixed(2)}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            disabled={loading}
            onClick={() => setShowForm(true)}
            size="sm"
            variant="outline"
          >
            Update
          </Button>
          <Button
            disabled={loading}
            onClick={handleDisconnect}
            size="sm"
            variant="destructive"
          >
            Disconnect
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSave}>
      {connected && (
        <p className="text-muted-foreground text-sm">
          Enter new credentials to replace the existing connection.
        </p>
      )}

      <div className="space-y-1.5">
        <label className="font-medium text-sm" htmlFor="apiKey">
          API Key
        </label>
        <input
          autoComplete="off"
          className="w-full rounded-md border bg-background px-3 py-2 font-mono text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
          id="apiKey"
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          required
          spellCheck={false}
          type="text"
          value={apiKey}
        />
        <p className="text-muted-foreground text-xs">
          Found in your{" "}
          <a
            className="underline underline-offset-2 hover:text-foreground"
            href="https://kalshi.com/account/api"
            rel="noreferrer"
            target="_blank"
          >
            Kalshi account settings
          </a>
          .
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="font-medium text-sm" htmlFor="privateKeyPem">
          RSA Private Key (PEM)
        </label>
        <textarea
          className="w-full rounded-md border bg-background px-3 py-2 font-mono text-xs outline-none ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
          id="privateKeyPem"
          onChange={(e) => setPrivateKeyPem(e.target.value)}
          placeholder={"-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"}
          required
          rows={6}
          spellCheck={false}
          value={privateKeyPem}
        />
        <p className="text-muted-foreground text-xs">
          Paste the full PEM content including the{" "}
          <code className="rounded bg-muted px-1">-----BEGIN</code> and{" "}
          <code className="rounded bg-muted px-1">-----END</code> lines.
        </p>
      </div>

      <div className="flex gap-2">
        <Button disabled={loading} size="sm" type="submit">
          {loading ? "Connecting…" : "Connect & verify"}
        </Button>
        {connected && (
          <Button
            disabled={loading}
            onClick={() => setShowForm(false)}
            size="sm"
            type="button"
            variant="ghost"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
