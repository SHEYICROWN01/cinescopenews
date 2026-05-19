import { TrendingUp, TrendingDown, Sun, Cloud } from "lucide-react";

const MARKETS = [
  { sym: "NGX ASI", val: "98,420.12", chg: +0.84 },
  { sym: "USD/NGN", val: "1,452.30", chg: -0.21 },
  { sym: "BRENT", val: "$83.41", chg: +1.12 },
  { sym: "GOLD", val: "$2,341", chg: +0.46 },
  { sym: "BTC", val: "$67,290", chg: -0.92 },
];

export function MarketTicker() {
  return (
    <div className="hidden md:flex border-b border-rule bg-background">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-10 h-9 flex items-center justify-between w-full text-[11px]">
        <div className="flex items-center gap-6 overflow-hidden">
          <span className="eyebrow text-ink-muted shrink-0">Markets</span>
          <div className="flex items-center gap-5 overflow-hidden">
            {MARKETS.map((m) => {
              const up = m.chg >= 0;
              return (
                <span key={m.sym} className="flex items-center gap-1.5 whitespace-nowrap">
                  <span className="font-mono font-bold tracking-tight">{m.sym}</span>
                  <span className="font-mono text-ink-muted">{m.val}</span>
                  <span className={`flex items-center font-mono font-semibold ${up ? "text-emerald-600" : "text-brand"}`}>
                    {up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {up ? "+" : ""}{m.chg.toFixed(2)}%
                  </span>
                </span>
              );
            })}
          </div>
        </div>
        <div className="hidden lg:flex items-center gap-4 shrink-0 pl-6 text-ink-muted">
          <span className="flex items-center gap-1.5"><Sun size={12} /> Lagos 31°C</span>
          <span className="flex items-center gap-1.5"><Cloud size={12} /> Abuja 27°C</span>
        </div>
      </div>
    </div>
  );
}
