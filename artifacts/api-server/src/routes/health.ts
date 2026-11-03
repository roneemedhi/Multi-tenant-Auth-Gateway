import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import { pool } from "@workspace/db";
import { getRedis, redisConfigured } from "../lib/redis";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

router.get("/readyz", async (_req, res): Promise<void> => {
  const checks: Record<string, boolean> = {
    sessionSecret:
      typeof process.env.SESSION_SECRET === "string" &&
      Buffer.byteLength(process.env.SESSION_SECRET, "utf8") >= 32,
    redisConfigured: redisConfigured(),
    database: false,
    redis: false,
  };

  try {
    await pool.query("SELECT 1");
    checks.database = true;
  } catch {
    checks.database = false;
  }

  if (checks.redisConfigured) {
    try {
      const redis = await getRedis();
      checks.redis = (await redis.ping()) === "PONG";
    } catch {
      checks.redis = false;
    }
  }

  const ready = Object.values(checks).every(Boolean);
  res.status(ready ? 200 : 503).json({
    status: ready ? "ready" : "not_ready",
    checks,
  });
});

export default router;
