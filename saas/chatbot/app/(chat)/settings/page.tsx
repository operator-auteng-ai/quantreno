import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { getKalshiCredentialByUserId } from "@/lib/db/queries";
import { KalshiConnectionForm } from "@/components/kalshi-connection-form";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const credential = await getKalshiCredentialByUserId({
    userId: session.user.id,
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8">
        <h1 className="font-semibold text-2xl">Settings</h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Manage your account and integrations.
        </p>
      </div>

      <section className="rounded-xl border p-6">
        <div className="mb-5">
          <h2 className="font-medium text-base">Kalshi Account</h2>
          <p className="mt-1 text-muted-foreground text-sm">
            Connect your Kalshi account to research markets and execute trades.
            Your API key is encrypted and stored securely — it is only
            decrypted server-side when making API calls.
          </p>
        </div>

        <KalshiConnectionForm isConnected={!!credential} />
      </section>
    </div>
  );
}
