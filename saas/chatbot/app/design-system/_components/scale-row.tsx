export function ScaleRow({
  name,
  prefix,
  steps,
}: {
  name: string;
  prefix: string;
  steps: number[];
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium">{name}</p>
      <div className="flex gap-0 rounded-lg overflow-hidden border">
        {steps.map((step) => (
          <div
            key={step}
            className="flex-1 h-10 relative group"
            style={{ backgroundColor: `var(--${prefix}-${step})` }}
          >
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-[9px] font-mono bg-black/60 text-white px-1 rounded">
                {step}
              </span>
            </div>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground font-mono">
        --{prefix}-&#123;50-950&#125;
      </p>
    </div>
  );
}
