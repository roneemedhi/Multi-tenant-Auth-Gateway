import { Router, type IRouter } from "express";
import { pool } from "@workspace/db";
import { auditQuerySchema } from "../lib/validation";
import { requireAuth, requirePermission } from "../middlewares/auth";

const router: IRouter = Router();

router.get(
  "/audit/events",
  requireAuth,
  requirePermission("audit:read"),
  async (req, res): Promise<void> => {
    const auth = res.locals.auth;
    const parsed = auditQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid query parameters" });
      return;
    }
    if (!auth) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    try {
      const result = await pool.query<{
        id: string;
        actor_user_id: string | null;
        event: string;
        metadata: Record<string, unknown>;
        created_at: Date;
      }>(
        `SELECT id, actor_user_id, event, metadata, created_at
         FROM audit_events
         WHERE tenant_id = $1
         ORDER BY created_at DESC, id DESC
         LIMIT $2`,
        [auth.tenantId, parsed.data.limit],
      );
      res.json({
        events: result.rows.map((event) => ({
          eventId: event.id,
          actorUserId: event.actor_user_id,
          event: event.event,
          metadata: event.metadata,
          createdAt: event.created_at,
        })),
      });
    } catch (error) {
      req.log.error({ err: error }, "Audit event lookup failed");
      res.status(503).json({ error: "Audit service unavailable" });
    }
  },
);

export default router;
