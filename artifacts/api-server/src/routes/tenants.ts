import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { Router, type IRouter } from "express";
import { CreateTenantUserResponse } from "@workspace/api-zod";
import { pool } from "@workspace/db";
import { normalizeEmail } from "../lib/auth-config";
import {
  assignRoleBodySchema,
  assignUserParamsSchema,
  createUserBodySchema,
} from "../lib/validation";
import { requireAuth, requirePermission } from "../middlewares/auth";

const router: IRouter = Router();

router.get(
  "/tenants/me",
  requireAuth,
  requirePermission("tenant:read"),
  async (req, res): Promise<void> => {
    const auth = res.locals.auth;
    if (!auth) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    try {
      const result = await pool.query<{
        tenant_id: string;
        name: string;
        slug: string;
        plan: string;
        created_at: Date;
      }>(
        `SELECT tenant_id, name, slug, plan, created_at
         FROM tenants WHERE tenant_id = $1`,
        [auth.tenantId],
      );
      const tenant = result.rows[0];
      if (!tenant) {
        res.status(404).json({ error: "Tenant not found" });
        return;
      }
      res.json({
        tenantId: tenant.tenant_id,
        name: tenant.name,
        slug: tenant.slug,
        plan: tenant.plan,
        createdAt: tenant.created_at,
      });
    } catch (error) {
      req.log.error({ err: error }, "Tenant lookup failed");
      res.status(503).json({ error: "Tenant service unavailable" });
    }
  },
);

router.post(
  "/users",
  requireAuth,
  requirePermission("users:manage"),
  async (req, res): Promise<void> => {
    const auth = res.locals.auth;
    const parsed = createUserBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid user", details: parsed.error.flatten() });
      return;
    }
    const name = parsed.data.name.trim();
    if (!name) {
      res.status(400).json({ error: "User name cannot be blank" });
      return;
    }
    if (!auth) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    try {
      const role = await pool.query<{ id: string; name: string }>(
        `SELECT id, name FROM roles WHERE tenant_id = $1 AND id = $2`,
        [auth.tenantId, parsed.data.roleId],
      );
      if (!role.rows[0]) {
        res.status(404).json({ error: "Role not found" });
        return;
      }
      const [actorPermissions, targetPermissions] = await Promise.all([
        pool.query<{ permission: string }>(
          `SELECT DISTINCT rp.permission
           FROM memberships m
           JOIN role_permissions rp
             ON rp.tenant_id = m.tenant_id AND rp.role_id = m.role_id
           WHERE m.tenant_id = $1 AND m.user_id = $2`,
          [auth.tenantId, auth.userId],
        ),
        pool.query<{ permission: string }>(
          `SELECT permission FROM role_permissions
           WHERE tenant_id = $1 AND role_id = $2`,
          [auth.tenantId, parsed.data.roleId],
        ),
      ]);
      const actorSet = new Set(actorPermissions.rows.map((row) => row.permission));
      if (targetPermissions.rows.some((row) => !actorSet.has(row.permission))) {
        res.status(403).json({ error: "Cannot assign a role with permissions you do not hold" });
        return;
      }

      const userId = randomUUID();
      const email = normalizeEmail(parsed.data.email);
      const passwordHash = await bcrypt.hash(parsed.data.password, 12);
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        await client.query(
          `INSERT INTO users (id, tenant_id, email, password_hash, display_name)
           VALUES ($1, $2, $3, $4, $5)`,
          [userId, auth.tenantId, email, passwordHash, name],
        );
        await client.query(
          `INSERT INTO memberships (id, tenant_id, user_id, role_id)
           VALUES ($1, $2, $3, $4)`,
          [randomUUID(), auth.tenantId, userId, parsed.data.roleId],
        );
        await client.query(
          `INSERT INTO audit_events (id, tenant_id, actor_user_id, event, metadata)
           VALUES ($1, $2, $3, 'user.created', $4::jsonb)`,
          [
            randomUUID(),
            auth.tenantId,
            auth.userId,
            JSON.stringify({ userId, roleId: parsed.data.roleId }),
          ],
        );
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }

      res.status(201).json(CreateTenantUserResponse.parse({
        user: {
          userId,
          email,
          name,
          active: true,
          roles: [role.rows[0].name],
        },
      }));
    } catch (error) {
      req.log.error({ err: error }, "Tenant user creation failed");
      if (typeof error === "object" && error !== null && "code" in error && error.code === "23505") {
        res.status(409).json({ error: "A user with this email already exists in the tenant" });
        return;
      }
      res.status(503).json({ error: "User service unavailable" });
    }
  },
);

router.get(
  "/users",
  requireAuth,
  requirePermission("users:read"),
  async (req, res): Promise<void> => {
    const auth = res.locals.auth;
    if (!auth) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    try {
      const result = await pool.query<{
        id: string;
        email: string;
        display_name: string;
        active: boolean;
        role_names: string[];
        created_at: Date;
      }>(
        `SELECT u.id, u.email, u.display_name, u.active, u.created_at,
                COALESCE(array_agg(DISTINCT r.name) FILTER (WHERE r.id IS NOT NULL), '{}') AS role_names
         FROM users u
         LEFT JOIN memberships m ON m.tenant_id = u.tenant_id AND m.user_id = u.id
         LEFT JOIN roles r ON r.tenant_id = m.tenant_id AND r.id = m.role_id
         WHERE u.tenant_id = $1
         GROUP BY u.id
         ORDER BY u.created_at DESC
         LIMIT 250`,
        [auth.tenantId],
      );
      res.json({
        users: result.rows.map((user) => ({
          userId: user.id,
          email: user.email,
          name: user.display_name,
          active: user.active,
          roles: user.role_names,
          createdAt: user.created_at,
        })),
      });
    } catch (error) {
      req.log.error({ err: error }, "Tenant user list failed");
      res.status(503).json({ error: "User service unavailable" });
    }
  },
);

router.patch(
  "/users/:userId/role",
  requireAuth,
  requirePermission("users:manage"),
  async (req, res): Promise<void> => {
    const auth = res.locals.auth;
    const params = assignUserParamsSchema.safeParse(req.params);
    const parsed = assignRoleBodySchema.safeParse(req.body);
    if (!params.success || !parsed.success) {
      res.status(400).json({ error: "Invalid user or role ID" });
      return;
    }
    if (!auth) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    try {
      const [targetUser, targetRole] = await Promise.all([
        pool.query<{ id: string }>(
          "SELECT id FROM users WHERE tenant_id = $1 AND id = $2",
          [auth.tenantId, params.data.userId],
        ),
        pool.query<{ id: string }>(
          "SELECT id FROM roles WHERE tenant_id = $1 AND id = $2",
          [auth.tenantId, parsed.data.roleId],
        ),
      ]);
      if (!targetUser.rows[0] || !targetRole.rows[0]) {
        res.status(404).json({ error: "User or role not found in this tenant" });
        return;
      }

      const [actorPermissions, rolePermissions] = await Promise.all([
        pool.query<{ permission: string }>(
          `SELECT DISTINCT rp.permission
           FROM memberships m
           JOIN role_permissions rp
             ON rp.tenant_id = m.tenant_id AND rp.role_id = m.role_id
           WHERE m.tenant_id = $1 AND m.user_id = $2`,
          [auth.tenantId, auth.userId],
        ),
        pool.query<{ permission: string }>(
          "SELECT permission FROM role_permissions WHERE tenant_id = $1 AND role_id = $2",
          [auth.tenantId, parsed.data.roleId],
        ),
      ]);
      const actorSet = new Set(actorPermissions.rows.map((row) => row.permission));
      if (rolePermissions.rows.some((row) => !actorSet.has(row.permission))) {
        res.status(403).json({ error: "Cannot assign a role with permissions you do not hold" });
        return;
      }

      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        await client.query(
          "DELETE FROM memberships WHERE tenant_id = $1 AND user_id = $2",
          [auth.tenantId, params.data.userId],
        );
        await client.query(
          `INSERT INTO memberships (id, tenant_id, user_id, role_id)
           VALUES ($1, $2, $3, $4)`,
          [randomUUID(), auth.tenantId, params.data.userId, parsed.data.roleId],
        );
        await client.query(
          `INSERT INTO audit_events (id, tenant_id, actor_user_id, event, metadata)
           VALUES ($1, $2, $3, 'user.role_changed', $4::jsonb)`,
          [
            randomUUID(),
            auth.tenantId,
            auth.userId,
            JSON.stringify({ userId: params.data.userId, roleId: parsed.data.roleId }),
          ],
        );
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
      res.status(204).end();
    } catch (error) {
      req.log.error({ err: error }, "Tenant role assignment failed");
      res.status(503).json({ error: "User service unavailable" });
    }
  },
);

export default router;
