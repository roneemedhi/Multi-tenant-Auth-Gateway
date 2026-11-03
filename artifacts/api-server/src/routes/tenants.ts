import { Router, type IRouter } from "express";
import { pool } from "@workspace/db";
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

export default router;
