# BharatLabAI (oLab) — Production Hackathon Boilerplate

> Enterprise-ready full-stack boilerplate built for rapid domain expansion in hackathons. Features multi-tenant PostgreSQL architecture, zero-trust natural-language analytics scaffolding, and a refined dark developer-tool design system.

---

## 🚀 Quick Start (Clean Setup)

### 1. Prerequisites
- **Node.js**: v18+ or v20+ (ES modules supported)
- **PostgreSQL**: Local or hosted (Supabase, Neon, AWS RDS)

### 2. Configure Environment Variables
Copy the template files:
```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Edit `server/.env`:
```env
PORT=4000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bharatlabai?schema=public"
JWT_SECRET="generate-a-random-secret-string-at-least-64-characters-long"
CLIENT_URL="http://localhost:5173"

# Optional: Add LLM API key to enable live AI query translation
# LLM_API_KEY="your-gemini-or-openai-key"
# LLM_MODEL="gemini-1.5-flash"
```

### 3. Install Dependencies
From the repository root:
```bash
npm run install:all
```
*(Or install in `client/` and `server/` independently using `npm install`)*

### 4. Database Setup & Seeding
From `server/` directory:
```bash
npm run migrate      # Creates database tables
npm run seed         # Seeds demo users, organizations, and audit trails
```

**Seed Credentials (Dev Only):**
- **User 1 (Owner)**: `demo@bharatlabai.com` / `demo123`
- **User 2 (Admin)**: `admin@bharatlabai.com` / `admin123`

### 5. Start Frontend and Backend Concurrently
From root:
```bash
npm run dev
```
- **Client**: `http://localhost:5173`
- **Server**: `http://localhost:4000`

---

## 🛠 Available Scripts

| Command | Action |
|---|---|
| `npm run dev` | Runs both client & server concurrently |
| `npm run dev:client` | Starts Vite React client (`localhost:5173`) |
| `npm run dev:server` | Starts Express server with `--watch` (`localhost:4000`) |
| `npm run test` | Runs Node.js tenant-isolation and RBAC test suite |
| `npm run migrate` | Applies Prisma migrations |
| `npm run seed` | Seeds development accounts and initial tenant workspaces |

---

## 🎨 Design System

All UI screens strictly adhere to `design.md` (**BharatLabAI oLab**):
- **Aesthetic**: Deep dark developer tool (`#0b0d12` canvas, `#151a24` surfaces).
- **Accent**: Rose (`#d92d65`) exclusively reserved for active state & primary CTA.
- **Typography**: Space Grotesk (headings), Inter (body), IBM Plex Mono (telemetry, tables, metrics).
- **Anti-generic**: No gradients, no glassmorphism cards, no AI-builder watermarks, no ungrounded marketing copy.

---

## 🧪 Tests

To run the tenant-isolation verification tests:
```bash
cd server && npm test
```
Verifies cross-tenant isolation and role authorization policies.

