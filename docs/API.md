# Odoo Subscription Management API (v1)

Base URL: /api/v1. Authenticated requests use the HTTP-only nexus_session
cookie. Tenant-owned routes include an organization identifier; the server
verifies membership before reading that organization.

## Authentication and user

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| POST | /auth/register | Public | Create a user and session. |
| POST | /auth/login | Public | Start a session. |
| POST | /auth/logout | Public | Clear the session cookie. |
| GET | /auth/me | Signed in | Get current user. |
| POST | /auth/forgot-password | Public | Create a hashed, expiring reset request; enumeration-safe. |
| POST | /auth/reset-password | Public | Reset with an unexpired token. |
| POST | /auth/change-password | Signed in | Change password after verification. |
| GET/PATCH | /users/me | Signed in | Get or update name and phone. |

Passwords require more than eight characters with upper-case, lower-case, and
special characters. Reset tokens are never returned by the API.

## Organization and administration

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| POST/GET | /organizations | Signed in | Create/list accessible organizations. |
| GET/PATCH | /organizations/:organizationId | Member/Admin | Read own context / update organization (Admin). |
| POST | /organizations/:organizationId/switch | Member | Verify selected context. |
| GET/POST | /organizations/:organizationId/members | Admin | List/add registered Staff or Customer members. |
| PATCH/DELETE | /organizations/:organizationId/members/:membershipId | Admin | Change allowed role or remove a member. |
| GET/PATCH | /organizations/:organizationId/settings | Admin | Tenant billing settings. |

## Operational resources

All endpoints below are nested under /organizations/:organizationId.

| Resource | Endpoints | Access |
| --- | --- | --- |
| Products | GET/POST products; GET/PATCH/DELETE product; variant mutation | Admin/Staff; delete requires Admin |
| Plans | GET/POST plans; GET/PATCH plan; activate/archive actions | Admin/Staff; archive Admin |
| Customers | GET/POST customers; GET/PATCH customer | Admin/Staff |
| Discounts | GET discounts; GET/POST/PATCH discount | Read Admin/Staff; write Admin |
| Quotations | GET/POST quotations; GET/PATCH quotation; send/accept/reject/cancel | Admin/Staff |
| Subscriptions | GET/POST subscriptions; GET/PATCH subscription; lifecycle actions | Admin/Staff |
| Invoices | GET/POST invoices; GET/PATCH invoice; confirm/cancel/billing-run | Admin/Staff; billing run/cancel Admin |
| Payments | GET payments; GET payment; record/initiate | Admin/Staff; Customer only for own invoice |
| Taxes | GET taxes; GET/POST/PATCH/DELETE tax | Read Admin/Staff; write Admin |
| Notifications | GET notifications; mark read | Verified organization member |
| Customer portal | GET portal; PATCH billing profile; POST cancellation request | Customer only |

List endpoints accept page and limit (maximum 100) and support relevant
search/filter parameters such as search, status, customerId, and planId.

## Dashboard and analytics

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| GET | /dashboard | Signed in | Organization membership overview. |
| GET | /dashboard/organizations/:organizationId | Admin/Staff | Tenant-scoped revenue, MRR/ARR, invoice and subscription metrics. |
| POST/GET | /analytics/query and /analytics/history | Signed in | AI proposal / inquiry history. |
| GET | /ai/status | Signed in | Optional AI configuration status. |

Revenue is succeeded payments. MRR normalizes active subscriptions to a monthly
value; ARR is MRR times 12. Natural-language analytics does not execute raw SQL.

## Billing and payments

The billing-run endpoint is idempotent at the invoice level through the
unique subscriptionId and periodStart constraint. Financial calculations use
integer paise in server code and persist PostgreSQL decimal values.

Billing is available as a tenant-scoped admin operation at
/organizations/:organizationId/billing/run. Its recent status and failure
records are available at /organizations/:organizationId/billing/runs. The
legacy invoice billing-run path remains available with the same tenant scope.
When BILLING_SCHEDULER_ENABLED is true, the server schedules the same
idempotent operation at BILLING_SCHEDULER_INTERVAL_MINUTES (minimum 15).

Manual payment records are only reconciled after an operator records a payment
reference. Gateway initiation has a provider interface but returns an explicit
unavailable error until a genuine configured provider and webhook verifier are
implemented; it never fabricates a successful payment.

## Errors

Errors use a stable error object with message, code, and requestId. Cross-tenant
resources return 404, while an authenticated member without the required role
receives 403.
