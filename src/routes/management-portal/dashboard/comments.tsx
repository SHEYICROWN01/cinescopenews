import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import {
  CheckCircle, XCircle, AlertTriangle, Trash2,
  ExternalLink, Search, Filter, ChevronDown, ChevronUp,
} from "lucide-react";
import { useState } from "react";
import {
  getAllCommentsFn,
  moderateCommentFn,
  deleteCommentFn,
  bulkModerateCommentsFn,
} from "../../../fns/comments";

export const Route = createFileRoute("/management-portal/dashboard/comments")({
  loader: () => getAllCommentsFn(),
  component: CommentsPage,
});

type Comment = Awaited<ReturnType<typeof getAllCommentsFn>>[number];

type Status = "all" | "pending" | "approved" | "spam" | "rejected";

const STATUS_CONFIG = {
  pending:  { label: "Pending",  bg: "#FEF3C7", color: "#92400E", dot: "#F59E0B" },
  approved: { label: "Approved", bg: "#D1FAE5", color: "#065F46", dot: "#10B981" },
  spam:     { label: "Spam",     bg: "#FEE2E2", color: "#991B1B", dot: "#EF4444" },
  rejected: { label: "Rejected", bg: "#F3F4F6", color: "#374151", dot: "#9CA3AF" },
} as const;

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.rejected;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest"
      style={{ background: cfg.bg, color: cfg.color, fontFamily: "var(--font-mono)" }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  );
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

/* ══════════════════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════════════════ */
function CommentsPage() {
  const router   = useRouter();
  const all      = Route.useLoaderData();

  const [activeTab,  setActiveTab]  = useState<Status>("pending");
  const [search,     setSearch]     = useState("");
  const [selected,   setSelected]   = useState<Set<number>>(new Set());
  const [expanded,   setExpanded]   = useState<Set<number>>(new Set());
  const [loadingId,  setLoadingId]  = useState<number | null>(null);

  const reload = () => { setSelected(new Set()); router.invalidate(); };

  /* Counts per tab */
  const counts: Record<Status, number> = {
    all:      all.length,
    pending:  all.filter((c) => c.status === "pending").length,
    approved: all.filter((c) => c.status === "approved").length,
    spam:     all.filter((c) => c.status === "spam").length,
    rejected: all.filter((c) => c.status === "rejected").length,
  };

  /* Filtered list */
  const visible = all.filter((c) => {
    if (activeTab !== "all" && c.status !== activeTab) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.content.toLowerCase().includes(q) ||
        (c.articleTitle ?? "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  /* Actions */
  const moderate = async (id: number, status: string) => {
    setLoadingId(id);
    await moderateCommentFn({ data: { id, status } });
    setLoadingId(null);
    reload();
  };

  const remove = async (id: number) => {
    if (!confirm("Permanently delete this comment?")) return;
    setLoadingId(id);
    await deleteCommentFn({ data: { id } });
    setLoadingId(null);
    reload();
  };

  const bulkAction = async (status: string) => {
    if (!selected.size) return;
    if (status === "delete") {
      if (!confirm(`Delete ${selected.size} comment${selected.size > 1 ? "s" : ""}?`)) return;
      for (const id of selected) await deleteCommentFn({ data: { id } });
    } else {
      await bulkModerateCommentsFn({ data: { ids: [...selected], status } });
    }
    reload();
  };

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelected(
      selected.size === visible.length ? new Set() : new Set(visible.map((c) => c.id))
    );
  };

  const toggleExpand = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const TABS: { key: Status; label: string }[] = [
    { key: "pending",  label: "Pending" },
    { key: "all",      label: "All" },
    { key: "approved", label: "Approved" },
    { key: "spam",     label: "Spam" },
    { key: "rejected", label: "Rejected" },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Comments</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {counts.pending > 0
              ? `${counts.pending} comment${counts.pending > 1 ? "s" : ""} awaiting moderation`
              : "All comments are moderated"}
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(["pending", "approved", "spam", "rejected"] as const).map((s) => {
          const cfg = STATUS_CONFIG[s];
          return (
            <button
              key={s}
              onClick={() => setActiveTab(s)}
              className={`bg-white border-2 p-4 text-left transition-all ${
                activeTab === s ? "border-gray-900 shadow-md" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: cfg.dot }}
                />
                {activeTab === s && (
                  <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400" style={{ fontFamily: "var(--font-mono)" }}>
                    Active
                  </span>
                )}
              </div>
              <p className="text-3xl font-black text-gray-900">{counts[s]}</p>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mt-1" style={{ fontFamily: "var(--font-mono)" }}>
                {cfg.label}
              </p>
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-gray-200 p-4 flex flex-wrap gap-3 items-center justify-between">
        {/* Tabs */}
        <div className="flex items-center gap-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => { setActiveTab(t.key); setSelected(new Set()); }}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-1.5 ${
                activeTab === t.key
                  ? "bg-gray-900 text-white"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              }`}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {t.label}
              {counts[t.key] > 0 && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                    activeTab === t.key ? "bg-white/20 text-white" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {counts[t.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 border border-gray-200 px-3 py-2 flex-1 max-w-xs">
          <Search size={14} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search comments…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="outline-none text-sm text-gray-700 placeholder:text-gray-400 w-full bg-transparent"
          />
        </div>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-gray-900 text-white text-sm">
          <span className="font-bold">{selected.size} selected</span>
          <div className="flex items-center gap-2 ml-2">
            <button onClick={() => bulkAction("approved")} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-xs font-bold uppercase tracking-widest transition-colors" style={{ fontFamily: "var(--font-mono)" }}>
              <CheckCircle size={12} /> Approve All
            </button>
            <button onClick={() => bulkAction("rejected")} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-600 hover:bg-gray-500 text-xs font-bold uppercase tracking-widest transition-colors" style={{ fontFamily: "var(--font-mono)" }}>
              <XCircle size={12} /> Reject All
            </button>
            <button onClick={() => bulkAction("spam")} className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-xs font-bold uppercase tracking-widest transition-colors" style={{ fontFamily: "var(--font-mono)" }}>
              <AlertTriangle size={12} /> Mark Spam
            </button>
            <button onClick={() => bulkAction("delete")} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-xs font-bold uppercase tracking-widest transition-colors" style={{ fontFamily: "var(--font-mono)" }}>
              <Trash2 size={12} /> Delete
            </button>
          </div>
          <button onClick={() => setSelected(new Set())} className="ml-auto text-xs text-gray-400 hover:text-white transition-colors">
            Clear selection
          </button>
        </div>
      )}

      {/* Comment list */}
      <div className="bg-white border border-gray-200">
        {/* Table head */}
        <div className="grid grid-cols-[20px_1fr] lg:grid-cols-[20px_1fr_auto] gap-4 px-5 py-3 border-b border-gray-200 bg-gray-50">
          <input
            type="checkbox"
            checked={selected.size === visible.length && visible.length > 0}
            onChange={selectAll}
            className="mt-0.5 accent-gray-900"
          />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500" style={{ fontFamily: "var(--font-mono)" }}>
            Comment · Author · Article
          </span>
          <span className="hidden lg:block text-xs font-bold uppercase tracking-wider text-gray-500 text-right" style={{ fontFamily: "var(--font-mono)" }}>
            Actions
          </span>
        </div>

        {visible.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-gray-400 text-sm font-medium">No comments to show.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {visible.map((c) => {
              const isExp = expanded.has(c.id);
              const busy  = loadingId === c.id;
              return (
                <div key={c.id} className={`px-5 py-4 transition-colors ${busy ? "opacity-50" : "hover:bg-gray-50"}`}>
                  <div className="grid grid-cols-[20px_1fr] lg:grid-cols-[20px_1fr_auto] gap-4 items-start">
                    <input
                      type="checkbox"
                      checked={selected.has(c.id)}
                      onChange={() => toggleSelect(c.id)}
                      className="mt-1 accent-gray-900"
                    />

                    {/* Main content */}
                    <div className="min-w-0">
                      {/* Author row */}
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <div className="size-8 rounded-full bg-gray-200 text-gray-600 text-xs font-bold grid place-items-center shrink-0">
                          {initials(c.name)}
                        </div>
                        <div>
                          <span className="font-semibold text-sm text-gray-900">{c.name}</span>
                          <span className="text-gray-400 text-xs ml-2">{c.email}</span>
                        </div>
                        <StatusBadge status={c.status} />
                        <span className="text-xs text-gray-400 ml-auto" style={{ fontFamily: "var(--font-mono)" }}>
                          {timeAgo(c.createdAt)}
                        </span>
                      </div>

                      {/* Comment text */}
                      <p className="text-sm text-gray-700 leading-relaxed mb-2 font-serif-body">
                        {isExp ? c.content : c.content.slice(0, 160)}
                        {c.content.length > 160 && (
                          <button
                            onClick={() => toggleExpand(c.id)}
                            className="ml-1.5 text-xs font-bold text-brand hover:underline inline-flex items-center gap-1"
                          >
                            {isExp ? (<><ChevronUp size={11} /> Show less</>) : (<><ChevronDown size={11} /> Read more</>)}
                          </button>
                        )}
                      </p>

                      {/* Article link */}
                      {c.articleTitle && c.articleSlug && (
                        <Link
                          to="/article/$slug"
                          params={{ slug: c.articleSlug }}
                          target="_blank"
                          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-brand transition-colors"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          <ExternalLink size={11} />
                          {c.articleTitle.slice(0, 60)}{c.articleTitle.length > 60 ? "…" : ""}
                        </Link>
                      )}

                      {/* Mobile actions */}
                      <div className="flex items-center gap-2 mt-3 lg:hidden flex-wrap">
                        <ActionButtons c={c} busy={busy} moderate={moderate} remove={remove} />
                      </div>
                    </div>

                    {/* Desktop actions */}
                    <div className="hidden lg:flex items-center gap-1.5 shrink-0 pt-0.5">
                      <ActionButtons c={c} busy={busy} moderate={moderate} remove={remove} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Inline action buttons ──────────────────────────────────────────────── */
function ActionButtons({
  c, busy, moderate, remove,
}: {
  c: Comment;
  busy: boolean;
  moderate: (id: number, status: string) => void;
  remove: (id: number) => void;
}) {
  return (
    <>
      {c.status !== "approved" && (
        <button
          onClick={() => moderate(c.id, "approved")}
          disabled={busy}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest bg-green-50 text-green-700 hover:bg-green-100 transition-colors disabled:opacity-50"
          style={{ fontFamily: "var(--font-mono)" }}
          title="Approve"
        >
          <CheckCircle size={11} /> Approve
        </button>
      )}
      {c.status !== "rejected" && (
        <button
          onClick={() => moderate(c.id, "rejected")}
          disabled={busy}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50"
          style={{ fontFamily: "var(--font-mono)" }}
          title="Reject"
        >
          <XCircle size={11} /> Reject
        </button>
      )}
      {c.status !== "spam" && (
        <button
          onClick={() => moderate(c.id, "spam")}
          disabled={busy}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest bg-yellow-50 text-yellow-700 hover:bg-yellow-100 transition-colors disabled:opacity-50"
          style={{ fontFamily: "var(--font-mono)" }}
          title="Spam"
        >
          <AlertTriangle size={11} /> Spam
        </button>
      )}
      <button
        onClick={() => remove(c.id)}
        disabled={busy}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
        style={{ fontFamily: "var(--font-mono)" }}
        title="Delete permanently"
      >
        <Trash2 size={11} /> Delete
      </button>
    </>
  );
}
