import { z } from "zod/v4";
import { PERMISSIONS } from "./auth-config";

export const registerBodySchema = z
  .object({
    tenantName: z.string().trim().min(2).max(120),
    name: z.string().trim().min(1).max(120),
    email: z.email().max(254),
    password: z.string().min(12).max(128),
  })
  .strict();

export const loginBodySchema = z
  .object({
    tenantSlug: z.string().trim().min(1).max(64),
    email: z.email().max(254),
    password: z.string().min(1).max(128),
  })
  .strict();

export const refreshBodySchema = z
  .object({
    refreshToken: z.string().min(32).max(256),
  })
  .strict();

export const createRoleBodySchema = z
  .object({
    name: z.string().trim().min(2).max(64),
    permissions: z.array(z.enum(PERMISSIONS)).max(PERMISSIONS.length).default([]),
  })
  .strict();

export const revokeSessionParamsSchema = z.object({ sessionId: z.uuid() });

export const auditQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
});
