/* Cinescope Global Concept — sidebar newsletter widget */
export function NewsletterCard({ variant = "light" }: { variant?: "light" | "dark" }) {
  const dark = variant === "dark";

  return (
    <div
      className={`p-5 sm:p-8 border-l-4 ${
        dark
          ? "bg-[#0A0A0A] text-white border-lime"
          : "bg-surface text-ink border-brand"
      }`}
    >
      <div className="mb-4">
        <div
          className="inline-block eyebrow px-2 py-1 mb-3 text-[10px] tracking-widest"
          style={{
            backgroundColor: "var(--lime)",
            color: "var(--lime-foreground)",
          }}
        >
          Daily Briefing
        </div>
      </div>
      <h4 className="font-display text-xl font-black mb-3 leading-tight">
        The Cinescope<br />
        <span style={{ color: "var(--accent-red)" }}>Global Briefing</span>
      </h4>
      <p className={`text-sm leading-relaxed mb-6 ${dark ? "text-white/70" : "text-ink-muted"}`}>
        Sharp global intelligence curated by our editors —
        delivered to your inbox every morning, six days a week.
      </p>
      <form className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
        <input
          type="email"
          required
          placeholder="Your email address"
          className={`px-4 py-3 text-sm outline-none transition-colors border ${
            dark
              ? "bg-white/8 border-white/20 text-white placeholder:text-white/40 focus:border-lime"
              : "bg-background border-rule focus:border-brand"
          }`}
        />
        <button
          type="submit"
          className="text-brand-foreground text-xs font-bold uppercase tracking-widest py-3 hover:opacity-90 transition-opacity"
          style={{ backgroundColor: "var(--lime)", color: "var(--lime-foreground)" }}
        >
          Subscribe Free →
        </button>
      </form>
    </div>
  );
}
