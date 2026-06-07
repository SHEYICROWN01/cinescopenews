import { createFileRoute, useRouter } from "@tanstack/react-router";
import { UserPlus, Shield, MoreVertical, Trash2, Edit2, KeyRound, ToggleLeft, ToggleRight, X, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { getUsersFn, createUserFn, updateUserFn, deleteUserFn, changePasswordFn } from "../../../fns/users";
import { Route as DashboardRoute } from "../dashboard";

export const Route = createFileRoute("/management-portal/dashboard/users")({
  loader: () => getUsersFn(),
  component: UsersPage,
});

type User = Awaited<ReturnType<typeof getUsersFn>>[number];

const ROLES = [
  { value: "super_admin", label: "Super Admin", color: "#DC2626", desc: "Full access — publish, delete, manage users" },
  { value: "editor",      label: "Editor",      color: "#1D4ED8", desc: "Can publish & approve all articles" },
  { value: "reporter",    label: "Reporter",    color: "#374151", desc: "Can create & edit their own drafts only" },
];

function roleBadge(role: string) {
  const r = ROLES.find((x) => x.value === role) ?? ROLES[2];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest"
      style={{ background: r.color + "18", color: r.color, fontFamily: "var(--font-mono)" }}
    >
      <Shield size={10} />
      {r.label}
    </span>
  );
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

/* ══════════════════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════════════════ */
function UsersPage() {
  const router = useRouter();
  const users  = Route.useLoaderData();
  const { user: currentUser } = DashboardRoute.useLoaderData();

  const [showAdd,   setShowAdd]   = useState(false);
  const [editUser,  setEditUser]  = useState<User | null>(null);
  const [pwUser,    setPwUser]    = useState<User | null>(null);
  const [menuOpen,  setMenuOpen]  = useState<number | null>(null);
  const [loading,   setLoading]   = useState(false);

  const reload = () => router.invalidate();

  const toggleActive = async (u: User) => {
    await updateUserFn({ data: { id: u.id, isActive: !u.isActive } });
    reload();
  };

  const handleDelete = async (u: User) => {
    if (!confirm(`Permanently delete "${u.name}"? This cannot be undone.`)) return;
    await deleteUserFn({ data: { id: u.id } });
    reload();
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Members</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {users.length} {users.length === 1 ? "user" : "users"} · Manage access and roles
          </p>
        </div>
        {currentUser.role === "super_admin" && (
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-5 py-3 text-white text-sm font-bold transition-all"
            style={{ background: "#0a0a12" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#DC2626"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#0a0a12"; }}
          >
            <UserPlus size={17} />
            Add User
          </button>
        )}
      </div>

      {/* Role legend */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {ROLES.map((r) => (
          <div key={r.value} className="bg-white border border-gray-200 p-4 flex items-start gap-3">
            <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: r.color }} />
            <div>
              <p className="text-sm font-bold text-gray-900">{r.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{r.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Users table */}
      <div className="bg-white border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "2px solid #f3f4f6" }}>
              <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">User</th>
              <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 hidden md:table-cell">Role</th>
              <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 hidden lg:table-cell">Last Login</th>
              <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 hidden sm:table-cell">Status</th>
              {currentUser.role === "super_admin" && (
                <th className="text-right px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="size-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                      style={{ background: u.id === currentUser.id ? "#DC2626" : "#374151" }}
                    >
                      {initials(u.name)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                        {u.name}
                        {u.id === currentUser.id && (
                          <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 bg-gray-100 text-gray-500" style={{ fontFamily: "var(--font-mono)" }}>You</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 hidden md:table-cell">{roleBadge(u.role)}</td>
                <td className="px-6 py-4 text-sm text-gray-400 hidden lg:table-cell">
                  {u.lastLoginAt
                    ? new Date(u.lastLoginAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                    : "Never"}
                </td>
                <td className="px-6 py-4 hidden sm:table-cell">
                  <span
                    className="inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest"
                    style={{
                      background: u.isActive ? "#dcfce7" : "#f3f4f6",
                      color:      u.isActive ? "#15803d" : "#6b7280",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {u.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                {currentUser.role === "super_admin" && (
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setEditUser(u)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Edit user"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => setPwUser(u)}
                        className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        title="Change password"
                      >
                        <KeyRound size={15} />
                      </button>
                      <button
                        onClick={() => toggleActive(u)}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                        title={u.isActive ? "Deactivate" : "Activate"}
                        disabled={u.id === currentUser.id}
                      >
                        {u.isActive ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                      </button>
                      {u.id !== currentUser.id && (
                        <button
                          onClick={() => handleDelete(u)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete user"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User modal */}
      {showAdd && (
        <AddUserModal
          onClose={() => setShowAdd(false)}
          onSuccess={() => { setShowAdd(false); reload(); }}
        />
      )}

      {/* Edit User modal */}
      {editUser && (
        <EditUserModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onSuccess={() => { setEditUser(null); reload(); }}
        />
      )}

      {/* Change Password modal */}
      {pwUser && (
        <ChangePasswordModal
          user={pwUser}
          onClose={() => setPwUser(null)}
          onSuccess={() => { setPwUser(null); reload(); }}
        />
      )}
    </div>
  );
}

/* ── Shared modal shell ─────────────────────────────────────────────────── */
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <X size={17} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2" style={{ fontFamily: "var(--font-mono)" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-4 py-3 text-sm border-2 border-gray-200 outline-none transition-colors focus:border-gray-900";

/* ── Add User modal ─────────────────────────────────────────────────────── */
function AddUserModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [role,     setRole]     = useState("reporter");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createUserFn({ data: { name, email, password, role } });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Add New User" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 border-l-4 border-red-500">{error}</p>}
        <Field label="Full Name">
          <input className={inputCls} required value={name} onChange={(e) => setName(e.target.value)} placeholder="Adebayo Johnson" />
        </Field>
        <Field label="Email Address">
          <input className={inputCls} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="editor@cinescopeglobal.com" />
        </Field>
        <Field label="Password">
          <div className="relative">
            <input
              className={inputCls + " pr-12"}
              type={showPw ? "text" : "password"}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
            />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </Field>
        <Field label="Role">
          <select className={inputCls} value={role} onChange={(e) => setRole(e.target.value)}>
            {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </Field>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-3 text-sm font-bold border-2 border-gray-200 text-gray-700 hover:border-gray-400 transition-colors">Cancel</button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 text-sm font-bold text-white transition-colors disabled:opacity-60"
            style={{ background: "#0a0a12" }}
            onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.background = "#DC2626"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#0a0a12"; }}
          >
            {loading ? "Creating…" : "Create User"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ── Edit User modal ────────────────────────────────────────────────────── */
function EditUserModal({ user, onClose, onSuccess }: { user: User; onClose: () => void; onSuccess: () => void }) {
  const [name,    setName]    = useState(user.name);
  const [role,    setRole]    = useState(user.role);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateUserFn({ data: { id: user.id, name, role } });
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Edit User" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Full Name">
          <input className={inputCls} required value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Role">
          <select className={inputCls} value={role} onChange={(e) => setRole(e.target.value)}>
            {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </Field>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-3 text-sm font-bold border-2 border-gray-200 text-gray-700 hover:border-gray-400 transition-colors">Cancel</button>
          <button type="submit" disabled={loading} className="flex-1 py-3 text-sm font-bold text-white disabled:opacity-60" style={{ background: "#0a0a12" }}>
            {loading ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ── Change Password modal ──────────────────────────────────────────────── */
function ChangePasswordModal({ user, onClose, onSuccess }: { user: User; onClose: () => void; onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await changePasswordFn({ data: { id: user.id, password } });
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title={`Change Password — ${user.name}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="New Password">
          <div className="relative">
            <input
              className={inputCls + " pr-12"}
              type={showPw ? "text" : "password"}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
            />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </Field>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-3 text-sm font-bold border-2 border-gray-200 text-gray-700 hover:border-gray-400 transition-colors">Cancel</button>
          <button type="submit" disabled={loading} className="flex-1 py-3 text-sm font-bold text-white disabled:opacity-60" style={{ background: "#0a0a12" }}>
            {loading ? "Updating…" : "Update Password"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
