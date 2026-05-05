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

### Live preview from GitHub (Vercel)

GitHub does not run your Next.js server as a free “site” on its own. To get a **public preview URL** that shows up on GitHub (and **per-PR preview links**):

1. Push this project to a GitHub repository (see below).
2. Sign in at [https://vercel.com](https://vercel.com) → **Add New…** → **Project** → **Import** your repo.
3. **Framework Preset:** Next.js (default). **Root directory:** repository root (or the folder that contains `package.json`).
4. In Vercel **Environment Variables**, copy everything you use locally from `.env.example` (at minimum `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`).
5. Deploy. Vercel will assign a URL like `https://your-project.vercel.app`.
6. Optional: on GitHub → repo **Settings** → **Environments** / rely on Vercel’s GitHub app — **pull requests** will get **Preview deployments**; links appear in the PR checks/comments.

**Push to GitHub (first time):**

```bash
cd medireserve
git add .
git commit -m "Add MediReserve app"
# Create an empty repo on GitHub (no README), then:
git remote add origin https://github.com/<YOUR_USER>/<YOUR_REPO>.git
git push -u origin HEAD
```

Set **`NEXTAUTH_URL`** in Vercel to your production URL (e.g. `https://your-project.vercel.app`).

### Frontend (Vercel) — checklist

1. Import the Git repository into Vercel.
2. Add all environment variables from `.env.example`.
3. Deploy with default Next.js settings.

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
