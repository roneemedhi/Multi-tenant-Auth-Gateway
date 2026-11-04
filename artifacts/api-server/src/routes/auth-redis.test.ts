import { jest } from "@jest/globals";
import bcrypt from "bcryptjs";
import express from "express";
import pinoHttp from "pino-http";
import request from "supertest";

type StoredSession = {
  id: string;
  tenantId: string;
  userId: string;
  refreshTokenHash: string;
  revoked: boolean;
};

const user = {
  id: "123e4567-e89b-12d3-a456-426614174001",
  tenant_id: "123e4567-e89b-12d3-a456-426614174002",
  email: "owner@example.com",
  display_name: "Tenant Owner",
  password_hash: "",
};

const sessions = new Map<string, StoredSession>();
const query = jest.fn(async (sql: string, values: unknown[] = []) => {
  if (sql.includes("FROM users u") && sql.includes("JOIN tenants t")) {
    return { rows: [{ ...user, tenant_name: "Test Tenant" }], rowCount: 1 };
  }

  if (sql.includes("FROM memberships m")) {
    return { rows: [{ "?column?": 1 }], rowCount: 1 };
  }

  if (sql.includes("INSERT INTO sessions")) {
    const [id, tenantId, userId, refreshTokenHash] = values as string[];
    sessions.set(id, { id, tenantId, userId, refreshTokenHash, revoked: false });
    return { rows: [], rowCount: 1 };
  }

  if (sql.includes("UPDATE sessions s")) {
    const [nextHash, , previousHash] = values as string[];
    const session = [...sessions.values()].find(
      (item) => item.refreshTokenHash === previousHash && !item.revoked,
    );
    if (!session) return { rows: [], rowCount: 0 };
    session.refreshTokenHash = nextHash;
    return {
      rows: [{ id: session.id, tenant_id: session.tenantId, user_id: session.userId }],
      rowCount: 1,
    };
  }

  if (sql.includes("UPDATE sessions SET revoked_at") && sql.includes("RETURNING id")) {
    const session = sessions.get(String(values[1]));
    if (!session || session.tenantId !== values[0] || session.revoked) {
      return { rows: [], rowCount: 0 };
    }
    session.revoked = true;
    return { rows: [{ id: session.id }], rowCount: 1 };
  }

  if (sql.includes("UPDATE sessions SET revoked_at")) {
    const session = sessions.get(String(values[2]));
    if (!session || session.tenantId !== values[0] || session.userId !== values[1]) {
      return { rows: [], rowCount: 0 };
    }
    session.revoked = true;
    return { rows: [], rowCount: 1 };
  }

  if (sql.includes("SELECT 1")) return { rows: [{ "?column?": 1 }], rowCount: 1 };
  if (sql.includes("INSERT INTO audit_events")) return { rows: [], rowCount: 1 };

  throw new Error(`Unexpected test database query: ${sql}`);
});

class TestRedis {
  status = "wait";
  private readonly values = new Map<string, string>();
  private readonly counters = new Map<string, number>();

  constructor(_url: string, _options?: unknown) {}

  on(): this {
    return this;
  }

  async connect(): Promise<void> {
    this.status = "ready";
  }

  async ping(): Promise<string> {
    return "PONG";
  }

  async get(key: string): Promise<string | null> {
    return this.values.get(key) ?? null;
  }

  async set(key: string, value: string, ..._options: unknown[]): Promise<string> {
    this.values.set(key, value);
    return "OK";
  }

  async del(key: string): Promise<number> {
    return Number(this.values.delete(key));
  }

  async eval(_script: string, _keyCount: number, key: string): Promise<number> {
    const next = (this.counters.get(key) ?? 0) + 1;
    this.counters.set(key, next);
    return next;
  }

  multi(): {
    set: (key: string, value: string, ...options: unknown[]) => ReturnType<TestRedis["multi"]>;
    del: (key: string) => ReturnType<TestRedis["multi"]>;
    exec: () => Promise<unknown[]>;
  } {
    const operations: Array<() => Promise<unknown>> = [];
    const transaction = {
      set: (key: string, value: string, ...options: unknown[]) => {
        operations.push(() => this.set(key, value, ...options));
        return transaction;
      },
      del: (key: string) => {
        operations.push(() => this.del(key));
        return transaction;
      },
      exec: async () => Promise.all(operations.map((operation) => operation())),
    };
    return transaction;
  }

  clear(): void {
    this.values.clear();
    this.counters.clear();
  }
}

let redis: TestRedis;

process.env.REDIS_URL = "redis://test-only.invalid";
process.env.SESSION_SECRET = "test-session-secret-with-at-least-32-bytes";
process.env.DATABASE_URL = "postgres://test:test@localhost/test";

jest.unstable_mockModule("@workspace/db", () => ({
  pool: { query },
}));
jest.unstable_mockModule("ioredis", () => ({
  default: class extends TestRedis {
    constructor(url: string, options?: unknown) {
      super(url, options);
      redis = this;
    }
  },
}));

const { default: authRouter } = await import("./auth");
const { default: healthRouter } = await import("./health");

const buildApp = (router: express.Router): express.Express => {
  const app = express();
  app.use(express.json());
  app.use(pinoHttp({ quietReqLogger: true }));
  app.use(router);
  return app;
};

const authApp = buildApp(authRouter);
const healthApp = buildApp(healthRouter);

describe("Redis-backed authentication flows", () => {
  beforeEach(async () => {
    sessions.clear();
    query.mockClear();
    user.password_hash = await bcrypt.hash("correct horse battery staple", 4);
    redis.clear();
  });

  it("reports the live test Redis connection in readiness", async () => {
    const response = await request(healthApp).get("/readyz");

    expect(response.status).toBe(200);
    expect(response.body.checks).toMatchObject({
      sessionSecret: true,
      redisConfigured: true,
      database: true,
      redis: true,
    });
  });

  it("logs in and rotates refresh tokens exactly once", async () => {
    const login = await request(authApp).post("/auth/login").send({
      tenantSlug: "test-tenant",
      email: user.email,
      password: "correct horse battery staple",
    });

    expect(login.status).toBe(200);
    expect(login.body.sessionId).toBeTruthy();
    expect(await redis.get(`auth:session:${login.body.sessionId}`)).toBe(
      JSON.stringify({ tenantId: user.tenant_id, userId: user.id }),
    );

    const refresh = await request(authApp).post("/auth/refresh").send({
      refreshToken: login.body.refreshToken,
    });
    expect(refresh.status).toBe(200);
    expect(refresh.body.sessionId).toBe(login.body.sessionId);
    expect(refresh.body.refreshToken).not.toBe(login.body.refreshToken);

    const replay = await request(authApp).post("/auth/refresh").send({
      refreshToken: login.body.refreshToken,
    });
    expect(replay.status).toBe(401);

    const currentUser = await request(authApp)
      .get("/auth/me")
      .set("Authorization", `Bearer ${refresh.body.accessToken}`);
    expect(currentUser.status).toBe(200);
  });

  it("revokes sessions immediately on logout and administrator action", async () => {
    const login = async () =>
      request(authApp).post("/auth/login").send({
        tenantSlug: "test-tenant",
        email: user.email,
        password: "correct horse battery staple",
      });

    const selfSession = await login();
    const logout = await request(authApp)
      .post("/auth/logout")
      .set("Authorization", `Bearer ${selfSession.body.accessToken}`);
    expect(logout.status).toBe(204);

    const afterLogout = await request(authApp)
      .get("/auth/me")
      .set("Authorization", `Bearer ${selfSession.body.accessToken}`);
    expect(afterLogout.status).toBe(401);

    const adminSession = await login();
    const revoke = await request(authApp)
      .post(`/sessions/${adminSession.body.sessionId}/revoke`)
      .set("Authorization", `Bearer ${adminSession.body.accessToken}`);
    expect(revoke.status).toBe(204);

    const afterAdminRevoke = await request(authApp)
      .get("/auth/me")
      .set("Authorization", `Bearer ${adminSession.body.accessToken}`);
    expect(afterAdminRevoke.status).toBe(401);
  });
});
