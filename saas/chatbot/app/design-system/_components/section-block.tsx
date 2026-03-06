export function SectionBlock({
  id,
  title,
  description,
  count,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20">
      <div className="sticky top-14 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b -mx-1 px-1 py-3 mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          {count !== undefined && (
            <span className="text-[10px] font-mono bg-brand/10 text-brand px-1.5 py-0.5 rounded">
              {count}
            </span>
          )}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <div className="space-y-8">{children}</div>
    </section>
  );
}
