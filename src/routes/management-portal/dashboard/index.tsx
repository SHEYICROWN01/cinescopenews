import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import {
  FileText, FolderOpen, Edit3,
  TrendingUp, Plus, ArrowRight, Zap, MessageCircle, Eye, BarChart2,
} from "lucide-react";
import { getDashboardData } from "../../../fns/dashboard";
import { getMostReadArticles, getTotalViews } from "../../../fns/articles";

export const Route = createFileRoute("/management-portal/dashboard/")({
  loader: async () => {
    const [dashboard, mostRead, totalViews] = await Promise.all([
      getDashboardData(),
      getMostReadArticles(),
      getTotalViews(),
    ]);
    return { ...dashboard, mostRead, totalViews };
  },
  component: DashboardHome,
});

function DashboardHome() {
  const navigate = useNavigate();
  const data = Route.useLoaderData();

  function fmtViews(n: number) {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toLocaleString();
  }

  const stats = [
    {
      icon: FileText,
      label: "Total Articles",
      value: data.totalArticles.toLocaleString(),
      sub: `${data.publishedArticles} published`,
      accent: "#C5D400",
    },
    {
      icon: Edit3,
      label: "Drafts",
      value: data.draftArticles.toLocaleString(),
      sub: "awaiting publish",
      accent: "#CC0000",
    },
    {
      icon: Eye,
      label: "Total Views",
      value: fmtViews(data.totalViews),
      sub: "across all articles",
      accent: "#C5D400",
    },
    {
      icon: FolderOpen,
      label: "Categories",
      value: data.totalCategories.toLocaleString(),
      sub: "content categories",
      accent: "#0A0A0A",
    },
    {
      icon: MessageCircle,
      label: "Comments",
      value: data.totalComments.toLocaleString(),
      sub: data.pendingComments > 0 ? `${data.pendingComments} pending` : "all moderated",
      accent: data.pendingComments > 0 ? "#CC0000" : "#C5D400",
      href: "/management-portal/dashboard/comments",
    },
  ];

  const now = new Date();
  const greeting =
    now.getHours() < 12 ? "Good morning" :
    now.getHours() < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8">

      {/* ── Page header ─────────────────────────────────────────────── */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p
            className="text-xs font-bold uppercase tracking-[0.25em] mb-2"
            style={{ color: "#CC0000", fontFamily: "var(--font-mono)" }}
          >
            Newsroom Overview
          </p>
          <h1
            className="font-black leading-none"
            style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 4vw, 2.8rem)", color: "#0A0A0A", letterSpacing: "-0.02em" }}
          >
            {greeting}.
          </h1>
          <p className="mt-2 text-sm" style={{ color: "rgba(0,0,0,0.45)" }}>
            {now.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <button
          onClick={() => navigate({ to: "/management-portal/dashboard/articles/create" })}
          className="flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-widest transition-all hover:opacity-90"
          style={{ background: "#C5D400", color: "#0A0A0A", fontFamily: "var(--font-mono)" }}
        >
          <Plus size={14} />
          New Article
        </button>
      </div>

      {/* ── Stat cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            onClick={stat.href ? () => navigate({ to: stat.href as any }) : undefined}
            className="bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
            style={{
              borderTop: `3px solid ${stat.accent}`,
              cursor: stat.href ? "pointer" : "default",
            }}
          >
            <div
              className="size-8 flex items-center justify-center mb-4"
              style={{ background: stat.accent === "#0A0A0A" ? "#0A0A0A" : `${stat.accent}20` }}
            >
              <stat.icon
                size={15}
                style={{ color: stat.accent === "#0A0A0A" ? "#C5D400" : stat.accent }}
                strokeWidth={2}
              />
            </div>
            <p
              className="font-black leading-none mb-1"
              style={{ fontFamily: "var(--font-display)", fontSize: "2.2rem", color: "#0A0A0A" }}
            >
              {stat.value}
            </p>
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(0,0,0,0.4)", fontFamily: "var(--font-mono)" }}>
              {stat.label}
            </p>
            <p className="text-xs mt-1" style={{ color: "rgba(0,0,0,0.35)" }}>{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Quick actions ───────────────────────────────────────────── */}
      <div>
        <p
          className="text-[10px] font-bold uppercase tracking-[0.25em] mb-3"
          style={{ color: "rgba(0,0,0,0.3)", fontFamily: "var(--font-mono)" }}
        >
          Quick Actions
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              label: "New Article",
              sub: "Start writing now",
              icon: Plus,
              bg: "#0A0A0A",
              fg: "#C5D400",
              href: "/management-portal/dashboard/articles/create",
            },
            {
              label: "New Category",
              sub: "Add a content category",
              icon: FolderOpen,
              bg: "#C5D400",
              fg: "#0A0A0A",
              href: "/management-portal/dashboard/categories/create",
            },
            {
              label: "All Articles",
              sub: "Manage your content",
              icon: FileText,
              bg: "#CC0000",
              fg: "white",
              href: "/management-portal/dashboard/articles",
            },
          ].map((a) => (
            <button
              key={a.label}
              onClick={() => navigate({ to: a.href as any })}
              className="flex items-center gap-4 p-5 text-left group transition-all hover:opacity-90 hover:-translate-y-0.5 hover:shadow-lg"
              style={{ background: a.bg }}
            >
              <div
                className="size-10 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                style={{ background: `${a.fg}20` }}
              >
                <a.icon size={19} style={{ color: a.fg }} />
              </div>
              <div>
                <p className="font-bold text-sm" style={{ color: a.fg, fontFamily: "var(--font-display)" }}>{a.label}</p>
                <p className="text-xs mt-0.5" style={{ color: `${a.fg}99` }}>{a.sub}</p>
              </div>
              <ArrowRight size={15} className="ml-auto opacity-40 group-hover:opacity-80 group-hover:translate-x-1 transition-all" style={{ color: a.fg }} />
            </button>
          ))}
        </div>
      </div>

      {/* ── Most Read Articles ──────────────────────────────────────── */}
      {data.mostRead.length > 0 && (
        <div className="bg-white" style={{ border: "1px solid rgba(0,0,0,0.08)" }}>
          <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "2px solid #CC0000" }}>
            <div className="flex items-center gap-3">
              <div className="size-1.5 rounded-full" style={{ background: "#CC0000" }} />
              <h2 className="font-black text-base" style={{ fontFamily: "var(--font-display)", color: "#0A0A0A", letterSpacing: "-0.01em" }}>
                Most Read Articles
              </h2>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "rgba(0,0,0,0.3)", fontFamily: "var(--font-mono)" }}>
              by view count
            </span>
          </div>
          <div>
            {data.mostRead.map((article, idx) => (
              <div
                key={article.id}
                onClick={() => navigate({ to: "/management-portal/dashboard/articles/$articleId", params: { articleId: String(article.id) } })}
                className="px-6 py-4 flex items-center gap-4 cursor-pointer hover:bg-[#F5F4F0] transition-colors"
                style={{ borderBottom: idx < data.mostRead.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none" }}
              >
                <span className="font-black text-2xl w-7 shrink-0 text-center" style={{ fontFamily: "var(--font-display)", color: idx === 0 ? "#CC0000" : "rgba(0,0,0,0.15)" }}>
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate" style={{ color: "#0A0A0A", fontFamily: "var(--font-display)" }}>
                    {article.title}
                  </p>
                  {article.categoryName && (
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: article.categoryColor ?? "rgba(0,0,0,0.3)" }}>
                      {article.categoryName}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Eye size={12} style={{ color: "rgba(0,0,0,0.3)" }} />
                  <span className="font-black text-sm" style={{ fontFamily: "var(--font-mono)", color: "#0A0A0A" }}>
                    {fmtViews(article.views ?? 0)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Recent Articles ─────────────────────────────────────────── */}
      <div className="bg-white" style={{ border: "1px solid rgba(0,0,0,0.08)" }}>
        {/* Section header */}
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ borderBottom: "2px solid #C5D400" }}
        >
          <div className="flex items-center gap-3">
            <div className="size-1.5 rounded-full" style={{ background: "#C5D400" }} />
            <h2
              className="font-black text-base"
              style={{ fontFamily: "var(--font-display)", color: "#0A0A0A", letterSpacing: "-0.01em" }}
            >
              Recent Articles
            </h2>
          </div>
          <button
            onClick={() => navigate({ to: "/management-portal/dashboard/articles" })}
            className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest transition-colors hover:opacity-70"
            style={{ color: "#0A0A0A", fontFamily: "var(--font-mono)" }}
          >
            View all <ArrowRight size={12} />
          </button>
        </div>

        {data.recentArticles.length === 0 ? (
          <div className="px-6 py-16 flex flex-col items-center text-center">
            <div
              className="size-14 flex items-center justify-center mb-4"
              style={{ background: "rgba(197,212,0,0.1)", border: "2px solid rgba(197,212,0,0.3)" }}
            >
              <FileText size={22} style={{ color: "#C5D400" }} />
            </div>
            <p className="font-bold text-sm mb-1" style={{ color: "#0A0A0A" }}>No articles yet</p>
            <p className="text-xs mb-5" style={{ color: "rgba(0,0,0,0.4)" }}>Create your first article to get started.</p>
            <button
              onClick={() => navigate({ to: "/management-portal/dashboard/articles/create" })}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition-opacity hover:opacity-80"
              style={{ background: "#C5D400", color: "#0A0A0A", fontFamily: "var(--font-mono)" }}
            >
              <Plus size={13} /> Write First Article
            </button>
          </div>
        ) : (
          <div>
            {/* Table header */}
            <div
              className="hidden sm:grid grid-cols-[1fr_140px_100px_100px] gap-4 px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest"
              style={{ color: "rgba(0,0,0,0.3)", fontFamily: "var(--font-mono)", borderBottom: "1px solid rgba(0,0,0,0.06)" }}
            >
              <span>Headline</span>
              <span>Category</span>
              <span>Status</span>
              <span>Date</span>
            </div>
            {data.recentArticles.map((article, idx) => (
              <div
                key={article.id}
                onClick={() => navigate({
                  to: "/management-portal/dashboard/articles/$articleId",
                  params: { articleId: String(article.id) },
                })}
                className="px-6 py-4 grid grid-cols-1 sm:grid-cols-[1fr_140px_100px_100px] gap-2 sm:gap-4 items-center cursor-pointer transition-all group hover:bg-[#F5F4F0]"
                style={{ borderBottom: idx < data.recentArticles.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none" }}
              >
                {/* Title */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-0.5 h-7 shrink-0 hidden sm:block"
                    style={{ background: article.categoryColor ?? "#C5D400" }}
                  />
                  <div className="min-w-0">
                    <p
                      className="font-bold text-sm truncate transition-colors group-hover:text-[#CC0000]"
                      style={{ color: "#0A0A0A", fontFamily: "var(--font-display)" }}
                    >
                      {article.title}
                    </p>
                    {article.author && (
                      <p className="text-xs mt-0.5 truncate" style={{ color: "rgba(0,0,0,0.35)" }}>
                        {article.author}
                        {article.isBreaking && (
                          <span className="ml-2 inline-flex items-center gap-0.5 font-bold" style={{ color: "#CC0000" }}>
                            <Zap size={9} /> Breaking
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                </div>

                {/* Category */}
                <span className="text-xs hidden sm:block" style={{ color: "rgba(0,0,0,0.45)" }}>
                  {article.categoryName ?? "—"}
                </span>

                {/* Status */}
                <div className="hidden sm:block">
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1"
                    style={
                      article.status === "published"
                        ? { background: "rgba(197,212,0,0.15)", color: "#5a6200" }
                        : { background: "rgba(204,0,0,0.08)", color: "#CC0000" }
                    }
                  >
                    {article.status}
                  </span>
                </div>

                {/* Date */}
                <span className="text-xs hidden sm:block" style={{ color: "rgba(0,0,0,0.35)", fontFamily: "var(--font-mono)" }}>
                  {new Date(article.publishedAt ?? article.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
