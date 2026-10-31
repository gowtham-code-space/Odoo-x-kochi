# Development Tracker

Status values: **Complete** means verified in the stated scope; **In progress** means code exists but is not fully verified; **Not started** means no complete vertical slice exists. No status below is a claim about production deployment or the brief’s performance target.

| Area | Frontend | Backend | Database | API integration | Testing | Status / evidence |
| --- | --- | --- | --- | --- | --- | --- |
| Foundation, tenancy, roles | Responsive shell, role-aware navigation, Admin/Staff/Customer dashboards | JWT auth, tenant resolver, role middleware | Initial migration applied locally to `odoo_kochi_dev` | Auth and organization endpoints connected; role UI is supplementary | `npm run test --prefix server`: 11/11 pass | In progress — password reset and Admin staff-management APIs remain. |
| Product catalogue | Listing, search, create, edit, delete confirmation, and variant controls | Tenant-scoped product service, validation, and authorization | Initial migration applied locally | Catalogue endpoints are connected; product editing/deletion uses existing API endpoints | Client production build passes; live catalogue flow needs authenticated browser/API verification | In progress — do not mark complete until the local database flow is verified. |
| Plan management | Listing, create modal, search/sort/pagination, archive interaction | Existing service/repository/routes are not registered | Initial schema table exists; later plan-rule changes are pending migration | Development-only local preview adapter | Client production build passes | Frontend preview complete; not backend-integrated. |
| Quotations | Listing, create modal, status actions, conversion affordance | Repository/service exist; controller/routes absent | Initial schema table exists | Development-only local preview adapter | Client production build passes | Frontend preview complete; not backend-integrated. |
| Subscriptions | Listing, create modal, plan-change and lifecycle interactions | Repository/service exist; controller/routes absent | Initial schema table exists | Development-only local preview adapter | Client production build passes | Frontend preview complete; not backend-integrated. |
| Invoices, GST, discounts, payments, finance | Invoice, payment, discount screens and finance dashboard/reporting views | Not implemented as verified API flows | Initial schema tables exist | Development-only local preview adapter; no payment gateway claim | Client production build passes | Frontend preview complete; backend integration pending. |
| Customers and customer portal | Customer list and isolated customer portal layout | Customer-specific access APIs pending | N/A | Development-only local preview adapter | Client production build passes | Frontend preview complete; server ownership enforcement pending. |
| Landing page and public routes | Landing page, login, registration, forgot/reset password, unauthorized/session handling | Login/registration exist; password reset endpoints pending | N/A | Existing login/registration connected; recovery UI reports unavailable API honestly | Client production build passes | Frontend implementation complete; password-reset backend pending. |

## Product catalogue verification gate

The following must all pass before changing the product catalogue row to **Complete**:

- A local PostgreSQL database has the current Prisma schema through a reviewed migration; no production URL is used.
- An Admin can create a product and variant in organization A.
- A Staff member can list and manage the same organization’s catalogue.
- A Customer receives a server-side `403` for catalogue endpoints.
- A member of organization B receives a server-side `404` when attempting to access organization A’s catalogue.
- Product and variant records persist after a server restart and are shown by the client.

## Latest local checks — 31 Oct 2026

- `npm run test --prefix server` passed: **11/11** tenant-isolation and role-authorization tests.
- `npm run build --prefix client` passed.
- `npm run generate --prefix server` passed after restoring server dependencies with `npm install`; the generated `server/package-lock.json` now records the server dependency tree.
- `npm run migrate --prefix server -- --help` passed, confirming the local Prisma CLI is restored.
- PostgreSQL 17 is running locally and the ignored `server/.env` connects to local `odoo_kochi_dev` at `127.0.0.1:5432`.
- Read-only introspection confirmed the local database was empty. Reviewed migration `20261031071945_init_subscription_management` was applied successfully; `prisma migrate status` reports the database schema is up to date for that migration.
- The current Prisma schema has subsequent un-applied workflow changes. They are intentionally not migrated during the frontend-only implementation pass.
- Frontend production build passed after the landing page, application shell, role-based dashboards, catalogue improvements, and preview modules were added.

## Safe local migration procedure

`server/.env.example` contains only a placeholder. Create a local, ignored `server/.env` file and point it to a database reserved for development, for example:

```dotenv
DATABASE_URL="postgresql://brightloop_dev_user:local-password@localhost:5432/brightloop_dev?schema=public"
```

Never copy a production connection string into this file. Confirm the database name and host identify your local development instance before proceeding.

Before migration commands, ensure the local Prisma CLI is available. In this checkout it has been restored and `npm run migrate -- --help` succeeds.

1. If the local database contains data, create and verify a backup first. For PostgreSQL, a typical command is `pg_dump --format=custom --file=brightloop_dev_before_catalogue.dump --dbname="$DATABASE_URL"`. Keep the dump outside version control.
2. Review the target URL with `npm run migrate -- --help`; do not accept any Prisma reset prompt.
3. This repository currently has no `prisma/migrations` history. For an empty local database, create the initial migration with `npm run migrate -- --name init_subscription_management` from `server/`, then inspect the generated SQL before committing it.
4. For a pre-existing local database, stop if Prisma reports schema drift or requests a reset. Do not use `migrate reset`. Establish a reviewed baseline migration or have a database owner review a generated diff before applying any change.
5. After a successful migration, run `npm run generate`, `npm run test`, and the Product catalogue verification gate above. Record the actual results in this tracker.

The application has a configured local PostgreSQL database and the initial migration is applied. Product flow and role verification still need authenticated browser/API integration tests before the catalogue can be marked fully complete.

## Frontend implementation note

Plans, quotations, subscriptions, invoices, payments, discounts, customers, reports, and portal pages use a clearly labelled local development-preview adapter until their APIs are implemented. Their UI interactions update browser-only preview state and notify the user that no server record was saved.
