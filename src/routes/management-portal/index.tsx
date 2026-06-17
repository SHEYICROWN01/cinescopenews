import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, ArrowRight, Lock, Mail, Shield } from "lucide-react";
import { useState } from "react";
import { loginFn } from "../../fns/auth";

export const Route = createFileRoute("/management-portal/")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await loginFn({ data: { email, password } });
      if (!result.ok) {
        setError(result.error);
      } else {
        navigate({ to: "/management-portal/dashboard" });
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row" style={{ fontFamily: "var(--font-sans)" }}>

      {/* ── LEFT PANEL — editorial brand ─────────────────────────────────── */}
      <div
        className="relative lg:w-[58%] flex flex-col justify-between overflow-hidden"
        style={{ background: "#080810", minHeight: "280px" }}
      >
        {/* Category-style ambient glows */}
        <div className="absolute pointer-events-none" style={{ top: "-20%", right: "0%", width: "70%", height: "80%", borderRadius: "50%", background: "rgba(220,38,38,0.28)", filter: "blur(100px)" }} />
        <div className="absolute pointer-events-none" style={{ bottom: "-15%", left: "-5%", width: "55%", height: "60%", borderRadius: "50%", background: "rgba(220,38,38,0.14)", filter: "blur(90px)" }} />

        {/* Dot-grid texture */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

        {/* Left brand stripe */}
        <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: "linear-gradient(to bottom, #DC2626 0%, rgba(220,38,38,0.1) 100%)" }} />

        {/* Content */}
        <div className="relative z-10 p-10 lg:p-14">
          {/* Logo */}
          <div className="mb-16 lg:mb-20">
            <div className="flex items-center gap-4 mb-3">
              <img
                src="/logo.png"
                alt="Cinescope Global Concept"
                style={{ width: "64px", height: "auto", filter: "brightness(0) invert(1)" }}
              />
              <div>
                <h1
                  className="font-black tracking-tighter uppercase leading-none text-white"
                  style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.6rem, 3vw, 2.4rem)", fontVariationSettings: '"opsz" 144, "SOFT" 30' }}
                >
                  Cinescope<span style={{ color: "#C5D400" }}> Global</span>
                </h1>
                <p className="mt-1.5 text-xs font-bold uppercase tracking-[0.25em]" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-mono)" }}>
                  Concept — Management Portal
                </p>
              </div>
            </div>
          </div>

          {/* Editorial quote */}
          <blockquote className="mb-14 lg:mb-20 max-w-sm">
            <p
              className="font-black leading-tight text-white mb-4"
              style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.5rem, 2.8vw, 2.1rem)", fontVariationSettings: '"opsz" 144, "SOFT" 40' }}
            >
              "The first draft of history is written by those who show up."
            </p>
            <cite className="text-xs font-bold uppercase tracking-widest not-italic" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-mono)" }}>
              — Newsroom Principle
            </cite>
          </blockquote>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 max-w-xs">
            {[
              { n: "24K+", l: "Articles" },
              { n: "85+",  l: "Journalists" },
              { n: "2026", l: "Founded" },
            ].map(({ n, l }) => (
              <div key={l}>
                <div
                  className="font-black text-white"
                  style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", lineHeight: 1, fontVariationSettings: '"opsz" 144, "SOFT" 30' }}
                >
                  {n}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-mono)" }}>
                  {l}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 px-10 lg:px-14 pb-10 flex items-center justify-between">
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-mono)" }}>
            © 2026 Cinescope Global Concept
          </p>
          <a
            href="/"
            className="text-xs font-bold uppercase tracking-widest transition-colors"
            style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-mono)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
          >
            ← Main Site
          </a>
        </div>

        {/* Watermark */}
        <div className="absolute inset-0 flex items-end justify-end overflow-hidden pointer-events-none select-none pb-2 pr-4">
          <span
            className="font-black uppercase leading-none"
            style={{ fontFamily: "var(--font-display)", fontSize: "clamp(8rem, 20vw, 18rem)", color: "#DC2626", opacity: 0.035, letterSpacing: "-0.06em", fontVariationSettings: '"opsz" 144, "SOFT" 30' }}
          >
            CMS
          </span>
        </div>
      </div>

      {/* ── RIGHT PANEL — login form ──────────────────────────────────────── */}
      <div
        className="flex-1 flex flex-col justify-center px-8 py-14 lg:px-16 xl:px-24"
        style={{ background: "oklch(0.992 0.002 90)" }}
      >
        <div className="w-full max-w-[400px] mx-auto lg:mx-0">

          {/* Heading */}
          <div className="mb-10">
            <h2
              className="font-black tracking-tight leading-none mb-3"
              style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.2rem, 4vw, 3rem)", color: "oklch(0.18 0.02 260)", fontVariationSettings: '"opsz" 144, "SOFT" 30' }}
            >
              Welcome back.
            </h2>
            <p className="text-sm" style={{ color: "oklch(0.5 0.015 260)", fontFamily: "var(--font-sans)" }}>
              Sign in to access the newsroom dashboard.
            </p>
          </div>

          {/* Error alert */}
          {error && (
            <div className="mb-6 flex items-start gap-3 p-4 border-l-4 border-red-500 bg-red-50">
              <Shield size={16} className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label
                className="block text-xs font-bold uppercase tracking-widest mb-2"
                style={{ color: "oklch(0.5 0.015 260)", fontFamily: "var(--font-mono)" }}
              >
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "oklch(0.7 0.015 260)" }} />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="editor@cinescopenews.com.ng"
                  className="w-full pl-11 pr-4 py-3.5 text-sm outline-none transition-all"
                  style={{
                    background: "white",
                    border: "2px solid oklch(0.9 0.005 260)",
                    color: "oklch(0.18 0.02 260)",
                    fontFamily: "var(--font-sans)",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#DC2626")}
                  onBlur={(e) => (e.target.style.borderColor = "oklch(0.9 0.005 260)")}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                className="block text-xs font-bold uppercase tracking-widest mb-2"
                style={{ color: "oklch(0.5 0.015 260)", fontFamily: "var(--font-mono)" }}
              >
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "oklch(0.7 0.015 260)" }} />
                <input
                  type={showPw ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-11 pr-12 py-3.5 text-sm outline-none transition-all"
                  style={{
                    background: "white",
                    border: "2px solid oklch(0.9 0.005 260)",
                    color: "oklch(0.18 0.02 260)",
                    fontFamily: "var(--font-sans)",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#DC2626")}
                  onBlur={(e) => (e.target.style.borderColor = "oklch(0.9 0.005 260)")}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "oklch(0.7 0.015 260)" }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 accent-red-600"
                />
                <span className="text-xs font-medium" style={{ color: "oklch(0.5 0.015 260)", fontFamily: "var(--font-sans)" }}>
                  Keep me signed in
                </span>
              </label>
              <button
                type="button"
                className="text-xs font-bold transition-colors"
                style={{ color: "#DC2626", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.1em" }}
              >
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="group w-full flex items-center justify-center gap-3 py-4 font-bold text-sm uppercase tracking-widest text-white transition-all disabled:opacity-60"
              style={{
                background: loading ? "oklch(0.18 0.02 260)" : "oklch(0.18 0.02 260)",
                fontFamily: "var(--font-mono)",
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "#DC2626"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "oklch(0.18 0.02 260)"; }}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign In to Newsroom
                  <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Footer note */}
          <div className="mt-8 pt-6 border-t flex items-center justify-between" style={{ borderColor: "oklch(0.9 0.005 260)" }}>
            <p className="text-xs" style={{ color: "oklch(0.65 0.015 260)", fontFamily: "var(--font-mono)" }}>
              Need access?{" "}
              <a href="/contact" className="font-bold" style={{ color: "#DC2626" }}>
                Contact admin
              </a>
            </p>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: "oklch(0.65 0.015 260)", fontFamily: "var(--font-mono)" }}>
              <Lock size={11} />
              Encrypted session
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
