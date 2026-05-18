import { Link } from "@tanstack/react-router";
import { Facebook, Twitter, Instagram, Youtube, Linkedin } from "lucide-react";
import { CATEGORIES } from "@/lib/news-data";

export function Footer() {
  return (
    <footer className="bg-ink text-background mt-24">
      <div className="max-w-[1400px] mx-auto px-6 pt-20 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-16 border-b border-white/10">
          <div className="md:col-span-4">
            <Link to="/">
              <h2 className="font-display text-3xl font-black uppercase tracking-tighter mb-5">
                DailyNews<span className="text-brand">Tap</span>
              </h2>
            </Link>
            <p className="text-sm text-background/60 leading-relaxed max-w-[34ch] mb-8">
              Premium editorial journalism for the modern Nigerian reader.
              Accurate, authoritative, and always on. Established 2026.
            </p>
            <div className="flex gap-3">
              {[Twitter, Facebook, Instagram, Youtube, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="size-9 grid place-items-center border border-white/15 hover:bg-brand hover:border-brand transition-all"
                  aria-label="Social"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <h5 className="eyebrow text-brand mb-5">Sections</h5>
            <ul className="space-y-3 text-sm">
              {CATEGORIES.slice(0, 5).map((c) => (
                <li key={c.slug}>
                  <Link
                    to="/category/$slug"
                    params={{ slug: c.slug }}
                    className="text-background/75 hover:text-background"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <h5 className="eyebrow text-brand mb-5">More</h5>
            <ul className="space-y-3 text-sm">
              {CATEGORIES.slice(5).map((c) => (
                <li key={c.slug}>
                  <Link
                    to="/category/$slug"
                    params={{ slug: c.slug }}
                    className="text-background/75 hover:text-background"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <h5 className="eyebrow text-brand mb-5">Company</h5>
            <ul className="space-y-3 text-sm">
              <li><Link to="/about" className="text-background/75 hover:text-background">About Us</Link></li>
              <li><Link to="/contact" className="text-background/75 hover:text-background">Contact</Link></li>
              <li><a href="#" className="text-background/75 hover:text-background">Careers</a></li>
              <li><a href="#" className="text-background/75 hover:text-background">Advertise</a></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h5 className="eyebrow text-brand mb-5">Legal</h5>
            <ul className="space-y-3 text-sm">
              <li><Link to="/privacy" className="text-background/75 hover:text-background">Privacy</Link></li>
              <li><Link to="/privacy" className="text-background/75 hover:text-background">Terms</Link></li>
              <li><Link to="/privacy" className="text-background/75 hover:text-background">Cookies</Link></li>
              <li><Link to="/privacy" className="text-background/75 hover:text-background">Ethics</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 gap-4 eyebrow text-background/40">
          <p>© 2026 DailyNewsTap Media Group. All rights reserved.</p>
          <p>Built with editorial integrity in Lagos.</p>
        </div>
      </div>
    </footer>
  );
}
