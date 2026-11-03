import { randomBytes, randomUUID } from "node:crypto";
import { SignJWT } from "jose";
import { pool } from "@workspace/db";
import {
  ACCESS_TOKEN_TTL_SECONDS,
  AUTH_AUDIENCE,
  AUTH_ISSUER,
  SESSION_TTL_SECONDS,
} from "./auth-config";
import { getRedis } from "./redis";
import { hashRefreshToken } from "../middlewares/auth";

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
  sessionExpiresAt: string;
}

export async function createSession(
  tenantId: string,
  userId: string,
): Promise<TokenPair> {
  const secret = process.env.SESSION_SECRET;
  if (!secret || Buffer.byteLength(secret, "utf8") < 32) {
    throw new Error("SESSION_SECRET must contain at least 32 bytes");
  }

  const redis = await getRedis();
  const sessionId = randomUUID();
  const refreshToken = randomBytes(48).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);

  await pool.query(
    `INSERT INTO sessions (id, tenant_id, user_id, refresh_token_hash, expires_at, last_used_at)
     VALUES ($1, $2, $3, $4, $5, NOW())`,
    [sessionId, tenantId, userId, hashRefreshToken(refreshToken), expiresAt],
  );

  try {
    await redis.set(
      `auth:session:${sessionId}`,
      JSON.stringify({ tenantId, userId }),
      "EX",
      SESSION_TTL_SECONDS,
    );
  } catch (error) {
    await pool.query(
      "UPDATE sessions SET revoked_at = NOW() WHERE tenant_id = $1 AND id = $2",
      [tenantId, sessionId],
    );
    throw error;
  }

  const accessToken = await new SignJWT({ tenantId, sid: sessionId })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuer(AUTH_ISSUER)
    .setAudience(AUTH_AUDIENCE)
    .setSubject(userId)
    .setJti(randomUUID())
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TOKEN_TTL_SECONDS}s`)
    .sign(new TextEncoder().encode(secret));

  return {
    accessToken,
    refreshToken,
    accessTokenExpiresIn: ACCESS_TOKEN_TTL_SECONDS,
    sessionExpiresAt: expiresAt.toISOString(),
  };
}

export async function rotateSession(refreshToken: string): Promise<TokenPair | null> {
  const secret = process.env.SESSION_SECRET;
  if (!secret || Buffer.byteLength(secret, "utf8") < 32) {
    throw new Error("SESSION_SECRET must contain at least 32 bytes");
  }

  const redis = await getRedis();
  const previousHash = hashRefreshToken(refreshToken);
  const replacement = randomBytes(48).toString("base64url");
  const nextExpiry = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);

  const result = await pool.query<{
    id: string;
    tenant_id: string;
    user_id: string;
  }>(
    `UPDATE sessions s
     SET refresh_token_hash = $1, expires_at = $2, last_used_at = NOW()
     FROM users u
     WHERE s.tenant_id = u.tenant_id AND s.user_id = u.id
       AND s.refresh_token_hash = $3
       AND s.revoked_at IS NULL AND s.expires_at > NOW()
       AND u.active = TRUE
     RETURNING s.id, s.tenant_id, s.user_id`,
    [hashRefreshToken(replacement), nextExpiry, previousHash],
  );

  const session = result.rows[0];
  if (!session) return null;

  await redis.set(
    `auth:session:${session.id}`,
    JSON.stringify({ tenantId: session.tenant_id, userId: session.user_id }),
    "EX",
    SESSION_TTL_SECONDS,
  );

  const accessToken = await new SignJWT({
    tenantId: session.tenant_id,
    sid: session.id,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuer(AUTH_ISSUER)
    .setAudience(AUTH_AUDIENCE)
    .setSubject(session.user_id)
    .setJti(randomUUID())
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TOKEN_TTL_SECONDS}s`)
    .sign(new TextEncoder().encode(secret));

  return {
    accessToken,
    refreshToken: replacement,
    accessTokenExpiresIn: ACCESS_TOKEN_TTL_SECONDS,
    sessionExpiresAt: nextExpiry.toISOString(),
  };
}
