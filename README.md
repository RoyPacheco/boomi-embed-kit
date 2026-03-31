# Boomi Embed Kit — Integration Manager

A production-ready React + Express web application for managing Boomi EmbedKit integrations. The Express server acts as a secure Backend-for-Frontend (BFF) — all Boomi credentials stay server-side and are never exposed to the browser.

Built following the patterns from the official [embedkit-examples](https://github.com/OfficialBoomi/embedkit-examples) repository.

---

## Prerequisites

- **Node.js** ≥ 18 (built-in `fetch` required)
- **npm** ≥ 9
- A Boomi platform account with a **Parent / Child account structure** enabled
- An **EmbedKit Server Base URL** provided by Boomi

---

## Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd boomi-embed-kit
```

### 2. Install all dependencies

```bash
# Root (concurrently)
npm install

# Frontend
cd CSO-boomi-app && npm install && cd ..

# Backend
cd server && npm install && cd ..
```

### 3. Configure the server environment

```bash
cp server/.env.example server/.env
```

Open `server/.env` and fill in every value:

```env
# EmbedKit server URL (provided by Boomi)
EMBEDKIT_SERVER_BASE=https://embedkit.boomi.com

# Boomi Platform REST API base URL
API_URL=https://api.boomi.com/partner/api/rest/v1

# Parent account ID — also used as X-Tenant-Id for EmbedKit auth
API_ACCOUNT_ID=your_parent_account_id

# API username  (format: BOOMI_TOKEN.user@example.com)
API_USERNAME=BOOMI_TOKEN.user@example.com

# API token
API_TOKEN=your_api_token

# Child / end-customer account ID (optional for single-tenant)
API_AUTH_USER=your_child_account_id

# Account group name (optional)
API_ACCOUNT_GROUP=your_account_group

# Secret for signing host-app JWT session cookies
# Generate with: openssl rand -base64 32
JWT_SECRET=replace_with_a_long_random_secret

# Comma-separated list of browser origins allowed by CORS
CORS_ORIGINS=http://localhost:3000

PORT=4000
```

### 4. Configure the client environment (optional)

```bash
cp CSO-boomi-app/.env.example CSO-boomi-app/.env
```

When running locally the Vite dev proxy (`/api` → `localhost:4000`) is used, so `VITE_SERVER_URL` can be left empty. Set it only when deploying the frontend to a different origin than the server.

```env
VITE_SERVER_URL=
```

### 5. Start the development servers

From the project root:

```bash
npm run dev
```

Both servers start concurrently:

| Server | URL |
|--------|-----|
| Frontend (Vite) | http://localhost:3000 |
| Backend (Express) | http://localhost:4000 |

Open http://localhost:3000, enter any email and password, and sign in.

---

## Obtaining Boomi Credentials

### API Token

1. Log in to [Boomi Platform](https://platform.boomi.com).
2. Go to **Settings → Account Information → API Tokens**.
3. Click **Generate New Token** and copy the value into `API_TOKEN`.
4. The username associated with the token goes into `API_USERNAME`.

### Parent Account ID (`API_ACCOUNT_ID`)

Found under **Settings → Account Information → Account Setup**. This value is used as both the Boomi account identifier and the EmbedKit `tenantId` (`X-Tenant-Id` header).

### Child Account ID & Account Group

Each end-user of EmbedKit must have a Boomi sub-account under your parent account. For single-tenant admin apps, set one `API_AUTH_USER` and `API_ACCOUNT_GROUP` in `.env`. In multi-tenant apps these values come from your user database.

### JWT Secret

Generate a strong random value and set it as `JWT_SECRET`:

```bash
openssl rand -base64 32
```

> **Security:** All Boomi credentials live in `server/.env` only. They are never bundled into the frontend. The server exchanges them for a short-lived nonce that the browser receives. The nonce is then exchanged by the SDK for a 10-minute JWT — all credential handling is server-side.

---

## Authentication Flow

```
Browser                    Express Server              EmbedKit Server
  │                              │                           │
  │── POST /api/session ─────────>│  (email + password)      │
  │   (sets JWT cookie)           │── POST /auth/login ──────>│
  │                              │<── { nonce, ttlSec } ─────│
  │<── { nonce, serverBase, ... } │                           │
  │                              │                           │
  │  BoomiPlugin({ nonce })       │                           │
  │  exchanges nonce for JWT ─────┼──────────────────────────>│
  │<── 10-min JWT (auto-refresh)  │                           │
  │                              │                           │
  │  <BoomiMount component="..." />                           │
  │  (renders Integrations UI)    │                           │
  │                              │                           │
  │  [page reload — cookie valid] │                           │
  │── GET /api/session ──────────>│  (validates JWT cookie)  │
  │── POST /api/session/nonce ───>│── POST /auth/login ──────>│
  │<── { nonce, serverBase, ... } │<── { nonce } ─────────────│
  │  BoomiPlugin({ nonce })       │                           │
```

1. User submits the **Login** form → `POST /api/session` with `{ email, password }`.
2. The server validates credentials, sets an **HTTP-only JWT cookie** (2-hour TTL), and calls the EmbedKit `auth/login` endpoint — credentials never leave the server.
3. EmbedKit returns a **one-time HMAC nonce** (2-minute TTL).
4. The server forwards only `{ nonce, serverBase, tenantId }` to the browser.
5. `initBoomi()` calls `BoomiPlugin({ nonce, serverBase, tenantId, boomiConfig })` which exchanges the nonce for a **10-minute JWT** (auto-refreshed by the SDK).
6. `<BoomiMount component="Integrations" />` renders the full Boomi UI inside any container.
7. On **page reload**, the JWT cookie is checked (`GET /api/session`); if valid, a fresh nonce is fetched via `POST /api/session/nonce` so the plugin re-initialises without re-login.

---

## Project Structure

```
boomi-embed-kit/
├── package.json                  # Root: concurrently dev script
├── README.md
│
├── CSO-boomi-app/                # React frontend (Vite, port 3000)
│   ├── package.json
│   ├── vite.config.ts            # Vite + /api proxy → port 4000
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── index.html                # Inter font (Google Fonts)
│   ├── .env.example
│   └── src/
│       ├── main.jsx              # React root — BrowserRouter + QueryClientProvider
│       │                         # + AuthProvider + EmbedKit CSS injection
│       ├── App.jsx               # Boot spinner → Login or Dashboard
│       ├── boomi.config.js       # EmbedKit UI config (theme, enableAi, components)
│       ├── index.css             # Tailwind directives + pulse keyframe
│       ├── state/
│       │   ├── authContext.jsx   # AuthProvider + useAuth hook
│       │   │                     # Manages login, logout, session boot, nonce refresh
│       │   └── boomiProvider.jsx # Singleton plugin manager
│       │                         # initBoomi, isBoomiReady, renderBoomiComponent, destroyBoomi
│       ├── components/
│       │   ├── BoomiMount.jsx          # Drop-in EmbedKit component renderer
│       │   │                           # Auto-inits plugin + calls renderBoomiComponent
│       │   ├── Sidebar.jsx             # Left nav with Sign out button
│       │   ├── SearchBar.jsx           # Live client-side filter
│       │   ├── IntegrationCard.jsx     # Card: status badge + kebab menu
│       │   └── AddIntegrationModal.jsx # Form: integration pack + environment dropdowns
│       ├── pages/
│       │   ├── Login.jsx         # Email / password sign-in form
│       │   └── Dashboard.jsx     # Grid/list cards, skeletons, toasts
│       │                         # BoomiOverlay uses <BoomiMount> on Edit
│       └── services/
│           └── api.js            # Axios: session + CRUD + catalogue proxies
│
└── server/                       # Express backend (port 4000)
    ├── package.json              # ESM ("type": "module")
    ├── index.js                  # Helmet, Morgan, rate limiter, CORS, routes
    ├── .env.example
    ├── middleware/
    │   ├── auth.js               # boomiHeaders() — injects Bearer + AccountID
    │   └── jwt.js                # setSession, requireAuth, cookieOptions
    └── routes/
        ├── session.js            # POST / GET / DELETE /api/session
        │                         # POST /api/session/nonce
        ├── integrations.js       # CRUD proxy → embedkit/v1/integrations
        ├── available-integrations.js  # GET proxy → embedkit/v1/integrationPack
        └── environments.js       # GET proxy → embedkit/v1/environment
```

---

## API Routes

### Session & Auth

| Method   | Path                    | Auth required | Description                                         |
|----------|-------------------------|:-------------:|-----------------------------------------------------|
| `POST`   | `/api/session`          | —             | Login — sets JWT cookie, returns EmbedKit nonce     |
| `GET`    | `/api/session`          | ✓ cookie      | Returns current user `{ email, isAdmin }`           |
| `DELETE` | `/api/session`          | —             | Logout — clears JWT cookie                          |
| `POST`   | `/api/session/nonce`    | ✓ cookie      | Returns a fresh EmbedKit nonce for page reloads     |
| `GET`    | `/api/ping`             | —             | Health check                                        |

### Integration Instances

| Method   | Path                      | Description              |
|----------|---------------------------|--------------------------|
| `GET`    | `/api/integrations`       | List all integrations    |
| `POST`   | `/api/integrations`       | Create an integration    |
| `GET`    | `/api/integrations/:id`   | Get single integration   |
| `PUT`    | `/api/integrations/:id`   | Update an integration    |
| `DELETE` | `/api/integrations/:id`   | Delete an integration    |

### Catalogue (used by the Add Integration modal)

| Method | Path                          | Description                      |
|--------|-------------------------------|----------------------------------|
| `GET`  | `/api/available-integrations` | List available integration packs |
| `GET`  | `/api/environments`           | List available environments      |

All Boomi API errors are returned as structured JSON:

```json
{ "error": true, "status": 404, "message": "Not found" }
```

---

## Key Dependencies

### Frontend

| Package | Purpose |
|---------|---------|
| `@boomi-demo/embedkit-cdn` | Boomi EmbedKit CDN bundle — `BoomiPlugin`, `RenderComponent`, `DestroyPlugin` |
| `@tanstack/react-query` | Server state management and cache invalidation |
| `react-hook-form` | Form validation in the Add Integration modal |
| `react-router-dom` | Client-side routing (`BrowserRouter`) |
| `axios` | HTTP client for REST calls |
| `lucide-react` | Icon set |
| `tailwindcss` | Utility CSS framework |

### Backend

| Package | Purpose |
|---------|---------|
| `express` | HTTP server and routing |
| `helmet` | Secure HTTP headers |
| `morgan` | HTTP request logging |
| `jsonwebtoken` | JWT signing and verification for session cookies |
| `cookie-parser` | Parse HTTP-only cookies |
| `rate-limiter-flexible` | Rate limiting (100 req / 60 s per IP) |
| `dotenv` | Load `.env` into `process.env` |
| `axios` | Proxy calls to the Boomi REST API |

### Root

| Package | Purpose |
|---------|---------|
| `concurrently` | Run both dev servers with a single `npm run dev` |

---

## EmbedKit CDN Package Note

The app uses `@boomi-demo/embedkit-cdn` installed directly from GitHub (`github:OfficialBoomi/embedkit-cdn`). This CDN build exports named symbols only — there is no default export:

```js
import { BoomiPlugin, RenderComponent, DestroyPlugin } from '@boomi-demo/embedkit-cdn/embedkit-cdn.js'
```

The EmbedKit CSS is injected manually to bypass Vite's PostCSS pipeline (which would error on `@layer base` rules without a matching `@tailwind base`):

```js
// main.jsx
import embedkitCss from '@boomi-demo/embedkit-cdn/embedkit-cdn.css?raw'
const el = document.createElement('style')
el.textContent = embedkitCss
document.head.appendChild(el)
```
