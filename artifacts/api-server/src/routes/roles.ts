import { randomUUID } from "node:crypto";
import { Router, type IRouter } from "express";
import { pool } from "@workspace/db";
import {
  canGrantPermissions,
  customRoleLimit,
  PERMISSIONS,
  slugify,
  type Permission,
} from "../lib/auth-config";
import { createRoleBodySchema } from "../lib/validation";
import { requireAuth, requirePermission } from "../middlewares/auth";

const router: IRouter = Router();

router.get(
  "/roles",
  requireAuth,
  requirePermission("roles:read"),
  async (req, res): Promise<void> => {
    const auth = res.locals.auth;
    if (!auth) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    try {
      const result = await pool.query<{
        id: string;
        name: string;
        slug: string;
        is_system: boolean;
        permissions: Permission[];
      }>(
        `SELECT r.id, r.name, r.slug, r.is_system,
                COALESCE(array_agg(rp.permission) FILTER (WHERE rp.permission IS NOT NULL), '{}') AS permissions
         FROM roles r
         LEFT JOIN role_permissions rp
           ON rp.tenant_id = r.tenant_id AND rp.role_id = r.id
         WHERE r.tenant_id = $1
         GROUP BY r.id
         ORDER BY r.is_system DESC, r.name ASC`,
        [auth.tenantId],
      );
      res.json({
        roles: result.rows.map((role) => ({
          roleId: role.id,
          name: role.name,
          slug: role.slug,
          builtIn: role.is_system,
          permissions: role.permissions,
        })),
      });
    } catch (error) {
      req.log.error({ err: error }, "Role list failed");
      res.status(503).json({ error: "Role service unavailable" });
    }
  },
);

router.post(
  "/roles",
  requireAuth,
  requirePermission("roles:create"),
  async (req, res): Promise<void> => {
    const auth = res.locals.auth;
    const parsed = createRoleBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid role", details: parsed.error.flatten() });
      return;
    }
    if (!auth) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const name = parsed.data.name;
    const slug = slugify(name);
    if (!slug || ["owner", "admin", "editor", "viewer"].includes(slug)) {
      res.status(400).json({ error: "Role name is reserved or invalid" });
      return;
    }

    try {
      const client = await pool.connect();
      let createdRoleId = "";
      try {
        await client.query("BEGIN");
        const tenant = await client.query<{ plan: string }>(
          `SELECT plan FROM tenants WHERE tenant_id = $1 FOR UPDATE`,
          [auth.tenantId],
        );
        if (!tenant.rows[0]) {
          await client.query("ROLLBACK");
          res.status(404).json({ error: "Tenant not found" });
          return;
        }

        const countResult = await client.query<{ count: string }>(
          `SELECT COUNT(*)::text AS count
           FROM roles WHERE tenant_id = $1 AND is_system = FALSE`,
          [auth.tenantId],
        );
        const count = Number(countResult.rows[0]?.count ?? "0");
        if (count >= customRoleLimit(tenant.rows[0].plan)) {
          await client.query("ROLLBACK");
          res.status(402).json({
            error: "Free tier role limit reached",
            limit: customRoleLimit(tenant.rows[0].plan),
            plan: tenant.rows[0].plan,
            upgradeRequired: true,
          });
          return;
        }

        const callerPermissions = await client.query<{ permission: Permission }>(
          `SELECT DISTINCT rp.permission
           FROM memberships m
           JOIN role_permissions rp
             ON rp.tenant_id = m.tenant_id AND rp.role_id = m.role_id
           WHERE m.tenant_id = $1 AND m.user_id = $2`,
          [auth.tenantId, auth.userId],
        );
        if (
          !canGrantPermissions(
            callerPermissions.rows.map((row) => row.permission),
            parsed.data.permissions,
          )
        ) {
          await client.query("ROLLBACK");
          res.status(403).json({ error: "Cannot grant permissions you do not hold" });
          return;
        }

        createdRoleId = randomUUID();
        await client.query(
          `INSERT INTO roles (id, tenant_id, name, slug, is_system)
           VALUES ($1, $2, $3, $4, FALSE)`,
          [createdRoleId, auth.tenantId, name, slug],
        );
        for (const permission of parsed.data.permissions) {
          await client.query(
            `INSERT INTO role_permissions (id, tenant_id, role_id, permission)
             VALUES ($1, $2, $3, $4)`,
            [randomUUID(), auth.tenantId, createdRoleId, permission],
          );
        }
        await client.query(
          `INSERT INTO audit_events (id, tenant_id, actor_user_id, event, metadata)
           VALUES ($1, $2, $3, 'role.created', $4::jsonb)`,
          [
            randomUUID(),
            auth.tenantId,
            auth.userId,
            JSON.stringify({ roleId: createdRoleId, slug }),
          ],
        );
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }

      res.status(201).json({
        role: {
          roleId: createdRoleId,
          name,
          slug,
          builtIn: false,
          permissions: parsed.data.permissions,
        },
      });
    } catch (error) {
      req.log.error({ err: error }, "Role creation failed");
      if (typeof error === "object" && error !== null && "code" in error && error.code === "23505") {
        res.status(409).json({ error: "A role with this name already exists" });
        return;
      }
      res.status(503).json({ error: "Role service unavailable" });
    }
  },
);

export default router;
