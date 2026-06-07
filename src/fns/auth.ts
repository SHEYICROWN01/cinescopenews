import { createServerFn } from "@tanstack/react-start";
import { eq, and } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";
import { verifyPassword } from "../lib/crypto";

const SESSION_PASSWORD =
  process.env.SESSION_SECRET ?? "change-this-in-production-must-be-32-plus-chars!!";

export type SessionUser = {
  id:     number;
  name:   string;
  email:  string;
  role:   "super_admin" | "editor" | "reporter";
  avatar: string | null;
};

type SessionData = { user?: SessionUser };

async function getSession() {
  /* Dynamic import keeps @tanstack/react-start/server out of the client bundle */
  const { useSession } = await import("@tanstack/react-start/server");
  return useSession<SessionData>({ password: SESSION_PASSWORD });
}

/* ── Read session — exported for use in route loaders ───────────────────── */
export const getSessionFn = createServerFn({ method: "GET" }).handler(async () => {
  const s = await getSession();
  return s.data.user ?? null;
});

/* ── Login ──────────────────────────────────────────────────────────────── */
export const loginFn = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => d as { email: string; password: string })
  .handler(async ({ data }) => {
    const [user] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.email, data.email.toLowerCase().trim()),
          eq(users.isActive, true)
        )
      )
      .limit(1);

    if (!user || !(await verifyPassword(data.password, user.passwordHash))) {
      return { ok: false, error: "Invalid email or password." } as const;
    }

    const s = await getSession();
    await s.update({
      user: {
        id:     user.id,
        name:   user.name,
        email:  user.email,
        role:   user.role as SessionUser["role"],
        avatar: user.avatar ?? null,
      },
    });

    await db
      .update(users)
      .set({ lastLoginAt: new Date().toISOString() })
      .where(eq(users.id, user.id));

    return { ok: true } as const;
  });

/* ── Logout ─────────────────────────────────────────────────────────────── */
export const logoutFn = createServerFn({ method: "POST" }).handler(async () => {
  const s = await getSession();
  await s.clear();
  return { ok: true };
});
