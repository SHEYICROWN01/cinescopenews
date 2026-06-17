import { createFileRoute, useRouter } from "@tanstack/react-router";
import {
  Plus, Edit2, Trash2, ToggleLeft, ToggleRight, X, Upload,
  MousePointerClick, Eye, TrendingUp, LayoutTemplate,
  Calendar, Link2, Building2, ImageIcon, ChevronDown, AlertCircle,
} from "lucide-react";
import { useState, useRef } from "react";
import {
  getAllAdsFn, createAdFn, updateAdFn, deleteAdFn, toggleAdStatusFn,
  AD_POSITIONS,
} from "../../../fns/ads";
import type { Advertisement } from "../../../db/schema";

export const Route = createFileRoute("/management-portal/dashboard/ads")({
  loader: () => getAllAdsFn(),
  component: AdsPage,
});

const STATUS_COLORS = {
  active:    { bg: "bg-green-100",  text: "text-green-700",  dot: "bg-green-500",  label: "Active"    },
  paused:    { bg: "bg-yellow-100", text: "text-yellow-700", dot: "bg-yellow-500", label: "Paused"    },
  scheduled: { bg: "bg-blue-100",   text: "text-blue-700",   dot: "bg-blue-500",   label: "Scheduled" },
  expired:   { bg: "bg-gray-100",   text: "text-gray-500",   dot: "bg-gray-400",   label: "Expired"   },
} as const;

function statusColor(status: string) {
  return STATUS_COLORS[status as keyof typeof STATUS_COLORS] ?? STATUS_COLORS.paused;
}

function positionLabel(key: string) {
  return AD_POSITIONS.find((p) => p.key === key)?.label ?? key;
}

function positionSize(key: string) {
  return AD_POSITIONS.find((p) => p.key === key)?.size ?? "";
}

function formatDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function ctr(clicks: number, impressions: number) {
  if (!impressions) return "0.00%";
  return ((clicks / impressions) * 100).toFixed(2) + "%";
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

// ─── Ad Form Panel ────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  title: "", advertiser: "", imageUrl: "", linkUrl: "",
  position: AD_POSITIONS[0].key as string,
  status: "active",
  startDate: "", endDate: "", notes: "",
};

type FormState = typeof EMPTY_FORM;

function AdFormPanel({
  initial, onSave, onClose, saving,
}: {
  initial: FormState;
  onSave: (f: FormState) => void;
  onClose: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<FormState>(initial);
  const [imgLoading, setImgLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [urlMode, setUrlMode] = useState(!initial.imageUrl.startsWith("data:") && initial.imageUrl.startsWith("http"));
  const fileRef = useRef<HTMLInputElement>(null);

  function set(k: keyof FormState, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    setImgLoading(true);
    const b64 = await fileToBase64(file);
    set("imageUrl", b64);
    setImgLoading(false);
  }

  const field = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all bg-white";

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="w-full max-w-lg bg-white flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100" style={{ background: "#0A0A0A" }}>
          <div>
            <h2 className="text-base font-black text-white" style={{ fontFamily: "var(--font-display)" }}>
              {initial.title ? "Edit Advertisement" : "New Advertisement"}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>Fill in the ad details below</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          {/* Advertiser + Title */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Advertiser *</label>
              <input value={form.advertiser} onChange={(e) => set("advertiser", e.target.value)}
                placeholder="e.g. MTN Nigeria" className={field} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Ad Title *</label>
              <input value={form.title} onChange={(e) => set("title", e.target.value)}
                placeholder="e.g. MTN Fibre Bundle" className={field} />
            </div>
          </div>

          {/* Position */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Position *</label>
            <div className="relative">
              <select value={form.position} onChange={(e) => set("position", e.target.value)} className={field + " appearance-none pr-8"}>
                {AD_POSITIONS.map((p) => (
                  <option key={p.key} value={p.key}>{p.label} — {p.size}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Ad Image */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Ad Image</label>
              <button type="button" onClick={() => setUrlMode(!urlMode)}
                className="text-xs text-brand hover:underline font-medium">
                {urlMode ? "Upload file" : "Use URL instead"}
              </button>
            </div>

            {urlMode ? (
              <input value={form.imageUrl.startsWith("data:") ? "" : form.imageUrl}
                onChange={(e) => set("imageUrl", e.target.value)}
                placeholder="https://example.com/banner.jpg" className={field} />
            ) : form.imageUrl ? (
              <div className="relative rounded-lg overflow-hidden border border-gray-200 group">
                <img src={form.imageUrl} alt="Ad preview" className="w-full max-h-40 object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="bg-white text-gray-900 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                    <Upload size={12} /> Replace
                  </button>
                  <button type="button" onClick={() => set("imageUrl", "")}
                    className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                    <X size={12} /> Remove
                  </button>
                </div>
              </div>
            ) : (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={async (e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) await handleFile(f); }}
                onClick={() => fileRef.current?.click()}
                className={`h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all ${
                  dragging ? "border-brand bg-brand/5" : "border-gray-300 bg-gray-50 hover:border-brand hover:bg-brand/5"
                }`}
              >
                {imgLoading
                  ? <div className="w-5 h-5 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                  : <ImageIcon size={22} className="text-gray-400 mb-1.5" />}
                <p className="text-xs text-gray-500 font-medium">{imgLoading ? "Uploading…" : "Drop image or click to upload"}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">PNG, JPG, GIF, WebP</p>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={async (e) => { const f = e.target.files?.[0]; if (f) await handleFile(f); }} />
          </div>

          {/* Link URL */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Destination URL *</label>
            <input value={form.linkUrl} onChange={(e) => set("linkUrl", e.target.value)}
              placeholder="https://advertiser.com/landing-page" className={field} />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Start Date</label>
              <input type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} className={field} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">End Date</label>
              <input type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} className={field} />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Status</label>
            <div className="flex gap-2">
              {["active", "paused", "scheduled"].map((s) => {
                const c = statusColor(s);
                const selected = form.status === s;
                return (
                  <button key={s} type="button" onClick={() => set("status", s)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all border ${
                      selected
                        ? `${c.bg} ${c.text} border-current`
                        : "bg-gray-50 text-gray-400 border-gray-200 hover:border-gray-300"
                    }`}>
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Notes</label>
            <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)}
              rows={2} placeholder="Internal notes about this ad…" className={field + " resize-none"} />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={saving || !form.advertiser.trim() || !form.linkUrl.trim()}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white rounded-lg transition-colors disabled:opacity-50"
            style={{ background: "#C5D400", color: "#0A0A0A" }}
          >
            {saving && <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />}
            {saving ? "Saving…" : "Save Ad"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string; value: string | number; sub?: string; color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-black text-gray-900 leading-none">{value}</p>
        <p className="text-xs font-semibold text-gray-500 mt-1 uppercase tracking-wide">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Ad Card ─────────────────────────────────────────────────────────────────

function AdCard({ ad, onEdit, onToggle, onDelete }: {
  ad: Advertisement;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const sc = statusColor(ad.status);
  const isActive = ad.status === "active";

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 hover:shadow-md transition-all group">
      {/* Image */}
      <div className="relative h-36 bg-gray-100 overflow-hidden">
        {ad.imageUrl ? (
          <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
            <ImageIcon size={32} />
            <p className="text-xs mt-2 text-gray-400">No image set</p>
          </div>
        )}
        {/* Status badge */}
        <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${sc.bg} ${sc.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
          {sc.label}
        </div>
        {/* Position badge */}
        <div className="absolute top-3 right-3 px-2 py-1 rounded-full text-[10px] font-bold bg-black/60 text-white backdrop-blur-sm">
          {positionSize(ad.position)}
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="min-w-0">
            <p className="text-xs font-bold text-brand uppercase tracking-wide truncate">{ad.advertiser || "—"}</p>
            <p className="font-bold text-gray-900 text-sm leading-snug mt-0.5 line-clamp-1">{ad.title || "Untitled"}</p>
          </div>
        </div>

        <p className="text-[11px] text-gray-400 truncate mb-3" title={positionLabel(ad.position)}>
          {positionLabel(ad.position)}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="text-center py-2 bg-gray-50 rounded-lg">
            <p className="text-sm font-black text-gray-900">{ad.impressions.toLocaleString()}</p>
            <p className="text-[9px] text-gray-400 uppercase tracking-wide mt-0.5">Views</p>
          </div>
          <div className="text-center py-2 bg-gray-50 rounded-lg">
            <p className="text-sm font-black text-gray-900">{ad.clicks.toLocaleString()}</p>
            <p className="text-[9px] text-gray-400 uppercase tracking-wide mt-0.5">Clicks</p>
          </div>
          <div className="text-center py-2 bg-gray-50 rounded-lg">
            <p className="text-sm font-black text-gray-900">{ctr(ad.clicks, ad.impressions)}</p>
            <p className="text-[9px] text-gray-400 uppercase tracking-wide mt-0.5">CTR</p>
          </div>
        </div>

        {/* Dates */}
        {(ad.startDate || ad.endDate) && (
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-3">
            <Calendar size={11} />
            <span>{formatDate(ad.startDate)} → {formatDate(ad.endDate)}</span>
          </div>
        )}

        {/* Link */}
        {ad.linkUrl && (
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-3 truncate">
            <Link2 size={11} className="shrink-0" />
            <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer"
              className="hover:text-brand transition-colors truncate">{ad.linkUrl}</a>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1.5 pt-3 border-t border-gray-100">
          <button onClick={onToggle}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex-1 justify-center ${
              isActive
                ? "bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                : "bg-green-50 text-green-700 hover:bg-green-100"
            }`}>
            {isActive ? <ToggleLeft size={14} /> : <ToggleRight size={14} />}
            {isActive ? "Pause" : "Activate"}
          </button>
          <button onClick={onEdit}
            className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors">
            <Edit2 size={15} />
          </button>
          <button onClick={onDelete}
            className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const FILTER_TABS = ["all", "active", "paused", "scheduled", "expired"] as const;

function AdsPage() {
  const router = useRouter();
  const ads = Route.useLoaderData() as Advertisement[];

  const [filter, setFilter] = useState<typeof FILTER_TABS[number]>("all");
  const [showForm, setShowForm] = useState(false);
  const [editAd, setEditAd] = useState<Advertisement | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const filtered = filter === "all" ? ads : ads.filter((a) => a.status === filter);

  const totalClicks      = ads.reduce((s, a) => s + a.clicks, 0);
  const totalImpressions = ads.reduce((s, a) => s + a.impressions, 0);
  const activeCount      = ads.filter((a) => a.status === "active").length;

  function openCreate() { setEditAd(null); setShowForm(true); }
  function openEdit(ad: Advertisement) { setEditAd(ad); setShowForm(true); }
  function closeForm() { setShowForm(false); setEditAd(null); }

  async function handleSave(form: FormState) {
    setSaving(true);
    try {
      if (editAd) {
        await updateAdFn({ data: { id: editAd.id, ...form } });
      } else {
        await createAdFn({ data: form });
      }
      closeForm();
      router.invalidate();
    } catch {
      alert("Failed to save ad.");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(ad: Advertisement) {
    const next = ad.status === "active" ? "paused" : "active";
    await toggleAdStatusFn({ data: { id: ad.id, status: next } }).catch(() => {});
    router.invalidate();
  }

  async function handleDelete(ad: Advertisement) {
    if (!confirm(`Delete "${ad.title || ad.advertiser}"? This cannot be undone.`)) return;
    setDeletingId(ad.id);
    await deleteAdFn({ data: { id: ad.id } }).catch(() => alert("Failed to delete."));
    setDeletingId(null);
    router.invalidate();
  }

  const initialForm: FormState = editAd ? {
    title:      editAd.title,
    advertiser: editAd.advertiser,
    imageUrl:   editAd.imageUrl,
    linkUrl:    editAd.linkUrl,
    position:   editAd.position,
    status:     editAd.status,
    startDate:  editAd.startDate ?? "",
    endDate:    editAd.endDate   ?? "",
    notes:      editAd.notes     ?? "",
  } : { ...EMPTY_FORM };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900" style={{ fontFamily: "var(--font-display)" }}>
            Advertisements
          </h1>
          <p className="text-gray-500 mt-1 text-sm">{ads.length} ad{ads.length !== 1 ? "s" : ""} · {activeCount} active</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-lg transition-colors shadow-sm"
          style={{ background: "#C5D400", color: "#0A0A0A" }}
        >
          <Plus size={18} /> New Advertisement
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={LayoutTemplate} label="Total Ads"   value={ads.length}                        color="bg-gray-800"  />
        <StatCard icon={TrendingUp}    label="Active"       value={activeCount}                       color="bg-green-500" sub={`${ads.length - activeCount} paused/scheduled`} />
        <StatCard icon={Eye}           label="Impressions"  value={totalImpressions.toLocaleString()} color="bg-blue-500"  />
        <StatCard icon={MousePointerClick} label="Total Clicks" value={totalClicks.toLocaleString()} color="bg-brand"
          sub={totalImpressions ? `${((totalClicks / totalImpressions) * 100).toFixed(2)}% avg CTR` : undefined} />
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {FILTER_TABS.map((t) => {
          const count = t === "all" ? ads.length : ads.filter((a) => a.status === t).length;
          return (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                filter === t ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t} {count > 0 && <span className={`ml-1 ${filter === t ? "text-brand" : "text-gray-400"}`}>({count})</span>}
            </button>
          );
        })}
      </div>

      {/* Ad Grid */}
      {ads.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <LayoutTemplate size={28} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">No advertisements yet</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-xs">Create your first ad placement to start monetising your content.</p>
          <button onClick={openCreate}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-lg"
            style={{ background: "#C5D400", color: "#0A0A0A" }}>
            <Plus size={16} /> Create First Ad
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 flex flex-col items-center text-center">
          <AlertCircle size={28} className="text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm">No {filter} ads found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((ad) => (
            <div key={ad.id} className={deletingId === ad.id ? "opacity-50 pointer-events-none" : ""}>
              <AdCard
                ad={ad}
                onEdit={() => openEdit(ad)}
                onToggle={() => handleToggle(ad)}
                onDelete={() => handleDelete(ad)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Positions reference */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Building2 size={16} className="text-gray-400" />
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Ad Positions Reference</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {AD_POSITIONS.map((p) => {
            const activeHere = ads.filter((a) => a.position === p.key && a.status === "active").length;
            return (
              <div key={p.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs font-bold text-gray-800">{p.label}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5 font-mono">{p.size}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  activeHere > 0 ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-400"
                }`}>
                  {activeHere > 0 ? `${activeHere} active` : "empty"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form panel */}
      {showForm && (
        <AdFormPanel
          initial={initialForm}
          onSave={handleSave}
          onClose={closeForm}
          saving={saving}
        />
      )}
    </div>
  );
}
