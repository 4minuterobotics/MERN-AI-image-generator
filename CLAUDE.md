# CLAUDE.md — Drew-It (MERN-AI-image-generator)

**Dev port:** 3900 (client) · 8081 (server)

A MERN-stack AI image generator. Live at https://drew-it.vercel.app, backend at https://mern-ai-image-generator-backend.vercel.app. Built in memory of Will's brother Drew.

Stack:
- **Client** — Vite + React 18 + Tailwind + React Router + react-bootstrap + framer-motion. Port 3900.
- **Server** — Express + Mongoose + Stability AI (SD3) + Cloudinary. Port 8081.
- **DB** — MongoDB Atlas.
- **Image gen** — Stability AI SD3 (despite the repo name being "DALL-E"; switched providers at some point).
- **Image storage** — Cloudinary (`drew-it-optimization` named transformation, `allowed_formats: ['jpg','jpeg','png','webp']`).
- **Hosting** — Vercel for both client and server.

## Public, no-login model

This site is intentionally **open** — no signup, no signin, no per-user tracking, no `users` collection. Anyone can generate and share to the community gallery.

**The auth scaffolding was deleted on 2026-06-08** after a security review concluded it was dead code with real risk (bcrypt hash in JWT payload, no rate limit, timing-attack signin). Deleted files: `client/src/pages/SignIn.jsx`, `client/src/pages/SignUp.jsx`, `client/src/contexts/AppState.jsx`, `server/routes/userRoutes.js`, `server/mongodb/models/user.js`, `server/utils.js`. If a future admin-moderation feature needs login, build a single-purpose hardened login at that point — don't resurrect the deleted scaffolding.

The security model that replaces login is **server-side rate limiting + input validation + CORS lockdown**:

- **Stability AI generation** — 5 / hour / IP via `express-rate-limit` (`generateLimiter` in `server/middleware/security.js`). This is the hot endpoint to protect — each SD3 call costs real money.
- **Community post** — 10 / hour / IP via `postLimiter`.
- **Global** — 200 / 15 min / IP via `globalLimiter`.
- **Input validation** — prompt 1-500 chars, name 1-100 chars, photo must start with `data:image/`, photo size capped at ~11MB (vs. 12MB body limit). Schema-level `maxlength` mirrors these.
- **MongoDB operator sanitize** — `sanitizeMongoMiddleware` strips `$`-keys and dotted keys from req body/params/query, so injected `{ $where: '…' }` payloads can't smuggle operators into Mongoose queries.
- **CORS allowlist** — only `https://drew-it.vercel.app`, `http://localhost:5173`, `http://localhost:3900`, plus `EXTRA_ALLOWED_ORIGIN` env escape hatch.
- **Helmet** for default security headers (HSTS, X-Frame-Options, etc.).
- **trust proxy = 1** so express-rate-limit sees the real client IP behind Vercel.
- **Body limit** lowered to 12MB (was 50MB).
- **Cloudinary uploads** scoped to `resource_type: 'image'` + `allowed_formats: ['jpg','jpeg','png','webp']` to defend against polyglot uploads.
- **All Cloudinary photo URLs use `https://`** (legacy `http://` rows backfilled by `server/scripts/backfill-https-photo-urls.mjs`).
- **Final Express error handler** swallows stack traces; returns generic `Internal server error.` to the client.
- **Stability AI errors are surfaced** to the client with an `upstreamStatus` code so 401/402/403/429 are diagnosable in 5 seconds (see `dalleRoutes.js`).
- **GET `/api/v1/post` is paginated** — default 50 newest, `?limit=N&skip=N`, hard cap 100. `createdAt` is indexed.

## Don't do this

- Don't raise the rate limits without a discussion — they're sized against Stability AI cost. 5 generations / hour / IP is the kind of limit that lets a sceptical visitor try the site without becoming a billing event.
- Don't loosen CORS to `*`. The deployed surface is small on purpose.
- Don't store user-supplied HTML or render it unescaped anywhere. React's JSX handles XSS for text nodes, but if anything ever does `dangerouslySetInnerHTML` with `prompt` or `name`, that's a regression.
- Don't add the body-size limit back to 50MB. Anything that needs bigger files belongs on its own endpoint with its own limits.
- Don't reintroduce a `users` collection without a clear product reason. Open + rate-limited is the model.

## Free-port + URL banner (workspace convention)

Per ClaudeBuilt convention, `npm run dev` in `client/`:
1. Frees port 3900 via `../../scripts/free-port.mjs` (SIGTERM → SIGKILL after 300ms).
2. Prints the dev-URL banner via `scripts/print-dev-urls.mjs`.
3. Hands off to `vite --port 3900`.

The server in `server/` runs its own `npm run dev` (nodemon) on port 8081 — no port-freeing wired up there yet because nothing else in the workspace squats on 8081.

## Env vars

**Server** (`server/.env`):
- `MONGODB_URL` — MongoDB Atlas connection string
- `STABILITY_API_KEY` — Stability AI bearer token
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `EXTRA_ALLOWED_ORIGIN` (optional) — escape hatch for Vercel preview deploys
- `PORT` (optional) — defaults to 8081

**Client** (`client/.env`):
- `VITE_VERCEL_DOMAIN` — backend URL (production: `https://mern-ai-image-generator-backend.vercel.app`; local dev: `http://localhost:8081`)

## One-off scripts

- `server/scripts/backfill-https-photo-urls.mjs` — rewrites legacy `http://res.cloudinary.com/...` photo URLs to `https://`. Run once after deploy. Idempotent.

## Pre-production gotchas

The `users` collection in MongoDB Atlas is now **orphaned** — the auth scaffolding that wrote to it has been deleted, but the collection itself still holds any rows that were created. **Drop it manually from the Atlas dashboard** to remove the orphaned data + reduce future GDPR/CCPA scope. (Optional but recommended.)

The original 2023-era MERN scaffold left some transitive dep CVEs (`mongoose 6.x`, etc.). `bcryptjs`, `jsonwebtoken`, `express-async-handler`, and `openai` were removed in the 2026-06-08 cleanup. A full `npm update` pass on the remaining surface is still pending before any production traffic increase.
