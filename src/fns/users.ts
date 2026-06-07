import { createServerFn } from "@tanstack/react-start";
import { eq, desc } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";
import { getSessionFn, type SessionUser } from "./auth";
import { hashPassword } from "../lib/crypto";

async function requireSuperAdmin() {
  const user = await getSessionFn() as SessionUser | null;
  if (!user || user.role !== "super_admin") throw new Error("Unauthorized");
  return user;
}

/* ── List all users ─────────────────────────────────────────────────────── */
export const getUsersFn = createServerFn({ method: "GET" }).handler(async () => {
  await requireSuperAdmin();

  return db
    .select({
      id:          users.id,
      name:        users.name,
      email:       users.email,
      role:        users.role,
      avatar:      users.avatar,
      isActive:    users.isActive,
      lastLoginAt: users.lastLoginAt,
      createdAt:   users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt));
});

/* ── Create user ────────────────────────────────────────────────────────── */
export const createUserFn = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => d as { name: string; email: string; password: string; role: string })
  .handler(async ({ data }) => {
    await requireSuperAdmin();

    const hash = await hashPassword(data.password);
    await db.insert(users).values({
      name:         data.name,
      email:        data.email.toLowerCase().trim(),
      passwordHash: hash,
      role:         data.role,
    });
    return { ok: true };
  });

/* ── Update user ────────────────────────────────────────────────────────── */
export const updateUserFn = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => d as { id: number; name?: string; role?: string; isActive?: boolean; bio?: string })
  .handler(async ({ data }) => {
    await requireSuperAdmin();

    const { id, ...rest } = data;
    await db
      .update(users)
      .set({ ...rest, updatedAt: new Date().toISOString() })
      .where(eq(users.id, id));
    return { ok: true };
  });

/* ── Delete user ────────────────────────────────────────────────────────── */
export const deleteUserFn = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => d as { id: number })
  .handler(async ({ data }) => {
    const session = await requireSuperAdmin();

    if (session.id === data.id)
      throw new Error("You cannot delete your own account.");

    await db.delete(users).where(eq(users.id, data.id));
    return { ok: true };
  });

/* ── Change password ────────────────────────────────────────────────────── */
export const changePasswordFn = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => d as { id: number; password: string })
  .handler(async ({ data }) => {
    await requireSuperAdmin();

    const hash = await hashPassword(data.password);
    await db
      .update(users)
      .set({ passwordHash: hash, updatedAt: new Date().toISOString() })
      .where(eq(users.id, data.id));
    return { ok: true };
  });
