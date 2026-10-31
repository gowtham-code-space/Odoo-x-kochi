# Development Tracker

Status values: **Complete** means verified in the stated scope; **In progress** means code exists but is not fully verified; **Not started** means no complete vertical slice exists. No status below is a claim about production deployment or the brief’s performance target.

| Area | Frontend | Backend | Database | API integration | Testing | Status / evidence |
| --- | --- | --- | --- | --- | --- | --- |
| Foundation, tenancy, roles | Existing shell and organization context | JWT auth, tenant resolver, role middleware | Schema present; migration history absent | Existing auth and organization endpoints | `npm run test --prefix server`: 11/11 pass | In progress — password reset and Admin staff-management flows remain. |
| Product catalogue | Product list and create-product/variant modals | Tenant-scoped product service, validation, and authorization | Product and variant schema defined; local migration not applied | `GET`/`POST /organizations/:organizationId/products` and variant create route are connected | Client build passes; role/tenant unit suite passes; no live PostgreSQL integration test yet | In progress — do not mark complete until the local database flow is verified. |
| Plan management | No page wired | Service, repository, and routes exist but are not registered | Plan schema defined; local migration not applied | Not connected to the client or root API router | No plan flow test | Not started as a verified vertical slice. |
| Quotations | No page wired | Repository, service, and validation exist; controller/routes absent | Schema defined; local migration not applied | Not connected | No flow test | Not started as a verified vertical slice. |
| Subscriptions | No page wired | Repository, service, and validation exist; controller/routes absent | Schema defined; local migration not applied | Not connected | No flow test | Not started as a verified vertical slice. |
| Invoices, GST, discounts, payments, finance | No implementation verified | Schema only in current worktree | Schema defined; local migration not applied | Not connected | No tests | Not started. |
| Landing page and public routes | Existing auth screens only | Existing auth routes only | N/A | Existing auth integration | Client build passes | Not started against Phase 2 scope. |

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
- Prisma schema validation and Prisma Client generation previously passed with a placeholder local `DATABASE_URL`; this does not exercise a database.
- No live PostgreSQL verification was run: `server/.env` is absent in this worktree.
- `npm run migrate --prefix server -- --help` currently fails before contacting a database because the local Prisma executable shim is missing from `server/node_modules/.bin` after an incomplete dependency installation. Restore dependencies with `npm install` in `server/` (or `npm ci` when a lockfile is added) before attempting migration commands.

## Safe local migration procedure

`server/.env.example` contains only a placeholder. Create a local, ignored `server/.env` file and point it to a database reserved for development, for example:

```dotenv
DATABASE_URL="postgresql://brightloop_dev_user:local-password@localhost:5432/brightloop_dev?schema=public"
```

Never copy a production connection string into this file. Confirm the database name and host identify your local development instance before proceeding.

Before migration commands, ensure the local Prisma CLI is available. In the current checkout, repair the incomplete development dependency install first with `npm install` from `server/`; this changes local dependencies only, not database data. Do not proceed until `npm run migrate -- --help` displays Prisma help successfully.

1. If the local database contains data, create and verify a backup first. For PostgreSQL, a typical command is `pg_dump --format=custom --file=brightloop_dev_before_catalogue.dump --dbname="$DATABASE_URL"`. Keep the dump outside version control.
2. Review the target URL with `npm run migrate -- --help`; do not accept any Prisma reset prompt.
3. This repository currently has no `prisma/migrations` history. For an empty local database, create the initial migration with `npm run migrate -- --name init_subscription_management` from `server/`, then inspect the generated SQL before committing it.
4. For a pre-existing local database, stop if Prisma reports schema drift or requests a reset. Do not use `migrate reset`. Establish a reviewed baseline migration or have a database owner review a generated diff before applying any change.
5. After a successful migration, run `npm run generate`, `npm run test`, and the Product catalogue verification gate above. Record the actual results in this tracker.

The application has not run against a configured local PostgreSQL database in this worktree, so none of these integration steps have been claimed as completed.
