/* Cinescope Global Concept — lime-background breaking news ticker below the header */
export function BreakingTicker({ titles = [] }: { titles?: string[] }) {
  const items = titles.length > 0 ? [...titles, ...titles] : ["Stay tuned for breaking developments"];
  return (
    <div
      className="flex items-stretch overflow-hidden h-10 border-b border-rule/20"
      style={{ backgroundColor: "var(--lime)" }}
    >
      {/* BREAKING label — red badge on lime ticker */}
      <div
        className="flex items-center gap-2 px-4 sm:px-5 shrink-0 z-10"
        style={{ backgroundColor: "var(--accent-red)", color: "var(--accent-red-foreground)" }}
      >
        <span
          className="size-2 rounded-full animate-pulse"
          style={{ backgroundColor: "var(--accent-red-foreground)" }}
        />
        <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-widest hidden xs:inline">
          Breaking
        </span>
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest xs:hidden">
          ●
        </span>
      </div>

      {/* Scrolling headlines */}
      <div className="flex-1 overflow-hidden relative">
        <div
          className="flex whitespace-nowrap animate-marquee absolute inset-y-0 items-center"
          style={{ color: "var(--lime-foreground)" }}
        >
          {items.map((item, i) => (
            <span key={i} className="flex items-center px-5 sm:px-8 text-xs sm:text-[13px] font-bold">
              {item}
              <span className="ml-12 opacity-30">◆</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
