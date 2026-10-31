<div align="center">Odoo Subscription Management System
A modern, multi-tenant platform for managing subscriptions, customers, recurring billing, and business insights.
<p>
  <strong>React</strong> · <strong>Vite</strong> · <strong>Express</strong> · <strong>Prisma</strong> · <strong>PostgreSQL</strong>
</p></div>Overview
The Odoo Subscription Management System is a web-based SaaS application designed to bring subscription operations into one place. It aims to help businesses manage products, subscription plans, quotations, customer subscriptions, recurring invoices, payments, and revenue analytics through a unified interface.

The project is being developed with a multi-tenant architecture, role-aware access, and a responsive interface. The implementation is in progress; this README distinguishes working foundations from modules that are still planned or awaiting verification.
Project Goals
- Simplify the end-to-end subscription lifecycle.
- Organize products, variants, plans, and quotations.
- Support recurring billing and invoice tracking.
- Provide visibility into revenue, subscription growth, and customer activity.
- Separate organization data and enforce role-based access.
- Deliver a consistent experience across desktop, tablet, and mobile.
Core Modules
Module	Scope	Current status
Authentication	Register, login, logout, session and protected access	Implemented; existing flows should be regression-tested during changes
Organizations & tenancy	Organization context, memberships and tenant isolation	Foundation implemented; continue integration testing
Product catalogue	Products, product types, pricing and variants	UI/API code implemented; live database verification pending
Subscription plans	Billing intervals, pricing, trials and plan features	Planned / in progress
Quotations	Customer selection, line items, totals and conversion workflow	Planned
Subscriptions	Lifecycle, renewals, upgrades, pauses and cancellations	Planned
Invoices & GST	Recurring invoices, tax breakdown and overdue tracking	Planned
Discounts	Percentage/fixed discounts, coupon rules and validity	Planned
Payments	Transaction history, payment status and refunds where supported	Planned
Dashboards & analytics	Revenue metrics, subscription trends and reports	Planned
Customer portal	Customer subscriptions, invoices, payments and profile	Planned
Settings & administration	Organization, member, profile and preference settings	Partially implemented / planned


Status note: A module is not considered complete merely because a screen exists. Completion requires connected functionality, appropriate permission checks, loading/empty/error states, and tests. Update this table as each module is verified.

User Roles
The target application experience is organized around three user types:
- Admin — manages the organization, users, catalogue, subscription operations, billing configuration, and reports.
- Staff — handles permitted day-to-day customer, product, quotation, and subscription tasks.
- Customer — accesses their own subscriptions, invoices, payment history, and account details through the customer portal.
The server must remain the source of truth for authorization. Hiding a control in the frontend is not a substitute for backend permission checks.
Technology Stack
Frontend
- React 18
- Vite
- Tailwind CSS v4
- React Router v6
- Axios
- Framer Motion
Backend
- Node.js
- Express.js
- Prisma ORM
- PostgreSQL
- JWT-based authentication using secure HTTP-only cookies
- Zod request validation
- bcryptjs password hashing
Keep the existing project dependencies and architecture unless a documented technical reason requires a change.

Design Direction
The interface follows the active project design specification in instruction.md:
Design token	Value
Primary	#714B67
Accent	#017E84
Typography	Inter
Appearance	Light surfaces, clear hierarchy, responsive layouts


Use the active design specification as the source of truth. Treat older or conflicting visual directions in design/design.md as legacy unless the project instructions explicitly say otherwise.
Architecture
The application is split into a React client and an Express API. The API uses Prisma to access PostgreSQL. Authentication, tenant resolution, authorization, request validation, rate limiting, and centralized error handling belong on the server side.
Odoo-x-kochi/
├── client/                 # React + Vite frontend
│   └── src/
├── server/                 # Express backend
│   ├── src/
│   └── prisma/
│       ├── schema.prisma
│       └── seed.js
├── design/                 # Design references
├── docs/                   # Requirements and technical documentation
├── AGENTS.md               # Coding-agent project instructions
├── instruction.md          # Active project and design instructions
└── README.md
The tree above highlights the main areas; individual files and modules may evolve as development continues.
Getting Started
Prerequisites
- Windows, macOS, or Linux
- Node.js and npm
- PostgreSQL 17 (or a compatible supported PostgreSQL version)
- Git
1. Get the project
git clone <YOUR_REPOSITORY_URL>
cd Odoo-x-kochi
If the project is already on your machine, open the existing Odoo-x-kochi folder instead. Replace <YOUR_REPOSITORY_URL> only when you have the actual repository URL.
2. Install dependencies
Install the dependencies using the package manifests and lockfiles already present in the project. Do not delete lockfiles or replace the package manager as part of routine setup.
cd client
npm install
In a second terminal:
cd server
npm install
3. Configure the backend environment
Create server/.env locally. Do not commit this file.
DATABASE_URL="postgresql://postgres:<YOUR_PASSWORD>@127.0.0.1:5432/odoo_kochi_dev?schema=public"
Replace <YOUR_PASSWORD> with the password configured for your local PostgreSQL user. Keep secrets out of source code, screenshots, logs, and Git commits. Confirm that .env is ignored by Git before proceeding.
4. Prepare the database
The project has a Prisma schema, but the initial migration baseline must be generated, reviewed, and applied as part of the database verification process. Do not use prisma migrate reset, DROP DATABASE, or other destructive commands to resolve migration issues.

Once the reviewed initial migration has been created and approved, use the migration commands documented by the project and verify that they target only the local development database odoo_kochi_dev.
5. Run the application
Start the frontend in one terminal:
cd client
npm run dev
Start the backend in another terminal:
cd server
npm run dev
Vite usually prints the frontend URL in the terminal (commonly http://localhost:5173). Use the exact URL printed by Vite. The backend URL and port depend on the server configuration.
Database-dependent backend features may not work until the initial Prisma migration has been safely applied and the database has been verified.

Development Workflow
Use a vertical-slice workflow so each feature is usable end to end:
1. Review the requirement and existing architecture.
2. Define or update the data model only when required.
3. Implement the API, validation, tenant scoping, and server-side permissions.
4. Build the corresponding frontend screens and forms.
5. Connect the UI to the real API.
6. Test the complete workflow, including failure and empty states.
7. Update docs/DEVELOPMENT_TRACKER.md.
8. Create a focused Git commit and push only after the feature is verified.
For the current frontend-first implementation pass, frontend screens may use clearly labelled development-only demo data where an API is not yet available. Never present a demo-only action as a successfully persisted operation.
Quality Checklist
Before marking a feature complete, verify the relevant items:
- [ ] Responsive layout on desktop, tablet, and mobile
- [ ] Correct role-based navigation and server-side authorization
- [ ] Tenant-scoped data access
- [ ] Form validation and helpful error messages
- [ ] Loading, empty, success, and failure states
- [ ] Search, filters, sorting, and pagination where applicable
- [ ] No dead buttons or misleading success messages
- [ ] No browser console errors or broken routes
- [ ] Automated tests pass
- [ ] Frontend production build passes
- [ ] Documentation and development tracker are updated
Security & Data Safety
- Never commit .env files, credentials, tokens, database dumps, or private keys.
- Keep server/.env and other local environment files ignored by Git.
- Enforce authorization and tenant isolation on the backend for every protected operation.
- Do not trust organization IDs, roles, prices, tax amounts, or payment states supplied by the browser without server-side validation.
- Do not run destructive database commands against a database containing data that must be preserved.
- Use test or local development data for development and verification.
Documentation
Project-specific requirements and implementation decisions are maintained in:
- AGENTS.md — coding-agent workflow and repository rules
- instruction.md — active project instructions and design direction
- design/design.md — design reference (check for legacy or conflicting guidance)
- docs/Subscription_Management_System.pdf — system requirements brief
- docs/ARCHITECTURE.md — architecture notes
- docs/API.md — API reference
- docs/MULTITENANCY.md — tenant isolation and organization model
- docs/IMPLEMENTATION_PLAN.md — implementation phases
- docs/DEVELOPMENT_TRACKER.md — current feature progress
Contribution Guidelines
1. Read the project instructions and relevant documentation before editing.
2. Preserve working functionality and established conventions.
3. Keep changes focused and avoid unnecessary dependency changes.
4. Never add secrets or generated build output to commits.
5. Run relevant tests and builds before committing.
6. Use meaningful commit messages and never rewrite shared Git history with force pushes.
7. Attribute commits only to people who actually made the changes.
Project Status
Active development. Authentication and the initial product-catalogue slice form the current foundation. Database migration and live persistence verification are pending, followed by implementation and integration of the remaining subscription, billing, customer, and analytics modules.

The development tracker is the source of truth for the latest implementation status.
<div align="center">Odoo Subscription Management System
One workspace. Clearer subscription operations.
</div>
