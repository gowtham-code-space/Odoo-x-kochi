# Multi-Tenancy Architecture & Boundary Isolation

## 1. Tenancy Model: Shared-Schema Multi-Tenancy

BharatLabAI employs a **shared-schema PostgreSQL pattern with explicit organization scoping**. This model optimizes resource consumption, simplifies operational maintenance during hackathons, and allows instant tenant provisioning without running dynamic database DDL.

### Entity Scoping Matrix

| Model | Scope | Description |
|---|---|---|
| `User` | **Global** | An engineer identity exists once globally across all tenants. |
| `Organization` | **Tenant Anchor** | The root partition boundary for data assets. |
| `Membership` | **Tenant Scoped** | Links a `User` to an `Organization` with a specific role (`OWNER`, `ADMIN`, `MEMBER`). |
| `AuditLog` | **Tenant Scoped** | Bound to `organizationId` for compliance inspection. |
| Customer, Tax, BillingRun, Notification | **Tenant Scoped** | Every query uses verified organization context. |
| Future domain models (e.g. `Runs`, `Datasets`) | **Tenant Scoped** | Must have an `organizationId` foreign key and compound index `[organizationId, id]`. |

---

## 2. Server-Side Enforcement (Middleware Architecture)

Tenant security is strictly decoupled from client assertions. We implement a 2-stage verification pipeline:

```
[Request with :organizationId]
               │
               ▼
   [1. authenticate Middleware]
        • Verifies signed JWT from HTTP-only cookie.
        • Attaches verified `req.user`.
               │
               ▼
   [2. resolveTenant Middleware]
        • Queries database:
          prisma.membership.findUnique({
            where: {
              userId_organizationId: {
                userId: req.user.id,
                organizationId: req.params.organizationId
              }
            }
          })
        • If null: returns 404 (prevents tenant enumeration).
        • If found: attaches `req.organization` and `req.membership`.
               │
               ▼
   [3. authorize Middleware (RBAC)]
        • Enforces minimum role requirements (e.g., OWNER or ADMIN).
```

---

## 3. Automated Isolation Verification

Automated tests in `server/tests/tenant-isolation.test.js` verify:
1. User A cannot view User B's organization resources.
2. Cross-tenant access attempts return 404 access denied errors.
3. Member roles are strictly checked before allowing administrative mutations.
4. Billing jobs receive an organization scope for administrator requests; the
   unique billing-period constraint protects against duplicate renewal invoices.

