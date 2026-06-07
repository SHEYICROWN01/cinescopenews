/* Cinescope Global Concept — About page */
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Cinescope Global Concept" },
      { name: "description", content: "Cinescope Global Concept is a bold, investigative digital newsroom delivering globally-aware journalism to the modern reader." },
      { property: "og:title", content: "About Cinescope Global Concept" },
    ],
  }),
  component: AboutPage,
});


const TIMELINE = [
  { year: "2026", title: "Cinescope Global Concept launches", text: "A digital-first investigative newsroom founded with a 28-person editorial team committed to bold journalism." },
  { year: "2026", title: "100,000 daily readers", text: "Reached the milestone within the first quarter through global audience-first reporting." },
  { year: "2026", title: "Investigative desk opens", text: "Dedicated team launched to deliver long-form investigative journalism with global reach." },
  { year: "2027", title: "Pan-African & Global expansion", text: "Bureaux established in Accra, Nairobi, Johannesburg and London." },
];

function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section
        className="relative text-white py-20 md:py-32 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 60%, #0A0A0A 100%)" }}
      >
        {/* Lime accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: "var(--lime)" }} />
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />

        <div className="relative max-w-[1400px] mx-auto px-6 grid md:grid-cols-12 gap-12 items-end">
          <div className="md:col-span-7">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6" style={{ backgroundColor: "color-mix(in oklab, var(--lime) 20%, transparent)", border: "1px solid color-mix(in oklab, var(--lime) 40%, transparent)" }}>
              <span className="text-2xl">📡</span>
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--lime)" }}>About Cinescope Global Concept</p>
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-black tracking-tight leading-[0.95] mb-6">
              Journalism that earns<br />your attention.
            </h1>
          </div>
          <div className="md:col-span-5">
            <p className="font-serif-body text-xl leading-relaxed" style={{ color: "rgba(255,255,255,0.80)" }}>
              We're a globally-minded digital newsroom dedicated to producing
              accurate, unflinching investigative reporting that respects your intelligence.
              No clickbait. No agendas. Just bold journalism.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-6 py-20 space-y-24">
        {/* Story */}
        <section className="grid md:grid-cols-12 gap-12">
          <div className="md:col-span-4">
            <p className="eyebrow mb-3" style={{ color: "var(--accent-red)" }}>Our Story</p>
            <h2 className="font-display text-3xl md:text-4xl font-black leading-tight">A new standard for global media.</h2>
          </div>
          <div className="md:col-span-8 font-serif-body text-lg leading-relaxed text-ink space-y-5 max-w-[68ch]">
            <p>Cinescope Global Concept was founded on a simple proposition: that the modern globally-aware reader deserves journalism built to the same standards as the world's finest newsrooms — and presented in a digital experience that reflects the sophistication of its audience.</p>
            <p>From day one we have invested equally in reporters, fact-checkers, designers and engineers. The result is a publication you can trust to be on the story — and a product you actually want to read.</p>
          </div>
        </section>

        {/* Mission/Vision */}
        <section className="grid md:grid-cols-2 gap-8">
          <div className="p-10 hover:shadow-xl hover:scale-[1.02] transition-all duration-300" style={{ border: "2px solid color-mix(in oklab, var(--lime) 40%, transparent)" }}>
            <div className="text-4xl mb-5">🎯</div>
            <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: "var(--accent-red)" }}>Mission</p>
            <h3 className="font-display text-2xl font-black mb-4">To inform, hold power to account, and elevate the global conversation.</h3>
            <p className="font-serif-body text-ink-muted leading-relaxed">We pursue truth with rigour and treat every reader as an intelligent adult.</p>
          </div>
          <div className="p-10 hover:shadow-xl hover:scale-[1.02] transition-all duration-300" style={{ border: "2px solid color-mix(in oklab, var(--lime) 40%, transparent)", background: "color-mix(in oklab, var(--lime) 5%, var(--background))" }}>
            <div className="text-4xl mb-5">🌍</div>
            <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: "var(--accent-red)" }}>Vision</p>
            <h3 className="font-display text-2xl font-black mb-4">A world better served by the journalism it deserves.</h3>
            <p className="font-serif-body text-ink-muted leading-relaxed">We're building the investigative news brand the next generation of global citizens will grow up with.</p>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6 py-12">
          {[
            { n: "2.4M", l: "Monthly Readers", icon: "👥" },
            { n: "240k", l: "Newsletter Subscribers", icon: "✉️" },
            { n: "85+", l: "Journalists & Staff", icon: "✍️" },
            { n: "12", l: "Bureaux Worldwide", icon: "🌐" },
          ].map((s) => (
            <div key={s.l} className="bg-surface p-8 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="text-3xl mb-3">{s.icon}</div>
              <p className="font-display text-5xl md:text-6xl font-black" style={{ color: "var(--accent-red)" }}>{s.n}</p>
              <p className="text-xs font-bold uppercase tracking-wider text-ink-muted mt-3">{s.l}</p>
            </div>
          ))}
        </section>

        {/* Timeline */}
        <section>
          <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--accent-red)" }}>Milestones 🏆</p>
          <h2 className="font-display text-3xl md:text-4xl font-black mb-12">A short history.</h2>
          <div className="space-y-8 relative">
            <div
              className="absolute left-[60px] top-2 bottom-2 w-0.5 hidden md:block"
              style={{ background: "linear-gradient(to bottom, var(--lime), color-mix(in oklab, var(--lime) 30%, transparent))" }}
            />
            {TIMELINE.map((t) => (
              <div key={t.title} className="grid md:grid-cols-[120px_1fr] gap-6 items-start relative group">
                <div className="font-display text-2xl font-black" style={{ color: "var(--accent-red)" }}>{t.year}</div>
                <div className="md:pl-6">
                  <div
                    className="absolute left-[57px] top-3 size-3 rounded-full hidden md:block group-hover:scale-150 transition-transform duration-300"
                    style={{ backgroundColor: "var(--lime)", boxShadow: "0 0 8px color-mix(in oklab, var(--lime) 60%, transparent)" }}
                  />
                  <div className="bg-surface p-6 hover:shadow-lg transition-all duration-300">
                    <h4 className="font-display text-xl font-bold mb-2">{t.title}</h4>
                    <p className="font-serif-body text-ink-muted leading-relaxed">{t.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
