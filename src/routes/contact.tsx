/* Cinescope Global Concept — Contact page */
import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone, MapPin, Twitter, Facebook, Instagram, Linkedin, Plus } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — Cinescope Global Concept" },
      { name: "description", content: "Get in touch with Cinescope Global Concept — pitch a story, advertise, or send a confidential news tip." },
    ],
  }),
  component: ContactPage,
});

const FAQS = [
  { q: "How do I send a confidential news tip?", a: "We accept tips via encrypted email at tips@cinescopenews.com.ng or through our SecureDrop instance. We protect our sources." },
  { q: "Do you accept guest opinion pieces?", a: "Yes — submissions to our Opinion section can be sent to opinion@cinescopenews.com.ng with a brief author bio." },
  { q: "How can I advertise with Cinescope Global Concept?", a: "Our media kit is available on request. Contact advertise@cinescopenews.com.ng to receive rate cards and audience data." },
  { q: "Where are your offices located?", a: "Our headquarters are in Victoria Island, Lagos, with bureaux in Abuja, Port Harcourt, and London." },
];

function ContactPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <>
      <section
        className="relative text-white py-20 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 60%, #0A0A0A 100%)" }}
      >
        {/* Lime accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: "var(--lime)" }} />
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />

        <div className="relative max-w-[1400px] mx-auto px-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6" style={{ backgroundColor: "color-mix(in oklab, var(--lime) 20%, transparent)", border: "1px solid color-mix(in oklab, var(--lime) 40%, transparent)" }}>
            <span className="text-2xl">✉️</span>
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--lime)" }}>Get in Touch</p>
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-black tracking-tight leading-[0.95]">
            We're listening.
          </h1>
          <p className="font-serif-body text-xl mt-6 max-w-2xl" style={{ color: "rgba(255,255,255,0.80)" }}>
            Story tip? Advertising inquiry? Feedback? We read every message that comes in.
          </p>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-6 py-20">
        <div className="grid grid-cols-12 gap-10 lg:gap-16">
          {/* Form */}
          <div className="col-span-12 lg:col-span-7">
            <h2 className="font-display text-3xl font-black mb-2">Send us a message</h2>
            <p className="text-ink-muted mb-8">We aim to respond within one business day.</p>
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert("Thank you — message received."); }}>
              <div className="grid md:grid-cols-2 gap-6">
                <Field label="Full name" type="text" required />
                <Field label="Email" type="email" required />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <Field label="Phone (optional)" type="tel" />
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider block mb-2" style={{ color: "var(--accent-red)" }}>Inquiry type</label>
                  <select className="w-full bg-background border-2 border-rule px-4 py-3 text-sm outline-none transition-all" style={{ "--tw-ring-color": "var(--lime)" } as React.CSSProperties} onFocus={(e) => { (e.target as HTMLElement).style.borderColor = "var(--lime)"; }} onBlur={(e) => { (e.target as HTMLElement).style.borderColor = ""; }}>
                    <option>News tip</option>
                    <option>Advertising</option>
                    <option>Editorial submission</option>
                    <option>General feedback</option>
                  </select>
                </div>
              </div>
              <Field label="Subject" type="text" required />
              <div>
                <label className="text-xs font-bold uppercase tracking-wider block mb-2" style={{ color: "var(--accent-red)" }}>Message</label>
                <textarea
                  rows={6}
                  required
                  className="w-full bg-background border-2 border-rule px-4 py-3 text-sm outline-none font-serif-body resize-none transition-colors"
                  placeholder="Tell us what's on your mind…"
                  onFocus={(e) => { (e.target as HTMLElement).style.borderColor = "var(--lime)"; }}
                  onBlur={(e) => { (e.target as HTMLElement).style.borderColor = ""; }}
                />
              </div>
              <button
                type="submit"
                className="px-10 py-4 text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all duration-300"
                style={{ backgroundColor: "var(--lime)", color: "var(--lime-foreground)" }}
              >
                Send Message →
              </button>
            </form>
          </div>

          {/* Contact info */}
          <aside className="col-span-12 lg:col-span-5 space-y-6">
            {[
              {
                Icon: MapPin,
                title: "Headquarters",
                body: <>14 Adetokunbo Ademola Street<br />Victoria Island, Lagos 101241<br />Nigeria</>,
              },
              {
                Icon: Mail,
                title: "Email",
                body: <>Newsroom: news@cinescopenews.com.ng<br />Tips: tips@cinescopenews.com.ng<br />Advertising: advertise@cinescopenews.com.ng</>,
              },
              {
                Icon: Phone,
                title: "Phone",
                body: <>+234 (1) 280 4500<br />Mon–Fri, 8:00 — 18:00 WAT</>,
              },
            ].map(({ Icon, title, body }) => (
              <div
                key={title}
                className="p-7 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                style={{ border: "2px solid color-mix(in oklab, var(--lime) 35%, transparent)" }}
              >
                <div
                  className="size-12 grid place-items-center mb-4"
                  style={{ backgroundColor: "var(--lime)", color: "var(--lime-foreground)" }}
                >
                  <Icon size={20} />
                </div>
                <h4 className="font-display text-lg font-bold mb-2">{title}</h4>
                <p className="text-sm text-ink-muted font-serif-body leading-relaxed">{body}</p>
              </div>
            ))}
            <div
              className="p-7 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              style={{ border: "2px solid color-mix(in oklab, var(--lime) 35%, transparent)", background: "color-mix(in oklab, var(--lime) 5%, var(--background))" }}
            >
              <h4 className="font-display text-lg font-bold mb-4">Follow our newsroom</h4>
              <div className="flex gap-3">
                {[Twitter, Facebook, Instagram, Linkedin].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="size-12 grid place-items-center border-2 border-rule hover:scale-110 transition-all"
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--lime)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--lime)"; (e.currentTarget as HTMLElement).style.color = "var(--lime-foreground)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = ""; (e.currentTarget as HTMLElement).style.borderColor = ""; (e.currentTarget as HTMLElement).style.color = ""; }}
                  >
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {/* Map */}
        <section className="mt-20">
          <h2 className="font-display text-3xl font-black mb-6">Find us 📍</h2>
          <div className="aspect-[21/9] bg-surface overflow-hidden border-2 border-rule shadow-lg">
            <iframe
              title="Office location"
              src="https://www.openstreetmap.org/export/embed.html?bbox=3.41%2C6.42%2C3.45%2C6.45&layer=mapnik"
              className="w-full h-full"
              loading="lazy"
            />
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-20 max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--accent-red)" }}>FAQs ❓</p>
          <h2 className="font-display text-3xl md:text-4xl font-black mb-10">Frequently asked</h2>
          <div className="space-y-4">
            {FAQS.map((f, i) => (
              <div
                key={i}
                className="border-2 border-rule overflow-hidden transition-all duration-300"
                style={open === i ? { borderColor: "color-mix(in oklab, var(--lime) 60%, transparent)" } : {}}
              >
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full text-left p-6 flex justify-between items-center gap-4 hover:bg-surface/50 transition-colors"
                >
                  <span className="font-display text-lg font-bold">{f.q}</span>
                  <div
                    className={`shrink-0 size-8 grid place-items-center transition-transform ${open === i ? "rotate-45" : ""}`}
                    style={open === i ? { backgroundColor: "var(--lime)", color: "var(--lime-foreground)" } : { backgroundColor: "color-mix(in oklab, var(--lime) 15%, transparent)" }}
                  >
                    <Plus size={18} />
                  </div>
                </button>
                {open === i && (
                  <div className="px-6 pb-6 font-serif-body text-ink-muted leading-relaxed">
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

function Field({ label, type, required }: { label: string; type: string; required?: boolean }) {
  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-wider block mb-2" style={{ color: "var(--accent-red)" }}>{label}</label>
      <input
        type={type}
        required={required}
        className="w-full bg-background border-2 border-rule px-4 py-3 text-sm outline-none transition-colors"
        onFocus={(e) => { (e.target as HTMLElement).style.borderColor = "var(--lime)"; }}
        onBlur={(e) => { (e.target as HTMLElement).style.borderColor = ""; }}
      />
    </div>
  );
}
