export default function TabBarDemo() {
  return (
    <div className="flex border-b">
      {["Overview", "Trades", "Analysis", "Settings"].map((tab, i) => (
        <button key={tab} className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${i === 0 ? "border-brand text-brand" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
          {tab}
        </button>
      ))}
    </div>
  );
}
