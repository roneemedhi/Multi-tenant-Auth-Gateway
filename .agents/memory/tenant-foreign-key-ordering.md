---
name: Tenant foreign-key migration ordering
description: A Drizzle Kit push constraint-ordering caveat encountered while tightening tenant isolation.
---

**Rule:** Do not assume Drizzle Kit push applies a referenced composite unique constraint before a composite foreign key in the same schema push. Use a staged migration for composite constraints, or retain single-column primary-key references while enforcing `tenant_id` in every read and write.

**Why:** A schema push failed because the target composite unique constraint did not yet exist when the foreign key was created. The single-column references plus tenant-scoped queries pushed successfully.

**How to apply:** When adding composite tenant constraints, inspect and verify the generated DDL order. Never remove tenant filters to work around a push-ordering error.
