import {
  BUILT_IN_ROLE_PERMISSIONS,
  BUILT_IN_ROLES,
  canGrantPermissions,
  customRoleLimit,
  isTenantScoped,
  normalizeEmail,
  slugify,
} from "./auth-config";

describe("tenant authorization policy", () => {
  it("allows access only when actor and resource tenants match", () => {
    expect(isTenantScoped("tenant-a", "tenant-a")).toBe(true);
    expect(isTenantScoped("tenant-a", "tenant-b")).toBe(false);
  });

  it("enforces the Free custom-role cap and leaves Premium uncapped", () => {
    expect(customRoleLimit("free")).toBe(3);
    expect(customRoleLimit("premium")).toBe(Number.POSITIVE_INFINITY);
    expect(customRoleLimit("unknown")).toBe(3);
  });

  it("defines the requested built-in roles with least-privilege defaults", () => {
    expect(BUILT_IN_ROLES).toEqual(["Owner", "Admin", "Editor", "Viewer"]);
    expect(BUILT_IN_ROLE_PERMISSIONS.Viewer).not.toContain("resources:write");
    expect(BUILT_IN_ROLE_PERMISSIONS.Editor).toContain("resources:write");
    expect(BUILT_IN_ROLE_PERMISSIONS.Owner).toContain("sessions:revoke");
    expect(BUILT_IN_ROLE_PERMISSIONS.Owner).toContain("tenant:manage");
    expect(BUILT_IN_ROLE_PERMISSIONS.Admin).not.toContain("tenant:manage");
  });

  it("prevents users from granting permissions they do not hold", () => {
    expect(canGrantPermissions(["roles:create", "roles:read"], ["roles:read"])).toBe(true);
    expect(canGrantPermissions(["roles:create"], ["sessions:revoke"])).toBe(false);
  });

  it("normalizes tenant identities consistently", () => {
    expect(normalizeEmail("  USER@Example.COM ")).toBe("user@example.com");
    expect(slugify("Northwind Research & Design")).toBe("northwind-research-design");
  });
});
