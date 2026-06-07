#!/usr/bin/env node
/**
 * Create the initial Cinescope admin user in Turso.
 * Run: npx tsx scripts/seed-admin.ts
 */
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { users } from "../src/db/schema";

async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 100_000, hash: "SHA-256" },
    key,
    256
  );
  const s = [...salt].map((b) => b.toString(16).padStart(2, "0")).join("");
  const h = [...new Uint8Array(bits)].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `pbkdf2:${s}:${h}`;
}

const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    ?? "admin@cinescopeglobal.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "Cinescope@Admin2026";

const client = createClient({
  url:       process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});
const db = drizzle(client);

async function main() {
  console.log("Creating admin user…");
  const hash = await hashPassword(ADMIN_PASSWORD);

  await db.insert(users).values({
    name:         "Cinescope Admin",
    email:        ADMIN_EMAIL.toLowerCase(),
    passwordHash: hash,
    role:         "super_admin",
    isActive:     true,
  }).onConflictDoUpdate({
    target: users.email,
    set: { passwordHash: hash, role: "super_admin", isActive: true },
  });

  console.log(`✅ Admin user ready`);
  console.log(`   Email:    ${ADMIN_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);
  client.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
