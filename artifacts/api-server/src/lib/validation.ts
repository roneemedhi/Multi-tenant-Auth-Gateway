import {
  AssignTenantUserRoleBody,
  AssignTenantUserRoleParams,
  CreateTenantRoleBody,
  CreateTenantUserBody,
  ListAuditEventsQueryParams,
  LoginBody,
  RefreshSessionBody,
  RegisterTenantBody,
  RevokeTenantSessionParams,
} from "@workspace/api-zod";
import { z } from "zod/v4";

export const registerBodySchema = RegisterTenantBody.strict();
export const loginBodySchema = LoginBody.strict();
export const refreshBodySchema = RefreshSessionBody.strict();
export const createRoleBodySchema = CreateTenantRoleBody.strict();
export const createUserBodySchema = CreateTenantUserBody.strict();
export const assignRoleBodySchema = AssignTenantUserRoleBody.strict();
export const assignUserParamsSchema = AssignTenantUserRoleParams.strict();
export const revokeSessionParamsSchema = RevokeTenantSessionParams.strict();
export const auditQuerySchema = ListAuditEventsQueryParams.strict();
