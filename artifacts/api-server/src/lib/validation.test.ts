import {
  auditQuerySchema,
  createRoleBodySchema,
  loginBodySchema,
  refreshBodySchema,
  registerBodySchema,
  revokeSessionParamsSchema,
} from "./validation";

describe("request validation", () => {
  it("requires long passwords and rejects unexpected registration fields", () => {
    const valid = {
      tenantName: "Northwind",
      name: "Morgan User",
      email: "morgan@example.com",
      password: "a-secure-password-123",
    };
    expect(registerBodySchema.safeParse(valid).success).toBe(true);
    expect(registerBodySchema.safeParse({ ...valid, password: "short" }).success).toBe(false);
    expect(registerBodySchema.safeParse({ ...valid, admin: true }).success).toBe(false);
  });

  it("requires the tenant slug as part of login", () => {
    expect(
      loginBodySchema.safeParse({
        tenantSlug: "northwind-123",
        email: "morgan@example.com",
        password: "correct horse battery staple",
      }).success,
    ).toBe(true);
    expect(
      loginBodySchema.safeParse({
        email: "morgan@example.com",
        password: "correct horse battery staple",
      }).success,
    ).toBe(false);
  });

  it("rejects malformed refresh tokens and session IDs", () => {
    expect(refreshBodySchema.safeParse({ refreshToken: "x".repeat(48) }).success).toBe(true);
    expect(refreshBodySchema.safeParse({ refreshToken: "short" }).success).toBe(false);
    expect(revokeSessionParamsSchema.safeParse({ sessionId: "not-a-uuid" }).success).toBe(false);
  });

  it("accepts only known permissions on custom roles", () => {
    expect(
      createRoleBodySchema.safeParse({
        name: "Analyst",
        permissions: ["resources:read"],
      }).success,
    ).toBe(true);
    expect(
      createRoleBodySchema.safeParse({
        name: "Escalated",
        permissions: ["superuser:all"],
      }).success,
    ).toBe(false);
  });

  it("bounds audit pagination and supplies a safe default", () => {
    expect(auditQuerySchema.parse({})).toEqual({ limit: 50 });
    expect(auditQuerySchema.parse({ limit: "100" })).toEqual({ limit: 100 });
    expect(auditQuerySchema.safeParse({ limit: "1000" }).success).toBe(false);
  });
});
