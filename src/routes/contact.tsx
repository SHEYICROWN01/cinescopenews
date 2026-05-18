import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone, MapPin, Twitter, Facebook, Instagram, Linkedin, Plus } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — DailyNewsTap" },
      { name: "description", content: "Get in touch with DailyNewsTap — pitch a story, advertise, or send a confidential news tip." },
    ],
  }),
  component: ContactPage,
});

const FAQS = [
  { q: "How do I send a confidential news tip?", a: "We accept tips via encrypted email at tips@dailynewstap.com or through our SecureDrop instance. We protect our sources." },
  { q: "Do you accept guest opinion pieces?", a: "Yes — submissions to our Opinion section can be sent to opinion@dailynewstap.com with a brief author bio." },
  { q: "How can I advertise with DailyNewsTap?", a: "Our media kit is available on request. Contact advertise@dailynewstap.com to receive rate cards and audience data." },
  { q: "Where are your offices located?", a: "Our headquarters are in Victoria Island, Lagos, with bureaux in Abuja and Port Harcourt." },
];

function ContactPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <>
      <section className="bg-ink text-background py-20 border-b border-ink">
        <div className="max-w-[1400px] mx-auto px-6">
          <p className="eyebrow text-brand mb-4">Get in Touch</p>
          <h1 className="font-display text-5xl md:text-7xl font-black tracking-tighter leading-[0.95]">
            We're listening.
          </h1>
          <p className="font-serif-body text-lg text-background/75 mt-6 max-w-2xl">
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
            <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); alert("Thank you — message received."); }}>
              <div className="grid md:grid-cols-2 gap-5">
                <Field label="Full name" type="text" required />
                <Field label="Email" type="email" required />
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                <Field label="Phone (optional)" type="tel" />
                <div>
                  <label className="eyebrow block mb-2">Inquiry type</label>
                  <select className="w-full bg-background border border-rule px-4 py-3 text-sm outline-none focus:border-brand transition-colors">
                    <option>News tip</option>
                    <option>Advertising</option>
                    <option>Editorial submission</option>
                    <option>General feedback</option>
                  </select>
                </div>
              </div>
              <Field label="Subject" type="text" required />
              <div>
                <label className="eyebrow block mb-2">Message</label>
                <textarea
                  rows={6}
                  required
                  className="w-full bg-background border border-rule px-4 py-3 text-sm outline-none focus:border-brand transition-colors font-serif-body"
                  placeholder="Tell us what's on your mind…"
                />
              </div>
              <button type="submit" className="bg-ink text-background px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-brand transition-colors">
                Send Message
              </button>
            </form>
          </div>

          {/* Contact info */}
          <aside className="col-span-12 lg:col-span-5 space-y-6">
            <div className="border border-rule p-7">
              <div className="size-10 bg-brand/10 text-brand grid place-items-center mb-4">
                <MapPin size={18} />
              </div>
              <h4 className="font-display text-lg font-bold mb-2">Lagos Headquarters</h4>
              <p className="text-sm text-ink-muted font-serif-body leading-relaxed">
                14 Adetokunbo Ademola Street<br />
                Victoria Island, Lagos 101241<br />
                Nigeria
              </p>
            </div>
            <div className="border border-rule p-7">
              <div className="size-10 bg-brand/10 text-brand grid place-items-center mb-4">
                <Mail size={18} />
              </div>
              <h4 className="font-display text-lg font-bold mb-2">Email</h4>
              <p className="text-sm text-ink-muted font-serif-body leading-relaxed">
                Newsroom: news@dailynewstap.com<br />
                Tips: tips@dailynewstap.com<br />
                Advertising: advertise@dailynewstap.com
              </p>
            </div>
            <div className="border border-rule p-7">
              <div className="size-10 bg-brand/10 text-brand grid place-items-center mb-4">
                <Phone size={18} />
              </div>
              <h4 className="font-display text-lg font-bold mb-2">Phone</h4>
              <p className="text-sm text-ink-muted font-serif-body leading-relaxed">
                +234 (1) 280 4500<br />
                Mon–Fri, 8:00 — 18:00 WAT
              </p>
            </div>
            <div className="border border-rule p-7">
              <h4 className="font-display text-lg font-bold mb-4">Follow our newsroom</h4>
              <div className="flex gap-3">
                {[Twitter, Facebook, Instagram, Linkedin].map((Icon, i) => (
                  <a key={i} href="#" className="size-10 grid place-items-center border border-rule hover:bg-ink hover:text-background hover:border-ink transition-all">
                    <Icon size={15} />
                  </a>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {/* Map */}
        <section className="mt-20">
          <h2 className="font-display text-3xl font-black mb-6">Find us</h2>
          <div className="aspect-[21/9] bg-surface overflow-hidden border border-rule">
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
          <p className="eyebrow text-brand mb-3">FAQs</p>
          <h2 className="font-display text-3xl md:text-4xl font-black mb-10">Frequently asked</h2>
          <div className="space-y-3">
            {FAQS.map((f, i) => (
              <div key={i} className="border border-rule">
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full text-left p-5 flex justify-between items-center gap-4 hover:bg-surface transition-colors"
                >
                  <span className="font-display text-lg font-bold">{f.q}</span>
                  <Plus size={18} className={`shrink-0 transition-transform ${open === i ? "rotate-45" : ""}`} />
                </button>
                {open === i && (
                  <div className="px-5 pb-5 font-serif-body text-ink-muted leading-relaxed">
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
      <label className="eyebrow block mb-2">{label}</label>
      <input
        type={type}
        required={required}
        className="w-full bg-background border border-rule px-4 py-3 text-sm outline-none focus:border-brand transition-colors"
      />
    </div>
  );
}
