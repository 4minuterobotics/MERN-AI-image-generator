# CLAUDE.md — Drew-It (MERN-AI-image-generator)

**Dev port:** 3900 (client) · 8081 (server)

A MERN-stack AI image generator. Live at https://drew-it.vercel.app, backend at https://mern-ai-image-generator-backend.vercel.app. Built in memory of Will's brother Drew.

Stack:
- **Client** — Vite + React 18 + Tailwind + React Router + react-bootstrap + framer-motion. Port 3900.
- **Server** — Express + Mongoose + Stability AI (SD3) + Cloudinary. Port 8081.
- **DB** — MongoDB Atlas.
- **Image gen** — Stability AI SD3 (despite the repo name being "DALL-E"; switched providers at some point).
- **Image storage** — Cloudinary (with a `drew-it-optimization` named transformation).
- **Hosting** — Vercel for both client and server.

## Public, no-login model (since 2026-06-07)

This site is intentionally **open** — no signup, no signin, no per-user tracking. Anyone can generate and share to the community gallery. Will removed the login gate on 2026-06-07 to make the site usable as a portfolio piece without account friction.

The security model that replaces login is **server-side rate limiting + input validation + CORS lockdown**:

- **Stability AI generation** — 5 / hour / IP via `express-rate-limit` (`generateLimiter` in `server/middleware/security.js`). This is the hot endpoint to protect — each SD3 call costs real money.
- **Community post** — 10 / hour / IP via `postLimiter`.
- **Global** — 200 / 15 min / IP via `globalLimiter`.
- **Input validation** — prompt 1-500 chars, name 1-100 chars, photo must start with `data:image/`, photo size capped at ~11MB (vs. 12MB body limit).
- **MongoDB operator sanitize** — `sanitizeMongoMiddleware` strips `$`-keys and dotted keys from req body/params/query, so injected `{ $where: '…' }` payloads can't smuggle operators into Mongoose queries.
- **CORS allowlist** — only `https://drew-it.vercel.app`, `http://localhost:5173`, `http://localhost:3900`, plus `EXTRA_ALLOWED_ORIGIN` env escape hatch. Everything else gets `Not allowed by CORS`.
- **Helmet** for default security headers (HSTS, X-Frame-Options, etc.).
- **trust proxy = 1** so express-rate-limit sees the real client IP behind Vercel.
- **Body limit** lowered to 12MB (was 50MB).

The auth scaffolding (`SignIn.jsx`, `SignUp.jsx`, `AppState.jsx`, `userRoutes.js`, `models/user.js`, `utils.js`) is **kept in place but unwired from the UI** — if Will wants to add an admin login later (moderate the gallery, ban users, etc.) the pieces are already there.

## Don't do this

- Don't raise the rate limits without a discussion — they're sized against Stability AI cost. 5 generations / hour / IP is the kind of limit that lets a sceptical visitor try the site without becoming a billing event.
- Don't loosen CORS to `*`. The deployed surface is small on purpose.
- Don't store user-supplied HTML or render it unescaped anywhere. React's JSX handles XSS for text nodes, but if anything ever does `dangerouslySetInnerHTML` with `prompt` or `name`, that's a regression.
- Don't add the body-size limit back to 50MB. Anything that needs bigger files belongs on its own endpoint with its own limits.

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
- `JWT_SECRET` — still used by `utils.js::generateLogToken` (only fires if auth scaffolding is rewired)
- `EXTRA_ALLOWED_ORIGIN` (optional) — escape hatch for Vercel preview deploys
- `PORT` (optional) — defaults to 8081

**Client** (`client/.env`):
- `VITE_VERCEL_DOMAIN` — backend URL (production: `https://mern-ai-image-generator-backend.vercel.app`; local dev: `http://localhost:8081`)

## Pre-production gotchas

The current Cloudinary URL is **hardcoded to `res.cloudinary.com/doj10wtzk/...`** in `postRoutes.js`. If the Cloudinary cloud name ever changes, that line needs updating.

The 46 npm-audit findings in `server/` are mostly transitive deps in the original 2023-era MERN scaffold (mongoose 6.x, openai 3.x). Most are low-impact for this surface but a `npm update` pass before any production traffic increase is overdue.
