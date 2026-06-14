import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend,
} from "recharts";
import {
  ComposableMap, Geographies, Geography, ZoomableGroup,
} from "react-simple-maps";
import {
  Eye, Users, Globe, Monitor, Smartphone, Tablet, TrendingUp,
  TrendingDown, Minus, Zap, ArrowRight, Info, ExternalLink,
  Clock, BarChart2, BookOpen, Repeat,
} from "lucide-react";
import { getAnalyticsData, ALPHA2_TO_NUMERIC } from "../../../fns/analytics";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

type AnalyticsData = Awaited<ReturnType<typeof getAnalyticsData>>;

export const Route = createFileRoute("/management-portal/dashboard/analytics")({
  validateSearch: (s: Record<string, unknown>) => ({
    period: (s.period as string) || "7d",
  }),
  loaderDeps: ({ search }) => ({ period: search.period }),
  loader: ({ deps }) => getAnalyticsData({ data: deps.period }),
  component: AnalyticsPage,
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function pct(n: number, total: number): number {
  return total === 0 ? 0 : Math.round((n / total) * 100);
}

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function fmtHour(h: number): string {
  if (h === 0)  return "12am";
  if (h === 12) return "12pm";
  return h < 12 ? `${h}am` : `${h - 12}pm`;
}

function formatPath(path: string): string {
  if (path === "/") return "Home";
  return path.replace(/^\/article\//, "").replace(/-/g, " ").slice(0, 50);
}

const PERIOD_OPTIONS = [
  { key: "today", label: "Today" },
  { key: "7d",    label: "7 Days" },
  { key: "30d",   label: "30 Days" },
  { key: "all",   label: "All Time" },
];

const DEVICE_ICONS: Record<string, React.ReactNode> = {
  Mobile:  <Smartphone size={14} />,
  Desktop: <Monitor size={14} />,
  Tablet:  <Tablet size={14} />,
};

const PIE_COLORS = ["#C5D400", "#CC0000", "#0A0A0A", "#888", "#aaa"];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionTitle({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      {icon && <span style={{ color: "#CC0000" }}>{icon}</span>}
      <h2 className="font-black text-sm uppercase tracking-[0.15em]"
        style={{ fontFamily: "var(--font-display)", color: "#0A0A0A" }}>
        {children}
      </h2>
    </div>
  );
}

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white ${className}`} style={{ border: "1px solid rgba(0,0,0,0.08)" }}>
      {children}
    </div>
  );
}

function StatCard({
  icon, label, value, sub, accent = "#C5D400", badge,
}: {
  icon: React.ReactNode; label: string; value: string;
  sub?: string; accent?: string; badge?: React.ReactNode;
}) {
  return (
    <div className="bg-white p-5 relative" style={{ borderTop: `3px solid ${accent}` }}>
      <div className="flex items-start justify-between mb-3">
        <div className="size-8 flex items-center justify-center"
          style={{ background: `${accent}18` }}>
          <span style={{ color: accent }}>{icon}</span>
        </div>
        {badge}
      </div>
      <p className="font-black leading-none mb-1"
        style={{ fontFamily: "var(--font-display)", fontSize: "1.9rem", color: "#0A0A0A" }}>
        {value}
      </p>
      <p className="text-[11px] font-bold uppercase tracking-wider mb-0.5"
        style={{ color: "rgba(0,0,0,0.38)", fontFamily: "var(--font-mono)" }}>
        {label}
      </p>
      {sub && <p className="text-[11px]" style={{ color: "rgba(0,0,0,0.28)" }}>{sub}</p>}
    </div>
  );
}

function BarList({
  title, rows, total, accent = "#C5D400", limit = 8,
}: {
  title?: string; rows: { label: string; n: number }[];
  total?: number; accent?: string; limit?: number;
}) {
  const displayed = rows.slice(0, limit);
  const t = total ?? Math.max(...rows.map((r) => r.n), 1);
  return (
    <div className="space-y-2.5">
      {title && <p className="text-[11px] font-bold uppercase tracking-widest mb-3"
        style={{ color: "rgba(0,0,0,0.35)", fontFamily: "var(--font-mono)" }}>{title}</p>}
      {displayed.length === 0
        ? <p className="text-xs py-4 text-center" style={{ color: "rgba(0,0,0,0.25)" }}>No data yet</p>
        : displayed.map((row, i) => {
            const w = pct(row.n, t);
            return (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold truncate max-w-[65%]" style={{ color: "#0A0A0A" }}>
                    {row.label || "Unknown"}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px]" style={{ color: "rgba(0,0,0,0.35)", fontFamily: "var(--font-mono)" }}>{w}%</span>
                    <span className="text-xs font-black" style={{ fontFamily: "var(--font-mono)", color: "#0A0A0A" }}>{fmtNum(row.n)}</span>
                  </div>
                </div>
                <div className="h-1 bg-gray-100 overflow-hidden">
                  <div className="h-full transition-all duration-700"
                    style={{ width: `${w}%`, background: accent }} />
                </div>
              </div>
            );
          })}
    </div>
  );
}

function GrowthBadge({ pct: p }: { pct: number }) {
  if (p > 0) return (
    <span className="flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5"
      style={{ background: "rgba(34,197,94,0.12)", color: "#16a34a", fontFamily: "var(--font-mono)" }}>
      <TrendingUp size={9} /> +{p}%
    </span>
  );
  if (p < 0) return (
    <span className="flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5"
      style={{ background: "rgba(239,68,68,0.1)", color: "#dc2626", fontFamily: "var(--font-mono)" }}>
      <TrendingDown size={9} /> {p}%
    </span>
  );
  return (
    <span className="flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5"
      style={{ background: "rgba(0,0,0,0.06)", color: "rgba(0,0,0,0.4)", fontFamily: "var(--font-mono)" }}>
      <Minus size={9} /> 0%
    </span>
  );
}

// World map with choropleth coloring
function WorldMap({ countries }: { countries: { code: string; n: number }[] }) {
  const [tooltip, setTooltip] = useState<{ name: string; n: number; x: number; y: number } | null>(null);

  const countryMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of countries) {
      const numeric = ALPHA2_TO_NUMERIC[c.code];
      if (numeric) m.set(numeric, c.n);
    }
    return m;
  }, [countries]);

  const maxVal = useMemo(() => Math.max(...Array.from(countryMap.values()), 1), [countryMap]);

  function getColor(numericId: string): string {
    const n = countryMap.get(numericId);
    if (!n) return "#F0F0EC";
    const intensity = Math.log(n + 1) / Math.log(maxVal + 1);
    // Lime green scale: from light (#E8EFA0) to saturated (#8A9500)
    const lightness = Math.round(93 - intensity * 45);
    const saturation = Math.round(40 + intensity * 55);
    return `hsl(65, ${saturation}%, ${lightness}%)`;
  }

  return (
    <div className="relative" style={{ background: "#F8F8F4" }}>
      <ComposableMap
        projectionConfig={{ scale: 140, center: [15, 10] }}
        style={{ width: "100%", height: "auto" }}
        height={260}
      >
        <ZoomableGroup zoom={1} minZoom={0.8} maxZoom={4}>
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const numericId = String(geo.id ?? "");
                const n = countryMap.get(numericId) ?? 0;
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={getColor(numericId)}
                    stroke="#E0E0D8"
                    strokeWidth={0.4}
                    style={{
                      default: { outline: "none" },
                      hover:   { outline: "none", fill: n ? "#C5D400" : "#E0E0D8", cursor: n ? "pointer" : "default" },
                      pressed: { outline: "none" },
                    }}
                    onMouseEnter={(e) => {
                      if (n) {
                        const name = geo.properties?.name ?? "";
                        setTooltip({ name, n, x: (e as any).clientX, y: (e as any).clientY });
                      }
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none px-3 py-2"
          style={{
            left: tooltip.x + 12, top: tooltip.y - 40,
            background: "#0A0A0A", color: "#fff",
            fontSize: "11px", fontFamily: "var(--font-mono)",
          }}
        >
          <div className="font-bold">{tooltip.name}</div>
          <div style={{ color: "#C5D400" }}>{fmtNum(tooltip.n)} visitors</div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-2 left-3 flex items-center gap-1.5">
        <div className="flex">
          {[93, 80, 65, 50].map((l, i) => (
            <div key={i} className="w-5 h-2" style={{ background: `hsl(65,${40+i*15}%,${l}%)` }} />
          ))}
        </div>
        <span className="text-[9px]" style={{ color: "rgba(0,0,0,0.4)", fontFamily: "var(--font-mono)" }}>
          Low → High
        </span>
      </div>
    </div>
  );
}

// 24-hour heatmap strip
function HourlyHeatmap({ data }: { data: { hour: number; n: number }[] }) {
  const max = Math.max(...data.map((d) => d.n), 1);
  return (
    <div>
      <div className="flex gap-0.5">
        {data.map((d) => {
          const intensity = d.n / max;
          const bg = d.n === 0
            ? "#F0F0EC"
            : `hsl(65, ${40 + intensity * 55}%, ${93 - intensity * 45}%)`;
          return (
            <div key={d.hour} className="flex-1 group relative">
              <div className="h-8" style={{ background: bg }} title={`${fmtHour(d.hour)}: ${d.n} views`} />
              {/* tooltip on hover */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100
                pointer-events-none px-1.5 py-1 text-[9px] whitespace-nowrap z-10"
                style={{ background: "#0A0A0A", color: "#C5D400", fontFamily: "var(--font-mono)" }}>
                {fmtHour(d.hour)}: {d.n}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[9px]" style={{ color: "rgba(0,0,0,0.3)", fontFamily: "var(--font-mono)" }}>12am</span>
        <span className="text-[9px]" style={{ color: "rgba(0,0,0,0.3)", fontFamily: "var(--font-mono)" }}>6am</span>
        <span className="text-[9px]" style={{ color: "rgba(0,0,0,0.3)", fontFamily: "var(--font-mono)" }}>12pm</span>
        <span className="text-[9px]" style={{ color: "rgba(0,0,0,0.3)", fontFamily: "var(--font-mono)" }}>6pm</span>
        <span className="text-[9px]" style={{ color: "rgba(0,0,0,0.3)", fontFamily: "var(--font-mono)" }}>11pm</span>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

function AnalyticsPage() {
  const data     = Route.useLoaderData() as AnalyticsData;
  const navigate = useNavigate();
  const { period } = Route.useSearch();

  const totalViews     = data.totalViews;
  const uniqueVisitors = data.uniqueVisitors;

  const topCountry = data.countries[0]?.label ?? "—";
  const topSource  = data.sources[0]?.label ?? "—";

  const sourceTotal  = data.sources.reduce((s, r) => s + r.n, 0);
  const countryTotal = data.countries.reduce((s, r) => s + r.n, 0);
  const deviceTotal  = data.devices.reduce((s, r) => s + r.n, 0);
  const pageTotal    = data.topPages.reduce((s, r) => s + r.n, 0);
  const catTotal     = data.categories.reduce((s, r) => s + r.n, 0);
  const nvrTotal     = data.newVsReturning.reduce((s, r) => s + r.n, 0);

  // Peak hour
  const peakHour     = data.hourly.reduce((max, h) => h.n > max.n ? h : max, { hour: 0, n: 0 });
  const peakHourLabel = fmtHour(peakHour.hour);

  // Audience signal — younger skew if mobile>60% or Instagram/TikTok in top 3 sources
  const mobileShare  = pct(data.devices.find((d) => d.label === "Mobile")?.n ?? 0, deviceTotal);
  const socialSources = ["Instagram", "TikTok", "Snapchat", "Twitter / X", "Threads"];
  const socialTraffic = data.sources.filter((s) => socialSources.includes(s.label)).reduce((a, s) => a + s.n, 0);
  const socialPct    = pct(socialTraffic, sourceTotal);

  return (
    <div className="space-y-6">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] mb-1.5"
            style={{ color: "#CC0000", fontFamily: "var(--font-mono)" }}>
            Intelligence Dashboard
          </p>
          <h1 className="font-black leading-none"
            style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem,4vw,2.5rem)", color: "#0A0A0A", letterSpacing: "-0.02em" }}>
            Site Analytics
          </h1>
          {data.realtimeViews > 0 && (
            <div className="flex items-center gap-1.5 mt-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-bold" style={{ color: "rgba(0,0,0,0.4)", fontFamily: "var(--font-mono)" }}>
                {data.realtimeViews} active view{data.realtimeViews !== 1 ? "s" : ""} right now
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 p-1 bg-white"
          style={{ border: "1px solid rgba(0,0,0,0.08)" }}>
          {PERIOD_OPTIONS.map((opt) => (
            <button key={opt.key}
              onClick={() => navigate({ to: "/management-portal/dashboard/analytics", search: { period: opt.key } })}
              className="px-4 py-2 text-[11px] font-bold uppercase tracking-widest transition-all"
              style={{
                fontFamily: "var(--font-mono)",
                background: period === opt.key ? "#0A0A0A" : "transparent",
                color: period === opt.key ? "#C5D400" : "rgba(0,0,0,0.4)",
              }}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Key metrics ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={<Eye size={15} />} label="Page Views" accent="#C5D400"
          value={fmtNum(totalViews)} sub="total impressions" />
        <StatCard
          icon={<Users size={15} />} label="Unique Visitors" accent="#CC0000"
          value={fmtNum(uniqueVisitors)} sub="distinct sessions" />
        <StatCard
          icon={<Globe size={15} />} label="Top Market" accent="#C5D400"
          value={topCountry} sub={`${fmtNum(data.countries[0]?.n ?? 0)} visitors`} />
        <StatCard
          icon={<Zap size={15} />} label="Top Source" accent="#0A0A0A"
          value={topSource} sub={`${pct(data.sources[0]?.n ?? 0, sourceTotal)}% of traffic`} />
      </div>

      {/* ── Geographic reach ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* World map */}
        <Panel className="lg:col-span-2 overflow-hidden">
          <div className="px-5 pt-4 pb-2 flex items-center justify-between"
            style={{ borderBottom: "2px solid #C5D400" }}>
            <div className="flex items-center gap-2">
              <Globe size={14} style={{ color: "#CC0000" }} />
              <h2 className="font-black text-sm" style={{ fontFamily: "var(--font-display)", color: "#0A0A0A" }}>
                Geographic Reach
              </h2>
            </div>
            <span className="text-[10px] font-bold" style={{ color: "rgba(0,0,0,0.3)", fontFamily: "var(--font-mono)" }}>
              {data.countries.length} countries
            </span>
          </div>
          <WorldMap countries={data.countries} />
        </Panel>

        {/* Country list */}
        <Panel>
          <div className="px-5 pt-4 pb-3 h-full flex flex-col">
            <p className="text-[11px] font-bold uppercase tracking-widest mb-4"
              style={{ color: "rgba(0,0,0,0.35)", fontFamily: "var(--font-mono)" }}>
              Top Markets
            </p>
            <div className="space-y-2.5 flex-1">
              {data.countries.slice(0, 10).length === 0
                ? <p className="text-xs py-4" style={{ color: "rgba(0,0,0,0.3)" }}>No location data yet</p>
                : data.countries.slice(0, 10).map((c, i) => (
                  <div key={c.code} className="flex items-center gap-2.5">
                    <span className="text-xs font-black w-4 text-right shrink-0"
                      style={{ color: "rgba(0,0,0,0.25)", fontFamily: "var(--font-mono)" }}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-semibold truncate" style={{ color: "#0A0A0A" }}>
                          {c.label}
                        </span>
                        <span className="text-xs font-black ml-2 shrink-0"
                          style={{ fontFamily: "var(--font-mono)", color: "#0A0A0A" }}>
                          {fmtNum(c.n)}
                        </span>
                      </div>
                      <div className="h-1 bg-gray-100">
                        <div className="h-full" style={{
                          width: `${pct(c.n, countryTotal)}%`,
                          background: i === 0 ? "#C5D400" : i === 1 ? "#CC0000" : "rgba(0,0,0,0.15)",
                        }} />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </Panel>
      </div>

      {/* ── Traffic over time ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Panel className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-black text-sm" style={{ fontFamily: "var(--font-display)", color: "#0A0A0A" }}>
              Traffic Over Time
            </h2>
            <div className="flex items-center gap-4 text-[10px]"
              style={{ fontFamily: "var(--font-mono)", color: "rgba(0,0,0,0.3)" }}>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 inline-block" style={{ background: "#C5D400" }} /> Views
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 inline-block" style={{ background: "#CC0000" }} /> Visitors
              </span>
            </div>
          </div>
          {data.daily.length === 0
            ? <div className="h-44 flex flex-col items-center justify-center" style={{ color: "rgba(0,0,0,0.2)" }}>
                <Eye size={28} className="mb-2" />
                <p className="text-sm">No data for this period</p>
              </div>
            : <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={data.daily} margin={{ top: 4, right: 4, bottom: 0, left: -12 }}>
                  <defs>
                    <linearGradient id="gV" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#C5D400" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#C5D400" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gU" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#CC0000" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#CC0000" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="date" tickFormatter={formatDate}
                    tick={{ fontSize: 9, fill: "rgba(0,0,0,0.3)", fontFamily: "var(--font-mono)" }}
                    axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: "rgba(0,0,0,0.3)", fontFamily: "var(--font-mono)" }}
                    axisLine={false} tickLine={false} tickFormatter={fmtNum} />
                  <Tooltip
                    contentStyle={{ background: "#0A0A0A", border: "none", fontSize: "11px",
                      fontFamily: "var(--font-mono)", color: "#fff" }}
                    labelFormatter={formatDate}
                    formatter={(val: number, name: string) =>
                      [fmtNum(val), name === "views" ? "Views" : "Visitors"]} />
                  <Area type="monotone" dataKey="views"    stroke="#C5D400" strokeWidth={2} fill="url(#gV)" dot={false} />
                  <Area type="monotone" dataKey="visitors" stroke="#CC0000" strokeWidth={2} fill="url(#gU)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
          }
        </Panel>

        {/* New vs Returning */}
        <Panel className="p-5 flex flex-col">
          <h2 className="font-black text-sm mb-4" style={{ fontFamily: "var(--font-display)", color: "#0A0A0A" }}>
            Audience Loyalty
          </h2>
          {nvrTotal === 0
            ? <div className="flex-1 flex items-center justify-center">
                <p className="text-xs" style={{ color: "rgba(0,0,0,0.3)" }}>No data yet</p>
              </div>
            : <>
                <div className="flex-1 flex items-center justify-center">
                  <PieChart width={160} height={160}>
                    <Pie data={data.newVsReturning} dataKey="n" cx={80} cy={80}
                      innerRadius={50} outerRadius={72} paddingAngle={3} startAngle={90} endAngle={450}>
                      {data.newVsReturning.map((_, i) => (
                        <Cell key={i} fill={i === 0 ? "#C5D400" : "#CC0000"} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "#0A0A0A", border: "none", fontSize: "11px",
                        fontFamily: "var(--font-mono)", color: "#fff" }}
                      formatter={(val: number) => [fmtNum(val), ""]} />
                  </PieChart>
                </div>
                <div className="space-y-2 mt-2">
                  {data.newVsReturning.map((r, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 inline-block shrink-0"
                          style={{ background: i === 0 ? "#C5D400" : "#CC0000" }} />
                        <span className="text-xs font-semibold" style={{ color: "#0A0A0A" }}>{r.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black" style={{ fontFamily: "var(--font-mono)", color: "#0A0A0A" }}>
                          {fmtNum(r.n)}
                        </span>
                        <span className="text-[10px]" style={{ color: "rgba(0,0,0,0.35)", fontFamily: "var(--font-mono)" }}>
                          {pct(r.n, nvrTotal)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
          }
        </Panel>
      </div>

      {/* ── Content intelligence ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Category performance */}
        <Panel className="p-5">
          <SectionTitle icon={<BookOpen size={13} />}>Content by Category</SectionTitle>
          {data.categories.length === 0
            ? <p className="text-xs py-6 text-center" style={{ color: "rgba(0,0,0,0.25)" }}>
                No article traffic yet. Share your articles to start collecting data.
              </p>
            : <>
                <div className="space-y-2.5 mb-4">
                  {data.categories.map((c, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 shrink-0"
                            style={{ background: c.color || "#C5D400" }} />
                          <span className="text-xs font-semibold" style={{ color: "#0A0A0A" }}>
                            {c.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px]" style={{ color: "rgba(0,0,0,0.35)", fontFamily: "var(--font-mono)" }}>
                            {pct(c.n, catTotal)}%
                          </span>
                          <span className="text-xs font-black" style={{ fontFamily: "var(--font-mono)", color: "#0A0A0A" }}>
                            {fmtNum(c.n)}
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-gray-100">
                        <div className="h-full transition-all duration-700"
                          style={{ width: `${pct(c.n, catTotal)}%`, background: c.color || "#C5D400" }} />
                      </div>
                    </div>
                  ))}
                </div>
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={data.categories.slice(0, 6)} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                    <XAxis dataKey="category" tick={{ fontSize: 9, fill: "rgba(0,0,0,0.3)", fontFamily: "var(--font-mono)" }}
                      axisLine={false} tickLine={false}
                      tickFormatter={(v: string) => v.length > 8 ? v.slice(0, 8) + "…" : v} />
                    <Tooltip
                      contentStyle={{ background: "#0A0A0A", border: "none", fontSize: "11px",
                        fontFamily: "var(--font-mono)", color: "#fff" }}
                      formatter={(val: number) => [fmtNum(val), "Views"]} />
                    <Bar dataKey="n" radius={[2, 2, 0, 0]}>
                      {data.categories.slice(0, 6).map((c, i) => (
                        <Cell key={i} fill={c.color || "#C5D400"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </>
          }
        </Panel>

        {/* Trending articles */}
        <Panel className="p-5">
          <SectionTitle icon={<TrendingUp size={13} />}>Trending Content (24h)</SectionTitle>
          {data.trending.filter((t) => t.recent > 0).length === 0
            ? <div className="py-6 text-center">
                <p className="text-xs" style={{ color: "rgba(0,0,0,0.25)" }}>
                  No article traffic in the last 48 hours yet.
                </p>
              </div>
            : <div className="space-y-3">
                {data.trending.filter((t) => t.recent > 0).slice(0, 6).map((t, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-xs font-black pt-0.5 w-4 shrink-0"
                      style={{ color: "rgba(0,0,0,0.2)", fontFamily: "var(--font-mono)" }}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 justify-between">
                        <p className="text-xs font-semibold leading-tight line-clamp-2 flex-1"
                          style={{ color: "#0A0A0A" }}>
                          {t.title}
                        </p>
                        <GrowthBadge pct={Math.min(t.growth, 999)} />
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px]" style={{ color: "rgba(0,0,0,0.35)", fontFamily: "var(--font-mono)" }}>
                          {t.recent} views today
                        </span>
                        {t.previous > 0 && (
                          <span className="text-[10px]" style={{ color: "rgba(0,0,0,0.25)", fontFamily: "var(--font-mono)" }}>
                            vs {t.previous} yesterday
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
          }
        </Panel>
      </div>

      {/* ── Top pages + Sources ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel className="p-5">
          <SectionTitle icon={<BarChart2 size={13} />}>Top Pages</SectionTitle>
          <BarList
            rows={data.topPages.map((r) => ({ label: formatPath(r.path), n: r.n }))}
            total={pageTotal}
            accent="#C5D400"
          />
        </Panel>
        <Panel className="p-5">
          <SectionTitle icon={<ArrowRight size={13} />}>Traffic Sources</SectionTitle>
          <BarList
            rows={data.sources.map((r) => ({ label: r.label, n: r.n }))}
            total={sourceTotal}
            accent="#CC0000"
          />
        </Panel>
      </div>

      {/* ── Audience signals ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Devices */}
        <Panel className="p-5">
          <SectionTitle icon={<Monitor size={13} />}>Devices</SectionTitle>
          {deviceTotal === 0
            ? <p className="text-xs" style={{ color: "rgba(0,0,0,0.3)" }}>No data yet</p>
            : <div className="flex items-center gap-3 justify-around py-2">
                {data.devices.map((d) => (
                  <div key={d.label} className="flex flex-col items-center gap-2">
                    <div className="size-12 flex items-center justify-center rounded-full"
                      style={{ background: "rgba(197,212,0,0.1)" }}>
                      <span style={{ color: "#C5D400" }}>{DEVICE_ICONS[d.label] ?? <Monitor size={14} />}</span>
                    </div>
                    <p className="font-black text-xl leading-none" style={{ color: "#0A0A0A", fontFamily: "var(--font-display)" }}>
                      {pct(d.n, deviceTotal)}%
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-wide"
                      style={{ color: "rgba(0,0,0,0.35)", fontFamily: "var(--font-mono)" }}>
                      {d.label}
                    </p>
                    <p className="text-[10px]" style={{ color: "rgba(0,0,0,0.25)" }}>{fmtNum(d.n)}</p>
                  </div>
                ))}
              </div>
          }
          <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
            <BarList rows={data.browsers.map((r) => ({ label: r.label, n: r.n }))}
              total={data.browsers.reduce((s, r) => s + r.n, 0)} accent="#0A0A0A" title="Browsers" />
          </div>
        </Panel>

        {/* Peak hours */}
        <Panel className="p-5">
          <div className="flex items-start justify-between mb-3">
            <SectionTitle icon={<Clock size={13} />}>Peak Reading Hours</SectionTitle>
          </div>
          <HourlyHeatmap data={data.hourly} />
          {peakHour.n > 0 && (
            <div className="mt-4 p-3" style={{ background: "rgba(197,212,0,0.08)", border: "1px solid rgba(197,212,0,0.2)" }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1"
                style={{ color: "rgba(0,0,0,0.4)", fontFamily: "var(--font-mono)" }}>
                Peak Time
              </p>
              <p className="font-black text-lg" style={{ fontFamily: "var(--font-display)", color: "#0A0A0A" }}>
                {peakHourLabel}
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: "rgba(0,0,0,0.4)" }}>
                {peakHour.n} views at this hour
              </p>
            </div>
          )}
        </Panel>

        {/* Audience signals / demographics proxy */}
        <Panel className="p-5">
          <SectionTitle icon={<Users size={13} />}>Audience Signals</SectionTitle>
          <div className="space-y-3">
            {/* Mobile share */}
            <div className="p-3" style={{ background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.06)" }}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <Smartphone size={11} style={{ color: "#C5D400" }} />
                  <span className="text-[11px] font-bold" style={{ color: "#0A0A0A" }}>Mobile Audience</span>
                </div>
                <span className="text-sm font-black" style={{ fontFamily: "var(--font-display)", color: "#0A0A0A" }}>
                  {mobileShare}%
                </span>
              </div>
              <div className="h-1 bg-gray-100">
                <div className="h-full" style={{ width: `${mobileShare}%`, background: "#C5D400" }} />
              </div>
              <p className="text-[10px] mt-1.5" style={{ color: "rgba(0,0,0,0.4)" }}>
                {mobileShare > 60 ? "Mobile-first audience — optimize for small screens" :
                 mobileShare > 40 ? "Balanced mobile/desktop split" :
                 "Desktop-heavy audience"}
              </p>
            </div>

            {/* Social traffic */}
            <div className="p-3" style={{ background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.06)" }}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <TrendingUp size={11} style={{ color: "#CC0000" }} />
                  <span className="text-[11px] font-bold" style={{ color: "#0A0A0A" }}>Social Traffic</span>
                </div>
                <span className="text-sm font-black" style={{ fontFamily: "var(--font-display)", color: "#0A0A0A" }}>
                  {socialPct}%
                </span>
              </div>
              <div className="h-1 bg-gray-100">
                <div className="h-full" style={{ width: `${socialPct}%`, background: "#CC0000" }} />
              </div>
              <p className="text-[10px] mt-1.5" style={{ color: "rgba(0,0,0,0.4)" }}>
                {socialPct > 40 ? "Social-driven audience — strong platform engagement"
                 : socialPct > 15 ? "Moderate social referral traffic"
                 : "Mostly direct/search traffic — build social presence"}
              </p>
            </div>

            {/* Loyalty */}
            <div className="p-3" style={{ background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.06)" }}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <Repeat size={11} style={{ color: "#C5D400" }} />
                  <span className="text-[11px] font-bold" style={{ color: "#0A0A0A" }}>Return Rate</span>
                </div>
                <span className="text-sm font-black" style={{ fontFamily: "var(--font-display)", color: "#0A0A0A" }}>
                  {pct(data.newVsReturning[1]?.n ?? 0, nvrTotal)}%
                </span>
              </div>
              <div className="h-1 bg-gray-100">
                <div className="h-full" style={{ width: `${pct(data.newVsReturning[1]?.n ?? 0, nvrTotal)}%`, background: "#C5D400" }} />
              </div>
              <p className="text-[10px] mt-1.5" style={{ color: "rgba(0,0,0,0.4)" }}>
                {pct(data.newVsReturning[1]?.n ?? 0, nvrTotal) > 30
                  ? "Strong loyal readership returning to your platform"
                  : "Growing audience — focus on converting first-time visitors"}
              </p>
            </div>
          </div>
        </Panel>
      </div>

      {/* ── Demographics notice ──────────────────────────────────────────── */}
      <div className="p-5 flex flex-col sm:flex-row gap-4"
        style={{ border: "1px solid rgba(197,212,0,0.3)", background: "rgba(197,212,0,0.04)" }}>
        <div className="shrink-0">
          <div className="size-10 flex items-center justify-center"
            style={{ background: "#C5D400" }}>
            <Info size={16} style={{ color: "#0A0A0A" }} />
          </div>
        </div>
        <div className="flex-1">
          <p className="font-black text-sm mb-1" style={{ fontFamily: "var(--font-display)", color: "#0A0A0A" }}>
            Age & Gender Demographics
          </p>
          <p className="text-xs leading-relaxed mb-3" style={{ color: "rgba(0,0,0,0.5)" }}>
            Exact age and gender data (under 18, 18–24, 25–34, 35–44, 45+) cannot be collected from server logs —
            this is technically impossible without user accounts or third-party data.
            These demographics are available through <strong>Google Analytics 4 Audience Demographics</strong>,
            which uses Google's signed-in user data from across their entire ad network
            (the same source WordPress plugins use). Your GA4 property must be connected and have
            accumulated at least 1,000 users before demographic data appears.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://analytics.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest px-4 py-2"
              style={{ fontFamily: "var(--font-mono)", border: "1px solid #0A0A0A", color: "#0A0A0A" }}
            >
              <ExternalLink size={10} /> View GA4 Demographics
            </a>
            <Link
              to="/management-portal/dashboard/settings"
              className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest px-4 py-2"
              style={{ fontFamily: "var(--font-mono)", border: "1px solid rgba(0,0,0,0.2)", color: "rgba(0,0,0,0.5)" }}
            >
              Configure GA4 ID →
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
