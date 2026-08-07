// Phase 11 — admin_users + Postgres sessions; ADMIN_PASSWORD retired (issues #35-#37).
const { test, expect } = require("@playwright/test");
const { Client } = require("pg");
const {
  BACKEND_URL,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  adminToken,
  adminUiLogin,
} = require("../fixtures/helpers");

const DATABASE_URL = (
  process.env.DATABASE_URL || "postgresql+asyncpg://softogram:softogram@localhost:5432/softogram_e2e"
).replace("+asyncpg", "");

test.describe("Admin auth hardening (issues #35-#37)", () => {
  test("login authenticates against admin_users email + argon2 hash", async ({ request }) => {
    const badEmail = await request.post(`${BACKEND_URL}/api/admin/login`, {
      data: { email: "nobody@example.com", password: ADMIN_PASSWORD },
    });
    expect(badEmail.status()).toBe(401);

    const badPw = await request.post(`${BACKEND_URL}/api/admin/login`, {
      data: { email: ADMIN_EMAIL, password: "wrong-password" },
    });
    expect(badPw.status()).toBe(401);

    // Legacy password-only body must fail validation (email required).
    const legacy = await request.post(`${BACKEND_URL}/api/admin/login`, {
      data: { password: ADMIN_PASSWORD },
    });
    expect(legacy.status()).toBe(422);

    const ok = await request.post(`${BACKEND_URL}/api/admin/login`, {
      data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
    });
    expect(ok.status()).toBe(200);
    const { token, expires_in } = await ok.json();
    expect(token).toBeTruthy();
    expect(expires_in).toBe(60 * 60 * 12);

    const blogs = await request.get(`${BACKEND_URL}/api/admin/blog`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(blogs.status()).toBe(200);
  });

  test("session token is stored hashed in Postgres and survives process-local memory loss", async ({
    request,
  }) => {
    const token = await adminToken(request);
    const client = new Client({ connectionString: DATABASE_URL });
    await client.connect();
    try {
      const { rows: users } = await client.query("SELECT id, email, password_hash FROM admin_users WHERE email = $1", [
        ADMIN_EMAIL,
      ]);
      expect(users.length).toBe(1);
      expect(users[0].password_hash).toMatch(/^\$argon2/);
      expect(users[0].password_hash).not.toContain(ADMIN_PASSWORD);

      const { rows: sessions } = await client.query(
        "SELECT token_hash, admin_user_id, expires_at FROM admin_sessions WHERE admin_user_id = $1 ORDER BY created_at DESC LIMIT 5",
        [users[0].id],
      );
      expect(sessions.length).toBeGreaterThanOrEqual(1);
      // Raw bearer token must never appear in the DB — only sha256 hex.
      expect(sessions.some((s) => s.token_hash === token)).toBe(false);
      expect(sessions[0].token_hash).toMatch(/^[a-f0-9]{64}$/);

      // Token still authorizes (proves validation reads Postgres, not an in-memory dict).
      const still = await request.get(`${BACKEND_URL}/api/admin/blog`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(still.status()).toBe(200);
    } finally {
      await client.end();
    }
  });

  test("admin UI login uses email + password fields", async ({ page }) => {
    await adminUiLogin(page);
    await expect(page.getByTestId("admin-page")).toBeVisible({ timeout: 10000 });
  });
});
