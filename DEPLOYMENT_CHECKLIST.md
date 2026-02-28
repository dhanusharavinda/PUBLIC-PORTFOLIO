# Buildfol.io Deployment Checklist

## Pre-Deployment Setup

### 1. Supabase Configuration

#### Create Supabase Project
- [ ] Go to [https://supabase.com](https://supabase.com) and create a new project
- [ ] Note down your Project URL and Anon Key (found in Project Settings > API)
- [ ] Note down your Service Role Key (for server-side operations)

#### Database Setup
- [ ] Open Supabase SQL Editor
- [ ] Run the schema from `supabase_schema.sql`:
  ```sql
  -- The schema includes:
  -- - portfolios table (with UNIQUE constraint on email)
  -- - projects table
  -- - experiences table
  -- - Indexes for performance
  -- - RLS policies
  -- - Storage policies
  ```

#### Storage Buckets Setup
Create these buckets in Supabase Dashboard (Storage section):
- [ ] `profile-photos` - Set to **public**
- [ ] `project-images` - Set to **public**
- [ ] `resumes` - Keep **private** (requires signed URLs)

#### Authentication Setup
- [ ] Enable Email provider (in Auth > Providers)
- [ ] Enable Google OAuth (optional, requires Google Cloud Console setup):
  - [ ] Create OAuth 2.0 credentials in Google Cloud Console
  - [ ] Add authorized redirect URI: `https://yourdomain.com/auth/callback`
  - [ ] Copy Client ID and Secret to Supabase

### 2. Environment Variables

Create a `.env.local` file in the `datafolio` directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# App
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

**Security Notes:**
- `SUPABASE_SERVICE_ROLE_KEY` should NEVER be exposed to the client
- `NEXT_PUBLIC_BASE_URL` should be your production domain

### 3. Build Configuration

#### next.config.ts
The current config already has:
- Turbopack enabled
- Image optimization settings for Supabase storage
- Remote patterns configured

**For static export (optional):**
If you want to export as static HTML (for hosting without Node.js):
```typescript
const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'dist',
  images: {
    unoptimized: true,
  },
};
```

### 4. Pre-Build Checks

Run these commands before deploying:

```bash
# Install dependencies
cd datafolio
npm install

# Run linting
npm run lint

# Build locally to test
npm run build

# Test locally (if build succeeds)
npm run dev
```

### 5. Hosting Platform Options

#### Option A: Vercel (Recommended for Next.js)
- [ ] Create account at [https://vercel.com](https://vercel.com)
- [ ] Import your GitHub repository
- [ ] Set environment variables in Project Settings
- [ ] Deploy

#### Option B: Netlify
- [ ] Create account at [https://netlify.com](https://netlify.com)
- [ ] Connect your repository
- [ ] Set build command: `npm run build`
- [ ] Set publish directory: `.next`
- [ ] Add environment variables
- [ ] Deploy

#### Option C: Railway/Render (Full-stack hosting)
- [ ] Create account
- [ ] Deploy with Dockerfile or buildpack
- [ ] Set environment variables
- [ ] Deploy

### 6. Post-Deployment Verification

#### Basic Functionality
- [ ] Homepage loads correctly
- [ ] Can create a portfolio
- [ ] Portfolio page displays correctly (`/username`)
- [ ] Edit portfolio works
- [ ] Login/logout works
- [ ] Image uploads work

#### Data Integrity
- [ ] Verify one portfolio per email constraint works
- [ ] Check that existing portfolios display correctly
- [ ] Confirm images load from Supabase storage

#### Performance
- [ ] Pages load in < 3 seconds
- [ ] Images are optimized
- [ ] No console errors

### 7. Cleanup (Important!)

After deployment, you may want to clean up duplicate portfolios:

```sql
-- Find users with multiple portfolios
SELECT email, COUNT(*) as count
FROM portfolios
GROUP BY email
HAVING COUNT(*) > 1;

-- Keep only the most recent portfolio per email
DELETE FROM portfolios
WHERE id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at DESC) as rn
    FROM portfolios
  ) t
  WHERE t.rn > 1
);
```

### 8. Domain & SSL (Optional)

If using a custom domain:
- [ ] Configure DNS records (A/CNAME)
- [ ] Enable SSL/HTTPS
- [ ] Update `NEXT_PUBLIC_BASE_URL` to use custom domain
- [ ] Redeploy with updated env vars

### 9. Monitoring & Analytics (Optional)

- [ ] Add Google Analytics (add GA ID to env vars)
- [ ] Set up error monitoring (Sentry, LogRocket, etc.)
- [ ] Configure uptime monitoring

### 10. Backup Strategy

- [ ] Enable Supabase backups (automatic in paid tiers)
- [ ] Document restore process
- [ ] Test backup restoration

## Quick Start Commands

```bash
# Development
cd datafolio
npm install
npm run dev

# Production build
cd datafolio
npm install
npm run build
npm start

# Static export
cd datafolio
npm install
# Update next.config.ts to add: output: 'export'
npm run build
# Output will be in 'dist' folder
```

## Troubleshooting

### Common Issues

1. **Images not loading**: Check Supabase storage policies and CORS settings
2. **Auth not working**: Verify Supabase Auth providers are enabled
3. **Database errors**: Run schema.sql in Supabase SQL Editor
4. **Build fails**: Check Node.js version (should be 18+)

### Support Resources

- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs
- Deployment Guide: https://nextjs.org/docs/deployment

---

## Summary of Changes Made

### One Portfolio Per User Enforcement

1. **Database Schema** (`supabase_schema.sql`):
   - Added `UNIQUE` constraint on `email` column

2. **API Layer** (`app/api/portfolio/route.ts`):
   - Added check before portfolio creation
   - Returns 409 error if user already has a portfolio

3. **UI Changes** (`components/auth/AuthHeaderActions.tsx`):
   - Removed "Share" button from dropdown
   - Changed "My Portfolios" to "My Portfolio" (singular)
   - Removed "Create New Portfolio" option (users can only have one)
   - Simplified dropdown to show single portfolio actions
