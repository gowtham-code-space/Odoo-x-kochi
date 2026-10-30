# BharatLabAI (oLab) — Modular Monolith Architecture

## 1. Architectural Philosophy

BharatLabAI is architected as an **enterprise-ready modular monolith**. It provides the operational simplicity of a single deployable unit while enforcing rigorous boundaries between business domains.

```
                              ┌──────────────────────────────────┐
                              │     Vite React SPA (Client)      │
                              │  (Tailwind v4, Space Grotesk)    │
                              └─────────────────┬────────────────┘
                                                │ REST API (JSON)
                                                │ Credentials: Cookie
                                                ▼
                              ┌──────────────────────────────────┐
                              │      Express.js Monolith         │
                              ├──────────────────────────────────┤
                              │ Middlewares:                     │
                              │  • authenticate (JWT verify)     │
                              │  • resolveTenant (DB membership) │
                              │  • authorize (RBAC: OWNER/ADMIN) │
                              │  • validateRequest (Zod)         │
                              └──────┬─────────────┬─────────────┘
                                     │             │
                    ┌────────────────┴──────┐      └──────────────┐
                    ▼                       ▼                     ▼
          ┌───────────────────┐   ┌───────────────────┐  ┌───────────────────┐
          │   Auth / Users    │   │   Organizations   │  │   Analytics & AI  │
          │     Module        │   │      Module       │  │      Module       │
          └─────────┬─────────┘   └─────────┬─────────┘  └─────────┬─────────┘
                    │                       │                      │
                    └───────────────────────┼──────────────────────┘
                                            ▼
                              ┌──────────────────────────────────┐
                              │       Prisma ORM Client          │
                              └─────────────────┬────────────────┘
                                                ▼
                              ┌──────────────────────────────────┐
                              │      PostgreSQL Database         │
                              │   (Shared-Schema Multi-Tenant)   │
                              └──────────────────────────────────┘
```

## 2. Directory & Module Boundaries

Each feature lives inside `server/src/modules/<feature>/` and implements:
- `*.routes.js`: Maps HTTP endpoints and attaches middleware (`authenticate`, `resolveTenant`, `authorize`, `validateRequest`).
- `*.controller.js`: Handles HTTP request unwrapping, status codes, and JSON responses.
- `*.service.js`: Houses business logic and inter-module coordination.
- `*.repository.js`: Encapsulates all Prisma database queries.
- `*.validation.js`: Strict Zod request schemas.

Cross-module communication occurs strictly via explicit service exports—never through direct mutation of another module's internal repository models.

## 3. Security Hardening

- **Cookie-Based Sessions**: Signed JWTs with HS256 (`jose`) stored in `httpOnly`, `sameSite: 'lax'`, `secure: env.isProd` cookies. Tokens are inaccessible to JavaScript.
- **Multi-Tenant Isolation**: Tenant boundaries are verified on every tenant-scoped route by querying the database `memberships` relation. Client headers or parameters are never blindly trusted.
- **Zero-Trust LLM Interface**: AI analytics generation produces structured Abstract Syntax Tree (AST) proposals parsed against an explicit table/column allowlist. Raw SQL execution is locked down by design.

