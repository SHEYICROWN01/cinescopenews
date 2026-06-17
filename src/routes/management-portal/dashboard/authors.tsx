import { createFileRoute, useRouter } from "@tanstack/react-router";
import {
  Plus, Edit2, Trash2, X, Upload, Twitter, Instagram,
  Mail, FileText, UserCheck, UserX, Users, Search,
} from "lucide-react";
import { useState, useRef } from "react";
import { getAllAuthorsFn, createAuthorFn, updateAuthorFn, deleteAuthorFn } from "../../../fns/authors";
import type { Author } from "../../../db/schema";

export const Route = createFileRoute("/management-portal/dashboard/authors")({
  loader: () => getAllAuthorsFn(),
  component: AuthorsPage,
});

type AuthorRow = Author & { articleCount: number };

function fileToBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

function Avatar({ author, size = "md" }: { author: Pick<Author, "name" | "avatar">; size?: "sm" | "md" | "lg" }) {
  const dim = size === "sm" ? "w-9 h-9 text-sm" : size === "lg" ? "w-16 h-16 text-2xl" : "w-12 h-12 text-base";
  const initials = author.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  if (author.avatar) {
    return (
      <img
        src={author.avatar}
        alt={author.name}
        className={`${dim} rounded-full object-cover shrink-0 border-2 border-white shadow-sm`}
      />
    );
  }
  return (
    <div
      className={`${dim} rounded-full flex items-center justify-center font-black text-white shrink-0`}
      style={{ background: `hsl(${(author.name.charCodeAt(0) * 47) % 360}, 65%, 48%)` }}
    >
      {initials}
    </div>
  );
}

// ─── Author Form Panel ────────────────────────────────────────────────────────

const EMPTY_FORM = {
  name: "", email: "", bio: "", avatar: "", title: "", twitter: "", instagram: "", isActive: true,
};
type FormState = typeof EMPTY_FORM;

function AuthorFormPanel({
  initial, onSave, onClose, saving,
}: {
  initial: FormState; onSave: (f: FormState) => void; onClose: () => void; saving: boolean;
}) {
  const [form, setForm] = useState<FormState>(initial);
  const [imgLoading, setImgLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    setImgLoading(true);
    const b64 = await fileToBase64(file);
    set("avatar", b64);
    setImgLoading(false);
  }

  const field = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all bg-white";
  const isEdit = Boolean(initial.name);

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-md bg-white flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100" style={{ background: "#0A0A0A" }}>
          <div>
            <h2 className="text-base font-black text-white" style={{ fontFamily: "var(--font-display)" }}>
              {isEdit ? "Edit Author" : "New Author"}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
              {isEdit ? "Update author profile" : "Add a new author to the newsroom"}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Avatar */}
          <div className="flex flex-col items-center py-2">
            {form.avatar ? (
              <div className="relative group">
                <img src={form.avatar} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-4 border-gray-100 shadow" />
                <button
                  type="button"
                  onClick={() => set("avatar", "")}
                  className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <Upload size={16} className="text-white" />
                </button>
              </div>
            ) : (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={async (e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) await handleFile(f); }}
                onClick={() => fileRef.current?.click()}
                className={`w-20 h-20 rounded-full border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
                  dragging ? "border-brand bg-brand/5" : "border-gray-300 bg-gray-50 hover:border-brand"
                }`}
              >
                {imgLoading
                  ? <div className="w-5 h-5 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                  : <Upload size={18} className="text-gray-400" />}
              </div>
            )}
            <p className="text-xs text-gray-400 mt-2">Click or drag to upload photo</p>
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={async (e) => { const f = e.target.files?.[0]; if (f) await handleFile(f); }} />
          </div>

          {/* Name + Title */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Full Name *</label>
            <input value={form.name} onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Adebayo Johnson" className={field} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Job Title / Role</label>
            <input value={form.title} onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Senior Reporter, Editor at Large" className={field} />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email Address</label>
            <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
              placeholder="author@cinescopeglobal.com" className={field} />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Bio</label>
            <textarea value={form.bio} onChange={(e) => set("bio", e.target.value)}
              rows={3} placeholder="Short biography that appears on the author page…" className={field + " resize-none"} />
            <p className="text-[10px] text-gray-400 mt-1">{form.bio.length}/500 characters</p>
          </div>

          {/* Social */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Twitter size={11} /> Twitter
              </label>
              <input value={form.twitter} onChange={(e) => set("twitter", e.target.value)}
                placeholder="@handle" className={field} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Instagram size={11} /> Instagram
              </label>
              <input value={form.instagram} onChange={(e) => set("instagram", e.target.value)}
                placeholder="@handle" className={field} />
            </div>
          </div>

          {/* Status */}
          {isEdit && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Status</label>
              <div className="flex gap-2">
                {[true, false].map((v) => (
                  <button key={String(v)} type="button" onClick={() => set("isActive", v)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all border ${
                      form.isActive === v
                        ? v ? "bg-green-50 text-green-700 border-green-300" : "bg-red-50 text-red-600 border-red-300"
                        : "bg-gray-50 text-gray-400 border-gray-200"
                    }`}>
                    {v ? <UserCheck size={13} /> : <UserX size={13} />}
                    {v ? "Active" : "Inactive"}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={saving || !form.name.trim()}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-lg transition-colors disabled:opacity-50"
            style={{ background: "#C5D400", color: "#0A0A0A" }}
          >
            {saving && <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />}
            {saving ? "Saving…" : isEdit ? "Update Author" : "Add Author"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Author Card ──────────────────────────────────────────────────────────────

function AuthorCard({ author, onEdit, onDelete }: {
  author: AuthorRow; onEdit: () => void; onDelete: () => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 hover:shadow-md transition-all group">
      <div className="flex items-start gap-4">
        <Avatar author={author} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-gray-900 leading-tight">{author.name}</h3>
              {author.title && <p className="text-xs text-brand font-semibold mt-0.5 uppercase tracking-wide">{author.title}</p>}
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
              author.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"
            }`}>
              {author.isActive ? "Active" : "Inactive"}
            </span>
          </div>

          {author.email && (
            <a href={`mailto:${author.email}`} className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-brand mt-1.5 transition-colors">
              <Mail size={10} /> {author.email}
            </a>
          )}
        </div>
      </div>

      {author.bio && (
        <p className="text-xs text-gray-500 leading-relaxed mt-3 line-clamp-2">{author.bio}</p>
      )}

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <FileText size={12} className="text-gray-400" />
            <span className="font-semibold">{author.articleCount}</span>
            <span className="text-gray-400">article{author.articleCount !== 1 ? "s" : ""}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {author.twitter && (
              <a href={`https://twitter.com/${author.twitter.replace("@", "")}`} target="_blank" rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-400 transition-colors">
                <Twitter size={13} />
              </a>
            )}
            {author.instagram && (
              <a href={`https://instagram.com/${author.instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer"
                className="text-gray-400 hover:text-pink-500 transition-colors">
                <Instagram size={13} />
              </a>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button onClick={onEdit} className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors" title="Edit">
            <Edit2 size={14} />
          </button>
          <button onClick={onDelete} className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors" title="Delete">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function AuthorsPage() {
  const router = useRouter();
  const authors = Route.useLoaderData() as AuthorRow[];
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editAuthor, setEditAuthor] = useState<AuthorRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const filtered = authors.filter((a) =>
    !search || a.name.toLowerCase().includes(search.toLowerCase()) ||
    (a.title ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = authors.filter((a) => a.isActive).length;
  const totalArticles = authors.reduce((s, a) => s + a.articleCount, 0);

  function openCreate() { setEditAuthor(null); setShowForm(true); }
  function openEdit(a: AuthorRow) { setEditAuthor(a); setShowForm(true); }
  function closeForm() { setShowForm(false); setEditAuthor(null); }

  async function handleSave(form: typeof EMPTY_FORM) {
    setSaving(true);
    try {
      if (editAuthor) {
        await updateAuthorFn({ data: { id: editAuthor.id, ...form } });
      } else {
        await createAuthorFn({ data: form });
      }
      closeForm();
      router.invalidate();
    } catch (e: any) {
      alert(e?.message ?? "Failed to save author.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(author: AuthorRow) {
    if (!confirm(`Delete "${author.name}"? This cannot be undone.`)) return;
    setDeletingId(author.id);
    try {
      await deleteAuthorFn({ data: { id: author.id } });
      router.invalidate();
    } catch {
      alert("Failed to delete author.");
    } finally {
      setDeletingId(null);
    }
  }

  const EMPTY_FORM = {
    name: "", email: "", bio: "", avatar: "", title: "", twitter: "", instagram: "", isActive: true,
  };

  const initialForm = editAuthor ? {
    name:      editAuthor.name,
    email:     editAuthor.email ?? "",
    bio:       editAuthor.bio ?? "",
    avatar:    editAuthor.avatar ?? "",
    title:     editAuthor.title ?? "",
    twitter:   editAuthor.twitter ?? "",
    instagram: editAuthor.instagram ?? "",
    isActive:  editAuthor.isActive ?? true,
  } : EMPTY_FORM;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900" style={{ fontFamily: "var(--font-display)" }}>Authors</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {authors.length} author{authors.length !== 1 ? "s" : ""} · {activeCount} active · {totalArticles} published articles
          </p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-lg shadow-sm"
          style={{ background: "#C5D400", color: "#0A0A0A" }}>
          <Plus size={18} /> New Author
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Authors", value: authors.length, icon: Users, color: "bg-gray-800" },
          { label: "Active", value: activeCount, icon: UserCheck, color: "bg-green-500" },
          { label: "Published Articles", value: totalArticles, icon: FileText, color: "bg-brand" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
              <Icon size={18} className="text-white" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900 leading-none">{value}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search authors by name or title…"
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 bg-white transition-all"
        />
      </div>

      {/* Grid */}
      {authors.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <Users size={28} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">No authors yet</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-xs">Add your newsroom's authors so you can assign bylines when publishing articles.</p>
          <button onClick={openCreate}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-lg"
            style={{ background: "#C5D400", color: "#0A0A0A" }}>
            <Plus size={16} /> Add First Author
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500 text-sm">No authors match "{search}".</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((author) => (
            <div key={author.id} className={deletingId === author.id ? "opacity-40 pointer-events-none" : ""}>
              <AuthorCard
                author={author}
                onEdit={() => openEdit(author)}
                onDelete={() => handleDelete(author)}
              />
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <AuthorFormPanel
          initial={initialForm}
          onSave={handleSave}
          onClose={closeForm}
          saving={saving}
        />
      )}
    </div>
  );
}
