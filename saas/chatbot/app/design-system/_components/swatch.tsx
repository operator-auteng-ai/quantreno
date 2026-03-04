export function Swatch({
  name,
  token,
  className,
}: {
  name: string;
  token: string;
  className: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className={`h-12 rounded-md border ${className}`} />
      <p className="text-xs font-medium truncate">{name}</p>
      <p className="text-[10px] text-muted-foreground font-mono truncate">
        {token}
      </p>
    </div>
  );
}
