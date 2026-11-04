import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { Router, type IRouter } from "express";
import { RegisterTenantResponse, LoginResponse, RefreshSessionResponse } from "@workspace/api-zod";
import { pool } from "@workspace/db";
import {
  BUILT_IN_ROLE_PERMISSIONS,
  BUILT_IN_ROLES,
  normalizeEmail,
  slugify,
} from "../lib/auth-config";
import { getRedis } from "../lib/redis";
import { createSession, rotateSession } from "../lib/tokens";
import { redisRateLimit, requireAuth, requirePermission } from "../middlewares/auth";
import {
  loginBodySchema,
  refreshBodySchema,
  registerBodySchema,
  revokeSessionParamsSchema,
} from "../lib/validation";

const router: IRouter = Router();
const registrationLimit = redisRateLimit({
  keyPrefix: "auth:limit:register",
  limit: 5,
  windowSeconds: 60 * 60,
});
const loginLimit = redisRateLimit({
  keyPrefix: "auth:limit:login",
  limit: 10,
  windowSeconds: 15 * 60,
});
const refreshLimit = redisRateLimit({
  keyPrefix: "auth:limit:refresh",
  limit: 30,
  windowSeconds: 60,
});

router.post("/auth/register", registrationLimit, async (req, res): Promise<void> => {
  const parsed = registerBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid registration details", details: parsed.error.flatten() });
    return;
  }
  const tenantName = parsed.data.tenantName.trim();
  const name = parsed.data.name.trim();
  if (tenantName.length < 2 || !name) {
    res.status(400).json({ error: "Tenant and user names cannot be blank" });
    return;
  }

  try {
    await getRedis();
    const password = parsed.data.password;
    const email = normalizeEmail(parsed.data.email);
    const tenantId = randomUUID();
    const userId = randomUUID();
    const ownerRoleId = randomUUID();
    const tenantSlug = `${slugify(tenantName) || "tenant"}-${tenantId.slice(0, 8)}`;
    const passwordHash = await bcrypt.hash(password, 12);
    const client = await pool.connect();
    let tenantCreatedAt: Date;

    try {
      await client.query("BEGIN");
      const tenantInsert = await client.query<{ created_at: Date }>(
        `INSERT INTO tenants (tenant_id, name, slug, plan)
         VALUES ($1, $2, $3, 'free')
         RETURNING created_at`,
        [tenantId, tenantName, tenantSlug],
      );
      tenantCreatedAt = tenantInsert.rows[0].created_at;
      await client.query(
        `INSERT INTO users (id, tenant_id, email, password_hash, display_name)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, tenantId, email, passwordHash, name],
      );

      for (const roleName of BUILT_IN_ROLES) {
        const roleId = roleName === "Owner" ? ownerRoleId : randomUUID();
        await client.query(
          `INSERT INTO roles (id, tenant_id, name, slug, is_system)
           VALUES ($1, $2, $3, $4, TRUE)`,
          [roleId, tenantId, roleName, roleName.toLowerCase()],
        );
        for (const permission of BUILT_IN_ROLE_PERMISSIONS[roleName]) {
          await client.query(
            `INSERT INTO role_permissions (id, tenant_id, role_id, permission)
             VALUES ($1, $2, $3, $4)`,
            [randomUUID(), tenantId, roleId, permission],
          );
        }
      }

      await client.query(
        `INSERT INTO memberships (id, tenant_id, user_id, role_id)
         VALUES ($1, $2, $3, $4)`,
        [randomUUID(), tenantId, userId, ownerRoleId],
      );
      await client.query(
        `INSERT INTO audit_events (id, tenant_id, actor_user_id, event, metadata)
         VALUES ($1, $2, $3, 'tenant.registered', $4::jsonb)`,
        [randomUUID(), tenantId, userId, JSON.stringify({ plan: "free" })],
      );
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }

    const tokens = await createSession(tenantId, userId);
    res.status(201).json(RegisterTenantResponse.parse({
      tenant: { tenantId, name: tenantName, slug: tenantSlug, plan: "free", createdAt: tenantCreatedAt },
      user: { userId, email, name },
      ...tokens,
    }));
  } catch (error) {
    req.log.error({ err: error }, "Registration failed");
    res.status(503).json({ error: "Registration service unavailable" });
  }
});

router.post("/auth/login", loginLimit, async (req, res): Promise<void> => {
  const parsed = loginBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid login details" });
    return;
  }

  try {
    await getRedis();
    const result = await pool.query<{
      id: string;
      tenant_id: string;
      email: string;
      display_name: string;
      password_hash: string;
    }>(
      `SELECT u.id, u.tenant_id, u.email, u.display_name, u.password_hash
       FROM users u
       JOIN tenants t ON t.tenant_id = u.tenant_id
       WHERE t.slug = $1 AND u.email = $2 AND u.active = TRUE
       LIMIT 1`,
      [parsed.data.tenantSlug, normalizeEmail(parsed.data.email)],
    );
    const user = result.rows[0];
    const valid = user
      ? await bcrypt.compare(parsed.data.password, user.password_hash)
      : false;
    if (!user || !valid) {
      res.status(401).json({ error: "Invalid tenant, email, or password" });
      return;
    }

    const tokens = await createSession(user.tenant_id, user.id);
    res.json(LoginResponse.parse({
      user: { userId: user.id, email: user.email, name: user.display_name },
      ...tokens,
    }));
  } catch (error) {
    req.log.error({ err: error }, "Login failed");
    res.status(503).json({ error: "Authentication service unavailable" });
  }
});

router.post("/auth/refresh", refreshLimit, async (req, res): Promise<void> => {
  const parsed = refreshBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid refresh token" });
    return;
  }

  try {
    await getRedis();
    const tokens = await rotateSession(parsed.data.refreshToken);
    if (!tokens) {
      res.status(401).json({ error: "Refresh token is invalid or expired" });
      return;
    }
    res.json(RefreshSessionResponse.parse(tokens));
  } catch (error) {
    req.log.error({ err: error }, "Session refresh failed");
    res.status(503).json({ error: "Authentication service unavailable" });
  }
});

router.post("/auth/logout", requireAuth, async (req, res): Promise<void> => {
  const auth = res.locals.auth;
  if (!auth) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const redis = await getRedis();
    const ttl = Math.max(1, auth.expiresAt - Math.floor(Date.now() / 1000));
    await pool.query(
      `UPDATE sessions SET revoked_at = NOW()
       WHERE tenant_id = $1 AND user_id = $2 AND id = $3 AND revoked_at IS NULL`,
      [auth.tenantId, auth.userId, auth.sessionId],
    );
    await redis
      .multi()
      .set(`auth:revoked:jti:${auth.tokenId}`, "1", "EX", ttl)
      .set(`auth:revoked:sid:${auth.sessionId}`, "1", "EX", 7 * 24 * 60 * 60)
      .del(`auth:session:${auth.sessionId}`)
      .exec();
    await pool.query(
      `INSERT INTO audit_events (id, tenant_id, actor_user_id, event, metadata)
       VALUES ($1, $2, $3, 'session.revoked', $4::jsonb)`,
      [randomUUID(), auth.tenantId, auth.userId, JSON.stringify({ sessionId: auth.sessionId })],
    );
    res.status(204).end();
  } catch (error) {
    req.log.error({ err: error }, "Logout failed");
    res.status(503).json({ error: "Session revocation unavailable" });
  }
});

router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  const auth = res.locals.auth;
  if (!auth) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const result = await pool.query<{
      email: string;
      display_name: string;
      tenant_name: string;
    }>(
      `SELECT u.email, u.display_name, t.name AS tenant_name
       FROM users u JOIN tenants t ON t.tenant_id = u.tenant_id
       WHERE u.tenant_id = $1 AND u.id = $2 AND u.active = TRUE`,
      [auth.tenantId, auth.userId],
    );
    const user = result.rows[0];
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({
      user: { userId: auth.userId, email: user.email, name: user.display_name },
      tenant: { tenantId: auth.tenantId, name: user.tenant_name },
    });
  } catch (error) {
    req.log.error({ err: error }, "Failed to load current user");
    res.status(503).json({ error: "User service unavailable" });
  }
});

router.get(
  "/sessions",
  requireAuth,
  requirePermission("sessions:read"),
  async (req, res): Promise<void> => {
    const auth = res.locals.auth;
    if (!auth) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    try {
      const result = await pool.query<{
        id: string;
        user_id: string;
        display_name: string;
        created_at: Date;
        last_used_at: Date;
        expires_at: Date;
      }>(
        `SELECT s.id, s.user_id, u.display_name, s.created_at, s.last_used_at, s.expires_at
         FROM sessions s
         JOIN users u ON u.tenant_id = s.tenant_id AND u.id = s.user_id
         WHERE s.tenant_id = $1 AND s.revoked_at IS NULL AND s.expires_at > NOW()
         ORDER BY s.last_used_at DESC
         LIMIT 200`,
        [auth.tenantId],
      );
      res.json({
        sessions: result.rows.map((session) => ({
          sessionId: session.id,
          userId: session.user_id,
          userName: session.display_name,
          createdAt: session.created_at,
          lastUsedAt: session.last_used_at,
          expiresAt: session.expires_at,
        })),
      });
    } catch (error) {
      req.log.error({ err: error }, "Tenant session list failed");
      res.status(503).json({ error: "Session service unavailable" });
    }
  },
);

router.post(
  "/sessions/:sessionId/revoke",
  requireAuth,
  requirePermission("sessions:revoke"),
  async (req, res): Promise<void> => {
    const params = revokeSessionParamsSchema.safeParse(req.params);
    const auth = res.locals.auth;
    if (!params.success) {
      res.status(400).json({ error: "Invalid session ID" });
      return;
    }
    if (!auth) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    try {
      const result = await pool.query<{ id: string }>(
        `UPDATE sessions SET revoked_at = NOW()
         WHERE tenant_id = $1 AND id = $2 AND revoked_at IS NULL
         RETURNING id`,
        [auth.tenantId, params.data.sessionId],
      );
      if (!result.rows[0]) {
        res.status(404).json({ error: "Session not found" });
        return;
      }

      const redis = await getRedis();
      await redis
        .multi()
        .set(`auth:revoked:sid:${params.data.sessionId}`, "1", "EX", 7 * 24 * 60 * 60)
        .del(`auth:session:${params.data.sessionId}`)
        .exec();
      await pool.query(
        `INSERT INTO audit_events (id, tenant_id, actor_user_id, event, metadata)
         VALUES ($1, $2, $3, 'session.revoked_by_admin', $4::jsonb)`,
        [
          randomUUID(),
          auth.tenantId,
          auth.userId,
          JSON.stringify({ sessionId: params.data.sessionId }),
        ],
      );
      res.status(204).end();
    } catch (error) {
      req.log.error({ err: error }, "Session revocation failed");
      res.status(503).json({ error: "Session revocation unavailable" });
    }
  },
);

export default router;
