import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — DailyNewsTap" },
      { name: "description", content: "DailyNewsTap is Nigeria's premier digital newsroom — independent, authoritative, and built for the modern reader." },
      { property: "og:title", content: "About DailyNewsTap" },
    ],
  }),
  component: AboutPage,
});

const TEAM = [
  { name: "Adebayo Yusuf", role: "Editor-in-Chief", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&h=600&q=80" },
  { name: "Chinwe Okafor", role: "Managing Editor, Business", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&h=600&q=80" },
  { name: "Tunde Bakare", role: "Head of Technology Desk", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&h=600&q=80" },
  { name: "Zainab Lawal", role: "Culture & Lifestyle Editor", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=600&h=600&q=80" },
];

const TIMELINE = [
  { year: "2026", title: "DailyNewsTap launches", text: "A digital-first newsroom founded in Lagos with a 28-person editorial team." },
  { year: "2026", title: "100,000 daily readers", text: "Reach milestone within first quarter of operation through audience-first reporting." },
  { year: "2026", title: "Investigative desk opens", text: "Dedicated team launched to deliver long-form investigative journalism." },
  { year: "2027", title: "Pan-African expansion", text: "Bureaux established in Accra, Nairobi and Johannesburg." },
];

function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-ink text-background py-20 md:py-28 border-b border-ink">
        <div className="max-w-[1400px] mx-auto px-6 grid md:grid-cols-12 gap-10 items-end">
          <div className="md:col-span-7">
            <p className="eyebrow text-brand mb-5">About DailyNewsTap</p>
            <h1 className="font-display text-5xl md:text-7xl font-black tracking-tighter leading-[0.95] mb-6">
              Journalism that earns your attention.
            </h1>
          </div>
          <div className="md:col-span-5">
            <p className="font-serif-body text-lg text-background/75 leading-relaxed">
              We're a Lagos-headquartered digital newsroom dedicated to producing
              accurate, unflinching reporting and writing that respects your time.
              No clickbait. No agendas. Just journalism.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-6 py-20 space-y-24">
        {/* Story */}
        <section className="grid md:grid-cols-12 gap-12">
          <div className="md:col-span-4">
            <p className="eyebrow text-brand mb-3">Our Story</p>
            <h2 className="font-display text-3xl md:text-4xl font-black leading-tight">A new standard for African media.</h2>
          </div>
          <div className="md:col-span-8 font-serif-body text-lg leading-relaxed text-ink space-y-5 max-w-[68ch]">
            <p>DailyNewsTap was founded on a simple proposition: that the Nigerian and African reader deserves journalism built to the same standards as the best newsrooms in the world — and presented in a digital experience that reflects the sophistication of its audience.</p>
            <p>From day one we have invested in reporters, fact-checkers, designers and engineers in equal measure. The result is a publication you can trust to be on the story — and a product you actually enjoy reading.</p>
          </div>
        </section>

        {/* Mission/Vision */}
        <section className="grid md:grid-cols-2 gap-8">
          <div className="border border-rule p-10">
            <p className="eyebrow text-brand mb-4">Mission</p>
            <h3 className="font-display text-2xl font-black mb-4">To inform, hold power to account, and elevate the public conversation.</h3>
            <p className="font-serif-body text-ink-muted leading-relaxed">We pursue truth with rigour and treat every reader as an intelligent adult.</p>
          </div>
          <div className="border border-rule p-10 bg-surface">
            <p className="eyebrow text-brand mb-4">Vision</p>
            <h3 className="font-display text-2xl font-black mb-4">A continent better served by the journalism it deserves.</h3>
            <p className="font-serif-body text-ink-muted leading-relaxed">We're building the news brand the next generation of Africans will grow up with.</p>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-y border-rule">
          {[
            { n: "2.4M", l: "Monthly Readers" },
            { n: "240k", l: "Newsletter Subscribers" },
            { n: "85+", l: "Journalists & Staff" },
            { n: "12", l: "Bureaux Worldwide" },
          ].map((s) => (
            <div key={s.l}>
              <p className="font-display text-5xl md:text-6xl font-black text-brand">{s.n}</p>
              <p className="eyebrow text-ink-muted mt-3">{s.l}</p>
            </div>
          ))}
        </section>

        {/* Team */}
        <section>
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="eyebrow text-brand mb-3">Leadership</p>
              <h2 className="font-display text-3xl md:text-4xl font-black">Meet the newsroom.</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {TEAM.map((m) => (
              <div key={m.name} className="group">
                <div className="aspect-square bg-surface overflow-hidden mb-4">
                  <img src={m.img} alt={m.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                </div>
                <h4 className="font-display text-lg font-bold">{m.name}</h4>
                <p className="eyebrow text-ink-muted mt-1">{m.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section>
          <p className="eyebrow text-brand mb-3">Milestones</p>
          <h2 className="font-display text-3xl md:text-4xl font-black mb-12">A short history.</h2>
          <div className="space-y-10 relative">
            <div className="absolute left-[60px] top-2 bottom-2 w-px bg-rule hidden md:block" />
            {TIMELINE.map((t) => (
              <div key={t.title} className="grid md:grid-cols-[120px_1fr] gap-6 items-start relative">
                <div className="font-display text-2xl font-black text-brand">{t.year}</div>
                <div className="md:pl-6">
                  <div className="absolute left-[57px] top-3 size-2 rounded-full bg-brand hidden md:block" />
                  <h4 className="font-display text-xl font-bold mb-2">{t.title}</h4>
                  <p className="font-serif-body text-ink-muted leading-relaxed">{t.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
