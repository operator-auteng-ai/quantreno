export function SubLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
      {children}
    </h3>
  );
}
