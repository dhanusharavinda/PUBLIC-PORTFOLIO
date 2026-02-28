# portlyfolio.site

`portlyfolio.site` is a portfolio builder where users can create and publish portfolio pages and browse other published portfolios in a public Explore directory.

## Core Features

- Multi-step portfolio creation flow (personal info, skills, projects, template)
- Public portfolio pages with three templates
- File upload support for profile photos, project images, and resumes
- Explore directory with search, skill filters, availability filter, sort, and pagination
- QR/link sharing and view tracking
- Responsive layouts across key pages and templates

## Tech Stack

- Next.js App Router + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (Postgres + Storage)
- Zod validation + react-hook-form

## Local Setup

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

Create `.env.local` in the `datafolio` folder:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3) Set up Supabase schema

Run `supabase_schema.sql` in your Supabase SQL editor, then create these Storage buckets:

- `profile-photos` (public)
- `project-images` (public)
- `resumes` (private or public based on your preference)

### 4) Start development server

```bash
npm run dev
```

Open `http://localhost:3000`.

## Production Deployment (buildfol.io)

### 1) Deploy to Vercel

1. Import the repository into Vercel.
2. Set **Root Directory** to `datafolio` if your repo has multiple folders.
3. Add environment variables from `.env.local`.
4. Set `NEXT_PUBLIC_BASE_URL=https://portlyfolio.site` for production.

### 2) Attach custom domain

In Vercel Project Settings:

1. Add domain `portlyfolio.site`
2. Add domain `www.portlyfolio.site`

Then configure DNS at your domain registrar:

- `@` A record -> `76.76.21.21`
- `www` CNAME -> `cname.vercel-dns.com`

Vercel will auto-provision SSL once DNS resolves.

### 3) Optional redirect behavior

- Set `www.portlyfolio.site` -> redirect to `portlyfolio.site` (or inverse) in Vercel domains panel.
- Keep one canonical domain for SEO consistency.

## Production Verification Checklist

- `POST /api/upload` returns JSON on both success and failure
- `POST /api/portfolio` creates a portfolio successfully
- Published profile page loads at `https://portlyfolio.site/<username>`
- Explore page lists public portfolios and filtering works
- Uploaded images render correctly from Supabase storage
- Metadata title/branding shows `portlyfolio.site`

## Notes

- If `npm install` fails in workspace root, run it in the `datafolio` directory.
- If dev server reports `.next/dev/lock`, stop older Node processes and restart `npm run dev`.
