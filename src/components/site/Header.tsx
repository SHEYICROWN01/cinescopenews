import { Link } from "@tanstack/react-router";
import { Search, Menu, X, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { CATEGORIES } from "@/lib/news-data";

export function Header() {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <>
      {/* Top meta bar */}
      <div className="hidden md:block border-b border-rule bg-background">
        <div className="max-w-[1400px] mx-auto px-6 h-9 flex justify-between items-center eyebrow text-ink-muted">
          <div className="flex gap-6">
            <span>Lagos, Nigeria</span>
            <span>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-brand transition-colors">e-Paper</a>
            <a href="#" className="hover:text-brand transition-colors">Newsletters</a>
            <a href="#" className="hover:text-brand transition-colors">Advertise</a>
          </div>
        </div>
      </div>

      {/* Main header */}
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-rule">
        <div className="max-w-[1400px] mx-auto px-6 h-20 flex justify-between items-center gap-6">
          <div className="flex items-center gap-4 lg:gap-8 flex-1">
            <button
              onClick={() => setOpen(!open)}
              className="lg:hidden p-2 -ml-2 text-ink"
              aria-label="Toggle menu"
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
            <nav className="hidden lg:flex gap-7 text-[13px] font-semibold uppercase tracking-tight">
              {CATEGORIES.slice(0, 5).map((c) => (
                <Link
                  key={c.slug}
                  to="/category/$slug"
                  params={{ slug: c.slug }}
                  className="hover:text-brand transition-colors"
                  activeProps={{ className: "text-brand" }}
                >
                  {c.name}
                </Link>
              ))}
            </nav>
          </div>

          <Link to="/" className="shrink-0">
            <h1 className="font-display text-3xl md:text-4xl font-black tracking-tighter uppercase leading-none">
              DailyNews<span className="text-brand">Tap</span>
            </h1>
          </Link>

          <div className="flex items-center gap-2 md:gap-3 flex-1 justify-end">
            <button
              aria-label="Search"
              className="p-2 hover:text-brand transition-colors"
            >
              <Search size={18} />
            </button>
            <button
              aria-label="Toggle theme"
              onClick={() => setDark(!dark)}
              className="p-2 hover:text-brand transition-colors"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="hidden md:inline-flex bg-ink text-background px-5 py-2 text-xs font-bold uppercase tracking-tight hover:bg-brand transition-colors">
              Subscribe
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {open && (
          <nav className="lg:hidden border-t border-rule bg-background px-6 py-4 flex flex-col gap-1">
            {CATEGORIES.map((c) => (
              <Link
                key={c.slug}
                to="/category/$slug"
                params={{ slug: c.slug }}
                onClick={() => setOpen(false)}
                className="py-3 text-sm font-semibold uppercase tracking-tight border-b border-rule last:border-0 hover:text-brand"
              >
                {c.name}
              </Link>
            ))}
            <Link to="/about" onClick={() => setOpen(false)} className="py-3 text-sm font-semibold uppercase tracking-tight border-b border-rule">About</Link>
            <Link to="/contact" onClick={() => setOpen(false)} className="py-3 text-sm font-semibold uppercase tracking-tight">Contact</Link>
          </nav>
        )}
      </header>
    </>
  );
}
