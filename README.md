# Zoom In On Recovery (ZIOR)

A content-managed website for the Zoom In On Recovery meeting. All pages are
public to read; any **verified user** can edit page text, manage slideshows, and
replace the meeting scripts. The public can download the slide decks (as PDFs)
and the scripts.

## Stack

- **Client:** Vite + React + TypeScript + Tailwind CSS v4 + shadcn/ui (Radix
  primitives, vendored in `src/components/ui`). Rich-text editing with Tiptap.
- **Server:** Express + better-sqlite3 (single-file database). Passwordless
  **magic-link** auth (no OAuth), email via Resend. PDF generation with pdf-lib.
- **No ORM, no Redux, no Webpack, no Moment** — minimal dependencies.

## Getting started

```bash
npm install
cp .env.example .env      # then edit values
npm run dev               # client on :5173, API on :1953 (client proxies to it)
```

Open http://localhost:5173.

### First sign-in

1. Set `ADMIN_EMAIL` in `.env`. On first run that address is seeded as an admin.
2. Go to **Sign in**, enter that email.
3. With no `RESEND_API_KEY` set, the magic link is **printed to the server
   console** — open it to sign in. (Set `RESEND_API_KEY` to send real emails.)

## Environment variables

See `.env.example`. Key ones:

| Variable         | Purpose                                                        |
| ---------------- | ------------------------------------------------------------- |
| `ADMIN_EMAIL`    | Seeded as the initial admin on first run.                     |
| `SESSION_SECRET` | Signs session/login tokens. **Required** in production.       |
| `APP_URL`        | Base URL used to build magic-link URLs (must match the browser). |
| `RESEND_API_KEY` | Resend key. If unset, magic links are logged to the console.  |
| `FROM_EMAIL`     | From address for magic-link emails.                           |

## Content model

The SQLite database (`data/zior.db`, created and seeded automatically) holds:

- **pages** — rich-text pages (Home, About, For the Newcomer, Helpful Links,
  Service at ZIOR, 7th Tradition).
- **decks / slides** — the Daily and Anniversary slideshows (images).
- **scripts** — the Daily and Anniversary script PDFs.
- **settings** — Zoom link, meeting time/timezone, calendar embed, QR image.
- **users / sessions / login_tokens** — auth.

Uploaded images/PDFs live in `data/uploads/`. The `data/` directory is
git-ignored; it is seeded from `seed-assets/` on first run.

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

In production the server terminates **HTTPS** using the certificate and key in
`./secrets` (`www_zoominonrecovery_org.pem` / `.key`). If those files are
absent it falls back to plain HTTP (put it behind a TLS-terminating proxy).
Set `SESSION_SECRET`, `APP_URL` (your public https URL), `ADMIN_EMAIL`, and the
Resend variables in the environment.

## Scripts

| Command             | Description                                    |
| ------------------- | ---------------------------------------------- |
| `npm run dev`       | Run client + API with hot reload.              |
| `npm run build`     | Type-check and build the SPA.                  |
| `npm start`         | Run the production server.                     |
| `npm run typecheck` | Type-check client and server.                  |
| `npm run seed:admin`| Promote a user to admin.                       |
