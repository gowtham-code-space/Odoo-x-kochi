# Implementation Plan

This roadmap is the shared delivery order for the Brightloop Subscription Management System. It preserves the existing React client, Express server, and Prisma/PostgreSQL architecture. A phase is not complete until its server authorization, tenant isolation, database behavior, and relevant client flow have been verified.

## Phase 1 — Foundation, authentication, roles, and database

- Establish the shared-schema multi-tenant data model and organization membership checks.
- Implement account registration, unique email enforcement, secure password rules, login/logout, password reset, and Admin/Staff/Customer boundaries.
- Configure Prisma migrations, local development database guidance, seed data clearly marked as development-only, and baseline tenant-isolation tests.

## Phase 2 — SaaS landing page and public routes

- Build the marketing landing page separately from authenticated product screens, using the active design system.
- Complete public authentication routes, including password recovery and reset flow.
- Keep public claims factual and use project-native interface previews only.

## Phase 3 — Products, variants, plans, quotations, and subscriptions

- Verify the product catalogue against a migrated local PostgreSQL database before marking it complete.
- Build plan management with supported billing frequencies, minimum quantity, availability dates, and lifecycle actions.
- Build quotation templates and conversion into subscriptions.
- Build subscription status tracking and permitted pause, renew, and close actions.

## Phase 4 — Invoices, GST, discounts, payments, and finance

- Generate invoices from due subscriptions with duplicate/skip protection and tax calculation.
- Implement invoice actions and lifecycle transitions.
- Implement Admin-managed fixed and percentage discounts with eligibility, date windows, and usage limits.
- Record payments against invoices and calculate outstanding and overdue amounts.

## Phase 5 — Dashboards, customer portal, reporting, testing, and deployment

- Build role-scoped dashboards, customer self-service subscriptions/invoices, and finance reporting.
- Add end-to-end, authorization, tenant-isolation, and performance testing.
- Measure the brief’s under-two-second target with thousands of subscriptions before making any performance claim.
- Prepare deployment configuration and operational documentation.

## Current delivery order

1. Product catalogue migration and local PostgreSQL verification.
2. Plan management integration.
3. Subscription management.
4. Quotations.
5. Invoices and payments.
