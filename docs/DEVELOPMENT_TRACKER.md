# Development Tracker

Status is evidence-based. “Verified locally” means against the ignored local
PostgreSQL database odoo_kochi_dev; it is not a production deployment claim.

| Area | Frontend | Backend/API | Database | Verification | Status |
| --- | --- | --- | --- | --- | --- |
| Foundation, authentication, tenancy | Connected login, registration, session, organization switch | JWT cookie, bcrypt, tenant resolver, ADMIN/STAFF/CUSTOMER authorization, profile/password-reset request APIs | Both reviewed migrations applied | 14 automated tests; live register/login/logout/session test | Verified locally |
| Product catalogue | Product and variant CRUD UI | Tenant-scoped CRUD and role checks | Persisted PostgreSQL models | Live create/variant flow and cross-tenant denial | Verified locally |
| Plans and customers | Create/list screens backed by API | Plan availability/price validation; customer CRUD and ownership link | plans, customers, indexes and FKs | Live plan/customer creation | Verified locally |
| Quotations and subscriptions | Create/list/lifecycle controls use API | Server-side line calculations, accepted quote conversion, transition history, lifecycle guards | Quotations, lines, subscriptions, history | Live quotation → subscription → activation workflow | Verified locally |
| Invoices, GST, discounts, billing | Create/list/confirm screens use API | Decimal-safe paise calculations, discount rules, invoice confirmation, idempotency constraint, recurring billing run | Invoice/payment/discount/redemption/billing-run models | Live recurring invoice and payment reconciliation flow | Verified locally |
| Payments | Manual payment recording UI; no fake gateway success | Provider boundary returns clear unavailable response until real credentials/adapter exist | Payment status/refund/provider fields | Live manual payment reconciliation; unconfigured provider not marked successful | Partially complete — gateway/webhook integration needs real provider credentials |
| Customer portal | Customer dashboard, invoices, and cancellation request UI | Customer-profile ownership enforcement and cancellation notifications | Customer user link, notifications | Live customer portal ownership test | Verified locally |
| Organization/admin settings | Profile, business, members and billing settings UI | Member assignment, settings upsert, audit logs | Organization settings and audit log | Live profile/settings/member persistence test | Verified locally |
| Dashboard/reports | Live KPI/dashboard/report views | Tenant-scoped aggregation for payments, MRR, ARR, subscriptions and invoices | Existing domain tables/indexes | Frontend production build and local API flow | Verified locally; trend/churn drill-down endpoints remain future work |
| AI analytics | Explicit unavailable state when no provider is configured | Proposal-only interface; no raw SQL execution | N/A | UI does not substitute fake business results | Intentionally limited — no read-only execution engine |

## Database and migration state

- Local target verified before applying: odoo_kochi_dev on 127.0.0.1:5432.
- Applied migrations:
  - 20261031071945_init_subscription_management
  - 20261031123000_core_backoffice
- The second migration is additive: tables, columns, enum values, indexes and
  foreign keys only. It contains no reset, drop, truncate, or enum-value
  replacement.
- Local test records were intentionally created during HTTP verification. No
  production database was accessed and no destructive database command was run.

## Latest checks — 31 Oct 2026

- npm run test — **14/14 passing** (tenant isolation, role authorization,
  exact monetary arithmetic, billing intervals, discount eligibility).
- npm run build — **passed**.
- prisma validate — **passed**.
- prisma migrate status — **database schema up to date**.
- Live local HTTP verification passed for registration, organization/admin
  membership, product/variant, plan, customer, discount, quotation,
  subscription activation, recurring invoice, manual payment reconciliation,
  settings/profile persistence, customer-portal isolation, cross-tenant
  denial, and password-reset enumeration safety.

## Local environment requirements

server/.env is ignored and must include non-empty local values for:

    DATABASE_URL="postgresql://<local-user>:<local-password>@127.0.0.1:5432/odoo_kochi_dev?schema=public"
    JWT_SECRET="<long-random-secret>"

Never commit this file or use a production connection URL. Take a backup before
future migrations; if Prisma ever requests a reset, stop and review the drift
instead of using migrate reset.

## External / intentionally deferred work

- A real gateway adapter, provider credentials, signature verification, and
  webhook endpoint are required before online payment initiation or refunds.
- Password-reset email delivery needs an approved email provider. The server
  stores a hashed, expiring reset token and always returns an enumeration-safe
  response; it never exposes reset tokens.
- Automated scheduled execution needs deployment-specific scheduling (the
  authenticated, idempotent billing-run endpoint and run records are present).
- Performance target under thousands of subscriptions has not been measured.
