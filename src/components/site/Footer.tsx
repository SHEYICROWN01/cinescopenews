/* Cinescope Global Concept — dark editorial footer with brand identity */
import { Link } from "@tanstack/react-router";
import { Facebook, Twitter, Instagram, Youtube, Linkedin } from "lucide-react";

type NavCategory = { id: number; name: string; slug: string };

export function Footer({ categories = [] }: { categories?: NavCategory[] }) {
  const col1 = categories.slice(0, Math.ceil(categories.length / 2));
  const col2 = categories.slice(Math.ceil(categories.length / 2));

  return (
    <footer className="mt-24">
      {/* Lime brand stripe — Cinescope identity */}
      <div className="h-1.5 bg-brand w-full" />

      <div className="bg-[#0A0A0A] text-white">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-10 pt-16 pb-10">
          <div className="grid grid-cols-2 md:grid-cols-12 gap-6 md:gap-10 pb-12 md:pb-16 border-b border-white/10">

            {/* Brand column */}
            <div className="col-span-2 md:col-span-4">
              <Link to="/">
                <div className="leading-none select-none mb-1">
                  <span
                    className="font-display font-black tracking-tight block"
                    style={{ fontSize: "1.9rem", letterSpacing: "-0.02em" }}
                  >
                    Cinescope
                    <span style={{ color: "var(--accent-red)" }}> Global</span>
                  </span>
                  <span
                    className="font-mono text-[0.5rem] font-bold uppercase tracking-[0.35em] block mt-0.5"
                    style={{ color: "rgba(255,255,255,0.35)" }}
                  >
                    Concept
                  </span>
                </div>
              </Link>
              <p className="edition-mark mt-3 mb-6" style={{ color: "rgba(255,255,255,0.30)" }}>
                Bold. Global. Investigative.
              </p>
              <p className="text-sm leading-relaxed max-w-[32ch] mb-8" style={{ color: "rgba(255,255,255,0.50)" }}>
                Authoritative journalism for the globally-aware reader.
                Accurate, unflinching, and always on. Established 2026.
              </p>
              <div className="flex gap-2.5">
                {[Twitter, Facebook, Instagram, Youtube, Linkedin].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="size-9 grid place-items-center border transition-all duration-200 hover:-translate-y-0.5"
                    style={{
                      borderColor: "rgba(255,255,255,0.15)",
                      color: "rgba(255,255,255,0.55)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = "var(--lime)";
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--lime)";
                      (e.currentTarget as HTMLElement).style.color = "var(--lime-foreground)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = "";
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.15)";
                      (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.55)";
                    }}
                    aria-label="Social"
                  >
                    <Icon size={14} />
                  </a>
                ))}
              </div>
            </div>

            {/* Sections */}
            <div className="md:col-span-2">
              <h5 className="eyebrow mb-5" style={{ color: "var(--lime)" }}>Sections</h5>
              <ul className="space-y-3 text-sm">
                {col1.map((c) => (
                  <li key={c.slug}>
                    <Link
                      to="/category/$slug"
                      params={{ slug: c.slug }}
                      className="transition-colors hover:text-white"
                      style={{ color: "rgba(255,255,255,0.60)" }}
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* More categories */}
            <div className="md:col-span-2">
              <h5 className="eyebrow mb-5" style={{ color: "var(--lime)" }}>More</h5>
              <ul className="space-y-3 text-sm">
                {col2.map((c) => (
                  <li key={c.slug}>
                    <Link
                      to="/category/$slug"
                      params={{ slug: c.slug }}
                      className="transition-colors hover:text-white"
                      style={{ color: "rgba(255,255,255,0.60)" }}
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div className="md:col-span-2">
              <h5 className="eyebrow mb-5" style={{ color: "var(--lime)" }}>Company</h5>
              <ul className="space-y-3 text-sm">
                <li><Link to="/about" className="transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.60)" }}>About Us</Link></li>
                <li><Link to="/contact" className="transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.60)" }}>Contact</Link></li>
                <li><a href="#" className="transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.60)" }}>Careers</a></li>
                <li><a href="#" className="transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.60)" }}>Advertise</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div className="md:col-span-2">
              <h5 className="eyebrow mb-5" style={{ color: "var(--lime)" }}>Legal</h5>
              <ul className="space-y-3 text-sm">
                <li><Link to="/privacy" className="transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.60)" }}>Privacy Policy</Link></li>
                <li><Link to="/privacy" className="transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.60)" }}>Terms of Use</Link></li>
                <li><Link to="/privacy" className="transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.60)" }}>Cookie Policy</Link></li>
                <li><Link to="/privacy" className="transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.60)" }}>Editorial Ethics</Link></li>
                <li>
                  <a href="/feed.xml" className="transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.60)" }}>
                    RSS Feed
                  </a>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom bar */}
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 gap-3 eyebrow" style={{ color: "rgba(255,255,255,0.28)" }}>
            <p>© {new Date().getFullYear()} Cinescope Global Concept Media. All rights reserved.</p>
            <p>Bold. Global. Investigative. — Since 2026.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
