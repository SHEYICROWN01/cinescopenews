import { createFileRoute, Outlet, Link, redirect, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard, FileText, FolderOpen, Image,
  Settings, Users, DollarSign, CloudSun, TrendingUp,
  LogOut, Menu, X, ChevronRight, Globe, Shield, MessageCircle, BarChart2,
} from "lucide-react";
import { useState } from "react";
import { getSessionFn, logoutFn, type SessionUser } from "../../fns/auth";
import { getPendingCountFn } from "../../fns/comments";

export const Route = createFileRoute("/management-portal/dashboard")({
  loader: async () => {
    const user = await getSessionFn();
    if (!user) throw redirect({ to: "/management-portal" });
    const pendingComments = await getPendingCountFn().catch(() => 0);
    return { user, pendingComments };
  },
  component: DashboardLayout,
});

const NAV_GROUPS = [
  {
    label: "Content",
    items: [
      { icon: LayoutDashboard, label: "Dashboard",    href: "/management-portal/dashboard",              exact: true },
      { icon: FileText,        label: "Articles",     href: "/management-portal/dashboard/articles" },
      { icon: FolderOpen,      label: "Categories",   href: "/management-portal/dashboard/categories" },
      { icon: BarChart2,       label: "Analytics",    href: "/management-portal/dashboard/analytics" },
    ],
  },
  {
    label: "Media & Ads",
    items: [
      { icon: Image,      label: "Media Library",   href: "/management-portal/dashboard/media" },
      { icon: DollarSign, label: "Advertisements",  href: "/management-portal/dashboard/ads" },
    ],
  },
  {
    label: "Live Data",
    items: [
      { icon: CloudSun,    label: "Weather",     href: "/management-portal/dashboard/weather" },
      { icon: TrendingUp,  label: "Market Data", href: "/management-portal/dashboard/market" },
    ],
  },
  {
    label: "Community",
    items: [
      { icon: MessageCircle, label: "Comments", href: "/management-portal/dashboard/comments", badge: true },
    ],
  },
  {
    label: "Admin",
    items: [
      { icon: Users,    label: "Users",    href: "/management-portal/dashboard/users",    adminOnly: true },
      { icon: Settings, label: "Settings", href: "/management-portal/dashboard/settings" },
    ],
  },
] as const;

const ROLE_CONFIG = {
  super_admin: { label: "Super Admin", bg: "#C5D400", text: "#0A0A0A" },
  editor:      { label: "Editor",      bg: "rgba(197,212,0,0.2)", text: "#C5D400" },
  reporter:    { label: "Reporter",    bg: "rgba(255,255,255,0.08)", text: "rgba(255,255,255,0.5)" },
} as const;

function roleConfig(role: string) {
  return ROLE_CONFIG[role as keyof typeof ROLE_CONFIG] ?? ROLE_CONFIG.reporter;
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function DashboardLayout() {
  const { user, pendingComments } = Route.useLoaderData() as { user: SessionUser; pendingComments: number };
  const navigate  = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logoutFn();
    navigate({ to: "/management-portal" });
  };

  const rc = roleConfig(user.role);

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "var(--font-sans)", background: "#F5F4F0" }}>

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40 w-60 flex flex-col
          transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        style={{ background: "#0A0A0A", borderRight: "1px solid rgba(197,212,0,0.12)" }}
      >
        {/* Lime top stripe */}
        <div style={{ height: "3px", background: "#C5D400", flexShrink: 0 }} />

        {/* Logo */}
        <div className="px-5 pt-5 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <Link to="/" className="block group">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Cinescope Global Concept"
                style={{ width: "42px", height: "auto", filter: "brightness(0) invert(1)" }}
                className="shrink-0"
              />
              <div>
                <span
                  className="block font-black leading-none text-white"
                  style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem", letterSpacing: "-0.02em" }}
                >
                  Cinescope
                </span>
                <span
                  className="block text-[9px] font-bold uppercase tracking-[0.2em] mt-0.5"
                  style={{ color: "#C5D400" }}
                >
                  Global Concept
                </span>
              </div>
            </div>
            <p
              className="mt-3 text-[9px] font-bold uppercase tracking-[0.25em]"
              style={{ color: "rgba(255,255,255,0.2)" }}
            >
              Newsroom CMS
            </p>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p
                className="px-2 mb-1.5 text-[9px] font-bold uppercase tracking-[0.25em]"
                style={{ color: "rgba(255,255,255,0.2)" }}
              >
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  if ("adminOnly" in item && item.adminOnly && user.role !== "super_admin") return null;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setOpen(false)}
                      activeOptions={"exact" in item && item.exact ? { exact: true } : undefined}
                      className="flex items-center gap-2.5 px-2 py-2 text-[13px] font-medium transition-all"
                      style={{ color: "rgba(255,255,255,0.45)", borderRadius: "2px" }}
                      activeProps={{
                        style: {
                          color: "#0A0A0A",
                          background: "#C5D400",
                          fontWeight: 700,
                        } as React.CSSProperties,
                      }}
                      inactiveProps={{
                        onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
                          (e.currentTarget as HTMLElement).style.background = "rgba(197,212,0,0.08)";
                          (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.8)";
                        },
                        onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
                          (e.currentTarget as HTMLElement).style.background = "";
                          (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.45)";
                        },
                      }}
                    >
                      <item.icon size={15} strokeWidth={1.75} />
                      <span className="flex-1">{item.label}</span>
                      {"badge" in item && item.badge && pendingComments > 0 && (
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.5 min-w-[18px] text-center leading-none"
                          style={{ background: "#CC0000", color: "white" }}
                        >
                          {pendingComments}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* View site */}
        <div className="px-3 py-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-2 py-2 text-[12px] font-medium transition-all"
            style={{ color: "rgba(255,255,255,0.25)", borderRadius: "2px" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#C5D400"; (e.currentTarget as HTMLElement).style.background = "rgba(197,212,0,0.06)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.25)"; (e.currentTarget as HTMLElement).style.background = ""; }}
          >
            <Globe size={14} strokeWidth={1.5} />
            <span>View Website</span>
            <ChevronRight size={12} className="ml-auto opacity-40" />
          </a>
        </div>

        {/* User card */}
        <div
          className="mx-3 mb-4 p-3 flex items-center gap-2.5"
          style={{ background: "rgba(197,212,0,0.06)", border: "1px solid rgba(197,212,0,0.15)" }}
        >
          <div
            className="size-8 flex items-center justify-center text-xs font-black shrink-0"
            style={{ background: "#C5D400", color: "#0A0A0A", fontFamily: "var(--font-display)" }}
          >
            {initials(user.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-bold text-white truncate leading-none mb-1">{user.name}</p>
            <span
              className="inline-block text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5"
              style={{ background: rc.bg, color: rc.text }}
            >
              {rc.label}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="p-1 transition-colors shrink-0"
            style={{ color: "rgba(255,255,255,0.25)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#CC0000"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.25)"; }}
            title="Sign out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/70 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Main area ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header
          className="sticky top-0 z-20 flex items-center justify-between px-5 lg:px-8 h-13 bg-white"
          style={{ borderBottom: "2px solid #C5D400", height: "52px" }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(!open)}
              className="lg:hidden p-1.5 transition-colors"
              style={{ color: "#0A0A0A" }}
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
            <div className="hidden lg:flex items-center gap-2 text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(0,0,0,0.3)", fontFamily: "var(--font-mono)" }}>
              <Shield size={12} />
              <span>Management Portal</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest px-4 py-2 transition-all"
              style={{ fontFamily: "var(--font-mono)", border: "1px solid #C5D400", color: "#0A0A0A" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#C5D400"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ""; }}
            >
              <Globe size={12} />
              View Site
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest px-4 py-2 transition-colors"
              style={{ fontFamily: "var(--font-mono)", color: "rgba(0,0,0,0.4)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#CC0000"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(0,0,0,0.4)"; }}
            >
              <LogOut size={12} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 lg:p-8 max-w-[1400px] w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
