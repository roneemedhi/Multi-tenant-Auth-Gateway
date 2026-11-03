# Tenant Auth Gateway

A tenant-isolated B2B authentication and authorization API with JWT sessions, RBAC/ABAC middleware, and tier-aware custom role limits.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-server run test` — run Jest unit tests
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required configuration: Replit PostgreSQL (`DATABASE_URL`), `SESSION_SECRET` (at least 32 bytes), and `REDIS_URL`
- Optional configuration: `ALLOWED_ORIGINS` — comma-separated browser origins allowed to call the API
- Stripe subscription synchronization is not configured. The Stripe integration and credentials were declined; tenants remain on the Free tier until billing synchronization is connected.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod v4
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/api-server/src/routes/` — authentication, tenant, role, and audit endpoints
- `artifacts/api-server/src/middlewares/auth.ts` — JWT session validation and permission/attribute checks
- `artifacts/api-server/src/lib/` — token, Redis, tier policy, and request validation
- `lib/db/src/schema/auth.ts` — tenant-owned PostgreSQL tables
- `lib/api-spec/openapi.yaml` — API contract and `/docs` Swagger UI source

## Architecture decisions

- Authentication identity comes from signed JWT claims; tenant IDs are never trusted from client-supplied headers.
- Every application table has a `tenant_id`; all list, update, and revoke queries include the authenticated tenant.
- Access tokens last 15 minutes. Refresh tokens rotate and extend a session up to seven days; refresh token hashes are stored in PostgreSQL.
- Redis is required for rate limiting, active-session caching, and token/session revocation. Auth routes fail closed when Redis is unavailable.
- Built-in roles are provisioned per tenant. The Free plan allows three additional custom roles; Premium is uncapped. Billing does not yet update a tenant plan automatically.

## Product

- Register tenant owner accounts and authenticate users within a tenant.
- Rotate refresh tokens, log out, and revoke individual sessions.
- Enforce tenant-scoped role permissions and inspect users, roles, tenant details, and audit events.
- Browse the interactive API contract at `/docs`; check service dependencies at `/api/readyz`.

## User preferences

- The user requested a production-oriented multi-tenant B2B authentication and authorization gateway.

## Gotchas

- Configure `REDIS_URL` and a 32-byte-or-longer `SESSION_SECRET` before using authentication routes.
- Configure `ALLOWED_ORIGINS` for browser clients; cross-origin requests are denied unless explicitly allowed.
- Tier limits are enforced, but a connected Stripe billing flow is still required to upgrade tenant plans automatically.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
