import { BREAKING } from "@/lib/news-data";

export function BreakingTicker() {
  const items = [...BREAKING, ...BREAKING];
  return (
    <div className="bg-ink text-background flex items-stretch overflow-hidden h-10 border-b border-ink">
      <div className="bg-brand text-brand-foreground px-4 flex items-center gap-2 shrink-0 z-10">
        <span className="size-1.5 rounded-full bg-background animate-pulse-dot" />
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Breaking</span>
      </div>
      <div className="flex-1 overflow-hidden relative">
        <div className="flex whitespace-nowrap animate-marquee absolute inset-y-0 items-center">
          {items.map((item, i) => (
            <span key={i} className="flex items-center px-6 text-xs font-medium">
              {item}
              <span className="ml-12 opacity-30">/</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
