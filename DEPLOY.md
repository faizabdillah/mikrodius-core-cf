# Cloudflare Deployment Guide

## First-Time Setup

### 1. Login to Cloudflare
```powershell
wrangler login
```

### 2. Create D1 Database
```powershell
bun run setup:d1
```
Copy the `database_id` from output and update `apps/api/wrangler.toml`.

### 3. Create KV Namespace
```powershell
bun run setup:kv
```
Copy the `id` from output and update `apps/api/wrangler.toml`.

### 4. Run Migrations
```powershell
# Remote (Cloudflare)
bun run db:migrate:remote
bun run db:seed:remote
```

### 5. Set Google OAuth Secrets
```powershell
cd apps/api
wrangler secret put GOOGLE_CLIENT_ID
wrangler secret put GOOGLE_CLIENT_SECRET
```

### 6. Deploy
```powershell
bun run deploy
```

---

## Quick Deploy (After Setup)

```powershell
# Deploy both API and Web
bun run deploy

# Or deploy separately
bun run deploy:api   # API to Workers
bun run deploy:web   # Web to Pages
```

---

## Local Development

```powershell
# Start API (port 8787)
bun run dev:api

# Start Web (port 5173)
bun run dev:web

# Run migrations locally
bun run db:migrate:local
bun run db:seed:local
```

---

## After Deploy

Your services will be at:
- **API**: `https://saas-api.<your-subdomain>.workers.dev`
- **Web**: `https://saas-web.pages.dev`

Update the frontend `.env.production`:
```
VITE_API_URL=https://saas-api.<your-subdomain>.workers.dev
```

Update `apps/api/wrangler.toml` for production Google OAuth:
```toml
GOOGLE_REDIRECT_URI = "https://saas-api.<your-subdomain>.workers.dev/auth/google/callback"
```
