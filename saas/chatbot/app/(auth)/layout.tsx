export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-dvh w-screen items-start justify-center bg-background pt-12 md:items-center md:pt-0">
      {/* Subtle brand gradient background — matches landing page */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,var(--brand-muted),transparent_70%)]" />

      <div className="relative z-10 flex w-full max-w-md flex-col gap-6 overflow-hidden rounded-xl border border-border bg-card p-8 shadow-lg shadow-brand/5">
        {children}
      </div>
    </div>
  );
}
