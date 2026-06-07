/* Cinescope Global Concept — editorial top bar with logo, pill-category nav, search */
import { Link, useNavigate } from "@tanstack/react-router";
import { Search, Menu, X, Moon, Sun, Twitter, Facebook, Instagram } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type NavCategory = { id: number; name: string; slug: string };

export function Header({ categories = [] }: { categories?: NavCategory[] }) {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    try { localStorage.setItem("theme", dark ? "dark" : "light"); } catch (e) {}
  }, [dark]);

  useEffect(() => {
    const handler = () => {
      const y = window.scrollY;
      setScrolled((prev) => {
        if (!prev && y > 110) return true;   // collapse masthead after scrolling 110px down
        if (prev && y < 40) return false;    // restore masthead only when near the top
        return prev;                          // hold current state in between — no flicker
      });
    };
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setSearchOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [searchOpen]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setSearchOpen(false);
    setSearchQuery("");
    navigate({ to: "/search", search: { q } });
  }

  const [moreOpen, setMoreOpen] = useState(false);
  const navCats = categories.slice(0, 5);
  const moreCats = categories.slice(5);

  return (
    <>
      {/* Utility bar */}
      <div className="hidden md:flex border-b border-rule bg-background">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 h-9 flex justify-between items-center w-full eyebrow text-ink-muted">
          <div className="flex gap-6 items-center">
            <span className="flex items-center gap-1.5">
              <span className="inline-block size-1.5 rounded-full bg-brand" />
              Global Coverage
            </span>
            <span>
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="flex gap-5">
            <a href="/feed.xml" className="hover:text-ink transition-colors flex items-center gap-1">
              RSS Feed
            </a>
            <a href="#" className="hover:text-ink transition-colors">Newsletters</a>
            <a href="#" className="hover:text-ink transition-colors">Advertise</a>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-50 bg-background/97 backdrop-blur-md">
        {/* 4px lime brand stripe — Cinescope identity anchor */}
        <div className="h-[4px] bg-brand w-full" />

        {/* Masthead row — collapses on scroll */}
        <div
          className={`overflow-hidden border-b border-rule transition-[max-height,opacity,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            scrolled ? "max-h-0 opacity-0 border-transparent" : "max-h-[120px] opacity-100"
          }`}
        >
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-2 sm:py-3 flex items-center justify-between relative">
            {/* Left: social icons */}
            <div className="hidden lg:flex items-center gap-3 flex-1">
              {([Twitter, Facebook, Instagram] as const).map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Social"
                  className="size-8 border border-rule flex items-center justify-center text-ink-muted hover:bg-brand hover:text-brand-foreground hover:border-brand transition-all duration-200"
                >
                  <Icon size={12} strokeWidth={1.75} />
                </a>
              ))}
            </div>

            {/* Center: logo — strictly contained, no overflow */}
            <Link to="/" className="flex-shrink-0 flex flex-col items-center gap-1">
              <CinescopeLogo size="lg" />
            </Link>

            {/* Right: dark mode + subscribe */}
            <div className="hidden lg:flex items-center gap-3 flex-1 justify-end">
              <button
                aria-label="Toggle theme"
                onClick={() => setDark(!dark)}
                className="p-2 text-ink-muted hover:text-ink transition-colors"
              >
                {dark ? <Sun size={15} /> : <Moon size={15} />}
              </button>
              <div className="h-4 w-px bg-rule" />
              <button className="bg-brand text-brand-foreground px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:opacity-90 active:scale-[0.97] transition-all duration-150">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Nav bar — always visible */}
        <div
          className={`border-b border-rule transition-shadow duration-300 ${
            scrolled ? "shadow-[0_1px_20px_-4px_rgb(17_24_39_/_0.12)]" : ""
          }`}
        >
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 h-12 flex items-center justify-between gap-4">
            {/* Mobile: hamburger + logo */}
            <div className="flex items-center gap-3 lg:hidden">
              <button
                onClick={() => setOpen(!open)}
                className="p-1 -ml-1 text-ink"
                aria-label="Toggle menu"
              >
                {open ? <X size={19} /> : <Menu size={19} />}
              </button>
              <Link to="/">
                <CinescopeLogo size="sm" />
              </Link>
            </div>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center flex-1">
              {/* Scrolled logo — slides in when masthead collapses */}
              <div
                className={`overflow-hidden transition-[max-width,opacity,margin,padding] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  scrolled
                    ? "max-w-[260px] opacity-100 mr-6 pr-6 border-r border-rule"
                    : "max-w-0 opacity-0 mr-0 pr-0 border-r-0"
                }`}
              >
                <Link to="/">
                  <CinescopeLogo size="sm" />
                </Link>
              </div>

              {/* Nav links — categories on the left */}
              <nav className="flex items-center gap-0.5">
                <NavLink to="/" exact>Home</NavLink>
                {navCats.map((c) => (
                  <NavLink key={c.slug} to="/category/$slug" params={{ slug: c.slug }}>
                    {c.name}
                  </NavLink>
                ))}
                {moreCats.length > 0 && (
                  <div className="relative">
                    <button
                      onClick={() => setMoreOpen((o) => !o)}
                      onBlur={() => setTimeout(() => setMoreOpen(false), 150)}
                      className="nav-link relative py-1.5 px-3 text-[11px] font-bold uppercase tracking-widest text-ink-muted hover:text-ink hover:bg-surface rounded-full transition-all duration-200 flex items-center gap-1"
                    >
                      More
                      <svg width="10" height="6" viewBox="0 0 10 6" className={`transition-transform duration-200 ${moreOpen ? "rotate-180" : ""}`}>
                        <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                      </svg>
                    </button>
                    {moreOpen && (
                      <div className="absolute top-full left-0 mt-1 w-48 bg-background border border-rule shadow-elevated z-50 animate-[slide-down_0.2s_var(--ease-out-expo)_both]">
                        {moreCats.map((c) => (
                          <Link
                            key={c.slug}
                            to="/category/$slug"
                            params={{ slug: c.slug }}
                            onClick={() => setMoreOpen(false)}
                            className="block px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-ink-muted hover:text-ink hover:bg-surface transition-colors"
                          >
                            {c.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </nav>

              {/* About + Contact — pushed to the far right with a spacer */}
              <div className="flex items-center gap-0.5 ml-auto">
                <span className="w-px h-3.5 bg-rule mx-2 shrink-0" />
                <NavLink to="/about">About</NavLink>
                <NavLink to="/contact">Contact</NavLink>
              </div>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-0.5 ml-4">
              <button
                aria-label="Search"
                onClick={() => setSearchOpen(true)}
                className="p-2 text-ink-muted hover:text-ink transition-colors"
              >
                <Search size={16} />
              </button>
              {/* Dark mode toggle — mobile only */}
              <button
                aria-label="Toggle theme"
                onClick={() => setDark(!dark)}
                className="lg:hidden p-2 text-ink-muted hover:text-ink transition-colors"
              >
                {dark ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              {/* Subscribe reappears in nav bar when scrolled */}
              <div
                className={`hidden lg:flex overflow-hidden transition-[max-width,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  scrolled ? "max-w-[120px] opacity-100 ml-2" : "max-w-0 opacity-0 ml-0"
                }`}
              >
                <button className="bg-brand text-brand-foreground px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-opacity whitespace-nowrap">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search overlay */}
        {searchOpen && (
          <div className="border-t border-rule bg-background animate-[slide-down_0.25s_var(--ease-out-expo)_both]">
            <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-3">
              <form onSubmit={handleSearchSubmit} className="relative flex gap-0">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles, topics, authors…"
                  className="flex-1 h-10 pl-9 pr-4 bg-transparent border border-rule text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:border-ink transition-colors"
                />
                <button
                  type="button"
                  onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                  className="ml-2 p-2 text-ink-muted hover:text-ink transition-colors"
                  aria-label="Close search"
                >
                  <X size={16} />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Mobile menu */}
        {open && (
          <nav className="lg:hidden border-t border-rule bg-background px-4 sm:px-6 py-2 flex flex-col animate-[slide-down_0.3s_var(--ease-out-expo)_both]">
            <Link
              to="/"
              onClick={() => setOpen(false)}
              className="py-3 text-sm font-bold uppercase tracking-widest border-b border-rule hover:text-accent-red transition-colors"
              activeProps={{ className: "text-accent-red" }}
            >
              Home
            </Link>
            {categories.map((c) => (
              <Link
                key={c.slug}
                to="/category/$slug"
                params={{ slug: c.slug }}
                onClick={() => setOpen(false)}
                className="py-3 text-sm font-bold uppercase tracking-widest border-b border-rule hover:text-accent-red transition-colors"
                activeProps={{ className: "text-accent-red" }}
              >
                {c.name}
              </Link>
            ))}
            <Link
              to="/about"
              onClick={() => setOpen(false)}
              className="py-3 text-sm font-bold uppercase tracking-widest border-b border-rule hover:text-accent-red transition-colors"
              activeProps={{ className: "text-accent-red" }}
            >
              About
            </Link>
            <Link
              to="/contact"
              onClick={() => setOpen(false)}
              className="py-3 text-sm font-bold uppercase tracking-widest hover:text-accent-red transition-colors"
              activeProps={{ className: "text-accent-red" }}
            >
              Contact
            </Link>
          </nav>
        )}
      </header>
    </>
  );
}

/* ── Cinescope logo mark ─────────────────────────────────────────────────── */
function CinescopeLogo({ size }: { size: "sm" | "lg" }) {
  if (size === "lg") {
    return (
      <img
        src="/logo.png"
        alt="Cinescope Global Concept"
        className="object-contain select-none"
        style={{ width: "clamp(56px, 12vw, 88px)", height: "auto", display: "block" }}
      />
    );
  }
  return (
    <img
      src="/logo.png"
      alt="Cinescope Global Concept"
      className="object-contain select-none"
      style={{ width: "32px", height: "auto", display: "block" }}
    />
  );
}

/* ── NavLink — pill-shaped editorial nav item ────────────────────────────── */
function NavLink({
  to,
  params,
  exact,
  children,
}: {
  to: string;
  params?: Record<string, string>;
  exact?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to as any}
      params={params as any}
      activeOptions={exact ? { exact: true } : undefined}
      className="nav-link relative py-1.5 px-3 text-[11px] font-bold uppercase tracking-widest text-ink-muted hover:text-ink hover:bg-surface rounded-full transition-all duration-200 whitespace-nowrap"
      activeProps={{ className: "nav-link relative py-1.5 px-3 text-[11px] font-bold uppercase tracking-widest text-ink bg-brand/15 rounded-full whitespace-nowrap" }}
    >
      {children}
      <span className="nav-underline absolute bottom-0 left-3 right-3 h-[2px] bg-brand origin-left scale-x-0 transition-transform duration-300" />
    </Link>
  );
}
