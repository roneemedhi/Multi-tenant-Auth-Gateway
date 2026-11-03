import { createHash } from "node:crypto";
import { jwtVerify } from "jose";
import type { Request, RequestHandler } from "express";
import { pool } from "@workspace/db";
import {
  AUTH_AUDIENCE,
  AUTH_ISSUER,
  type Permission,
} from "../lib/auth-config";
import { getRedis } from "../lib/redis";
import type Redis from "ioredis";

export interface AuthContext {
  tenantId: string;
  userId: string;
  sessionId: string;
  tokenId: string;
  expiresAt: number;
}

const contextFromRequest = async (req: Request): Promise<AuthContext> => {
  const header = req.header("authorization");
  if (!header?.startsWith("Bearer ")) {
    throw Object.assign(new Error("Bearer token required"), { statusCode: 401 });
  }

  const secret = process.env.SESSION_SECRET;
  if (!secret || Buffer.byteLength(secret, "utf8") < 32) {
    throw Object.assign(new Error("Authentication is not configured"), { statusCode: 503 });
  }

  const encoded = header.slice("Bearer ".length).trim();
  const { payload } = await jwtVerify(encoded, new TextEncoder().encode(secret), {
    algorithms: ["HS256"],
    issuer: AUTH_ISSUER,
    audience: AUTH_AUDIENCE,
    clockTolerance: 5,
  });

  const tenantId = typeof payload.tenantId === "string" ? payload.tenantId : "";
  const userId = typeof payload.sub === "string" ? payload.sub : "";
  const sessionId = typeof payload.sid === "string" ? payload.sid : "";
  const tokenId = typeof payload.jti === "string" ? payload.jti : "";
  const expiresAt = typeof payload.exp === "number" ? payload.exp : 0;

  if (!tenantId || !userId || !sessionId || !tokenId || expiresAt <= 0) {
    throw Object.assign(new Error("Invalid token claims"), { statusCode: 401 });
  }

  const redis = await getRedis();
  const [revokedToken, revokedSession, cachedSession] = await Promise.all([
    redis.get(`auth:revoked:jti:${tokenId}`),
    redis.get(`auth:revoked:sid:${sessionId}`),
    redis.get(`auth:session:${sessionId}`),
  ]);

  if (revokedToken || revokedSession || !cachedSession) {
    throw Object.assign(new Error("Session is no longer active"), { statusCode: 401 });
  }

  let session: { tenantId: string; userId: string };
  try {
    session = JSON.parse(cachedSession) as { tenantId: string; userId: string };
  } catch {
    throw Object.assign(new Error("Session cache is invalid"), { statusCode: 401 });
  }

  if (session.tenantId !== tenantId || session.userId !== userId) {
    throw Object.assign(new Error("Session context mismatch"), { statusCode: 401 });
  }

  return { tenantId, userId, sessionId, tokenId, expiresAt };
};

export const requireAuth: RequestHandler = async (req, res, next) => {
  try {
    res.locals.auth = await contextFromRequest(req);
    next();
  } catch (error) {
    const statusCode =
      typeof error === "object" &&
      error !== null &&
      "statusCode" in error &&
      typeof error.statusCode === "number"
        ? error.statusCode
        : error instanceof Error && error.message.includes("Redis")
          ? 503
          : 401;
    if (statusCode >= 500) {
      req.log.error({ err: error }, "Authentication dependency unavailable");
    }
    res.status(statusCode).json({
      error: statusCode === 503 ? "Authentication service unavailable" : "Unauthorized",
    });
  }
};

export function requirePermission(
  permission: Permission,
  attributeRule?: (context: AuthContext, req: Request) => boolean,
): RequestHandler {
  return async (req, res, next) => {
    const auth = res.locals.auth;
    if (!auth) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    try {
      const result = await pool.query(
        `SELECT 1
         FROM memberships m
         JOIN role_permissions rp
           ON rp.tenant_id = m.tenant_id AND rp.role_id = m.role_id
         JOIN users u
           ON u.tenant_id = m.tenant_id AND u.id = m.user_id
         WHERE m.tenant_id = $1 AND m.user_id = $2
           AND rp.permission = $3 AND u.active = TRUE
         LIMIT 1`,
        [auth.tenantId, auth.userId, permission],
      );

      if (result.rowCount !== 1) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }

      if (attributeRule && !attributeRule(auth, req)) {
        res.status(403).json({ error: "Forbidden by access policy" });
        return;
      }

      next();
    } catch (error) {
      req.log.error({ err: error, permission }, "Permission check failed");
      res.status(503).json({ error: "Authorization service unavailable" });
    }
  };
}

export function hashRefreshToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function redisRateLimit(options: {
  keyPrefix: string;
  limit: number;
  windowSeconds: number;
}): RequestHandler {
  return async (req, res, next) => {
    try {
      const redis: Redis = await getRedis();
      const key = `${options.keyPrefix}:${createHash("sha256")
        .update(req.ip || "unknown")
        .digest("hex")}`;
      const count = Number(
        await redis.eval(
          `local current = redis.call('INCR', KEYS[1])
           if current == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end
           return current`,
          1,
          key,
          String(options.windowSeconds),
        ),
      );
      res.setHeader("RateLimit-Limit", String(options.limit));
      res.setHeader("RateLimit-Remaining", String(Math.max(0, options.limit - count)));
      if (count > options.limit) {
        res.status(429).json({ error: "Too many requests" });
        return;
      }
      next();
    } catch (error) {
      req.log.error({ err: error }, "Rate limit service unavailable");
      res.status(503).json({ error: "Authentication service unavailable" });
    }
  };
}
