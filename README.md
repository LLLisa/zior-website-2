# Zoom In On Recovery (ZIOR)

A content-managed website for the Zoom In On Recovery meeting. All pages are
public to read; any **verified user** can edit page text, manage slideshows, and
replace the meeting scripts. The public can download the slide decks (as PDFs)
and the scripts.

## Stack

- **Client:** Vite + React + TypeScript + Tailwind CSS v4 + shadcn/ui (Radix
  primitives, vendored in `src/components/ui`). Rich-text editing with Tiptap.
- **Server:** Express + Postgres (via `pg`, no ORM). Passwordless **magic-link**
  auth (no OAuth), email via Resend. PDF generation with pdf-lib. Uploaded
  images/PDFs are stored as binary in Postgres, so the app needs no writable
  filesystem (works on ephemeral hosts like Heroku).
- **No ORM, no Redux, no Webpack, no Moment** — minimal dependencies.

## Getting started

Requires a Postgres database. Point `DATABASE_URL` at it (see `.env`).

```bash
npm install
cp .env.example .env      # then edit values, incl. DATABASE_URL
npm run dev               # client on :5173, API on :1953 (client proxies to it)
```

Open http://localhost:5173. The schema is created and seeded automatically on
first start.

### First sign-in

1. Set `ADMIN_EMAIL` in `.env`. On first run that address is seeded as an admin.
2. Go to **Sign in**, enter that email.
3. With no `RESEND_API_KEY` set, the magic link is **printed to the server
   console** — open it to sign in. (Set `RESEND_API_KEY` to send real emails.)

## Environment variables

See `.env.example`. Key ones:

| Variable         | Purpose                                                        |
| ---------------- | ------------------------------------------------------------- |
| `DATABASE_URL`   | Postgres connection string (provided automatically on Heroku). |
| `ADMIN_EMAIL`    | Seeded as the initial admin on first run.                     |
| `SESSION_SECRET` | Signs session/login tokens. **Required** in production.       |
| `APP_URL`        | Base URL used to build magic-link URLs (must match the browser). |
| `RESEND_API_KEY` | Resend key. If unset, magic links are logged to the console.  |
| `FROM_EMAIL`     | From address for magic-link emails.                           |

Locally, values in the project `.env` take precedence over inherited shell
variables. There is no `.env` on Heroku, so its config vars are used there.

## Content model

Postgres tables (created and seeded automatically on first start):

- **pages** — rich-text pages (Home, About, For the Newcomer, Helpful Links,
  Service at ZIOR, 7th Tradition).
- **decks / slides** — the Daily and Anniversary slideshows (images).
- **scripts** — the Daily and Anniversary script PDFs.
- **settings** — Zoom link, meeting time/timezone, calendar embed, QR image.
- **files** — uploaded binaries (slide images, script PDFs, QR) stored as `bytea`.
- **users / sessions / login_tokens** — auth.

Binary content is seeded from `seed-assets/` into the `files` table on first run,
so no writable filesystem is required at runtime.

## Permissions

- **Everyone (public):** read all pages; download deck PDFs and script PDFs.
- **Any verified user:** edit page text, add/reorder/delete slides, replace
  script PDFs, edit site settings.
- **User management** (`/admin/users`, the only non-public page):
  - Admins manage all users (including other admins).
  - Non-admins manage only non-admin users and cannot grant admin.

To promote someone from the command line:

```bash
npm run seed:admin -- someone@example.com
```

## Production

```bash
npm run build     # type-checks and builds the SPA into dist/
npm start         # NODE_ENV=production; serves dist/ + API
```

Set `DATABASE_URL`, `SESSION_SECRET`, `APP_URL` (your public https URL),
`ADMIN_EMAIL`, and the Resend variables in the environment.

If TLS certificates exist in `./secrets` (`www_zoominonrecovery_org.pem` /
`.key`) and none are provided by the platform, the server terminates **HTTPS**
itself; otherwise it serves plain HTTP behind the platform's TLS.

### Heroku

The app is Heroku-ready: it uses `DATABASE_URL` from the Heroku Postgres add-on,
stores uploads in Postgres (no disk needed), reads `PORT` from the platform, and
lets Heroku terminate TLS. `heroku-postbuild` builds the SPA and the `Procfile`
runs the server.

```bash
heroku config:set \
  SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))") \
  APP_URL=https://www.zoominonrecovery.org \
  ADMIN_EMAIL=you@example.com \
  RESEND_API_KEY=... "FROM_EMAIL=ZIOR <login@zoominonrecovery.org>" \
  -a zoominonrecovery
git push heroku rework-modern-stack:main
```

## Scripts

| Command             | Description                                    |
| ------------------- | ---------------------------------------------- |
| `npm run dev`       | Run client + API with hot reload.              |
| `npm run build`     | Type-check and build the SPA.                  |
| `npm start`         | Run the production server.                     |
| `npm run typecheck` | Type-check client and server.                  |
| `npm run seed:admin`| Promote a user to admin.                       |
