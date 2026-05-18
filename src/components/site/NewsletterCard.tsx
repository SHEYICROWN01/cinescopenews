export function NewsletterCard({ variant = "light" }: { variant?: "light" | "dark" }) {
  const dark = variant === "dark";
  return (
    <div
      className={`p-7 ${
        dark ? "bg-ink text-background" : "bg-surface text-ink border border-rule"
      }`}
    >
      <h4 className="font-display text-2xl font-black mb-3">The Morning Tap</h4>
      <p className={`text-xs leading-relaxed mb-5 ${dark ? "text-background/65" : "text-ink-muted"}`}>
        The intelligence you need to start your day. Curated by our editors,
        delivered to your inbox at 6:00 AM daily.
      </p>
      <form className="flex flex-col gap-2" onSubmit={(e) => e.preventDefault()}>
        <input
          type="email"
          required
          placeholder="Your email address"
          className={`px-4 py-2.5 text-sm outline-none transition-shadow ${
            dark
              ? "bg-background/10 border border-background/15 text-background placeholder:text-background/40 focus:border-background/40"
              : "bg-background border border-rule focus:border-brand"
          }`}
        />
        <button
          type="submit"
          className="bg-brand text-brand-foreground text-xs font-bold uppercase tracking-widest py-3 hover:opacity-90 transition-opacity"
        >
          Subscribe Now
        </button>
      </form>
    </div>
  );
}
