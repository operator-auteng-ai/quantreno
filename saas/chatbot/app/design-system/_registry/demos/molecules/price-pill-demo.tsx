export default function PricePillDemo() {
  return (
    <div className="flex flex-wrap gap-3">
      {[
        { price: "58\u00A2", label: "Yes", cls: "bg-signal-profit/15 text-signal-profit border-signal-profit/30" },
        { price: "42\u00A2", label: "No", cls: "bg-signal-loss/15 text-signal-loss border-signal-loss/30" },
        { price: "50\u00A2", label: "Even", cls: "bg-signal-neutral/15 text-signal-neutral border-signal-neutral/30" },
      ].map((pill) => (
        <div key={pill.label} className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border font-mono text-sm ${pill.cls}`}>
          <span className="font-bold">{pill.price}</span>
          <span className="text-xs opacity-70">{pill.label}</span>
        </div>
      ))}
    </div>
  );
}
