# Snipp — URL Shortener

A modern, dark-mode-first URL shortener built with Next.js (App Router), TypeScript,
Tailwind CSS, shadcn/ui-style components, and Prisma + PostgreSQL.

## Features

- **Landing page & shortener** — paste a URL, get a short link instantly, with an
  optional custom alias, copy/QR/share actions, and client + server URL validation.
- **Redirect engine** — `app/[shortCode]/route.ts` resolves a short code and issues
  a fast HTTP 302 redirect; click counting and analytics logging happen in the
  background via `after()` so they never add latency. Invalid, disabled, or expired
  links render a styled 404.
- **Analytics dashboard** (`/dashboard`, auth-protected) — overview stats, a clicks
  -over-time chart, device breakdown, top referrers/geographies/browsers, and a
  searchable/sortable/paginated table of your links.
- **Auth** — NextAuth.js (Auth.js v5) with email/password (Credentials) and optional
  Google OAuth, backed by Prisma.
- **Security & polish** — rate limiting for anonymous link creation (Upstash Redis,
  with an in-memory fallback for local dev), reserved-alias protection, link
  expiration, SEO metadata + sitemap/robots, and Framer Motion micro-interactions.

## Project structure

```
app/
  page.tsx                  Landing page (shortener UI)
  layout.tsx                Root layout, theme + toaster
  not-found.tsx              Styled 404 (used by the redirect engine too)
  [shortCode]/route.ts       Redirect engine
  signin/, signup/           Auth pages
  dashboard/                 Protected analytics dashboard
  api/
    shorten/route.ts         Create a short link (rate-limited for anon users)
    links/route.ts           List/search/sort/paginate the user's links
    links/[id]/route.ts      Update (enable/disable) / delete a link
    analytics/route.ts       Aggregated stats for the dashboard
    auth/[...nextauth]/      NextAuth route handler
    register/route.ts        Credentials sign-up
components/
  ui/                        shadcn/ui-style primitives (button, card, dialog, ...)
  dashboard/                 Dashboard-specific components (charts, table, ...)
  shortener-form.tsx, result-card.tsx, qr-code-dialog.tsx, ...
lib/
  prisma.ts, validations.ts, shortcode.ts, ratelimit.ts, analytics.ts, utils.ts
prisma/
  schema.prisma              User/Account/Session (NextAuth) + Link + Analytics
auth.ts                      NextAuth configuration
proxy.ts                     Route protection for /dashboard (Next 16's
                              successor to middleware.ts)
```

## Getting started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

   At minimum, set `DATABASE_URL` (any PostgreSQL instance — Supabase, Neon,
   Railway, or local) and `AUTH_SECRET` (generate one with `npx auth secret`).
   Google OAuth and Upstash Redis are optional — the app degrades gracefully
   without them (email/password auth still works; rate limiting falls back to
   an in-memory limiter).

3. **Set up the database**

   ```bash
   npx prisma migrate dev --name init
   ```

4. **Run the dev server**

   ```bash
   npm run dev
   ```

   Visit http://localhost:3000.

## Notable implementation details

- **Next.js 16**: this project uses `proxy.ts` (not `middleware.ts` — deprecated
  in Next 16) to protect `/dashboard`, and route handlers use the Promise-based
  `params` convention (`{ params: Promise<{ shortCode: string }> }`).
- **Short codes** are generated with `nanoid` using an unambiguous alphabet (no
  `0/O/1/l/I`) so they're easy to read and type.
- **Analytics** are parsed from the request at redirect time (`ua-parser-js` for
  device/browser/OS, proxy geo headers for country/city when available — e.g.
  Vercel's `x-vercel-ip-country`) and written in the background via `next/server`'s
  `after()`, so the redirect response isn't delayed by the write.
- **Rate limiting** uses `@upstash/ratelimit` when `UPSTASH_REDIS_REST_URL` /
  `UPSTASH_REDIS_REST_TOKEN` are set, and falls back to an in-memory sliding
  window otherwise (fine for local dev / a single instance).

## Deploying

Any Next.js-compatible host works. Set the environment variables from
`.env.example` in your platform's dashboard, then run `npx prisma migrate deploy`
against your production database as part of your deploy step.
