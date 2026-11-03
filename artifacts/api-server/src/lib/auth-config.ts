export const AUTH_ISSUER = "tenant-auth-gateway";
export const AUTH_AUDIENCE = "tenant-api";
export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
export const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;
export const FREE_CUSTOM_ROLE_LIMIT = 3;
export const BUILT_IN_ROLES = ["Owner", "Admin", "Editor", "Viewer"] as const;

export const PERMISSIONS = [
  "tenant:read",
  "users:read",
  "users:manage",
  "roles:read",
  "roles:create",
  "roles:manage",
  "resources:read",
  "resources:write",
  "audit:read",
  "sessions:revoke",
] as const;

export type Permission = (typeof PERMISSIONS)[number];
export type BuiltInRole = (typeof BUILT_IN_ROLES)[number];

export const BUILT_IN_ROLE_PERMISSIONS: Record<BuiltInRole, readonly Permission[]> = {
  Owner: PERMISSIONS,
  Admin: [
    "tenant:read",
    "users:read",
    "users:manage",
    "roles:read",
    "roles:create",
    "roles:manage",
    "resources:read",
    "resources:write",
    "audit:read",
    "sessions:revoke",
  ],
  Editor: ["tenant:read", "roles:read", "resources:read", "resources:write"],
  Viewer: ["tenant:read", "roles:read", "resources:read"],
};

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

export function customRoleLimit(plan: string): number {
  return plan === "premium" ? Number.POSITIVE_INFINITY : FREE_CUSTOM_ROLE_LIMIT;
}

export function canGrantPermissions(
  actorPermissions: readonly Permission[],
  requestedPermissions: readonly Permission[],
): boolean {
  const grantable = new Set(actorPermissions);
  return requestedPermissions.every((permission) => grantable.has(permission));
}

export function isTenantScoped(
  actorTenantId: string,
  resourceTenantId: string,
): boolean {
  return actorTenantId === resourceTenantId;
}
