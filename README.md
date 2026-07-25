# GT Table Tennis Association Website

Modern web application for GTTTA built with Next.js 16, TypeScript, Tailwind CSS, Prisma 7 (Postgres), and NextAuth.

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 App Router + TypeScript + Tailwind CSS |
| Database | PostgreSQL (Neon or Supabase in prod) |
| ORM | Prisma 7 + `@prisma/adapter-pg` |
| Auth | NextAuth v5 (Google OAuth, single-account restriction) |
| Photos | Vercel Blob |
| Deploy | Vercel |

## Setup (Local Dev)

**Prerequisites:** Node 20+, a running PostgreSQL instance.

```bash
git clone <repo>
cd gttta-website
npm install

cp .env.example .env.local
# Fill in DATABASE_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, ADMIN_EMAIL

npx prisma generate
npx prisma migrate dev
npm run dev
```

Open http://localhost:3000. Admin is at http://localhost:3000/admin.

## Environment Variables

See `.env.example`. Key ones:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console OAuth 2.0 |
| `GOOGLE_CLIENT_SECRET` | Same |
| `ADMIN_EMAIL` | The club Google account email — only this can log into /admin |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token — required for photo uploads |

## Deployment (Vercel)

```bash
vercel --prod
```

Add all env vars in the Vercel dashboard. Add `https://your-domain.vercel.app/api/auth/callback/google` to Google OAuth redirect URIs.

## Database Migrations

```bash
npx prisma migrate dev --name describe-change   # local
npx prisma migrate deploy                        # production (in CI/CD)
```

## Tests

```bash
npm test
```

Covers the USATT rating engine in `src/lib/__tests__/usatt-rating.test.ts`.

## Project Structure

```
src/
  app/
    (public)/     public pages (home, rankings, results, gallery, news, etc.)
    admin/        admin dashboard (requires Google login)
    api/          CSV exports, photo upload, NextAuth
    actions/      server actions (league night save + rating update)
  components/
    ui/           Nav, Footer
    admin/        LeagueEntryForm, BracketGenerator, PhotoUploader
  lib/
    db.ts         Prisma singleton
    auth.ts       NextAuth config
    usatt-rating.ts  rating calculation engine
    bracket.ts    bracket generation
```

For importing historical data from Google Sheets, see `WEBMASTER_GUIDE.md`.
