import { createClient } from "@libsql/client";

async function migrate() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) throw new Error("TURSO_DATABASE_URL is not set");

  const client = createClient({ url, authToken });

  console.log("Running migrations...");

  await client.executeMultiple(`
    CREATE TABLE IF NOT EXISTS categories (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT NOT NULL,
      slug        TEXT NOT NULL UNIQUE,
      description TEXT DEFAULT '',
      color       TEXT NOT NULL DEFAULT '#E63946',
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS articles (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      title           TEXT NOT NULL,
      subtitle        TEXT DEFAULT '',
      slug            TEXT NOT NULL UNIQUE,
      content         TEXT DEFAULT '',
      featured_image  TEXT DEFAULT '',
      category_id     INTEGER REFERENCES categories(id),
      author          TEXT DEFAULT '',
      status          TEXT NOT NULL DEFAULT 'draft',
      is_breaking     INTEGER NOT NULL DEFAULT 0,
      is_featured     INTEGER NOT NULL DEFAULT 0,
      tags            TEXT DEFAULT '',
      seo_title       TEXT DEFAULT '',
      seo_description TEXT DEFAULT '',
      published_at    TEXT,
      created_at      TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS comments (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      article_id  INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
      name        TEXT NOT NULL,
      email       TEXT NOT NULL,
      content     TEXT NOT NULL,
      status      TEXT NOT NULL DEFAULT 'pending',
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      name          TEXT NOT NULL,
      email         TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role          TEXT NOT NULL DEFAULT 'reporter',
      avatar        TEXT DEFAULT '',
      bio           TEXT DEFAULT '',
      is_active     INTEGER NOT NULL DEFAULT 1,
      last_login_at TEXT,
      created_at    TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  console.log("✓ Tables created: categories, articles, users");

  /* Seed default super_admin on first run */
  const existing = await client.execute("SELECT COUNT(*) as cnt FROM users");
  const count = Number((existing.rows[0] as unknown as { cnt: number }).cnt);

  if (count === 0) {
    const email    = process.env.ADMIN_EMAIL    ?? "admin@cinescopeglobal.com";
    const password = process.env.ADMIN_PASSWORD ?? "Cinescope@Admin2026";

    const enc  = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const key  = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
    const bits = await crypto.subtle.deriveBits(
      { name: "PBKDF2", salt, iterations: 100_000, hash: "SHA-256" },
      key,
      256
    );
    const s    = [...salt].map((b) => b.toString(16).padStart(2, "0")).join("");
    const h    = [...new Uint8Array(bits)].map((b) => b.toString(16).padStart(2, "0")).join("");
    const hash = `pbkdf2:${s}:${h}`;

    await client.execute({
      sql:  "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
      args: ["Super Admin", email, hash, "super_admin"],
    });

    console.log(`\n✓ Default super_admin created`);
    console.log(`  Email:    ${email}`);
    console.log(`  Password: ${password}`);
    console.log(`  ⚠  Change this password immediately after first login.\n`);
  }

  client.close();
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
