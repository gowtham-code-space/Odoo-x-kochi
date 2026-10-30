# BharatLabAI REST API Specification (v1)

Base URL: `/api/v1`  
Protocol: HTTPS / HTTP (Dev)  
Data Format: `application/json`

All authenticated endpoints read the signed session JWT from the HTTP-only cookie named `bharatlabai_session`.

---

## 1. Authentication Endpoints

### `POST /api/v1/auth/register`
Creates a new engineer identity and sets an HTTP-only session cookie.
- **Body**:
  ```json
  {
    "name": "Priya Sharma",
    "email": "priya@ashoka.in",
    "password": "Password123"
  }
  ```
- **Response 201**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "cm2...",
        "email": "priya@ashoka.in",
        "name": "Priya Sharma",
        "createdAt": "2026-10-30T17:15:00.000Z"
      }
    }
  }
  ```

### `POST /api/v1/auth/login`
Validates credentials, hashes with bcrypt, and sets the session cookie.
- **Body**: `{ "email": "...", "password": "..." }`
- **Response 200**: `{ "success": true, "data": { "user": { ... } } }`

### `POST /api/v1/auth/logout`
Clears the session cookie.
- **Response 200**: `{ "success": true, "data": { "message": "Signed out successfully" } }`

### `GET /api/v1/auth/me`
Retrieves current user identity from session cookie.
- **Response 200**: `{ "success": true, "data": { "user": { ... } } }`

---

## 2. Organization Endpoints

### `POST /api/v1/organizations`
Creates a new tenant organization. The creator is granted the `OWNER` role.
- **Body**:
  ```json
  {
    "name": "Ashoka Research Labs",
    "description": "Indic NLP Research"
  }
  ```

### `GET /api/v1/organizations`
Lists all organizations the user belongs to, including membership roles.

### `POST /api/v1/organizations/:organizationId/switch`
Switches active tenant context after verifying membership.

---

## 3. Analytics & AI Endpoints

### `POST /api/v1/analytics/query`
Processes natural-language inquiries into validated query proposals.
- **Body**:
  ```json
  {
    "question": "Show all organizations and their active member count"
  }
  ```
- **Response 200**:
  ```json
  {
    "success": true,
    "data": {
      "demo": true,
      "question": "Show all organizations and their active member count",
      "proposal": null,
      "explanation": "AI is not configured. Set LLM_API_KEY to enable live model queries.",
      "exampleResult": {
        "columns": ["name", "role", "memberCount"],
        "rows": [...]
      }
    }
  }
  ```

### `GET /api/v1/ai/status`
Returns whether live LLM generation is configured.

---

## 4. System & Health

### `GET /api/v1/health`
Returns system health, version, and server timestamp.

