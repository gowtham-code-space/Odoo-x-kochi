Odoo x Kochi Hackathon — Workspace Rules
Project context
Build a subscription-management SaaS for the Brightloop Software scenario in docs/Subscription_Management_System.pdf.
The repository currently uses a split structure with client/ and server/, plus design/ and docs/.
Mandatory checks before EVERY task
Before editing code, do all of the following:
1. Inspect the current repository tree. Do not assume the structure or that earlier work is unchanged.
2. Read this file, design/design.md, docs/ARCHITECTURE.md, docs/API.md, and docs/MULTITENANCY.md.
3. Read docs/Subscription_Management_System.pdf for the exact hackathon requirements. If the PDF is missing, say so and ask for it; do not invent requirements.
4. Inspect the root, client/, and server/ package.json files, relevant source files, Prisma schema/migrations, and .env.example files before deciding what to change or how to run the app.
5. Give a short audit first: current implementation, relevant files, assumptions, risks, and a small plan. For an audit-only request, do not modify files.
Architecture and implementation rules
- Preserve the existing client/server architecture, framework, package manager, folder names, and working code. Do not scaffold a replacement app or rewrite the project unless explicitly asked.
- Make focused, incremental changes. Reuse existing components, utilities, middleware, API patterns, validation, and database models.
- Keep business logic and authorization on the server. Enforce role permissions and tenant/data ownership on the server for every protected operation; hiding a UI control is not authorization.
- Never expose secrets, database credentials, private keys, or service-role keys in client code. Never commit .env files. Update .env.example with variable names and safe placeholders only.
- Do not delete or rename existing files, migrations, API routes, or database models without explaining why and getting approval.
- Do not fabricate integrations, successful payments, customer evidence, metrics, testimonials, or compliance claims. Clearly label demo/sample data in the code and UI where appropriate.
Design rules
- Treat design/design.md as the single source of truth for UI tokens, typography, layout, components, and motion.
- Read the design file before creating or changing any screen. Do not mix it with a different theme or invent new colors, fonts, radii, shadows, or component styles.
- Follow the existing repository's selected crimson-pink design unless the team explicitly replaces design/design.md with another approved design system.
- Use the supplied https://bharathlabai.vercel.app/ only as a landing-page structure/quality reference. Do not copy its brand, text, data, logos, metrics, or claims.
- Build a marketing landing page separately from the authenticated application/dashboard. Keep both consistent with design/design.md.
- Use real product-interface previews made from the project's own components. Do not use unrelated stock illustrations or fake customer proof.
Challenge requirements to preserve
Implement only what is supported by the challenge PDF, including:
- Account registration, unique email, stated password rules, password reset, and Admin/Staff/Customer access boundaries.
- Product setup, product variants and price adjustments, plans and supported billing frequencies, minimum quantity, availability dates, and plan lifecycle actions.
- Quotation templates and subscription lifecycle/status tracking.
- Invoice creation from due subscriptions, tax calculation, invoice lifecycle, and duplicate/skip prevention.
- Admin-managed fixed/percentage discounts with eligibility, validity, usage limits, and automatic invoice application.
- Payment records linked to invoices, outstanding/overdue tracking, and finance reporting.
- Performance target stated in the brief: pages should respond in under two seconds with thousands of subscriptions. Do not claim this target is met without measurement.
Before finishing any task
1. Run the relevant tests, lint, type-check, and build commands after discovering them from the package scripts. Do not guess scripts.
2. Report the files changed, functionality completed, commands actually run, test/build results, and any remaining TODOs or blockers.
3. If a command cannot run because dependencies, environment variables, or services are missing, state that explicitly and provide the exact next command/action.
4. Do not say a feature is complete merely because the UI was generated; verify the full user flow and API/database behavior where applicable.
Working style
- Ask only for information that is genuinely missing and blocks safe progress.
- Prefer the smallest viable implementation that fits the existing architecture and the hackathon scope.
- Do not start coding until the initial repository and document audit is complete.

@[Project Instructions](instruction.md)

@[Active Design System](design/design.md)