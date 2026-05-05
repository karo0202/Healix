# MediReserve

Production-focused full-stack medical appointment booking platform built with Next.js + TypeScript, Prisma, PostgreSQL, NextAuth, Tailwind, and multilingual support (`en` + `ar`).

## Stack

- Next.js (App Router) + TypeScript
- PostgreSQL + Prisma ORM
- NextAuth (credentials + Prisma adapter)
- Tailwind CSS + reusable UI primitives
- i18n with `next-intl`
- PWA support (`manifest.webmanifest`)
- Integrations scaffolded: Stripe, Google Calendar, Resend (email), Twilio (SMS)

## Features Implemented

- Patient, doctor, and admin dashboards
- Authentication flows (register/login)
- Doctor search API with specialty/location/rating filters
- Appointment APIs: create, list, reschedule, status updates
- Dark mode support
- Mobile-first responsive layout
- Role-ready schema for appointment lifecycle, payments, reviews, notifications, chat

## Project Structure

- `src/app/[locale]/*`: localized frontend pages
- `src/app/api/*`: backend API routes
- `src/lib/*`: auth, database, integrations, utilities
- `prisma/schema.prisma`: database schema
- `messages/*.json`: translations

## Run Locally

1. Install dependencies:
   - `npm install`
2. Configure environment:
   - `cp .env.example .env` (or create `.env` on Windows)
3. Set up database and Prisma:
   - `npx prisma generate`
   - `npx prisma migrate dev --name init`
4. Start app:
   - `npm run dev`

## Deploy (Recommended)

### Live preview on Vercel (recommended)

1. **Database (hosted PostgreSQL)**  
   Create a database (e.g. [Supabase](https://supabase.com) → **Project Settings → Database** → copy the **URI** connection string, or use [Railway](https://railway.app)).  
   Use a connection string that allows access from the public internet (often **Transaction** pooler on Supabase for serverless).

2. **Connect Vercel to GitHub**  
   - Go to [https://vercel.com/new](https://vercel.com/new) and sign in with GitHub.  
   - **Import** your repository (e.g. [karo0202/Healix](https://github.com/karo0202/Healix)).  
   - **Root directory:** leave default (folder that contains `package.json`).  
   - **Framework Preset:** Next.js.

3. **Build settings (important)**  
   Under **Build & Development Settings**, set **Build Command** to:
   ```bash
   npx prisma migrate deploy && npm run build
   ```
   Leave **Install Command** as default (`npm install`).  
   `postinstall` already runs `prisma generate` so the Prisma client exists before `next build`.

4. **Environment variables**  
   In the project **Settings → Environment Variables**, add at least:

   | Name | Value | Notes |
   |------|--------|--------|
   | `DATABASE_URL` | `postgresql://...` | From Supabase/Railway; must work from Vercel’s servers |
   | `NEXTAUTH_SECRET` | long random string | e.g. `openssl rand -base64 32` |
   | `NEXTAUTH_URL` | `https://YOUR-PROJECT.vercel.app` | Optional on Vercel if unset: the app derives it from `VERCEL_URL` (works for Preview URLs too). Set explicitly if you use a **custom domain**. No trailing slash. |

   Add optional keys from `.env.example` (Stripe, Resend, etc.) when you use those features.  
   Apply variables to **Production** (and **Preview** if you want PR previews to work with the same DB).

5. **Deploy**  
   Click **Deploy**. When it finishes, open the **Visit** URL — that is your live preview.  
   Every **git push** redeploys; **pull requests** get a **Preview** URL if the Vercel GitHub integration is enabled (default).

6. **GitHub**  
   On the repo page you’ll see Vercel checks on commits/PRs with links to each deployment.

**Push to GitHub (first time):**

```bash
cd medireserve
git add .
git commit -m "Add MediReserve app"
git remote add origin https://github.com/<YOUR_USER>/<YOUR_REPO>.git
git push -u origin HEAD
```

### Database (Supabase or Railway)

1. Create a PostgreSQL instance.
2. Copy connection string into `DATABASE_URL`.
3. Run migrations from CI/CD or locally:
   - `npx prisma migrate deploy`

## Integrations

- **Stripe**: set `STRIPE_SECRET_KEY` and use `createPaymentIntent`.
- **Google Calendar**: set service account credentials to auto-create events.
- **Email/SMS reminders**: configure Resend + Twilio keys and trigger from appointment workflows.

## Security Checklist

- Use HTTPS in production.
- Keep JWT/NextAuth secrets long and rotated.
- Restrict admin APIs by role checks in route handlers.
- Store PHI minimally and audit access controls.
- Add encryption-at-rest and audit logs for HIPAA-style compliance posture.

### Preview inside GitHub only (Codespaces)

If you want a browser preview **without** Vercel: open the repo in **GitHub Codespaces**, run `npm install`, set `.env`, run `npx prisma migrate dev`, then `npm run dev` and use the forwarded port (usually **3000**). That URL is for your session, not a public marketing link.
